'use client';

import { Card } from './ui/card';
import React from 'react';

// 데모용 mock 데이터
const mock = {
  date: '2025-07-15',
  participants: 6,
  clock_in: [
    { nickname: '행복을찾는환경운동가1579', time: '07:43', mood: '😃' },
    { nickname: '집중하는낙타2341', time: '07:49', mood: '😤' },
    { nickname: '슬픈햄스터', time: '08:01', mood: '😔' },
    { nickname: '기분좋은참새', time: '08:10', mood: '😴' },
    { nickname: '화난호랑이', time: '08:25', mood: '😡' },
  ],
  clock_out: [],
  mood_distribution: {
    '😡': 2,
    '😔': 1,
    '😤': 1,
    '😴': 1,
    '😃': 1,
  },
};

const clockInDist = [
  { name: '07:00~07:30', value: 1 },
  { name: '07:30~08:00', value: 2 },
  { name: '08:00~08:30', value: 1 },
  { name: '08:30~09:00', value: 1 },
];
const clockOutDist = [
  { name: '16:00~17:00', value: 0 },
  { name: '17:00~18:00', value: 0 },
  { name: '18:00~19:00', value: 0 },
  { name: '19:00~20:00', value: 0 },
];

function getEarlyBird(clockIn: { nickname: string; time: string; mood: string }[]): { nickname: string; time: string; mood: string } | null {
  if (!clockIn || clockIn.length === 0) return null;
  return clockIn.reduce((earliest, curr) => (curr.time < earliest.time ? curr : earliest), clockIn[0]);
}
function getNightOwl(clockOut: { nickname: string; time: string; mood: string }[]): { nickname: string; time: string; mood: string } | null {
  if (!clockOut || clockOut.length === 0) return null;
  return clockOut.reduce((earliest, curr) => (curr.time < earliest.time ? curr : earliest), clockOut[0]);
}
function getLeaveMent(notLeft: number): string {
  if (notLeft === 0) return '🎉 모두 퇴근 완료! 오늘 하루도 수고하셨습니다!';
  if (notLeft === 1) return '아직 버티는 용사: 1명 (파이팅! 💪)';
  if (notLeft <= 3) return `퇴근 대기 중: ${notLeft}명 (힘내세요! 💪)`;
  return `아직 퇴근 못한 사람: ${notLeft}명 (야근각? 😱)`;
}

// 바 그래프 유틸
function getBarHeights(values: number[], maxHeight: number = 48) {
  const max = Math.max(...values, 1);
  return values.map(v => Math.round((v / max) * maxHeight));
}

export default function StatsDashboard() {
  const earlyBird = getEarlyBird(mock.clock_in);
  const nightOwl = getNightOwl(mock.clock_out);
  const notLeft = mock.participants - (mock.clock_out?.length || 0);
  const leaveMent = getLeaveMent(notLeft);

  // 감정 분포 데이터
  const moodLabels = Object.keys(mock.mood_distribution);
  const moodCounts = Object.values(mock.mood_distribution);
  const moodBarHeights = getBarHeights(moodCounts);
  const moodTotal = moodCounts.reduce((a, b) => a + b, 0);

  // 출근/퇴근 분포 데이터
  const clockInCounts = clockInDist.map(d => d.value);
  const clockInBarHeights = getBarHeights(clockInCounts);
  const clockInTotal = clockInCounts.reduce((a, b) => a + b, 0);

  const clockOutCounts = clockOutDist.map(d => d.value);
  const clockOutBarHeights = getBarHeights(clockOutCounts);
  const clockOutTotal = clockOutCounts.reduce((a, b) => a + b, 0);

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* 상단 요약 */}
      <Card className="rounded-2xl shadow-lg p-6 bg-zinc-900 max-w-2xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold flex items-center gap-2">📅 {mock.date} (화)</span>
          <span className="text-sm text-muted-foreground flex items-center gap-1">👥 {mock.participants}명</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:gap-8 gap-1 text-base mt-2">
          <span className="flex items-center gap-2">🌅 <b>출근왕:</b> {earlyBird ? `${earlyBird.nickname} ` : '아직 없음'}
            {earlyBird && <span className="text-xs text-muted-foreground">({earlyBird.time})</span>}
          </span>
          <span className="flex items-center gap-2">🌙 <b>칼퇴왕:</b> {nightOwl ? `${nightOwl.nickname} ` : '아직 없음'}
            {nightOwl && <span className="text-xs text-muted-foreground">({nightOwl.time})</span>}
          </span>
        </div>
        <div className="mt-2 text-base flex items-center gap-2">
          🏃‍♂️ {leaveMent}
        </div>
      </Card>

      {/* 3분포 Move Goal 스타일 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* 감정 분포 카드 */}
        <Card className="rounded-2xl shadow-lg p-8 bg-zinc-900 flex flex-col items-center max-w-xs mx-auto">
          <div className="text-lg font-bold mb-1 flex items-center gap-2">😊 감정 분포</div>
          <div className="text-4xl font-extrabold text-white text-center my-2">{moodTotal}</div>
          <div className="text-xs text-muted-foreground mb-2">오늘의 감정 참여자 수</div>
          <div className="flex justify-center items-end gap-2 h-16 mt-4">
            {moodBarHeights.map((h, i) => (
              <div
                key={i}
                className={`w-4 rounded transition-all duration-300 ${h > 0 ? 'bg-emerald-400' : 'bg-zinc-700/60'}`}
                style={{ height: `${h}px` }}
                title={moodLabels[i]}
              />
            ))}
          </div>
        </Card>
        {/* 출근 분포 카드 */}
        <Card className="rounded-2xl shadow-lg p-8 bg-zinc-900 flex flex-col items-center max-w-xs mx-auto">
          <div className="text-lg font-bold mb-1 flex items-center gap-2">📊 출근 시간 분포</div>
          <div className="text-4xl font-extrabold text-white text-center my-2">{clockInTotal}</div>
          <div className="text-xs text-muted-foreground mb-2">오늘의 출근자 수</div>
          <div className="flex justify-center items-end gap-2 h-16 mt-4">
            {clockInBarHeights.map((h, i) => (
              <div
                key={i}
                className={`w-4 rounded transition-all duration-300 ${h > 0 ? 'bg-blue-500' : 'bg-zinc-700/60'}`}
                style={{ height: `${h}px` }}
                title={clockInDist[i].name}
              />
            ))}
          </div>
        </Card>
        {/* 퇴근 분포 카드 */}
        <Card className="rounded-2xl shadow-lg p-8 bg-zinc-900 flex flex-col items-center max-w-xs mx-auto">
          <div className="text-lg font-bold mb-1 flex items-center gap-2">🌙 퇴근 시간 분포</div>
          <div className="text-4xl font-extrabold text-white text-center my-2">{clockOutTotal}</div>
          <div className="text-xs text-muted-foreground mb-2">오늘의 퇴근자 수</div>
          <div className="flex justify-center items-end gap-2 h-16 mt-4">
            {clockOutBarHeights.map((h, i) => (
              <div
                key={i}
                className={`w-4 rounded transition-all duration-300 ${h > 0 ? 'bg-violet-500' : 'bg-zinc-700/60'}`}
                style={{ height: `${h}px` }}
                title={clockOutDist[i].name}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
} 