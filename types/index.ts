export type CombineModel = '7250' | '8250' | '9250' | '7260' | '8260' | '9260';
export type HeaderType = 'Corn Head' | 'Draper Head' | 'Auger Head';
export type CropType = 'Corn' | 'Soybeans' | 'Wheat' | 'Canola' | 'Oats' | 'Barley' | 'Sorghum';
export type MoistureLevel = '< 13%' | '13\u201316%' | '16\u201320%' | '20\u201325%' | '> 25%';
/** Yield estimate is a crop-aware string. Use YIELD_RANGES_BY_CROP for valid options per crop. */
export type YieldEstimate = string;
export type YieldCategory = 'low' | 'lowMid' | 'highMid' | 'high';
export type AutomationMode = 'Quality Priority' | 'Throughput Priority' | 'Balanced';
export type ChatRole = 'user' | 'assistant';

export interface AdminNote {
  id: string;
  text: string;
  isPublic: boolean;
  authorName?: string;
  createdAt: string;
}

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
  customNotes?: AdminNote[];
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
  publicCustomNotes?: AdminNote[];
  privateCustomNotes?: AdminNote[];
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

/**
 * Realistic yield ranges per crop (US bu/ac for grains; canola in bu/ac as commonly reported).
 * Index meaning: 0=low, 1=lowMid, 2=highMid, 3=high.
 */
export const YIELD_RANGES_BY_CROP: Record<CropType, [string, string, string, string]> = {
  Corn:     ['< 150 bu/ac', '150\u2013200 bu/ac', '200\u2013250 bu/ac', '> 250 bu/ac'],
  Soybeans: ['< 40 bu/ac',  '40\u201355 bu/ac',   '55\u201370 bu/ac',   '> 70 bu/ac'],
  Wheat:    ['< 40 bu/ac',  '40\u201360 bu/ac',   '60\u201380 bu/ac',   '> 80 bu/ac'],
  Canola:   ['< 30 bu/ac',  '30\u201345 bu/ac',   '45\u201360 bu/ac',   '> 60 bu/ac'],
  Oats:     ['< 60 bu/ac',  '60\u201390 bu/ac',   '90\u2013120 bu/ac',  '> 120 bu/ac'],
  Barley:   ['< 60 bu/ac',  '60\u201390 bu/ac',   '90\u2013110 bu/ac',  '> 110 bu/ac'],
  Sorghum:  ['< 60 bu/ac',  '60\u201390 bu/ac',   '90\u2013120 bu/ac',  '> 120 bu/ac'],
};

/** Default mid-range yield for a crop. */
export function defaultYieldFor(crop: CropType): YieldEstimate {
  return YIELD_RANGES_BY_CROP[crop][1];
}

/** Map a yield string to a category for use in recommendation logic. */
export function yieldCategoryFor(crop: CropType, value: YieldEstimate): YieldCategory {
  const ranges = YIELD_RANGES_BY_CROP[crop];
  const idx = ranges.indexOf(value);
  if (idx <= 0) return 'low';
  if (idx === 1) return 'lowMid';
  if (idx === 2) return 'highMid';
  return 'high';
}

export type AdminRole = 'super' | 'admin';

export interface AdminUser {
  id: string;
  name: string;
  passcode: string;
  role: AdminRole;
  createdAt: string;
}

export type AuditSection = 'preset' | 'tip' | 'issue' | 'admin' | 'system';
export type AuditAction =
  | 'update'
  | 'create'
  | 'delete'
  | 'reset'
  | 'revert'
  | 'restore'
  | 'import'
  | 'export'
  | 'clear-logs'
  | 'sign-in'
  | 'sign-out';

export interface AuditLogEntry {
  id: string;
  ts: string;
  adminId: string | null;
  adminName: string;
  section: AuditSection;
  entityId: string | null;
  entityLabel: string | null;
  action: AuditAction;
  field: string | null;
  oldValue: string | null;
  newValue: string | null;
  snapshot: unknown | null;
  summary: string;
}

export const AUTOMATION_DESCRIPTIONS: Record<AutomationMode, string> = {
  'Quality Priority': 'Optimizes for sample cleanliness and kernel integrity. Best when market premiums depend on quality.',
  'Throughput Priority': 'Maximizes acres per hour. Best in ideal conditions with no quality concerns.',
  'Balanced': 'Balances throughput and quality. Recommended for most field conditions.',
};
