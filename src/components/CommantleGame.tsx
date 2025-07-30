import React, { useEffect, useState } from 'react';
import Hangul from 'hangul-js';
import { useSupabase } from '@/hooks/useSupabase';
import DinoRunnerGame from './DinoRunnerGame';
import { sampleSize } from 'lodash';

// 100개 단어 상수 배열 (내장 배열 제거, 외부 JSON에서 불러옴)
// const COMMANTLE_WORDS = [ ... ]; // 제거

// 초성 추출 함수
function getChoseong(word: string): string {
  const syllables = Hangul.d(word, true);
  return syllables.map(syllable => syllable[0]).join('');
}

const STORAGE_KEY = 'commantle-messages';
const CORRECT_KEY = 'commantle-correct';
const HINT_KEY = 'commantle-hint';

// Levenshtein 거리 계산 함수
function levenshtein(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0)
  );
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return matrix[a.length][b.length];
}

// 자모 단위로 변환 후 Levenshtein 유사도 계산
function calcLevenshteinSimilarity(a: string, b: string): number {
  // 한글 자모 분해 후 문자열로 변환
  const aj = Hangul.d(a, true).flat().join('');
  const bj = Hangul.d(b, true).flat().join('');
  const dist = levenshtein(aj, bj);
  return 1 - dist / Math.max(aj.length, bj.length, 1);
}

function getFeedback(score: number): {msg: string, emoji: string} {
  if (score >= 1.0) return { msg: '완벽하게 일치합니다!', emoji: '🎉' };
  if (score >= 0.75) return { msg: '거의 맞췄어요!', emoji: '🔥' };
  if (score >= 0.5) return { msg: '꽤 연관 있어요!', emoji: '😎' };
  if (score >= 0.3) return { msg: '살짝 엇나갔네요', emoji: '🤔' };
  return { msg: '노선이 좀 달라요...', emoji: '🧊' };
}

export default function CommantleGame({ uuid, nickname }: { uuid: string, nickname: string }) {
  const [keyword, setKeyword] = useState<string | null>(null);
  const [related, setRelated] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{text: string, date: string, sim?: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{score: number, msg: string, emoji: string} | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const { addGameScore, fetchGameScores } = useSupabase();
  const [activeTab, setActiveTab] = useState<'commantle' | 'dino'>('commantle');
  const [hintCount, setHintCount] = useState(0);

  useEffect(() => {
    // 외부 JSON에서 단어 불러오기
    fetch('./commantle_keyword_list.json')
      .then(res => {
        if (!res.ok) throw new Error('단어 리스트를 불러오지 못했습니다.');
        return res.json();
      })
      .then(data => {
        if (!data.words || !Array.isArray(data.words) || data.words.length === 0) {
          throw new Error('단어 리스트가 비어있습니다.');
        }
        // 새 구조: [{keyword, related}] 배열
        const wordsArr = data.words;
        const todayIdx = (() => {
          const now = new Date();
          const base = new Date(2024, 0, 1, 0, 0, 0);
          const diffDays = Math.floor((now.getTime() - base.getTime()) / (1000 * 60 * 60 * 24));
          return diffDays % wordsArr.length;
        })();
        const todayObj = wordsArr[todayIdx];
        setKeyword(todayObj.keyword);
        setRelated(todayObj.related || []);
        setLoading(false);

        // 오늘 날짜 기준 메시지/정답 기록 관리 (키워드까지 체크)
        const today = new Date().toISOString().slice(0, 10);
        
        // 🔥 핵심 수정: feedback 상태 초기화 추가
        setFeedback(null);
        
        // commantle-messages: 오늘 날짜만 남기고 나머지 삭제
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const arr: {text: string, date: string, sim?: number}[] = JSON.parse(saved);
          const todayArr = arr.filter((m) => m.date === today);
          setMessages(todayArr);
          if (todayArr.length !== arr.length) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(todayArr));
          }
        }
        // commantle-correct: {date, keyword} 구조로 저장, 둘 중 하나라도 다르면 삭제
        const correctRaw = localStorage.getItem(CORRECT_KEY);
        let isCorrectToday = false;
        if (correctRaw) {
          try {
            const correctObj = JSON.parse(correctRaw);
            if (correctObj && correctObj.date === today && correctObj.keyword === todayObj.keyword) {
              isCorrectToday = true;
            } else {
              localStorage.removeItem(CORRECT_KEY);
            }
          } catch {
            localStorage.removeItem(CORRECT_KEY);
          }
        }
        setIsCorrect(isCorrectToday);
        // 힌트 카운트: 날짜 다르면 0으로 초기화
        const hintRaw = localStorage.getItem(HINT_KEY);
        let todayHintCount = 0;
        if (hintRaw) {
          try {
            const hintObj = JSON.parse(hintRaw);
            if (hintObj && hintObj.date === today) {
              todayHintCount = hintObj.count || 0;
            } else {
              localStorage.setItem(HINT_KEY, JSON.stringify({ date: today, count: 0 }));
            }
          } catch {
            localStorage.setItem(HINT_KEY, JSON.stringify({ date: today, count: 0 }));
          }
        } else {
          localStorage.setItem(HINT_KEY, JSON.stringify({ date: today, count: 0 }));
        }
        setHintCount(todayHintCount);
      })
      .catch(err => {
        setError(err.message || '단어 불러오기 오류');
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !keyword) return;
    const today = new Date().toISOString().slice(0, 10);
    const sim = calcLevenshteinSimilarity(input.trim(), keyword);
    const fb = getFeedback(sim);
    setFeedback({ score: sim, msg: fb.msg, emoji: fb.emoji });
    const newMsg = { text: input.trim(), date: today, sim };
    const next = [...messages, newMsg];
    setMessages(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setInput('');
    // 🔥 핵심 수정: 재시도 카운트 로직 개선
    if (sim < 1.0) {
      // 오늘의 재시도 횟수 = 오늘 메시지 개수
      const todayRetryCount = next.length;
      if (todayRetryCount >= 30 && hintCount === 0) {
        setHintCount(1);
        localStorage.setItem(HINT_KEY, JSON.stringify({ date: today, count: 1 }));
      }
    }
    // 100% 일치해야만 정답 처리
    if (sim >= 1.0) {
      setIsCorrect(true);
      localStorage.setItem(CORRECT_KEY, JSON.stringify({ date: today, keyword: keyword }));
      console.log('[Commantle] addGameScore 호출', { score: next.length, id: uuid, nickname });
      await addGameScore(next.length, nickname, 'commantle');
      if (typeof fetchGameScores === 'function') {
        await fetchGameScores();
      }
    }
  };

  // 연관 단어 힌트 (2~3개 랜덤, 없으면 초성)
  const getHint = () => {
    if (related && related.length > 0) {
      return sampleSize(related, Math.min(3, related.length)).join(', ');
    }
    return getChoseong(keyword || '');
  };

  // Top 5 유사도 높은 메시지 추출
  const topMessages = [...messages]
    .filter(m => typeof m.sim === 'number')
    .sort((a, b) => (b.sim ?? 0) - (a.sim ?? 0))
    .slice(0, 5);

  return (
    <div className="bg-github-card border border-github-border rounded-lg p-4 mt-6">
      {/* 탭 UI */}
      <div className="flex mb-4 border-b border-github-border">
        <button
          className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors duration-150 ${activeTab === 'commantle' ? 'border-green-500 text-green-400' : 'border-transparent text-github-muted hover:text-github-text'}`}
          onClick={() => setActiveTab('commantle')}
        >
          꼬맨틀
        </button>
        <button
          className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors duration-150 ${activeTab === 'dino' ? 'border-green-500 text-green-400' : 'border-transparent text-github-muted hover:text-github-text'}`}
          onClick={() => setActiveTab('dino')}
        >
          디노 러너
        </button>
      </div>
      {activeTab === 'commantle' ? (
        <>
          <h3 className="text-github-text font-bold text-lg mb-3">꼬맨틀(Commantle) 게임</h3>
          {error ? (
            <div className="text-red-500 font-bold mb-2">{error}</div>
          ) : (
            <>
              <div className="text-github-muted text-base mb-2">
                오늘의 제시어: <span className="font-bold">{loading ? '(로딩중)' : (keyword ? getChoseong(keyword) : '')}</span>
              </div>
              <div className="text-github-muted text-sm mb-3">
                💡 정확히 100% 일치해야 게임이 완료됩니다!
              </div>
              {hintCount > 0 && (
                <div className="hint-box bg-yellow-50 border border-yellow-300 rounded p-2 my-2 text-yellow-800">
                  <strong>힌트:</strong> {getHint()}
                </div>
              )}
              <form onSubmit={handleSubmit} className="flex gap-2 mb-2">
                <input
                  type="text"
                  className="flex-1 border border-github-border rounded px-2 py-1 bg-github-bg text-github-text"
                  placeholder={isCorrect ? '정답을 맞추셨습니다!' : '한 줄 멘트를 입력하세요'}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  disabled={loading || isCorrect || !!error}
                />
                <button
                  type="submit"
                  className="bg-github-green text-white rounded px-4 py-1 font-bold disabled:opacity-60"
                  disabled={loading || !input.trim() || isCorrect || !!error}
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
                {topMessages.length === 0 && <li className="text-github-muted text-xs">아직 멘트가 없습니다.</li>}
                {topMessages.map((m, i) => (
                  <li key={i} className="bg-github-bg border border-github-border rounded px-2 py-1 text-github-text text-sm flex items-center gap-2">
                    <span>{m.text}</span>
                    {typeof m.sim === 'number' && (
                      <>
                        <span className="ml-2 text-github-muted text-xs">({(m.sim * 100).toFixed(0)}%)</span>
                        <div className="flex-1 h-2 bg-github-border rounded ml-2">
                          <div
                            className={`h-2 rounded
                              ${m.sim === 1 ? 'bg-green-700'
                                : m.sim >= 0.8 ? 'bg-green-500'
                                : m.sim >= 0.6 ? 'bg-green-300'
                                : 'bg-gray-500/40'}
                            `}
                            style={{ width: `${Math.round((m.sim ?? 0) * 100)}%`, transition: 'width 0.7s' }}
                          />
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
              {isCorrect && (
                <div className="text-github-green font-bold mt-3">🎉 정답을 맞추셨습니다! 오늘은 더 이상 입력할 수 없습니다.</div>
              )}
            </>
          )}
        </>
      ) : (
        <DinoRunnerGame uuid={uuid} nickname={nickname} />
      )}
    </div>
  );
} 