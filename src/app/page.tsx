'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommuteButton from '@/components/CommuteButton';
import MoodInput from '@/components/MoodInput';
import StatsChart from '@/components/StatsChart';
import FeedSection from '@/components/FeedSection';
import { useCommute } from '@/hooks/useCommute';
import { saveMoodData } from '@/utils/storage';

export default function Home() {
  const { 
    nickname, 
    isLoading: commuteLoading, 
    recordCommute, 
    getTodayCommute, 
    getTodayLeave, 
    hasCommutedToday, 
    hasLeftToday 
  } = useCommute();
  
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
      };
      
      saveMoodData(moodData);
      
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
      {/* 헤더 */}
      <header className="border-b border-github-border bg-github-card">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🏠</div>
              <h1 className="text-xl font-bold">아 집에가고싶다</h1>
            </div>
            <div className="text-github-muted text-sm">
              {nickname}
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* 출근/퇴근 버튼 */}
          <div className="bg-github-card border border-github-border rounded-lg p-6">
            <h2 className="text-github-text font-medium mb-4">오늘의 출퇴근</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* 기분 입력 */}
          <MoodInput
            onSubmit={handleMoodSubmit}
            isLoading={isMoodLoading}
            disabled={commuteLoading}
          />

          {/* 통계 차트 */}
          <StatsChart />

          {/* 피드 섹션 */}
          <FeedSection />
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
