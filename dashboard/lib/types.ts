export type DeviceType = 'mobile' | 'desktop';

export interface Page {
  _id: string;
  created_at: string;
  isEnabled: boolean;
  url: string;
  name: string;
  env: string;
  device: DeviceType;
  benchmarkScore: number;
  thresholdPercentage: number;
  auth?: any;
}

export interface PageUpdate {
  isEnabled?: boolean;
  name?: string;
  env?: string;
  device?: DeviceType;
  benchmarkScore?: number;
  thresholdPercentage?: number;
  auth?: any;
}

export interface PageScore {
  _id: string;
  page_id: string;
  created_at: string;
  url: string;
  device: DeviceType;
  psi_score: number;
  seo_score: number;
  metrics: Record<string, any>;
}