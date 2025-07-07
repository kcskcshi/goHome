'use client';

import { useState, useEffect } from 'react';
import { CommuteRecord, MoodData } from '@/types';
import { Radar, PolarArea } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  PolarAreaController,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  PolarAreaController,
  ArcElement
);

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

  return (
    <div className="bg-github-card border border-thin border-github-borderLight rounded-md p-4">
      <h2 className="text-github-text font-medium mb-4 text-base">📊 오늘의 통계</h2>
      {(stats.myGoRank || stats.myLeaveRank) && (
        <div className="mb-3 text-center text-sm">
          <span className="font-bold text-github-green">{stats.myGoRank ? `출근 ${stats.myGoRank}등` : ''}</span>
          {stats.myGoRank && stats.myLeaveRank && <span className="mx-2">|</span>}
          <span className="font-bold text-purple-500">{stats.myLeaveRank ? `퇴근 ${stats.myLeaveRank}등` : ''}</span>
          <span className="ml-2 text-github-muted text-xs">(출근 {stats.goTotal}명, 퇴근 {stats.leaveTotal}명)</span>
        </div>
      )}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center">
          <div className="text-base font-bold text-github-green mb-1">
            {stats.totalUsers}
          </div>
          <div className="text-github-muted text-xs">참여자</div>
        </div>
        <div className="text-center">
          <div className="text-base font-bold text-yellow-500 mb-1">🌅</div>
          <div className="text-github-muted text-xs">출근왕</div>
          <div className="text-github-text text-xs mt-1 truncate">
            {stats.earlyBird}
          </div>
        </div>
        <div className="text-center">
          <div className="text-base font-bold text-purple-500 mb-1">🌙</div>
          <div className="text-github-muted text-xs">칼퇴왕</div>
          <div className="text-github-text text-xs mt-1 truncate">
            {stats.nightOwl}
          </div>
        </div>
      </div>
      {/* 기분/출근/퇴근 분포 차트 한 줄 배치 */}
      <div className="flex flex-col md:flex-row gap-4 justify-center items-stretch mb-2">
        {/* 기분 분포 (Radar) */}
        <div className="flex-1 min-w-[180px] bg-github-card border border-thin border-github-borderLight rounded-md flex flex-col items-center p-2">
          <h3 className="text-github-text text-xs font-medium mb-2 text-center flex items-center">
            <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span>
            기분 분포
          </h3>
          {stats.moodDistribution.length > 0 ? (
            <Radar
              data={{
                labels: stats.moodDistribution.map((m) => m.emoji),
                datasets: [
                  {
                    label: '기분 분포',
                    data: stats.moodDistribution.map((m) => m.count),
                    backgroundColor: 'rgba(34,197,94,0.2)',
                    borderColor: 'rgba(34,197,94,1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(34,197,94,1)',
                    pointBorderColor: '#fff',
                    pointRadius: 5,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                  r: {
                    angleLines: { display: false },
                    grid: { color: '#333' },
                    pointLabels: { color: '#fff', font: { size: 12 } },
                    ticks: { color: '#fff', stepSize: 1, backdropColor: 'transparent' },
                    min: 0,
                  },
                },
              }}
              style={{ maxWidth: 160, margin: '0 auto' }}
            />
          ) : (
            <div className="text-github-muted text-center py-4 text-xs">데이터 없음</div>
          )}
        </div>
        {/* 출근 시간 분포 (PolarArea) */}
        <div className="flex-1 min-w-[180px] bg-github-card border border-thin border-github-borderLight rounded-md flex flex-col items-center p-2">
          <h3 className="text-github-text text-xs font-medium mb-2 text-center">🌅 출근 시간 분포</h3>
          <PolarArea
            data={{
              labels: Array.from({ length: 24 }, (_, i) => `${i}시`),
              datasets: [
                {
                  label: '출근',
                  data: Array.from({ length: 24 }, (_, hour) =>
                    stats.commuteTimesGo.find((t) => t.hour === hour)?.count || 0
                  ),
                  backgroundColor: Array.from({ length: 24 }, (_, i) =>
                    `rgba(34,197,94,${0.3 + 0.7 * (i / 23)})`
                  ),
                  borderColor: 'rgba(34,197,94,1)',
                  borderWidth: 1,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                tooltip: {
                  backgroundColor: '#161b22',
                  titleColor: '#c9d1d9',
                  bodyColor: '#c9d1d9',
                  borderColor: '#21262d',
                  borderWidth: 1,
                },
              },
              scales: {
                r: {
                  grid: { color: '#333' },
                  pointLabels: { color: '#c9d1d9', font: { size: 10 } },
                  ticks: { color: '#8b949e', backdropColor: 'transparent', stepSize: 1 },
                },
              },
            }}
            style={{ maxWidth: 160, margin: '0 auto' }}
          />
        </div>
        {/* 퇴근 시간 분포 (PolarArea) */}
        <div className="flex-1 min-w-[180px] bg-github-card border border-thin border-github-borderLight rounded-md flex flex-col items-center p-2">
          <h3 className="text-github-text text-xs font-medium mb-2 text-center">🌙 퇴근 시간 분포</h3>
          <PolarArea
            data={{
              labels: Array.from({ length: 24 }, (_, i) => `${i}시`),
              datasets: [
                {
                  label: '퇴근',
                  data: Array.from({ length: 24 }, (_, hour) =>
                    stats.commuteTimesLeave.find((t) => t.hour === hour)?.count || 0
                  ),
                  backgroundColor: Array.from({ length: 24 }, (_, i) =>
                    `rgba(139,92,246,${0.3 + 0.7 * (i / 23)})`
                  ),
                  borderColor: 'rgba(139,92,246,1)',
                  borderWidth: 1,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                tooltip: {
                  backgroundColor: '#161b22',
                  titleColor: '#c9d1d9',
                  bodyColor: '#c9d1d9',
                  borderColor: '#21262d',
                  borderWidth: 1,
                },
              },
              scales: {
                r: {
                  grid: { color: '#333' },
                  pointLabels: { color: '#c9d1d9', font: { size: 10 } },
                  ticks: { color: '#8b949e', backdropColor: 'transparent', stepSize: 1 },
                },
              },
            }}
            style={{ maxWidth: 160, margin: '0 auto' }}
          />
        </div>
      </div>

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
  );
} 