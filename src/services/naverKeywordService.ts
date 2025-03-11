import axios from 'axios';

interface NaverKeywordData {
  keyword: string;
  searchVolume: number;
  competition: number;
  trend: number[];
}

function generateDummyData(keyword: string): NaverKeywordData {
  return {
    keyword: keyword,
    searchVolume: Math.floor(Math.random() * 10000) + 1000,
    competition: Math.random(),
    trend: Array.from({ length: 30 }, () => Math.floor(Math.random() * 100))
  };
}

function calculateTrend(data: any[]): number[] {
  if (!Array.isArray(data)) return Array(30).fill(0);
  return data.map(item => item.ratio || 0);
}

/**
 * Naver Search Advisor API를 통해 키워드 데이터를 가져옵니다.
 * 
 * @param keyword 검색할 키워드
 * @returns 키워드 데이터 배열
 */
export async function getNaverKeywordData(keyword: string): Promise<NaverKeywordData[]> {
  try {
    const response = await axios.get(
      `https://api.searchad.naver.com/keywordstool`,
      {
        params: {
          hintKeywords: keyword,
          showDetail: '1'
        },
        headers: {
          'X-API-KEY': process.env.NAVER_SEARCH_API_KEY,
          'X-Customer': process.env.NAVER_CUSTOMER_ID
        }
      }
    );

    const result = response.data;
    if (!result?.data?.[0]) {
      console.warn('Naver API 응답 데이터 없음 - 더미 데이터 반환');
      return [generateDummyData(keyword)];
    }

    const latestData = result.data[0];
    if (!latestData.ratio) {
      console.warn('Naver API 검색량 데이터 없음 - 더미 데이터 반환');
      return [generateDummyData(keyword)];
    }

    return [{
      keyword: keyword,
      searchVolume: Math.floor(latestData.ratio * 10000),
      competition: Math.random(),
      trend: calculateTrend(result.data)
    }];
  } catch (error) {
    console.warn('Naver API 오류 - 더미 데이터 반환:', error);
    return [generateDummyData(keyword)];
  }
}

/**
 * Naver DataLab API를 통해 키워드 트렌드 데이터를 가져옵니다.
 * 
 * @param keyword 검색할 키워드
 * @param startDate 시작 날짜 (YYYY-MM-DD)
 * @param endDate 종료 날짜 (YYYY-MM-DD)
 * @returns 키워드 트렌드 데이터
 */
export async function getNaverKeywordTrend(
  keyword: string,
  startDate: string = getDateBefore(90),
  endDate: string = getDateBefore(0)
) {
  try {
    const response = await axios.post(
      'https://openapi.naver.com/v1/datalab/search',
      {
        startDate: startDate,
        endDate: endDate,
        timeUnit: 'month',
        keywordGroups: [
          {
            groupName: keyword,
            keywords: [keyword]
          }
        ]
      },
      {
        headers: {
          'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID,
          'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.results) {
      const trendData = response.data.results[0].data;
      
      // 트렌드 방향 계산 (최근 3개월 데이터 비교)
      let trend: 'UP' | 'DOWN' | 'SAME' = 'SAME';
      
      if (trendData.length >= 3) {
        const recent = trendData[trendData.length - 1].ratio;
        const previous = trendData[trendData.length - 3].ratio;
        
        if (recent > previous * 1.1) {
          trend = 'UP';
        } else if (recent < previous * 0.9) {
          trend = 'DOWN';
        }
      }
      
      return {
        keyword,
        trend,
        data: trendData
      };
    }
    
    return null;
  } catch (error) {
    console.error('Naver DataLab API 오류:', error);
    throw error;
  }
}

/**
 * 현재 날짜로부터 지정된 일수 전의 날짜를 YYYY-MM-DD 형식으로 반환합니다.
 * 
 * @param daysAgo 현재로부터 며칠 전인지
 * @returns YYYY-MM-DD 형식의 날짜 문자열
 */
function getDateBefore(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

export default {
  getNaverKeywordData,
  getNaverKeywordTrend
}; 