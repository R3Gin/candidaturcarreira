# Banco de dados — Candidatu

Estado atual do backend (Lovable Cloud) e de onde os dados do app realmente vêm.

## Situação atual

O banco está **vazio**: nenhuma tabela, view, função, trigger, enum, política de RLS ou bucket de storage foi criado no schema `public`.

Verificação (esquema `public`):

| Objeto | Quantidade |
| --- | --- |
| Tabelas | 0 |
| Views | 0 |
| Funções | 0 |
| Triggers | 0 |
| Enums | 0 |
| Buckets de storage | 0 |

Reflexo disso em `src/integrations/supabase/types.ts`: `Database["public"]["Tables"]` está tipado como `never`, ou seja, não existe nenhuma consulta possível hoje.

## Onde os dados ficam hoje

Toda a aplicação (painel do candidato, dashboard empresarial e freelas) funciona com **estado local persistido em `localStorage`**, sincronizado entre abas por eventos de `storage`:

| Domínio | Módulo | Chave `localStorage` (prefixo) |
| --- | --- | --- |
| Conta / currículo / candidaturas | `src/components/app/store.tsx` | `candidatu-app` |
| Vagas, pipeline, equipe da empresa | `src/components/company/store.tsx` | `candidatu-company` |
| Chat candidato ↔ empresa | `src/lib/chat.ts` | `candidatu-chat` |
| Reuniões / entrevistas | `src/lib/meetings.ts` | `candidatu-meetings` |
| Modelos de mensagem | `src/lib/messageTemplates.ts` | `candidatu-templates` |
| Preferências de e-mail | `src/lib/emailPrefs.ts` | `candidatu-email-prefs` |
| Conta de freelancer (nível, ranking, jobs) | `src/lib/freelaAccount.ts` | `candidatu-freela-account` |
| Solicitações de contato de freela | `src/lib/freelaContacts.ts` | `candidatu-freela-contacts` |
| Onboarding concluído | `src/components/app/OnboardingDialog.tsx` | `candidatu-onboarding` |

Consequências práticas:

- Não há autenticação real: o "login" é simulado no estado local.
- Os dados não são compartilhados entre dispositivos nem entre usuários (a empresa e o candidato só "conversam" no mesmo navegador).
- Limpar o navegador apaga tudo.

## Único recurso de servidor em uso

- `src/lib/curriculo.functions.ts` — server function que chama a Lovable AI (Gemini 2.5 Flash) para gerar o currículo. Usa apenas o segredo `LOVABLE_API_KEY`, sem tocar no banco.

## Segredos configurados

`LOVABLE_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`.

## Próximo passo sugerido (quando quiser sair do `localStorage`)

Migrar por domínio, nesta ordem, sempre com RLS + `GRANT` por tabela:

1. **Auth + perfis** — `profiles` (1:1 com o usuário) e `user_roles` em tabela separada (candidato / empresa / freela / admin), com função `has_role` `security definer`.
2. **Empresas e vagas** — `companies`, `company_members`, `jobs` (com `tipo`: contratual ou freelance, diária e carga para freela).
3. **Candidaturas** — `applications` + `application_stages` (histórico do pipeline).
4. **Chat e reuniões** — `chat_threads`, `chat_messages`, `meetings`, `meeting_invites` (bons candidatos a Realtime).
5. **Freelas** — `freela_jobs_done`, `freela_ratings` (nível e ranking calculados por view ou função).
6. **Currículo e arquivos** — bucket privado de storage para PDFs de currículo e documentos da empresa.

Enquanto essas tabelas não existirem, qualquer código que consultar o banco vai falhar em tempo de tipo e de execução.
