'use client';

import { useState, useEffect } from 'react';
import { CommuteRecord } from '@/types';
import { saveCommuteRecord, getTodayRecords } from '@/utils/storage';
import { generateNickname, getStoredNickname, setStoredNickname } from '@/utils/nickname';

export function useCommute() {
  const [todayRecords, setTodayRecords] = useState<CommuteRecord[]>([]);
  const [nickname, setNickname] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 닉네임 초기화
    const storedNickname = getStoredNickname();
    if (storedNickname) {
      setNickname(storedNickname);
    } else {
      const newNickname = generateNickname();
      setNickname(newNickname);
      setStoredNickname(newNickname);
    }

    // 오늘 기록 로드
    setTodayRecords(getTodayRecords());
  }, []);

  const recordCommute = async (type: '출근' | '퇴근') => {
    setIsLoading(true);
    
    try {
      const record: CommuteRecord = {
        id: `${Date.now()}-${Math.random()}`,
        type,
        timestamp: Date.now(),
        nickname,
      };

      saveCommuteRecord(record);
      setTodayRecords(getTodayRecords());
      
      return record;
    } catch (error) {
      console.error('Failed to record commute:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getTodayCommute = () => {
    return todayRecords.find(record => record.type === '출근');
  };

  const getTodayLeave = () => {
    return todayRecords.find(record => record.type === '퇴근');
  };

  const hasCommutedToday = () => {
    return todayRecords.some(record => record.type === '출근');
  };

  const hasLeftToday = () => {
    return todayRecords.some(record => record.type === '퇴근');
  };

  return {
    todayRecords,
    nickname,
    isLoading,
    recordCommute,
    getTodayCommute,
    getTodayLeave,
    hasCommutedToday,
    hasLeftToday,
  };
} 