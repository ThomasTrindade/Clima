import type { WeatherLookupFailureReason, WeatherResult } from '../types/weather.ts'

export interface WeatherViewElements {
  form: HTMLFormElement
  searchInput: HTMLInputElement
  searchButton: HTMLButtonElement
  status: HTMLElement
  result: HTMLElement
}

function setStatus(elements: WeatherViewElements, state: string, title: string, message: string): void {
  elements.status.dataset.state = state
  elements.status.querySelector<HTMLElement>('.status-title')!.textContent = title
  elements.status.querySelector<HTMLElement>('.status-message')!.textContent = message
  elements.status.hidden = false
  elements.result.hidden = true
}

function setField(elements: WeatherViewElements, field: string, value: string): void {
  const target = elements.result.querySelector<HTMLElement>(`[data-field="${field}"]`)

  if (target) {
    target.textContent = value
  }
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value)
}

function formatDateTime(dateTime: string): string {
  const [date, time] = dateTime.split('T')
  const [year, month, day] = date.split('-')

  return `${day}/${month}/${year} às ${time}`
}

export function renderEmptyState(elements: WeatherViewElements): void {
  setStatus(elements, 'empty', 'Consulte o clima de uma cidade', 'Pesquise uma cidade para consultar o clima atual.')
}

export function renderLoadingState(elements: WeatherViewElements): void {
  setStatus(elements, 'loading', 'Buscando clima...', 'Aguarde enquanto consultamos a cidade e as condições atuais.')
}

export function renderErrorState(elements: WeatherViewElements, reason: WeatherLookupFailureReason): void {
  const messages: Record<WeatherLookupFailureReason, [string, string]> = {
    'not-found': ['Cidade não encontrada', 'Confira o nome informado e tente novamente.'],
    'weather-unavailable': ['Clima indisponível', 'Não foi possível carregar o clima desta cidade. Tente novamente.'],
    generic: ['Não foi possível consultar o clima', 'Verifique sua conexão e tente novamente.'],
  }
  const [title, message] = messages[reason]

  setStatus(elements, 'error', title, message)
}

export function renderWeatherResult(elements: WeatherViewElements, weather: WeatherResult): void {
  setField(elements, 'city', weather.city)
  setField(elements, 'country', weather.countryCode.toUpperCase())
  setField(elements, 'temperature', formatNumber(weather.temperature))
  setField(elements, 'temperature-unit', weather.units.temperature)
  setField(elements, 'condition', weather.condition)
  setField(elements, 'day-state', weather.isDay ? 'Dia' : 'Noite')
  setField(elements, 'date', formatDateTime(weather.dateTime))
  setField(elements, 'humidity', formatNumber(weather.humidity))
  setField(elements, 'humidity-unit', weather.units.humidity)
  setField(elements, 'apparent-temperature', formatNumber(weather.apparentTemperature))
  setField(elements, 'apparent-temperature-unit', weather.units.apparentTemperature)
  setField(elements, 'precipitation', formatNumber(weather.precipitation))
  setField(elements, 'precipitation-unit', weather.units.precipitation)
  setField(elements, 'precipitation-probability', formatNumber(weather.precipitationProbability))
  setField(elements, 'precipitation-probability-unit', weather.units.precipitationProbability)
  setField(elements, 'wind-speed', formatNumber(weather.windSpeed))
  setField(elements, 'wind-speed-unit', weather.units.windSpeed)
  setField(elements, 'wind-direction', formatNumber(weather.windDirection))
  setField(elements, 'wind-direction-unit', weather.units.windDirection)

  elements.status.hidden = true
  elements.result.hidden = false
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
