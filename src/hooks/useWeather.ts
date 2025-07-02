'use client';

import { useState, useEffect } from 'react';
import { WeatherInfo } from '@/types';
import { getLocationAndWeather } from '@/utils/weather';

export function useWeather() {
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const weatherData = await getLocationAndWeather();
      setWeather(weatherData);
    } catch (err) {
      setError('날씨 정보를 가져올 수 없습니다.');
      console.error('Weather fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshWeather = () => {
    fetchWeather();
  };

  return {
    weather,
    isLoading,
    error,
    refreshWeather,
  };
} 