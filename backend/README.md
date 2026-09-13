# Backend Motiva Verde

API Flask que intermedeia o aplicativo Expo e o Supabase.

## Como executar

1. Entre na pasta `backend`.
2. Crie um ambiente virtual: `python -m venv .venv`.
3. Ative o ambiente virtual.
4. Instale as dependências: `pip install -r requirements.txt`.
5. Confira o arquivo `.env`.
6. Rode: `python app.py`.

A API inicia por padrão em `http://0.0.0.0:5000`.

## Rotas

- `POST /funcionarios/login`: valida email e senha na tabela `Funcionarios`.
- `GET /rodovias`: lê os trechos da tabela `Rodovias`.
- `GET /solicitacoes`: lista solicitações em aberto.
- `POST /solicitacoes`: cria uma solicitação.
- `POST /solicitacoes/:id/concluir`: cria registro em `Historico` e remove a solicitação concluída.
- `GET /historico`: lista manutenções concluídas.

## Rede do app

No Android Emulator, `EXPO_PUBLIC_API_URL=http://10.0.2.2:5000` funciona normalmente.
Em celular físico com Expo Go, use o IP LAN do computador que está rodando o Flask.

## Observação de segurança

O schema atual armazena senhas diretamente na tabela `Funcionarios`. O backend mantém esse formato apenas para compatibilidade com o banco existente. Para produção, prefira Supabase Auth ou senhas com hash seguro.

## Persistir todos os campos da tela

O schema original de `Solicitacoes` não possui `prioridade`, `descricao`, `altura`, `fotoUri` e `funcionario`. O arquivo `migration_campos_app.sql` adiciona esses campos. O backend é compatível com os dois formatos: se a migração não tiver sido aplicada, ele grava somente as colunas existentes no schema original; após a migração, passa a persistir também os campos extras automaticamente.
