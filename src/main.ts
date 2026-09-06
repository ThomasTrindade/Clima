import './style.css'
import { getWeatherByCityResult } from './api/openMeteo.ts'
import { renderWeatherApp } from './ui/weatherView.ts'
import {
  renderErrorState,
  renderLoadingState,
  renderWeatherResult,
} from './ui/weatherView.ts'

const app = document.querySelector<HTMLDivElement>('#app')

if (app) {
  const elements = renderWeatherApp(app)
  let requestId = 0

  elements.form.addEventListener('submit', async (event) => {
    event.preventDefault()
    const city = elements.searchInput.value.trim()

    if (!city || elements.form.dataset.loading === 'true') {
      if (!city) {
        elements.searchInput.focus()
      }
      return
    }

    const currentRequestId = ++requestId
    elements.form.dataset.loading = 'true'
    elements.form.setAttribute('aria-busy', 'true')
    elements.result.closest<HTMLElement>('.weather-content')?.setAttribute('aria-busy', 'true')
    elements.searchInput.disabled = true
    elements.searchButton.disabled = true
    renderLoadingState(elements)

    const result = await getWeatherByCityResult(city)

    if (currentRequestId !== requestId) {
      return
    }

    elements.form.dataset.loading = 'false'
    elements.form.setAttribute('aria-busy', 'false')
    elements.result.closest<HTMLElement>('.weather-content')?.setAttribute('aria-busy', 'false')
    elements.searchInput.disabled = false
    elements.searchButton.disabled = false

    if (result.ok) {
      renderWeatherResult(elements, result.weather)
    } else {
      renderErrorState(elements, result.reason)
    }
  })
}
