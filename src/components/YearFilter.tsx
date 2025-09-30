'use client';

import { useState } from 'react';

interface YearFilterProps {
  selectedYears: number[];
  onYearChange: (years: number[]) => void;
}

export default function YearFilter({ selectedYears, onYearChange }: YearFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const years = Array.from({ length: 13 }, (_, i) => 2024 - i); // 2024-2012 (내림차순)

  const toggleYear = (year: number) => {
    if (selectedYears.includes(year)) {
      onYearChange(selectedYears.filter(y => y !== year));
    } else {
      onYearChange([...selectedYears, year].sort());
    }
  };

  const selectAll = () => {
    onYearChange(years);
  };

  const deselectAll = () => {
    onYearChange([]);
  };

  return (
    <div className="absolute top-4 right-4 z-10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-200 flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span className="font-medium">연도 필터</span>
        <span className="text-sm text-gray-500">({selectedYears.length}개 선택)</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-900">연도 선택</h3>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                전체 선택
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={deselectAll}
                className="text-xs text-gray-600 hover:text-gray-800"
              >
                전체 해제
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
                  ${selectedYears.includes(year)
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {year}
              </button>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              선택된 연도: {selectedYears.length > 0 ? selectedYears.join(', ') : '없음'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
