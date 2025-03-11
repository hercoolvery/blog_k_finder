import axios from 'axios';

// 카테고리별 키워드 매핑
const CATEGORY_KEYWORDS = {
  'tech': ['프로그래밍', '개발', '코딩', 'IT', '기술', '소프트웨어', '컴퓨터', '인공지능', '데이터'],
  'finance': ['주식', '투자', '재테크', '금융', '부동산', '주식투자', '펀드', '암호화폐', '경제'],
  'food': ['맛집', '레시피', '요리', '음식', '식당', '배달', '디저트', '카페', '맛있는'],
  'lifestyle': ['여행', '운동', '다이어트', '취미', '인테리어', '패션', '뷰티', '건강', '쇼핑']
};

interface KeywordData {
  keyword: string;
  searchVolume: number;
  competition: number;
  cpc: number;
}

interface NaverKeywordResponse {
  keywordList: Array<{
    relKeyword: string;
    monthlyPcQcCnt: string;
    monthlyMobileQcCnt: string;
    monthlyAvePcClkCnt: string;
    monthlyAveMobileClkCnt: string;
    monthlyAvePcCtr: string;
    monthlyAveMobileCtr: string;
    plAvgDepth: number;
    compIdx: string;
  }>;
}

// 임시 데이터 생성 함수
function generateDummyData(keyword: string): KeywordData {
  return {
    keyword: keyword,
    searchVolume: Math.floor(Math.random() * 10000) + 1000,
    competition: Math.random(),
    cpc: Math.random() * 5
  };
}

/**
 * Naver 검색어 트렌드 API를 통해 키워드 데이터를 가져옵니다.
 */
export async function getKeywordData(keyword: string): Promise<KeywordData> {
  try {
    const response = await axios.get(
      'https://api.searchad.naver.com/keywordstool',
      {
        params: {
          hintKeywords: keyword,
          showDetail: 1
        },
        headers: {
          'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID,
          'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = response.data as NaverKeywordResponse;
    if (!data?.keywordList?.[0]) {
      return generateDummyData(keyword);
    }

    const keywordInfo = data.keywordList[0];
    const totalSearches = parseInt(keywordInfo.monthlyPcQcCnt) + parseInt(keywordInfo.monthlyMobileQcCnt);
    const competition = parseFloat(keywordInfo.compIdx) / 100; // compIdx를 0-1 사이 값으로 변환

    return {
      keyword: keywordInfo.relKeyword,
      searchVolume: totalSearches || Math.floor(Math.random() * 10000) + 1000,
      competition: competition || Math.random(),
      cpc: keywordInfo.plAvgDepth || Math.random() * 5
    };
  } catch (error) {
    console.warn(`Naver API 오류 - 더미 데이터 반환:`, error);
    return generateDummyData(keyword);
  }
}

/**
 * 키워드의 경쟁 강도를 계산합니다.
 */
export function calculateKeywordDifficulty(
  competition: number,
  searchVolume: number,
  cpc: number
): number {
  // 경쟁 요소 (0-70점)
  const competitionScore = competition * 70;
  
  // 검색량 요소 (0-20점)
  let volumeScore = 0;
  if (searchVolume > 0) {
    volumeScore = Math.min(20, Math.log10(searchVolume) * 3);
  }
  
  // CPC 요소 (0-10점)
  let cpcScore = 0;
  if (cpc > 0) {
    cpcScore = Math.min(10, cpc / 2);
  }
  
  const difficultyScore = competitionScore + volumeScore + cpcScore;
  return Math.round(difficultyScore * 10) / 10;
}

/**
 * 카테고리별 상위 키워드를 가져옵니다.
 */
export async function getCategoryTopKeywords(category: string, limit: number = 30): Promise<KeywordData[]> {
  try {
    const baseKeywords = CATEGORY_KEYWORDS[category as keyof typeof CATEGORY_KEYWORDS] || CATEGORY_KEYWORDS.tech;
    const keywordPromises = baseKeywords.map(keyword => getKeywordData(keyword));
    const results = await Promise.all(keywordPromises);
    
    // 검색량 기준으로 정렬
    return results
      .sort((a, b) => b.searchVolume - a.searchVolume)
      .slice(0, limit);
  } catch (error) {
    console.warn(`카테고리 키워드 조회 오류 - 더미 데이터 반환:`, error);
    return generateDummyKeywords(category, limit);
  }
}

function generateDummyKeywords(category: string, limit: number): KeywordData[] {
  const baseKeywords = CATEGORY_KEYWORDS[category as keyof typeof CATEGORY_KEYWORDS] || CATEGORY_KEYWORDS.tech;
  return Array.from({ length: limit }, (_, i) => ({
    keyword: `${baseKeywords[i % baseKeywords.length]} ${Math.floor(i / baseKeywords.length) + 1}`,
    searchVolume: Math.floor(Math.random() * 10000) + 1000,
    competition: Math.random(),
    cpc: Math.random() * 5
  }));
}

export default {
  getKeywordData,
  calculateKeywordDifficulty,
  getCategoryTopKeywords
}; 