import React, { useEffect, useState, useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, CartesianGrid, XAxis, YAxis, Area, AreaChart } from 'recharts';
import { Star, GitFork, Eye, Search, TrendingUp, Code } from 'lucide-react';
import api from '../../services/api';
import * as S from './styles';

interface RepoData {
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  owner: { login: string };
}

interface SearchResponse {
  items: RepoData[]
}

interface LanguageData {
  name: string;
  value: number;
  percentage: number;
  [key: string]: string | number;
}

interface CommitWeek {
  week: number;
  total: number;
  days: number[];
}

interface CommitData {
  week: string;
  commits: number;
}

// Função para gerar cores aleatórias
const generateRandomColors = (count: number): string[] => {
  const colors: string[] = [];
  const hueStep = 360 / count;

  for (let i = 0; i < count; i++) {
    const hue = Math.floor((i * hueStep + Math.random() * 30) % 360);
    const saturation = 65 + Math.floor(Math.random() * 20);
    const lightness = 50 + Math.floor(Math.random() * 15);

    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }

  return colors.sort(() => Math.random() - 0.5); // Embaralha as cores
};

export default function GitHubDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [languages, setLanguages] = useState<LanguageData[]>([]);
  const [commits, setCommits] = useState<CommitData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isMostPopular, setIsMostPopular] = useState(false);

  const chartColors = useMemo(() => {
    return generateRandomColors(Math.max(languages.length, 10));
  }, [languages.length]); // Gera cores aleatórias sempre que as linguagens mudam

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }; // Transforma números grandes em formato de K e M

  const processLanguages = (langData: Record<string, number> | null): LanguageData[] => {
    if (!langData || Object.keys(langData).length === 0) {
      return [{ name: 'N/A', value: 1, percentage: 100 }];
    }
    const entries = Object.entries(langData);
    const total = entries.reduce((acc, [, val]) => acc + (val as number), 0) || 1;
    return entries
      .map(([name, value]) => ({ name, value, percentage: (value / total) * 100 }))
      .sort((a, b) => b.value - a.value);
  }; // Ordena e calcula porcentagens das linguagens

  const processCommits = (commitData: CommitWeek[]): CommitData[] => {
    if (!Array.isArray(commitData) || commitData.length === 0) {
      return [
        { week: 'Semana -3', commits: 0 },
        { week: 'Semana -2', commits: 0 },
        { week: 'Semana -1', commits: 0 },
        { week: 'Semana atual', commits: 0 },
      ];
    }
    const last = commitData.slice(-4);
    return last.map((w) => {
      const d = typeof w.week === 'number' ? new Date(w.week * 1000) : new Date();
      const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      return { week: label, commits: w.total ?? 0 };
    });
  }; // Formata dados de commits para o gráfico

  const fetchRepoData = async (query: string) => {
    try {
      setLoading(true);
      setError(null);

      const isInitialMostPopular = query === 'stars:>0';
      setIsMostPopular(isInitialMostPopular);

      // Envia query que usuário digitou para o backend
      const searchRes = await api.get('/github/search', {
        params: { q: query, per_page: 1 }
      });

      const searchData = searchRes.data as SearchResponse;

      if (!searchData.items || searchData.items.length === 0) {
        throw new Error('Nenhum repositório encontrado');
      }

      const repo = searchData.items[0];
      const owner = repo.owner.login;
      const name = repo.name;

      setRepoData(repo);

      const [langsRes, commitsRes] = await Promise.all([
        api.get('/github/languages', { params: { owner, repo: name } }),
        api.get('/github/commit_activity', { params: { owner, repo: name } }),
      ]);

      setLanguages(processLanguages(langsRes.data as Record<string, number>));
      setCommits(processCommits(commitsRes.data as CommitWeek[]));
    } catch (err: any) {
      console.error('Erro ao buscar dados:', err);
      const errorMsg = err?.response?.data?.detail || err?.message || 'Erro ao carregar dados do repositório';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timeoutId: number;
    timeoutId = window.setTimeout(() => {
      setLoading(false);
      setError("A requisição demorou mais de 15 segundos e foi cancelada.");
    }, 15000);

    fetchRepoData('stars:>0') // Inicializa com o repositório mais estrelado
      .finally(() => {
        clearTimeout(timeoutId);
      });

    return () => clearTimeout(timeoutId);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    fetchRepoData(q);
  };

  const renderCustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null;
    const p = payload[0];
    const pct = Number(p?.payload?.percentage ?? 0);
    return (
      <div style={{ background: 'white', padding: 8, borderRadius: 8, border: '1px solid #e6edf3', boxShadow: '0 6px 20px rgba(14,22,33,0.08)' }}>
        <div style={{ fontWeight: 700 }}>{p.name}</div>
        <div style={{ fontSize: 13, color: '#475569' }}>{Number(p.value).toLocaleString()} bytes — {pct.toFixed(1)}%</div>
      </div>
    );
  }; // Hover para o gráfico de linguagens

  if (loading) {
    return (
      <S.Page>
        <S.Container>
          <S.LoaderWrap>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              border: '6px solid #e2e8f0',
              borderTop: '6px solid #3b82f6',
              animation: 'spin 1s linear infinite',
              marginBottom: 20
            }} />
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
            <div style={{
              color: '#64748b',
              fontSize: '1.1rem',
              fontWeight: 600,
              letterSpacing: '-0.01em'
            }}>
              Carregando dados do repositório...
            </div>
          </S.LoaderWrap>
        </S.Container>
      </S.Page> // Loading
    );
  }

  if (error) {
    return (
      <S.Page>
        <S.Container>
          <S.ErrorWrap>
            <div>
              <div className="errorBox"><strong>Erro:</strong> {error}</div>
            </div>
          </S.ErrorWrap>
        </S.Container>
      </S.Page> // Tela de erro
    );
  }

  if (!repoData) return null;

  const totalBytes = languages.reduce((acc, l) => acc + Number(l.value), 0);

  return ( // Página principal
    <S.Page>
      <S.Container>
        <S.Header>
          <S.HeaderTitle>
            <S.HideTrendingMobile>
              <TrendingUp size={32} />
            </S.HideTrendingMobile>
            Dashboard do GitHub
          </S.HeaderTitle>
          <p>Simples site com métricas e estatísticas de repositórios do GitHub de acordo com a popularidade (mais stars) e os termos pesquisados.
          </p>
        </S.Header>

        <S.Panel style={{ marginBottom: 16 }}>
          <S.SearchForm onSubmit={handleSearch}>
            <S.SearchInput
              type="text"
              placeholder="Buscar repositório (ex: react, facebook/react, typescript...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <S.SearchButton type="submit">
              <Search size={16} /> Buscar
            </S.SearchButton>
          </S.SearchForm>
        </S.Panel>

        <h2 style={{
          fontSize: "1.3rem",
          fontWeight: 600,
          color: "#858585",
          margin: "1.5rem 0 0.75rem"
        }}>
          Repositório Atual:
        </h2>
        <S.Panel style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 250 }}>
              <S.RepoTitle>{repoData.full_name}</S.RepoTitle>
              <S.RepoDescription>{repoData.description}</S.RepoDescription>
              <S.RepoLink href={repoData.html_url} target="_blank" rel="noopener noreferrer">Ver no GitHub →</S.RepoLink>
            </div>

            {isMostPopular && (
              <S.PopularBadge>
                <S.PopularIconWrap>
                  <Star size={18} style={{ color: '#fff', fill: '#fff' }} />
                </S.PopularIconWrap>

                <div>
                  <S.PopularLabelSmall>Repositório</S.PopularLabelSmall>
                  <S.PopularLabelBig>Mais Popular</S.PopularLabelBig>
                </div>
              </S.PopularBadge>
            )}

          </div>
        </S.Panel>

        <h2 style={{
          fontSize: "1.3rem",
          fontWeight: 600,
          color: "#858585",
          margin: "1.5rem 0 0.75rem"
        }}>
          Métricas:
        </h2>
        <S.MetricsGrid>
          <S.MetricCard>
            <S.MetricHeader>
              <h3>Stars</h3>
              <S.SmallIconWrap $bg={'rgba(245, 158, 11, 0.12)'}><Star size={16} style={{ color: '#f59e0b' }} /></S.SmallIconWrap>
            </S.MetricHeader>
            <S.MetricValue>{formatNumber(repoData.stargazers_count)}</S.MetricValue>
          </S.MetricCard>

          <S.MetricCard>
            <S.MetricHeader>
              <h3>Forks</h3>
              <S.SmallIconWrap $bg={'rgba(59, 130, 246, 0.12)'}><GitFork size={16} style={{ color: '#3b82f6' }} /></S.SmallIconWrap>
            </S.MetricHeader>
            <S.MetricValue>{formatNumber(repoData.forks_count)}</S.MetricValue>
          </S.MetricCard>

          <S.MetricCard>
            <S.MetricHeader>
              <h3>Watchers</h3>
              <S.SmallIconWrap $bg={'rgba(16, 185, 129, 0.12)'}><Eye size={16} style={{ color: '#10b981' }} /></S.SmallIconWrap>
            </S.MetricHeader>
            <S.MetricValue>{formatNumber((repoData as any).subscribers_count ?? repoData.watchers_count)}</S.MetricValue>
          </S.MetricCard>
        </S.MetricsGrid>

        <S.ChartsGrid>
          <S.ChartPanel>
            <h3><TrendingUp size={18} /> Commits nas Últimas 4 Semanas</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={commits} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="week"
                  stroke="#64748b"
                  fontSize={13}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={13}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255, 255, 255, 0.98)',
                    border: '1px solid #e6edf3',
                    borderRadius: 10,
                    boxShadow: '0 6px 20px rgba(14,22,33,0.1)',
                    padding: '10px 14px',
                    fontSize: 13
                  }}
                  labelStyle={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}
                />
                <Area
                  type="monotone"
                  dataKey="commits"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#colorCommits)"
                  dot={{ r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7, fill: '#3b82f6', strokeWidth: 3, stroke: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </S.ChartPanel>

          <S.ChartPanel>
            <h3><Code size={18} /> Linguagens do Repositório</h3>
            <S.ChartContainer>
              <S.ChartWrapper>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={languages}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={2}
                      labelLine={false}
                      onMouseEnter={(_: any, index: number) => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(null)}
                    >
                      {languages.map((entry, index) => {
                        const isActive = activeIndex === index;
                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={chartColors[index % chartColors.length]}
                            stroke={isActive ? '#0f172a' : 'transparent'}
                            strokeWidth={isActive ? 2 : 0}
                            style={{ cursor: 'pointer', transition: 'transform 120ms' }}
                          />
                        );
                      })}
                    </Pie>
                    <Tooltip content={renderCustomTooltip} />
                  </PieChart>
                </ResponsiveContainer>

                <S.DonutCenter>
                  {activeIndex !== null && languages[activeIndex] ? (
                    <>
                      <div className="big">{languages[activeIndex].percentage.toFixed(1)}%</div>
                      <div className="small">{languages[activeIndex].name}</div>
                    </>
                  ) : (
                    <>
                      <div className="big">{totalBytes.toLocaleString()}</div>
                      <div className="small">total bytes</div>
                    </>
                  )}
                </S.DonutCenter>
              </S.ChartWrapper>

              <S.LegendWrapper>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#0f172a' }}>Linguagens</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 230, overflowY: 'auto', paddingRight: 4 }}>
                  {languages.map((l, i) => {
                    const isActive = activeIndex === i;
                    return (
                      <div
                        key={l.name}
                        onMouseEnter={() => setActiveIndex(i)}
                        onMouseLeave={() => setActiveIndex(null)}
                        onClick={() => setActiveIndex(isActive ? null : i)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          cursor: 'pointer',
                          padding: '4px 6px',
                          borderRadius: 6,
                          background: isActive ? 'rgba(14,22,33,0.03)' : 'transparent',
                        }}
                      >
                        <span style={{ width: 12, height: 12, borderRadius: 4, background: chartColors[i % chartColors.length], display: 'inline-block' }} />
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', flex: 1 }}>{l.name}</div>
                        <div style={{ fontSize: 12, color: '#475569', fontWeight: 700 }}>{l.percentage.toFixed(1)}%</div>
                      </div>
                    );
                  })}
                </div>
              </S.LegendWrapper>
            </S.ChartContainer>
          </S.ChartPanel>
        </S.ChartsGrid>
        <S.FooterDivider />

        <S.Footer>
          <S.FooterInner>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ fontSize: 14, color: '#0f172a', fontWeight: 700 }}>
                Feito por João Victor Borges
              </div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>
                Obrigado por usar o Dashboard!
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <S.SocialLabel>Redes Sociais:</S.SocialLabel>
              <S.IdeasList>
                <li>
                  <a href="https://github.com/borges-1802" target="_blank" rel="noopener noreferrer">
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="https://www.linkedin.com/in/jo%C3%A3o-victor-borges-453020272/" target="_blank" rel="noopener noreferrer">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="http://lattes.cnpq.br/1656015756108559" target="_blank" rel="noopener noreferrer">
                    Lattes
                  </a>
                </li>
                <li>
                  <a href="mailto:joaovbn@dcc.ufrj.br">
                    Email
                  </a>
                </li>
              </S.IdeasList>
            </div>
          </S.FooterInner>
        </S.Footer>
      </S.Container>
    </S.Page>
  );
}