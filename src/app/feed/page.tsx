'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import FeedCard from '@/components/FeedCard';
import { getTodayMoods, getTodayRecords } from '@/utils/storage';
import { MoodData, CommuteRecord } from '@/types';

export default function FeedPage() {
  const [todayMoods, setTodayMoods] = useState<MoodData[]>([]);
  const [todayRecords, setTodayRecords] = useState<CommuteRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 다크모드 강제 적용
    document.documentElement.classList.add('dark');
    
    // 데이터 로드
    const loadData = () => {
      const moods = getTodayMoods();
      const records = getTodayRecords();
      
      setTodayMoods(moods.sort((a, b) => b.timestamp - a.timestamp));
      setTodayRecords(records);
      setIsLoading(false);
    };

    loadData();
    
    // 주기적으로 데이터 새로고침 (5분마다)
    const interval = setInterval(loadData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getStats = () => {
    const totalUsers = new Set([
      ...todayMoods.map(m => m.nickname),
      ...todayRecords.map(r => r.nickname)
    ]).size;

    const earlyBird = todayRecords
      .filter(r => r.type === '출근')
      .sort((a, b) => a.timestamp - b.timestamp)[0];

    const nightOwl = todayRecords
      .filter(r => r.type === '퇴근')
      .sort((a, b) => b.timestamp - a.timestamp)[0];

    return {
      totalUsers,
      earlyBird: earlyBird?.nickname || '아직 없음',
      nightOwl: nightOwl?.nickname || '아직 없음',
    };
  };

  const stats = getStats();

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-github-bg text-github-text">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-github-green"></div>
            <span className="ml-2 text-github-text">피드 로딩 중...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-github-bg text-github-text">
      {/* 헤더 */}
      <header className="border-b border-github-border bg-github-card">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 hover:text-github-green transition-colors">
              <div className="text-2xl">🏠</div>
              <h1 className="text-xl font-bold">아 집에가고싶다</h1>
            </Link>
            <div className="text-github-muted text-sm">
              오늘의 피드
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* 오늘의 통계 */}
          <div className="bg-github-card border border-github-border rounded-lg p-6">
            <h2 className="text-github-text font-medium mb-4">오늘의 통계</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-github-green">
                  {stats.totalUsers}
                </div>
                <div className="text-github-muted text-sm mt-1">참여자</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">
                  🌅
                </div>
                <div className="text-github-muted text-sm mt-1">출근왕</div>
                <div className="text-github-text text-xs mt-1">
                  {stats.earlyBird}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">
                  🌙
                </div>
                <div className="text-github-muted text-sm mt-1">칼퇴왕</div>
                <div className="text-github-text text-xs mt-1">
                  {stats.nightOwl}
                </div>
              </div>
            </div>
          </div>

          {/* 출퇴근 기록 */}
          {todayRecords.length > 0 && (
            <div className="bg-github-card border border-github-border rounded-lg p-6">
              <h2 className="text-github-text font-medium mb-4">오늘의 출퇴근</h2>
              <div className="space-y-3">
                {todayRecords
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-github-bg rounded-md">
                      <div className="flex items-center space-x-3">
                        <div className={`text-lg ${record.type === '출근' ? 'text-github-green' : 'text-orange-500'}`}>
                          {record.type === '출근' ? '🌅' : '🏠'}
                        </div>
                        <div>
                          <div className="text-github-text font-medium">
                            {record.nickname}
                          </div>
                          <div className="text-github-muted text-sm">
                            {record.type}
                          </div>
                        </div>
                      </div>
                      <div className="text-github-muted text-sm">
                        {formatTime(record.timestamp)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 기분 피드 */}
          <div className="bg-github-card border border-github-border rounded-lg p-6">
            <h2 className="text-github-text font-medium mb-4">오늘의 기분</h2>
            {todayMoods.length > 0 ? (
              <div className="space-y-4">
                {todayMoods.map((mood, index) => (
                  <FeedCard key={`${mood.timestamp}-${index}`} mood={mood} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">😴</div>
                <div className="text-github-muted">
                  아직 아무도 기분을 공유하지 않았어요.
                </div>
                <div className="text-github-muted text-sm mt-2">
                  첫 번째로 기분을 공유해보세요!
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="border-t border-github-border bg-github-card mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center text-github-muted text-sm">
            <p>"오늘도 출근했습니다. 그리고 기분은요..."</p>
            <p className="mt-2">© 2024 아 집에가고싶다</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 