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

-- RLS (Row Level Security) 비활성화 (익명 접근 허용)
ALTER TABLE commutes DISABLE ROW LEVEL SECURITY;
ALTER TABLE moods DISABLE ROW LEVEL SECURITY;

-- 인덱스 생성 (성능 향상)
CREATE INDEX idx_commutes_timestamp ON commutes(timestamp DESC);
CREATE INDEX idx_moods_timestamp ON moods(timestamp DESC);
CREATE INDEX idx_commutes_nickname ON commutes(nickname);
CREATE INDEX idx_moods_nickname ON moods(nickname); 