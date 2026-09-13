-- Opcional, mas recomendado para persistir 100% dos campos preenchidos na tela do app.
-- Execute uma única vez no SQL Editor do Supabase.

ALTER TABLE public."Solicitacoes"
  ADD COLUMN IF NOT EXISTS prioridade text,
  ADD COLUMN IF NOT EXISTS descricao text,
  ADD COLUMN IF NOT EXISTS altura text,
  ADD COLUMN IF NOT EXISTS "fotoUri" text,
  ADD COLUMN IF NOT EXISTS funcionario text;
