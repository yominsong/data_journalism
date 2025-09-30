export interface ElderlyHotspot {
  accident_fid: number;
  accident_id: number;
  region_code: number;
  spot_code: number;
  city_district: string;
  spot_name: string;
  accident_count: number;
  casualties: number;
  deaths: number;
  serious_injuries: number;
  minor_injuries: number;
  reported_injuries: number;
  longitude: number;
  latitude: number;
  polygon: {
    type: string;
    coordinates: number[][][];
  };
}

export interface MedicalInstitution {
  longitude: number;
  latitude: number;
  [key: string]: any;
}

export interface TraditionalMarket {
  longitude: number;
  latitude: number;
  [key: string]: any;
}

export interface WelfareCenter {
  longitude: number;
  latitude: number;
  [key: string]: any;
}

export type MarkerData = ElderlyHotspot | MedicalInstitution | TraditionalMarket | WelfareCenter;
