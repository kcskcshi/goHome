'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';

// Label, Textarea 직접 구현 (shadcn 스타일)
function Label({ children, htmlFor, className }: { children: React.ReactNode; htmlFor?: string; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={['block text-sm font-medium text-muted-foreground mb-1', className].join(' ')}>
      {children}
    </label>
  );
}
function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={['w-full rounded-md border border-gray-700 bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 resize-none', className].join(' ')}
      {...props}
    />
  );
}
// Loader (로딩 스피너)
function Loader({ className }: { className?: string }) {
  return (
    <svg className={['animate-spin h-4 w-4 text-white', className].join(' ')} viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

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
    <Card className="max-w-md mx-auto border border-gray-700">
      <CardHeader>
        <CardTitle>오늘 기분은 어떠세요?</CardTitle>
        <CardDescription>하루의 감정을 이모지와 함께 기록해보세요</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 이모지 선택 */}
          <div>
            <Label>기분 선택</Label>
            <div className="grid grid-cols-4 gap-2 mt-1">
              {MOOD_EMOJIS.map((mood) => (
                <Button
                  key={mood.emoji}
                  type="button"
                  variant={selectedEmoji === mood.emoji ? 'default' : 'outline'}
                  className={`h-12 text-lg transition-all duration-200 border ${selectedEmoji === mood.emoji ? 'scale-105 ring-2 ring-primary' : 'border-gray-700'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => setSelectedEmoji(mood.emoji)}
                  disabled={disabled}
                  title={mood.label}
                >
                  {mood.emoji}
                </Button>
              ))}
            </div>
          </div>
          {/* 메시지 입력 */}
          <div className="space-y-1">
            <Label htmlFor="message">한 줄 메시지</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={disabled || isLoading}
              placeholder="오늘 기분을 한 줄로 표현해보세요..."
              rows={2}
              maxLength={100}
            />
            <div className="text-right text-xs text-muted-foreground">{message.length}/100</div>
          </div>
          {/* 제출 버튼 */}
          <Button
            type="submit"
            className={`w-full ${(!selectedEmoji || !message.trim() || isLoading || disabled) ? 'bg-gray-200 text-gray-400 border border-gray-700 hover:bg-gray-200 hover:text-gray-400' : ''}`}
            disabled={!selectedEmoji || !message.trim() || isLoading || disabled}
          >
            {isLoading ? (
              <span className="flex items-center justify-center"><Loader className="mr-2" />공유 중...</span>
            ) : (
              '기분 공유하기'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 