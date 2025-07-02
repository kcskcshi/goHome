# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 접속하여 회원가입/로그인
2. "New Project" 클릭
3. 프로젝트 이름: `go-home` (또는 원하는 이름)
4. 데이터베이스 비밀번호 설정 (기억해두세요)
5. 지역 선택 (가까운 지역 선택)
6. "Create new project" 클릭

## 2. 데이터베이스 테이블 생성

1. 프로젝트 대시보드에서 "SQL Editor" 클릭
2. `supabase-schema.sql` 파일의 내용을 복사하여 실행
3. 또는 Table Editor에서 수동으로 테이블 생성:

### commutes 테이블
```sql
CREATE TABLE commutes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('출근', '퇴근')),
  timestamp BIGINT NOT NULL,
  nickname TEXT NOT NULL,
  mood TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### moods 테이블
```sql
CREATE TABLE moods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  emoji TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  nickname TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 3. RLS (Row Level Security) 설정

익명 사용자 접근을 위해 RLS를 비활성화:

```sql
ALTER TABLE commutes DISABLE ROW LEVEL SECURITY;
ALTER TABLE moods DISABLE ROW LEVEL SECURITY;
```

## 4. 환경 변수 설정

1. 프로젝트 대시보드에서 "Settings" → "API" 클릭
2. "Project URL"과 "anon public" 키를 복사
3. 프로젝트 루트에 `.env.local` 파일 생성:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 5. 개발 서버 실행

```bash
npm run dev
```

## 6. 배포

GitHub Pages에 배포할 때는 환경 변수를 GitHub Secrets에 설정해야 합니다:

1. GitHub 저장소 → Settings → Secrets and variables → Actions
2. "New repository secret" 클릭
3. `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 추가

## 주의사항

- `.env.local` 파일은 `.gitignore`에 포함되어 있어야 합니다
- 프로덕션에서는 RLS를 적절히 설정하여 보안을 강화하세요
- 무료 티어 제한: 월 500MB, 50,000 API 요청 