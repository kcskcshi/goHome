# 🏠 아 집에가고싶다

> "오늘도 출근했습니다. 그리고 기분은요..."

직장인들의 출퇴근과 기분을 공유하는 플랫폼입니다. 로그인 없이 가볍게 사용할 수 있으며, GitHub 스타일의 다크모드 디자인을 적용했습니다.

## ✨ 주요 기능

- **출근/퇴근 기록**: 시간을 기록하고 통계를 확인할 수 있습니다
- **기분 공유**: 이모지와 한 줄 메시지로 오늘의 기분을 공유합니다
- **위치 기반 날씨**: 현재 위치의 실시간 날씨 정보를 제공합니다
- **익명 닉네임**: 자동으로 생성되는 재미있는 닉네임으로 익명성을 보장합니다
- **실시간 피드**: 다른 사용자들의 출퇴근과 기분을 실시간으로 확인할 수 있습니다
- **출근왕/칼퇴왕**: 오늘의 출근왕과 칼퇴왕을 확인할 수 있습니다

## 🚀 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: TailwindCSS (GitHub 스타일 다크모드)
- **State Management**: React Hooks
- **Storage**: localStorage (MVP)
- **Deployment**: GitHub Pages

## 🛠️ 개발 환경 설정

### 필수 요구사항

- Node.js 18+ 
- npm 또는 yarn

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/your-username/go-home.git
cd go-home

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# GitHub Pages 배포
npm run deploy
```

## 📱 사용법

1. **출근/퇴근 기록**: 메인 페이지에서 출근 또는 퇴근 버튼을 클릭합니다
2. **기분 공유**: 이모지를 선택하고 한 줄 메시지를 입력한 후 공유합니다
3. **피드 확인**: 상단의 "피드 보기" 링크를 클릭하여 다른 사용자들의 기록을 확인합니다
4. **날씨 확인**: 위치 권한을 허용하면 현재 위치의 날씨 정보를 볼 수 있습니다

## 🎨 디자인

- **GitHub 스타일**: GitHub의 다크모드 디자인을 기반으로 제작
- **반응형**: 모바일과 데스크톱 모두 최적화
- **접근성**: 키보드 네비게이션과 스크린 리더 지원

## 🔧 환경 변수

날씨 API를 사용하려면 `.env.local` 파일에 OpenWeather API 키를 추가하세요:

```env
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_api_key_here
```

## 📁 프로젝트 구조

```
go-home/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── page.tsx        # 메인 페이지
│   │   ├── feed/           # 피드 페이지
│   │   ├── layout.tsx      # 레이아웃
│   │   └── globals.css     # 글로벌 스타일
│   ├── components/         # React 컴포넌트
│   │   ├── Weather.tsx     # 날씨 컴포넌트
│   │   ├── CommuteButton.tsx # 출퇴근 버튼
│   │   ├── MoodInput.tsx   # 기분 입력
│   │   └── FeedCard.tsx    # 피드 카드
│   ├── hooks/              # 커스텀 훅
│   │   ├── useCommute.ts   # 출퇴근 관련 훅
│   │   └── useWeather.ts   # 날씨 관련 훅
│   ├── utils/              # 유틸리티 함수
│   │   ├── nickname.ts     # 닉네임 생성
│   │   ├── storage.ts      # localStorage 관리
│   │   └── weather.ts      # 날씨 API
│   └── types/              # TypeScript 타입 정의
├── public/                 # 정적 파일
├── tailwind.config.ts      # TailwindCSS 설정
└── next.config.ts          # Next.js 설정
```

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 새로운 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🙏 감사의 말

- [GitHub](https://github.com) - 디자인 영감
- [OpenWeatherMap](https://openweathermap.org) - 날씨 API
- [Next.js](https://nextjs.org) - React 프레임워크
- [TailwindCSS](https://tailwindcss.com) - CSS 프레임워크

---

**"오늘도 출근했습니다. 그리고 기분은요..."** 🏠
