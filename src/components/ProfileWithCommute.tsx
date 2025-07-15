"use client";

import { useState } from 'react';
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ProfileWithCommuteProps {
  nickname: string;
  userId: string;
  onCommute: (type: '출근' | '퇴근') => Promise<void>;
  commuteTime?: {
    start?: string;
    end?: string;
  };
  isLoading?: boolean;
}

export default function ProfileWithCommute({
  nickname,
  userId,
  onCommute,
  commuteTime,
  isLoading = false
}: ProfileWithCommuteProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleCommute = async (type: '출근' | '퇴근') => {
    if (isLoading) return;
    setIsPressed(true);
    try {
      await onCommute(type);
    } finally {
      setIsPressed(false);
    }
  };

  // 닉네임에서 이니셜 추출
  const getInitials = (name: string) => name.slice(0, 2);

  return (
    <div className="flex flex-col space-y-4 p-4 rounded-lg bg-card text-card-foreground shadow-sm">
      <div className="flex items-center space-x-4">
        {/* Avatar */}
        <Avatar className="h-12 w-12">
          <AvatarImage 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(nickname)}&backgroundColor=transparent&radius=50`}
            alt={nickname}
          />
          <AvatarFallback className="bg-black text-white text-lg">
            {getInitials(nickname)}
          </AvatarFallback>
        </Avatar>
        {/* 프로필 정보 */}
        <div className="space-y-1">
          <h2 className="text-sm font-medium leading-none">{nickname}</h2>
          <p className="text-xs text-muted-foreground">{userId}</p>
        </div>
      </div>
      {/* 출퇴근 영역 */}
      <div className="space-y-3 pt-2">
        {/* 출근 영역 */}
        <div className="space-y-2">
          <button
            onClick={() => handleCommute('출근')}
            disabled={isLoading || !!commuteTime?.start}
            className={cn(
              "w-full inline-flex items-center justify-center",
              "rounded-md text-sm font-medium transition-colors",
              "bg-white text-black border border-input shadow-sm",
              "hover:bg-black hover:text-white",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              "disabled:pointer-events-none disabled:opacity-50",
              "h-9 px-4",
              isPressed && "scale-98"
            )}
          >
            {isLoading ? (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : null}
            {commuteTime?.start ? `출근 완료 (${commuteTime.start})` : '출근하기'}
          </button>
        </div>
        {/* 퇴근 영역 */}
        <div className="space-y-2">
          <button
            onClick={() => handleCommute('퇴근')}
            disabled={isLoading || !commuteTime?.start || !!commuteTime?.end}
            className={cn(
              "w-full inline-flex items-center justify-center",
              "rounded-md text-sm font-medium transition-colors",
              "bg-white text-black border border-input shadow-sm",
              "hover:bg-black hover:text-white",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              "disabled:pointer-events-none disabled:opacity-50",
              "h-9 px-4",
              isPressed && "scale-98"
            )}
          >
            {isLoading ? (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : null}
            {commuteTime?.end ? `퇴근 완료 (${commuteTime.end})` : '퇴근하기'}
          </button>
        </div>
      </div>
    </div>
  );
} 