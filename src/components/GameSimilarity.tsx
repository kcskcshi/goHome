import React from 'react';

interface SimilarityItem {
  name: string;
  percent: number;
}

export default function GameSimilarity({ similarities }: { similarities: SimilarityItem[] }) {
  const medal = ['🥇', '🥈', '🥉'];
  return (
    <div className="bg-github-card border border-thin border-github-borderLight rounded-md p-3 mt-4">
      <div className="text-github-text text-xs font-bold mb-2 flex items-center">
        🎮 내 기획서와 유사한 게임 TOP3
      </div>
      <ul className="space-y-1">
        {similarities.map((item, idx) => (
          <li key={item.name} className="flex items-center gap-2">
            <span className={`w-5 text-center ${idx < 3 ? 'font-bold' : ''}`}>{medal[idx] || ''}</span>
            <span className={`flex-1 truncate ${idx < 3 ? 'font-bold' : ''}`}>{item.name}</span>
            <span className={`w-10 text-right ${idx < 3 ? 'font-bold' : ''}`}>{item.percent}%</span>
            <div className="flex-1 ml-2">
              <div className="h-2 rounded bg-github-borderLight overflow-hidden">
                <div
                  className={`h-2 rounded ${idx === 0 ? 'bg-green-500' : idx === 1 ? 'bg-blue-500' : idx === 2 ? 'bg-orange-400' : 'bg-github-green/60'}`}
                  style={{ width: `${item.percent}%`, transition: 'width 0.7s' }}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="text-github-muted text-xs mt-2">
        &quot;하루 한 줄, 꼬리에 멘트를 다는 게임.&quot;<br />
        <span className="text-github-text font-bold">꼬맨틀</span> — 출근과 동시에 웃고 시작하자!
      </div>
    </div>
  );
} 