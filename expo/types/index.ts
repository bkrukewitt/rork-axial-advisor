export type CombineModel = '7250' | '8250' | '9250' | '7260' | '8260' | '9260';
export type HeaderType = 'Corn Head' | 'Draper Head' | 'Auger Head';
export type CropType = 'Corn' | 'Soybeans' | 'Wheat' | 'Canola' | 'Oats' | 'Barley' | 'Sorghum';
export type MoistureLevel = '< 13%' | '13\u201316%' | '16\u201320%' | '20\u201325%' | '> 25%';
export type YieldEstimate = '< 150 bu/ac' | '150\u2013200 bu/ac' | '200\u2013250 bu/ac' | '> 250 bu/ac';
export type AutomationMode = 'Quality Priority' | 'Throughput Priority' | 'Balanced';
export type ChatRole = 'user' | 'assistant';

export interface SettingPreset {
  id: string;
  crop: CropType;
  moisture: MoistureLevel;
  isFoodGrade: boolean;
  concave: string;
  rotor: string;
  fan: string;
  topSieve: string;
  bottomSieve: string;
  automationMode: AutomationMode;
  notes: string;
}

export interface QuickTip {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  content: string;
}

export interface QuickIssue {
  id: string;
  label: string;
  icon: string;
  response: string;
}

export interface SavedSetup {
  id: string;
  fieldName: string;
  date: string;
  combineModel: CombineModel;
  headerType: HeaderType;
  crop: CropType;
  moisture: MoistureLevel;
  yieldEstimate: YieldEstimate;
  concave: string;
  rotor: string;
  fan: string;
  topSieve: string;
  bottomSieve: string;
  automationMode: AutomationMode;
  notes: string;
  sampleQualityRating: number;
  isFoodGrade: boolean;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

export interface RecommendationResult {
  concave: string;
  rotor: string;
  fan: string;
  topSieve: string;
  bottomSieve: string;
  automationMode: AutomationMode;
  automationDescription: string;
  notes: string;
  foodGradeNotes?: string;
}

export interface AdvisorFormState {
  combineModel: CombineModel;
  headerType: HeaderType;
  crop: CropType;
  moisture: MoistureLevel;
  yieldEstimate: YieldEstimate;
  isFoodGrade: boolean;
}

export const COMBINE_MODELS: CombineModel[] = ['7250', '8250', '9250', '7260', '8260', '9260'];
export const HEADER_TYPES: HeaderType[] = ['Corn Head', 'Draper Head', 'Auger Head'];
export const CROP_TYPES: CropType[] = ['Corn', 'Soybeans', 'Wheat', 'Canola', 'Oats', 'Barley', 'Sorghum'];
export const MOISTURE_LEVELS: MoistureLevel[] = ['< 13%', '13\u201316%', '16\u201320%', '20\u201325%', '> 25%'];
export const YIELD_ESTIMATES: YieldEstimate[] = ['< 150 bu/ac', '150\u2013200 bu/ac', '200\u2013250 bu/ac', '> 250 bu/ac'];

export const AUTOMATION_DESCRIPTIONS: Record<AutomationMode, string> = {
  'Quality Priority': 'Optimizes for sample cleanliness and kernel integrity. Best when market premiums depend on quality.',
  'Throughput Priority': 'Maximizes acres per hour. Best in ideal conditions with no quality concerns.',
  'Balanced': 'Balances throughput and quality. Recommended for most field conditions.',
};
