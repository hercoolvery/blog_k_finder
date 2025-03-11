"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";

// 키워드 타입 정의
interface Keyword {
  keyword: string;
  volume: number;
  difficulty: number;
  trend: "상승" | "하강" | "일정";
  related: string[];
}

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Keyword[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 카테고리 리스트
  const categories = [
    { id: "all", name: "전체" },
    { id: "food", name: "요리/음식" },
    { id: "tech", name: "기술/IT" },
    { id: "travel", name: "여행" },
    { id: "beauty", name: "뷰티/패션" },
    { id: "finance", name: "재테크/금융" },
    { id: "health", name: "건강/피트니스" },
    { id: "parenting", name: "육아" },
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // API 호출
      const response = await axios.get(`/api/keywords?query=${encodeURIComponent(keyword)}&category=${category}`);
      
      if (response.data.success) {
        setResults(response.data.results);
      } else {
        setError('키워드 검색에 실패했습니다.');
      }
    } catch (err) {
      console.error('키워드 검색 오류:', err);
      setError('키워드 검색 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
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
              <Link href="/trends" className="text-gray-600 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400">
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
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">블로그 키워드, 더 현명하게 찾으세요</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            블로그 작성자를 위한 강력한 키워드 검색 도구로 노출과 수익을 높이세요
          </p>
        </div>

        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-12">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-4 mb-4">
              <select
                className="flex-grow-0 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              
              <div className="relative flex-grow">
                <input
                  type="text"
                  className="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  placeholder="키워드를 입력하세요 (예: 맛집 추천, 주식 투자 방법)"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute right-2.5 bottom-2 top-2 px-4 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="h-5 w-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                  ) : (
                    "검색"
                  )}
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {results.length > 0 ? (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4">검색 결과 ({results.length})</h3>
              <div className="grid gap-4">
                {results.map((result, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-medium">{result.keyword}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        result.trend === "상승" 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                          : result.trend === "하강"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      }`}>
                        {result.trend === "상승" ? "↑ " : result.trend === "하강" ? "↓ " : "→ "}
                        {result.trend}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">월간 검색량</p>
                        <p className="font-medium">{result.volume.toLocaleString()}회</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">경쟁 강도</p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-1">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${result.difficulty}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">연관 키워드</p>
                      <div className="flex flex-wrap gap-2">
                        {result.related.map((keyword, idx) => (
                          <span 
                            key={idx} 
                            className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded dark:bg-blue-900 dark:text-blue-200"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : !isLoading && !error && (
            <div className="text-center p-8 text-gray-500">
              <p>검색어를 입력하거나 카테고리를 선택하여 키워드를 찾아보세요.</p>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-blue-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">실시간 검색량 데이터</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Google과 Naver의 검색 데이터를 기반으로 키워드의 인기도와 트렌드를 파악하세요
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-blue-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">경쟁 강도 분석</h3>
            <p className="text-gray-600 dark:text-gray-300">
              키워드별 경쟁 수준을 확인하고 블로그가 상위 노출될 가능성이 높은 키워드를 찾으세요
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-blue-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">연관 키워드 추천</h3>
            <p className="text-gray-600 dark:text-gray-300">
              주요 키워드와 관련된 연관 키워드를 발견하고 블로그 콘텐츠를 더욱 풍부하게 만드세요
            </p>
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
