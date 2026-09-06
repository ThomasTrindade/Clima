const WEATHER_DESCRIPTIONS: Record<number, string> = {
  0: 'Ceu limpo',
  1: 'Parcialmente limpo',
  2: 'parcialmente nublado',
  3: 'nublado',
  45: 'Nevoeiro',
  48: 'Neblina com geada',
  51: 'Garoa fraca',
  53: 'Garoa moderada',
  55: 'Garoa intensa',
  56: 'Garoa congelante leve',
  57: 'Garoa congelante forte',
  61: 'Chuva fraca',
  63: 'Chuva moderada',
  65: 'Chuva intensa',
  66: 'Chuva congelante fraca',
  67: 'Chuva congelante intensa',
  71: 'Neve fraca',
  73: 'Neve moderada',
  75: 'Neve intensa',
  77: 'Graos de neve',
  80: 'Pancadas de chuva: fraca',
  81: 'Pancadas de chuva: moderada',
  82: 'Pancadas de chuva: intensa',
  85: 'Pancadas de neve: fraca',
  86: 'Pancadas de neve: intensa',
  95: 'Tempestade fraca',
  96: 'Tempestade com granizo fraca',
  99: 'Tempestade com granizo intensa',
}

export function describeWeatherCode(code: number): string {
  return WEATHER_DESCRIPTIONS[code] ?? 'Condicao indisponivel'
}
