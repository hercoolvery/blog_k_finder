import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import keywordStorageService from '@/services/keywordStorageService';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || undefined;
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // 인기 키워드 조회
    const popularKeywords = await keywordStorageService.getPopularKeywords(category, limit);

    // 키워드별 트렌드 데이터 가공
    const trendData = popularKeywords.map(keyword => {
      const trends = keyword.keywordTrend;
      const latestTrend = trends[0];
      const oldestTrend = trends[trends.length - 1];

      // 트렌드 방향 계산
      let trend: 'UP' | 'DOWN' | 'SAME' = 'SAME';
      if (latestTrend && oldestTrend) {
        if (latestTrend.volume > oldestTrend.volume * 1.1) {
          trend = 'UP';
        } else if (latestTrend.volume < oldestTrend.volume * 0.9) {
          trend = 'DOWN';
        }
      }

      return {
        keyword: keyword.term,
        searchVolume: keyword.searchVolume,
        difficulty: keyword.difficulty,
        trend,
        trendData: trends.map(t => ({
          date: t.date,
          volume: t.volume
        }))
      };
    });

    return NextResponse.json({
      success: true,
      data: trendData
    });
  } catch (error) {
    console.error('트렌드 분석 API 오류:', error);
    return NextResponse.json({
      success: false,
      error: '트렌드 데이터 조회 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

// 계절별 인기 키워드 API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { season } = body;

    if (!season || !['spring', 'summer', 'fall', 'winter'].includes(season)) {
      return NextResponse.json({
        success: false,
        error: '올바른 계절을 지정해주세요.'
      }, { status: 400 });
    }

    // 계절에 해당하는 월 범위 설정
    const months = {
      spring: [3, 4, 5],
      summer: [6, 7, 8],
      fall: [9, 10, 11],
      winter: [12, 1, 2]
    };

    const targetMonths = months[season as keyof typeof months];

    // 해당 계절의 인기 키워드 조회
    const seasonalKeywords = await prisma.keyword.findMany({
      where: {
        keywordTrend: {
          some: {
            date: {
              month: {
                in: targetMonths
              }
            }
          }
        }
      },
      include: {
        keywordTrend: {
          where: {
            date: {
              month: {
                in: targetMonths
              }
            }
          },
          orderBy: {
            volume: 'desc'
          }
        }
      },
      orderBy: {
        searchVolume: 'desc'
      },
      take: 10
    });

    const seasonalData = seasonalKeywords.map(keyword => ({
      keyword: keyword.term,
      searchVolume: keyword.searchVolume,
      difficulty: keyword.difficulty,
      averageSeasonalVolume: keyword.keywordTrend.reduce((acc, curr) => acc + curr.volume, 0) / keyword.keywordTrend.length
    }));

    return NextResponse.json({
      success: true,
      season,
      data: seasonalData
    });
  } catch (error) {
    console.error('계절별 키워드 분석 API 오류:', error);
    return NextResponse.json({
      success: false,
      error: '계절별 키워드 데이터 조회 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
} 