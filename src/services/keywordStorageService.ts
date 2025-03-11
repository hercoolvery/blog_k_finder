import { PrismaClient } from '@prisma/client';
import googleKeywordService from './googleKeywordService';
import naverKeywordService from './naverKeywordService';
import { prisma } from '@/lib/prisma';

interface KeywordAnalysisResult {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  trend: 'UP' | 'DOWN' | 'SAME';
  category?: string;
  relatedKeywords: string[];
}

/**
 * 키워드 데이터를 분석하고 저장합니다.
 */
export async function analyzeAndStoreKeyword(keyword: string, category?: string): Promise<KeywordAnalysisResult | null> {
  try {
    // Google 키워드 데이터 가져오기
    const googleData = await googleKeywordService.getKeywordData([keyword]);
    const googleKeyword = googleData[0];

    if (!googleKeyword) {
      console.warn(`Google 키워드 데이터를 찾을 수 없음: ${keyword}`);
      return null;
    }

    // Naver 키워드 데이터 가져오기
    const naverData = await naverKeywordService.getNaverKeywordData(keyword);
    const naverTrend = await naverKeywordService.getNaverKeywordTrend(keyword);

    // 경쟁 강도 계산
    const difficulty = googleKeywordService.calculateKeywordDifficulty(
      googleKeyword.competition,
      googleKeyword.searchVolume,
      googleKeyword.cpc
    );

    // 관련 키워드 추출
    const relatedKeywords = naverData
      .filter(item => item.keyword !== keyword)
      .map(item => item.keyword);

    // 분석 결과 생성
    const analysisResult: KeywordAnalysisResult = {
      keyword,
      searchVolume: googleKeyword.searchVolume,
      difficulty,
      trend: naverTrend?.trend || 'SAME',
      category,
      relatedKeywords
    };

    // 데이터베이스에 저장
    const storedKeyword = await prisma.keyword.upsert({
      where: { term: keyword },
      update: {
        searchVolume: googleKeyword.searchVolume,
        difficulty,
        category,
        updatedAt: new Date()
      },
      create: {
        term: keyword,
        searchVolume: googleKeyword.searchVolume,
        difficulty,
        category,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // 키워드 트렌드 데이터 저장
    if (naverTrend?.data) {
      await Promise.all(
        naverTrend.data.map(async (point) => {
          await prisma.keywordTrend.upsert({
            where: {
              keywordId_date: {
                keywordId: storedKeyword.id,
                date: new Date(point.period)
              }
            },
            update: {
              volume: Math.round(point.ratio * googleKeyword.searchVolume)
            },
            create: {
              keywordId: storedKeyword.id,
              date: new Date(point.period),
              volume: Math.round(point.ratio * googleKeyword.searchVolume)
            }
          });
        })
      );
    }

    // 연관 키워드 저장
    await Promise.all(
      relatedKeywords.map(async (relatedKeyword) => {
        const relatedKeywordRecord = await prisma.keyword.upsert({
          where: { term: relatedKeyword },
          update: {},
          create: {
            term: relatedKeyword,
            searchVolume: 0,
            difficulty: 0,
            category,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });

        await prisma.relatedKeyword.upsert({
          where: {
            keywordId_relatedToId: {
              keywordId: storedKeyword.id,
              relatedToId: relatedKeywordRecord.id
            }
          },
          update: {},
          create: {
            keywordId: storedKeyword.id,
            relatedToId: relatedKeywordRecord.id
          }
        });
      })
    );

    return analysisResult;
  } catch (error) {
    console.error('키워드 분석 및 저장 오류:', error);
    throw error;
  }
}

/**
 * 저장된 키워드 데이터를 검색합니다.
 */
export async function searchKeywords(
  query: string,
  category?: string,
  page: number = 1,
  pageSize: number = 10
) {
  try {
    const where = {
      AND: [
        { term: { contains: query } },
        category ? { category } : {}
      ]
    };

    const totalCount = await prisma.keyword.count({ where });
    const keywords = await prisma.keyword.findMany({
      where,
      include: {
        keywordTrend: {
          orderBy: { date: 'desc' },
          take: 3
        },
        related: {
          include: {
            relatedTo: true
          }
        }
      },
      orderBy: {
        searchVolume: 'desc'
      },
      skip: (page - 1) * pageSize,
      take: pageSize
    });

    return {
      keywords,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / pageSize)
    };
  } catch (error) {
    console.error('키워드 검색 오류:', error);
    throw error;
  }
}

/**
 * 인기 키워드를 가져옵니다.
 */
export async function getPopularKeywords(
  category?: string,
  limit: number = 10
) {
  try {
    return await prisma.keyword.findMany({
      where: category ? { category } : {},
      orderBy: {
        searchVolume: 'desc'
      },
      take: limit,
      include: {
        keywordTrend: {
          orderBy: { date: 'desc' },
          take: 3
        }
      }
    });
  } catch (error) {
    console.error('인기 키워드 조회 오류:', error);
    throw error;
  }
}

export default {
  analyzeAndStoreKeyword,
  searchKeywords,
  getPopularKeywords
}; 