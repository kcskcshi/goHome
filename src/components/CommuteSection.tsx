import { useState, useCallback } from 'react';
import { useCommutes } from '@/hooks/useCommutes';
import { useCommutesRealtime } from '@/hooks/useCommutesRealtime';

interface CommuteSectionProps {
  uuid: string;
  nickname: string;
}

export default function CommuteSection({ uuid, nickname }: CommuteSectionProps) {
  const [mood, setMood] = useState('');
  const [message, setMessage] = useState('');
  const { records, loading, error, fetchCommutes, addCommute } = useCommutes(uuid);

  useCommutesRealtime(uuid, useCallback(() => {
    fetchCommutes();
  }, [fetchCommutes]));

  const handleCommute = (type: 'in' | 'out') => {
    addCommute(type, nickname, mood, message);
    setMessage('');
  };

  return (
    <div className="p-4 bg-white rounded shadow w-full max-w-md mx-auto">
      <h2 className="text-lg font-bold mb-2">출퇴근 기록</h2>
      <div className="flex gap-2 mb-2">
        <button
          className="px-3 py-1 bg-green-500 text-white rounded"
          onClick={() => handleCommute('in')}
          disabled={loading}
        >
          출근
        </button>
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded"
          onClick={() => handleCommute('out')}
          disabled={loading}
        >
          퇴근
        </button>
        <input
          className="border px-2 py-1 rounded"
          placeholder="오늘 기분(이모지)"
          value={mood}
          onChange={e => setMood(e.target.value)}
          style={{ width: 60 }}
        />
        <input
          className="border px-2 py-1 rounded flex-1"
          placeholder="메시지"
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
      </div>
      {error && <div className="text-red-500">{error}</div>}
      <ul className="divide-y">
        {records.map(r => (
          <li key={r.id} className="py-2 flex items-center gap-2">
            <span className="font-mono text-xs text-gray-400">{new Date(r.timestamp).toLocaleString()}</span>
            <span className={r.type === 'in' ? 'text-green-600' : 'text-blue-600'}>
              {r.type === 'in' ? '출근' : '퇴근'}
            </span>
            <span>{r.mood}</span>
            <span className="text-gray-500">{r.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
} 