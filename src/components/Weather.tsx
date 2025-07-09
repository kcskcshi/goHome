'use client';

import { WeatherInfo } from '@/types';
import Image from 'next/image';

interface WeatherProps {
  weather: WeatherInfo | null;
  isLoading: boolean;
  error: string | null;
  onRefresh?: () => void;
}

export default function Weather({ weather, isLoading, error, onRefresh }: WeatherProps) {
  if (isLoading) {
    return (
      <div className="bg-github-card border border-github-border rounded-lg p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-github-green"></div>
        <span className="ml-2 text-github-text">날씨 정보 로딩 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-github-card border border-github-border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="text-github-muted text-sm">
            <span className="text-red-400">⚠️</span> {error}
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="text-github-green hover:text-github-green-hover text-sm"
            >
              새로고침
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="bg-github-card border border-github-border rounded-lg p-4">
        <div className="space-y-2">
          <div className="text-github-muted text-sm">
            <span className="text-yellow-400">🌤️</span> 날씨 정보를 불러올 수 없습니다
          </div>
          <div className="text-github-muted text-xs">
            API 키가 없거나 위치 권한이 필요합니다
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="text-github-green hover:text-github-green-hover text-xs"
            >
              다시 시도
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-github-card border border-github-border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Image
            src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
            alt={weather.description}
            width={48}
            height={48}
            className="w-12 h-12 inline-block align-middle"
            priority
          />
          <div>
            <div className="text-github-text font-medium">
              {weather.temperature}°C
            </div>
            <div className="text-github-muted text-sm">
              체감 {weather.feelsLike}°C
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-github-text text-sm capitalize">
            {weather.description}
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="text-github-muted hover:text-github-muted-hover text-xs mt-1"
            >
              새로고침
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 