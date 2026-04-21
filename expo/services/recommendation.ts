import { AdvisorFormState, AutomationMode, RecommendationResult, SettingPreset, AUTOMATION_DESCRIPTIONS } from '@/types';

function buildResult(preset: SettingPreset, form: AdvisorFormState): RecommendationResult {
  let notes = preset.notes;
  const foodGradeNotes = preset.isFoodGrade
    ? 'Food-grade mode active. Prioritize kernel integrity. Inspect sample every 10–15 minutes and document settings for contract compliance.'
    : undefined;

  // Yield adjustments
  if (form.yieldEstimate === '> 250 bu/ac') {
    notes += ' High yield field — reduce ground speed 10–15% to prevent overloading cleaning shoe.';
  } else if (form.yieldEstimate === '< 150 bu/ac') {
    notes += ' Light yield — you may be able to increase ground speed to improve efficiency.';
  }

  // Header type adjustments
  if (form.headerType === 'Draper Head' && (form.crop === 'Wheat' || form.crop === 'Barley' || form.crop === 'Canola')) {
    notes += ' Draper header: ensure belt speed is matched to ground speed to prevent header losses.';
  }

  // 260-series model notes
  if (['7260', '8260', '9260'].includes(form.combineModel)) {
    notes += ` ${form.combineModel} (260-series): Utilize variable geometry concave (VGC) for added threshing control.`;
  }

  return {
    concave: preset.concave,
    rotor: preset.rotor,
    fan: preset.fan,
    topSieve: preset.topSieve,
    bottomSieve: preset.bottomSieve,
    automationMode: preset.automationMode,
    automationDescription: AUTOMATION_DESCRIPTIONS[preset.automationMode],
    notes,
    foodGradeNotes,
  };
}

function fallbackRecommendation(form: AdvisorFormState): RecommendationResult {
  console.log('[Recommendation] Using fallback for:', form.crop, form.moisture);
  const automationMode: AutomationMode = 'Balanced';
  return {
    concave: '10–16 mm',
    rotor: '400–600 RPM',
    fan: '800–1,000 RPM',
    topSieve: '14 mm',
    bottomSieve: '6 mm',
    automationMode,
    automationDescription: AUTOMATION_DESCRIPTIONS[automationMode],
    notes: `Starting recommendation for ${form.crop}. Fine-tune all settings based on field conditions and sample quality.`,
  };
}

export function generateRecommendation(
  form: AdvisorFormState,
  presets: SettingPreset[]
): RecommendationResult {
  const foodFlag = form.isFoodGrade && form.crop === 'Corn' ? 'food' : 'std';
  const key = `${form.crop}|${form.moisture}|${foodFlag}`;

  console.log('[Recommendation] Looking up key:', key);
  const preset = presets.find(p => p.id === key);

  if (preset) {
    console.log('[Recommendation] Found preset:', preset.id);
    return buildResult(preset, form);
  }

  console.log('[Recommendation] No preset found, using fallback');
  return fallbackRecommendation(form);
}
