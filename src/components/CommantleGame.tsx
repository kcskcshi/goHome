import React, { useEffect, useState } from 'react';
import Hangul from 'hangul-js';

function getTodayKeyword(words: string[]): string {
  // 오늘 날짜(yyyy-mm-dd) 기준 인덱스 계산 (매일 오전 9시 갱신)
  const now = new Date();
  const base = new Date(2024, 0, 1, 9, 0, 0); // 2024-01-01 09:00:00 기준
  const diffDays = Math.floor((now.getTime() - base.getTime()) / (1000 * 60 * 60 * 24));
  const idx = diffDays % words.length;
  return words[idx];
}

const STORAGE_KEY = 'commantle-messages';
const CORRECT_KEY = 'commantle-correct';

function calcJamoSimilarity(a: string, b: string): number {
  const aj = Hangul.d(a, true).flat();
  const bj = Hangul.d(b, true).flat();
  const setA = new Set(aj);
  const setB = new Set(bj);
  const intersection = [...setA].filter(x => setB.has(x));
  return intersection.length / Math.max(setA.size, setB.size, 1);
}

function getFeedback(score: number): {msg: string, emoji: string} {
  if (score >= 0.75) return { msg: '완벽하게 통했습니다!', emoji: '🔥' };
  if (score >= 0.5) return { msg: '꽤 연관 있어요!', emoji: '😎' };
  if (score >= 0.3) return { msg: '살짝 엇나갔네요', emoji: '🤔' };
  return { msg: '노선이 좀 달라요...', emoji: '🧊' };
}

export default function CommantleGame() {
  const [keyword, setKeyword] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{text: string, date: string, sim?: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{score: number, msg: string, emoji: string} | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);

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
      const arr: {text: string, date: string, sim?: number}[] = JSON.parse(saved);
      setMessages(arr.filter((m) => m.date === today));
    }
    // 정답 여부 확인
    const correct = localStorage.getItem(CORRECT_KEY);
    if (correct === today) setIsCorrect(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !keyword) return;
    const today = new Date().toISOString().slice(0, 10);
    const sim = calcJamoSimilarity(input.trim(), keyword);
    const fb = getFeedback(sim);
    setFeedback({ score: sim, msg: fb.msg, emoji: fb.emoji });
    const newMsg = { text: input.trim(), date: today, sim };
    const next = [...messages, newMsg];
    setMessages(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setInput('');
    if (sim >= 0.75) {
      setIsCorrect(true);
      localStorage.setItem(CORRECT_KEY, today);
    }
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
          placeholder={isCorrect ? '정답을 맞추셨습니다!' : '한 줄 멘트를 입력하세요'}
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading || isCorrect}
        />
        <button
          type="submit"
          className="bg-github-green text-white rounded px-4 py-1 font-bold disabled:opacity-60"
          disabled={loading || !input.trim() || isCorrect}
        >제출</button>
      </form>
      {feedback && (
        <div className="flex items-center gap-2 mb-2">
          <div className="text-2xl">{feedback.emoji}</div>
          <div className="text-github-text font-bold">유사도: {(feedback.score * 100).toFixed(0)}%</div>
          <div className="text-github-muted text-sm">{feedback.msg}</div>
          <div className="flex-1 h-2 bg-github-border rounded ml-2">
            <div
              className="h-2 rounded bg-github-green"
              style={{ width: `${Math.round(feedback.score * 100)}%`, transition: 'width 0.7s' }}
            />
          </div>
        </div>
      )}
      <div className="text-github-muted text-xs mt-2">오늘의 꼬맨틀</div>
      <ul className="mt-1 space-y-1">
        {messages.length === 0 && <li className="text-github-muted text-xs">아직 멘트가 없습니다.</li>}
        {messages.map((m, i) => (
          <li key={i} className="bg-github-bg border border-github-border rounded px-2 py-1 text-github-text text-sm">
            {m.text}
            {typeof m.sim === 'number' && (
              <span className="ml-2 text-github-muted text-xs">({(m.sim * 100).toFixed(0)}%)</span>
            )}
          </li>
        ))}
      </ul>
      {isCorrect && (
        <div className="text-github-green font-bold mt-3">정답을 맞추셨습니다! 오늘은 더 이상 입력할 수 없습니다.</div>
      )}
    </div>
  );
} 