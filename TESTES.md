# 🧪 Documento de Testes Manuais — Sprint 3

**Projeto:** Motiva Verde  
**Disciplina:** Cross-Platform Application Development  
**Sprint:** 3 — Protótipo Funcional Completo  
**Data da validação:** 12/09/2026  
**Ambiente:** Android Emulator + Expo + API Flask local + Supabase

---

## Objetivo

Validar manualmente os principais fluxos do aplicativo Motiva Verde, verificando navegação, integração com o backend, leitura e persistência de dados, recursos nativos do dispositivo e comportamento da interface.

---

## Resultados

| # | Cenário testado | Procedimento | Resultado esperado | Resultado obtido | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Login com funcionário cadastrado | Informar e-mail e senha válidos e tocar em entrar | O backend valida o funcionário, a sessão é criada e o usuário é direcionado ao dashboard | Login realizado corretamente e dashboard exibido | ✅ Passou |
| 2 | Carregamento do dashboard | Entrar no aplicativo após autenticação | Indicadores e registros devem ser carregados a partir dos dados da aplicação | Dados carregados e atalhos do dashboard funcionando | ✅ Passou |
| 3 | Registro de nova ocorrência | Selecionar rodovia, preencher KM inicial/final, operação, prioridade e descrição e salvar | A solicitação deve ser validada, enviada ao backend e persistida em `Solicitacoes` | Registro concluído e dados atualizados na aplicação | ✅ Passou |
| 4 | Consulta de trechos monitorados | Abrir a tela de trechos/mapa | Os registros de `Rodovias` devem ser exibidos com trecho, KM e status | Trechos carregados e classificação Normal/Atenção/Crítico exibida corretamente | ✅ Passou |
| 5 | Histórico e conclusão de solicitação | Abrir histórico e concluir uma solicitação aberta | A solicitação deve ser concluída e a manutenção correspondente registrada em `Historico` | Solicitação concluída e histórico atualizado | ✅ Passou |
| 6 | Captura de localização | Na tela de registro, solicitar a localização do dispositivo | O app deve solicitar permissão e, quando autorizada, preencher latitude e longitude | Localização capturada e exibida no formulário | ✅ Passou |
| 7 | Tema claro/escuro | Alterar o tema, fechar e abrir novamente o aplicativo | A interface deve mudar de tema e a preferência deve permanecer salva | Tema alterado e preferência preservada | ✅ Passou |
| 8 | Indisponibilidade do banco | Tentar autenticar enquanto o Supabase está indisponível | O app não deve prosseguir como se o login tivesse sido realizado e deve informar o erro | Popup de erro exibido ao operador; após reativação do banco, o fluxo voltou ao normal | ✅ Passou com melhoria identificada |

---

## Testes complementares de validação do formulário

| Cenário | Comportamento esperado |
| --- | --- |
| Rodovia não selecionada | Exibir aviso informando que a rodovia é obrigatória |
| KM inicial/final vazio ou inválido | Exibir aviso e impedir o envio |
| KM negativo | Exibir aviso de KM inválido |
| KM final menor que KM inicial | Exibir aviso de intervalo inválido |
| Operação não selecionada | Exibir aviso e impedir o envio |
| Descrição vazia | Exibir aviso e impedir o envio |
| Permissão de localização negada | Exibir aviso de permissão negada |
| Permissão de câmera/galeria negada | Exibir aviso sem encerrar o aplicativo |
| Lista de histórico vazia | Exibir estado vazio em vez de tela sem informação |
| Lista de trechos vazia | Informar que não existem trechos carregados |

---

## Problemas e pontos de melhoria encontrados

### 1. Indisponibilidade do Supabase

Durante a validação, o banco de dados ficou temporariamente indisponível. Nesse cenário, o backend retornou erro de resolução/conexão e o aplicativo apresentou uma mensagem de falha ao operador.

**Situação atual:** funcionamento normal após a reativação do Supabase.  
**Melhoria planejada:** adicionar timeout explícito e tratamento de retry para reduzir o tempo de espera em falhas de infraestrutura.

### 2. Legibilidade da interface

Durante a revisão visual, alguns textos foram considerados pequenos para um aplicativo de uso operacional.

**Ajuste realizado:** tamanhos de fonte foram ampliados nas telas e componentes principais.

### 3. Dependência do backend local

Na Sprint 3, a API Flask é executada localmente durante os testes.

**Melhoria planejada para Sprint 4:** avaliar publicação do backend em ambiente remoto para facilitar a instalação e demonstração do APK.

---

## Conclusão dos testes

Os fluxos principais da aplicação foram executados com sucesso no ambiente utilizado para a Sprint 3. Não foram identificados erros críticos de navegação que impeçam a demonstração do aplicativo.

Os pontos encontrados estão relacionados principalmente à robustez de infraestrutura e à preparação da solução para a entrega final. Essas melhorias foram registradas como plano de evolução para a Sprint 4.
