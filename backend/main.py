import os
import time
import asyncio
import json
from typing import Any, Dict, Optional
import httpx
import logging
from fastapi.responses import JSONResponse
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

logger = logging.getLogger("uvicorn.error")

@app.get("/github/search")
async def github_search(
    q: str = Query(..., description="Query string para search/repositories"),
    per_page: int = Query(1, ge=1, le=100)
):
    """
    Busca repositórios no GitHub com estratégia de fallback inteligente.
    
    LÓGICA CORRIGIDA:
    1. Se for formato owner/repo exato -> usa repo:owner/repo
    2. Senão, tenta busca ampla primeiro (sem modificações)
    3. Se não achar nada, tenta com in:name,description
    """
    raw_q = (q or "").strip()
    if not raw_q:
        raise HTTPException(status_code=400, detail="Query vazia")

    if len(raw_q) > 300:
        raise HTTPException(status_code=400, detail="Query muito longa")

    async def call_search(gq: str):
        resp = await github_get(
            "/search/repositories",
            params={"q": gq, "sort": "stars", "order": "desc", "per_page": per_page}
        )
        if resp.status_code == 200:
            return resp.json(), resp
        return None, resp

    candidates = []

    # CORREÇÃO 1: Detecta formato owner/repo de forma mais precisa
    if "/" in raw_q and " " not in raw_q:
        parts = raw_q.split("/")
        if len(parts) == 2 and all(p.strip() for p in parts):
            owner, repo_name = parts[0].strip(), parts[1].strip()
            # Validação básica de caracteres permitidos
            if owner.replace("-", "").replace("_", "").replace(".", "").isalnum() and \
               repo_name.replace("-", "").replace("_", "").replace(".", "").isalnum():
                candidates.append((f"repo:{owner}/{repo_name}", "exact"))

    # CORREÇÃO 2: Estratégia de busca inteligente
    has_operators = any(op in raw_q for op in [":", ">", "<", "..", "in:", "user:", "org:", "repo:", "language:"])
    
    if not has_operators:
        # Para queries simples (sem operadores)
        # 1. Tenta busca exata no nome do repo primeiro
        candidates.append((f"{raw_q} in:name", "exact_name"))
        # 2. Busca ampla (deixa GitHub decidir relevância)
        candidates.append((raw_q, "broad"))
        # 3. Fallback: busca em nome e descrição
        candidates.append((f"{raw_q} in:name,description", "name_desc"))
    else:
        # Query com operadores: usa como está
        candidates.append((raw_q, "custom"))

    used_mode = None
    data = None
    resp_obj = None

    for candidate_query, mode in candidates:
        cache_key = f"search:{candidate_query}:{per_page}"
        cached = cache_get(cache_key)
        if cached:
            data = cached
            used_mode = mode
            logger.info(f"Cache hit para mode={mode} query={candidate_query}")
            break

        try:
            result_json, resp = await call_search(candidate_query)
        except Exception as exc:
            logger.exception(f"Erro ao chamar GitHub para query={candidate_query}")
            raise HTTPException(status_code=502, detail="Erro ao comunicar com GitHub") from exc

        if resp.status_code != 200:
            if resp.status_code in (403, 429):
                detail = "Rate limit do GitHub atingido. Configure um GITHUB_TOKEN no backend."
                logger.warning(f"Rate limit (status={resp.status_code}) para q={candidate_query}")
                raise HTTPException(status_code=resp.status_code, detail=detail)
            
            if resp.status_code == 422:
                logger.warning(f"Query inválida (422) para: {candidate_query}")
                # Tenta próximo candidato
                continue
            
            logger.debug(f"Status {resp.status_code} para {candidate_query}")
            continue

        if result_json and result_json.get("items") and len(result_json["items"]) > 0:
            data = result_json
            cache_set(cache_key, data)
            used_mode = mode
            resp_obj = resp
            # Log útil para debug
            top_repo = result_json["items"][0]
            logger.info(f"✓ Encontrado com mode={mode} query='{candidate_query}' -> {top_repo['full_name']} ({top_repo['stargazers_count']} stars)")
            break
        else:
            logger.debug(f"Sem resultados para mode={mode} query={candidate_query}")

    if not data:
        logger.info(f"Nenhum repositório encontrado para query={raw_q}")
        raise HTTPException(status_code=404, detail="Nenhum repositório encontrado para a sua busca")

    headers = {"X-Query-Mode": used_mode or "unknown"}
    return JSONResponse(content=data, headers=headers)

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

@app.get("/ping")
async def ping():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run( "main:app", host="0.0.0.0", port=port, reload=False
                if os.getenv("ENVIRONMENT") == "production"
                else True
                )