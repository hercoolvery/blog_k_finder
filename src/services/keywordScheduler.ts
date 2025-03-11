import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import keywordStorageService from './keywordStorageService';
import { prisma } from '@/lib/prisma';

interface SchedulerConfig {
  updateInterval?: string; // cron 표현식
  batchSize?: number;     // 한 번에 처리할 키워드 수
}

export class KeywordScheduler {
  private cronJob: cron.ScheduledTask | null = null;
  private isRunning: boolean = false;
  private config: SchedulerConfig;

  constructor(config: SchedulerConfig = {}) {
    this.config = {
      updateInterval: config.updateInterval || '0 0 * * *', // 기본값: 매일 자정
      batchSize: config.batchSize || 50
    };
  }

  /**
   * 스케줄러를 시작합니다.
   */
  start() {
    if (this.cronJob) {
      console.warn('스케줄러가 이미 실행 중입니다.');
      return;
    }

    this.cronJob = cron.schedule(this.config.updateInterval, async () => {
      if (this.isRunning) {
        console.warn('이전 작업이 아직 실행 중입니다.');
        return;
      }

      try {
        this.isRunning = true;
        await this.updateKeywords();
      } catch (error) {
        console.error('키워드 업데이트 오류:', error);
      } finally {
        this.isRunning = false;
      }
    });

    console.log('키워드 업데이트 스케줄러가 시작되었습니다.');
  }

  /**
   * 스케줄러를 중지합니다.
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
      console.log('키워드 업데이트 스케줄러가 중지되었습니다.');
    }
  }

  /**
   * 키워드 데이터를 업데이트합니다.
   */
  private async updateKeywords() {
    try {
      // 업데이트가 필요한 키워드 조회
      const keywords = await prisma.keyword.findMany({
        where: {
          OR: [
            { updatedAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }, // 24시간 이상 지난 키워드
            { searchVolume: 0 } // 검색량이 없는 키워드
          ]
        },
        orderBy: {
          updatedAt: 'asc'
        },
        take: this.config.batchSize
      });

      console.log(`${keywords.length}개의 키워드를 업데이트합니다.`);

      // 배치 처리로 키워드 업데이트
      for (const keyword of keywords) {
        try {
          await keywordStorageService.analyzeAndStoreKeyword(keyword.term, keyword.category || undefined);
          console.log(`키워드 업데이트 완료: ${keyword.term}`);
          
          // API 호출 제한을 고려한 딜레이
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`키워드 업데이트 실패: ${keyword.term}`, error);
        }
      }

      console.log('키워드 업데이트가 완료되었습니다.');
    } catch (error) {
      console.error('키워드 업데이트 중 오류 발생:', error);
      throw error;
    }
  }

  /**
   * 수동으로 키워드 업데이트를 실행합니다.
   */
  async runManually() {
    if (this.isRunning) {
      console.warn('이미 업데이트가 실행 중입니다.');
      return;
    }

    try {
      this.isRunning = true;
      await this.updateKeywords();
    } catch (error) {
      console.error('수동 키워드 업데이트 오류:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }
}

// 기본 스케줄러 인스턴스 생성
const defaultScheduler = new KeywordScheduler();

export default defaultScheduler; 