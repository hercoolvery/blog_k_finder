import { NextRequest, NextResponse } from 'next/server';
import keywordStorageService from '@/services/keywordStorageService';
import keywordScheduler from '@/services/keywordScheduler';
import googleKeywordService from '@/services/googleKeywordService';
import keywordService from '@/services/keywordService';

// 임시 데이터 - 실제 구현에서는 데이터베이스와 연동하고 외부 API 호출을 통해 데이터를 가져옵니다
const exampleKeywords = {
  "all": [
    { 
      keyword: "맛집 추천", 
      volume: 12500, 
      difficulty: 85, 
      trend: "상승", 
      related: ["서울 맛집", "인스타 맛집", "혼밥 맛집"]
    },
    { 
      keyword: "주식 투자 방법", 
      volume: 8700, 
      difficulty: 65, 
      trend: "상승", 
      related: ["주식 초보", "주식 공부", "주식 종목 추천"]
    },
    { 
      keyword: "클린 코드", 
      volume: 4300, 
      difficulty: 45, 
      trend: "일정", 
      related: ["리팩토링", "코드 리뷰", "객체지향 프로그래밍"]
    },
  ],
  "food": [
    { 
      keyword: "맛집 추천", 
      volume: 12500, 
      difficulty: 85, 
      trend: "상승", 
      related: ["서울 맛집", "인스타 맛집", "혼밥 맛집"]
    },
    { 
      keyword: "집밥 레시피", 
      volume: 7800, 
      difficulty: 60, 
      trend: "상승", 
      related: ["초간단 요리", "자취생 레시피", "백종원 레시피"]
    },
    { 
      keyword: "홈베이킹", 
      volume: 5200, 
      difficulty: 55, 
      trend: "일정", 
      related: ["브라우니 만들기", "쿠키 레시피", "비건 베이킹"]
    },
  ],
  "tech": [
    { 
      keyword: "클린 코드", 
      volume: 4300, 
      difficulty: 45, 
      trend: "일정", 
      related: ["리팩토링", "코드 리뷰", "객체지향 프로그래밍"]
    },
    { 
      keyword: "인공지능 기초", 
      volume: 9300, 
      difficulty: 75, 
      trend: "상승", 
      related: ["머신러닝 입문", "딥러닝 기초", "AI 알고리즘"]
    },
    { 
      keyword: "웹개발 로드맵", 
      volume: 6700, 
      difficulty: 60, 
      trend: "상승", 
      related: ["프론트엔드 개발", "백엔드 개발", "풀스택 개발자"]
    },
  ],
  "finance": [
    { 
      keyword: "주식 투자 방법", 
      volume: 8700, 
      difficulty: 65, 
      trend: "상승", 
      related: ["주식 초보", "주식 공부", "주식 종목 추천"]
    },
    { 
      keyword: "비트코인 투자", 
      volume: 7400, 
      difficulty: 75, 
      trend: "하강", 
      related: ["암호화폐 투자", "이더리움", "알트코인"]
    },
    { 
      keyword: "저축 방법", 
      volume: 5100, 
      difficulty: 40, 
      trend: "일정", 
      related: ["재테크 초보", "적금 추천", "월급관리"]
    },
  ],
  // 다른 카테고리 항목들...
};

// 스케줄러 시작
keywordScheduler.start();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || '';
    const category = searchParams.get('category') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

    // 검색어가 없는 경우 카테고리별 상위 키워드 반환
    if (!query && category) {
      try {
        const topKeywords = await googleKeywordService.getCategoryTopKeywords(category);
        
        // 키워드 데이터를 데이터베이스에 저장
        const savedKeywords = await Promise.all(
          topKeywords.map(async (keyword) => {
            try {
              return await keywordStorageService.analyzeAndStoreKeyword(keyword.keyword);
            } catch (error) {
              console.error(`키워드 저장 오류 (${keyword.keyword}):`, error);
              return null;
            }
          })
        );

        const validKeywords = savedKeywords.filter((k): k is Exclude<typeof k, null> => k !== null);

        return NextResponse.json({
          success: true,
          keywords: validKeywords,
          totalCount: validKeywords.length,
          currentPage: 1,
          totalPages: 1
        });
      } catch (error) {
        console.error('카테고리 키워드 조회 오류:', error);
        // 에러 발생 시 더미 데이터 반환
        const dummyKeywords = googleKeywordService.generateDummyKeywords(category, 10);
        return NextResponse.json({
          success: true,
          keywords: dummyKeywords,
          totalCount: dummyKeywords.length,
          currentPage: 1,
          totalPages: 1
        });
      }
    }

    // 기존 키워드 검색 로직
    const results = await keywordStorageService.searchKeywords(query, page, pageSize);

    // 검색어가 있고 결과가 없는 경우, 백그라운드에서 키워드 분석 실행
    if (query && results.length === 0) {
      try {
        const analyzedKeyword = await keywordStorageService.analyzeAndStoreKeyword(query);
        if (analyzedKeyword) {
          results.push(analyzedKeyword);
        }
      } catch (error) {
        console.error('키워드 분석 오류:', error);
      }
    }

    return NextResponse.json({
      success: true,
      keywords: results,
      totalCount: results.length,
      currentPage: page,
      totalPages: Math.ceil(results.length / pageSize)
    });
  } catch (error) {
    console.error('키워드 검색 API 오류:', error);
    return NextResponse.json({
      success: false,
      error: '키워드 검색 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

// 키워드 분석 API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword } = body;

    if (!keyword) {
      return NextResponse.json({
        success: false,
        error: '키워드가 필요합니다.'
      }, { status: 400 });
    }

    const result = await keywordStorageService.analyzeAndStoreKeyword(keyword);

    if (!result) {
      return NextResponse.json({
        success: false,
        error: '키워드 분석에 실패했습니다.'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('키워드 분석 API 오류:', error);
    return NextResponse.json({
      success: false,
      error: '키워드 분석 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
} 