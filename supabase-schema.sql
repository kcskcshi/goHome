-- 출퇴근 기록 테이블
CREATE TABLE commutes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('출근', '퇴근')),
  timestamp BIGINT NOT NULL,
  nickname TEXT NOT NULL,
  mood TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 기분 데이터 테이블
CREATE TABLE moods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  emoji TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  nickname TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 꼬맨틀 정답/연관단어 테이블
CREATE TABLE IF NOT EXISTS commantle_keywords (
  id serial PRIMARY KEY,
  keyword text NOT NULL,
  related text NOT NULL, -- JSON 문자열로 저장
  "order" int NOT NULL -- 날짜별 순서 매핑용
);

-- 게임 스코어 테이블
CREATE TABLE IF NOT EXISTS game_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  nickname TEXT NOT NULL,
  game TEXT NOT NULL CHECK (game IN ('commantle', 'dino')),
  score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) 비활성화 (익명 접근 허용)
ALTER TABLE commutes DISABLE ROW LEVEL SECURITY;
ALTER TABLE moods DISABLE ROW LEVEL SECURITY;
ALTER TABLE game_scores DISABLE ROW LEVEL SECURITY;

-- 인덱스 생성 (성능 향상)
CREATE INDEX idx_commutes_timestamp ON commutes(timestamp DESC);
CREATE INDEX idx_moods_timestamp ON moods(timestamp DESC);
CREATE INDEX idx_commutes_nickname ON commutes(nickname);
CREATE INDEX idx_moods_nickname ON moods(nickname);
CREATE INDEX IF NOT EXISTS idx_game_scores_user_game ON game_scores(user_id, game);
CREATE INDEX IF NOT EXISTS idx_game_scores_created_at ON game_scores(created_at DESC); 