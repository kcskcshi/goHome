'use client';

import { MoodData } from '@/types';

interface FeedCardProps {
  mood: MoodData;
}

export default function FeedCard({ mood }: FeedCardProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-github-card border border-github-border rounded-lg p-4 hover:border-github-muted transition-colors">
      <div className="flex items-start space-x-3">
        <div className="text-3xl">{mood.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="text-github-text font-medium truncate">
              {mood.nickname}
            </div>
            <div className="text-github-muted text-sm flex-shrink-0">
              {formatTime(mood.timestamp)}
            </div>
          </div>
          <div className="text-github-text text-sm leading-relaxed">
            {mood.message}
          </div>
        </div>
      </div>
    </div>
  );
} 