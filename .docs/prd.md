# PRD - Clima

## 1. Visao geral

O **Clima** e uma aplicacao web responsiva que permite pesquisar uma cidade e consultar suas condicoes meteorologicas atuais. A experiencia deve ser direta: o usuario informa uma cidade, aguarda uma unica operacao de pesquisa (composta internamente por duas requisicoes) e visualiza um resumo legivel do clima local.

A primeira versao sera implementada com Vite, TypeScript e JavaScript/DOM vanilla, sem framework de interface.

## 2. Objetivo

Permitir que uma pessoa consulte rapidamente as principais informacoes do clima atual de qualquer cidade atendida pela API Open-Meteo.

### Metas

- Encontrar uma cidade pelo nome.
- Buscar sua latitude, longitude e timezone.
- Consultar as condicoes meteorologicas atuais dessa localizacao.
- Apresentar temperatura, sensacao termica, umidade, precipitacao, vento e situacao do ceu.
- Comunicar claramente os estados vazio, carregando e falha.
- Oferecer uma experiencia adequada para desktop e dispositivos moveis.

### Fora de escopo da primeira versao

- Previsao por hora ou por varios dias.
- Favoritos, historico ou persistencia de pesquisas.
- Geolocalizacao do dispositivo.
- Autenticacao e contas de usuario.
- Graficos, mapas ou alertas meteorologicos.
- Escolha entre varias cidades quando houver resultados semelhantes: a busca usa o primeiro resultado retornado (`count=1`).

## 3. Publico e caso principal de uso

Uma pessoa quer saber rapidamente como esta o clima em uma cidade, sem navegar por varias telas.

**Fluxo principal:**

1. O usuario acessa a aplicacao e encontra o campo de busca no topo.
2. Digita o nome de uma cidade.
3. Envia a busca pelo botao ou pela tecla Enter.
4. A aplicacao exibe um estado de carregamento enquanto resolve a cidade e consulta o clima.
5. Ao concluir, mostra o painel com a cidade, o estado atual e as metricas meteorologicas.

## 4. Requisitos funcionais

### RF-01 - Busca de cidade

- Deve existir um campo de texto centralizado na area superior.
- O campo deve ter rotulo acessivel, placeholder em portugues e foco visivel.
- A busca deve ser acionada por um botao e pela tecla Enter.
- Espacos no inicio e no fim devem ser removidos antes da requisicao.
- Uma busca vazia nao deve chamar a API; deve manter ou exibir o estado vazio com uma orientacao clara.

### RF-02 - Geocodificacao

A aplicacao deve consultar:

```text
https://geocoding-api.open-meteo.com/v1/search?name={NOME_DA_CIDADE}&count=1&language=pt&format=json
```

Da resposta, deve usar `name`, `latitude`, `longitude`, `country_code` e `timezone`.

Se a resposta nao tiver `results` ou nao contiver um resultado valido, o fluxo deve terminar em estado de erro sem resultado, sem tentar a segunda requisicao.

### RF-03 - Consulta meteorologica

Com os dados da cidade, a aplicacao deve consultar:

```text
https://api.open-meteo.com/v1/forecast?latitude={LATITUDE}&longitude={LONGITUDE}&current=precipitation_probability,temperature_2m,relative_humidity_2m,is_day,apparent_temperature,wind_speed_10m,wind_direction_10m,precipitation,weather_code&timezone={TIMEZONE}
```

A resposta deve conter `current` e `current_units`. Os campos obrigatorios sao:

- `temperature_2m`
- `relative_humidity_2m`
- `apparent_temperature`
- `is_day`
- `wind_speed_10m`
- `wind_direction_10m`
- `precipitation_probability`
- `wind_direction_10m`
- `weather_code`

A ausencia de `current` ou de qualquer campo obrigatorio deve ser tratada como falha de consulta, sem renderizar dados parciais.

### RF-04 - Estado de carregamento

- A busca deve exibir um unico estado de carregamento para as duas requisicoes.
- Enquanto carrega, o formulario deve impedir buscas concorrentes ou cancelar a requisicao anterior.
- O conteudo anterior nao deve ser apresentado como se fosse o resultado da nova busca.
- O indicador deve possuir texto acessivel, como `Buscando clima...`, alem de uma indicacao visual.

### RF-05 - Painel de resumo

Depois de uma busca bem-sucedida, o painel deve exibir na lateral esquerda:

- Temperatura atual em destaque.
- Nome da cidade.
- Codigo do pais.
- Data atual no timezone retornado pela API.
- Indicacao `Dia` ou `Noite`, usando `is_day`.
- Descricao em portugues do `weather_code`.

A area principal deve exibir:

- Umidade relativa.
- Temperatura aparente.
- Probabilidade de precipitacao.
- Velocidade do vento.
- Direcao do vento.

Quando disponivel e pertinente ao resumo, a precipitacao atual tambem pode ser exibida como dado complementar.

### RF-06 - Interpretacao do weather code

O codigo WMO deve ser convertido para uma descricao em portugues usando o mapeamento abaixo:

| Codigo | Descricao |
| --- | --- |
| 0 | Ceu limpo |
| 1, 2, 3 | Parcialmente limpo, parcialmente nublado ou nublado |
| 45, 48 | Nevoeiro |
| 51, 53, 55 | Garoa fraca, moderada ou intensa |
| 56, 57 | Garoa congelante |
| 61, 63, 65 | Chuva fraca, moderada ou intensa |
| 66, 67 | Chuva congelante |
| 71, 73, 75 | Neve fraca, moderada ou intensa |
| 77 | Graos de neve |
| 80, 81, 82 | Pancadas de chuva |
| 85, 86 | Pancadas de neve |
| 95 | Tempestade fraca ou moderada |
| 96, 99 | Tempestade com granizo |

Para um codigo nao mapeado, a interface deve exibir `Condicao indisponivel` em vez de quebrar.

### RF-07 - Estados de erro e vazio

- **Inicial:** mostrar uma empty state convidando o usuario a pesquisar uma cidade.
- **Cidade nao encontrada:** informar que nenhuma cidade foi encontrada e preservar o campo para nova tentativa.
- **Clima indisponivel:** informar que nao foi possivel carregar o clima daquela cidade.
- **Falha de rede ou API:** exibir mensagem generica, sem expor detalhes tecnicos, com acao clara para tentar novamente.
- O erro nao deve deixar um painel incompleto ou dados antigos confundindo o usuario.

## 5. Requisitos nao funcionais

### RNF-01 - Responsividade

- Em desktop, o conteudo principal deve ter largura maxima de 800px e ser centralizado.
- Em telas largas, o painel deve usar uma composicao de sidebar esquerda e area principal.
- Em telas pequenas, as areas devem se reorganizar verticalmente sem overflow horizontal.
- O campo de busca deve continuar utilizavel com teclado e toque.

### RNF-02 - Acessibilidade

- Usar HTML semantico: `main`, `form`, `label`, `section` e headings em hierarquia correta.
- Todos os controles devem funcionar por teclado.
- Mensagens de carregamento e erro devem ser anunciadas com `aria-live`.
- Contraste entre texto e fundo deve atender WCAG AA.
- Nao depender apenas de cor para comunicar dia/noite, erro ou condicao meteorologica.
- Respeitar `prefers-reduced-motion`.

### RNF-03 - Performance e resiliencia

- Fazer apenas as duas requisicoes necessarias por busca.
- Codificar com seguranca o nome da cidade e o timezone nos parametros da URL.
- Validar a estrutura da resposta antes de renderizar.
- Tratar timeout, status HTTP nao bem-sucedido e falhas de parsing JSON.
- Evitar condicoes de corrida: uma resposta antiga nao pode substituir o resultado de uma busca mais recente.

### RNF-04 - Privacidade

A aplicacao nao deve coletar, armazenar ou enviar dados pessoais. O nome da cidade e enviado somente aos endpoints da Open-Meteo para executar a busca.

## 6. Arquitetura tecnica

### Stack

- Vite.
- TypeScript.
- DOM vanilla.
- CSS escrito no projeto, sem framework visual.
- API publica Open-Meteo.

### Organizacao sugerida

```text
src/
  main.ts                 # Inicializacao, eventos e composicao da tela
  style.css               # Tokens visuais e layout responsivo
  api/openMeteo.ts        # Funcoes de geocodificacao e clima
  types/weather.ts        # Tipos das respostas e dados normalizados
  weather/weatherCode.ts  # Mapeamento WMO para texto em portugues
  ui/weatherView.ts       # Renderizacao dos estados e do resultado
```

A organizacao pode ser ajustada se o projeto preferir menos arquivos, mas a regra de dependência deve permanecer: a interface nao faz `fetch` diretamente. Todas as requisicoes passam pelo modulo de Open-Meteo.

### Contratos de dados

As funcoes da API devem receber parametros obrigatorios e validar sua presenca antes de requisitar. Quando faltarem parametros, retornam uma falha controlada, sem requisicao.

Sugestao de funcoes:

```ts
searchCity(name: string): Promise<City | null>
fetchCurrentWeather(location: City): Promise<CurrentWeather | null>
getWeatherByCity(name: string): Promise<WeatherResult | null>
```

A camada de API deve normalizar apenas os campos necessarios para a interface e manter tipos explicitos para valores numericos, booleanos e strings. A camada de UI decide como formatar textos e unidades.

### Formato de URL e requisicoes

- Usar `URL` e `URLSearchParams` para montar os endpoints.
- Usar `encodeURIComponent` ou equivalente por meio das APIs estruturadas de URL.
- Verificar `response.ok` antes de chamar `response.json()`.
- Usar `AbortController` para cancelar a busca anterior quando uma nova for iniciada, se essa estrategia for adotada na implementacao.

### Data, hora e unidades

- A data exibida deve ser derivada do campo `current.time` ou formatada com o timezone recebido pela API, evitando o timezone local do navegador.
- As unidades devem ser exibidas conforme `current_units` retornado pela API.
- Valores numericos devem ter formatacao curta e consistente, sem alterar silenciosamente seu significado.
- `is_day` deve ser interpretado como `1` para dia e `0` para noite.
- `wind_direction_10m` deve ser mostrado em graus; a conversao para ponto cardeal e opcional, desde que os graus continuem visiveis.

## 7. Diretrizes visuais e de UX

### Direcao visual

Interface meteorologica limpa, precisa e acolhedora, com contraste entre um fundo cinza escuro e um painel claro. A tela deve priorizar leitura rapida dos numeros e manter uma hierarquia visual evidente.

### Composicao

- Fundo geral cinza escuro cobrindo a viewport.
- Area superior sem card ou background proprio, contendo somente o formulario de busca centralizado.
- Painel principal branco, centralizado, com largura maxima de 800px e bordas bem arredondadas.
- Sidebar esquerda com a identidade da localizacao e temperatura em destaque.
- Area principal com metricas organizadas em uma grade de leitura simples.
- Cards de metricas podem ser usados para itens repetidos, mas nao devem criar camadas excessivas de cards.

### Hierarquia

- Temperatura atual e nome da cidade sao os elementos mais proeminentes.
- As metricas devem ter valor grande, unidade menor e rotulo claro.
- Weather code deve aparecer como texto humano, nunca apenas como numero.
- O codigo do pais deve ser apresentado em letras maiusculas.
- Icones, caso usados, devem complementar o texto e ter `aria-hidden=true` quando decorativos.

### Estados visuais

- Empty state: painel leve com convite para pesquisar, sem dados ficticios.
- Loading: indicador discreto e bloqueio visual do formulario, sem layout saltando.
- Sucesso: painel completo com destaque para temperatura.
- Erro: mensagem curta, contrastante e acionavel, preservando a possibilidade de nova busca.

### Responsividade

- Desktop: formulario no topo e painel em duas colunas.
- Mobile: formulario ocupa a largura disponivel; sidebar vem antes da grade de metricas; valores nao devem ser cortados.
- Usar dimensoes estaveis para botoes, campos, espacos e grade, evitando mudancas de layout durante carregamento.

## 8. Criterios de aceitacao

1. Ao pesquisar uma cidade valida, a aplicacao executa geocodificacao e consulta meteorologica, exibindo os dados atuais.
2. Uma pesquisa vazia nao executa requisicoes.
3. Uma cidade inexistente exibe o estado de cidade nao encontrada.
4. Falha na consulta meteorologica exibe erro sem painel parcial.
5. Durante as duas requisicoes, o usuario ve um unico estado de carregamento.
6. A temperatura, cidade, codigo do pais, data, dia/noite e condicao aparecem na sidebar.
7. Umidade, sensacao termica, probabilidade de precipitacao e vento aparecem na area principal.
8. O weather code e convertido para uma descricao em portugues.
9. A interface funciona em viewport mobile sem rolagem horizontal.
10. O fluxo de busca funciona por teclado e apresenta foco visivel.
11. `npm run build` termina sem erros de TypeScript ou Vite.

## 9. Testes recomendados

### Testes funcionais

- Busca com cidade valida.
- Busca com campo vazio ou apenas espacos.
- Resposta de geocodificacao sem resultados.
- Resposta meteorologica incompleta.
- Erro HTTP e erro de rede.
- Nova busca antes da anterior terminar.
- Todos os grupos de `weather_code`, incluindo codigo desconhecido.

### Testes manuais de UX

- Desktop em largura aproximada de 1280px.
- Mobile em largura aproximada de 375px.
- Navegacao completa apenas com teclado.
- Leitura das mensagens com tecnologia assistiva, quando disponivel.
- Preferencia de reducao de movimento ativada.

## 10. Dependencias e riscos

- A aplicacao depende da disponibilidade e dos limites da API publica Open-Meteo.
- A qualidade do resultado depende da cidade retornada pela geocodificacao; usar apenas o primeiro resultado pode produzir uma localizacao ambigua.
- O browser pode bloquear requisicoes caso a API altere suas politicas de CORS.
- O formato de resposta deve ser validado para evitar falhas quando a API evoluir.

## 11. Definicao de pronto

A funcionalidade esta pronta quando o fluxo completo de busca funciona com os estados de sucesso, vazio, carregamento e erro; todos os campos obrigatorios sao apresentados corretamente; a interface respeita a composicao visual definida; e `npm run build` passa sem erros.
