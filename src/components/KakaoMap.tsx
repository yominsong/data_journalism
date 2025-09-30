'use client';

import { useEffect, useRef, useState } from 'react';

interface MarkerData {
  latitude: number;
  longitude: number;
  [key: string]: any;
}

type DataSource = 'json' | 'wms' | 'both';

interface KakaoMapProps {
  center?: { lat: number; lng: number };
  level?: number;
  className?: string;
  markers?: MarkerData[];
  dataSource?: DataSource;
  selectedYears?: number[];
}

export default function KakaoMap({ 
  center = { lat: 36.5, lng: 127.5 }, // 대한민국 지리적 중심점
  level = 12, // 32km 축적에 해당하는 줌 레벨
  className = "w-full h-full",
  markers = [],
  dataSource = 'json',
  selectedYears = [2024]
}: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<kakao.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const markersRef = useRef<kakao.maps.Marker[]>([]);
  const polygonsRef = useRef<kakao.maps.Polygon[]>([]);
  const clustererRef = useRef<any>(null);
  const wmsOverlayRef = useRef<HTMLDivElement | null>(null);
  const [wmsUrl, setWmsUrl] = useState<string>('');
  const [showWms, setShowWms] = useState(false);

  useEffect(() => {
    console.log('KakaoMap 컴포넌트 마운트됨');
    
    // 이미 스크립트가 로드되어 있는지 확인
    if (window.kakao && window.kakao.maps) {
      console.log('카카오 맵 API가 이미 로드됨');
      (window.kakao.maps as any).load(() => {
        console.log('카카오 맵 로드 완료');
        setIsLoaded(true);
      });
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;
    console.log('API 키:', apiKey ? '설정됨' : '설정되지 않음');
    
    if (!apiKey) {
      console.error('카카오 맵 API 키가 설정되지 않았습니다.');
      return;
    }

    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false&libraries=clusterer`;
    script.async = true;
    
    script.onload = () => {
      if (window.kakao && window.kakao.maps) {
        (window.kakao.maps as any).load(() => {
          setIsLoaded(true);
        });
      }
    };

    script.onerror = () => {
      console.error('카카오 맵 API 로드 실패');
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (isLoaded && mapRef.current && !map) {
      const mapContainer = mapRef.current;
      const mapOption = {
        center: new window.kakao.maps.LatLng(center.lat, center.lng),
        level: level
      };

      const newMap = new window.kakao.maps.Map(mapContainer, mapOption);
      
      // 지도 타일만 그레이스케일 적용 (마커/클러스터/폴리곤 제외)
      const applyTileGrayscale = () => {
        // 모든 img 태그 찾기
        const allImages = mapContainer.querySelectorAll('img');
        allImages.forEach((img) => {
          const src = img.src || '';
          // 타일 이미지만 그레이스케일 적용 (마커 이미지는 제외)
          if (src.includes('map') || src.includes('tile') || src.includes('kakaocdn')) {
            if (!src.includes('marker') && !src.includes('mk') && !src.includes('icon')) {
              img.style.filter = 'grayscale(100%)';
            }
          }
        });
      };
      
      // 초기 적용
      setTimeout(applyTileGrayscale, 100);
      setTimeout(applyTileGrayscale, 300);
      setTimeout(applyTileGrayscale, 500);
      setTimeout(applyTileGrayscale, 1000);
      
      // 지도 이동/확대 시에도 적용
      ((window.kakao.maps as any).event as any).addListener(newMap, 'idle', applyTileGrayscale);
      ((window.kakao.maps as any).event as any).addListener(newMap, 'tilesloaded', applyTileGrayscale);
      ((window.kakao.maps as any).event as any).addListener(newMap, 'zoom_changed', applyTileGrayscale);
      
      setMap(newMap);
    }
  }, [isLoaded, center.lat, center.lng, level, map]);

  useEffect(() => {
    if (map) {
      const newCenter = new window.kakao.maps.LatLng(center.lat, center.lng);
      map.setCenter(newCenter);
      map.setLevel(level);
    }
  }, [map, center.lat, center.lng, level]);

  // 마커 및 폴리곤 표시
  useEffect(() => {
    if (!map) return;

    // 기존 클러스터러 제거
    if (clustererRef.current) {
      clustererRef.current.clear();
    }

    // 기존 마커 제거
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // 기존 폴리곤 제거
    polygonsRef.current.forEach(polygon => polygon.setMap(null));
    polygonsRef.current = [];

    // markers가 비어있으면 정리만 하고 종료
    if (!markers.length) {
      console.log('마커가 없습니다. 지도를 비웁니다.');
      return;
    }

    // InfoWindow 생성
    const infowindow = new window.kakao.maps.InfoWindow({
      removable: true
    });

    // MarkerClusterer 생성 (사고다발지역 전용 - 파란색)
    clustererRef.current = new (window.kakao.maps as any).MarkerClusterer({
      map: map,
      averageCenter: true,
      minLevel: 5,
      minClusterSize: 2,
      disableClickZoom: false,
      styles: [
        {
          width: '50px',
          height: '50px',
          background: '#3366FF',
          borderRadius: '25px',
          color: '#fff',
          textAlign: 'center',
          lineHeight: '50px',
          fontSize: '16px',
          fontWeight: 'bold',
          border: '3px solid #fff',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
        },
        {
          width: '60px',
          height: '60px',
          background: '#3366FF',
          borderRadius: '30px',
          color: '#fff',
          textAlign: 'center',
          lineHeight: '60px',
          fontSize: '18px',
          fontWeight: 'bold',
          border: '3px solid #fff',
          boxShadow: '0 3px 8px rgba(0,0,0,0.4)'
        },
        {
          width: '70px',
          height: '70px',
          background: '#3366FF',
          borderRadius: '35px',
          color: '#fff',
          textAlign: 'center',
          lineHeight: '70px',
          fontSize: '20px',
          fontWeight: 'bold',
          border: '4px solid #fff',
          boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
        }
      ],
      calculator: [10, 100, 1000]
    });

    // 마커 그레이스케일 제외 함수
    const removeMarkerGrayscale = () => {
      const allMarkers = document.querySelectorAll('img[src*="marker"], img[src*="mk"]');
      allMarkers.forEach((img) => {
        (img as HTMLElement).style.filter = 'none';
      });
    };

    // 데이터 타입별 색상 정의
    const getColorByType = (dataType: string) => {
      switch(dataType) {
        case 'elderly': return { stroke: '#3366FF', fill: '#3366FF' }; // 파란색 - 고령자 사고
        case 'medical': return { stroke: '#FF3366', fill: '#FF3366' }; // 빨간색 - 의료기관
        case 'market': return { stroke: '#FF9933', fill: '#FF9933' }; // 주황색 - 전통시장
        case 'welfare': return { stroke: '#33CC66', fill: '#33CC66' }; // 초록색 - 사회복지관
        default: return { stroke: '#3366FF', fill: '#3366FF' };
      }
    };

    // 데이터 타입별 커스텀 마커 이미지 생성
    const getMarkerImage = (dataType: string) => {
      const colors = getColorByType(dataType);
      let svgMarker = '';
      
      if (dataType === 'medical') {
        // 의료기관: 십자가 + H 마크
        svgMarker = `
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="${colors.fill}" stroke="#ffffff" stroke-width="3"/>
            <path d="M20 8 L20 32 M8 20 L32 20" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
          </svg>
        `;
      } else if (dataType === 'market') {
        // 전통시장: 장바구니
        svgMarker = `
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="${colors.fill}" stroke="#ffffff" stroke-width="3"/>
            <path d="M12 15 L28 15 L26 30 L14 30 Z" fill="#ffffff" stroke="#ffffff" stroke-width="1"/>
            <path d="M15 15 L15 12 C15 10 17 10 17 12 L17 15" stroke="#ffffff" stroke-width="2" fill="none"/>
            <path d="M23 15 L23 12 C23 10 25 10 25 12 L25 15" stroke="#ffffff" stroke-width="2" fill="none"/>
          </svg>
        `;
      } else if (dataType === 'welfare') {
        // 사회복지관: 사람들
        svgMarker = `
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="${colors.fill}" stroke="#ffffff" stroke-width="3"/>
            <circle cx="15" cy="15" r="3" fill="#ffffff"/>
            <path d="M10 25 C10 22 12 20 15 20 C18 20 20 22 20 25" stroke="#ffffff" stroke-width="2" fill="none"/>
            <circle cx="25" cy="15" r="3" fill="#ffffff"/>
            <path d="M20 25 C20 22 22 20 25 20 C28 20 30 22 30 25" stroke="#ffffff" stroke-width="2" fill="none"/>
          </svg>
        `;
      } else {
        // 기본 마커
        svgMarker = `
          <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0C7.163 0 0 7.163 0 16c0 8.837 16 24 16 24s16-15.163 16-24C32 7.163 24.837 0 16 0z" 
                  fill="${colors.fill}" 
                  stroke="#ffffff" 
                  stroke-width="2"/>
            <circle cx="16" cy="16" r="6" fill="#ffffff"/>
          </svg>
        `;
      }
      
      // SVG를 data URL로 변환
      const encodedSvg = encodeURIComponent(svgMarker);
      const dataUrl = `data:image/svg+xml,${encodedSvg}`;
      
      const imageSize = new (window.kakao.maps as any).Size(40, 40);
      const imageOption = { offset: new (window.kakao.maps as any).Point(20, 20) };
      
      return new (window.kakao.maps as any).MarkerImage(dataUrl, imageSize, imageOption);
    };

    // 새 마커 및 폴리곤 추가
    markers.forEach(data => {
      const colors = getColorByType(data.dataType);
      
      // WMS 모드에서는 사고다발지역(elderly)만 스킵
      if (dataSource === 'wms' && data.dataType === 'elderly') {
        return; // 사고다발지역은 WMS로 표시
      }
      
      // 폴리곤이 있으면 그리기
      if (data.polygon && data.polygon.coordinates && data.polygon.coordinates.length > 0) {
        const coords = data.polygon.coordinates[0];
        const path = coords.map((coord: number[]) => 
          new window.kakao.maps.LatLng(coord[1], coord[0])
        );

        const polygon = new window.kakao.maps.Polygon({
          path: path,
          strokeWeight: 2,
          strokeColor: colors.stroke,
          strokeOpacity: 0.8,
          fillColor: colors.fill,
          fillOpacity: 0.3,
          map: map
        });

        polygonsRef.current.push(polygon);

        // 폴리곤 클릭 이벤트
        ((window.kakao.maps as any).event as any).addListener(polygon, 'click', () => {
          // 폴리곤 중심점 계산
          const bounds = new (window.kakao.maps as any).LatLngBounds();
          path.forEach((latlng: kakao.maps.LatLng) => {
            if (bounds.extend) {
              bounds.extend(latlng);
            }
          });
          
          // bounds에 getCenter가 없으면 첫 번째 좌표 사용
          let center;
          if (bounds.getCenter && typeof bounds.getCenter === 'function') {
            center = bounds.getCenter();
          } else if (path.length > 0) {
            center = path[0];
          } else {
            console.warn('폴리곤 중심점을 계산할 수 없습니다.');
            return;
          }

          // 정보 창 내용 생성
          let content = '<div style="padding:10px;width:250px;max-height:200px;overflow:hidden;color:#000;white-space:normal;word-break:break-all;box-sizing:border-box;">';
          
          if (data.spot_name) {
            const spotName = data.spot_name.length > 40 ? data.spot_name.substring(0, 40) + '...' : data.spot_name;
            content += `<strong style="display:block;margin-bottom:5px;font-size:13px;line-height:1.3;color:${colors.stroke};">[사고다발지역]</strong>`;
            content += `<strong style="display:block;margin-bottom:5px;font-size:13px;line-height:1.3;">${spotName}</strong>`;
            content += `<div style="font-size:11px;line-height:1.4;">`;
            content += `사고 건수: ${data.accident_count}건<br>`;
            content += `사상자: ${data.casualties}명<br>`;
            content += `사망: ${data.deaths}명<br>`;
            content += `중상: ${data.serious_injuries}명`;
            content += `</div>`;
          }
          
          content += '</div>';

          infowindow.setContent(content);
          (infowindow as any).setPosition(center);
          infowindow.open(map);
        });
      }

      // 좌표가 없으면 스킵
      if (!data.latitude || !data.longitude) {
        console.warn('좌표 없음:', data.name || data.spot_name);
        return;
      }

      // 마커 추가 (사고다발지역은 클러스터용, 나머지는 커스텀 이미지로 직접 표시)
      const position = new window.kakao.maps.LatLng(data.latitude, data.longitude);
      const markerOptions: any = {
        position,
        map: data.dataType !== 'elderly' ? map : undefined // 사고다발지역 외에는 직접 표시
      };
      
      // 사고다발지역이 아니면 커스텀 마커 이미지 적용
      if (data.dataType !== 'elderly') {
        markerOptions.image = getMarkerImage(data.dataType);
      }
      
      const marker = new window.kakao.maps.Marker(markerOptions);

      // 마커 클릭 이벤트
      ((window.kakao.maps as any).event as any).addListener(marker, 'click', () => {
        // 정보 창 내용 생성
        let content = '<div style="padding:10px;width:250px;max-height:200px;overflow:hidden;color:#000;white-space:normal;word-break:break-all;box-sizing:border-box;">';
        
        // 데이터 타입별 라벨 정의
        const getTypeLabel = (dataType: string) => {
          switch(dataType) {
            case 'elderly': return '[사고다발지역]';
            case 'medical': return '[의료기관]';
            case 'market': return '[전통시장]';
            case 'welfare': return '[사회복지관]';
            default: return '[위치]';
          }
        };
        
        // 타입 라벨 표시
        const typeLabel = getTypeLabel(data.dataType);
        content += `<strong style="display:block;margin-bottom:5px;font-size:13px;line-height:1.3;color:${colors.stroke};">${typeLabel}</strong>`;
        
        // 데이터 타입에 따라 다른 정보 표시
        if (data.spot_name) {
          // 고령자 사고 다발 지역
          const spotName = data.spot_name.length > 40 ? data.spot_name.substring(0, 40) + '...' : data.spot_name;
          content += `<strong style="display:block;margin-bottom:5px;font-size:13px;line-height:1.3;">${spotName}</strong>`;
          content += `<div style="font-size:11px;line-height:1.4;">`;
          content += `사고 건수: ${data.accident_count}건<br>`;
          content += `사상자: ${data.casualties}명<br>`;
          content += `사망: ${data.deaths}명<br>`;
          content += `중상: ${data.serious_injuries}명`;
          content += `</div>`;
        } else if (data.name) {
          // 기타 시설 (이름이 있는 경우)
          const name = data.name.length > 40 ? data.name.substring(0, 40) + '...' : data.name;
          content += `<strong style="display:block;margin-bottom:5px;font-size:13px;line-height:1.3;">${name}</strong>`;
          content += `<div style="font-size:11px;line-height:1.4;">`;
          if (data.address) {
            const address = data.address.length > 50 ? data.address.substring(0, 50) + '...' : data.address;
            content += `주소: ${address}<br>`;
          }
          if (data.type) content += `유형: ${data.type}`;
          content += `</div>`;
        } else {
          // 기본 정보
          content += `<strong style="display:block;margin-bottom:5px;font-size:13px;line-height:1.3;">위치 정보</strong>`;
          content += `<div style="font-size:11px;line-height:1.4;">`;
          content += `위도: ${data.latitude.toFixed(6)}<br>`;
          content += `경도: ${data.longitude.toFixed(6)}`;
          content += `</div>`;
        }
        
        content += '</div>';

        infowindow.setContent(content);
        infowindow.open(map, marker);
      });

      markersRef.current.push(marker);
    });

    // 사고다발지역 마커만 클러스터러에 추가 (WMS 모드가 아닐 때만)
    if (dataSource !== 'wms') {
      const elderlyMarkers = markersRef.current.filter((_, index) => markers[index]?.dataType === 'elderly');
      if (clustererRef.current && elderlyMarkers.length > 0) {
        clustererRef.current.addMarkers(elderlyMarkers);
        console.log(`${elderlyMarkers.length}개의 사고다발지역 마커에 클러스터링 적용`);
      }
    }

    // 마커 렌더링 후 그레이스케일 제거
    setTimeout(removeMarkerGrayscale, 100);
    setTimeout(removeMarkerGrayscale, 500);

    const elderlyCount = markers.filter(m => m.dataType === 'elderly').length;
    const medicalCount = markers.filter(m => m.dataType === 'medical').length;
    const marketCount = markers.filter(m => m.dataType === 'market').length;
    const welfareCount = markers.filter(m => m.dataType === 'welfare').length;
    
    console.log(`=== 마커 렌더링 (dataSource: ${dataSource}) ===`);
    console.log(`총 ${markers.length}개 데이터:`);
    if (dataSource === 'wms') {
      console.log(`  - 사고다발지역: ${elderlyCount}개 (WMS로 표시)`);
    } else {
      console.log(`  - 사고다발지역: ${elderlyCount}개 (JSON 클러스터링)`);
    }
    console.log(`  - 의료기관: ${medicalCount}개 (개별 표시)`);
    console.log(`  - 전통시장: ${marketCount}개 (개별 표시)`);
    console.log(`  - 사회복지관: ${welfareCount}개 (개별 표시)`);
  }, [map, markers, dataSource]);

  // WMS URL 생성 및 업데이트
  useEffect(() => {
    if (!map || dataSource === 'json' || selectedYears.length === 0) {
      // WMS 사용하지 않음
      setShowWms(false);
      setWmsUrl('');
      return;
    }

    setShowWms(true);

    const updateWMSLayer = () => {
      const bounds = (map as any).getBounds();
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      
      const bbox = `${sw.getLng()},${sw.getLat()},${ne.getLng()},${ne.getLat()}`;
      const apiKey = process.env.NEXT_PUBLIC_KOROAD_API_KEY;
      
      // searchYearCd는 accident_id 값을 그대로 사용
      // 연도별 대표 accident_id 매핑 (하드코딩)
      const YEAR_TO_ACCIDENT_ID: Record<number, number> = {
        2012: 2013098,
        2013: 2014105,
        2014: 2015048,
        2015: 2016146,
        2016: 2017029,
        2017: 2018029,
        2018: 2019036,
        2019: 2020027,
        2020: 2021024,
        2021: 2022042,
        2022: 2023057,
        2023: 2024044,
        2024: 2025076
      };
      
      const selectedYear = selectedYears[0];
      const searchYearCd = YEAR_TO_ACCIDENT_ID[selectedYear];
      
      if (!searchYearCd) {
        console.warn('⚠️ 지원하지 않는 연도입니다:', selectedYear);
        return;
      }
      
      // WMS 요청 URL 구성 (시도/구군 없이 전국)
      // API 키는 이미 URL 인코딩되어 있으므로 그대로 사용
      const wmsUrl = 
        `https://opendata.koroad.or.kr/data/wms/frequentzone/oldman?` +
        `authKey=${apiKey}` +
        `&layers=freoldman` +
        `&format=image/png` +
        `&transparent=TRUE` +
        `&service=WMS` +
        `&version=1.1.1` +
        `&request=GetMap` +
        `&bbox=${bbox}` +
        `&width=1024` +
        `&height=1024` +
        `&srs=EPSG:4326` +
        `&searchYearCd=${searchYearCd}`;
      
      console.log('🗺️ WMS URL 생성:');
      console.log('   ', wmsUrl);
      console.log('  - bbox:', bbox);
      console.log('  - 선택 연도:', selectedYear);
      console.log('  - searchYearCd (accident_id):', searchYearCd);
      console.log('  - API Key (앞 20자):', apiKey?.substring(0, 20) + '...');
      setWmsUrl(wmsUrl);
    };

    // 초기 로드
    updateWMSLayer();

    // 지도 이동/줌 이벤트 리스너
    const idleListener = () => updateWMSLayer();
    const zoomChangedListener = () => updateWMSLayer();
    
    ((window.kakao.maps as any).event as any).addListener(map, 'idle', idleListener);
    ((window.kakao.maps as any).event as any).addListener(map, 'zoom_changed', zoomChangedListener);
    ((window.kakao.maps as any).event as any).addListener(map, 'dragend', idleListener);

    return () => {
      ((window.kakao.maps as any).event as any).removeListener(map, 'idle', idleListener);
      ((window.kakao.maps as any).event as any).removeListener(map, 'zoom_changed', zoomChangedListener);
      ((window.kakao.maps as any).event as any).removeListener(map, 'dragend', idleListener);
    };
  }, [map, dataSource, selectedYears]);

  return (
    <div className={className} style={{ position: 'relative' }}>
      <div 
        ref={mapRef} 
        className="w-full h-full"
      />
      {showWms && wmsUrl && (
        <div 
          ref={wmsOverlayRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1
          }}
        >
          <img 
            src={wmsUrl} 
            alt="WMS Layer"
            style={{
              width: '100%',
              height: '100%',
              opacity: 0.7,
              objectFit: 'cover'
            }}
            onLoad={(e) => {
              console.log('✅ WMS 이미지 로드 완료!');
              console.log('   URL:', wmsUrl);
              console.log('   크기:', (e.target as HTMLImageElement).naturalWidth, 'x', (e.target as HTMLImageElement).naturalHeight);
            }}
            onError={(e) => {
              console.error('❌ WMS 이미지 로드 실패');
              console.error('   URL:', wmsUrl);
              console.error('   Target:', e.target);
              console.error('   현재 이미지:', (e.target as HTMLImageElement).src);
              console.log('\n🔗 이 URL을 복사해서 새 탭에서 열어보세요:');
              console.log(wmsUrl);
              
              // URL을 직접 fetch로 테스트
              fetch(wmsUrl)
                .then(res => {
                  console.log('Fetch 응답:', res.status, res.statusText);
                  console.log('Content-Type:', res.headers.get('content-type'));
                  return res.text();
                })
                .then(text => {
                  console.log('응답 내용 (처음 500자):', text.substring(0, 500));
                })
                .catch(err => {
                  console.error('Fetch 에러:', err);
                });
            }}
          />
        </div>
      )}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">지도를 불러오는 중...</p>
          </div>
        </div>
      )}
    </div>
  );
}
