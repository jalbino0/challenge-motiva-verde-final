# 🌿 Motiva Verde

Aplicativo mobile desenvolvido para apoiar a **gestão e o acompanhamento de ocorrências de vegetação em trechos rodoviários da Motiva**.

Esta entrega corresponde à **Sprint 3 — Protótipo Funcional Completo** da disciplina de Cross-Platform Application Development. O projeto evolui as versões anteriores para uma aplicação navegável e integrada, com aplicativo mobile, backend próprio e banco de dados em nuvem.

---

## 🔗 Entregas e evolução do projeto

| Etapa | Entrega | Link |
| --- | --- | --- |
| Sprint 1 | Protótipo no Figma | [Acessar protótipo](https://www.figma.com/make/1NaP87mmIRBySLItqw7qig/Motiva-Verde-App-Prototype?code-node-id=0-9&p=f&t=k5vQmjbg0GrPwI3O-0&fullscreen=1) |
| Sprint 2 | Repositório GitHub | [Acessar repositório](https://github.com/jalbino0/challenge-motiva-verde-sprint2) |
| Sprint 2 | Vídeo de demonstração | [Assistir vídeo](https://youtube.com/shorts/7cqD1AZ7iVg?feature=share) |
| Sprint 3 | Repositório GitHub | [Acessar repositório](https://github.com/jalbino0/challenge-motiva-verde-sprint3) |
| Sprint 3 | Documento de testes manuais | [Ver TESTES.md](./TESTES.md) |
| Sprint 3 | Vídeo de demonstração | [Assistir vídeo](https://youtu.be/vYMXhAzgUvA) |
| Sprint 4 | APK, plano de negócio e vídeo final | Em desenvolvimento |

> A Sprint 3 possui um repositório próprio, separado da Sprint 2, reunindo a versão funcional completa, integração com Flask + Supabase, testes manuais e melhorias de interface.

---
## 👥 Integrantes

| Nome | RM |
| --- | --- |
| Fernando Caires Silva | 563415 |
| Giovanna Fernandes Pereira | 565434 |
| Guilherme Martins Rezende | 563500 |
| João Pedro de Moura Albino | 565323 |
| Kauê Silva Matheus | 561675 |
| Raphael Mischiatti de Souza | 563567 |

---

## 🎯 Problema abordado

A gestão da vegetação ao longo das rodovias envolve atividades como roçada, poda, conservação da faixa de domínio e acompanhamento das condições dos trechos. Um dos desafios é manter registros atualizados, padronizados e acessíveis para apoiar a operação e a priorização das intervenções.

O **Motiva Verde** centraliza essas informações em uma aplicação mobile voltada ao operador de campo. Pelo app, o funcionário pode consultar trechos monitorados, registrar novas ocorrências, acompanhar solicitações e registrar a conclusão de manutenções.

---

## 💡 Proposta da solução

A solução foi estruturada em três camadas:

```text
┌──────────────────────────────┐
│      App React Native        │
│       Expo + TypeScript      │
└──────────────┬───────────────┘
               │ HTTP / JSON
               ▼
┌──────────────────────────────┐
│         API Backend          │
│        Python + Flask        │
└──────────────┬───────────────┘
               │ Supabase API
               ▼
┌──────────────────────────────┐
│           Supabase           │
│        PostgreSQL Cloud      │
└──────────────────────────────┘
```

O aplicativo mobile não acessa o banco diretamente. As operações são enviadas para a API Flask, responsável por consultar e persistir os dados no Supabase.

---

## ✅ Funcionalidades implementadas

### 🔐 Login do operador

- autenticação por e-mail e senha;
- validação do funcionário pelo backend;
- consulta à tabela `Funcionarios`;
- armazenamento local da sessão com AsyncStorage;
- mensagens personalizadas em caso de erro.

### 📊 Dashboard

- visão geral das informações operacionais;
- indicadores baseados nos dados carregados do backend;
- acesso às principais áreas da aplicação;
- exibição dos registros mais recentes;
- tratamento de estado sem registros.

### 📝 Registro de ocorrência

O operador pode:

- selecionar uma rodovia cadastrada;
- informar KM inicial e KM final;
- selecionar o tipo de operação;
- escolher a prioridade;
- informar altura, quando aplicável;
- adicionar uma descrição da situação;
- capturar a localização por GPS;
- tirar uma foto ou selecionar uma imagem da galeria;
- enviar a ocorrência ao backend.

O funcionário responsável é obtido automaticamente a partir da sessão de login.

Ao salvar, a ocorrência é registrada na tabela `Solicitacoes`. Quando a manutenção é concluída, o backend registra os dados correspondentes em `Historico`.

### 🛣️ Trechos monitorados

- consulta dos dados cadastrados em `Rodovias`;
- exibição de trecho e intervalo de KM;
- classificação visual em `Normal`, `Atenção` ou `Crítico`;
- consolidação de duplicidades exatas por trecho + KM inicial + KM final;
- manutenção do registro de maior criticidade em caso de duplicidade;
- estado visual quando nenhum trecho é retornado.

### 🗂️ Histórico e solicitações

- consulta das solicitações abertas;
- consulta dos registros concluídos;
- atualização manual dos dados;
- conclusão de uma solicitação;
- registro da manutenção no histórico;
- exibição de estado vazio quando não existem registros;
- mensagens de erro quando a atualização não pode ser concluída.

### 📍 GPS

- solicitação de permissão de localização;
- captura da latitude e longitude do dispositivo;
- tratamento de permissão negada;
- mensagem de erro em caso de falha na obtenção da localização.

### 📷 Câmera e galeria

- solicitação de permissão de câmera;
- captura de nova foto;
- seleção de imagem existente na galeria;
- tratamento de permissão negada.

### 🌙 Tema claro e escuro

- alternância entre tema claro e escuro;
- persistência da preferência com AsyncStorage;
- componentes compatíveis com os dois temas.

### ♿ Legibilidade da interface

Na Sprint 3, os tamanhos de fonte foram revisados e ampliados para melhorar a leitura das informações, principalmente considerando o uso operacional em campo.

---


## 📱 Telas da aplicação — Sprint 3

As imagens abaixo representam a versão atual do aplicativo utilizada na entrega da Sprint 3.

<table>
  <tr>
    <td align="center"><strong>Login</strong><br><img src="assets/screens/entrada.png" width="260"></td>
    <td align="center"><strong>Dashboard</strong><br><img src="assets/screens/dashboard.png" width="260"></td>
  </tr>
  <tr>
    <td align="center"><strong>Registrar ocorrência</strong><br><img src="assets/screens/registrar.png" width="260"></td>
    <td align="center"><strong>Mapa de trechos</strong><br><img src="assets/screens/mapa.png" width="260"></td>
  </tr>
  <tr>
    <td colspan="2" align="center"><strong>Histórico</strong><br><img src="assets/screens/historico.png" width="260"></td>
  </tr>
</table>

---

## 🔄 Fluxo principal da aplicação

```text
Login do operador
        ↓
Validação do funcionário no backend
        ↓
Dashboard
        ↓
Consulta de dados da operação
        ↓
Registrar nova ocorrência
        ↓
Selecionar rodovia + informar KM + operação
        ↓
Adicionar descrição / GPS / imagem
        ↓
API Flask
        ↓
Supabase / Solicitacoes
        ↓
Acompanhamento pelo Histórico
        ↓
Concluir solicitação
        ↓
Supabase / Historico
```

---

## 🗄️ Banco de dados

O projeto utiliza **Supabase/PostgreSQL**.

| Tabela | Responsabilidade |
| --- | --- |
| `Funcionarios` | dados utilizados para autenticação dos operadores |
| `Rodovias` | trechos monitorados e informações da vegetação |
| `Solicitacoes` | ocorrências e solicitações abertas |
| `Historico` | manutenções concluídas |

O backend centraliza o acesso ao banco para manter a lógica de persistência fora das telas do aplicativo.

---

## 🧰 Tecnologias utilizadas

### Mobile

- React Native
- Expo SDK 54
- Expo Router
- TypeScript
- AsyncStorage
- Expo Location
- Expo Image Picker
- React Native Safe Area Context

### Backend

- Python 3
- Flask
- Flask-CORS
- Supabase Python Client
- python-dotenv

### Banco

- Supabase
- PostgreSQL

---

## 📁 Estrutura do projeto

```text
motiva-verde/
│
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── dashboard.tsx
│   ├── registrar.tsx
│   ├── mapa.tsx
│   └── historico.tsx
│
├── assets/
│
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── migration_campos_app.sql
│   └── README.md
│
├── src/
│   ├── components/
│   ├── context/
│   ├── data/
│   ├── services/
│   └── styles/
│
├── .env.example
├── app.json
├── package.json
├── package-lock.json
├── tsconfig.json
├── TESTES.md
└── README.md
```

---

## ⚙️ Como executar

### Pré-requisitos

- Node.js e npm;
- Python 3 e pip;
- Android Studio com emulador Android ou dispositivo físico com Expo Go.

### 1. Instalar as dependências do aplicativo

Na pasta principal:

```bash
npm install
```

### 2. Configurar o backend

Entre na pasta:

```bash
cd backend
```

Crie o arquivo `.env` seguindo o modelo `.env.example`:

```env
SUPABASE_URL=SUA_URL_DO_SUPABASE
SUPABASE_KEY=SUA_CHAVE_DO_SUPABASE
```

As credenciais reais não devem ser publicadas no GitHub.

### 3. Instalar as dependências Python

Windows:

```bash
py -m pip install -r requirements.txt
```

Ou:

```bash
python -m pip install -r requirements.txt
```

### 4. Iniciar a API

```bash
py app.py
```

A API Flask será iniciada na porta `5000`.

### 5. Iniciar o aplicativo

Em outro terminal, na raiz do projeto:

```bash
npx expo start -c
```

Com o emulador Android aberto, pressione:

```text
a
```

---

## 🌐 Configuração de rede

A URL do backend é definida por `EXPO_PUBLIC_API_URL`.

### Android Emulator

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000
```

### Dispositivo físico

O celular e o computador devem estar na mesma rede Wi-Fi:

```env
EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:5000
```

Depois de alterar a variável, reinicie o Expo.

---

## 🧪 Testes manuais — Sprint 3

Os fluxos principais foram testados manualmente em ambiente Android com backend Flask e Supabase.

O documento detalhado está disponível em [**TESTES.md**](./TESTES.md).

Foram contemplados fluxos de:

- autenticação;
- carregamento do dashboard;
- registro de ocorrência;
- consulta dos trechos monitorados;
- histórico e conclusão de solicitação;
- GPS;
- tema claro/escuro;
- indisponibilidade temporária do banco.

---

## 📌 Status atual das funcionalidades

| Funcionalidade | Status |
| --- | --- |
| Login de funcionário | ✅ Concluído |
| Persistência da sessão | ✅ Concluído |
| Dashboard | ✅ Concluído |
| Consulta de rodovias | ✅ Concluído |
| Registro de ocorrência | ✅ Concluído |
| Validação do formulário | ✅ Concluído |
| GPS | ✅ Concluído |
| Câmera e galeria | ✅ Concluído |
| Histórico | ✅ Concluído |
| Conclusão de solicitação | ✅ Concluído |
| Estado vazio de listas | ✅ Concluído |
| Mensagens personalizadas de erro | ✅ Concluído |
| Tema claro/escuro | ✅ Concluído |
| Integração Flask + Supabase | ✅ Concluído |
| Revisão de legibilidade/fontes | ✅ Concluído |
| Build APK | ⏳ Sprint 4 |
| Plano de negócio | ⏳ Sprint 4 |
| Vídeo final de pitch | ⏳ Sprint 4 |

---

## ⚠️ Pendências e pontos de melhoria identificados

A Sprint 3 deixa a aplicação funcional e navegável, mas alguns pontos foram mantidos para evolução na Sprint 4:

- adicionar timeout explícito e estratégia de retry nas requisições de rede;
- publicar/deployar o backend em ambiente remoto para reduzir dependência do servidor local;
- armazenar imagens em serviço de storage, em vez de manter apenas a URI local do dispositivo;
- avaliar autenticação com Supabase Auth;
- reforçar políticas de segurança e acesso ao banco;
- adicionar testes automatizados além dos testes manuais;
- gerar e validar o APK final em dispositivo Android.

Durante os testes, foi identificada uma indisponibilidade temporária do Supabase. O aplicativo exibiu a falha ao operador e o funcionamento normal foi retomado após a reativação do banco. Como melhoria, será adicionado um timeout de rede mais explícito para evitar esperas longas em cenários semelhantes.

---

## 🚀 Plano de ajustes para a Sprint 4

Para a entrega final, o grupo pretende:

1. revisar os pontos levantados nos testes manuais da Sprint 3;
2. melhorar o tratamento de indisponibilidade de rede e backend;
3. revisar segurança e configuração de ambiente;
4. gerar o APK final do aplicativo;
5. instalar e validar o APK em dispositivo Android;
6. consolidar o README final das quatro Sprints;
7. elaborar o plano de negócio;
8. gravar o vídeo final de pitch e demonstração.

---

## 🔒 Segurança

Arquivos `.env` reais não devem ser versionados. O repositório deve conter apenas `.env.example` com os nomes das variáveis necessárias.

O `.gitignore` também ignora arquivos de ambiente, dependências, caches e artefatos de build.

---

## 📱 Decisão tecnológica

O grupo **manteve React Native com Expo**, tecnologia utilizada no desenvolvimento desta solução. Não houve migração para Flutter nesta Sprint.

A decisão permite preservar a base funcional já construída e concentrar o esforço da Sprint 3 na conclusão dos fluxos, integração com o backend, consistência visual, tratamento dos diferentes estados da aplicação e testes manuais.

---

## 📈 Evolução por Sprint

### Sprint 1 — Protótipo

A primeira etapa concentrou-se na definição da experiência do usuário e na validação visual dos fluxos por meio do protótipo no Figma.

### Sprint 2 — Aplicação funcional

A segunda etapa transformou o protótipo em uma aplicação React Native/Expo navegável, estruturando as principais telas e fluxos do Motiva Verde.

### Sprint 3 — Protótipo funcional completo

Na Sprint 3, a solução foi consolidada com **Flask + Supabase** como fonte principal dos dados operacionais, integração do login e das ocorrências com o banco, GPS, câmera/galeria, estados vazios e de erro, melhorias de legibilidade, histórico e conclusão de solicitações. Os fluxos principais também foram documentados em testes manuais.

### Sprint 4 — Próxima etapa

A Sprint 4 será dedicada aos ajustes finais identificados nos testes, deploy do backend, geração e validação do APK, plano de negócio e vídeo final de pitch e demonstração.

---

## ✅ Situação da Sprint 3

O **Motiva Verde** encontra-se em estado de **protótipo funcional completo**, com os principais fluxos implementados, navegáveis e testados manualmente.

A próxima etapa é a Sprint 4, com foco em correções finais, geração do APK, plano de negócio e apresentação final da solução.
