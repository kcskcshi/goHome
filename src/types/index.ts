export interface CommuteRecord {
  id: string;
  uuid: string;
  type: '출근' | '퇴근';
  timestamp: number;
  nickname: string;
  mood?: string;
  message?: string;
}

export interface WeatherInfo {
  temperature: number;
  description: string;
  icon: string;
  feelsLike: number;
}

export interface MoodData {
  emoji: string;
  message: string;
  timestamp: number;
  nickname: string;
}

export interface UserStats {
  totalCommutes: number;
  earlyBirdCount: number;
  nightOwlCount: number;
  averageCommuteTime: string;
}

export interface DailyStats {
  totalUsers: number;
  earlyBird: string;
  nightOwl: string;
  averageMood: string;
} 