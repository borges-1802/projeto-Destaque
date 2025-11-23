#  Projeto do Dashboard de Popularidade de Repositórios do GitHub

<div align="center">

**Dashboard interativo para visualização de métricas e estatísticas de repositórios do GitHub**
</div>

---

## 🎯 Desafio Proposto

O protótipo foi proposto através do processo seletivo da **Destaque** com vagas para Desenvolvimento de Software, no qual foi proposto criar uma aplicação de dashboard de repositórios do GitHub utilizando React e TypeScript.

Foi necessario deve desenvolver uma página de dashboard que busque informações do repositório mais popular do GitHub de acordo com os termos pesquisados, no qual a popularidade é medida pelo número de stars.

O protótipo chama a API de busca do GitHub (Search API) para encontrar os dados dos repositórios mais populares.


## 🌐 Sites Hospedados 

### 

- **Frontend**: [https://projeto-destaque-frontend.vercel.app](https://projeto-destaque-frontend.vercel.app/)
- **Backend API**: [https://projeto-destaque-backend.onrender.com](https://projeto-destaque-backend.onrender.com)
- **Documentação API**: [https://projeto-destaque-backend.onrender.com/docs](https://projeto-destaque-backend.onrender.com/docs)

---

## ⌨️ Funcionalidades

### Busca de Repositórios

- Busca por **nome do repositório** (ex: `react`, `typescript`)
- Busca por **owner/repo** (ex: `facebook/react`)

### Métricas e Visualizações

-  **Stars**: Número de estrelas do repositório;
-  **Forks**: Quantidade de forks;
-  **Watchers**: Número de observadores;
-  **Commits**: Gráfico de área mostrando commits das últimas 4 semanas;
-  **Linguagens**: Gráfico de donut com:
    - Distribuição percentual de linguagens
    - Cores aleatórias únicas por repositório
    - Legenda interativa com hover effects
    - Centro dinâmico mostrando bytes totais ou linguagem selecionada

---

## 📱 Responsividade

O projeto possui um design responsivo completo.

### Gráficos

- Em telas ≥ 980px → gráficos lado a lado
- Em telas < 980px → gráficos empilhados verticalmente

### Gráfico de Linguagens

- Desktop → legenda ao lado direito
- Mobile → legenda abaixo do donut
(evita desaparecimento do gráfico por colapso de altura)

### Badge “Mais Popular”

- Desktop → tamanho natural, centralizado
- Mobile → ocupa 100% e centraliza conteúdo

---

## 🛠️ Tecnologias Utilizadas

### Frontend

| Tecnologia | Uso |
|------------|-----|
| **React** |  Biblioteca principal |
| **TypeScript**  | Tipagem estática |
| **Vite** |  Ferramenta de Build |
| **Styled-Components** | Estilização |
| **Recharts** | Biblioteca de gráficos |
| **Lucide React** | Biblioteca de ícones |
| **Axios** |  Cliente HTTP |
| **React Router**  | Roteamento |

### Backend

| Tecnologia | Uso |
|------------|-----|
| **FastAPI** | Framework |
| **Python** | Linguagem base |
| **Uvicorn** | Servidor ASGI |
| **httpx** | Cliente HTTP |
| **Python Dotenv** | Gerenciamento de variáveis de ambiente |

### Hospedagem e Deploy

- **Frontend Deploy**: [Vercel](https://vercel.com)
- **Backend Deploy**: [Render](https://render.com)
- **API**: [GitHub REST API v3](https://docs.github.com/en/rest)

---

## 🔧 Instalação e Uso Local

### Pré-requisitos

- Node.js 18+ e npm/yarn
- Python 3.11+ (backend)
- Git

### 1. Clonar o Repositório

```bash
git clone https://github.com/borges-1802/projeto-Destaque.git
```

### 2. Configurar Frontend

```bash
cd frontend

# Instalar dependências
npm install
# ou
yarn install

# Editar src/services/api.ts para
# baseURL = "http://localhost:8000"

# Iniciar aplicação
npm run dev
# ou
yarn dev
```

## 📁 Estrutura do Projeto

```
projeto-destaque/
├── backend/
│   ├── main.py                 # FastAPI
│   ├── requirements.txt        # Dependências Python
│   ├── .env                    # Variáveis de ambiente (criar)
│   ├── .gitignore
│   └── render.yaml             # Config do back-end no Render
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home/
│   │   │   │   └── index.tsx
│   │   │       └── styles.ts           # Styled-components
│   │   │   └── testeApi/               
│   │   │       └── index.tsx           # não funcional por conta do back
│   │   │       └── styles.ts           # Styled-components
│   │   ├── routes/
│   │   │   └── router.tsx              # Configuração de rotas
│   │   ├── services/
│   │   │   └── api.ts                  
│   │   └── styles.tsx                  # Estilos globais
│   │   └── main.tsx                    
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── index.html                      # Config do front-end
│
└── README.md
```

---

## 🔌 API Endpoints

### Limitações do Backend

O backend está hospedado no **Render** Free Tier, que entra em hibernação após ~50 segundos sem requisições.

Com isso, **a primeira requisição após 50s pode levar 20–40s**, mas depois disso elas ficam com respostas normais (100–300ms).

Você pode visualizar através do endpoint `/ping` criado para "acordar" o servidor em https://projeto-destaque-backend.onrender.com/ping.


### Base URL das Requisições
```
https://projeto-destaque-backend.onrender.com
```

### Endpoints Disponíveis


#### 1. Buscar Repositórios
```http
GET /github/search?q={query}&per_page=1
```

**Parâmetros**:
- `q` (required): Query de busca
- `per_page` (optional): Número de resultados (default: 10, usado internamente)

**Exemplo**:
```bash
curl "https://projeto-destaque-backend.onrender.com/github/search?q=react"
```


#### 2. Detalhes do Repositório
```http
GET /github/repo?owner={owner}&repo={repo}
```

#### 3. Linguagens do Repositório
```http
GET /github/languages?owner={owner}&repo={repo}
```

#### 4. Atividade de Commits
```http
GET /github/commit_activity?owner={owner}&repo={repo}
```

---

## 👨‍💻 Feito por:

**João Victor Borges**

- GitHub: [@borges-1802](https://github.com/borges-1802)
- Linkedin: [João Victor Borges](https://www.linkedin.com/in/joão-victor-borges-453020272/)
- Email: joaovbn@dcc.ufrj.br

---