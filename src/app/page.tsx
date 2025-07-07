'use client';

import { useState, useEffect } from 'react';
import CommuteButton from '@/components/CommuteButton';
import MoodInput from '@/components/MoodInput';
import StatsChart from '@/components/StatsChart';
import FeedSection from '@/components/FeedSection';
import { useCommute } from '@/hooks/useCommute';
import { useSupabase } from '@/hooks/useSupabase';
import MoodHeatmap from '@/components/MoodHeatmap';
import CommantleGame from '@/components/CommantleGame';

export default function Home() {
  const { 
    nickname, 
    isLoading: commuteLoading, 
    recordCommute, 
    getTodayCommute, 
    getTodayLeave, 
    hasCommutedToday, 
    hasLeftToday,
    uuid
  } = useCommute();
  
  const { addMood, commutes, moods } = useSupabase();
  const [isMoodLoading, setIsMoodLoading] = useState(false);

  // 다크모드 강제 적용
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleCommute = async (type: '출근' | '퇴근') => {
    try {
      await recordCommute(type);
    } catch (error) {
      console.error('Commute recording failed:', error);
    }
  };

  const handleMoodSubmit = async (emoji: string, message: string) => {
    setIsMoodLoading(true);
    try {
      const moodData = {
        emoji,
        message,
        timestamp: Date.now(),
        nickname,
        mood: 0, // 기본값 또는 실제 입력값으로 수정 가능
        date: new Date().toISOString().slice(0, 10),
      };
      
      await addMood(moodData);
      
      // 성공 메시지 (실제로는 토스트나 알림 사용)
      alert('기분이 성공적으로 공유되었습니다!');
    } catch (error) {
      console.error('Mood submission failed:', error);
      alert('기분 공유에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsMoodLoading(false);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-github-bg text-github-text">
      <header className="border-b border-github-border bg-github-card shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🏠</div>
            <h1 className="text-xl font-bold">아 집에가고싶다</h1>
          </div>
          <div className="text-github-muted text-sm">{nickname}</div>
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 좌측 사이드바 */}
          <aside className="md:col-span-1 space-y-8">
            {/* 프로필 카드 */}
            <div className="bg-white dark:bg-github-card border border-github-border rounded-xl shadow p-6 flex flex-col items-center">
              <div className="w-20 h-20 bg-github-green rounded-full flex items-center justify-center text-3xl font-bold text-white mb-3">
                {nickname.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-github-text font-bold text-lg mb-1">{nickname}</h2>
              <p className="text-github-muted text-xs mb-4">개발자 • 데이터 분석가</p>
              <div className="w-full space-y-2 text-sm">
                {getTodayCommute() && (
                  <div className="flex items-center justify-between p-2 bg-github-bg rounded">
                    <span className="text-github-muted">출근</span>
                    <span className="text-github-green font-medium">{formatTime(getTodayCommute()!.timestamp)}</span>
                  </div>
                )}
                {getTodayLeave() && (
                  <div className="flex items-center justify-between p-2 bg-github-bg rounded">
                    <span className="text-github-muted">퇴근</span>
                    <span className="text-orange-400 font-medium">{formatTime(getTodayLeave()!.timestamp)}</span>
                  </div>
                )}
              </div>
            </div>
            {/* 출근/퇴근 버튼 카드 */}
            <div className="bg-white dark:bg-github-card border border-github-border rounded-xl shadow p-6">
              <h3 className="text-github-text font-medium mb-4">오늘의 출퇴근</h3>
              <div className="space-y-3">
                <CommuteButton
                  type="출근"
                  onClick={() => handleCommute('출근')}
                  isLoading={commuteLoading}
                  hasRecorded={hasCommutedToday()}
                  recordTime={getTodayCommute() ? formatTime(getTodayCommute()!.timestamp) : undefined}
                />
                <CommuteButton
                  type="퇴근"
                  onClick={() => handleCommute('퇴근')}
                  isLoading={commuteLoading}
                  hasRecorded={hasLeftToday()}
                  recordTime={getTodayLeave() ? formatTime(getTodayLeave()!.timestamp) : undefined}
                />
              </div>
            </div>
            {/* 기분 입력 카드 */}
            <div className="bg-white dark:bg-github-card border border-github-border rounded-xl shadow p-6">
              <MoodInput onSubmit={handleMoodSubmit} isLoading={isMoodLoading} disabled={commuteLoading} />
            </div>
          </aside>
          {/* 중앙 메인 컨텐츠 */}
          <main className="md:col-span-3 space-y-8">
            <div className="bg-white dark:bg-github-card border border-github-border rounded-xl shadow p-6">
              <StatsChart commutes={commutes} moods={moods} myUuid={uuid} />
            </div>
            <div className="bg-white dark:bg-github-card border border-github-border rounded-xl shadow p-6">
              <CommantleGame />
            </div>
            <div className="bg-white dark:bg-github-card border border-github-border rounded-xl shadow p-6">
              <MoodHeatmap moods={moods} />
            </div>
            <div className="bg-white dark:bg-github-card border border-github-border rounded-xl shadow p-6">
              <FeedSection />
            </div>
          </main>
        </div>
      </div>
      <footer className="border-t border-github-border bg-github-card mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center text-github-muted text-sm">
            <p>&ldquo;오늘도 출근했습니다. 그리고 기분은요...&rdquo;</p>
            <p className="mt-2">© 2024 아 집에가고싶다</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
