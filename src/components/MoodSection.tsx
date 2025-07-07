import { useState, useCallback } from 'react';
import { useMoods } from '@/hooks/useMoods';
import { useMoodsRealtime } from '@/hooks/useMoodsRealtime';

interface MoodSectionProps {
  uuid: string;
  nickname: string;
}

export default function MoodSection({ uuid, nickname }: MoodSectionProps) {
  const [emoji, setEmoji] = useState('');
  const [message, setMessage] = useState('');
  const { moods, loading, error, fetchMoods, addMood } = useMoods(uuid);

  useMoodsRealtime(uuid, useCallback(() => {
    fetchMoods();
  }, [fetchMoods]));

  const handleAddMood = () => {
    if (!emoji) return;
    addMood(emoji, message, nickname);
    setMessage('');
  };

  return (
    <div className="p-4 bg-white rounded shadow w-full max-w-md mx-auto mt-4">
      <h2 className="text-lg font-bold mb-2">기분 기록</h2>
      <div className="flex gap-2 mb-2">
        <input
          className="border px-2 py-1 rounded w-16"
          placeholder="이모지"
          value={emoji}
          onChange={e => setEmoji(e.target.value)}
        />
        <input
          className="border px-2 py-1 rounded flex-1"
          placeholder="메시지"
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
        <button
          className="px-3 py-1 bg-yellow-500 text-white rounded"
          onClick={handleAddMood}
          disabled={loading}
        >
          기록
        </button>
      </div>
      {error && <div className="text-red-500">{error}</div>}
      <ul className="divide-y">
        {moods.map(m => (
          <li key={m.id} className="py-2 flex items-center gap-2">
            <span className="font-mono text-xs text-gray-400">{new Date(m.timestamp).toLocaleString()}</span>
            <span className="text-2xl">{m.emoji}</span>
            <span className="text-gray-500">{m.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
} 