'use client';

import { useEffect, useMemo } from 'react';
import { CommuteRecord, MoodData } from '@/types';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
// chartjs-plugin-datalabels 타입 import
import * as ChartDataLabels from 'chartjs-plugin-datalabels';
import type { Options as DatalabelsOptions } from 'chartjs-plugin-datalabels/types/options';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

interface StatsChartProps {
  commutes: CommuteRecord[];
  moods: MoodData[];
  myUuid: string;
}

export default function StatsChart({ commutes, moods, myUuid }: StatsChartProps) {
  // stats 상태 제거, 대신 useMemo로 모든 통계 데이터 계산
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const todayEnd = todayStart + 24 * 60 * 60 * 1000;

  const todayMoods = useMemo(() => moods.filter(m => m.timestamp >= todayStart && m.timestamp < todayEnd), [moods, todayStart, todayEnd]);
  const todayRecords = useMemo(() => commutes.filter(r => r.timestamp >= todayStart && r.timestamp < todayEnd), [commutes, todayStart, todayEnd]);

  const moodDistribution = useMemo(() => {
    const moodCounts: { [key: string]: number } = {};
    todayMoods.forEach(mood => {
      moodCounts[mood.emoji] = (moodCounts[mood.emoji] || 0) + 1;
    });
    return Object.entries(moodCounts)
      .map(([emoji, count]) => ({ emoji, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [todayMoods]);

  const goRecords = useMemo(() => todayRecords.filter(r => r.type === '출근').sort((a, b) => a.timestamp - b.timestamp), [todayRecords]);
  const leaveRecords = useMemo(() => todayRecords.filter(r => r.type === '퇴근').sort((a, b) => a.timestamp - b.timestamp), [todayRecords]);

  const myGoRank = useMemo(() => {
    const idx = goRecords.findIndex(r => r.uuid === myUuid);
    return idx >= 0 ? idx + 1 : null;
  }, [goRecords, myUuid]);
  const myLeaveRank = useMemo(() => {
    const idx = leaveRecords.findIndex(r => r.uuid === myUuid);
    return idx >= 0 ? idx + 1 : null;
  }, [leaveRecords, myUuid]);

  const totalUsers = useMemo(() => new Set([
    ...todayMoods.map(m => m.nickname),
    ...todayRecords.map(r => r.nickname)
  ]).size, [todayMoods, todayRecords]);

  const earlyBird = useMemo(() => goRecords[0]?.nickname || '아직 없음', [goRecords]);
  const nightOwl = useMemo(() => leaveRecords[0]?.nickname || '아직 없음', [leaveRecords]);

  const commuteTimesGo = useMemo(() => {
    const hourCounts: { [key: number]: number } = {};
    goRecords.forEach(record => {
      const hour = new Date(record.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    return Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => a.hour - b.hour);
  }, [goRecords]);

  const commuteTimesLeave = useMemo(() => {
    const hourCounts: { [key: number]: number } = {};
    leaveRecords.forEach(record => {
      const hour = new Date(record.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    return Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => a.hour - b.hour);
  }, [leaveRecords]);

  useEffect(() => {
    // 참여자 수 (uuid 기준)
    // 출근왕/칼퇴왕
    // 출근 시간 분포
    // 퇴근 시간 분포
  }, [commutes, moods, myUuid, moodDistribution]);

  return (
    <div className="bg-github-card border border-thin border-github-border rounded-md p-4">
      <h2 className="text-github-text font-bold mb-4 text-lg">📊 오늘의 통계</h2>
      {(myGoRank || myLeaveRank) && (
        <div className="mb-3 text-center text-sm">
          <span className="font-bold text-github-green">{myGoRank ? `출근 ${myGoRank}등` : ''}</span>
          {myGoRank && myLeaveRank && <span className="mx-2">|</span>}
          <span className="font-bold text-purple-500">{myLeaveRank ? `퇴근 ${myLeaveRank}등` : ''}</span>
          <span className="ml-2 text-github-muted text-xs">(출근 {goRecords.length}명, 퇴근 {leaveRecords.length}명)</span>
        </div>
      )}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center">
          <div className="text-base font-bold text-github-green mb-1">
            {totalUsers}
          </div>
          <div className="text-github-muted text-xs">참여자</div>
        </div>
        <div className="text-center">
          <div className="text-base font-bold text-yellow-500 mb-1">🌅</div>
          <div className="text-github-muted text-xs">출근왕</div>
          <div className="text-github-text text-xs mt-1 truncate">
            {earlyBird}
          </div>
        </div>
        <div className="text-center">
          <div className="text-base font-bold text-purple-500 mb-1">🌙</div>
          <div className="text-github-muted text-xs">칼퇴왕</div>
          <div className="text-github-text text-xs mt-1 truncate">
            {nightOwl}
          </div>
        </div>
      </div>
      {/* 기분/출근/퇴근 분포 차트 한 줄 배치 */}
      <div className="flex flex-col md:flex-row gap-4 justify-center items-stretch mb-2">
        {/* 기분 분포 (BarChart) */}
        <div className="flex-1 min-w-[180px] bg-github-card border border-thin border-github-border rounded-md flex flex-col items-center p-2">
          <h3 className="text-github-text text-xs font-medium mb-2 text-center flex items-center">
            <span className="w-2 h-2 rounded-full bg-gray-400 mr-2"></span>
            기분 분포
          </h3>
          {moodDistribution.length > 0 ? (
            <>
              <Bar
                data={{
                  labels: moodDistribution.map((m) => m.emoji),
                  datasets: [
                    {
                      label: '기분 분포',
                      data: moodDistribution.map((m) => m.count),
                      backgroundColor: 'rgba(107,114,128,0.7)', // gray-500
                      borderColor: 'rgba(55,65,81,1)', // gray-700
                      borderWidth: 1,
                      borderRadius: 8,
                      maxBarThickness: 32,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    datalabels: {
                      anchor: 'end',
                      align: 'end',
                      color: '#111',
                      font: { weight: 'bold', size: 16 },
                      formatter: (value: number) => {
                        return `${value}`;
                      },
                    } as DatalabelsOptions,
                  },
                  scales: {
                    x: {
                      grid: { display: false },
                      ticks: { color: '#6b7280', font: { size: 14 } },
                    },
                    y: {
                      beginAtZero: true,
                      grid: { color: '#e5e7eb' },
                      ticks: { color: '#6b7280', stepSize: 1 },
                    },
                  },
                }}
                plugins={[ChartDataLabels.default]}
                style={{ maxHeight: 180, maxWidth: 220, margin: '0 auto' }}
              />
            </>
          ) : (
            <div className="text-github-muted text-center py-4 text-xs">데이터 없음</div>
          )}
        </div>
        {/* 출근 시간 분포 (BarChart) */}
        <div className="flex-1 min-w-[180px] bg-github-card border border-thin border-github-border rounded-md flex flex-col items-center p-2">
          <h3 className="text-github-text text-xs font-medium mb-2 text-center">🌅 출근 시간 분포</h3>
          <Bar
            data={{
              labels: commuteTimesGo.map((t) => `${t.hour}시`),
              datasets: [
                {
                  label: '출근',
                  data: commuteTimesGo.map((t) => t.count),
                  backgroundColor: 'rgba(156,163,175,0.7)', // gray-400
                  borderColor: 'rgba(75,85,99,1)', // gray-600
                  borderWidth: 1,
                  borderRadius: 8,
                  maxBarThickness: 32,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                datalabels: {
                  anchor: 'end',
                  align: 'end',
                  color: '#111',
                  font: { weight: 'bold', size: 14 },
                  formatter: (value: number) => {
                    return `🚶‍♂️ ${value}`;
                  },
                } as DatalabelsOptions,
              },
              scales: {
                x: {
                  grid: { display: false },
                  ticks: { color: '#6b7280', font: { size: 12 } },
                },
                y: {
                  beginAtZero: true,
                  grid: { color: '#e5e7eb' },
                  ticks: { color: '#6b7280', stepSize: 1 },
                },
              },
            }}
            plugins={[ChartDataLabels.default]}
            style={{ maxHeight: 180, maxWidth: 220, margin: '0 auto' }}
          />
          {/* 범례 */}
          <div className="flex justify-center gap-2 mt-2 text-xs">
            <span className="flex items-center gap-1"><span>🚶‍♂️</span>출근자</span>
          </div>
        </div>
        {/* 퇴근 시간 분포 (BarChart) */}
        <div className="flex-1 min-w-[180px] bg-github-card border border-thin border-github-border rounded-md flex flex-col items-center p-2">
          <h3 className="text-github-text text-xs font-medium mb-2 text-center">🌙 퇴근 시간 분포</h3>
          <Bar
            data={{
              labels: commuteTimesLeave.map((t) => `${t.hour}시`),
              datasets: [
                {
                  label: '퇴근',
                  data: commuteTimesLeave.map((t) => t.count),
                  backgroundColor: 'rgba(209,213,219,0.7)', // gray-200
                  borderColor: 'rgba(107,114,128,1)', // gray-500
                  borderWidth: 1,
                  borderRadius: 8,
                  maxBarThickness: 32,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                datalabels: {
                  anchor: 'end',
                  align: 'end',
                  color: '#111',
                  font: { weight: 'bold', size: 14 },
                  formatter: (value: number) => {
                    return `🏠 ${value}`;
                  },
                } as DatalabelsOptions,
              },
              scales: {
                x: {
                  grid: { display: false },
                  ticks: { color: '#6b7280', font: { size: 12 } },
                },
                y: {
                  beginAtZero: true,
                  grid: { color: '#e5e7eb' },
                  ticks: { color: '#6b7280', stepSize: 1 },
                },
              },
            }}
            plugins={[ChartDataLabels.default]}
            style={{ maxHeight: 180, maxWidth: 220, margin: '0 auto' }}
          />
          {/* 범례 */}
          <div className="flex justify-center gap-2 mt-2 text-xs">
            <span className="flex items-center gap-1"><span>🏠</span>퇴근자</span>
          </div>
        </div>
      </div>

      {/* 빈 상태 */}
      {totalUsers === 0 && (
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