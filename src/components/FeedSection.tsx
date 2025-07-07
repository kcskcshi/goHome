'use client';

import { useState, useEffect } from 'react';
import { GameScoreRecord } from '@/types';
import { useSupabase } from '@/hooks/useSupabase';
import GameScoreRanking from './GameScoreRanking';
import FeedCard from './FeedCard';
import { MoodData, CommuteRecord } from '@/types';

export default function FeedSection() {
  const [activeTab, setActiveTab] = useState<'moods' | 'commutes' | 'commantle' | 'dino'>('moods');
  const { moods, commutes, loading, fetchDinoScores } = useSupabase();
  const [dinoScores, setDinoScores] = useState<GameScoreRecord[]>([]);

  // 오늘 데이터 필터링
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const todayEnd = todayStart + 24 * 60 * 60 * 1000;
  const todayMoods = moods.filter(mood => 
    mood.timestamp >= todayStart && mood.timestamp < todayEnd
  ).sort((a, b) => b.timestamp - a.timestamp);
  const todayRecords = commutes.filter(record => 
    record.timestamp >= todayStart && record.timestamp < todayEnd
  ).sort((a, b) => b.timestamp - a.timestamp);

  useEffect(() => {
    if (activeTab === 'dino') {
      fetchDinoScores().then(setDinoScores);
    }
  }, [activeTab, fetchDinoScores]);

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
        ) : activeTab === 'commutes' ? (
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
        ) : activeTab === 'commantle' ? (
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