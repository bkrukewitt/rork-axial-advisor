import { QuickIssue } from '@/types';

export const DEFAULT_ISSUES: QuickIssue[] = [
  {
    id: 'issue-1',
    label: 'Cracked / Split Grain',
    icon: 'zap',
    response: 'Cracked or split grain is typically caused by overly aggressive threshing:\n\n• Reduce rotor speed in 25\u201350 RPM increments\n• Open concave clearance 2\u20133 mm\n• Check concave and rotor bars for wear or damage\n• Reduce ground speed to lower feed rate\n• Inspect for bent or worn rotor rasp bars\n\nContinue evaluating the sample after each adjustment. Allow 2\u20133 minutes of travel before re-checking.',
  },
  {
    id: 'issue-2',
    label: 'Excessive Grain Loss',
    icon: 'trending-down',
    response: 'High grain losses can come from multiple sources. Identify the location first:\n\n**Header loss:** Reduce ground speed, lower reel, adjust reel speed\n**Separator loss:** Increase rotor speed 25 RPM, close concave 1\u20132 mm\n**Cleaning loss:** Reduce fan speed 50 RPM, open top sieve 1\u20132 mm\n\nWalk behind the combine to check for grain in the straw mat. Use a loss monitoring pan to isolate the source. Verify loss monitor calibration is current.',
  },
  {
    id: 'issue-3',
    label: 'Rotor Slug / Wrap',
    icon: 'alert-octagon',
    response: 'Rotor slugging requires immediate action:\n\n**Prevention:**\n• Do not over-fill the feeder house — maintain steady feed rate\n• Reduce ground speed in heavy or tough crop\n• Open concave to allow material to pass\n• Reduce rotor speed to recommended range\n\n**If slugged:**\n• Engage feeder house reverser to clear blockage\n• Do NOT reach into feeder house with engine running\n• After clearing, reduce feed rate before resuming\n\nFrequent wraps indicate settings are too aggressive for conditions.',
  },
  {
    id: 'issue-4',
    label: 'Dirty / Trashy Sample',
    icon: 'filter',
    response: 'A dirty grain sample with chaff, pods, or straw pieces indicates cleaning shoe issues:\n\n• Increase fan speed in 50 RPM increments\n• Close bottom sieve 1\u20132 mm\n• Check sieve seals for gaps allowing material bypass\n• Verify top sieve setting is not too open\n• Reduce ground speed to lower feed volume to cleaning shoe\n\nIn wet or heavy straw conditions, cleaning capacity is often the limiting factor. Consider reducing throughput.',
  },
  {
    id: 'issue-5',
    label: 'Wet Crop / Poor Threshing',
    icon: 'droplets',
    response: 'Unthreshed grain in tough, wet crop conditions:\n\n• Close concave clearance 2\u20133 mm from current setting\n• Increase rotor speed 25\u201350 RPM\n• Reduce ground speed by 15\u201320% to allow more rotor dwell time\n• Check for material buildup on concave underside\n• In very wet conditions, consider waiting for crop to dry\n\nNote: Increasing aggressiveness in wet corn risks smearing and damage. Balance threshing completeness against kernel quality.',
  },
  {
    id: 'issue-6',
    label: 'Food-Grade Quality Issue',
    icon: 'award',
    response: 'Maintaining food-grade corn quality requires extra attention:\n\n• Set automation to Quality Priority mode\n• Reduce rotor speed 50\u2013100 RPM below standard settings\n• Open concave 3\u20135 mm beyond standard\n• Reduce ground speed by 10\u201315%\n• Inspect sample every 10\u201315 minutes for splits\n• Keep moisture above 14% if possible to reduce breakage risk\n• Verify elevator acceptance moisture and quality standards\n\nDocument settings and sample results for contract compliance records.',
  },
  {
    id: 'issue-7',
    label: 'High Returns Volume',
    icon: 'refresh-cw',
    response: 'Excessive material in the returns (tailings) elevator indicates cleaning issues:\n\n• Open top sieve 1\u20132 mm to pass more material to bottom sieve\n• Reduce fan speed if material is being blown over sieves\n• Check for unthreshed material — if present, increase rotor speed\n• Clean returns for a full elevator cycle and re-evaluate\n• Verify returns elevator is not overloaded\n\nHigh returns increase sample damage and reduce capacity. Aim for less than 10% of clean grain volume in returns.',
  },
  {
    id: 'issue-8',
    label: 'Calibration & Sensors',
    icon: 'settings',
    response: 'Regular sensor calibration is critical for automation and monitoring accuracy:\n\n**Loss monitors:** Calibrate at the start of each crop and after any rotor or sieve change\n**Grain moisture sensor:** Verify with a certified portable meter daily\n**Yield monitor:** Zero and perform mass flow calibration at field start\n**Automation systems:** Re-run setup wizard when crop or field conditions change significantly\n\nInaccurate sensors cause automation to respond incorrectly, reducing performance and sample quality.',
  },
];
