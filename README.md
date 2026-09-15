# Cambridge C1 Prep

App pessoal de estudos para o exame Cambridge C1 Advanced (CAE): dashboard gamificado (streak, contagem regressiva pro exame, desempenho por frente, resultado geral), prática com correção automática e simulado cronometrado, banco de erros com revisão espaçada, e um pipeline de geração/auditoria de questões por IA.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, TypeScript, Tailwind v4)
- [Supabase](https://supabase.com) — Postgres, Auth, RLS
- [Gemini API](https://ai.google.dev) — agente corretor e pipeline de geração de questões (free tier)
- [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com) — testes unitários e de componente
- GitHub Actions — lint + testes + build em todo push/PR pra `main`

## Setup

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Copie `.env.example` para `.env.local` e preencha:
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — em Project Settings → API.
   - `SUPABASE_SERVICE_ROLE_KEY` — mesma tela (nunca expor no cliente).
   - `GEMINI_API_KEY` — grátis em [aistudio.google.com/apikey](https://aistudio.google.com/apikey) (free tier, sem cartão).
3. Aplique as migrations em `supabase/migrations/`, **nessa ordem**, via SQL Editor do Supabase (copiar/colar cada arquivo) ou com o [Supabase CLI](https://supabase.com/docs/guides/cli) (`supabase link` + `supabase db push`):
   1. `profiles_and_roles` — perfis, roles (admin/student), `is_admin()`
   2. `question_bank` — banco de questões + status de revisão
   3. `attempts_and_activity` — tentativas, itens de tentativa, atividade diária (streak)
   4. `exam_date` — data do exame por usuário
   5. `review_items` — fila de revisão espaçada (banco de erros)
4. No dashboard do Supabase, em **Authentication → Sign In / Providers → Email**, desative **"Confirm email"** (app pessoal, sem necessidade de verificar o próprio e-mail — evita esbarrar no rate limit de e-mail do plano free).
5. `npm install && npm run dev`, acesse [http://localhost:3000](http://localhost:3000), crie sua conta (e-mail + senha) pelo link "Não tem conta? Criar uma".
6. Promova seu próprio usuário a admin:
   ```sql
   update profiles set role = 'admin' where id = '<seu-user-id>';
   ```

## Comandos

```bash
npm run dev      # servidor local
npm run build    # build de produção
npm run lint     # eslint
npm run test     # vitest (unit + component)
```

## Estrutura

```
/app
  /login                    -> autenticação (e-mail + senha)
  /(app)                    -> rotas autenticadas, layout com nav + streak
    /dashboard               -> streak, contagem regressiva, desempenho por frente
    /practice                -> hub: escolher frente ou ir pra fila de revisão
    /practice/[skill]         -> responder questões (prática livre ou simulado cronometrado)
    /practice/review          -> fila de revisão espaçada (banco de erros)
    /profile                  -> editar nome, data do exame, sair
    /admin/review              -> fila de questões pendentes de revisão humana (admin)
  /api/agent/correct          -> correção de Writing via Gemini
  /api/attempts/submit         -> salva tentativa de prática/simulado, atualiza streak e banco de erros
  /api/review/submit           -> salva resultado da revisão espaçada, avança o agendamento
/components                  -> QuestionRunner, PracticeStarter, DatePicker, ProfileForm, StreakFlame, SkillRing, NavLinks
/lib
  /supabase                  -> clients (browser, server, admin/service-role)
  /agent                      -> corretor de writing + pipeline gerador/resolvedor-cego/auditor
  /scoring                    -> streak, Cambridge English Scale, correção de resposta, repetição espaçada, contagem regressiva
  /server                     -> helpers de rota de API (daily_activity, review_items)
  /ui                         -> metadados por frente, calendário, formatação de tempo
  /types                      -> tipos espelhando o schema do banco
/supabase/migrations          -> schema versionado
.github/workflows/ci.yml      -> lint + test + build no CI
```

## Roadmap

Feito:
- Dashboard com streak, contagem regressiva pro exame (editável no perfil) e desempenho por frente
- Auth por e-mail/senha, roles admin/student com RLS
- Responder questões (múltipla escolha ou texto livre) com feedback imediato
- Simulado cronometrado com as durações reais da prova, por frente
- Banco de erros com revisão espaçada (agendamento tipo SM-2)
- UI gamificada (tema próprio, ícones lucide, fundo com gradiente)
- Pipeline de geração de questões (gerador → resolvedor cego → auditor) em `lib/agent/questionPipeline.ts`
- Testes unitários/componente (Vitest + Testing Library) e CI no GitHub Actions

Pendente:
- Tela de submissão de redação (o endpoint `/api/agent/correct` já existe, falta a UI)
- Job de geração de questões em lote + ações de aprovar/rejeitar na fila `/admin/review`
- Gamificação adicional: meta diária, streak freeze, badges
- Chat com o agente pra dúvidas pontuais + insight semanal automático
- Speaking: upload de áudio, transcrição e feedback
- Heatmap de atividade e gráfico de evolução da nota ao longo do tempo
