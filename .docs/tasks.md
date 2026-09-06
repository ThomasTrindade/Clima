# Tasks - Clima

Este arquivo decompoe a implementacao do [PRD](./prd.md) em tarefas progressivas. O PRD e a fonte de verdade para requisitos, contratos, mensagens e diretrizes visuais; as tarefas abaixo indicam apenas o trabalho incremental e como aprova-lo.

Execute as tarefas na ordem apresentada. Cada agente deve trabalhar em uma tarefa por vez, marcar `[x]` somente depois de cumprir o criterio de aprovacao e deixar o projeto em estado funcional para a proxima tarefa.

## 1. Preparar a estrutura da aplicacao

- [x] Criar ou ajustar a estrutura de modulos prevista no PRD, separando API, tipos, interpretacao do weather code, UI e inicializacao.
- Criterio de aprovacao: os modulos possuem responsabilidades separadas, o `main.ts` nao contem requisicoes HTTP diretas e `npm run build` conclui sem erros.
- Referencia: PRD, secoes 6 e 8.

## 2. Definir os tipos e contratos de dados

- [ ] Criar os tipos explicitos para cidade, resposta de geocodificacao, clima atual, unidades e resultado normalizado.
- Criterio de aprovacao: os campos necessarios para a interface e para as validacoes da API estao tipados, incluindo numeros, booleanos e strings, sem depender de `any` para o fluxo principal.
- Referencia: PRD, secoes 3, 6 e 8.

## 3. Implementar a busca de cidade

- [ ] Implementar a funcao de geocodificacao usando `URL` e `URLSearchParams`, com `count=1`, idioma portugues e validacao da entrada e da resposta.
- Criterio de aprovacao: uma cidade valida retorna somente `name`, `latitude`, `longitude`, `country_code` e `timezone`; nome vazio nao faz requisicao; resposta sem resultado retorna `null` ou falha controlada; o nome e o parametro sao codificados corretamente.
- Referencia: PRD, RF-01, RF-02 e RNF-03.

## 4. Implementar a consulta do clima atual

- [ ] Implementar a funcao que consulta o endpoint de forecast com a localizacao validada e os campos `current` definidos no PRD.
- Criterio de aprovacao: a funcao verifica `response.ok`, valida `current`, `current_units` e todos os campos obrigatorios, normaliza apenas os dados necessarios e rejeita respostas incompletas sem produzir clima parcial.
- Referencia: PRD, RF-03, RNF-03 e secao 6.

## 5. Compor o fluxo de consulta

- [ ] Implementar a funcao de alto nivel que encadeia geocodificacao e clima como uma unica operacao de negocio.
- Criterio de aprovacao: uma cidade valida dispara exatamente as duas requisicoes na ordem correta; cidade nao encontrada interrompe o fluxo antes da segunda requisicao; falha no clima produz uma falha controlada sem dados incompletos.
- Referencia: PRD, RF-02, RF-03, RF-04 e criterios 1, 3 e 4.

## 6. Criar o mapeamento de weather code

- [ ] Implementar a conversao de todos os grupos WMO definidos no PRD para descricoes em portugues.
- Criterio de aprovacao: cada codigo listado no PRD retorna a descricao correspondente e qualquer codigo desconhecido retorna exatamente `Condicao indisponivel`, sem lancar excecao.
- Referencia: PRD, RF-06 e criterio 8.

## 7. Montar a estrutura semantica da tela

- [ ] Criar o HTML/DOM inicial com formulario de busca, estados de vazio, carregamento e erro, alem do painel de resultado com sidebar e area de metricas.
- Criterio de aprovacao: a tela usa `main`, `form`, `label`, `section` e headings em hierarquia coerente; o campo tem rotulo acessivel, placeholder em portugues e o painel nao exibe dados ficticios no estado inicial.
- Referencia: PRD, RF-01, RF-05, RF-07 e RNF-02.

## 8. Implementar a renderizacao dos estados

- [ ] Criar as funcoes de UI para renderizar estado vazio, loading, sucesso e erro, limpando o resultado anterior quando uma nova busca comeca.
- Criterio de aprovacao: cada estado e visualmente distinguivel e mutuamente consistente; o loading anuncia `Buscando clima...`; erro de cidade, clima indisponivel e falha generica exibem mensagens apropriadas; nenhum painel parcial ou dado antigo permanece visivel.
- Referencia: PRD, RF-04, RF-05, RF-07 e criterio 5.

## 9. Exibir o resumo meteorologico

- [ ] Conectar o resultado normalizado a sidebar e metricas, incluindo temperatura, cidade, pais, data no timezone da API, dia/noite, condicao, umidade, sensacao, precipitacao e vento com unidades.
- Criterio de aprovacao: uma resposta valida exibe todos os campos obrigatorios nas areas corretas; `is_day=1` aparece como `Dia`, `is_day=0` como `Noite`; a data nao depende do timezone local do navegador; a direcao do vento mantem os graus visiveis.
- Referencia: PRD, RF-05, secao 6 e criterios 6 e 7.

## 10. Conectar formulario, teclado e concorrencia

- [ ] Implementar submit pelo botao e pela tecla Enter, normalizacao de espacos, bloqueio ou cancelamento de busca em andamento e protecao contra respostas fora de ordem.
- Criterio de aprovacao: busca vazia nao chama a API; o formulario permanece utilizavel para nova tentativa; durante o loading nao ha buscas concorrentes; uma resposta antiga nunca substitui o resultado da busca mais recente.
- Referencia: PRD, RF-01, RF-04 e RNF-03.

## 11. Aplicar o layout visual responsivo

- [ ] Implementar os estilos do PRD para fundo, painel central, sidebar, grade de metricas, foco visivel e reorganizacao em telas pequenas.
- Criterio de aprovacao: em desktop o conteudo fica centralizado com largura maxima de 800px e duas colunas; em viewport mobile as areas ficam verticais sem overflow horizontal; valores e controles nao ficam cortados nem causam salto de layout.
- Referencia: PRD, RNF-01, secao 7 e criterio 9.

## 12. Revisar acessibilidade e preferencias de movimento

- [ ] Completar atributos e comportamentos de acessibilidade para foco, mensagens dinamicas, controles desabilitados, contraste e reducao de movimento.
- Criterio de aprovacao: o fluxo completo funciona apenas com teclado; loading e erros sao anunciados por `aria-live`; o foco permanece visivel; informacoes de dia/noite, erro e condicao nao dependem apenas de cor; `prefers-reduced-motion` reduz ou remove animacoes.
- Referencia: PRD, RNF-02 e criterios 10 e 11.

## 13. Tratar falhas de rede, HTTP, timeout e parsing

- [ ] Garantir tratamento uniforme para timeout, erro de rede, status HTTP nao bem-sucedido, JSON invalido e parametros ausentes na camada de API.
- Criterio de aprovacao: nenhuma dessas falhas quebra a aplicacao ou expoe detalhes tecnicos ao usuario; a UI mostra o erro generico acionavel definido no PRD e permite uma nova busca.
- Referencia: PRD, RF-07, RNF-03 e secao 6.

## 14. Validar o fluxo completo

- [ ] Executar testes ou verificacoes para sucesso, busca vazia, cidade inexistente, resposta meteorologica incompleta, falhas de API/rede, busca concorrente e todos os grupos de weather code.
- Criterio de aprovacao: os cenarios recomendados no PRD passam sem regressao e o resultado bem-sucedido nao contem campos parciais ou textos tecnicos indevidos.
- Referencia: PRD, secao 9 e Definicao de pronto.

## 15. Fazer a verificacao final de entrega

- [ ] Revisar o fluxo manual em desktop e mobile e executar o build de producao.
- Criterio de aprovacao: `npm run build` termina sem erros; o fluxo de vazio, loading, sucesso e erro funciona; nao ha rolagem horizontal em viewport mobile; todos os criterios de aceitacao e a Definicao de pronto do PRD estao atendidos.
- Referencia: PRD, secao 8 e Definicao de pronto.
