# E-commerce — Frontend

Frontend Angular de um e-commerce simples (catálogo de produtos, carrinho
persistente, checkout mockado e painel admin), consumindo a API Spring Boot
em [`e-commerce-api`](../e-commerce-api). Veja `roadmap.md` na raiz do
projeto para o escopo completo e as decisões de arquitetura.

Stack: Angular 21 (standalone components, Signals, Reactive Forms), SCSS,
sem SSR (SPA client-side puro) e sem NgRx (estado gerenciado via Signals).

## Pré-requisitos

- Node.js 20+ e npm
- Docker (para o PostgreSQL da API)
- JDK 21+ e o wrapper Maven (`./mvnw`, já incluso na API)

## Rodando o projeto localmente (backend + banco + frontend)

### 1. Banco de dados (Postgres via Docker)

```bash
cd e-commerce-api
docker compose up -d
```

### 2. API (Spring Boot)

```bash
cd e-commerce-api
cp .env.example .env   # ajuste se necessário
set -a && source .env && set +a   # bash; no PowerShell, defina as variáveis manualmente
./mvnw spring-boot:run
```

A API sobe em `http://localhost:8080`. As migrations (Flyway) rodam
automaticamente e criam o usuário admin de desenvolvimento:

- **E-mail:** `admin@ecommerce.com`
- **Senha:** `admin123`

### 3. Frontend (Angular)

```bash
npm install
ng serve
```

Acesse `http://localhost:4200`. Por padrão, `src/environments/environment.ts`
aponta para `http://localhost:8080/api` — não é necessário alterar nada para
desenvolvimento local.

## Scripts disponíveis

```bash
ng serve          # servidor de desenvolvimento (localhost:4200)
ng build           # build de produção em dist/
ng test            # testes unitários (Vitest)
```

## Estrutura do projeto

```
src/app
├── core/
│   ├── services/         # ApiService, AuthService, CartService, ProductService...
│   ├── guards/            # authGuard
│   ├── interceptors/       # sessionIdInterceptor, jwtInterceptor
│   └── models/             # interfaces TS espelhando os DTOs da API
├── storefront/            # vitrine pública (produtos, carrinho, checkout)
├── admin/                 # painel administrativo (login, CRUD, pedidos)
└── shared/components/     # header, footer
```

## Rotas principais

| Rota | Descrição | Acesso |
|---|---|---|
| `/` | Listagem de produtos | público |
| `/produtos/:id` | Detalhe do produto | público |
| `/carrinho` | Carrinho | público |
| `/checkout` | Finalizar pedido | público |
| `/pedido/:id` | Confirmação do pedido | público |
| `/admin/login` | Login administrativo | público |
| `/admin/produtos` | CRUD de produtos | admin |
| `/admin/categorias` | CRUD de categorias | admin |
| `/admin/pedidos` | Listagem de pedidos + status | admin |

## Notas

- O `sessionId` do carrinho é gerado automaticamente (UUID) e persistido em
  `localStorage`; não é necessário login para comprar.
- O token JWT do admin também é persistido em `localStorage`
  (`authToken`) e injetado automaticamente nas rotas administrativas.
- Deploy (Vercel/Railway) ainda não configurado — ver Fase 8.5/8.6 do
  `roadmap.md`.
