import { QuickTip } from '@/types';

export const DEFAULT_TIPS: QuickTip[] = [
  {
    id: 'tip-1',
    title: 'Start Conservative',
    subtitle: 'New field setup',
    icon: 'shield',
    content: 'When starting in a new field or crop condition, always begin with conservative settings:\n\n• Open concave clearance 2\u20133 mm beyond recommendation\n• Reduce rotor speed by 50 RPM below starting point\n• Increase gradually while monitoring sample quality and losses\n\nThis prevents costly slugging events and protects the machine during the initial calibration phase.',
  },
  {
    id: 'tip-2',
    title: 'Reading Your Sample',
    subtitle: 'Quality assessment',
    icon: 'search',
    content: 'Check your grain sample every 15\u201320 minutes:\n\n• Cracked/split kernels: Reduce rotor speed 25\u201350 RPM, open concave 2 mm\n• Unthreshed material: Close concave 2 mm or increase rotor speed 25 RPM\n• Excessive chaff: Increase fan speed 50 RPM\n• Green material: Reduce ground speed or wait for better conditions\n\nA quality sample is the best real-time feedback you have.',
  },
  {
    id: 'tip-3',
    title: 'Fan Speed Effects',
    subtitle: 'Cleaning shoe optimization',
    icon: 'wind',
    content: 'Fan speed directly controls cleaning shoe performance:\n\n• Too low: Grain carried over sieves into tailings/loss\n• Too high: Good grain blown out the back\n• Proper: Clean grain with minimal returns\n\nIncrease fan speed in wet, heavy straw conditions. Decrease in windy weather or with small, light seeds like canola. Adjust in 50 RPM increments and allow the system to stabilize before evaluating.',
  },
  {
    id: 'tip-4',
    title: 'Rotor Loss Detection',
    subtitle: 'Reduce grain loss',
    icon: 'alert-triangle',
    content: 'Rotor separator losses are difficult to see. Use these checks:\n\n• Walk behind the combine and inspect the straw mat\n• Look for grain on top of or embedded in straw\n• Use a loss monitor pan under the separator area\n• Count kernels in a 10 sq ft area — 1 kernel = ~1 bu/ac loss\n\nIf separator losses are high, increase rotor speed in 25 RPM increments or close concave 1\u20132 mm.',
  },
  {
    id: 'tip-5',
    title: 'Sieve Settings Guide',
    subtitle: 'Top & bottom sieve',
    icon: 'layers',
    content: 'Sieve settings work together with fan speed:\n\n• Top sieve (chaffer): Passes threshed material to bottom sieve; larger opening = more material passed\n• Bottom sieve: Final size classification; smaller = cleaner sample\n• Returns elevator: High volume means sieves are too closed or fan too strong\n\nRecommended start: Close both sieves slightly from the guide value, then open until returns drop to an acceptable level.',
  },
  {
    id: 'tip-6',
    title: 'Harvest Automation Tips',
    subtitle: 'Using AFS Harvest Command',
    icon: 'cpu',
    content: 'When using Harvest Automation (AFS Harvest Command):\n\n• Set the desired mode BEFORE engaging in a field\n• Quality Priority: System adjusts to minimize damage and losses\n• Throughput Priority: System maximizes ground speed within loss limits\n• Balanced: Recommended starting point for most conditions\n\nAlways calibrate your loss monitors at the start of each crop or field condition for accurate automation response.',
  },
  {
    id: 'tip-7',
    title: 'Wet Crop Strategy',
    subtitle: 'High moisture management',
    icon: 'droplets',
    content: 'When harvesting in high moisture conditions (>18%):\n\n• Reduce ground speed by 20\u201330% below normal\n• Open concave clearance beyond recommendations\n• Reduce rotor speed to prevent smearing and wrapping\n• Clean crop residue from feeder house daily\n• Check for material buildup on rotor and concave weekly\n• Consider running with variable geometry concave in wider position\n\nPatience pays off — slower speeds often improve sample and reduce mechanical issues.',
  },
  {
    id: 'tip-8',
    title: 'Pre-Season Checklist',
    subtitle: 'Machine readiness',
    icon: 'check-square',
    content: 'Before your first day of harvest each season:\n\n• Inspect all concave and rotor rasp bars for wear\n• Check sieve seals and frame integrity\n• Verify all belt tensions and replace worn belts\n• Lubricate all grease points per operator manual\n• Test loss monitor sensitivity at known conditions\n• Calibrate grain moisture sensor with a reference meter\n• Check tire pressure and inspect all hydraulic fittings\n\nA few hours of prep can prevent days of downtime at peak harvest.',
  },
];
