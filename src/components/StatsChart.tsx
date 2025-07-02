'use client';

import { useState, useEffect } from 'react';
import { getTodayRecords, getTodayMoods } from '@/utils/storage';

interface StatsData {
  totalUsers: number;
  earlyBird: string;
  nightOwl: string;
  moodDistribution: { emoji: string; count: number }[];
  commuteTimes: { hour: number; count: number }[];
}

export default function StatsChart() {
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    earlyBird: '아직 없음',
    nightOwl: '아직 없음',
    moodDistribution: [],
    commuteTimes: []
  });

  useEffect(() => {
    const loadStats = () => {
      const records = getTodayRecords();
      const moods = getTodayMoods();

      // 참여자 수
      const totalUsers = new Set([
        ...moods.map(m => m.nickname),
        ...records.map(r => r.nickname)
      ]).size;

      // 출근왕/칼퇴왕
      const earlyBird = records
        .filter(r => r.type === '출근')
        .sort((a, b) => a.timestamp - b.timestamp)[0];

      const nightOwl = records
        .filter(r => r.type === '퇴근')
        .sort((a, b) => b.timestamp - a.timestamp)[0];

      // 기분 분포
      const moodCounts: { [key: string]: number } = {};
      moods.forEach(mood => {
        moodCounts[mood.emoji] = (moodCounts[mood.emoji] || 0) + 1;
      });
      const moodDistribution = Object.entries(moodCounts)
        .map(([emoji, count]) => ({ emoji, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // 출퇴근 시간 분포
      const hourCounts: { [key: number]: number } = {};
      records.forEach(record => {
        const hour = new Date(record.timestamp).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });
      const commuteTimes = Object.entries(hourCounts)
        .map(([hour, count]) => ({ hour: parseInt(hour), count }))
        .sort((a, b) => a.hour - b.hour);

      setStats({
        totalUsers,
        earlyBird: earlyBird?.nickname || '아직 없음',
        nightOwl: nightOwl?.nickname || '아직 없음',
        moodDistribution,
        commuteTimes
      });
    };

    loadStats();
    const interval = setInterval(loadStats, 30000); // 30초마다 업데이트
    return () => clearInterval(interval);
  }, []);

  const getMaxCount = (data: { count: number }[]) => {
    return Math.max(...data.map(d => d.count), 1);
  };

  return (
    <div className="bg-github-card border border-github-border rounded-lg p-6">
      <h2 className="text-github-text font-medium mb-6">📊 오늘의 통계</h2>
      
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
              {stats.moodDistribution.map((mood, index) => {
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

        {/* 출퇴근 시간 분포 */}
        {stats.commuteTimes.length > 0 && (
          <div>
            <h3 className="text-github-text text-sm font-medium mb-3">⏰ 출퇴근 시간 분포</h3>
            <div className="flex items-end space-x-1 h-20">
              {Array.from({ length: 24 }, (_, hour) => {
                const count = stats.commuteTimes.find(t => t.hour === hour)?.count || 0;
                const height = count > 0 ? (count / getMaxCount(stats.commuteTimes)) * 100 : 0;
                return (
                  <div key={hour} className="flex-1 flex flex-col items-center">
                    <div 
                      className="bg-gradient-to-t from-github-green to-green-400 rounded-t w-full transition-all duration-500"
                      style={{ height: `${height}%` }}
                    />
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