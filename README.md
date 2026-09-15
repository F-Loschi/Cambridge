# Cambridge C1 Prep

App pessoal de estudos para o exame Cambridge C1 Advanced (CAE): dashboard de progresso (streak, desempenho por frente, resultado geral), banco de questões gerado/auditado por IA, e um agente que corrige Writing/Speaking e dá dicas.

## Stack

- [Next.js](https://nextjs.org) (App Router, TypeScript, Tailwind)
- [Supabase](https://supabase.com) — Postgres, Auth, Storage
- [Gemini API](https://ai.google.dev) — agente corretor e pipeline de geração de questões (free tier)

## Setup

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Copie `.env.example` para `.env.local` e preencha:
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — em Project Settings → API.
   - `SUPABASE_SERVICE_ROLE_KEY` — mesma tela (nunca expor no cliente).
   - `GEMINI_API_KEY` — grátis em [aistudio.google.com/apikey](https://aistudio.google.com/apikey) (free tier, sem cartão).
3. Aplique as migrations em `supabase/migrations/` — via SQL Editor do Supabase (copiar/colar cada arquivo em ordem) ou com o [Supabase CLI](https://supabase.com/docs/guides/cli): `supabase link` e depois `supabase db push`.
4. Promova seu próprio usuário a admin depois do primeiro login:
   ```sql
   update profiles set role = 'admin' where id = '<seu-user-id>';
   ```
5. `npm install && npm run dev`, acesse [http://localhost:3000](http://localhost:3000).

## Estrutura

```
/app
  /login                -> autenticação (magic link)
  /dashboard             -> streak, desempenho por frente, resultado geral
  /practice/[skill]      -> questões aprovadas de uma frente
  /admin/review           -> fila de questões precisando revisão humana
  /api/agent/correct      -> correção de Writing via Claude
/lib
  /supabase              -> clients (browser, server, admin/service-role)
  /agent                  -> corretor de writing + pipeline gerador/resolvedor-cego/auditor
  /scoring                -> cálculo de streak e conversão pra Cambridge English Scale
  /types                  -> tipos espelhando o schema do banco
/supabase/migrations      -> schema versionado (profiles/roles, question_bank, attempts, daily_activity)
```

## Roadmap

1. Dashboard + entrada manual de resultados (sem IA) — **feito no scaffold inicial**
2. Agente corretor de Writing — **rota criada, falta UI de submissão**
3. Banco de questões de Reading/UoE/Listening com pipeline gerador → resolvedor cego → auditor — **pipeline em `lib/agent/questionPipeline.ts`, falta job de geração em lote e UI de aprovação em `/admin/review`**
4. Tutor de dicas baseado no histórico de erros
5. Speaking: upload de áudio + transcrição + feedback
