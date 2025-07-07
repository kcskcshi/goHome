export interface MoodData {
  date: string;
  mood: number;
  emoji: string;
  nickname: string;
  timestamp: number;
  message: string;
  id: string;
}

export interface CommuteRecord {
  date: string;
  status: string;
  timestamp: number;
  id: string;
  type: string;
  nickname: string;
  uuid: string;
} 