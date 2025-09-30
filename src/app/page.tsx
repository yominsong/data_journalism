'use client';

import { useState, useEffect, useMemo } from 'react';
import KakaoMap from '@/components/KakaoMap';
import DataFilter, { FilterState } from '@/components/DataFilter';

export default function Home() {
  const [allData, setAllData] = useState<any[]>([]);
  const [filterState, setFilterState] = useState<FilterState>({
    selectedYears: [2024], // 최신 연도만 기본 선택
    showMedical: true,     // 의료기관 표시
    showMarket: true,      // 전통시장 표시
    showWelfare: true      // 사회복지관 표시
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // 모든 JSON 파일 로드
        const [elderly, medical, markets, welfare] = await Promise.all([
          fetch('/data/elderly_hotspots.json').then(res => res.json()),
          fetch('/data/medical_institutions.json').then(res => res.json()),
          fetch('/data/traditional_markets.json').then(res => res.json()),
          fetch('/data/welfare_centers.json').then(res => res.json())
        ]);

        // 데이터에 타입 추가 및 좌표 통일 (latitude/longitude로)
        const elderlyWithType = elderly.map((item: any) => ({ 
          ...item, 
          dataType: 'elderly',
          latitude: item.latitude,
          longitude: item.longitude
        }));
        const medicalWithType = medical.map((item: any) => ({ 
          ...item, 
          dataType: 'medical',
          latitude: item.lat,
          longitude: item.lng
        }));
        const marketsWithType = markets.map((item: any) => ({ 
          ...item, 
          dataType: 'market',
          latitude: item.lat,
          longitude: item.lng
        }));
        const welfareWithType = welfare.map((item: any) => ({ 
          ...item, 
          dataType: 'welfare',
          latitude: item.lat,
          longitude: item.lon || item.lng // lon 또는 lng
        }));
        
        // 모든 데이터 합치기
        const allMarkers = [...elderlyWithType, ...medicalWithType, ...marketsWithType, ...welfareWithType];
        console.log(`총 ${allMarkers.length}개의 데이터 로드됨`);
        console.log(`- 고령자 사고: ${elderlyWithType.length}개`);
        console.log(`- 의료기관: ${medicalWithType.length}개`);
        console.log(`- 전통시장: ${marketsWithType.length}개`);
        console.log(`- 사회복지관: ${welfareWithType.length}개`);
        
        setAllData(allMarkers);
        setLoading(false);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // 필터 상태에 따라 데이터 필터링
  const filteredMarkers = useMemo(() => {
    const filtered = allData.filter(data => {
      // 데이터 타입별 필터링
      if (data.dataType === 'medical' && !filterState.showMedical) return false;
      if (data.dataType === 'market' && !filterState.showMarket) return false;
      if (data.dataType === 'welfare' && !filterState.showWelfare) return false;
      
      // 사고다발지역: 연도 필터 적용
      if (data.dataType === 'elderly') {
        if (filterState.selectedYears.length === 0) return false;
        
        if (data.accident_id) {
          const yearStr = String(data.accident_id).substring(0, 4);
          const year = parseInt(yearStr, 10) - 1;
          return filterState.selectedYears.includes(year);
        }
        return false;
      }
      
      // 의료기관/시장/복지관은 타입 필터만 통과하면 표시
      return true;
    });
    
    // 필터링 후 각 타입별 개수 출력
    const elderlyCount = filtered.filter(d => d.dataType === 'elderly').length;
    const medicalCount = filtered.filter(d => d.dataType === 'medical').length;
    const marketCount = filtered.filter(d => d.dataType === 'market').length;
    const welfareCount = filtered.filter(d => d.dataType === 'welfare').length;
    
    console.log('=== 필터링된 데이터 ===');
    console.log(`선택된 연도: ${filterState.selectedYears.join(', ')}`);
    console.log(`시설 필터: 의료=${filterState.showMedical}, 시장=${filterState.showMarket}, 복지=${filterState.showWelfare}`);
    console.log(`총 ${filtered.length}개 표시:`);
    console.log(`  - 사고다발지역: ${elderlyCount}개`);
    console.log(`  - 의료기관: ${medicalCount}개`);
    console.log(`  - 전통시장: ${marketCount}개`);
    console.log(`  - 사회복지관: ${welfareCount}개`);
    
    return filtered;
  }, [allData, filterState]);

  return (
    <div className="w-full h-screen relative">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-600">데이터 로딩 중...</p>
        </div>
      ) : (
        <>
          <KakaoMap 
            center={{ lat: 36.5, lng: 127.5 }}
            level={12}
            className="w-full h-full"
            markers={filteredMarkers}
          />
          <DataFilter 
            filterState={filterState}
            onFilterChange={setFilterState}
          />
          <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200 z-10">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">{filteredMarkers.length.toLocaleString()}개</span>의 데이터 표시 중
            </p>
          </div>
        </>
      )}
    </div>
  );
}
