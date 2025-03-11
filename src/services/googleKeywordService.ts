import { google } from 'googleapis';

// Google Ads API 인증 설정
const auth = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

auth.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

// Google Ads API 클라이언트 설정
const customerId = process.env.GOOGLE_CUSTOMER_ID;
const developerToken = process.env.GOOGLE_DEVELOPER_TOKEN;

interface KeywordData {
  keyword: string;
  searchVolume: number;
  competition: number;
  cpc: number;
}

/**
 * Google Keyword Planner API를 통해 키워드 데이터를 가져옵니다.
 * 
 * @param keywords 검색할 키워드 배열
 * @param language 언어 코드 (기본값: 'ko')
 * @param location 위치 코드 (기본값: '2410' - 한국)
 * @returns 키워드 데이터 배열
 */
export async function getKeywordData(
  keywords: string[], 
  language: string = 'ko', 
  location: string = '2410'
): Promise<KeywordData[]> {
  try {
    // Google Ads API 서비스 생성
    const service = google.adwords({
      version: 'v201809',
      auth: auth
    });

    // 키워드 아이디어 요청
    const result = await service.keywordIdeas.search({
      customerId,
      developerToken,
      requestBody: {
        query: {
          keywords: keywords
        },
        languageCode: language,
        geoTargetConstants: [location]
      }
    });

    if (result.data && result.data.results) {
      // 응답 데이터를 가공하여 반환
      return result.data.results.map(item => ({
        keyword: item.text || '',
        searchVolume: item.monthlySearchVolumes?.[0]?.monthlySearches || 0,
        competition: item.competition || 0,
        cpc: item.avgCpc?.microAmount ? item.avgCpc.microAmount / 1000000 : 0
      }));
    }

    return [];
  } catch (error) {
    console.error('Google Keyword Planner API 오류:', error);
    throw error;
  }
}

/**
 * 키워드의 경쟁 강도를 계산합니다.
 * 
 * @param competition Google에서 제공하는 경쟁 지표 (0~1)
 * @param searchVolume 월간 검색량
 * @param cpc 평균 CPC (Cost Per Click)
 * @returns 0-100 사이의 경쟁 강도 점수
 */
export function calculateKeywordDifficulty(
  competition: number,
  searchVolume: number,
  cpc: number
): number {
  // 경쟁 강도는 Google의 경쟁 지표, 검색량, CPC를 고려하여 계산
  // 0-100 사이의 값으로 정규화합니다.
  
  // 경쟁 요소 (0-70점)
  const competitionScore = competition * 70;
  
  // 검색량 요소 (0-20점)
  // 검색량이 많을수록 상위 노출이 어려워질 수 있음
  let volumeScore = 0;
  if (searchVolume > 0) {
    // 로그 스케일로 검색량 점수 계산
    volumeScore = Math.min(20, Math.log10(searchVolume) * 3);
  }
  
  // CPC 요소 (0-10점)
  // CPC가 높을수록 경쟁이 치열함을 의미
  let cpcScore = 0;
  if (cpc > 0) {
    // CPC 점수 계산 (최대 10점)
    cpcScore = Math.min(10, cpc / 2);
  }
  
  // 최종 경쟁 강도 점수 계산 (0-100)
  const difficultyScore = competitionScore + volumeScore + cpcScore;
  
  // 소수점 1자리까지 반올림하여 반환
  return Math.round(difficultyScore * 10) / 10;
}

export default {
  getKeywordData,
  calculateKeywordDifficulty
}; 