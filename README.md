# 데이터 저널리즘 프로젝트

카카오 맵을 활용한 데이터 시각화 프로젝트입니다.

## 기술 스택

- **언어**: TypeScript
- **프레임워크**: React + Next.js
- **백엔드**: Supabase + PostGIS
- **상태 관리**: Zustand + TanStack Query
- **스타일링**: vanilla-extract
- **인터랙션**: Framer Motion
- **패키지 매니저**: pnpm
- **지도**: Kakao Map
- **배포**: Vercel
- **품질**: ESLint

## 시작하기

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 카카오 맵 API 키를 설정하세요:

```bash
NEXT_PUBLIC_KAKAO_MAP_API_KEY=your_kakao_map_api_key_here
```

카카오 맵 API 키는 [카카오 개발자 콘솔](https://developers.kakao.com/)에서 발급받을 수 있습니다.

### 3. 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요.

## 프로젝트 구조

```
src/
├── app/                 # Next.js App Router
│   └── page.tsx        # 메인 페이지
├── components/         # React 컴포넌트
│   └── KakaoMap.tsx   # 카카오 맵 컴포넌트
└── types/             # TypeScript 타입 정의
    └── kakao.d.ts     # 카카오 맵 API 타입
```

## 주요 기능

- ✅ 카카오 맵 기본 설정
- ✅ 반응형 디자인
- ✅ TypeScript 타입 안전성
- 🔄 Supabase + PostGIS 연동 예정
- 🔄 데이터 시각화 컴포넌트 예정
- 🔄 인터랙티브 애니메이션 예정

## 다음 단계

1. Supabase 프로젝트 설정
2. PostGIS 확장 활성화
3. Zustand + TanStack Query 설정
4. Framer Motion 애니메이션 추가
5. 데이터 시각화 컴포넌트 개발