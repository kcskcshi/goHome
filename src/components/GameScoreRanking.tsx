import { useSupabase } from '@/hooks/useSupabase';
import React from 'react';

interface GameScoreRankingProps {
  uuid: string;
}

export default function GameScoreRanking({ uuid }: GameScoreRankingProps) {
  const { gameScores, loading } = useSupabase();

  return (
    <div className="bg-github-card border border-github-border rounded-lg p-6">
      <h3 className="text-github-text font-bold mb-3">오늘의 꼬맨틀 순위</h3>
      {loading ? (
        <div className="text-github-muted text-sm">로딩 중...</div>
      ) : gameScores.length === 0 ? (
        <div className="text-github-muted text-sm">아직 순위가 없습니다.</div>
      ) : (
        <ol className="space-y-2">
          {gameScores.map((score, idx) => (
            <li
              key={score.id}
              className={`flex justify-between items-center px-3 py-2 rounded ${score.uuid === uuid ? 'bg-github-green/20 font-bold' : ''}`}
            >
              <span className="text-github-text">{idx + 1}위</span>
              <span className="text-github-muted text-sm">{score.nickname}</span>
              <span className="text-github-text">{score.score}회</span>
            </li>
          ))}
        </ol>
      )}
      <div className="text-github-muted text-xs mt-3">※ 시도 횟수가 적을수록 순위가 높아요!<br/>매일 0시 초기화</div>
    </div>
  );
} 