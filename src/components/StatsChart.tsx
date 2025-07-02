'use client';

import { useState, useEffect } from 'react';
import { CommuteRecord, MoodData } from '@/types';

interface StatsData {
  totalUsers: number;
  earlyBird: string;
  nightOwl: string;
  moodDistribution: { emoji: string; count: number }[];
  commuteTimesGo: { hour: number; count: number }[];
  commuteTimesLeave: { hour: number; count: number }[];
  myGoRank: number | null;
  myLeaveRank: number | null;
  goTotal: number;
  leaveTotal: number;
}

interface StatsChartProps {
  commutes: CommuteRecord[];
  moods: MoodData[];
  myUuid: string;
}

export default function StatsChart({ commutes, moods, myUuid }: StatsChartProps) {
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    earlyBird: '아직 없음',
    nightOwl: '아직 없음',
    moodDistribution: [],
    commuteTimesGo: [],
    commuteTimesLeave: [],
    myGoRank: null,
    myLeaveRank: null,
    goTotal: 0,
    leaveTotal: 0,
  });

  useEffect(() => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const todayEnd = todayStart + 24 * 60 * 60 * 1000;

    // 오늘 기록만 필터링
    const todayRecords = commutes.filter(r => r.timestamp >= todayStart && r.timestamp < todayEnd);
    const todayMoods = moods.filter(m => m.timestamp >= todayStart && m.timestamp < todayEnd);

    // 출근/퇴근 분리
    const goRecords = todayRecords.filter(r => r.type === '출근').sort((a, b) => a.timestamp - b.timestamp);
    const leaveRecords = todayRecords.filter(r => r.type === '퇴근').sort((a, b) => a.timestamp - b.timestamp);

    // 내 출근/퇴근 순위
    const myGoIdx = goRecords.findIndex(r => r.uuid === myUuid);
    const myLeaveIdx = leaveRecords.findIndex(r => r.uuid === myUuid);
    const myGoRank = myGoIdx >= 0 ? myGoIdx + 1 : null;
    const myLeaveRank = myLeaveIdx >= 0 ? myLeaveIdx + 1 : null;

    // 참여자 수 (uuid 기준)
    const totalUsers = new Set([
      ...todayMoods.map(m => m.nickname),
      ...todayRecords.map(r => r.nickname)
    ]).size;

    // 출근왕/칼퇴왕
    const earlyBird = goRecords[0];
    const nightOwl = leaveRecords[leaveRecords.length - 1];

    // 기분 분포
    const moodCounts: { [key: string]: number } = {};
    todayMoods.forEach(mood => {
      moodCounts[mood.emoji] = (moodCounts[mood.emoji] || 0) + 1;
    });
    const moodDistribution = Object.entries(moodCounts)
      .map(([emoji, count]) => ({ emoji, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 출근 시간 분포
    const hourCountsGo: { [key: number]: number } = {};
    goRecords.forEach(record => {
      const hour = new Date(record.timestamp).getHours();
      hourCountsGo[hour] = (hourCountsGo[hour] || 0) + 1;
    });
    const commuteTimesGo = Object.entries(hourCountsGo)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => a.hour - b.hour);

    // 퇴근 시간 분포
    const hourCountsLeave: { [key: number]: number } = {};
    leaveRecords.forEach(record => {
      const hour = new Date(record.timestamp).getHours();
      hourCountsLeave[hour] = (hourCountsLeave[hour] || 0) + 1;
    });
    const commuteTimesLeave = Object.entries(hourCountsLeave)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => a.hour - b.hour);

    setStats({
      totalUsers,
      earlyBird: earlyBird?.nickname || '아직 없음',
      nightOwl: nightOwl?.nickname || '아직 없음',
      moodDistribution,
      commuteTimesGo,
      commuteTimesLeave,
      myGoRank,
      myLeaveRank,
      goTotal: goRecords.length,
      leaveTotal: leaveRecords.length,
    });
  }, [commutes, moods, myUuid]);

  const getMaxCount = (data: { count: number }[]) => {
    return Math.max(...data.map(d => d.count), 1);
  };

  return (
    <div className="bg-github-card border border-github-border rounded-lg p-6">
      <h2 className="text-github-text font-medium mb-6">📊 오늘의 통계</h2>
      {/* 내 출근/퇴근 순위 */}
      {(stats.myGoRank || stats.myLeaveRank) && (
        <div className="mb-4 text-center">
          <span className="font-bold text-github-green">{stats.myGoRank ? `출근 ${stats.myGoRank}등` : ''}</span>
          {stats.myGoRank && stats.myLeaveRank && <span className="mx-2">|</span>}
          <span className="font-bold text-purple-500">{stats.myLeaveRank ? `퇴근 ${stats.myLeaveRank}등` : ''}</span>
          <span className="ml-2 text-github-muted text-xs">(출근 {stats.goTotal}명, 퇴근 {stats.leaveTotal}명)</span>
        </div>
      )}
      <div className="space-y-6">
        {/* 기본 통계 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-github-green mb-1">
              {stats.totalUsers}
            </div>
            <div className="text-github-muted text-sm">참여자</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-500 mb-1">🌅</div>
            <div className="text-github-muted text-sm">출근왕</div>
            <div className="text-github-text text-xs mt-1 truncate">
              {stats.earlyBird}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-500 mb-1">🌙</div>
            <div className="text-github-muted text-sm">칼퇴왕</div>
            <div className="text-github-text text-xs mt-1 truncate">
              {stats.nightOwl}
            </div>
          </div>
        </div>

        {/* 기분 분포 그래프 */}
        {stats.moodDistribution.length > 0 && (
          <div>
            <h3 className="text-github-text text-sm font-medium mb-3">😊 기분 분포</h3>
            <div className="space-y-2">
              {stats.moodDistribution.map((mood: { emoji: string; count: number }) => {
                const percentage = (mood.count / getMaxCount(stats.moodDistribution)) * 100;
                return (
                  <div key={mood.emoji} className="flex items-center space-x-3">
                    <div className="text-lg w-6">{mood.emoji}</div>
                    <div className="flex-1">
                      <div className="bg-github-bg rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-github-green to-green-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-github-muted text-xs w-8 text-right">
                      {mood.count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 출근 시간 분포 */}
        {stats.commuteTimesGo.length > 0 && (
          <div>
            <h3 className="text-github-text text-sm font-medium mb-3">🌅 출근 시간 분포</h3>
            <div className="flex items-end space-x-1 h-20">
              {Array.from({ length: 24 }, (_, hour) => {
                const count = stats.commuteTimesGo.find((t) => t.hour === hour)?.count || 0;
                const height = count > 0 ? (count / (stats.goTotal || 1)) * 100 : 0;
                return (
                  <div key={hour} className="flex-1 flex flex-col items-center">
                    {count > 0 ? (
                      <>
                        <div
                          className="bg-gradient-to-t from-green-600 to-green-800 rounded-t w-full transition-all duration-500 min-h-[10px] border border-green-900"
                          style={{ height: `${height}%` }}
                        />
                        <div className="text-xs font-bold text-green-200 -mt-5 mb-1 text-center select-none" style={{ zIndex: 1 }}>
                          {count}
                        </div>
                      </>
                    ) : (
                      <div className="w-full" style={{ height: 0 }} />
                    )}
                    <div className="text-github-muted text-xs mt-1">
                      {hour.toString().padStart(2, '0')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 퇴근 시간 분포 */}
        {stats.commuteTimesLeave.length > 0 && (
          <div>
            <h3 className="text-github-text text-sm font-medium mb-3">🌙 퇴근 시간 분포</h3>
            <div className="flex items-end space-x-1 h-20">
              {Array.from({ length: 24 }, (_, hour) => {
                const count = stats.commuteTimesLeave.find((t) => t.hour === hour)?.count || 0;
                const height = count > 0 ? (count / (stats.leaveTotal || 1)) * 100 : 0;
                return (
                  <div key={hour} className="flex-1 flex flex-col items-center">
                    {count > 0 ? (
                      <>
                        <div
                          className="bg-gradient-to-t from-red-600 to-red-800 rounded-t w-full transition-all duration-500 min-h-[10px] border border-red-900"
                          style={{ height: `${height}%` }}
                        />
                        <div className="text-xs font-bold text-red-200 -mt-5 mb-1 text-center select-none" style={{ zIndex: 1 }}>
                          {count}
                        </div>
                      </>
                    ) : (
                      <div className="w-full" style={{ height: 0 }} />
                    )}
                    <div className="text-github-muted text-xs mt-1">
                      {hour.toString().padStart(2, '0')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 빈 상태 */}
        {stats.totalUsers === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📈</div>
            <div className="text-github-muted">
              아직 데이터가 없어요.
            </div>
            <div className="text-github-muted text-sm mt-2">
              첫 번째로 출근/퇴근을 기록해보세요!
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 