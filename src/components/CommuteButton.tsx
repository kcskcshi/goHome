'use client';

import { useState } from 'react';

interface CommuteButtonProps {
  type: '출근' | '퇴근';
  onClick: () => Promise<void>;
  disabled?: boolean;
  isLoading?: boolean;
  hasRecorded?: boolean;
  recordTime?: string;
}

export default function CommuteButton({
  type,
  onClick,
  disabled = false,
  isLoading = false,
  hasRecorded = false,
  recordTime,
}: CommuteButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = async () => {
    if (disabled || isLoading) return;
    
    setIsPressed(true);
    try {
      await onClick();
    } finally {
      setIsPressed(false);
    }
  };

  const getButtonText = () => {
    if (isLoading) return '처리 중...';
    if (hasRecorded) return `${type} 완료`;
    return type;
  };

  const getButtonColor = () => {
    if (hasRecorded) {
      return 'bg-github-muted text-github-text cursor-not-allowed';
    }
    if (type === '출근') {
      return 'bg-github-green hover:bg-github-green-hover text-white';
    }
    return 'bg-orange-600 hover:bg-orange-700 text-white';
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        disabled={disabled || isLoading || hasRecorded}
        className={`
          w-full py-4 px-6 rounded-lg font-medium text-lg transition-all duration-200
          ${getButtonColor()}
          ${isPressed ? 'scale-95' : ''}
          ${disabled || isLoading || hasRecorded ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}
        `}
      >
        {isLoading && (
          <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
        )}
        {getButtonText()}
      </button>
      
      {hasRecorded && recordTime && (
        <div className="text-center">
          <div className="text-github-muted text-sm">
            {type} 시간: {recordTime}
          </div>
        </div>
      )}
    </div>
  );
} 