export type City = {
  name: string
  latitude: number
  longitude: number
  countryCode: string
  timezone: string
}

export type GeocodedCity = {
  name: string
  latitude: number
  longitude: number
  country_code: string
  timezone: string
}

export type GeocodingResponse = {
  results?: GeocodedCity[] | null
}

export type CurrentWeatherUnits = {
  temperature_2m: string
  relative_humidity_2m: string
  apparent_temperature: string
  is_day: string
  wind_speed_10m: string
  wind_direction_10m: string
  precipitation_probability: string
  precipitation: string
  weather_code: string
}

export type CurrentWeather = {
  time: string
  temperature_2m: number
  relative_humidity_2m: number
  apparent_temperature: number
  is_day: number
  wind_speed_10m: number
  wind_direction_10m: number
  precipitation_probability: number
  precipitation: number
  weather_code: number
}

export type ForecastResponse = {
  current?: CurrentWeather | null
  current_units?: CurrentWeatherUnits | null
}

export type WeatherResult = {
  city: string
  countryCode: string
  timezone: string
  dateTime: string
  isDay: boolean
  temperature: number
  humidity: number
  apparentTemperature: number
  precipitationProbability: number
  windSpeed: number
  windDirection: number
  precipitation: number
  weatherCode: number
  condition: string
  units: WeatherResultUnits
}

export type WeatherResultUnits = {
  temperature: string
  humidity: string
  apparentTemperature: string
  precipitationProbability: string
  precipitation: string
  windSpeed: string
  windDirection: string
}

export type WeatherLookupFailureReason = 'not-found' | 'weather-unavailable' | 'generic'

export type WeatherLookupResult =
  | { ok: true; weather: WeatherResult }
  | { ok: false; reason: WeatherLookupFailureReason }
