'use client';

import { useState, useEffect, useRef } from 'react';
import ProfileWithCommute from '@/components/ProfileWithCommute';
import MoodInput from '@/components/MoodInput';
import StatsChart from '@/components/StatsChart';
import FeedSection from '@/components/FeedSection';
import { useCommute } from '@/hooks/useCommute';
import { SupabaseProvider, useSupabase } from '@/hooks/useSupabase';
import CommantleGame from '@/components/CommantleGame';

// 형용사/직업 랜덤 조합
const ADJECTIVES = [
  '꽃을 든', '용기가 넘치는', '희망찬', '행복을 전하는', '열정적인', '상상력이 풍부한',
  '긍정적인', '에너지가 넘치는', '웃음이 가득한', '창의적인', '빛나는', '든든한',
  '믿음직한', '따뜻한', '섬세한', '도전적인', '성실한', '유쾌한', '친절한', '배려심 깊은'
];
const JOBS = [
  '개발자', '요리사', '디자이너', '분석가', '작가', '음악가', '화가', '선생님', '연구원', '마케터',
  '기획자', '운동선수', '사진작가', '정원사', '건축가', '의사', '간호사', '파일럿', '탐험가', '예술가'
];

function getRandomProfile() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const job = JOBS[Math.floor(Math.random() * JOBS.length)];
  return `${adj} ${job}`;
}

type FeedSectionRefType = {
  setActiveTab: (tab: string) => void;
};

function HomeContent() {
  const { 
    nickname, 
    isLoading: commuteLoading, 
    recordCommute, 
    getTodayCommute, 
    getTodayLeave, 
    uuid
  } = useCommute();
  
  const { addMood, commutes, moods, fetchMoods } = useSupabase();
  const [isMoodLoading, setIsMoodLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [profilePhrase, setProfilePhrase] = useState('');
  const feedSectionRef = useRef<FeedSectionRefType | null>(null);

  // 다크모드 강제 적용
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // 페이지 로딩 딜레이 (2-3초)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 2500); // 2.5초 딜레이

    return () => clearTimeout(timer);
  }, []);

  // 프로필 문구 랜덤 생성 (새로고침마다)
  useEffect(() => {
    setProfilePhrase(getRandomProfile());
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
      await addMood(moodData);
      await fetchMoods(); // 기분 리스트 즉시 리프레시
      // alert('기분이 성공적으로 공유되었습니다!'); // 팝업 제거
      // FeedSection의 탭을 '기분'으로 전환 (ref 사용)
      if (feedSectionRef.current && typeof feedSectionRef.current.setActiveTab === 'function') {
        feedSectionRef.current.setActiveTab('moods');
      }
    } catch (error) {
      console.error('Mood submission failed:', error);
      // alert('기분 공유에 실패했습니다. 다시 시도해주세요.'); // 팝업 제거
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
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-3xl">🏠</div>
              <h1 className="text-2xl font-bold text-github-text">아 집에가고싶다</h1>
            </div>
            <div className="text-github-muted text-base font-medium">
              {nickname}
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 좌측 사이드바 - 프로필 영역 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 프로필 + 출퇴근 통합 카드 */}
            <ProfileWithCommute
              nickname={profilePhrase}
              userId={nickname}
              onCommute={handleCommute}
              commuteTime={{
                start: getTodayCommute() ? formatTime(getTodayCommute()!.timestamp) : undefined,
                end: getTodayLeave() ? formatTime(getTodayLeave()!.timestamp) : undefined
              }}
              isLoading={commuteLoading || isPageLoading}
            />
            {/* 기분 입력 */}
            <MoodInput
              onSubmit={handleMoodSubmit}
              isLoading={isMoodLoading}
              disabled={commuteLoading || isPageLoading}
            />
          </div>
          {/* 우측 메인 컨텐츠 */}
          <div className="lg:col-span-3 space-y-6">
            {/* 통계 차트 */}
            <StatsChart commutes={commutes} moods={moods} myUuid={uuid} />
            {/* 꼬맨틀 게임 */}
            <CommantleGame uuid={uuid} nickname={nickname} />
            {/* 피드 섹션 */}
            <FeedSection ref={feedSectionRef} uuid={uuid} />
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="border-t border-github-border bg-github-card mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center text-github-muted text-sm">
            <p>&ldquo;오늘도 출근했습니다. 그리고 기분은요...&rdquo;</p>
            <p className="mt-2">© 2025 아 집에가고싶다</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <SupabaseProvider>
      <HomeContent />
    </SupabaseProvider>
  );
}
