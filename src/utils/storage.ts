import { CommuteRecord, MoodData } from '@/types';

const STORAGE_KEYS = {
  COMMUTE_RECORDS: 'go-home-commute-records',
  MOOD_DATA: 'go-home-mood-data',
  NICKNAME: 'go-home-nickname',
} as const;

export function getCommuteRecords(): CommuteRecord[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.COMMUTE_RECORDS);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveCommuteRecord(record: CommuteRecord): void {
  if (typeof window === 'undefined') return;
  
  try {
    const records = getCommuteRecords();
    records.push(record);
    localStorage.setItem(STORAGE_KEYS.COMMUTE_RECORDS, JSON.stringify(records));
  } catch (error) {
    console.error('Failed to save commute record:', error);
  }
}

export function getMoodData(): MoodData[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.MOOD_DATA);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveMoodData(moodData: MoodData): void {
  if (typeof window === 'undefined') return;
  
  try {
    const moods = getMoodData();
    moods.push(moodData);
    localStorage.setItem(STORAGE_KEYS.MOOD_DATA, JSON.stringify(moods));
  } catch (error) {
    console.error('Failed to save mood data:', error);
  }
}

export function getTodayRecords(): CommuteRecord[] {
  const records = getCommuteRecords();
  const today = new Date().toDateString();
  
  return records.filter(record => {
    const recordDate = new Date(record.timestamp).toDateString();
    return recordDate === today;
  });
}

export function getTodayMoods(): MoodData[] {
  const moods = getMoodData();
  const today = new Date().toDateString();
  
  return moods.filter(mood => {
    const moodDate = new Date(mood.timestamp).toDateString();
    return moodDate === today;
  });
} 