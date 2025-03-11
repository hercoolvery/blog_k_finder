"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";

interface TrendData {
  date: string;
  value: number;
}

interface KeywordTrend {
  keyword: string;
  data: TrendData[];
  category: string;
  color: string;
}

export default function TrendsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [trendData, setTrendData] = useState<KeywordTrend[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // 시뮬레이션 데이터 - 실제로는 API에서 가져올 것입니다
  const mockTrendData: KeywordTrend[] = [
    {
      keyword: "맛집 추천",
      category: "food",
      color: "#3b82f6",
      data: [
        { date: "2023-01", value: 10500 },
        { date: "2023-02", value: 11200 },
        { date: "2023-03", value: 10800 },
        { date: "2023-04", value: 11500 },
        { date: "2023-05", value: 12000 },
        { date: "2023-06", value: 12300 },
        { date: "2023-07", value: 11700 },
        { date: "2023-08", value: 11800 },
        { date: "2023-09", value: 12100 },
        { date: "2023-10", value: 12400 },
        { date: "2023-11", value: 12700 },
        { date: "2023-12", value: 12500 },
      ],
    },
    {
      keyword: "주식 투자 방법",
      category: "finance",
      color: "#ef4444",
      data: [
        { date: "2023-01", value: 7200 },
        { date: "2023-02", value: 7500 },
        { date: "2023-03", value: 8100 },
        { date: "2023-04", value: 7800 },
        { date: "2023-05", value: 7900 },
        { date: "2023-06", value: 8200 },
        { date: "2023-07", value: 8500 },
        { date: "2023-08", value: 8300 },
        { date: "2023-09", value: 8400 },
        { date: "2023-10", value: 8600 },
        { date: "2023-11", value: 8900 },
        { date: "2023-12", value: 8700 },
      ],
    },
    {
      keyword: "클린 코드",
      category: "tech",
      color: "#10b981",
      data: [
        { date: "2023-01", value: 3800 },
        { date: "2023-02", value: 3900 },
        { date: "2023-03", value: 4000 },
        { date: "2023-04", value: 4100 },
        { date: "2023-05", value: 4200 },
        { date: "2023-06", value: 4250 },
        { date: "2023-07", value: 4300 },
        { date: "2023-08", value: 4350 },
        { date: "2023-09", value: 4200 },
        { date: "2023-10", value: 4250 },
        { date: "2023-11", value: 4300 },
        { date: "2023-12", value: 4300 },
      ],
    },
  ];

  // 카테고리 리스트
  const categories = [
    { id: "all", name: "전체" },
    { id: "food", name: "요리/음식" },
    { id: "tech", name: "기술/IT" },
    { id: "finance", name: "재테크/금융" },
  ];

  useEffect(() => {
    // 실제 구현에서는 API 호출로 대체
    const fetchTrends = async () => {
      setIsLoading(true);
      try {
        // 추후 실제 API 구현
        // const response = await axios.get('/api/trends');
        // if (response.data.success) {
        //   setTrendData(response.data.trends);
        // }
        
        // 모의 데이터 사용
        setTimeout(() => {
          setTrendData(mockTrendData);
          setIsLoading(false);
        }, 1000);
      } catch (err) {
        console.error('트렌드 데이터 로딩 오류:', err);
        setError('트렌드 데이터를 불러오는 중 오류가 발생했습니다.');
        setIsLoading(false);
      }
    };

    fetchTrends();
  }, []);

  // 카테고리 필터링
  const filteredTrends = selectedCategory === 'all' 
    ? trendData 
    : trendData.filter(trend => trend.category === selectedCategory);

  // 차트 그리기를 위한 함수
  const renderChart = () => {
    if (filteredTrends.length === 0) return null;

    // 차트의 최대 값을 계산
    const maxValue = Math.max(...filteredTrends.flatMap(trend => trend.data.map(d => d.value)));
    const chartHeight = 300;
    const chartWidth = 800;
    const months = filteredTrends[0].data.map(d => d.date);

    return (
      <div className="overflow-x-auto">
        <div className="relative" style={{ height: `${chartHeight}px`, width: `${chartWidth}px`, minWidth: '100%' }}>
          {/* Y축 */}
          <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs text-gray-500">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center">
                <span>{Math.round((maxValue / 4) * (4 - i))}</span>
                <div className="absolute left-16 right-0 border-t border-gray-200 dark:border-gray-700" style={{ top: `${(i * chartHeight) / 4}px` }}></div>
              </div>
            ))}
          </div>

          {/* X축 */}
          <div className="absolute left-16 right-0 bottom-0 flex justify-between text-xs text-gray-500">
            {months.map((month, i) => (
              <div key={i} className="text-center" style={{ width: `${(chartWidth - 16) / months.length}px` }}>
                {month.split('-')[1]}월
              </div>
            ))}
          </div>

          {/* 라인 차트 */}
          <div className="absolute left-16 top-0 right-0 bottom-20" style={{ height: `${chartHeight}px` }}>
            {filteredTrends.map((trend, trendIndex) => (
              <svg
                key={trendIndex}
                className="absolute inset-0"
                viewBox={`0 0 ${chartWidth - 16} ${chartHeight}`}
                preserveAspectRatio="none"
              >
                <path
                  d={trend.data.map((point, i) => {
                    const x = ((chartWidth - 16) / (trend.data.length - 1)) * i;
                    const y = chartHeight - (point.value / maxValue) * chartHeight;
                    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                  }).join(" ")}
                  fill="none"
                  stroke={trend.color}
                  strokeWidth="2"
                />
                {trend.data.map((point, i) => {
                  const x = ((chartWidth - 16) / (trend.data.length - 1)) * i;
                  const y = chartHeight - (point.value / maxValue) * chartHeight;
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="4"
                      fill="white"
                      stroke={trend.color}
                      strokeWidth="2"
                    />
                  );
                })}
              </svg>
            ))}
          </div>
        </div>

        {/* 범례 */}
        <div className="flex flex-wrap gap-4 mt-8 justify-center">
          {filteredTrends.map((trend, i) => (
            <div key={i} className="flex items-center">
              <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: trend.color }}></div>
              <span>{trend.keyword}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="py-6 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-8 h-8 text-blue-500"
              >
                <path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 014.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.858 1.858 0 00-.859 1.228 49.803 49.803 0 00-4.634-1.527.75.75 0 01-.231-1.337A60.653 60.653 0 0111.7 2.805z" />
                <path d="M13.06 15.473a48.45 48.45 0 017.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 01-.46.71 47.878 47.878 0 00-8.105 4.342.75.75 0 01-.832 0 47.877 47.877 0 00-8.104-4.342.75.75 0 01-.461-.71c.035-1.442.121-2.87.255-4.286A48.4 48.4 0 016 13.18v1.27a1.5 1.5 0 00-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.661a6.729 6.729 0 00.551-1.608 1.5 1.5 0 00.14-2.67v-.645a48.549 48.549 0 013.44 1.668 2.25 2.25 0 002.12 0z" />
                <path d="M4.462 19.462c.42-.419.753-.89 1-1.394.453.213.902.434 1.347.661a6.743 6.743 0 01-1.286 1.794.75.75 0 11-1.06-1.06z" />
              </svg>
              <h1 className="text-2xl font-bold">Blog K-Finder</h1>
            </div>
            <nav className="flex items-center gap-4">
              <Link href="/" className="text-gray-600 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400">
                홈
              </Link>
              <Link href="/trends" className="text-blue-500 dark:text-blue-400 font-medium">
                트렌드
              </Link>
              <Link href="#" className="text-gray-600 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400">
                가이드
              </Link>
              <Link href="#" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">
                로그인
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">키워드 트렌드 분석</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              시간에 따른 키워드 검색량 변화를 확인하고 트렌드를 파악하세요
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-12">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-semibold">인기 키워드 트렌드 (월별)</h3>
              <div className="flex gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedCategory === cat.id
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    }`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="h-10 w-10 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 text-red-700 p-4 rounded-lg">
                {error}
              </div>
            ) : (
              <div className="mt-4">
                {renderChart()}
                <div className="mt-6 text-sm text-gray-500 text-center">
                  데이터 출처: Google 키워드 플래너, Naver 검색어 트렌드
                </div>
              </div>
            )}
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">급상승 키워드</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="font-medium">홈베이킹</span>
                  <span className="text-green-500 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    57%
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="font-medium">AI 활용법</span>
                  <span className="text-green-500 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    45%
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="font-medium">친환경 생활</span>
                  <span className="text-green-500 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    38%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">계절별 인기 키워드</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-blue-500 mb-2">봄 (3월-5월)</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded dark:bg-blue-900 dark:text-blue-200">봄맞이 인테리어</span>
                    <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded dark:bg-blue-900 dark:text-blue-200">봄 여행지</span>
                    <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded dark:bg-blue-900 dark:text-blue-200">봄 옷 코디</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-yellow-500 mb-2">여름 (6월-8월)</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-yellow-50 text-yellow-700 text-xs px-2 py-1 rounded dark:bg-yellow-900 dark:text-yellow-200">여름 휴가지</span>
                    <span className="bg-yellow-50 text-yellow-700 text-xs px-2 py-1 rounded dark:bg-yellow-900 dark:text-yellow-200">에어컨 구매</span>
                    <span className="bg-yellow-50 text-yellow-700 text-xs px-2 py-1 rounded dark:bg-yellow-900 dark:text-yellow-200">시원한 요리</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-orange-500 mb-2">가을 (9월-11월)</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded dark:bg-orange-900 dark:text-orange-200">단풍 명소</span>
                    <span className="bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded dark:bg-orange-900 dark:text-orange-200">가을 패션</span>
                    <span className="bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded dark:bg-orange-900 dark:text-orange-200">가을 캠핑</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-100 dark:bg-gray-900 py-12 mt-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-6 md:mb-0">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-8 h-8 text-blue-500"
              >
                <path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 014.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.858 1.858 0 00-.859 1.228 49.803 49.803 0 00-4.634-1.527.75.75 0 01-.231-1.337A60.653 60.653 0 0111.7 2.805z" />
                <path d="M13.06 15.473a48.45 48.45 0 017.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 01-.46.71 47.878 47.878 0 00-8.105 4.342.75.75 0 01-.832 0 47.877 47.877 0 00-8.104-4.342.75.75 0 01-.461-.71c.035-1.442.121-2.87.255-4.286A48.4 48.4 0 016 13.18v1.27a1.5 1.5 0 00-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.661a6.729 6.729 0 00.551-1.608 1.5 1.5 0 00.14-2.67v-.645a48.549 48.549 0 013.44 1.668 2.25 2.25 0 002.12 0z" />
                <path d="M4.462 19.462c.42-.419.753-.89 1-1.394.453.213.902.434 1.347.661a6.743 6.743 0 01-1.286 1.794.75.75 0 11-1.06-1.06z" />
              </svg>
              <h1 className="text-xl font-bold">Blog K-Finder</h1>
            </div>
            <div className="flex gap-6">
              <Link href="#" className="text-gray-600 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400">
                이용약관
              </Link>
              <Link href="#" className="text-gray-600 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400">
                개인정보처리방침
              </Link>
              <Link href="#" className="text-gray-600 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400">
                고객지원
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Blog K-Finder. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
} 