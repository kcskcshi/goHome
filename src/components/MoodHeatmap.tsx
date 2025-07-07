'use client';

import { useState, useEffect } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { MoodData } from '@/types';
import GameSimilarity from './GameSimilarity';

interface MoodHeatmapProps {
  moods: MoodData[];
}

interface HeatmapValue {
  date: string;
  count: number;
  mood: string;
  message: string;
  nickname: string;
}

export default function MoodHeatmap({ moods }: MoodHeatmapProps) {
  const [heatmapData, setHeatmapData] = useState<HeatmapValue[]>([]);

  useEffect(() => {
    // 최근 365일 데이터 생성
    const data: HeatmapValue[] = [];
    const today = new Date();
    
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // 해당 날짜의 기분 데이터 찾기
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      
      const dayMoods = moods.filter(mood => 
        mood.timestamp >= dayStart && mood.timestamp < dayEnd
      );
      
      if (dayMoods.length > 0) {
        // 가장 많은 기분을 대표로 사용
        const moodCounts: { [key: string]: number } = {};
        dayMoods.forEach(mood => {
          moodCounts[mood.emoji] = (moodCounts[mood.emoji] || 0) + 1;
        });
        
        const dominantMood = Object.entries(moodCounts)
          .sort(([,a], [,b]) => b - a)[0][0];
        
        const latestMood = dayMoods.sort((a, b) => b.timestamp - a.timestamp)[0];
        
        data.push({
          date: dateStr,
          count: dayMoods.length,
          mood: dominantMood,
          message: latestMood.message,
          nickname: latestMood.nickname,
        });
      } else {
        data.push({
          date: dateStr,
          count: 0,
          mood: '',
          message: '',
          nickname: '',
        });
      }
    }
    
    setHeatmapData(data);
  }, [moods]);

  return (
    <div className="bg-github-card border border-github-border rounded-lg p-6">
      <h2 className="text-github-text font-medium mb-4 flex items-center">
        <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span>
        기분 분포 (365일)
      </h2>
      
      <div className="overflow-x-auto">
        <CalendarHeatmap
          startDate={new Date(new Date().setDate(new Date().getDate() - 364))}
          endDate={new Date()}
          values={heatmapData}
          classForValue={(value) => {
            if (!value) return 'color-empty';
            return `color-scale-${Math.min(value.count, 4)}`;
          }}
          titleForValue={(value) => {
            if (!value || value.count === 0) return `${value?.date}: 기록 없음`;
            return `${value.date}: ${value.mood} ${value.nickname} - "${value.message}"`;
          }}
        />
      </div>
      
      <GameSimilarity similarities={[
        { name: '워들', percent: 92 },
        { name: '밸런스게임', percent: 85 },
        { name: '밈퀴즈', percent: 77 },
        { name: '심리테스트', percent: 60 },
        { name: '직장인톡', percent: 41 },
      ]} />
      
      <style jsx>{`
        :global(.react-calendar-heatmap) {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
        }
        
        :global(.react-calendar-heatmap .color-empty) {
          fill: #161b22;
        }
        
        :global(.react-calendar-heatmap .color-scale-0) {
          fill: #161b22;
        }
        
        :global(.react-calendar-heatmap .color-scale-1) {
          fill: #0e4429;
        }
        
        :global(.react-calendar-heatmap .color-scale-2) {
          fill: #006d32;
        }
        
        :global(.react-calendar-heatmap .color-scale-3) {
          fill: #26a641;
        }
        
        :global(.react-calendar-heatmap .color-scale-4) {
          fill: #39d353;
        }
        
        :global(.react-calendar-heatmap text) {
          fill: #8b949e;
          font-size: 10px;
        }
        
        :global(.react-calendar-heatmap .react-calendar-heatmap-small-text) {
          font-size: 5px;
        }
        
        :global(.react-calendar-heatmap rect:hover) {
          stroke: #f78166;
          stroke-width: 1px;
        }
      `}</style>
    </div>
  );
} 