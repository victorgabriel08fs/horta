# Horta

Plataforma web (**Laravel 13 + Inertia + React + TypeScript**) para gerenciar os produtos de uma horta e permitir que clientes reservem produtos para uma **entrega coletiva semanal** que passa por **múltiplos pontos** — o cliente escolhe onde receber.

Arquitetura completa: [`ARQUITETURA.md`](./ARQUITETURA.md) · diagrama de dados: [`modelo-de-dados.mermaid`](./modelo-de-dados.mermaid).

---

## Estado atual — Fase 0 + Fase 1 (MVP) implementadas

Aplicação **full-stack funcional**, com backend e frontend integrados:

**Backend (Laravel)**
- Enums tipados: `UserRole`, `CycleStatus`, `ReservationStatus`, `ProductUnit`
- 9 tabelas: categorias, produtos, ciclos, disponibilidade por ciclo, pontos de entrega, pontos por ciclo, reservas e itens (+ ajuste em `users`)
- 9 Models com relacionamentos, casts e helpers de domínio
- Services: `ReservationService` (reserva transacional com trava `lockForUpdate`), `PickingListService` (separação por produto/ponto/cliente), `DeliveryCycleService` (abrir/fechar/entregar)
- Camada HTTP: controllers públicos e admin, Form Requests, middleware `admin`, rotas nomeadas
- Autenticação de sessão (login, registro, logout) com papéis `admin`/`customer`
- Seeders de demonstração + factories
- **17 testes** (Pest/PHPUnit) verdes cobrindo reserva, estoque, concorrência, ponto, papéis e acesso

**Frontend (React + Inertia + TypeScript + Tailwind)**
- Loja: catálogo do ciclo aberto, carrinho (estado local + `localStorage`), checkout **com escolha do ponto de entrega**, confirmação com código, consulta por código (convidado), histórico do cliente
- Painel: dashboard, CRUD de categorias/produtos/pontos, CRUD de ciclos (com seleção de produtos + pontos e horários), abrir/fechar/entregar, lista de separação (agregada, por ponto e por cliente), reservas filtráveis por ponto com mudança de status
- Login/registro

**UX mobile-first** (90% do uso é no celular): navegação inferior por abas na loja, menu lateral no painel, alvos de toque grandes, inputs 16px (sem zoom no iOS), CTAs claros para usuários leigos. Layout com altura correta (`min-h-dvh`).

**Mapa dos pontos** (Leaflet + OpenStreetMap, **sem chave de API**): mapa no catálogo, seleção do ponto por toque no checkout, "como chegar" na confirmação, e seletor de localização no cadastro de pontos.

**Contato obrigatório**: e-mail **ou** telefone é exigido para reservar e para consultar a reserva (com verificação).

> Convenções para evoluir o projeto: [`BOAS-PRATICAS.md`](./BOAS-PRATICAS.md) · próximas ideias/tarefas: [`BACKLOG.md`](./BACKLOG.md).

---

## Pré-requisitos

- PHP 8.3+ (testado em 8.5) · Composer
- Node.js 20+ · npm
- MySQL 8+ / MariaDB 11+

---

## Setup

```bash
# 1. Dependências
composer install
npm install

# 2. Ambiente (o .env já vem configurado para MySQL local: banco "horta", root/root)
#    Ajuste DB_USERNAME/DB_PASSWORD conforme seu MySQL e crie o banco:
#    CREATE DATABASE horta CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 3. Migrar + popular dados de demonstração
php artisan migrate:fresh --seed

# 4. Link de storage (fotos de produtos)
php artisan storage:link

# 5. Rodar em desenvolvimento (Laravel + Vite)
php artisan serve      # backend em http://127.0.0.1:8000
npm run dev            # Vite (em outro terminal)
```

Para produção de assets: `npm run build`.

> **Banco:** o `.env` usa MySQL. Os **testes** usam um banco à parte `horta_test` (ver `phpunit.xml`) — crie-o com
> `CREATE DATABASE horta_test ...` antes de rodar `php artisan test`.

---

## Credenciais de demonstração

| Papel | E-mail | Senha |
|---|---|---|
| Admin/Gestor | `admin@horta.local` | `password` |
| Cliente | `cliente@horta.local` | `password` |

Troque a senha do admin no primeiro acesso. O painel fica em `/admin`.

---

## Rodar os testes

```bash
php artisan test                              # suíte completa (17 testes)
php artisan test --filter=ReservationService  # regras de reserva/estoque
```

---

## Decisões-chave

- **Estoque é por ciclo** (`cycle_products`), compartilhado entre os pontos. O ponto escolhido define **onde** o cliente recebe.
- **Disponibilidade** = quantidade ofertada − soma das reservas ativas (fonte única de verdade) + trava transacional — sem contador denormalizado.
- **Snapshots** nos itens da reserva e no nome do ponto preservam o histórico.
- **Horário de cada parada é estimado** (`scheduled_at`), exibido ao cliente.
- **Pagamento** acontece na entrega (fora do sistema); `total_amount` é informativo.
- **Convidado** consulta/cancela pelo `confirmation_code`; **registrado** vê tudo no histórico.

---

## Estrutura

```
app/
  Enums/         UserRole, CycleStatus, ReservationStatus, ProductUnit
  Models/        User, Category, Product, DeliveryCycle, CycleProduct,
                 DeliveryPoint, CycleDeliveryPoint, Reservation, ReservationItem
  Services/      ReservationService, PickingListService, DeliveryCycleService
  Support/       CyclePresenter
  Http/
    Controllers/ Catalog, Cart, Reservation, ReservationLookup, Customer/*, Admin/*, Auth/*
    Requests/    StoreReservation, StoreProduct, StoreCategory, StoreDeliveryPoint, StoreDeliveryCycle
    Middleware/  EnsureUserIsAdmin, HandleInertiaRequests
database/
  migrations/    9 migrations · seeders/ · factories/
resources/js/
  pages/         Catalog, Cart, Reservation, Customer, auth, admin/*
  components/     ui, cart/CartContext, QuantityInput, Flash, ConfirmButton
  layouts/       AppLayout (loja), AdminLayout (painel)
  lib/ types/
routes/          web.php, auth.php
tests/           Feature/ (reserva, fluxo, acesso)
```
