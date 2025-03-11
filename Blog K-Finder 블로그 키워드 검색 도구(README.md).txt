# Blog K-Finder: 블로그 키워드 검색 도구

Blog K-Finder는 블로거들이 효과적인 키워드를 찾고 블로그 노출과 수익을 극대화할 수 있도록 돕는 Next.js 기반의 웹 애플리케이션입니다.

## 주요 기능

- **키워드 검색 및 추천**: 카테고리별 인기 키워드 검색 및 추천
- **트렌드 분석**: 시간에 따른 키워드 검색량 추이 시각화
- **경쟁 강도 분석**: 키워드별 경쟁 강도를 분석하여 노출 가능성이 높은 키워드 식별
- **연관 키워드 추천**: 주요 키워드와 관련된 연관 키워드 추천
- **계절별 인기 키워드**: 계절에 따른 인기 키워드 정보 제공

## 기술 스택

- **Frontend**: Next.js 15, React 19
- **API**: Next.js API Routes, Axios
- **데이터베이스**: PostgreSQL, Prisma ORM
- **스타일링**: Tailwind CSS
- **상태 관리**: Zustand (예정)
- **인증**: NextAuth.js (예정)

## 설치 및 실행 방법

1. 저장소 클론
```bash
git clone https://github.com/your-username/blog_k_finder.git
cd blog_k_finder
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
```bash
# .env 파일 생성
DATABASE_URL="postgresql://username:password@localhost:5432/blog_k_finder"
# 필요한 API 키 추가 (Google Keyword Planner, Naver Search Advisor 등)
```

4. 데이터베이스 마이그레이션
```bash
npx prisma migrate dev
```

5. 개발 서버 실행
```bash
npm run dev
```

6. 웹 브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 개발 로드맵

- [x] 기본 UI 구현
- [x] 키워드 검색 API 구현
- [x] 트렌드 분석 페이지 구현
- [ ] 사용자 인증 시스템 구현
- [ ] 키워드 저장 및 관리 기능
- [ ] 외부 API 연동 (Google, Naver 등)
- [ ] 키워드 알림 서비스
- [ ] 데이터 분석 및 리포트 기능
- [ ] 모바일 앱 개발

## 라이센스

MIT

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.