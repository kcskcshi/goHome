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
      // 한국시간(UTC+9) 기준 오늘 날짜 구하기
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
      const krNow = new Date(utc + KR_TIME_DIFF);
      const yyyy = krNow.getFullYear();
      const mm = String(krNow.getMonth() + 1).padStart(2, '0');
      const dd = String(krNow.getDate()).padStart(2, '0');
      const todayStr = `${yyyy}-${mm}-${dd}`;
      const { data, error } = await getSupabase()
        .from('game_scores')
        .select('*')
        .eq('game', 'commantle')
        .gte('created_at', todayStr + 'T00:00:00+09:00')
        .lte('created_at', todayStr + 'T23:59:59+09:00')
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
  const addGameScore = async (score: number, uuid: string, nickname: string, game: string = 'commantle') => {
    try {
      // 오늘 날짜(한국시간) 기준 기존 기록 있는지 확인
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
      const krNow = new Date(utc + KR_TIME_DIFF);
      const yyyy = krNow.getFullYear();
      const mm = String(krNow.getMonth() + 1).padStart(2, '0');
      const dd = String(krNow.getDate()).padStart(2, '0');
      const todayStr = `${yyyy}-${mm}-${dd}`;
      const { data: exist, error: existError } = await getSupabase()
        .from('game_scores')
        .select('*')
        .eq('uuid', uuid)
        .eq('game', game)
        .gte('created_at', todayStr + 'T00:00:00+09:00')
        .lte('created_at', todayStr + 'T23:59:59+09:00');
      if (existError) throw existError;
      if (exist && exist.length > 0) {
        // 이미 기록이 있으면 더 적은 시도 횟수로만 갱신
        const prevScore = exist[0].score;
        if (score < prevScore) {
          const { error: updateError } = await getSupabase()
            .from('game_scores')
            .update({ score })
            .eq('id', exist[0].id);
          if (updateError) throw updateError;
        }
      } else {
        const { error } = await getSupabase()
          .from('game_scores')
          .insert([{ uuid, nickname, game, score }]);
        if (error) throw error;
      }
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