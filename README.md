# E-commerce — Frontend

Frontend Angular de um e-commerce simples de loja única: vitrine pública
(catálogo, promoções, avaliações de produto, carrinho persistente) e
painel administrativo, consumindo a API Spring Boot em
[`e-commerce-api`](../e-commerce-api). Veja `roadmap.md` na raiz do
projeto para o escopo completo e as decisões de arquitetura.

**Não há checkout processado pelo backend.** A compra é finalizada por um
botão "Comprar pelo WhatsApp" que abre uma conversa com o(s) item(ns) e o
total (número da loja configurado pelo admin em `/admin/configuracoes`) —
substituiu o formulário de checkout/confirmação de pedido original.

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
ng test            # testes unitários
```

## Estrutura do projeto

```
src/app
├── core/
│   ├── services/         # ApiService, AuthService, CartService, ProductService,
│   │                      # CategoryService, ReviewService, SettingsService,
│   │                      # ThemeService, ToastService, WhatsappCheckoutService
│   ├── guards/            # authGuard
│   ├── interceptors/       # sessionIdInterceptor, jwtInterceptor
│   └── models/             # interfaces TS espelhando os DTOs da API
├── storefront/            # vitrine pública: home, catálogo, detalhe do
│   │                      # produto, promoções, carrinho
├── admin/                 # painel administrativo: login, layout com nav
│   │                      # própria, dashboard, CRUD de produtos/categorias,
│   │                      # configurações
└── shared/components/     # header, footer, drawers, modal, toast, skeleton,
                             # empty-state, carousel, theme-toggle, etc.
```

## Rotas principais

| Rota                    | Descrição                                          | Acesso  |
| ------------------------ | --------------------------------------------------- | ------- |
| `/`                       | Home (bandas com destaques, promoções, categorias)     | público |
| `/produtos`               | Catálogo, aceita `?category=` e `?name=`               | público |
| `/produtos/:slug`         | Detalhe do produto (avaliações, botão de WhatsApp)      | público |
| `/promocoes`               | Produtos em oferta                                       | público |
| `/carrinho`                | Página do carrinho                                       | público |
| `/admin/login`             | Login administrativo                                     | público |
| `/admin/dashboard`         | Estatísticas + atalhos (destino do login)                | admin   |
| `/admin/produtos`          | CRUD de produtos (modal, upload de imagens/galeria, importar/exportar CSV) | admin   |
| `/admin/categorias`        | CRUD de categorias (modal)                                | admin   |
| `/admin/configuracoes`     | Número de WhatsApp da loja                                | admin   |

Não há link de navegação persistente para `/admin/**` na UI pública
(navbar minimalista, só o ícone de carrinho) — acesso ao painel é só por
URL direta a partir de `/admin/login`.

## Notas

- O `sessionId` do carrinho é gerado automaticamente (UUID) e persistido em
  `localStorage`; não é necessário login para comprar. O ícone de carrinho
  no header abre um drawer com resumo e o botão de finalizar pelo WhatsApp.
- O token JWT do admin também é persistido em `localStorage`
  (`authToken`) e injetado automaticamente nas rotas administrativas.
- Tema claro/escuro segue o sistema operacional por padrão, com toggle
  manual (`ThemeToggle`, disponível no header e no admin).
- Avaliações de produto são anônimas (nome livre + nota + comentário
  opcional, sem login de cliente) e paginadas — o botão "Carregar mais
  avaliações" aparece quando o produto tem mais de 50.
- Deploy (Vercel/Railway) ainda não configurado — ver Fase 8.5/8.6 do
  `roadmap.md`.
