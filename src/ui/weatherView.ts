export interface WeatherViewElements {
  form: HTMLFormElement
  searchInput: HTMLInputElement
  searchButton: HTMLButtonElement
  status: HTMLElement
  result: HTMLElement
}

export function renderWeatherApp(container: HTMLElement): WeatherViewElements {
  container.innerHTML = `
    <main class="weather-app">
      <header class="app-header">
        <p class="eyebrow">Clima atual</p>
        <h1>Clima</h1>
        <form class="search-form" novalidate>
          <label for="city-search">Pesquise uma cidade</label>
          <div class="search-controls">
            <input
              id="city-search"
              name="city"
              type="search"
              placeholder="Ex.: São Paulo"
              autocomplete="address-level2"
              required
            />
            <button type="submit">Buscar clima</button>
          </div>
        </form>
      </header>

      <section class="weather-content" aria-live="polite" aria-atomic="true">
        <div class="status-panel" data-state="empty">
          <h2 class="status-title">Consulte o clima de uma cidade</h2>
          <p class="status-message">Pesquise uma cidade para consultar o clima atual.</p>
        </div>

        <section class="weather-result" aria-labelledby="result-title" hidden>
          <aside class="weather-summary">
            <p class="eyebrow">Agora em</p>
            <h2 id="result-title" data-field="city"></h2>
            <p class="country-code" data-field="country"></p>
            <p class="temperature"><span data-field="temperature"></span><span data-field="temperature-unit"></span></p>
            <p class="condition" data-field="condition"></p>
            <p class="day-state" data-field="day-state"></p>
            <time class="weather-date" data-field="date"></time>
          </aside>

          <section class="metrics" aria-labelledby="metrics-title">
            <h2 id="metrics-title">Detalhes do clima</h2>
            <dl class="metrics-grid">
              <div class="metric"><dt>Umidade</dt><dd><span data-field="humidity"></span> <span data-field="humidity-unit"></span></dd></div>
              <div class="metric"><dt>Sensação</dt><dd><span data-field="apparent-temperature"></span> <span data-field="apparent-temperature-unit"></span></dd></div>
              <div class="metric"><dt>Precipitação</dt><dd><span data-field="precipitation"></span> <span data-field="precipitation-unit"></span></dd></div>
              <div class="metric"><dt>Probabilidade de chuva</dt><dd><span data-field="precipitation-probability"></span> <span data-field="precipitation-probability-unit"></span></dd></div>
              <div class="metric"><dt>Vento</dt><dd><span data-field="wind-speed"></span> <span data-field="wind-speed-unit"></span></dd></div>
              <div class="metric"><dt>Direção do vento</dt><dd><span data-field="wind-direction"></span> <span data-field="wind-direction-unit"></span></dd></div>
            </dl>
          </section>
        </section>
      </section>
    </main>
  `

  const form = container.querySelector<HTMLFormElement>('.search-form')
  const searchInput = container.querySelector<HTMLInputElement>('#city-search')
  const searchButton = container.querySelector<HTMLButtonElement>('.search-form button')
  const status = container.querySelector<HTMLElement>('.status-panel')
  const result = container.querySelector<HTMLElement>('.weather-result')

  if (!form || !searchInput || !searchButton || !status || !result) {
    throw new Error('Não foi possível montar a interface do clima.')
  }

  return { form, searchInput, searchButton, status, result }
}
