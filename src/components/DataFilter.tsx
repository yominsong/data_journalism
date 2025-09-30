'use client';

import { useState } from 'react';

export type DataSource = 'json' | 'wms' | 'both';

export interface FilterState {
  selectedYears: number[];
  showMedical: boolean;
  showMarket: boolean;
  showWelfare: boolean;
  dataSource: DataSource;
}

interface DataFilterProps {
  filterState: FilterState;
  onFilterChange: (newState: FilterState) => void;
}

export default function DataFilter({ filterState, onFilterChange }: DataFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const years = Array.from({ length: 13 }, (_, i) => 2024 - i); // 2024-2012 (내림차순)

  const toggleYear = (year: number) => {
    const newYears = filterState.selectedYears.includes(year)
      ? filterState.selectedYears.filter(y => y !== year)
      : [...filterState.selectedYears, year].sort((a, b) => b - a);
    
    onFilterChange({ ...filterState, selectedYears: newYears });
  };

  const selectAllYears = () => {
    onFilterChange({ ...filterState, selectedYears: years });
  };

  const deselectAllYears = () => {
    onFilterChange({ ...filterState, selectedYears: [] });
  };

  const toggleFacility = (facility: 'medical' | 'market' | 'welfare') => {
    const key = `show${facility.charAt(0).toUpperCase() + facility.slice(1)}` as keyof FilterState;
    onFilterChange({ ...filterState, [key]: !filterState[key] });
  };

  const selectedCount = filterState.selectedYears.length + 
    (filterState.showMedical ? 1 : 0) + 
    (filterState.showMarket ? 1 : 0) + 
    (filterState.showWelfare ? 1 : 0);

  return (
    <div className="absolute top-4 right-4 z-10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-200 flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span className="font-medium">필터</span>
        <span className="text-sm text-gray-500">({selectedCount}개 활성)</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-96">
          {/* 연도 필터 */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <span className="text-blue-600">📅</span>
                사고다발지역 연도
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={selectAllYears}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  전체
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={deselectAllYears}
                  className="text-xs text-gray-600 hover:text-gray-800"
                >
                  해제
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {years.map(year => (
                <button
                  key={year}
                  onClick={() => toggleYear(year)}
                  className={`
                    px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${filterState.selectedYears.includes(year)
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {year}
                </button>
              ))}
            </div>

            <div className="mt-2">
              <p className="text-xs text-gray-500">
                {filterState.selectedYears.length}개 연도 선택됨
              </p>
            </div>
          </div>

          {/* 데이터 소스 선택 */}
          <div className="pt-4 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-blue-600">📊</span>
              사고다발지역 데이터 소스
            </h3>
            
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="dataSource"
                  checked={filterState.dataSource === 'json'}
                  onChange={() => onFilterChange({ ...filterState, dataSource: 'json' })}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="flex items-center gap-2 flex-1">
                  <span className="font-medium text-gray-700">JSON 데이터</span>
                  <span className="text-xs text-gray-500">(마커 + 폴리곤)</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="dataSource"
                  checked={filterState.dataSource === 'wms'}
                  onChange={() => onFilterChange({ ...filterState, dataSource: 'wms' })}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="flex items-center gap-2 flex-1">
                  <span className="font-medium text-gray-700">WMS 레이어</span>
                  <span className="text-xs text-gray-500">(실시간 이미지)</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="dataSource"
                  checked={filterState.dataSource === 'both'}
                  onChange={() => onFilterChange({ ...filterState, dataSource: 'both' })}
                  className="w-4 h-4 text-blue-600"
                />
                <div className="flex items-center gap-2 flex-1">
                  <span className="font-medium text-gray-700">모두 표시</span>
                  <span className="text-xs text-gray-500">(JSON + WMS)</span>
                </div>
              </label>
            </div>
          </div>

          {/* 시설 유형 필터 */}
          <div className="pt-4 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-blue-600">🏢</span>
              시설 유형
            </h3>
            
            <div className="space-y-2">
              {/* 의료기관 */}
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterState.showMedical}
                  onChange={() => toggleFacility('medical')}
                  className="w-4 h-4 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                />
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-xl">🏥</span>
                  <span className="font-medium text-gray-700">의료기관</span>
                  <span className="ml-auto w-3 h-3 rounded-full bg-red-500"></span>
                </div>
              </label>

              {/* 전통시장 */}
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterState.showMarket}
                  onChange={() => toggleFacility('market')}
                  className="w-4 h-4 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
                />
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-xl">🛒</span>
                  <span className="font-medium text-gray-700">전통시장</span>
                  <span className="ml-auto w-3 h-3 rounded-full bg-orange-500"></span>
                </div>
              </label>

              {/* 사회복지관 */}
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterState.showWelfare}
                  onChange={() => toggleFacility('welfare')}
                  className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                />
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-xl">👥</span>
                  <span className="font-medium text-gray-700">사회복지관</span>
                  <span className="ml-auto w-3 h-3 rounded-full bg-green-500"></span>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

