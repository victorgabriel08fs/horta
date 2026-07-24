# Backlog — Horta

> **Reunião de ideias e tarefas ainda não concluídas.**
> Conforme uma tarefa é puxada para uma sprint, ela muda para 🔵 **Em sprint** (com a sprint anotada) — mas **só vira ✅ Concluída quando de fato implementada e verificada** (`php artisan test` + `npm run build` verdes e, quando aplicável, checada no navegador). Estar em uma sprint **não** conclui a tarefa.

Complementa o roadmap de alto nível da [`ARQUITETURA.md` §13](./ARQUITETURA.md); aqui os itens são mais granulares e acionáveis. Convenções de implementação: [`BOAS-PRATICAS.md`](./BOAS-PRATICAS.md).

## Legenda de status

- 💡 **Backlog** — ideia registrada, ainda não planejada
- 🔵 **Em sprint** — puxada para uma sprint, em andamento (**ainda não concluída**)
- ✅ **Concluída** — implementada e verificada (fica aqui só como histórico)

## Como usar

1. Toda ideia nova entra como 💡, com motivação e um esboço.
2. Ao planejar uma sprint, mude o status para 🔵 e preencha o campo **Sprint**.
3. Só marque ✅ quando o código estiver testado/buildado e verificado. Não marque ✅ só por estar planejada.
4. Mantenha os **critérios de aceite** atualizados — são o contrato do "pronto".

---

## B-01 · Documentar validação via Form Request (atributos + mensagens) — ✅ Concluída

- **Sprint:** feito em 24/07/2026 · **Prioridade:** alta · **Esforço:** P
- **Motivação:** padronizar como validamos entrada HTTP (regras, `attributes()`, `messages()` em pt-BR) para o time seguir.
- **Entrega:** seção **§2.1** em [`BOAS-PRATICAS.md`](./BOAS-PRATICAS.md) com exemplo real, regras condicionais e a fronteira validação × regra de negócio.
- **Critérios de aceite:** ✅ exemplo de `authorize/rules/attributes/messages`; ✅ regra condicional (convidado: e-mail **ou** telefone); ✅ nota de que regra de negócio fica no Service.

---

## B-02 · Checkout em passos (abas/wizard) — 💡 Backlog

- **Prioridade:** alta · **Esforço:** M · **Sprint sugerida:** Sprint 5 (UX)
- **Motivação:** o checkout hoje é uma tela só. Para o público leigo no celular, quebrar em passos curtos reduz a carga cognitiva e o abandono.
- **Esboço técnico:**
  - Passos: **1) Ponto de entrega** (mapa + lista) → **2) Seus dados** (nome + contato) → **3) Revisão & confirmar**.
  - Estado de passo local (`useState`) + componente `Stepper` (indicador de progresso "1 de 3") reutilizável.
  - Validar cada passo antes de avançar (ponto obrigatório; contato obrigatório). O submit final continua um único `form.post('/reservas')`.
  - Botões "Voltar"/"Continuar" grandes; sticky no rodapé no mobile.
- **Critérios de aceite:**
  - [ ] Não avança sem escolher o ponto (passo 1) nem sem contato válido (passo 2).
  - [ ] Passo 3 mostra resumo (itens, ponto/horário, total) antes de confirmar.
  - [ ] Funciona bem em 375px; navegação por teclado e `aria-current` no passo ativo.
  - [ ] Erros do backend (estoque/ponto) levam o usuário ao passo certo.

---

## B-03 · Animações no frontend — 💡 Backlog

- **Prioridade:** média · **Esforço:** M · **Sprint sugerida:** Sprint 5 (UX)
- **Motivação:** microinterações deixam o app mais vivo e dão feedback claro (bom para usuários leigos), desde que sutis.
- **Esboço técnico:**
  - Preferir **CSS transitions/keyframes** + utilitários Tailwind; avaliar `framer-motion` só se precisar de orquestração (enter/leave de listas, transições de página do Inertia).
  - Alvos: entrada dos cards do catálogo, aparecer/sumir da barra de carrinho, toasts do `Flash`, marcador do mapa, estados de botão/loading, transição entre passos do checkout (B-02).
  - **Sempre** respeitar `@media (prefers-reduced-motion: reduce)`.
- **Critérios de aceite:**
  - [ ] Animações sutis (≤ 250ms) e sem "jank"/reflow perceptível no mobile.
  - [ ] `prefers-reduced-motion` desliga/for reduz as animações.
  - [ ] Nada bloqueia interação (sem esperar animação para poder clicar).

---

## B-04 · Activity logs (trilha de auditoria) — 💡 Backlog

- **Prioridade:** média · **Esforço:** M · **Sprint sugerida:** Sprint 6 (Observabilidade)
- **Motivação:** rastrear quem fez o quê (mudanças de produto/ciclo/ponto e transições de reserva) para auditoria e suporte.
- **Esboço técnico:**
  - Avaliar `spatie/laravel-activitylog` (padrão da comunidade) vs. tabela própria `activity_logs`.
  - Registrar: CRUD de produtos/categorias/pontos/ciclos, abrir/fechar/entregar ciclo, mudança de status de reserva, cancelamentos. Guardar autor (`causer`), entidade (`subject`), ação e diffs relevantes.
  - Tela admin `/admin/atividades` filtrável por usuário/entidade/período (usar o padrão de tabela existente).
- **Critérios de aceite:**
  - [ ] Toda ação sensível gera um registro com autor, entidade, ação e timestamp.
  - [ ] Transições de status de reserva (confirmada→entregue/cancelada) são logadas.
  - [ ] Tela admin lista e filtra os logs; sem impacto perceptível de performance (considerar fila — ver B-05).

---

## B-05 · Reservas via fila (processamento assíncrono) — 💡 Backlog

- **Prioridade:** média · **Esforço:** M · **Sprint sugerida:** Sprint 7 (Assíncrono)
- **Motivação:** tirar trabalho pesado do ciclo de request e preparar o terreno para notificações/e-mail.
- **Decisão de design (importante):** a **checagem de estoque + criação da reserva permanece síncrona e transacional** (o cliente precisa da resposta imediata: confirmado ou "esgotou"). O que vai para a **fila** são os **efeitos colaterais** pós-reserva.
  - Após `ReservationService::place()` com sucesso, disparar `ReservationPlaced` → job(s): e-mail/WhatsApp de confirmação, registro em activity log (B-04), push (B-06), atualização de agregados.
  - `QUEUE_CONNECTION=database` já configurado; rodar `php artisan queue:work` (ou Horizon no futuro). Definir `tries`/`backoff` e tratamento de `failed_jobs`.
  - Idempotência: jobs identificados pela reserva para não duplicar em retry.
- **Critérios de aceite:**
  - [ ] Criação da reserva continua síncrona; efeitos colaterais rodam em job(s).
  - [ ] Worker processa e reprocessa em falha (retry/backoff); falhas caem em `failed_jobs`.
  - [ ] Nenhum efeito duplicado em reprocessamento.

---

## B-06 · Notificações no navegador — 💡 Backlog

- **Prioridade:** média · **Esforço:** G · **Sprint sugerida:** Sprint 7 (Engajamento)
- **Motivação:** avisar o cliente quando um novo ciclo abre e lembrar da entrega — aumenta o retorno semanal.
- **Esboço técnico:**
  - **Web Push** (Notification API + **Service Worker** + VAPID/`web-push`), com opt-in explícito (pedir permissão só num gesto do usuário, nunca no load).
  - Guardar `push_subscriptions` por usuário; enviar via job na fila (B-05) quando o admin abre um ciclo ou perto da entrega.
  - Enquanto a aba está aberta, dá para usar a Notification API direto; com a aba fechada, exige Service Worker + push. Requer base de **PWA** (manifest + SW) — alinhado à Fase 3 da arquitetura.
  - Distinguir de toasts in-app (o `Flash` já cobre feedback imediato).
- **Critérios de aceite:**
  - [ ] Fluxo de opt-in claro e reversível; nada de pedir permissão sem gesto do usuário.
  - [ ] Service Worker registrado; assinatura salva no backend.
  - [ ] Abrir um ciclo dispara push aos inscritos (via fila); clicar abre o catálogo.
  - [ ] Degrada bem em navegadores/dispositivos sem suporte.

---

## B-07 · Melhorar o mobile do painel administrativo — 💡 Backlog

- **Prioridade:** alta · **Esforço:** M · **Sprint sugerida:** Sprint 5 (UX)
- **Motivação:** as telas do admin (tabelas de produtos, ciclos, reservas, separação) ficam **largas demais** no celular — a página inteira rola na horizontal, o que é ruim para o gestor usar no telefone.
- **Esboço técnico:**
  - Tabelas viram **cards empilhados** no mobile (`< sm`) e tabela só em telas maiores — ou envolver a tabela num container `overflow-x-auto` isolado (o **corpo da página nunca** rola na horizontal).
  - Esconder colunas secundárias no mobile (`hidden sm:table-cell`) e priorizar 2–3 informações por linha.
  - Revisar larguras fixas, `min-w`, e o padding do `AdminLayout` para caber em 375px.
  - Ações (Editar/Remover) acessíveis com toque confortável; considerar menu "⋯" por item no mobile.
- **Critérios de aceite:**
  - [ ] Nenhuma tela do `/admin` gera scroll horizontal **do corpo da página** em 375px.
  - [ ] Listagens legíveis no celular (cards ou tabela com rolagem contida).
  - [ ] Alvos de toque ≥ 44px nas ações; nada cortado fora da viewport.

---

## B-08 · Paginação + filtros por padrão em todas as listagens — 💡 Backlog

- **Prioridade:** alta · **Esforço:** G · **Sprint sugerida:** Sprint 5 (UX/Listas)
- **Motivação:** hoje as listagens usam `->get()` (tabela inteira). Com o volume do `BigDemoSeeder` (100+ clientes, centenas de reservas), isso fica pesado e difícil de navegar. **Convenção já documentada** em [`BOAS-PRATICAS.md` §2.2](./BOAS-PRATICAS.md) — falta **aplicar** nas listagens existentes.
- **Escopo (listagens a migrar):** admin de produtos, categorias, pontos, ciclos, **reservas do ciclo** (já filtra por ponto — falta paginar), dashboard (reservas recentes), histórico do cliente e, no público, o catálogo se a oferta crescer.
- **Esboço técnico:**
  - Backend: `->paginate(20)->withQueryString()`, `->through(fn ($m) => [...])` para transformar só a página; filtros com `->when(...)`; devolver `filters` nos props; ordenação com whitelist.
  - Frontend: componente reutilizável `Pagination` (a partir de `meta.links`) + `Filters` (busca com debounce, selects de status/categoria/ponto); `router.get(..., { preserveState, preserveScroll, replace, only: [...] })` para **partial reload**.
  - Filtros comuns por listagem: busca por nome/código, status, categoria, ponto, período.
- **Critérios de aceite:**
  - [ ] Toda listagem pagina (default 20) e preserva a query ao paginar/filtrar.
  - [ ] Filtros refletidos na URL (compartilhável) e no estado da tela; busca com debounce.
  - [ ] Partial reload (só a lista recarrega, não a página inteira).
  - [ ] Contagem de resultados + `EmptyState`; funciona junto do mobile (B-07).

---

## B-09 · Selects com busca assíncrona e paginada (async paginate) — 💡 Backlog

- **Prioridade:** média · **Esforço:** M · **Sprint sugerida:** Sprint 7 (Async) · **Depende de:** B-08
- **Motivação:** selects que hoje carregam **todas** as opções de uma vez (ex.: produtos no formulário de ciclo, categoria no produto e, no futuro, cliente ao filtrar reservas) não escalam conforme o cadastro cresce.
- **Esboço técnico:**
  - Combobox com busca: digita → busca no backend um endpoint paginado (`GET /admin/…/options?q=&page=`) que retorna `{ data, next_page }`.
  - Carregar mais ao rolar (infinite scroll) ou botão "carregar mais"; debounce na busca; cache leve do que já veio.
  - Priorizar onde a lista pode ficar grande: **produtos** e **pontos** no formulário de ciclo; **cliente** em telas de reserva/filtro; categoria se crescer.
  - Componente reutilizável `AsyncSelect` (headless + acessível; teclado e leitores de tela).
- **Critérios de aceite:**
  - [ ] Selects grandes não baixam todas as opções no load; buscam sob demanda (paginado).
  - [ ] Busca com debounce + "carregar mais"; seleção mantém rótulo mesmo fora da página atual.
  - [ ] Acessível (teclado, `aria-*`) e utilizável no mobile.

---

## Ideias soltas (ainda sem recorte)

- Export CSV/PDF da lista de separação (por ponto) — já citado como Fase 2 na arquitetura.
- Capacidade/limite por ponto (`capacity` já existe no schema) com bloqueio no checkout.
- Passo/mínimo por unidade (`step`) configurável por produto.
- URLs assinadas para o link de confirmação do convidado.
- PWA completa (offline do catálogo, instalação no celular).
