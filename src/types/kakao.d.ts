declare namespace kakao.maps {
  class Map {
    constructor(container: HTMLElement, options: MapOptions);
    setCenter(latlng: LatLng): void;
    setLevel(level: number): void;
    getCenter(): LatLng;
    getLevel(): number;
    getBounds(): LatLngBounds;
    setMapTypeId(mapTypeId: string): void;
    setMapStyle(style: any[]): void;
  }

  class LatLngBounds {
    constructor();
    extend(latlng: LatLng): void;
    getSouthWest(): LatLng;
    getNorthEast(): LatLng;
    getCenter(): LatLng;
  }

  interface MapOptions {
    center: LatLng;
    level: number;
  }

  class LatLng {
    constructor(lat: number, lng: number);
    getLat(): number;
    getLng(): number;
  }

  class Marker {
    constructor(options: MarkerOptions);
    setMap(map: Map | null): void;
    setPosition(latlng: LatLng): void;
    getPosition(): LatLng;
  }

  interface MarkerOptions {
    position: LatLng;
    map?: Map;
    image?: MarkerImage;
  }

  class MarkerImage {
    constructor(src: string, size: Size, options?: MarkerImageOptions);
  }

  interface MarkerImageOptions {
    offset?: Point;
    alt?: string;
    coords?: string;
    shape?: string;
  }

  class Size {
    constructor(width: number, height: number);
  }

  class Point {
    constructor(x: number, y: number);
  }

  class InfoWindow {
    constructor(options?: InfoWindowOptions);
    open(map: Map, marker?: Marker): void;
    close(): void;
    setContent(content: string): void;
    setPosition(position: LatLng): void;
  }

  interface InfoWindowOptions {
    content?: string;
    removable?: boolean;
  }

  class CustomOverlay {
    constructor(options: CustomOverlayOptions);
    setMap(map: Map | null): void;
    getMap(): Map;
  }

  interface CustomOverlayOptions {
    map?: Map;
    content: string | HTMLElement;
    position: LatLng;
    xAnchor?: number;
    yAnchor?: number;
    zIndex?: number;
  }

  class Polygon {
    constructor(options: PolygonOptions);
    setMap(map: Map | null): void;
    setPath(path: LatLng[][]): void;
  }

  interface PolygonOptions {
    path: LatLng[] | LatLng[][];
    strokeWeight?: number;
    strokeColor?: string;
    strokeOpacity?: number;
    fillColor?: string;
    fillOpacity?: number;
    map?: Map;
  }

  function load(callback: () => void): void;

  enum MapTypeId {
    ROADMAP = 'ROADMAP',
    SKYVIEW = 'SKYVIEW',
    HYBRID = 'HYBRID',
    OVERLAY = 'OVERLAY',
    ROADVIEW = 'ROADVIEW',
    TRAFFIC = 'TRAFFIC',
    TERRAIN = 'TERRAIN',
    BICYCLE = 'BICYCLE',
    BICYCLE_HYBRID = 'BICYCLE_HYBRID',
    USE_DISTRICT = 'USE_DISTRICT'
  }

  namespace event {
    function addListener(target: any, type: string, callback: Function): void;
    function removeListener(target: any, type: string, callback: Function): void;
  }

  class MarkerClusterer {
    constructor(options: MarkerClustererOptions);
    addMarker(marker: Marker): void;
    addMarkers(markers: Marker[]): void;
    removeMarker(marker: Marker): void;
    removeMarkers(markers: Marker[]): void;
    clear(): void;
  }

  interface MarkerClustererOptions {
    map: Map;
    averageCenter?: boolean;
    minLevel?: number;
    minClusterSize?: number;
    styles?: any[];
    texts?: string[] | ((size: number) => string);
    calculator?: [number, (count: number) => number];
    disableClickZoom?: boolean;
    clickable?: boolean;
    hoverable?: boolean;
    gridSize?: number;
  }

  namespace clustering {
    class MarkerClusterer {
      constructor(options: MarkerClustererOptions);
      addMarker(marker: Marker): void;
      addMarkers(markers: Marker[]): void;
      removeMarker(marker: Marker): void;
      removeMarkers(markers: Marker[]): void;
      clear(): void;
    }
  }
}

declare const kakao: {
  maps: typeof kakao.maps;
};

declare global {
  interface Window {
    kakao: typeof kakao;
  }
}
