import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/utils/supabaseClient';

export interface MoodRecord {
  id: string;
  uuid: string;
  emoji: string;
  message: string;
  timestamp: number;
  nickname: string;
  created_at: string;
}

export function useMoods(uuid: string) {
  const [moods, setMoods] = useState<MoodRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 기분 기록 불러오기
  const fetchMoods = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('moods')
      .select('*')
      .eq('uuid', uuid)
      .order('timestamp', { ascending: false });
    if (error) setError(error.message);
    setMoods(data || []);
    setLoading(false);
  }, [uuid]);

  useEffect(() => {
    if (uuid) fetchMoods();
  }, [uuid, fetchMoods]);

  // 기분 기록 추가
  const addMood = async (emoji: string, message: string, nickname: string) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('moods')
      .insert([
        {
          uuid,
          emoji,
          message,
          timestamp: Date.now(),
          nickname,
        },
      ])
      .select();
    if (error) setError(error.message);
    if (data) setMoods((prev) => [data[0], ...prev]);
    setLoading(false);
  };

  return { moods, loading, error, fetchMoods, addMood };
} 