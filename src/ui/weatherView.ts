export function renderWeatherApp(container: HTMLElement): void {
  container.innerHTML = `
    <main class="weather-app">
      <h1>Clima</h1>
      <p>Pesquise uma cidade para consultar o clima atual.</p>
    </main>
  `
}
