# Boas práticas — Horta

Guia para **continuar o projeto** mantendo consistência, qualidade e a experiência mobile-first.
Leia junto com [`ARQUITETURA.md`](./ARQUITETURA.md) (o "porquê") — aqui está o "como".

---

## 1. Princípios

1. **Mobile-first, para pessoas leigas.** 90% do uso é no celular, muitas vezes por quem tem pouca familiaridade com tecnologia. Toda tela nasce pensada para o dedo e para a clareza: um caminho óbvio, poucos passos, textos curtos.
2. **Controllers finos, domínio nos Services.** Regra de negócio nunca mora no controller nem no componente React.
3. **Uma fonte de verdade para estoque.** Disponibilidade = ofertado − reservas ativas, sempre calculada, com trava transacional. Nunca um contador denormalizado.
4. **Snapshots preservam histórico.** Preço, nome, unidade e nome do ponto são congelados na reserva.
5. **pt-BR em tudo que o usuário lê.** Labels, mensagens de erro, datas e moeda.
6. **Verde antes de seguir.** `php artisan test` e `npm run build` passam antes de considerar uma tarefa concluída.

---

## 2. Onde colocar cada coisa (backend)

| Preciso de… | Vai em | Exemplo |
|---|---|---|
| Valor fixo tipado (status, papel, unidade) | `app/Enums/` | `CycleStatus` |
| Dados + relacionamentos + helpers curtos | `app/Models/` | `CycleProduct::remainingQuantity()` |
| Regra de negócio / orquestração / transação | `app/Services/` | `ReservationService::place()` |
| Validação de entrada HTTP | `app/Http/Requests/` | `StoreReservationRequest` |
| Montar dados para o Inertia (shape do front) | `app/Support/` (presenters) | `CyclePresenter` |
| Receber request → chamar service → responder | `app/Http/Controllers/` | `ReservationController` |
| Autorização por papel/dono | middleware `admin` + Policies | `EnsureUserIsAdmin` |

**Regra de ouro:** se um controller passar de ~15 linhas por ação ou tiver `if` de negócio, extraia para um Service.

### Convenções backend
- **Migrations**: uma tabela por arquivo; FKs com `constrained()` e política de exclusão explícita (`cascadeOnDelete`/`nullOnDelete`); índices em colunas de filtro (`status`, `cycle_product_id`).
- **Casts sempre**: enums, `decimal:2` para dinheiro/quantidade, `boolean`, `datetime`. Nunca compare dinheiro como string — faça `(float)` no Service.
- **Dinheiro**: `decimal(10,2)` em BRL. `total_amount` é informativo (pagamento na entrega).
- **Transações + lock**: qualquer operação que consome estoque usa `DB::transaction` + `lockForUpdate()` no `cycle_products` (ver `ReservationService`). Recalcule o restante **dentro** da transação.
- **Form Requests**: validação e `authorize()` ficam aqui, não no controller. Mensagens em pt-BR via `messages()`/`attributes()`.
- **Erros de domínio**: lance `ReservationException` no Service; converta para `ValidationException` no controller (o Inertia mostra como erro de formulário).

### 2.1 Validação sempre em Form Requests (atributos + mensagens em pt-BR)

Toda entrada HTTP não-trivial vai num **Form Request** dedicado (`php artisan make:request`), nunca `$request->validate()` espalhado no controller. Um Form Request concentra quatro responsabilidades:

1. **`authorize()`** — quem pode enviar (papel/dono). `false` → 403. Quando o grupo inteiro já está atrás do middleware `admin`, ainda vale retornar `->isAdmin()` como defesa em profundidade.
2. **`rules()`** — as regras; podem ser **condicionais** conforme o contexto.
3. **`attributes()`** — nomes amigáveis em pt-BR, usados nas mensagens automáticas.
4. **`messages()`** — mensagens específicas por regra, em pt-BR, só onde a padrão não basta.

```php
class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'name'  => ['required', 'string', 'max:160'],
            'unit'  => ['required', new Enum(ProductUnit::class)],
            'price' => ['required', 'numeric', 'min:0'],
            'image' => ['nullable', 'image', 'max:4096'],
        ];
    }

    public function attributes(): array
    {
        return ['name' => 'nome', 'unit' => 'unidade', 'price' => 'preço'];
    }

    public function messages(): array
    {
        return ['price.min' => 'O preço não pode ser negativo.'];
    }
}
```

Regras práticas:

- **Sempre `attributes()`** para campos com nome técnico: a mensagem padrão vira "O campo **preço** é obrigatório." em vez de "The price field is required.".
- **`messages()` é cirúrgico** — use para regras que a mensagem padrão não expressa bem (`required_without`, `after`, `distinct`, regras de negócio). Não reescreva tudo.
- **Regras condicionais** montam o array no `rules()` conforme o contexto. Ex. real (`StoreReservationRequest`): convidado exige nome **e** e-mail **ou** telefone via `required_without`:
  ```php
  if ($isGuest) {
      $rules['guest_name']  = ['required', 'string', 'max:120'];
      $rules['guest_phone'] = ['nullable', 'required_without:guest_email', 'string', 'max:40'];
      $rules['guest_email'] = ['nullable', 'required_without:guest_phone', 'email', 'max:160'];
  }
  ```
- **Não valide regra de negócio aqui** (estoque, ponto pertencer ao ciclo, capacidade): isso é do `ReservationService`, que lança `ReservationException` → convertida em `ValidationException` no controller.
- **Reaproveite** um mesmo Form Request para `store` e `update` quando as regras coincidem; use `->ignore($id)` no `unique` para o update.

---

## 3. Onde colocar cada coisa (frontend)

```
resources/js/
  pages/        Uma página Inertia por rota. Nome do componente = string do Inertia::render()
  components/   Reutilizáveis. ui.tsx = primitivas (Button, Input, Card, Badge, Field…)
  components/cart/  CartContext (estado do carrinho em localStorage)
  layouts/      AppLayout (loja) e AdminLayout (painel)
  lib/          format.ts (brl, qty, datas), cn.ts
  types/        Contratos TypeScript compartilhados com os props do Inertia
```

### Regras frontend
- **Props tipados**: todo dado vindo do backend tem um tipo em `types/` ou na própria página. O shape do presenter no PHP e o tipo no TS **andam juntos** — mudou um, muda o outro.
- **Reuse as primitivas** de `components/ui.tsx`. Não recrie botões/inputs à mão.
- **Formatação centralizada**: use `brl()`, `qty()`, `dateBR()`, `timeBR()` de `lib/format.ts`. Nunca formate moeda/data inline.
- **Estado do carrinho** só via `useCart()`. O `CartProvider` é montado **na raiz** (`app.tsx`), então `useCart()` funciona em qualquer componente — inclusive no corpo de uma página. Para vincular o carrinho a um ciclo (e esvaziar quando o cliente muda de ciclo), passe `cartCycleId={cycle.id}` ao `AppLayout` (ele chama `scopeToCycle` internamente). A verdade de disponibilidade é sempre revalidada no backend ao confirmar.
- **Formulários**: use `useForm` do Inertia; exiba `form.errors.campo` em cada `<Field error=…>`.
  - ⚠️ `form.transform()` **não é encadeável** no `@inertiajs/react` (retorna `undefined`). Chame em duas linhas: `form.transform((d) => ({ ...d, extra }));` e depois `form.post(url)`. Nunca `form.transform(...).post(...)`.
  - Uploads/arquivos: `form.post(url, { forceFormData: true })`; para editar com arquivo, faça spoof de método via transform: `form.transform((d) => ({ ...d, _method: 'put' }))` e então `form.post(url, { forceFormData: true })`.

---

## 4. UI/UX mobile-first (checklist obrigatório)

Toda tela nova deve passar por esta lista:

- [ ] **Altura**: layouts usam `min-h-dvh` (não `min-h-full`) + `flex-col` com `main` em `flex-1`. Isso evita footer/sidebar "subindo" com pouco conteúdo.
- [ ] **Alvos de toque ≥ 44px**: botões `size="md"`/`"lg"` (têm `min-h-11/12`); steppers e ícones idem. Nada de alvo minúsculo no mobile.
- [ ] **Inputs com fonte 16px** (`text-base`): impede o zoom automático do iOS ao focar. Já é o padrão em `ui.tsx`.
- [ ] **Um CTA primário claro por tela**, largura total no mobile (`w-full`), verbo direto ("Adicionar", "Confirmar reserva").
- [ ] **Navegação inferior** na loja (`BottomNav` no `AppLayout`) e **drawer** no admin — as duas coisas que um usuário leigo encontra sem pensar.
- [ ] **Espaço para as barras fixas**: `main` tem `pb-28` no mobile para não esconder conteúdo atrás da bottom-nav; barras flutuantes ficam em `bottom-20 sm:bottom-4`.
- [ ] **Estados vazios amigáveis** (`EmptyState`) com uma ação clara, nunca uma tela em branco.
- [ ] **Feedback de ação**: `Flash` para sucesso/erro; botões com estado `disabled`/"Confirmando…" durante o envio.
- [ ] **Progressão visível** em fluxos (checkout numerado "1. Onde receber", "2. Seus dados").
- [ ] **Contraste e tamanho de texto** confortáveis; evite cinza-claro para informação essencial.
- [ ] **Grid responsivo**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`. Comece em 1 coluna.
- [ ] **Acessibilidade**: `aria-label` em botões só-ícone; `<label>` associado; foco visível (já no `focus-visible:ring` das primitivas).

> Regra prática: teste sempre em uma viewport de ~375px de largura antes de considerar pronto.

---

## 5. Mapa dos pontos (Leaflet + OpenStreetMap)

- Biblioteca: **Leaflet** com tiles do **OpenStreetMap** — sem chave de API, sem custo.
- Componentes: `PointsMap` (exibição de vários pontos, seleção opcional) e `LocationPicker` (admin clica para definir a coordenada).
- Pontos guardam `latitude`/`longitude` (nullable). **Sempre trate o caso sem coordenadas**: o `PointsMap` cai num fallback com link para o OSM.
- Import do CSS do Leaflet é feito dentro dos componentes de mapa; o Leaflet vira um **chunk separado** (lazy) — só carrega nas telas com mapa.
- Marcadores usam `L.divIcon` (HTML inline) para não depender das imagens padrão do Leaflet (que quebram com bundlers).
- Container de mapa leva `isolate z-0` para não sobrepor barras fixas (`z-30/40`).
- Popups incluem link **"Como chegar"** (`google.com/maps/dir`) — navegação é o que o usuário final quer.

---

## 6. Como adicionar uma feature ponta a ponta (receita)

Exemplo mental: "adicionar limite de itens por reserva".

1. **Migration** (se precisar de coluna) → `php artisan make:migration`.
2. **Model**: fillable + cast + helper de domínio, se houver.
3. **Enum** se for um conjunto fixo de valores.
4. **Service**: a regra de negócio e a transação.
5. **Teste primeiro/junto** (`tests/Feature`): caminho feliz + limites + concorrência.
6. **Form Request**: validação da entrada.
7. **Controller**: fino — chama o Service, devolve `Inertia::render`/redirect com `flash`.
8. **Presenter**: monte o shape para o front (e nada de N+1 — ver §8).
9. **Tipo TS** correspondente em `types/`.
10. **Página/Componente React** usando as primitivas e o checklist de UX (§4).
11. `php artisan test` + `npm run build` verdes.
12. Atualize `README.md`/`ARQUITETURA.md` se mudou comportamento observável.

---

## 7. Testes

- Framework: PHPUnit (roda com `php artisan test`). Banco de teste: **`horta_test`** (MySQL, ver `phpunit.xml`) — crie-o antes.
- **O que sempre cobrir** numa mudança de reserva/estoque: caminho feliz, esgotamento, concorrência (duas reservas), ponto inválido, ciclo fechado, unidade fracionada, cancelamento/devolução.
- **Acesso**: convidado → login; cliente → 403; admin → ok.
- Use `RefreshDatabase` e as factories. Um teste por comportamento, nome descritivo (`test_...`).
- Rodar um arquivo: `php artisan test --filter=ReservationServiceTest`.

---

## 8. Performance

- **N+1 é bug.** Use `with([...])` para eager-load. Para estoque de muitos produtos, use o padrão `CyclePresenter::reservedMap()` (uma query agregada `cycle_product_id → soma`) em vez de `remainingQuantity()` por linha.
- Índices em colunas de filtro/junção (já existem em `reservations` e `reservation_items`).
- Evite lógica pesada em `share()` do Inertia (roda em toda request) — só o essencial (auth, flash).

---

## 9. Segurança e autorização

- **Admin** protegido por `auth` + middleware `admin` (`EnsureUserIsAdmin`).
- **Convidado** acessa a própria reserva por **código + contato** (e-mail/WhatsApp que bate com o da reserva). Contato é **obrigatório** ao reservar e ao consultar.
- **CSRF**: mantido pelo grupo `web`; o Inertia envia o token automaticamente. Não desative.
- **Nunca confie no front**: disponibilidade, validade do ponto e pertencimento ao ciclo são revalidados no `ReservationService`.
- Futuro (Fase 2): **URLs assinadas** para o link de confirmação do convidado.

---

## 10. Convenções de código

- **PHP**: PSR-12; rode `./vendor/bin/pint` antes de commitar. Tipos de retorno sempre. Enums tipados em vez de strings soltas.
- **TS/React**: componentes em `PascalCase`, hooks em `useX`. Sem `any` desnecessário. Classes Tailwind na ordem lógica; use `cn()` para condicionais.
- **i18n**: texto voltado ao usuário em pt-BR. Datas/moeda pelos helpers.
- **Nomes de rota/URL**: URLs em pt-BR (`/carrinho`, `/consultar-reserva`, `/admin/ciclos`); nomes de rota em `snake`/`dot` (`admin.ciclos.separacao`).

---

## 11. Git

- Branch por feature; commits pequenos e descritivos (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`).
- PR só com testes verdes e build ok. Descreva o comportamento e como testar no mobile.
- Nunca commitar `.env`, `storage/` de upload, nem `public/build` (gerado).

---

## 12. Próximos passos sugeridos (do roadmap)

**Fase 2** — capacidade/limite por ponto (`capacity` já existe no schema), export CSV/PDF da lista de separação, passo/mínimo por unidade, URLs assinadas para convidado, dashboard com mais métricas.

**Fase 3** — notificações (e-mail/WhatsApp: abertura do ciclo, confirmação, lembrete), pagamento online (PIX/Mercado Pago — o modelo já isola o pagamento), recorrência de ciclos, entrega em endereço, PWA.

> O detalhamento acionável dessas e de outras ideias vive em [`BACKLOG.md`](./BACKLOG.md) (ex.: checkout em passos, animações, activity logs, reservas via fila, notificações no navegador). Ao evoluir, mantenha este documento vivo: se criar um novo padrão, registre-o aqui.
