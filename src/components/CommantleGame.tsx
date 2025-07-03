import React, { useEffect, useState } from 'react';

function getTodayKeyword(words: string[]): string {
  // 오늘 날짜(yyyy-mm-dd) 기준 인덱스 계산 (매일 오전 9시 갱신)
  const now = new Date();
  const base = new Date(2024, 0, 1, 9, 0, 0); // 2024-01-01 09:00:00 기준
  const diffDays = Math.floor((now.getTime() - base.getTime()) / (1000 * 60 * 60 * 24));
  const idx = diffDays % words.length;
  return words[idx];
}

export default function CommantleGame() {
  const [keyword, setKeyword] = useState<string | null>(null);

  useEffect(() => {
    fetch('/commantle_keyword_list.json')
      .then(res => res.json())
      .then(data => {
        if (data.words && Array.isArray(data.words)) {
          setKeyword(getTodayKeyword(data.words));
        }
      });
  }, []);

  return (
    <div className="bg-github-card border border-github-border rounded-lg p-4 mt-6">
      <h3 className="text-github-text font-bold mb-2">꼬맨틀(Commantle) 게임</h3>
      <div className="text-github-muted text-sm mb-2">
        오늘의 제시어: <span className="font-bold">{keyword ? keyword : '(로딩중)'}</span>
      </div>
      <input type="text" className="w-full border border-github-border rounded px-2 py-1 mb-2 bg-github-bg text-github-text" placeholder="한 줄 멘트를 입력하세요" disabled />
      <button className="w-full bg-github-green text-white rounded py-1 font-bold opacity-60 cursor-not-allowed" disabled>제출</button>
      <div className="text-github-muted text-xs mt-2">(멘트 리스트 자리)</div>
    </div>
  );
} 