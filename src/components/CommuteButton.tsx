'use client';

import { useState } from 'react';
import { cn } from "@/lib/utils";

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

  return (
    <div className="flex flex-col space-y-4">
      {/* 출근/퇴근 상태 표시 */}
      {hasRecorded && recordTime && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            오늘의 {type}
          </h2>
          <p className="text-[13px] text-muted-foreground">
            {type} 시간: {recordTime}
          </p>
        </div>
      )}
      {/* 버튼 영역 */}
      <div className="flex flex-col items-center justify-center mt-2">
        <button
          onClick={handleClick}
          disabled={disabled || isLoading || hasRecorded}
          className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors",
            "bg-white text-black border border-input shadow-sm",
            "hover:bg-black hover:text-white",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:pointer-events-none disabled:opacity-50",
            "h-9 px-8 py-2 mt-1",
            isPressed && "scale-98"
          )}
        >
          {isLoading && (
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
          {type}
        </button>
      </div>
    </div>
  );
} 