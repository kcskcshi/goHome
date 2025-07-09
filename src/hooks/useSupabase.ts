import React, { useState, useEffect, useContext, createContext, ReactNode } from 'react'
import { getSupabase } from '@/lib/supabase'
import { CommuteRecord, MoodData, GameScoreRecord } from '@/types'

interface SupabaseContextType {
  commutes: CommuteRecord[];
  moods: MoodData[];
  gameScores: GameScoreRecord[];
  loading: boolean;
  addCommute: (commute: Omit<CommuteRecord, 'id'>) => Promise<void>;
  addMood: (mood: Omit<MoodData, 'id'>) => Promise<void>;
  fetchCommutes: () => Promise<void>;
  fetchMoods: () => Promise<void>;
  fetchGameScores: () => Promise<void>;
  addGameScore: (score: number, uuid: string, nickname: string, game?: string) => Promise<void>;
  fetchDinoScores: () => Promise<GameScoreRecord[]>;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export const SupabaseProvider = ({ children }: { children: ReactNode }) => {
  const [commutes, setCommutes] = useState<CommuteRecord[]>([]);
  const [moods, setMoods] = useState<MoodData[]>([]);
  const [gameScores, setGameScores] = useState<GameScoreRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // 출퇴근 기록 가져오기
  const fetchCommutes = async () => {
    try {
      const { data, error } = await getSupabase()
        .from('commutes')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50)

      if (error) throw error
      setCommutes(data || [])
    } catch (error) {
      console.error('출퇴근 기록 가져오기 실패:', error)
    }
  }

  // 기분 데이터 가져오기
  const fetchMoods = async () => {
    try {
      const { data, error } = await getSupabase()
        .from('moods')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50)

      if (error) throw error
      setMoods(data || [])
    } catch (error) {
      console.error('기분 데이터 가져오기 실패:', error)
    }
  }

  // 꼬맨틀 게임 스코어 가져오기 (오늘 날짜 기준)
  const fetchGameScores = async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await getSupabase()
        .from('game_scores')
        .select('*')
        .eq('game', 'commantle')
        .gte('created_at', today + 'T00:00:00+09:00')
        .lte('created_at', today + 'T23:59:59+09:00')
        .order('score', { ascending: true })
        .order('created_at', { ascending: true });
      if (error) throw error;
      setGameScores(data || []);
    } catch (error) {
      console.error('게임 스코어 가져오기 실패:', error);
    }
  }

  // 디노 러너 전체 랭킹(고득점자 순, 초기화 없이) 가져오기
  const fetchDinoScores = async () => {
    try {
      const { data, error } = await getSupabase()
        .from('game_scores')
        .select('*')
        .eq('game', 'dino')
        .order('score', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(10);
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('디노 러너 랭킹 가져오기 실패:', error);
      return [];
    }
  };

  // 출퇴근 기록 추가
  const addCommute = async (commute: Omit<CommuteRecord, 'id'>) => {
    try {
      const { error } = await getSupabase()
        .from('commutes')
        .insert([commute])

      if (error) throw error
      await fetchCommutes() // 목록 새로고침
    } catch (error) {
      console.error('출퇴근 기록 추가 실패:', error)
      throw error
    }
  }

  // 기분 데이터 추가
  const addMood = async (mood: Omit<MoodData, 'id'>) => {
    try {
      const { error } = await getSupabase()
        .from('moods')
        .insert([mood])

      if (error) throw error
      await fetchMoods() // 목록 새로고침
    } catch (error) {
      console.error('기분 데이터 추가 실패:', error)
      throw error
    }
  }

  // 게임 스코어 추가 (게임 타입별)
  const addGameScore = async (score: number, id: string, nickname: string, game: string = 'commantle') => {
    try {
      // id는 uuid 타입이어야 함
      const { error } = await getSupabase()
        .from('game_scores')
        .insert([{ id, nickname, game, score }]);
      if (error) throw error;
      await fetchGameScores();
    } catch (error) {
      console.error('게임 스코어 추가 실패:', error);
      throw error;
    }
  }

  // 초기 데이터 로드 (페이지 로드 시에만)
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCommutes(), fetchMoods(), fetchGameScores()]);
      setLoading(false);
    };
    loadData();
  }, []);

  return React.createElement(
    SupabaseContext.Provider,
    {
      value: {
        commutes,
        moods,
        gameScores,
        loading,
        addCommute,
        addMood,
        fetchCommutes,
        fetchMoods,
        fetchGameScores,
        addGameScore,
        fetchDinoScores
      }
    },
    children
  );
};

export const useSupabaseContext = () => {
  const ctx = useContext(SupabaseContext);
  if (!ctx) throw new Error('useSupabaseContext must be used within a SupabaseProvider');
  return ctx;
};

// 기존 useSupabase 훅은 deprecated, 하위 호환 위해 Context만 반환
export const useSupabase = useSupabaseContext; 