import { useSupabase } from '@/hooks/useSupabase';
import React, { useEffect, useState } from 'react';
import { GameScoreRecord } from '@/types';

interface GameScoreRankingProps {
  uuid: string;
  game?: 'commantle' | 'dino';
}

export default function GameScoreRanking({ uuid, game = 'commantle' }: GameScoreRankingProps) {
  const { gameScores, loading, fetchDinoScores } = useSupabase();
  const [dinoScores, setDinoScores] = useState<GameScoreRecord[]>([]);
  const [dinoLoading, setDinoLoading] = useState(false);

  useEffect(() => {
    if (game === 'dino') {
      setDinoLoading(true);
      fetchDinoScores().then((data) => {
        setDinoScores(data);
        setDinoLoading(false);
      });
    }
  }, [game, fetchDinoScores]);

  const scores = game === 'dino' ? dinoScores : gameScores;
  const isLoading = game === 'dino' ? dinoLoading : loading;

  return (
    <div className="bg-github-card border border-github-border rounded-lg p-6">
      <h3 className="text-github-text font-bold mb-3 text-lg">
        {game === 'dino' ? '디노러너 최고 점수 랭킹' : '오늘의 꼬맨틀 순위'}
      </h3>
      {isLoading ? (
        <div className="text-github-muted text-sm">로딩 중...</div>
      ) : scores.length === 0 ? (
        <div className="text-github-muted text-sm">아직 순위가 없습니다.</div>
      ) : (
        <ol className="space-y-2">
          {scores.map((score, idx) => (
            <li
              key={score.id}
              className={`flex justify-between items-center px-3 py-2 rounded ${score.uuid === uuid ? 'bg-github-green/20 font-bold' : ''} ${idx === 0 ? 'bg-yellow-300/30' : idx === 1 ? 'bg-gray-300/30' : idx === 2 ? 'bg-orange-400/20' : ''}`}
            >
              <span className={`text-github-text flex items-center gap-1`}>
                {idx === 0 && <span className="text-yellow-400">🥇</span>}
                {idx === 1 && <span className="text-gray-300">🥈</span>}
                {idx === 2 && <span className="text-orange-400">🥉</span>}
                {idx + 1}위
              </span>
              <span className="text-github-muted text-sm">{score.nickname}</span>
              <span className="text-github-text">{score.score}{game === 'dino' ? '점' : '회'}</span>
            </li>
          ))}
        </ol>
      )}
      <div className="text-github-muted text-xs mt-3">
        {game === 'dino'
          ? '※ 점수가 높을수록 순위가 높아요! (상위 10명, 매일 초기화 없음)'
          : '※ 시도 횟수가 적을수록 순위가 높아요!\n매일 0시 초기화'}
      </div>
    </div>
  );
} 