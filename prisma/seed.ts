import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 샘플 키워드 데이터
  const sampleKeywords = [
    {
      keyword: "블로그 시작하기",
      searchVolume: 5000,
      competition: 0.45,
      cpc: 1200,
      difficulty: 45,
      trend: [4500, 4800, 5000, 5200, 5000],
      lastUpdated: new Date()
    },
    {
      keyword: "프로그래밍 독학",
      searchVolume: 8000,
      competition: 0.6,
      cpc: 2500,
      difficulty: 60,
      trend: [7500, 7800, 8000, 8200, 8000],
      lastUpdated: new Date()
    },
    {
      keyword: "주식 투자 방법",
      searchVolume: 12000,
      competition: 0.75,
      cpc: 3500,
      difficulty: 75,
      trend: [11000, 11500, 12000, 12500, 12000],
      lastUpdated: new Date()
    }
  ];

  // 키워드 데이터 추가
  for (const keyword of sampleKeywords) {
    await prisma.keyword.create({
      data: {
        keyword: keyword.keyword,
        searchVolume: keyword.searchVolume,
        competition: keyword.competition,
        cpc: keyword.cpc,
        difficulty: keyword.difficulty,
        trend: keyword.trend,
        lastUpdated: keyword.lastUpdated,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  console.log('샘플 데이터가 성공적으로 추가되었습니다.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 