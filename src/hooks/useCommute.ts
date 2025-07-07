'use client';

import { useState, useEffect } from 'react';
import { CommuteRecord } from '@/types';
import { generateNickname, getStoredNickname, setStoredNickname } from '@/utils/nickname';
import { getStoredUuid, setStoredUuid } from '@/utils/storage';
import { v4 as uuidv4 } from 'uuid';
import { useSupabase } from './useSupabase';

export function useCommute() {
  const [todayRecords, setTodayRecords] = useState<CommuteRecord[]>([]);
  const [nickname, setNickname] = useState<string>('');
  const [uuid, setUuid] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { commutes, addCommute } = useSupabase();

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
    // uuid 초기화
    const storedUuid = getStoredUuid();
    if (!storedUuid) {
      const newUuid = uuidv4();
      setStoredUuid(newUuid);
      setUuid(newUuid);
    } else {
      setUuid(storedUuid);
    }
  }, []);

  // 오늘 기록 필터링
  useEffect(() => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const todayEnd = todayStart + 24 * 60 * 60 * 1000;

    const todayCommutes = commutes.filter(record => 
      record.uuid === uuid &&
      record.timestamp >= todayStart && record.timestamp < todayEnd
    );
    setTodayRecords(todayCommutes);
  }, [commutes, uuid]);

  const recordCommute = async (type: '출근' | '퇴근') => {
    setIsLoading(true);
    
    try {
      const record: Omit<CommuteRecord, 'id'> = {
        uuid,
        type,
        timestamp: Date.now(),
        nickname,
        date: new Date().toISOString().slice(0, 10),
        status: type,
      };

      await addCommute(record);
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
    return Array.isArray(todayRecords) && todayRecords.some(record => record.type === '출근');
  };

  const hasLeftToday = () => {
    return Array.isArray(todayRecords) && todayRecords.some(record => record.type === '퇴근');
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
    uuid,
  };
} 