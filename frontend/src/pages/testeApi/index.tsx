import React, { useEffect, useState } from "react";
import api from "../../services/api";
import * as S from "./styles";

export default function TesteApi() {
  const [dados, setDados] = useState<any>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testar = async () => {
      try {
        setLoading(true);
        setErro(null);
        const resultados: any = {};

        const resRoot = await api.get("/");
        resultados.root = resRoot.data;

        const resSearch = await api.get("/github/search", {
          params: { q: "react", per_page: 1 }
        });
        resultados.search = resSearch.data;

        const repo = resSearch.data.items?.[0];
        if (!repo) throw new Error("Nenhum repo encontrado na busca");

        const owner = repo.owner.login;
        const name = repo.name;

        const [resRepo, resLangs, resCommits] = await Promise.all([
          api.get("/github/repo", { params: { owner, repo: name } }),
          api.get("/github/languages", { params: { owner, repo: name } }),
          api.get("/github/commit_activity", { params: { owner, repo: name } })
        ]);

        resultados.repo = resRepo.data;
        resultados.languages = resLangs.data;
        resultados.commit_activity = resCommits.data;

        setDados(resultados);
      } catch (err: any) {
        console.error("Erro ao testar API:", err);
        const msg =
          err?.response?.data ||
          err?.response?.statusText ||
          err?.message ||
          JSON.stringify(err);
        setErro(String(msg));
      } finally {
        setLoading(false);
      }
    };

    testar();
  }, []);

  return (
    <S.Page>
      <S.Title>Testando a API do GitHub</S.Title>

      {loading && <S.Loading>Carregando...</S.Loading>}
      {erro && <S.ErrorMsg>Erro: {erro}</S.ErrorMsg>}

      <S.ResponseBox>
        {dados ? JSON.stringify(dados, null, 2) : (!loading && !erro ? "Nenhum dado" : "")}
      </S.ResponseBox>
    </S.Page>
  );
}