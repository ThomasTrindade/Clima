import type {
	City,
	CurrentWeather,
	CurrentWeatherUnits,
	ForecastResponse,
	GeocodingResponse,
	WeatherResult,
} from '../types/weather.ts'
import { describeWeatherCode } from '../weather/weatherCode.ts'

export const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search'
export const FORECAST_API_URL = 'https://api.open-meteo.com/v1/forecast'

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

	return [
		'temperature_2m',
		'relative_humidity_2m',
		'apparent_temperature',
		'is_day',
		'wind_speed_10m',
		'wind_direction_10m',
		'precipitation_probability',
		'precipitation',
		'weather_code',
	].every((field) => isNonEmptyString(value[field]))
}

function isForecastResponse(value: unknown): value is ForecastResponse {
	return (
		isRecord(value) &&
		isCurrentWeather(value.current) &&
		isCurrentWeatherUnits(value.current_units)
	)
}

export async function searchCity(name: string): Promise<City | null> {
	const normalizedName = name.trim()

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

	try {
		const response = await fetch(url)

		if (!response.ok) {
			return null
		}

		const data: unknown = await response.json()

		if (!isGeocodingResponse(data)) {
			return null
		}

		const results = data.results ?? []

		if (results.length === 0) {
			return null
		}

		const result = results[0]

		return {
			name: result.name,
			latitude: result.latitude,
			longitude: result.longitude,
			countryCode: result.country_code,
			timezone: result.timezone,
		}
	} catch {
		return null
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

	try {
		const response = await fetch(url)

		if (!response.ok) {
			return null
		}

		const data: unknown = await response.json()

		if (!isForecastResponse(data)) {
			return null
		}

		return data.current ?? null
	} catch {
		return null
	}
}

export async function getWeatherByCity(name: string): Promise<WeatherResult | null> {
	const city = await searchCity(name)

	if (!city) {
		return null
	}

	const current = await fetchCurrentWeather(city)

	if (!current) {
		return null
	}

	return {
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
	}
}
