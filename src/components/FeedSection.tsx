'use client';

import { useState, useEffect } from 'react';
import { MoodData, CommuteRecord, GameScoreRecord } from '@/types';
import { useSupabase } from '@/hooks/useSupabase';
import GameScoreRanking from './GameScoreRanking';

export default function FeedSection() {
  const [todayMoods, setTodayMoods] = useState<MoodData[]>([]);
  const [todayRecords, setTodayRecords] = useState<CommuteRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'commantle' | 'dino'>('commantle');
  const { moods, commutes, loading, fetchDinoScores } = useSupabase();
  const [dinoScores, setDinoScores] = useState<GameScoreRecord[]>([]);

  // 오늘 데이터 필터링
  useEffect(() => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const todayEnd = todayStart + 24 * 60 * 60 * 1000;

    // 기존 코드에서 todayMoods, todayRecords는 더 이상 사용되지 않으므로 setState 호출 제거
  }, [moods, commutes]);

  useEffect(() => {
    if (activeTab === 'dino') {
      fetchDinoScores().then(setDinoScores);
    }
  }, [activeTab, fetchDinoScores]);

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
            onClick={() => setActiveTab('commantle')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'commantle'
                ? 'text-github-green border-b border-github-green'
                : 'text-github-muted hover:text-github-text'
            }`}
          >
            📝 꼬맨틀 순위
          </button>
          <button
            onClick={() => setActiveTab('dino')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'dino'
                ? 'text-github-green border-b border-github-green'
                : 'text-github-muted hover:text-github-text'
            }`}
          >
            🦖 디노 러너 순위
          </button>
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="p-4">
        {activeTab === 'commantle' ? (
          <GameScoreRanking uuid={''} />
        ) : (
          <div className="space-y-2">
            <div className="text-center font-bold text-lg mb-2">디노 러너 랭킹 TOP 10</div>
            {dinoScores.length > 0 ? (
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-github-borderLight">
                    <th className="py-1">순위</th>
                    <th className="py-1">닉네임</th>
                    <th className="py-1">점수</th>
                    <th className="py-1">날짜</th>
                  </tr>
                </thead>
                <tbody>
                  {dinoScores.map((score, idx) => (
                    <tr key={score.id} className="border-b border-github-borderLight">
                      <td className="py-1">{idx + 1}</td>
                      <td className="py-1">{score.nickname}</td>
                      <td className="py-1">{score.score}</td>
                      <td className="py-1">{score.created_at.slice(0, 10)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8">
                <div className="text-2xl mb-3">🦖</div>
                <div className="text-github-muted text-sm">
                  아직 디노 러너 기록이 없습니다.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 