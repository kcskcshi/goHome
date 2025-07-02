'use client';

import { useState } from 'react';

const MOOD_EMOJIS = [
  { emoji: '😊', label: '행복' },
  { emoji: '😃', label: '신남' },
  { emoji: '😌', label: '평온' },
  { emoji: '😴', label: '졸림' },
  { emoji: '😤', label: '열심' },
  { emoji: '😅', label: '힘듦' },
  { emoji: '😔', label: '우울' },
  { emoji: '😡', label: '화남' },
];

interface MoodInputProps {
  onSubmit: (emoji: string, message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export default function MoodInput({ onSubmit, isLoading = false, disabled = false }: MoodInputProps) {
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmoji || !message.trim() || isLoading || disabled) return;
    
    onSubmit(selectedEmoji, message.trim());
    setMessage('');
  };

  return (
    <div className="bg-github-card border border-github-border rounded-lg p-6">
      <h3 className="text-github-text font-medium mb-4">오늘 기분은 어떠세요?</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 이모지 선택 */}
        <div>
          <label className="block text-github-muted text-sm mb-2">기분 선택</label>
          <div className="grid grid-cols-4 gap-2">
            {MOOD_EMOJIS.map((mood) => (
              <button
                key={mood.emoji}
                type="button"
                onClick={() => setSelectedEmoji(mood.emoji)}
                disabled={disabled}
                className={`
                  p-3 rounded-lg text-2xl transition-all duration-200
                  ${selectedEmoji === mood.emoji
                    ? 'bg-github-green text-white'
                    : 'bg-github-bg border border-github-border text-github-text hover:border-github-muted'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
                `}
                title={mood.label}
              >
                {mood.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* 메시지 입력 */}
        <div>
          <label htmlFor="message" className="block text-github-muted text-sm mb-2">
            한 줄 메시지
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={disabled || isLoading}
            placeholder="오늘 기분을 한 줄로 표현해보세요..."
            className="w-full px-3 py-2 bg-github-bg border border-github-border rounded-md text-github-text placeholder-github-muted resize-none focus:outline-none focus:border-github-green"
            rows={3}
            maxLength={100}
          />
          <div className="text-right text-github-muted text-xs mt-1">
            {message.length}/100
          </div>
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={!selectedEmoji || !message.trim() || isLoading || disabled}
          className={`
            w-full py-3 px-4 rounded-md font-medium transition-all duration-200
            ${selectedEmoji && message.trim() && !isLoading && !disabled
              ? 'bg-github-green hover:bg-github-green-hover text-white'
              : 'bg-github-muted text-github-text cursor-not-allowed opacity-50'
            }
          `}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              공유 중...
            </div>
          ) : (
            '기분 공유하기'
          )}
        </button>
      </form>
    </div>
  );
} 