const adjectives = [
  '즐거운', '신나는', '평온한', '활기찬', '차분한', '열정적인', 
  '창의적인', '꼼꼼한', '친절한', '유쾌한', '진지한', '유연한',
  '성실한', '도전적인', '긍정적인', '배려하는', '책임감있는', '협력하는'
];

const nouns = [
  '개발자', '디자이너', '기획자', '마케터', '영업사원', '회계사',
  '의사', '교사', '엔지니어', '작가', '예술가', '요리사',
  '운동선수', '음악가', '사진작가', '여행자', '독서가', '요가인'
];

export function generateNickname(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 9999) + 1;
  
  return `${adjective}${noun}${number}`;
}

export function getStoredNickname(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('go-home-nickname');
}

export function setStoredNickname(nickname: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('go-home-nickname', nickname);
} 