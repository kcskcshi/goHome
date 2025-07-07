import { useState, useCallback } from 'react';
import { useGameScores } from '@/hooks/useGameScores';
import { useGameScoresRealtime } from '@/hooks/useGameScoresRealtime';

interface GameScoreSectionProps {
  uuid: string;
  nickname: string;
}

export default function GameScoreSection({ uuid, nickname }: GameScoreSectionProps) {
  const [game, setGame] = useState('commantle');
  const [score, setScore] = useState<number>(0);
  const { scores, loading, error, fetchScores, addScore } = useGameScores(uuid);

  useGameScoresRealtime(uuid, useCallback(() => {
    fetchScores();
  }, [fetchScores]));

  const handleAddScore = () => {
    if (!game || !score) return;
    addScore(game, score, nickname);
    setScore(0);
  };

  return (
    <div className="p-4 bg-white rounded shadow w-full max-w-md mx-auto mt-4">
      <h2 className="text-lg font-bold mb-2">게임 기록</h2>
      <div className="flex gap-2 mb-2">
        <input
          className="border px-2 py-1 rounded flex-1"
          placeholder="게임명"
          value={game}
          onChange={e => setGame(e.target.value)}
        />
        <input
          className="border px-2 py-1 rounded w-24"
          type="number"
          placeholder="점수"
          value={score}
          onChange={e => setScore(Number(e.target.value))}
        />
        <button
          className="px-3 py-1 bg-purple-500 text-white rounded"
          onClick={handleAddScore}
          disabled={loading}
        >
          기록
        </button>
      </div>
      {error && <div className="text-red-500">{error}</div>}
      <ul className="divide-y">
        {scores.map(s => (
          <li key={s.id} className="py-2 flex items-center gap-2">
            <span className="font-mono text-xs text-gray-400">{new Date(s.created_at).toLocaleString()}</span>
            <span className="text-purple-600">{s.game}</span>
            <span className="font-bold">{s.score}</span>
          </li>
        ))}
      </ul>
    </div>
  );
} 