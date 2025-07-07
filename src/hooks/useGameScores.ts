import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/utils/supabaseClient';

export interface GameScore {
  id: string;
  uuid: string;
  nickname: string;
  game: string;
  score: number;
  created_at: string;
}

export function useGameScores(uuid: string) {
  const [scores, setScores] = useState<GameScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 게임 기록 불러오기
  const fetchScores = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('game_scores')
      .select('*')
      .eq('uuid', uuid)
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    setScores(data || []);
    setLoading(false);
  }, [uuid]);

  useEffect(() => {
    if (uuid) fetchScores();
  }, [uuid, fetchScores]);

  // 게임 기록 추가
  const addScore = async (game: string, score: number, nickname: string) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('game_scores')
      .insert([
        {
          uuid,
          game,
          score,
          nickname,
        },
      ])
      .select();
    if (error) setError(error.message);
    if (data) setScores((prev) => [data[0], ...prev]);
    setLoading(false);
  };

  return { scores, loading, error, fetchScores, addScore };
} 