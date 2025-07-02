import { WeatherInfo } from '@/types';

const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || '';

export async function getCurrentWeather(lat: number, lon: number): Promise<WeatherInfo | null> {
  console.log('Weather API Key:', OPENWEATHER_API_KEY ? 'Found' : 'Not found');
  
  if (!OPENWEATHER_API_KEY) {
    console.warn('OpenWeather API key not found. Please add NEXT_PUBLIC_OPENWEATHER_API_KEY to .env.local');
    return null;
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=kr`;
    console.log('Fetching weather from:', url.replace(OPENWEATHER_API_KEY, '[API_KEY]'));
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Weather API error:', response.status, errorText);
      throw new Error(`Weather API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('Weather data received:', data);
    
    return {
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      feelsLike: Math.round(data.main.feels_like),
    };
  } catch (error) {
    console.error('Failed to fetch weather:', error);
    return null;
  }
}

export async function getLocationAndWeather(): Promise<WeatherInfo | null> {
  if (typeof window === 'undefined') {
    console.log('Running on server side, skipping weather fetch');
    return null;
  }

  try {
    console.log('Requesting location permission...');
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 10000,
        enableHighAccuracy: false,
      });
    });

    console.log('Location obtained:', position.coords);
    return await getCurrentWeather(position.coords.latitude, position.coords.longitude);
  } catch (error) {
    console.error('Failed to get location:', error);
    return null;
  }
}

export function getWeatherIcon(iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
} 