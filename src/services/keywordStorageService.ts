import { PrismaClient, Keyword, Prisma } from '@prisma/client';
import keywordService from './keywordService';
import naverKeywordService from './naverKeywordService';
import { prisma } from '@/lib/prisma';

interface KeywordData {
  keyword: string;
  searchVolume: number;
  competition: number;
  cpc: number;
}

interface Point {
  x: number;
  y: number;
}

interface KeywordAnalysisResult {
  keyword: string;
  searchVolume: number;
  competition: number;
  cpc: number;
  difficulty: number;
  trend: number[];
}

/**
 * 키워드 데이터를 분석하고 저장합니다.
 */
export async function analyzeAndStoreKeyword(searchKeyword: string): Promise<Keyword> {
  try {
    // 이미 존재하는 키워드인지 확인
    const existingKeyword = await prisma.keyword.findUnique({
      where: {
        keyword: searchKeyword
      }
    });

    // 이미 존재하는 경우 업데이트
    if (existingKeyword) {
      // 키워드 데이터 가져오기
      const googleData = await keywordService.getKeywordData(searchKeyword);

      // 경쟁 강도 계산
      const difficulty = keywordService.calculateKeywordDifficulty(
        googleData.competition,
        googleData.searchVolume,
        googleData.cpc
      );

      return await prisma.keyword.update({
        where: {
          id: existingKeyword.id
        },
        data: {
          searchVolume: googleData.searchVolume,
          competition: googleData.competition,
          cpc: googleData.cpc,
          difficulty: difficulty,
          trend: [],
          lastUpdated: new Date()
        }
      });
    }

    // 새로운 키워드인 경우 생성
    const googleData = await keywordService.getKeywordData(searchKeyword);

    // 경쟁 강도 계산
    const difficulty = keywordService.calculateKeywordDifficulty(
      googleData.competition,
      googleData.searchVolume,
      googleData.cpc
    );

    // 데이터베이스에 저장
    return await prisma.keyword.create({
      data: {
        keyword: searchKeyword,
        searchVolume: googleData.searchVolume,
        competition: googleData.competition,
        cpc: googleData.cpc,
        difficulty: difficulty,
        trend: [],
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    console.error('키워드 분석 및 저장 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 저장된 키워드 데이터를 검색합니다.
 */
export async function searchKeywords(
  searchTerm: string,
  page: number = 1,
  pageSize: number = 10
): Promise<Keyword[]> {
  try {
    const skip = (page - 1) * pageSize;
    return await prisma.keyword.findMany({
      where: {
        keyword: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      },
      orderBy: {
        searchVolume: 'desc'
      },
      skip,
      take: pageSize
    });
  } catch (error) {
    console.error('키워드 검색 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 인기 키워드를 가져옵니다.
 */
export async function getPopularKeywords(limit: number = 10): Promise<Keyword[]> {
  try {
    return await prisma.keyword.findMany({
      orderBy: {
        searchVolume: 'desc'
      },
      take: limit
    });
  } catch (error) {
    console.error('인기 키워드 조회 중 오류 발생:', error);
    throw error;
  }
}

export async function getStoredKeywordData(searchKeyword: string): Promise<Keyword | null> {
  try {
    return await prisma.keyword.findUnique({
      where: {
        keyword: searchKeyword
      }
    });
  } catch (error) {
    console.error('키워드 데이터 조회 중 오류 발생:', error);
    throw error;
  }
}

export function calculateTrendPoints(trend: number[]): Point[] {
  const maxValue = Math.max(...trend);
  return trend.map((value, index) => ({
    x: index,
    y: maxValue > 0 ? (value / maxValue) * 100 : 0
  }));
}

export default {
  analyzeAndStoreKeyword,
  searchKeywords,
  getPopularKeywords,
  getStoredKeywordData,
  calculateTrendPoints
}; 