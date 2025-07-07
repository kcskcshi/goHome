import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/utils/supabaseClient';

export interface CommuteRecord {
  id: string;
  uuid: string;
  type: string; // 'in' | 'out'
  timestamp: number;
  nickname: string;
  mood: string;
  message: string;
  created_at: string;
}

export function useCommutes(uuid: string) {
  const [records, setRecords] = useState<CommuteRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 출퇴근 기록 불러오기
  const fetchCommutes = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('commutes')
      .select('*')
      .eq('uuid', uuid)
      .order('timestamp', { ascending: false });
    if (error) setError(error.message);
    setRecords(data || []);
    setLoading(false);
  }, [uuid]);

  useEffect(() => {
    if (uuid) fetchCommutes();
  }, [uuid, fetchCommutes]);

  // 출퇴근 기록 추가
  const addCommute = async (type: 'in' | 'out', nickname: string, mood: string, message: string) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('commutes')
      .insert([
        {
          uuid,
          type,
          timestamp: Date.now(),
          nickname,
          mood,
          message,
        },
      ])
      .select();
    if (error) setError(error.message);
    if (data) setRecords((prev) => [data[0], ...prev]);
    setLoading(false);
  };

  return { records, loading, error, fetchCommutes, addCommute };
} 