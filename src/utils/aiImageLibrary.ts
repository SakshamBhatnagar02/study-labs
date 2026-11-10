import type {
  AppErrorInfo,
  GeneratedStemImage,
  StemVisualAnnotation,
  StemVisualBgTheme,
  StemVisualSubject,
  UserPlanQuota,
  UserPlanTier,
} from '../types';
import { buildApiErrorInfo } from './errorHandling';

export const PLAN_CONFIGS: Record<UserPlanTier, UserPlanQuota> = {
  free: {
    planId: 'free',
    label: 'Free Plan',
    maxStorageBytes: 10 * 1024 * 1024, // 10 MB
    maxImages: 15,
    priceLabel: '₹0 / Forever',
    features: [
      '10 MB AI Visual Library Storage',
      'Up to 15 Saved Diagrams & Graphs',
      'Interactive STEM Vector & Gemini Image Editor',
      'PNG / SVG Export & Instant Share',
    ],
  },
  pro: {
    planId: 'pro',
    label: 'Scholar Pro',
    maxStorageBytes: 250 * 1024 * 1024, // 250 MB
    maxImages: 200,
    priceLabel: 'Phase 3 Upgrade',
    features: [
      '250 MB Cloud + Local Visual Vault',
      'Up to 200 Saved HD Diagrams & Graphs',
      'High-Res Gemini Image Generation Priority',
    ],
  },
  ultra: {
    planId: 'ultra',
    label: 'Lab Ultra',
    maxStorageBytes: 2 * 1024 * 1024 * 1024, // 2 GB
    maxImages: 2000,
    priceLabel: 'Phase 3 Institutional',
    features: [
      '2 GB Unlimited Research Visual Archive',
      'Up to 2,000 HD Diagrams & Multi-page Exports',
    ],
  },
};

export interface QuotaUsageSnapshot {
  plan: UserPlanQuota;
  usedBytes: number;
  maxBytes: number;
  remainingBytes: number;
  imageCount: number;
  maxImages: number;
  remainingImages: number;
  bytesPct: number;
  countPct: number;
  effectivePct: number;
}

export function formatByteSize(bytes: number): string {
  const safe = Math.max(0, Math.round(bytes || 0));
  if (safe < 1024) return `${safe} B`;
  if (safe < 1024 * 1024) return `${(safe / 1024).toFixed(1)} KB`;
  if (safe < 1024 * 1024 * 1024) return `${(safe / (1024 * 1024)).toFixed(2)} MB`;
  return `${(safe / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function estimateUtf8Bytes(str: string): number {
  if (!str) return 0;
  try {
    if (typeof TextEncoder !== 'undefined') {
      return new TextEncoder().encode(str).length;
    }
  } catch {
    // Fallback below
  }
  return str.length;
}

export function computeStorageQuotaUsage(
  images: GeneratedStemImage[],
  planTier: UserPlanTier = 'free'
): QuotaUsageSnapshot {
  const plan = PLAN_CONFIGS[planTier] || PLAN_CONFIGS.free;
  const usedBytes = images.reduce((sum, img) => sum + Math.max(0, img.byteSize || 0), 0);
  const imageCount = images.length;
  const remainingBytes = Math.max(0, plan.maxStorageBytes - usedBytes);
  const remainingImages = Math.max(0, plan.maxImages - imageCount);
  const bytesPct = Math.min(100, Math.round((usedBytes / plan.maxStorageBytes) * 100));
  const countPct = Math.min(100, Math.round((imageCount / plan.maxImages) * 100));
  return {
    plan,
    usedBytes,
    maxBytes: plan.maxStorageBytes,
    remainingBytes,
    imageCount,
    maxImages: plan.maxImages,
    remainingImages,
    bytesPct,
    countPct,
    effectivePct: Math.max(bytesPct, countPct),
  };
}

export function checkCanStoreGeneratedImage(
  images: GeneratedStemImage[],
  planTier: UserPlanTier,
  candidateBytes: number
): { allowed: boolean; reason?: string; errorInfo?: AppErrorInfo } {
  const snap = computeStorageQuotaUsage(images, planTier);
  if (snap.imageCount >= snap.maxImages) {
    const reason = `${snap.plan.label} visual limit reached (${snap.imageCount}/${snap.maxImages} saved visuals). Delete an older visual from Image Library to free space.`;
    return {
      allowed: false,
      reason,
      errorInfo: buildApiErrorInfo('quota', new Error(reason), {
        code: 'QUOTA_COUNT_EXCEEDED',
        canRetry: false,
        canUseOffline: false,
      }),
    };
  }
  if (snap.usedBytes + candidateBytes > snap.maxBytes) {
    const reason = `${snap.plan.label} storage full (${formatByteSize(snap.usedBytes)} / ${formatByteSize(snap.maxBytes)} used; new visual needs ${formatByteSize(candidateBytes)}).`;
    return {
      allowed: false,
      reason,
      errorInfo: buildApiErrorInfo('quota', new Error(reason), {
        code: 'QUOTA_BYTES_EXCEEDED',
        canRetry: false,
        canUseOffline: false,
      }),
    };
  }
  return { allowed: true };
}

export function detectStemVisualCategory(
  prompt: string,
  preferred?: StemVisualSubject
): StemVisualSubject {
  if (preferred) return preferred;
  const q = (prompt || '').toLowerCase();
  if (
    /\b(reaction|enthalpy|activation|titration|ph|acid|base|sn1|sn2|carbocation|orbital|molecule|benzene|bond|chemistry|organic|kinetics|equilibrium|hybrid)\b/.test(
      q
    )
  ) {
    return 'chemistry';
  }
  if (
    /\b(projectile|parabola\s+motion|trajectory|incline|pulley|fbd|free\s*body|force|friction|lens|mirror|ray|optics|circuit|resistor|capacitor|rc|wave|pendulum|magnetic|electric|dipole|physics)\b/.test(
      q
    )
  ) {
    return 'physics';
  }
  return 'math';
}

export function detectVisualPreset(
  prompt: string,
  subject: StemVisualSubject
): string {
  const q = (prompt || '').toLowerCase();
  if (subject === 'physics') {
    if (/\b(incline|wedge|slope|friction|fbd|free\s*body|block|rolling)\b/.test(q)) {
      return 'incline_fbd';
    }
    if (/\b(lens|mirror|ray|focal|optics|refraction|concave|convex)\b/.test(q)) {
      return 'lens_ray_optics';
    }
    if (/\b(circuit|capacitor|resistor|rc|ohm|kirchhoff|voltage|current)\b/.test(q)) {
      return 'rc_circuit';
    }
    return 'projectile_motion';
  }
  if (subject === 'chemistry') {
    if (/\b(titration|ph|buffer|equivalence|acid|base|indicator)\b/.test(q)) {
      return 'acid_base_titration';
    }
    if (/\b(sn1|sn2|substitution|nucleophil|carbocation)\b/.test(q)) {
      return 'sn1_sn2_coordinate';
    }
    if (/\b(orbital|sp3|sp2|hybrid|pi\s*bond|sigma|benzene|aromatic)\b/.test(q)) {
      return 'orbital_hybridization';
    }
    return 'reaction_energy_profile';
  }
  if (/\b(sin|cos|trig|harmonic|phase|frequency|wave|oscillat)\b/.test(q)) {
    return 'sine_cosine_wave';
  }
  if (/\b(integral|derivative|tangent|area|calculus|slope|secant)\b/.test(q)) {
    return 'calculus_tangent_area';
  }
  if (/\b(exp|exponential|log|ln|growth|decay|asymptote)\b/.test(q)) {
    return 'exponential_decay';
  }
  return 'parabola_quadratic';
}

function escapeXml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getPalette(theme: StemVisualBgTheme) {
  if (theme === 'light') {
    return {
      bg: '#F8FAFC',
      bgInner: '#FFFFFF',
      grid: '#E2E8F0',
      axis: '#475569',
      text: '#0F172A',
      muted: '#64748B',
      primary: '#EA580C',
      secondary: '#0284C7',
      tertiary: '#059669',
      accentGold: '#D97706',
      accentViolet: '#7C3AED',
    };
  }
  if (theme === 'blueprint') {
    return {
      bg: '#08203E',
      bgInner: '#0C2D54',
      grid: 'rgba(147, 197, 253, 0.16)',
      axis: '#93C5FD',
      text: '#EFF6FF',
      muted: '#BAE6FD',
      primary: '#FBBF24',
      secondary: '#38BDF8',
      tertiary: '#34D399',
      accentGold: '#FDE047',
      accentViolet: '#C4B5FD',
    };
  }
  return {
    bg: '#090E1A',
    bgInner: '#0F172A',
    grid: 'rgba(148, 163, 184, 0.14)',
    axis: '#94A3B8',
    text: '#F8FAFC',
    muted: '#94A3B8',
    primary: '#F97316',
    secondary: '#22D3EE',
    tertiary: '#34D399',
    accentGold: '#FACC15',
    accentViolet: '#A78BFA',
  };
}

function renderGrid(W: number, H: number, gridColor: string): string {
  const lines: string[] = [];
  for (let x = 40; x < W; x += 40) {
    lines.push(`<line x1="${x}" y1="54" x2="${x}" y2="${H - 28}" stroke="${gridColor}" stroke-width="1"/>`);
  }
  for (let y = 80; y < H - 28; y += 40) {
    lines.push(`<line x1="28" y1="${y}" x2="${W - 28}" y2="${y}" stroke="${gridColor}" stroke-width="1"/>`);
  }
  return lines.join('');
}

function renderPresetBody(
  preset: string,
  W: number,
  H: number,
  pal: ReturnType<typeof getPalette>,
  showLabels: boolean
): { svgBody: string; defaultCaption: string; presetTitle: string } {
  const lbl = (text: string, x: number, y: number, color: string, size = 13, anchor = 'start') =>
    showLabels
      ? `<text x="${x}" y="${y}" fill="${color}" font-size="${size}" font-weight="700" font-family="Arial, sans-serif" text-anchor="${anchor}">${escapeXml(text)}</text>`
      : '';

  if (preset === 'sine_cosine_wave') {
    const cx0 = 70;
    const cy0 = 235;
    const widthSpan = W - 120;
    const sinPts: string[] = [];
    const cosPts: string[] = [];
    for (let i = 0; i <= 100; i++) {
      const t = (i / 100) * Math.PI * 2;
      const x = cx0 + (i / 100) * widthSpan;
      const ySin = cy0 - Math.sin(t) * 95;
      const yCos = cy0 - Math.cos(t) * 95;
      sinPts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ySin.toFixed(1)}`);
      cosPts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${yCos.toFixed(1)}`);
    }
    return {
      presetTitle: 'Trigonometric Waveforms: sin(x) & cos(x)',
      defaultCaption: 'y = sin(x) (orange) leads cos(x) (cyan) by phase pi/2 rad over 1 full cycle [0, 2pi].',
      svgBody: `
        <line x1="50" y1="${cy0}" x2="${W - 35}" y2="${cy0}" stroke="${pal.axis}" stroke-width="2"/>
        <line x1="${cx0}" y1="80" x2="${cx0}" y2="375" stroke="${pal.axis}" stroke-width="2"/>
        <line x1="${cx0}" y1="140" x2="${W - 45}" y2="140" stroke="${pal.axis}" stroke-dasharray="5,5" stroke-width="1"/>
        <line x1="${cx0}" y1="330" x2="${W - 45}" y2="330" stroke="${pal.axis}" stroke-dasharray="5,5" stroke-width="1"/>
        <path d="${sinPts.join(' ')}" fill="none" stroke="${pal.primary}" stroke-width="3.5"/>
        <path d="${cosPts.join(' ')}" fill="none" stroke="${pal.secondary}" stroke-width="3" stroke-dasharray="7,4"/>
        ${lbl('+1 Amplitude', 120, 132, pal.muted, 11)}
        ${lbl('-1', 50, 334, pal.muted, 11)}
        ${lbl('pi/2', cx0 + widthSpan * 0.25, cy0 + 20, pal.muted, 12, 'middle')}
        ${lbl('pi', cx0 + widthSpan * 0.5, cy0 + 20, pal.muted, 12, 'middle')}
        ${lbl('3pi/2', cx0 + widthSpan * 0.75, cy0 + 20, pal.muted, 12, 'middle')}
        ${lbl('2pi', cx0 + widthSpan, cy0 + 20, pal.muted, 12, 'middle')}
        ${lbl('y = sin(x)', W - 130, 108, pal.primary, 14)}
        ${lbl('y = cos(x)', W - 130, 128, pal.secondary, 14)}
      `,
    };
  }

  if (preset === 'calculus_tangent_area') {
    const ox = 85;
    const oy = 335;
    const scaleX = 115;
    const scaleY = 18;
    const fx = (x: number) => 0.55 * x * x + 0.5 * x + 1;
    const curvePts: string[] = [];
    const areaPts: string[] = [];
    for (let i = 0; i <= 40; i++) {
      const xv = (i / 40) * 3.8;
      const sx = ox + xv * scaleX;
      const sy = oy - fx(xv) * scaleY;
      curvePts.push(`${i === 0 ? 'M' : 'L'}${sx.toFixed(1)},${sy.toFixed(1)}`);
      if (xv >= 1.0 && xv <= 3.0) {
        areaPts.push(`${areaPts.length === 0 ? `M${sx.toFixed(1)},${oy} L` : 'L'}${sx.toFixed(1)},${sy.toFixed(1)}`);
      }
    }
    const sxEnd = ox + 3.0 * scaleX;
    areaPts.push(`L${sxEnd.toFixed(1)},${oy} Z`);
    const xP = 2.2;
    const yP = fx(xP);
    const slope = 1.1 * xP + 0.5;
    const x1 = xP - 0.9;
    const x2 = xP + 0.95;
    return {
      presetTitle: 'Calculus: Definite Integral Area & Tangent Slope',
      defaultCaption: 'Shaded area represents integral f(x) dx over [a, b]; dashed tangent shows instantaneous derivative f\'(x0).',
      svgBody: `
        <path d="${areaPts.join(' ')}" fill="${pal.secondary}" fill-opacity="0.22" stroke="none"/>
        <line x1="60" y1="${oy}" x2="${W - 45}" y2="${oy}" stroke="${pal.axis}" stroke-width="2"/>
        <line x1="${ox}" y1="75" x2="${ox}" y2="375" stroke="${pal.axis}" stroke-width="2"/>
        <path d="${curvePts.join(' ')}" fill="none" stroke="${pal.primary}" stroke-width="3.5"/>
        <line x1="${ox + x1 * scaleX}" y1="${oy - (yP + slope * (x1 - xP)) * scaleY}" x2="${ox + x2 * scaleX}" y2="${oy - (yP + slope * (x2 - xP)) * scaleY}" stroke="${pal.accentGold}" stroke-width="2.5" stroke-dasharray="6,4"/>
        <circle cx="${ox + xP * scaleX}" cy="${oy - yP * scaleY}" r="5.5" fill="${pal.accentGold}"/>
        ${lbl('a', ox + 1.0 * scaleX, oy + 20, pal.secondary, 13, 'middle')}
        ${lbl('b', ox + 3.0 * scaleX, oy + 20, pal.secondary, 13, 'middle')}
        ${lbl('Area = integral_a^b f(x) dx', ox + 2.0 * scaleX, oy - 34, pal.secondary, 13, 'middle')}
        ${lbl('Tangent slope = dy/dx', ox + xP * scaleX - 25, oy - yP * scaleY - 18, pal.accentGold, 13, 'end')}
        ${lbl('y = f(x)', W - 115, 110, pal.primary, 14)}
      `,
    };
  }

  if (preset === 'exponential_decay') {
    const ox = 85;
    const oy = 335;
    const expUp: string[] = [];
    const expDn: string[] = [];
    for (let i = 0; i <= 50; i++) {
      const t = (i / 50) * 3.5;
      const sx = ox + t * 135;
      const yDn = oy - 220 * Math.exp(-0.85 * t);
      const yUp = oy - 220 * (1 - Math.exp(-0.85 * t));
      expDn.push(`${i === 0 ? 'M' : 'L'}${sx.toFixed(1)},${yDn.toFixed(1)}`);
      expUp.push(`${i === 0 ? 'M' : 'L'}${sx.toFixed(1)},${yUp.toFixed(1)}`);
    }
    return {
      presetTitle: 'Exponential Kinetics: N(t) = N0 e^(-lambda t)',
      defaultCaption: 'Comparison of first-order decay curve e^(-kt) and asymptotic saturation curve 1 - e^(-kt).',
      svgBody: `
        <line x1="60" y1="${oy}" x2="${W - 45}" y2="${oy}" stroke="${pal.axis}" stroke-width="2"/>
        <line x1="${ox}" y1="80" x2="${ox}" y2="375" stroke="${pal.axis}" stroke-width="2"/>
        <line x1="${ox}" y1="115" x2="${W - 55}" y2="115" stroke="${pal.muted}" stroke-dasharray="5,5" stroke-width="1.2"/>
        <path d="${expDn.join(' ')}" fill="none" stroke="${pal.primary}" stroke-width="3.5"/>
        <path d="${expUp.join(' ')}" fill="none" stroke="${pal.tertiary}" stroke-width="3"/>
        ${lbl('N0 (100%)', ox + 8, 108, pal.muted, 12)}
        ${lbl('Decay: N0 e^(-kt)', ox + 170, 165, pal.primary, 13)}
        ${lbl('Growth: N0 (1 - e^(-kt))', ox + 225, 295, pal.tertiary, 13)}
        ${lbl('Time (t)', W - 80, oy + 22, pal.axis, 12)}
      `,
    };
  }

  if (preset === 'projectile_motion') {
    const ox = 75;
    const oy = 335;
    const span = W - 150;
    const pts: string[] = [];
    for (let i = 0; i <= 50; i++) {
      const f = i / 50;
      const sx = ox + f * span;
      const sy = oy - 4 * 185 * f * (1 - f);
      pts.push(`${i === 0 ? 'M' : 'L'}${sx.toFixed(1)},${sy.toFixed(1)}`);
    }
    const peakX = ox + span / 2;
    const peakY = oy - 185;
    return {
      presetTitle: 'Projectile Trajectory: Parabolic Kinematics',
      defaultCaption: 'Horizontal speed u cos(theta) stays constant while gravity g acts downward. Peak height H = u^2 sin^2(theta) / (2g).',
      svgBody: `
        <line x1="45" y1="${oy}" x2="${W - 40}" y2="${oy}" stroke="${pal.axis}" stroke-width="2.5"/>
        <path d="${pts.join(' ')}" fill="none" stroke="${pal.primary}" stroke-width="3.5"/>
        <line x1="${peakX}" y1="${peakY}" x2="${peakX}" y2="${oy}" stroke="${pal.secondary}" stroke-dasharray="6,5" stroke-width="1.8"/>
        <line x1="${ox}" y1="${oy}" x2="${ox + 95}" y2="${oy - 95}" stroke="${pal.accentGold}" stroke-width="3"/>
        <polygon points="${ox + 98},${oy - 98} ${ox + 85},${oy - 94} ${ox + 94},${oy - 84}" fill="${pal.accentGold}"/>
        <line x1="${peakX}" y1="${peakY}" x2="${peakX + 75}" y2="${peakY}" stroke="${pal.tertiary}" stroke-width="2.5"/>
        <circle cx="${peakX}" cy="${peakY}" r="5" fill="${pal.secondary}"/>
        ${lbl('u', ox + 55, oy - 75, pal.accentGold, 14)}
        ${lbl('theta', ox + 36, oy - 12, pal.muted, 12)}
        ${lbl('vx = u cos(theta), vy = 0', peakX, peakY - 16, pal.tertiary, 13, 'middle')}
        ${lbl('H_max = u^2 sin^2(theta)/(2g)', peakX + 10, (peakY + oy) / 2, pal.secondary, 12)}
        ${lbl('Range R = (u^2 sin 2theta)/g', peakX, oy + 24, pal.text, 13, 'middle')}
      `,
    };
  }

  if (preset === 'incline_fbd') {
    return {
      presetTitle: 'Free-Body Diagram on Rough Inclined Plane',
      defaultCaption: 'Weight mg resolves into mg sin(theta) along incline and mg cos(theta) balanced by Normal reaction N.',
      svgBody: `
        <polygon points="80,340 540,340 540,145" fill="${pal.bgInner}" stroke="${pal.axis}" stroke-width="2.5"/>
        <g transform="translate(335,232) rotate(-23)">
          <rect x="-34" y="-34" width="68" height="34" rx="5" fill="${pal.primary}" fill-opacity="0.25" stroke="${pal.primary}" stroke-width="2.5"/>
          <line x1="0" y1="-17" x2="0" y2="-112" stroke="${pal.secondary}" stroke-width="2.8"/>
          <polygon points="0,-118 -6,-104 6,-104" fill="${pal.secondary}"/>
          <line x1="0" y1="-17" x2="-96" y2="-17" stroke="${pal.tertiary}" stroke-width="2.5"/>
          <polygon points="-102,-17 -88,-23 -88,-11" fill="${pal.tertiary}"/>
          <line x1="0" y1="-17" x2="96" y2="-17" stroke="${pal.accentViolet}" stroke-width="2.5" stroke-dasharray="5,4"/>
        </g>
        <line x1="335" y1="215" x2="335" y2="332" stroke="${pal.accentGold}" stroke-width="2.8"/>
        <polygon points="335,338 329,324 341,324" fill="${pal.accentGold}"/>
        ${lbl('theta = 23 deg', 155, 326, pal.muted, 13)}
        ${lbl('N = mg cos(theta)', 295, 118, pal.secondary, 13)}
        ${lbl('mg sin(theta)', 210, 265, pal.tertiary, 13, 'end')}
        ${lbl('f_s (friction)', 455, 178, pal.accentViolet, 13)}
        ${lbl('mg (Weight)', 352, 315, pal.accentGold, 13)}
      `,
    };
  }

  if (preset === 'lens_ray_optics') {
    const cx = W / 2;
    const axisY = 230;
    return {
      presetTitle: 'Thin Convex Lens: Principal Rays & Image Formation',
      defaultCaption: '1/f = 1/v - 1/u: Ray parallel to principal axis refracts through F2; ray through optical center O goes undeviated.',
      svgBody: `
        <line x1="40" y1="${axisY}" x2="${W - 40}" y2="${axisY}" stroke="${pal.axis}" stroke-width="1.8" stroke-dasharray="6,4"/>
        <ellipse cx="${cx}" cy="${axisY}" rx="14" ry="118" fill="${pal.secondary}" fill-opacity="0.18" stroke="${pal.secondary}" stroke-width="2.5"/>
        <circle cx="${cx - 110}" cy="${axisY}" r="4" fill="${pal.muted}"/>
        <circle cx="${cx + 110}" cy="${axisY}" r="4" fill="${pal.muted}"/>
        <circle cx="${cx}" cy="${axisY}" r="4" fill="${pal.text}"/>
        <line x1="130" y1="${axisY}" x2="130" y2="145" stroke="${pal.tertiary}" stroke-width="3.5"/>
        <polygon points="130,138 124,151 136,151" fill="${pal.tertiary}"/>
        <line x1="130" y1="145" x2="${cx}" y2="145" stroke="${pal.primary}" stroke-width="2.5"/>
        <line x1="${cx}" y1="145" x2="545" y2="338" stroke="${pal.primary}" stroke-width="2.5"/>
        <line x1="130" y1="145" x2="545" y2="338" stroke="${pal.accentGold}" stroke-width="2.2"/>
        <line x1="510" y1="${axisY}" x2="510" y2="322" stroke="${pal.accentViolet}" stroke-width="3.5"/>
        <polygon points="510,328 504,315 516,315" fill="${pal.accentViolet}"/>
        ${lbl('Object (u)', 130, axisY + 22, pal.tertiary, 12, 'middle')}
        ${lbl('F1', cx - 110, axisY + 20, pal.muted, 12, 'middle')}
        ${lbl('O', cx + 10, axisY + 18, pal.text, 12)}
        ${lbl('F2', cx + 110, axisY - 12, pal.muted, 12, 'middle')}
        ${lbl('Real Inverted Image (v)', 505, axisY - 16, pal.accentViolet, 12, 'middle')}
      `,
    };
  }

  if (preset === 'rc_circuit') {
    return {
      presetTitle: 'Series RC Charging Circuit & Time Constant tau = RC',
      defaultCaption: 'Capacitor voltage builds exponentially Vc(t) = V0(1 - e^(-t/RC)), reaching 63.2% at t = RC.',
      svgBody: `
        <rect x="110" y="105" width="380" height="225" rx="14" fill="none" stroke="${pal.axis}" stroke-width="2.5"/>
        <rect x="245" y="88" width="95" height="34" rx="6" fill="${pal.bgInner}" stroke="${pal.primary}" stroke-width="2.5"/>
        <line x1="482" y1="196" x2="498" y2="196" stroke="${pal.secondary}" stroke-width="4"/>
        <line x1="482" y1="226" x2="498" y2="226" stroke="${pal.secondary}" stroke-width="4"/>
        <rect x="475" y="200" width="30" height="22" fill="${pal.bg}"/>
        <line x1="468" y1="202" x2="512" y2="202" stroke="${pal.secondary}" stroke-width="3.5"/>
        <line x1="468" y1="220" x2="512" y2="220" stroke="${pal.secondary}" stroke-width="3.5"/>
        <rect x="92" y="190" width="36" height="44" fill="${pal.bg}"/>
        <line x1="86" y1="200" x2="134" y2="200" stroke="${pal.accentGold}" stroke-width="4"/>
        <line x1="98" y1="222" x2="122" y2="222" stroke="${pal.accentGold}" stroke-width="3"/>
        ${lbl('R (Resistor)', 292, 110, pal.primary, 13, 'middle')}
        ${lbl('V0 (DC)', 78, 214, pal.accentGold, 13, 'end')}
        ${lbl('C (Capacitor)', 522, 214, pal.secondary, 13)}
        ${lbl('tau = R * C   |   q(t) = C*V0*(1 - e^(-t/tau))', W / 2, 368, pal.text, 13, 'middle')}
      `,
    };
  }

  if (preset === 'reaction_energy_profile') {
    return {
      presetTitle: 'Reaction Coordinate & Activation Energy Profile',
      defaultCaption: 'Activation energy Ea is the barrier to transition state TS; catalyzed pathway lowers Ea without changing net Delta H.',
      svgBody: `
        <line x1="75" y1="335" x2="${W - 45}" y2="335" stroke="${pal.axis}" stroke-width="2"/>
        <line x1="75" y1="75" x2="75" y2="355" stroke="${pal.axis}" stroke-width="2"/>
        <path d="M95,215 L170,215 C225,215 245,105 305,105 C365,105 405,295 455,295 L540,295" fill="none" stroke="${pal.primary}" stroke-width="3.5"/>
        <path d="M170,215 C225,215 250,158 305,158 C360,158 405,295 455,295" fill="none" stroke="${pal.tertiary}" stroke-width="2.6" stroke-dasharray="6,5"/>
        <line x1="170" y1="215" x2="455" y2="215" stroke="${pal.muted}" stroke-dasharray="4,4" stroke-width="1.3"/>
        <line x1="305" y1="215" x2="305" y2="108" stroke="${pal.secondary}" stroke-width="2"/>
        <line x1="455" y1="215" x2="455" y2="293" stroke="${pal.accentGold}" stroke-width="2"/>
        ${lbl('Reactants', 100, 202, pal.text, 13)}
        ${lbl('TS (Transition State)', 305, 92, pal.primary, 13, 'middle')}
        ${lbl('Ea (uncat)', 316, 148, pal.secondary, 12)}
        ${lbl('Catalyzed path', 312, 185, pal.tertiary, 12)}
        ${lbl('Delta H < 0 (Exothermic)', 466, 258, pal.accentGold, 12)}
        ${lbl('Products', 470, 315, pal.text, 13)}
        ${lbl('Reaction Coordinate', W / 2, 362, pal.muted, 12, 'middle')}
      `,
    };
  }

  if (preset === 'acid_base_titration') {
    return {
      presetTitle: 'Acid-Base Titration Curve (pH vs Volume)',
      defaultCaption: 'Steep equivalence jump around pH 7 for strong acid + strong base titration; buffer region slows pH shift.',
      svgBody: `
        <line x1="80" y1="335" x2="${W - 45}" y2="335" stroke="${pal.axis}" stroke-width="2"/>
        <line x1="80" y1="78" x2="80" y2="355" stroke="${pal.axis}" stroke-width="2"/>
        <line x1="80" y1="210" x2="305" y2="210" stroke="${pal.muted}" stroke-dasharray="5,4" stroke-width="1.2"/>
        <line x1="305" y1="210" x2="305" y2="335" stroke="${pal.secondary}" stroke-dasharray="5,4" stroke-width="1.8"/>
        <path d="M90,310 C190,304 285,294 298,255 C304,225 306,195 312,160 C324,116 400,104 540,98" fill="none" stroke="${pal.primary}" stroke-width="3.5"/>
        <circle cx="305" cy="210" r="6" fill="${pal.secondary}"/>
        ${lbl('pH 14', 42, 98, pal.muted, 11)}
        ${lbl('pH 7', 46, 214, pal.secondary, 12)}
        ${lbl('pH 1', 46, 320, pal.muted, 11)}
        ${lbl('Equivalence Point (pH = 7)', 318, 214, pal.secondary, 13)}
        ${lbl('Volume of NaOH Added (mL)', W / 2, 362, pal.muted, 12, 'middle')}
      `,
    };
  }

  if (preset === 'sn1_sn2_coordinate') {
    return {
      presetTitle: 'SN1 Two-Step Carbocation vs SN2 Concerted Path',
      defaultCaption: 'SN1 proceeds via a carbocation energy minimum (racemization); SN2 crosses a single pentacoordinate TS (inversion).',
      svgBody: `
        <line x1="75" y1="335" x2="${W - 45}" y2="335" stroke="${pal.axis}" stroke-width="2"/>
        <line x1="75" y1="78" x2="75" y2="355" stroke="${pal.axis}" stroke-width="2"/>
        <path d="M95,245 C140,245 170,112 225,112 C268,112 280,192 315,192 C350,192 370,132 410,132 C450,132 475,285 540,285" fill="none" stroke="${pal.primary}" stroke-width="3.5"/>
        <path d="M95,245 C195,245 245,148 315,148 C385,148 445,285 540,285" fill="none" stroke="${pal.secondary}" stroke-width="3" stroke-dasharray="7,4"/>
        <circle cx="315" cy="192" r="5.5" fill="${pal.accentGold}"/>
        ${lbl('SN1 (2 steps)', 220, 96, pal.primary, 13, 'middle')}
        ${lbl('R+ Carbocation Intermediate', 315, 222, pal.accentGold, 12, 'middle')}
        ${lbl('SN2 (1 concerted TS)', 335, 140, pal.secondary, 12)}
        ${lbl('R-X + Nu-', 102, 268, pal.muted, 12)}
        ${lbl('R-Nu + X-', 490, 310, pal.muted, 12)}
      `,
    };
  }

  if (preset === 'orbital_hybridization') {
    return {
      presetTitle: 'Benzene Conjugated pi-System & sp2 Ring Hybridization',
      defaultCaption: 'Planar sp2 carbon ring with 6 delocalized p-electrons (4n+2 Huckel aromaticity, equal C-C bond length 1.39 A).',
      svgBody: `
        <polygon points="300,108 386,158 386,258 300,308 214,258 214,158" fill="none" stroke="${pal.primary}" stroke-width="3.5"/>
        <circle cx="300" cy="208" r="56" fill="none" stroke="${pal.secondary}" stroke-width="3" stroke-dasharray="8,5"/>
        <circle cx="300" cy="108" r="7" fill="${pal.accentGold}"/>
        <circle cx="386" cy="158" r="7" fill="${pal.accentGold}"/>
        <circle cx="386" cy="258" r="7" fill="${pal.accentGold}"/>
        <circle cx="300" cy="308" r="7" fill="${pal.accentGold}"/>
        <circle cx="214" cy="258" r="7" fill="${pal.accentGold}"/>
        <circle cx="214" cy="158" r="7" fill="${pal.accentGold}"/>
        ${lbl('sp2 Carbon (120 deg)', 402, 152, pal.accentGold, 13)}
        ${lbl('Delocalized 6 pi e- cloud', 300, 214, pal.secondary, 12, 'middle')}
        ${lbl('Aromatic Ring C6H6', 300, 345, pal.text, 14, 'middle')}
      `,
    };
  }

  // Default Math preset: Quadratic Parabola y = ax^2 + bx + c
  const ox = W / 2;
  const oy = 290;
  const pts: string[] = [];
  for (let i = -40; i <= 40; i++) {
    const xv = (i / 40) * 3.2;
    const yv = xv * xv - 2;
    const sx = ox + xv * 68;
    const sy = oy - yv * 26;
    pts.push(`${i === -40 ? 'M' : 'L'}${sx.toFixed(1)},${sy.toFixed(1)}`);
  }
  return {
    presetTitle: 'Quadratic Function: y = x^2 - 2 (Vertex & Roots)',
    defaultCaption: 'Symmetric upward parabola with vertex at (0, -2) and x-intercepts at +-sqrt(2).',
    svgBody: `
      <line x1="65" y1="${oy}" x2="${W - 45}" y2="${oy}" stroke="${pal.axis}" stroke-width="2"/>
      <line x1="${ox}" y1="75" x2="${ox}" y2="375" stroke="${pal.axis}" stroke-width="2"/>
      <path d="${pts.join(' ')}" fill="none" stroke="${pal.primary}" stroke-width="3.5"/>
      <circle cx="${ox}" cy="${oy + 52}" r="5.5" fill="${pal.accentGold}"/>
      <circle cx="${ox - 1.414 * 68}" cy="${oy}" r="5.5" fill="${pal.secondary}"/>
      <circle cx="${ox + 1.414 * 68}" cy="${oy}" r="5.5" fill="${pal.secondary}"/>
      ${lbl('Vertex (0, -2)', ox + 12, oy + 62, pal.accentGold, 12)}
      ${lbl('-sqrt(2)', ox - 1.414 * 68 - 10, oy - 12, pal.secondary, 12, 'end')}
      ${lbl('+sqrt(2)', ox + 1.414 * 68 + 10, oy - 12, pal.secondary, 12)}
      ${lbl('y = x^2 - 2', ox + 150, 118, pal.primary, 14)}
    `,
  };
}

export function generateStemDiagramSvg(params: {
  title?: string;
  prompt: string;
  subjectCategory?: StemVisualSubject;
  visualPresetKey?: string;
  bgTheme?: StemVisualBgTheme;
  showGrid?: boolean;
  showLabels?: boolean;
  annotations?: StemVisualAnnotation[];
  rotationDeg?: number;
  flipX?: boolean;
}): {
  svgMarkup: string;
  title: string;
  caption: string;
  subjectCategory: StemVisualSubject;
  visualPresetKey: string;
  width: number;
  height: number;
} {
  const W = 600;
  const H = 400;
  const subjectCategory = detectStemVisualCategory(params.prompt, params.subjectCategory);
  const visualPresetKey =
    params.visualPresetKey || detectVisualPreset(params.prompt, subjectCategory);
  const bgTheme = params.bgTheme || 'dark';
  const showGrid = params.showGrid !== false;
  const showLabels = params.showLabels !== false;
  const pal = getPalette(bgTheme);

  const rendered = renderPresetBody(visualPresetKey, W, H, pal, showLabels);
  const displayTitle = (params.title || rendered.presetTitle).trim();
  const rot = params.rotationDeg || 0;
  const flip = params.flipX ? -1 : 1;

  const transformAttr =
    rot !== 0 || flip !== 1
      ? ` transform="translate(${W / 2},${H / 2}) rotate(${rot}) scale(${flip},1) translate(${-W / 2},${-H / 2})"`
      : '';

  const annots = (params.annotations || [])
    .map((a) => {
      const ax = Math.max(24, Math.min(W - 24, (a.xPct / 100) * W));
      const ay = Math.max(58, Math.min(H - 18, (a.yPct / 100) * H));
      const clr = a.color || pal.accentGold;
      return `
        <g>
          <rect x="${ax - 6}" y="${ay - 15}" width="${Math.max(44, a.text.length * 7.8 + 14)}" height="22" rx="6" fill="${pal.bgInner}" stroke="${clr}" stroke-width="1.3"/>
          <text x="${ax + 2}" y="${ay}" fill="${clr}" font-size="12" font-weight="700" font-family="Arial, sans-serif">${escapeXml(a.text)}</text>
        </g>
      `;
    })
    .join('');

  const svgMarkup = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`,
    `<rect width="${W}" height="${H}" rx="18" fill="${pal.bg}"/>`,
    `<rect x="14" y="14" width="${W - 28}" height="${H - 28}" rx="14" fill="${pal.bgInner}" stroke="${pal.grid}" stroke-width="1.5"/>`,
    showGrid ? renderGrid(W, H, pal.grid) : '',
    `<rect x="24" y="22" width="${W - 48}" height="30" rx="8" fill="${pal.bg}" fill-opacity="0.72"/>`,
    `<text x="36" y="42" fill="${pal.text}" font-size="14" font-weight="800" font-family="Arial, sans-serif">${escapeXml(displayTitle.slice(0, 56))}</text>`,
    `<text x="${W - 34}" y="41" fill="${pal.primary}" font-size="11" font-weight="800" font-family="Arial, sans-serif" text-anchor="end">${subjectCategory.toUpperCase()}</text>`,
    `<g${transformAttr}>`,
    rendered.svgBody,
    `</g>`,
    annots,
    `</svg>`,
  ]
    .filter(Boolean)
    .join('');

  return {
    svgMarkup,
    title: displayTitle,
    caption: rendered.defaultCaption,
    subjectCategory,
    visualPresetKey,
    width: W,
    height: H,
  };
}

export function svgToDataUri(svgMarkup: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgMarkup)}`;
}

export function rebuildEditableSvgItem(item: GeneratedStemImage): GeneratedStemImage {
  if (item.format !== 'svg') return item;
  const rebuilt = generateStemDiagramSvg({
    title: item.title,
    prompt: item.prompt,
    subjectCategory: item.subjectCategory,
    visualPresetKey: item.visualPresetKey,
    bgTheme: item.bgTheme,
    showGrid: item.showGrid,
    showLabels: item.showLabels,
    annotations: item.annotations,
    rotationDeg: item.rotationDeg,
    flipX: item.flipX,
  });
  const dataUri = svgToDataUri(rebuilt.svgMarkup);
  return {
    ...item,
    svgMarkup: rebuilt.svgMarkup,
    dataUri,
    byteSize: estimateUtf8Bytes(rebuilt.svgMarkup),
    editedAt: new Date().toISOString(),
  };
}

