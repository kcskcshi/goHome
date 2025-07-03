'use client';

import { useState, useEffect } from 'react';
import FeedCard from './FeedCard';
import { MoodData, CommuteRecord } from '@/types';
import { useSupabase } from '@/hooks/useSupabase';

export default function FeedSection() {
  const [todayMoods, setTodayMoods] = useState<MoodData[]>([]);
  const [todayRecords, setTodayRecords] = useState<CommuteRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'moods' | 'commutes'>('moods');
  const { moods, commutes, loading } = useSupabase();

  // 오늘 데이터 필터링
  useEffect(() => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const todayEnd = todayStart + 24 * 60 * 60 * 1000;

    const todayMoodsData = moods.filter(mood => 
      mood.timestamp >= todayStart && mood.timestamp < todayEnd
    ).sort((a, b) => b.timestamp - a.timestamp);

    const todayCommutesData = commutes.filter(record => 
      record.timestamp >= todayStart && record.timestamp < todayEnd
    ).sort((a, b) => b.timestamp - a.timestamp);

    setTodayMoods(todayMoodsData);
    setTodayRecords(todayCommutesData);
  }, [moods, commutes]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="bg-github-card border border-github-border rounded-lg p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-github-green"></div>
          <span className="ml-2 text-github-text">피드 로딩 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-github-card border border-thin border-github-borderLight rounded-md">
      {/* 탭 헤더 */}
      <div className="border-b border-thin border-github-borderLight">
        <div className="flex">
          <button
            onClick={() => setActiveTab('moods')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'moods'
                ? 'text-github-green border-b border-github-green'
                : 'text-github-muted hover:text-github-text'
            }`}
          >
            😊 기분 ({todayMoods.length})
          </button>
          <button
            onClick={() => setActiveTab('commutes')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'commutes'
                ? 'text-github-green border-b border-github-green'
                : 'text-github-muted hover:text-github-text'
            }`}
          >
            ⏰ 출퇴근 ({todayRecords.length})
          </button>
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="p-4">
        {activeTab === 'moods' ? (
          <div className="space-y-4">
            {todayMoods.length > 0 ? (
              todayMoods.slice(0, 5).map((mood, index) => (
                <FeedCard key={`${mood.timestamp}-${index}`} mood={mood} />
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-2xl mb-3">😴</div>
                <div className="text-github-muted text-sm">
                  아직 아무도 기분을 공유하지 않았어요.
                </div>
                <div className="text-github-muted text-xs mt-2">
                  첫 번째로 기분을 공유해보세요!
                </div>
              </div>
            )}
            {todayMoods.length > 5 && (
              <div className="text-center pt-4">
                <div className="text-github-muted text-xs">
                  +{todayMoods.length - 5}개의 기분 더 보기
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {todayRecords.length > 0 ? (
              todayRecords.slice(0, 8).map((record) => (
                <div key={record.id} className="flex items-center justify-between p-2 bg-github-bg rounded-sm">
                  <div className="flex items-center space-x-3">
                    <div className={`text-base ${record.type === '출근' ? 'text-github-green' : 'text-orange-500'}`}> 
                      {record.type === '출근' ? '🌅' : '🏠'}
                    </div>
                    <div>
                      <div className="text-github-text font-medium text-sm">
                        {record.nickname}
                      </div>
                      <div className="text-github-muted text-xs">
                        {record.type}
                      </div>
                    </div>
                  </div>
                  <div className="text-github-muted text-xs">
                    {formatTime(record.timestamp)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-2xl mb-3">⏰</div>
                <div className="text-github-muted text-sm">
                  아직 아무도 출퇴근을 기록하지 않았어요.
                </div>
                <div className="text-github-muted text-xs mt-2">
                  첫 번째로 출근/퇴근을 기록해보세요!
                </div>
              </div>
            )}
            {todayRecords.length > 8 && (
              <div className="text-center pt-4">
                <div className="text-github-muted text-xs">
                  +{todayRecords.length - 8}개의 기록 더 보기
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 