import type {
	City,
	CurrentWeather,
	CurrentWeatherUnits,
	ForecastResponse,
	GeocodingResponse,
	WeatherResult,
	WeatherLookupResult,
} from '../types/weather.ts'
import { describeWeatherCode } from '../weather/weatherCode.ts'

export const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search'
export const FORECAST_API_URL = 'https://api.open-meteo.com/v1/forecast'
export const REQUEST_TIMEOUT_MS = 10_000

const CURRENT_FIELDS = [
	'precipitation_probability',
	'temperature_2m',
	'relative_humidity_2m',
	'is_day',
	'apparent_temperature',
	'wind_speed_10m',
	'wind_direction_10m',
	'precipitation',
	'weather_code',
].join(',')

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null
}

function isNonEmptyString(value: unknown): value is string {
	return typeof value === 'string' && value.trim().length > 0
}

function isFiniteNumber(value: unknown): value is number {
	return typeof value === 'number' && Number.isFinite(value)
}

function isGeocodingResponse(value: unknown): value is GeocodingResponse {
	if (!isRecord(value) || !Array.isArray(value.results)) {
		return false
	}

	return value.results.every((result) => {
		if (!isRecord(result)) {
			return false
		}

		return (
			isNonEmptyString(result.name) &&
			isFiniteNumber(result.latitude) &&
			isFiniteNumber(result.longitude) &&
			isNonEmptyString(result.country_code) &&
			isNonEmptyString(result.timezone)
		)
	})
}

function isCurrentWeather(value: unknown): value is CurrentWeather {
	if (!isRecord(value)) {
		return false
	}

	return (
		isNonEmptyString(value.time) &&
		isFiniteNumber(value.temperature_2m) &&
		isFiniteNumber(value.relative_humidity_2m) &&
		isFiniteNumber(value.apparent_temperature) &&
		(value.is_day === 0 || value.is_day === 1) &&
		isFiniteNumber(value.wind_speed_10m) &&
		isFiniteNumber(value.wind_direction_10m) &&
		isFiniteNumber(value.precipitation_probability) &&
		isFiniteNumber(value.precipitation) &&
		isFiniteNumber(value.weather_code)
	)
}

function isCurrentWeatherUnits(value: unknown): value is CurrentWeatherUnits {
	if (!isRecord(value)) {
		return false
	}

	const requiredFields = [
		'temperature_2m',
		'relative_humidity_2m',
		'apparent_temperature',
		'wind_speed_10m',
		'wind_direction_10m',
		'precipitation_probability',
		'precipitation',
	]

	return (
		(isNonEmptyString(value.is_day) || value.is_day === '') &&
		(value.weather_code === '' || isNonEmptyString(value.weather_code)) &&
		requiredFields.every((field) => isNonEmptyString(value[field]))
	)
}

function isForecastResponse(value: unknown): value is ForecastResponse {
	return (
		isRecord(value) &&
		isCurrentWeather(value.current) &&
		isCurrentWeatherUnits(value.current_units)
	)
}

async function fetchJson(url: URL): Promise<unknown | null> {
	const controller = new AbortController()
	const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

	try {
		const response = await fetch(url, { signal: controller.signal })

		if (!response.ok) {
			return null
		}

		return await response.json()
	} catch {
		return null
	} finally {
		clearTimeout(timeoutId)
	}
}

export async function searchCity(name: string): Promise<City | null> {
	const normalizedName = typeof name === 'string' ? name.trim() : ''

	if (!normalizedName) {
		return null
	}

	const url = new URL(GEOCODING_API_URL)
	url.search = new URLSearchParams({
		name: normalizedName,
		count: '1',
		language: 'pt',
		format: 'json',
	}).toString()

	const data = await fetchJson(url)

	if (!isGeocodingResponse(data)) {
		return null
	}

	const result = data.results?.[0]

	if (!result) {
		return null
	}

	return {
		name: result.name,
		latitude: result.latitude,
		longitude: result.longitude,
		countryCode: result.country_code,
		timezone: result.timezone,
	}
}

export async function fetchCurrentWeather(location: City): Promise<CurrentWeather | null> {
	if (
		!isNonEmptyString(location.name) ||
		!isFiniteNumber(location.latitude) ||
		!isFiniteNumber(location.longitude) ||
		!isNonEmptyString(location.countryCode) ||
		!isNonEmptyString(location.timezone)
	) {
		return null
	}

	const url = new URL(FORECAST_API_URL)
	url.search = new URLSearchParams({
		latitude: String(location.latitude),
		longitude: String(location.longitude),
		current: CURRENT_FIELDS,
		timezone: location.timezone,
	}).toString()

	const data = await fetchJson(url)

	if (!isForecastResponse(data)) {
		return null
	}

	return data.current ?? null
}

export async function getWeatherByCity(name: string): Promise<WeatherResult | null> {
	const result = await getWeatherByCityResult(name)

	return result.ok ? result.weather : null
}

type CityLookupResult = {
	city: City | null
	failed: boolean
}

async function searchCityResult(name: string): Promise<CityLookupResult> {
	const normalizedName = typeof name === 'string' ? name.trim() : ''

	if (!normalizedName) {
		return { city: null, failed: false }
	}

	const url = new URL(GEOCODING_API_URL)
	url.search = new URLSearchParams({
		name: normalizedName,
		count: '1',
		language: 'pt',
		format: 'json',
	}).toString()

	const data = await fetchJson(url)

	if (!isGeocodingResponse(data)) {
		return { city: null, failed: true }
	}

	const result = data.results?.[0]

	if (!result) {
		return { city: null, failed: false }
	}

	return {
		city: {
			name: result.name,
			latitude: result.latitude,
			longitude: result.longitude,
			countryCode: result.country_code,
			timezone: result.timezone,
		},
		failed: false,
	}
}

type ForecastLookupResult = {
	current: CurrentWeather | null
	units: CurrentWeatherUnits | null
	failed: boolean
}

async function fetchForecastResult(location: City): Promise<ForecastLookupResult> {
	if (
		!isNonEmptyString(location.name) ||
		!isFiniteNumber(location.latitude) ||
		!isFiniteNumber(location.longitude) ||
		!isNonEmptyString(location.countryCode) ||
		!isNonEmptyString(location.timezone)
	) {
		return { current: null, units: null, failed: false }
	}

	const url = new URL(FORECAST_API_URL)
	url.search = new URLSearchParams({
		latitude: String(location.latitude),
		longitude: String(location.longitude),
		current: CURRENT_FIELDS,
		timezone: location.timezone,
	}).toString()

	const data = await fetchJson(url)

	if (!isForecastResponse(data)) {
		return { current: null, units: null, failed: true }
	}

	return { current: data.current ?? null, units: data.current_units ?? null, failed: false }
}

export async function getWeatherByCityResult(name: string): Promise<WeatherLookupResult> {
	const cityResult = await searchCityResult(name)

	if (cityResult.failed) {
		return { ok: false, reason: 'generic' }
	}

	const city = cityResult.city

	if (!city) {
		return { ok: false, reason: 'not-found' }
	}

	const forecastResult = await fetchForecastResult(city)

	if (forecastResult.failed) {
		return { ok: false, reason: 'weather-unavailable' }
	}

	const current = forecastResult.current
	const units = forecastResult.units

	if (!current || !units) {
		return { ok: false, reason: 'weather-unavailable' }
	}

	return {
		ok: true,
		weather: {
			city: city.name,
			countryCode: city.countryCode,
			timezone: city.timezone,
			dateTime: current.time,
			isDay: current.is_day === 1,
			temperature: current.temperature_2m,
			humidity: current.relative_humidity_2m,
			apparentTemperature: current.apparent_temperature,
			precipitationProbability: current.precipitation_probability,
			windSpeed: current.wind_speed_10m,
			windDirection: current.wind_direction_10m,
			precipitation: current.precipitation,
			weatherCode: current.weather_code,
			condition: describeWeatherCode(current.weather_code),
			units: {
				temperature: units.temperature_2m,
				humidity: units.relative_humidity_2m,
				apparentTemperature: units.apparent_temperature,
				precipitationProbability: units.precipitation_probability,
				precipitation: units.precipitation,
				windSpeed: units.wind_speed_10m,
				windDirection: units.wind_direction_10m,
			},
		},
	}
}
