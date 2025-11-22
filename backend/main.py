import os
import time
import asyncio
import json
from typing import Any, Dict, Optional
import httpx
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv()


app = FastAPI(title="Dashboard com dados do GitHub", version="1.0.0")

app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

GITHUB_BASE = "https://api.github.com"
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
HTTP_TIMEOUT = float(os.getenv("HTTP_TIMEOUT", "20"))

_async_client: Optional[httpx.AsyncClient] = None
def get_client() -> httpx.AsyncClient:
    global _async_client
    if _async_client is None:
        _async_client = httpx.AsyncClient(timeout=HTTP_TIMEOUT)
    return _async_client

CACHE: Dict[str, Dict[str, Any]] = {}
CACHE_TTL = int(os.getenv("CACHE_TTL_SECONDS", "60"))

def cache_get(key: str):
    entry = CACHE.get(key)
    if not entry:
        return None
    if time.time() - entry["ts"] > CACHE_TTL:
        del CACHE[key]
        return None
    return entry["data"]

def cache_set(key: str, data: Any):
    CACHE[key] = {"ts": time.time(), "data": data}

async def github_get(path: str, params: dict = None) -> httpx.Response:
    client = get_client()
    headers = {"Accept": "application/vnd.github.v3+json"}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"token {GITHUB_TOKEN}"
    url = f"{GITHUB_BASE}{path}"
    resp = await client.get(url, headers=headers, params=params)
    return resp

@app.get("/")
def root():
    return {"message": "Bem-vindo ao backend do Dashboard com dados do GitHub."}

@app.get("/github/search")
async def github_search(q: str = Query(..., description="Query string para search/repositories"),
                        per_page: int = Query(1, ge=1, le=100)):

    cache_key = f"search:{q}:{per_page}"
    cached = cache_get(cache_key)
    if cached:
        return cached

    resp = await github_get("/search/repositories", params={"q": q, "sort": "stars", "order": "desc", "per_page": per_page})
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    data = resp.json()
    cache_set(cache_key, data)
    return data

@app.get("/github/repo")
async def github_repo(owner: str = Query(...), repo: str = Query(...)):
    cache_key = f"repo:{owner}/{repo}"
    cached = cache_get(cache_key)
    if cached:
        return cached

    resp = await github_get(f"/repos/{owner}/{repo}")
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    data = resp.json()
    cache_set(cache_key, data)
    return data

@app.get("/github/languages")
async def github_languages(owner: str = Query(...), repo: str = Query(...)):
    cache_key = f"langs:{owner}/{repo}"
    cached = cache_get(cache_key)
    if cached:
        return cached

    resp = await github_get(f"/repos/{owner}/{repo}/languages")
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    data = resp.json()
    cache_set(cache_key, data)
    return data

@app.get("/github/commit_activity")
async def github_commit_activity(owner: str = Query(...), repo: str = Query(...), max_tries: int = Query(6, ge=1)):
    cache_key = f"commits:{owner}/{repo}"
    cached = cache_get(cache_key)
    if cached:
        return cached

    attempt = 0
    while attempt < max_tries:
        resp = await github_get(f"/repos/{owner}/{repo}/stats/commit_activity")
        if resp.status_code == 200:
            data = resp.json()
            cache_set(cache_key, data)
            return data
        elif resp.status_code == 202:
            backoff = 1 + attempt * 1.5
            await asyncio.sleep(backoff)
            attempt += 1
            continue
        else:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)

    raise HTTPException(status_code=503, detail="Commit stats não disponíveis no momento. Tente novamente mais tarde.")

@app.post("/admin/clear_cache")
def clear_cache(secret: Optional[str] = Query(None)):
    admin_secret = os.getenv("ADMIN_SECRET")
    if admin_secret and secret != admin_secret:
        raise HTTPException(status_code=403, detail="Secret inválido")
    CACHE.clear()
    return {"status": "ok", "message": "cache limpo"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True)
