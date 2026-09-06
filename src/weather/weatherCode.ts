const WEATHER_DESCRIPTIONS: Record<number, string> = {
  0: 'Ceu limpo',
  1: 'Parcialmente limpo, parcialmente nublado ou nublado',
  2: 'Parcialmente limpo, parcialmente nublado ou nublado',
  3: 'Parcialmente limpo, parcialmente nublado ou nublado',
  45: 'Nevoeiro',
  48: 'Nevoeiro',
  51: 'Garoa fraca, moderada ou intensa',
  53: 'Garoa fraca, moderada ou intensa',
  55: 'Garoa fraca, moderada ou intensa',
  56: 'Garoa congelante',
  57: 'Garoa congelante',
  61: 'Chuva fraca, moderada ou intensa',
  63: 'Chuva fraca, moderada ou intensa',
  65: 'Chuva fraca, moderada ou intensa',
  66: 'Chuva congelante',
  67: 'Chuva congelante',
  71: 'Neve fraca, moderada ou intensa',
  73: 'Neve fraca, moderada ou intensa',
  75: 'Neve fraca, moderada ou intensa',
  77: 'Graos de neve',
  80: 'Pancadas de chuva',
  81: 'Pancadas de chuva',
  82: 'Pancadas de chuva',
  85: 'Pancadas de neve',
  86: 'Pancadas de neve',
  95: 'Tempestade fraca ou moderada',
  96: 'Tempestade com granizo',
  99: 'Tempestade com granizo',
}

export function describeWeatherCode(code: number): string {
  return WEATHER_DESCRIPTIONS[code] ?? 'Condicao indisponivel'
}
