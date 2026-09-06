import './style.css'
import { renderWeatherApp } from './ui/weatherView.ts'

const app = document.querySelector<HTMLDivElement>('#app')

if (app) {
  renderWeatherApp(app)
}
