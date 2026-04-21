import { ChatMessage } from '@/types';

const TOOLKIT_URL = process.env.EXPO_PUBLIC_TOOLKIT_URL;

const SYSTEM_PROMPT = `You are an expert advisor for Case IH Axial-Flow combine harvesters. 
Provide concise, practical troubleshooting and setup guidance for farmers.
Use bullet points when listing steps, causes, or adjustments.
Include specific values (RPM, mm clearances, percentages) when applicable.
Focus on actionable advice. Keep responses under 200 words unless detail is critical.
Do not recommend dealer service visits unless there is a safety concern or mechanical failure.`;

function fallbackResponse(lastMessage: string): string {
  const msg = lastMessage.toLowerCase();

  if (msg.includes('crack') || msg.includes('split') || msg.includes('broken')) {
    return 'Cracked grain is typically caused by overly aggressive threshing:\n\n• Reduce rotor speed 25\u201350 RPM\n• Open concave clearance 2\u20133 mm\n• Check for worn or bent rasp bars\n• Reduce ground speed to lower feed rate\n\nRe-evaluate sample after each adjustment.';
  }
  if (msg.includes('loss') || msg.includes('grain behind') || msg.includes('leaving grain')) {
    return 'To diagnose grain loss, identify the source first:\n\n• Walk behind combine to check straw mat\n• Header loss: adjust reel speed and height\n• Separator loss: close concave 1\u20132 mm or increase rotor speed\n• Cleaning loss: reduce fan speed 50 RPM, open top sieve\n\nVerify loss monitor calibration is current.';
  }
  if (msg.includes('wet') || msg.includes('moist') || msg.includes('tough')) {
    return 'In high-moisture or tough conditions:\n\n• Reduce ground speed 20\u201330%\n• Open concave 2\u20133 mm beyond normal\n• Reduce rotor speed to prevent smearing\n• Clean feeder house and rotor daily\n• Consider waiting for crop to dry if quality is critical';
  }
  if (msg.includes('food') || msg.includes('quality') || msg.includes('premium')) {
    return 'For food-grade or premium quality grain:\n\n• Set automation to Quality Priority\n• Reduce rotor speed 50\u2013100 RPM below standard\n• Open concave 3\u20135 mm\n• Reduce ground speed 10\u201315%\n• Inspect sample every 10\u201315 minutes\n• Document all settings for contract compliance';
  }
  if (msg.includes('fan') || msg.includes('chaff') || msg.includes('cleaning')) {
    return 'Cleaning shoe optimization:\n\n• Increase fan speed if grain is in tailings or over sieves\n• Decrease fan speed if good grain is blowing out the back\n• Open top sieve if returns volume is high\n• Close bottom sieve if sample is dirty\n\nAdjust in small increments (50 RPM for fan, 1 mm for sieves).';
  }
  if (msg.includes('slug') || msg.includes('wrap') || msg.includes('plug')) {
    return 'To prevent rotor plugging:\n\n• Maintain steady ground speed — avoid sudden surges\n• Reduce speed in heavy or downed crop\n• Open concave to allow material to flow through\n• After a slug, use feeder house reverser to clear\n• Never reach into feeder house with engine running\n\nFrequent plugging indicates settings are too aggressive.';
  }
  if (msg.includes('calibrat') || msg.includes('sensor') || msg.includes('monitor')) {
    return 'Regular calibration maintains accuracy:\n\n• Loss monitors: calibrate at start of each crop/field change\n• Moisture sensor: verify daily with portable reference meter\n• Yield monitor: zero and mass flow calibrate at field start\n• Automation: re-run setup when conditions change significantly\n\nPoor calibration causes automation to respond incorrectly.';
  }

  return `I can help with Axial-Flow combine settings and troubleshooting.\n\nCommon topics I can assist with:\n• Concave, rotor, fan, and sieve adjustments\n• Grain loss diagnosis and reduction\n• Sample quality issues\n• Wet or tough crop strategies\n• Food-grade harvest protocols\n• Sensor calibration and automation\n\nDescribe your specific issue or condition for targeted guidance.`;
}

export async function getExpertResponse(messages: ChatMessage[]): Promise<string> {
  if (!TOOLKIT_URL) {
    console.log('[AI] No toolkit URL configured, using fallback');
    const lastMsg = messages[messages.length - 1];
    return fallbackResponse(lastMsg?.content ?? '');
  }

  try {
    const payload = {
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ],
    };

    console.log('[AI] Posting to:', `${TOOLKIT_URL}/agent/chat`);
    const res = await fetch(`${TOOLKIT_URL}/agent/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.warn('[AI] Non-200 response:', res.status);
      const lastMsg = messages[messages.length - 1];
      return fallbackResponse(lastMsg?.content ?? '');
    }

    const json = await res.json() as Record<string, unknown>;
    if (typeof json.text === 'string') return json.text;
    const choices = json.choices as Array<{ message?: { content?: string } }> | undefined;
    if (choices?.[0]?.message?.content) return choices[0].message.content ?? '';
    return JSON.stringify(json);
  } catch (e) {
    console.warn('[AI] Error:', e);
    const lastMsg = messages[messages.length - 1];
    return fallbackResponse(lastMsg?.content ?? '');
  }
}
