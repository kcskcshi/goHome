import React from 'react';

export default function CommantleGame() {
  // TODO: 실제 게임 로직/상태는 추후 구현
  return (
    <div className="bg-github-card border border-github-border rounded-lg p-4 mt-6">
      <h3 className="text-github-text font-bold mb-2">꼬맨틀(Commantle) 게임</h3>
      <div className="text-github-muted text-sm mb-2">오늘의 제시어: <span className="font-bold">(로딩중)</span></div>
      <input type="text" className="w-full border border-github-border rounded px-2 py-1 mb-2 bg-github-bg text-github-text" placeholder="한 줄 멘트를 입력하세요" disabled />
      <button className="w-full bg-github-green text-white rounded py-1 font-bold opacity-60 cursor-not-allowed" disabled>제출</button>
      <div className="text-github-muted text-xs mt-2">(멘트 리스트 자리)</div>
    </div>
  );
} 