import React, { useEffect, useState } from 'react';

function getTodayKeyword(words: string[]): string {
  // 오늘 날짜(yyyy-mm-dd) 기준 인덱스 계산 (매일 오전 9시 갱신)
  const now = new Date();
  const base = new Date(2024, 0, 1, 9, 0, 0); // 2024-01-01 09:00:00 기준
  const diffDays = Math.floor((now.getTime() - base.getTime()) / (1000 * 60 * 60 * 24));
  const idx = diffDays % words.length;
  return words[idx];
}

const STORAGE_KEY = 'commantle-messages';

export default function CommantleGame() {
  const [keyword, setKeyword] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{text: string, date: string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/commantle_keyword_list.json')
      .then(res => res.json())
      .then(data => {
        if (data.words && Array.isArray(data.words)) {
          setKeyword(getTodayKeyword(data.words));
        }
        setLoading(false);
      });
    // 오늘 날짜 기준 메시지 불러오기
    const today = new Date().toISOString().slice(0, 10);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const arr: {text: string, date: string}[] = JSON.parse(saved);
      setMessages(arr.filter((m) => m.date === today));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const today = new Date().toISOString().slice(0, 10);
    const newMsg = { text: input.trim(), date: today };
    const next = [...messages, newMsg];
    setMessages(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setInput('');
  };

  return (
    <div className="bg-github-card border border-github-border rounded-lg p-4 mt-6">
      <h3 className="text-github-text font-bold mb-2">꼬맨틀(Commantle) 게임</h3>
      <div className="text-github-muted text-sm mb-2">
        오늘의 제시어: <span className="font-bold">{loading ? '(로딩중)' : keyword}</span>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-2">
        <input
          type="text"
          className="flex-1 border border-github-border rounded px-2 py-1 bg-github-bg text-github-text"
          placeholder="한 줄 멘트를 입력하세요"
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-github-green text-white rounded px-4 py-1 font-bold disabled:opacity-60"
          disabled={loading || !input.trim()}
        >제출</button>
      </form>
      <div className="text-github-muted text-xs mt-2">오늘의 꼬맨틀</div>
      <ul className="mt-1 space-y-1">
        {messages.length === 0 && <li className="text-github-muted text-xs">아직 멘트가 없습니다.</li>}
        {messages.map((m, i) => (
          <li key={i} className="bg-github-bg border border-github-border rounded px-2 py-1 text-github-text text-sm">{m.text}</li>
        ))}
      </ul>
    </div>
  );
} 