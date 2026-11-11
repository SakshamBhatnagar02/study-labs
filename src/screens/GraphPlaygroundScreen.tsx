import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import Svg, {
  Circle,
  Ellipse,
  Line,
  Path,
  Polygon,
  Polyline,
  Rect,
  Text as SvgText,
} from 'react-native-svg';
import { useTheme } from '../theme';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { StorageService } from '../services/storage';
import {
  checkCanStoreGeneratedImage,
  estimateUtf8Bytes,
  svgToDataUri,
} from '../utils/aiImageLibrary';
import { GeneratedStemImage, StemVisualSubject } from '../types';
import {
  BookmarkPlus,
  CheckCircle2,
  Compass,
  Cuboid,
  Dna,
  FlaskConical,
  Info,
  RotateCcw,
} from 'lucide-react-native';

const GRAPH_HEIGHT = 232;

type PlaygroundMode =
  | 'math'
  | 'physics'
  | 'chemistry'
  | 'coord'
  | 'biology'
  | 'preview3d';

type IupacPrefix = 'none' | 'methyl' | 'chloro';
type IupacBond = 'ane' | 'ene' | 'yne';
type IupacGroup = 'alkane' | 'ol' | 'al' | 'one' | 'oic';

const IUPAC_ROOTS = [
  { c: 1, stem: 'meth' },
  { c: 2, stem: 'eth' },
  { c: 3, stem: 'prop' },
  { c: 4, stem: 'but' },
  { c: 5, stem: 'pent' },
  { c: 6, stem: 'hex' },
];

const BIO_CELL_HOTSPOTS = [
  {
    id: 'nucleus',
    label: 'Nucleus',
    color: '#8B5CF6',
    note: 'Double-membrane organelle storing linear chromosomes & nucleolus (site of rRNA synthesis and transcription).',
  },
  {
    id: 'mito',
    label: 'Mitochondria',
    color: '#F97316',
    note: 'Semi-autonomous powerhouse generating ATP via cristae-bound oxidative phosphorylation; carries circular 70S DNA.',
  },
  {
    id: 'er',
    label: 'Rough ER',
    color: '#22D3EE',
    note: 'Ribosome-studded cisternae folding secretory and membrane proteins bound for Golgi vesicles.',
  },
  {
    id: 'golgi',
    label: 'Golgi Body',
    color: '#10B981',
    note: 'Cis-to-trans sorting stack executing glycosylation, sulfation & lysosome packaging.',
  },
];

const BIO_DNA_HOTSPOTS = [
  {
    id: 'backbone',
    label: 'Sugar-PO₄',
    color: '#F97316',
    note: 'Alternating deoxyribose & phosphodiester 3\'→5\' ester linkages form the negatively charged outer rail.',
  },
  {
    id: 'pairs',
    label: 'A=T / G≡C',
    color: '#22D3EE',
    note: 'Chargaff pairing: Adenine–Thymine share 2 H-bonds; Guanine–Cytosine share 3 H-bonds (higher Tm).',
  },
  {
    id: 'pitch',
    label: '3.4 nm Pitch',
    color: '#10B981',
    note: 'B-DNA completes 1 helical turn every 10 base pairs (3.4 nm pitch; 0.34 nm rise per step; 2.0 nm diameter).',
  },
];

function escapeXml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildIupacNameAndFormula(
  cCount: number,
  prefix: IupacPrefix,
  bond: IupacBond,
  group: IupacGroup
): { iupacName: string; formula: string; note: string } {
  const effectiveC =
    (bond !== 'ane' && cCount < 2) || (group === 'one' && cCount < 3)
      ? group === 'one'
        ? 3
        : 2
      : cCount;
  const stem = IUPAC_ROOTS.find((r) => r.c === effectiveC)?.stem || 'prop';
  const effectiveBond: IupacBond = effectiveC === 1 ? 'ane' : bond;
  const infix = effectiveBond === 'ane' ? 'an' : effectiveBond === 'ene' ? 'en' : 'yn';

  let suffix = 'e';
  if (group === 'ol') suffix = effectiveC >= 3 ? '-1-ol' : 'ol';
  else if (group === 'al') suffix = 'al';
  else if (group === 'one') suffix = effectiveC >= 5 ? '-2-one' : 'one';
  else if (group === 'oic') suffix = 'oic acid';

  const needsE = group === 'alkane';
  const baseBody = `${stem}${infix}${needsE ? 'e' : ''}`;
  const fullBody = group === 'alkane' ? baseBody : `${stem}${infix}${suffix}`;

  let prefixStr = '';
  let extraC = 0;
  let extraH = 0;
  if (prefix === 'methyl' && effectiveC >= 3) {
    prefixStr = effectiveC === 3 ? '2-methyl' : '2-methyl';
    extraC = 1;
    extraH = 2;
  } else if (prefix === 'chloro' && effectiveC >= 2) {
    prefixStr = group === 'alkane' ? '2-chloro' : '2-chloro';
    extraH = -1;
  }

  const totalC = effectiveC + extraC;
  let baseH = 2 * effectiveC + 2;
  if (effectiveBond === 'ene') baseH -= 2;
  if (effectiveBond === 'yne') baseH -= 4;
  let oCount = 0;
  if (group === 'ol') oCount = 1;
  if (group === 'al' || group === 'one') {
    baseH -= 2;
    oCount = 1;
  }
  if (group === 'oic') {
    baseH -= 2;
    oCount = 2;
  }
  const totalH = Math.max(2, baseH + extraH);
  const clStr = prefix === 'chloro' && effectiveC >= 2 ? 'Cl' : '';
  const oStr = oCount === 1 ? 'O' : oCount === 2 ? 'O₂' : '';
  const formula = `C${totalC > 1 ? totalC : ''}H${totalH}${oStr}${clStr}`;

  const rawName = `${prefixStr}${fullBody}`;
  const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const note =
    prefix !== 'none' && effectiveC < 2
      ? 'Prefix requires C₂+ backbone; adjusted to longest valid chain.'
      : effectiveBond !== 'ane'
      ? `Unsaturated ${effectiveBond === 'ene' ? 'C=C double' : 'C≡C triple'} bond prioritized with principal suffix.`
      : 'Longest continuous carbon chain numbered to give principal group lowest locant.';

  return { iupacName: formattedName, formula, note };
}

function project3DPoint(
  p: [number, number, number],
  azDeg: number,
  elDeg: number,
  cx: number,
  cy: number,
  scale: number
): { x: number; y: number; z: number } {
  const az = (azDeg * Math.PI) / 180;
  const el = (elDeg * Math.PI) / 180;
  const [x0, y0, z0] = p;
  const x1 = x0 * Math.cos(az) - z0 * Math.sin(az);
  const z1 = x0 * Math.sin(az) + z0 * Math.cos(az);
  const y2 = y0 * Math.cos(el) - z1 * Math.sin(el);
  const z2 = y0 * Math.sin(el) + z1 * Math.cos(el);
  const depth = 3.2 / (3.2 - z2 * 0.45);
  return {
    x: cx + x1 * scale * depth,
    y: cy - y2 * scale * depth,
    z: z2,
  };
}

export const GraphPlaygroundScreen: React.FC = () => {
  const { colors, mode: themeMode } = useTheme();
  const { width: winWidth } = useWindowDimensions();
  const canvasWidth = Math.max(240, Math.min(winWidth - 68, 520));

  const [activeMode, setActiveMode] = useState<PlaygroundMode>('math');
  const [mathFunc, setMathFunc] = useState<'sine' | 'quadratic' | 'exponential'>('sine');
  const [paramA, setParamA] = useState<number>(1.5);
  const [paramB, setParamB] = useState<number>(1.0);
  const [physicsPreset, setPhysicsPreset] = useState<'projectile' | 'shm' | 'vt_graph'>('projectile');
  const [chemPreset, setChemPreset] = useState<'benzene' | 'ester' | 'alcohol' | 'alkane'>('benzene');

  // Chemistry IUPAC Builder state
  const [iupacC, setIupacC] = useState<number>(3);
  const [iupacPrefix, setIupacPrefix] = useState<IupacPrefix>('methyl');
  const [iupacBond, setIupacBond] = useState<IupacBond>('ane');
  const [iupacGroup, setIupacGroup] = useState<IupacGroup>('ol');

  // Coordinate Geometry state
  const [coordPreset, setCoordPreset] = useState<'line' | 'circle' | 'ellipse' | 'hyperbola'>('ellipse');

  // Biology diagram state
  const [bioPreset, setBioPreset] = useState<'cell' | 'dna'>('cell');
  const [selectedBioHotspot, setSelectedBioHotspot] = useState<string>('nucleus');

  // 3D Preview state
  const [meshPreset, setMeshPreset] = useState<'tetrahedron' | 'cube'>('tetrahedron');
  const [azAngle, setAzAngle] = useState<number>(35);
  const [elAngle, setElAngle] = useState<number>(22);

  // Save to AI Library feedback
  const [saveNotice, setSaveNotice] = useState<{ ok: boolean; msg: string } | null>(null);
  const [savingImage, setSavingImage] = useState(false);

  const iupacResult = useMemo(
    () => buildIupacNameAndFormula(iupacC, iupacPrefix, iupacBond, iupacGroup),
    [iupacC, iupacPrefix, iupacBond, iupacGroup]
  );

  // Math / Physics polyline points
  const polylinePoints = useMemo(() => {
    const steps = 120;
    const pts: string[] = [];

    for (let i = 0; i <= steps; i++) {
      const normX = (i / steps) * 2 - 1; // -1..+1
      let normY = 0;

      if (activeMode === 'math') {
        if (mathFunc === 'sine') {
          normY = paramA * Math.sin(paramB * normX * Math.PI * 2) * 0.36;
        } else if (mathFunc === 'quadratic') {
          normY = paramA * (normX * normX) * 0.55 - 0.35;
        } else {
          normY = (Math.exp(paramA * normX) / Math.E) * 0.68 - 0.35;
        }
      } else if (activeMode === 'physics') {
        if (physicsPreset === 'projectile') {
          normY = 0.72 * paramA * (1 - normX * normX) * 0.65 - 0.3;
        } else if (physicsPreset === 'shm') {
          normY =
            0.55 *
            paramA *
            0.6 *
            Math.exp(-0.7 * (normX + 1)) *
            Math.cos(normX * 6 * paramB);
        } else {
          normY = normX < 0 ? 0.45 * paramA * (normX + 1) - 0.35 : 0.45 * paramA - 0.35;
        }
      }

      const clampedY = Math.max(-0.92, Math.min(0.92, normY));
      const sx = (i / steps) * canvasWidth;
      const sy = GRAPH_HEIGHT / 2 - clampedY * (GRAPH_HEIGHT / 2);
      pts.push(`${sx.toFixed(1)},${sy.toFixed(1)}`);
    }
    return pts.join(' ');
  }, [activeMode, mathFunc, paramA, paramB, physicsPreset, canvasWidth]);

  // Coordinate geometry derived values
  const coordMetrics = useMemo(() => {
    const cx = canvasWidth / 2;
    const cy = GRAPH_HEIGHT / 2;
    const scalePx = 38;
    const a = Math.max(0.75, Math.min(2.5, paramA));
    const b = Math.max(0.5, Math.min(2.25, paramB));
    if (coordPreset === 'line') {
      const m = Number((paramA - 0.5).toFixed(2));
      const c = Number((paramB - 1.25).toFixed(2));
      const x1 = -3;
      const y1 = m * x1 + c;
      const x2 = 3;
      const y2 = m * x2 + c;
      return {
        equation: `y = ${m.toFixed(1)}x ${c >= 0 ? '+' : '-'} ${Math.abs(c).toFixed(1)}`,
        summary: `Slope m = ${m.toFixed(1)} · y-intercept = (0, ${c.toFixed(1)}) · θ = ${((Math.atan(m) * 180) / Math.PI).toFixed(1)}°`,
        lineSeg: {
          x1: cx + x1 * scalePx,
          y1: cy - y1 * scalePx,
          x2: cx + x2 * scalePx,
          y2: cy - y2 * scalePx,
        },
        rx: 0,
        ry: 0,
        fociOffsetPx: 0,
        hypPaths: { right: '', left: '' },
      };
    }
    if (coordPreset === 'circle') {
      const r = a;
      return {
        equation: `x² + y² = ${(r * r).toFixed(2)}  (r = ${r.toFixed(2)})`,
        summary: `Center (0, 0) · Radius r = ${r.toFixed(2)} · Circumference = ${(2 * Math.PI * r).toFixed(2)}`,
        rx: r * scalePx,
        ry: r * scalePx,
        fociOffsetPx: 0,
        lineSeg: null,
        hypPaths: { right: '', left: '' },
      };
    }
    if (coordPreset === 'ellipse') {
      const major = Math.max(a, b);
      const minor = Math.min(a, b);
      const e = major > 0 ? Math.sqrt(Math.max(0, 1 - (minor * minor) / (major * major))) : 0;
      const cFocus = major * e;
      return {
        equation: `x²/${a.toFixed(1)}² + y²/${b.toFixed(1)}² = 1`,
        summary: `Eccentricity e = ${e.toFixed(3)} · Foci (±${cFocus.toFixed(2)}, 0) · Major = ${(2 * major).toFixed(1)}`,
        rx: a * scalePx,
        ry: b * scalePx,
        fociOffsetPx: a >= b ? cFocus * scalePx : 0,
        lineSeg: null,
        hypPaths: { right: '', left: '' },
      };
    }
    // Hyperbola x²/a² - y²/b² = 1
    const cHyp = Math.sqrt(a * a + b * b);
    const eHyp = cHyp / a;
    const rightPts: string[] = [];
    const leftPts: string[] = [];
    for (let i = -24; i <= 24; i++) {
      const t = i / 12; // -2..+2
      const hx = a * Math.cosh(t);
      const hy = b * Math.sinh(t);
      const sxR = cx + hx * scalePx;
      const sxL = cx - hx * scalePx;
      const sy = cy - hy * scalePx;
      if (sy >= -10 && sy <= GRAPH_HEIGHT + 10) {
        rightPts.push(`${rightPts.length === 0 ? 'M' : 'L'}${sxR.toFixed(1)},${sy.toFixed(1)}`);
        leftPts.push(`${leftPts.length === 0 ? 'M' : 'L'}${sxL.toFixed(1)},${sy.toFixed(1)}`);
      }
    }
    return {
      equation: `x²/${a.toFixed(1)}² - y²/${b.toFixed(1)}² = 1`,
      summary: `Eccentricity e = ${eHyp.toFixed(3)} (>1) · Vertices (±${a.toFixed(1)}, 0) · Asymptotes y = ±${(b / a).toFixed(2)}x`,
      rx: a * scalePx,
      ry: b * scalePx,
      fociOffsetPx: cHyp * scalePx,
      lineSeg: null,
      hypPaths: { right: rightPts.join(' '), left: leftPts.join(' ') },
    };
  }, [coordPreset, paramA, paramB, canvasWidth]);

  // 3D wireframe projection vertices & edges
  const projected3D = useMemo(() => {
    const cx = canvasWidth / 2;
    const cy = GRAPH_HEIGHT / 2 + 4;
    if (meshPreset === 'tetrahedron') {
      const verts: [number, number, number][] = [
        [0, 1.15, 0], // H top
        [1.08, -0.45, 0.55], // H front-right
        [-0.95, -0.45, 0.72], // H front-left
        [-0.12, -0.45, -1.15], // H back
        [0, 0.08, 0], // Center C
      ];
      const labels = ['H', 'H', 'H', 'H', 'C (sp³)'];
      const pVerts = verts.map((v) => project3DPoint(v, azAngle, elAngle, cx, cy, 56));
      const edges: [number, number][] = [
        [4, 0],
        [4, 1],
        [4, 2],
        [4, 3],
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
      ];
      return { pVerts, labels, edges, bondEdgesCount: 4 };
    }
    // Cube
    const verts: [number, number, number][] = [
      [-1, -1, -1],
      [1, -1, -1],
      [1, 1, -1],
      [-1, 1, -1],
      [-1, -1, 1],
      [1, -1, 1],
      [1, 1, 1],
      [-1, 1, 1],
    ];
    const pVerts = verts.map((v) => project3DPoint(v, azAngle, elAngle, cx, cy, 48));
    const edges: [number, number][] = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
    ];
    return {
      pVerts,
      labels: ['1', '2', '3', '4', '5', '6', '7', '8'],
      edges,
      bondEdgesCount: 12,
    };
  }, [meshPreset, azAngle, elAngle, canvasWidth]);

  const axisColor = themeMode === 'dark' ? '#475569' : '#CBD5E1';
  const gridColor = themeMode === 'dark' ? '#1E293B' : '#E2E8F0';
  const strokeColor = colors.primary;
  const atomStroke = themeMode === 'dark' ? '#E2E8F0' : '#1E293B';
  const canvasBg = themeMode === 'dark' ? '#0B1324' : '#FAFAFA';
  const textColorSvg = themeMode === 'dark' ? '#F8FAFC' : '#0F172A';

  const getActiveVisualMetadata = (): {
    title: string;
    subject: StemVisualSubject;
    svgInner: string;
    caption: string;
  } => {
    const W = 520;
    const H = 260;
    const gridLines = `
      <rect width="${W}" height="${H}" rx="14" fill="${canvasBg}"/>
      <line x1="0" y1="${H / 2}" x2="${W}" y2="${H / 2}" stroke="${axisColor}" stroke-width="1.2"/>
      <line x1="${W / 2}" y1="0" x2="${W / 2}" y2="${H}" stroke="${axisColor}" stroke-width="1.2"/>
    `;

    if (activeMode === 'math' || activeMode === 'physics') {
      const scaledPts = polylinePoints
        .split(' ')
        .map((pt) => {
          const [x, y] = pt.split(',').map(Number);
          return `${((x / canvasWidth) * W).toFixed(1)},${((y / GRAPH_HEIGHT) * H).toFixed(1)}`;
        })
        .join(' ');
      const eq =
        activeMode === 'math'
          ? mathFunc === 'sine'
            ? `f(x) = ${paramA.toFixed(1)} sin(${paramB.toFixed(1)} * 2pi x)`
            : mathFunc === 'quadratic'
            ? `f(x) = ${paramA.toFixed(1)} x^2`
            : `f(x) = exp(${paramA.toFixed(1)} x)`
          : `Physics ${physicsPreset.toUpperCase()} (A=${paramA.toFixed(1)}, B=${paramB.toFixed(1)})`;
      return {
        title: `Playground: ${eq}`,
        subject: activeMode === 'math' ? 'math' : 'physics',
        caption: `Captured from STEM Graph Playground · ${eq}`,
        svgInner: `${gridLines}<polyline points="${scaledPts}" fill="none" stroke="${strokeColor}" stroke-width="3" stroke-linecap="round"/><text x="16" y="24" fill="${strokeColor}" font-size="13" font-weight="700" font-family="Arial">${escapeXml(eq)}</text>`,
      };
    }

    if (activeMode === 'coord') {
      return {
        title: `Conics: ${coordMetrics.equation}`,
        subject: 'math',
        caption: coordMetrics.summary,
        svgInner: `${gridLines}${
          coordPreset === 'line' && coordMetrics.lineSeg
            ? `<line x1="${coordMetrics.lineSeg.x1}" y1="${coordMetrics.lineSeg.y1}" x2="${coordMetrics.lineSeg.x2}" y2="${coordMetrics.lineSeg.y2}" stroke="${strokeColor}" stroke-width="3"/>`
            : coordPreset === 'circle' || coordPreset === 'ellipse'
            ? `<ellipse cx="${W / 2}" cy="${H / 2}" rx="${coordMetrics.rx}" ry="${coordMetrics.ry}" fill="none" stroke="${strokeColor}" stroke-width="3"/>`
            : `<path d="${coordMetrics.hypPaths.right}" fill="none" stroke="${strokeColor}" stroke-width="3"/><path d="${coordMetrics.hypPaths.left}" fill="none" stroke="${colors.cyan}" stroke-width="3"/>`
        }<text x="16" y="24" fill="${strokeColor}" font-size="13" font-weight="700" font-family="Arial">${escapeXml(coordMetrics.equation)}</text>`,
      };
    }

    if (activeMode === 'chemistry') {
      return {
        title: `Chemistry: ${iupacResult.iupacName} (${iupacResult.formula})`,
        subject: 'chemistry',
        caption: `${iupacResult.iupacName} · Preset: ${chemPreset}`,
        svgInner: `<rect width="${W}" height="${H}" rx="14" fill="${canvasBg}"/><polygon points="260,62 320,97 320,167 260,202 200,167 200,97" fill="none" stroke="${strokeColor}" stroke-width="3"/><circle cx="260" cy="132" r="36" fill="none" stroke="${colors.cyan}" stroke-width="2" stroke-dasharray="6,4"/><text x="18" y="28" fill="${strokeColor}" font-size="14" font-weight="800" font-family="Arial">${escapeXml(iupacResult.iupacName)} (${escapeXml(iupacResult.formula)})</text>`,
      };
    }

    if (activeMode === 'biology') {
      const isCell = bioPreset === 'cell';
      return {
        title: isCell ? 'Eukaryotic Animal Cell Architecture' : 'DNA Double Helix Structure',
        subject: 'chemistry',
        caption: isCell
          ? 'Nucleus, Mitochondria, Rough ER & Golgi Apparatus callout diagram.'
          : 'Antiparallel sugar-phosphate rails with complementary A=T and G≡C base pairs.',
        svgInner: isCell
          ? `<rect width="${W}" height="${H}" rx="14" fill="${canvasBg}"/><ellipse cx="260" cy="135" rx="185" ry="96" fill="rgba(249,115,22,0.08)" stroke="#F97316" stroke-width="3"/><circle cx="240" cy="132" r="40" fill="rgba(139,92,246,0.22)" stroke="#8B5CF6" stroke-width="2.5"/><ellipse cx="355" cy="108" rx="28" ry="15" fill="rgba(249,115,22,0.25)" stroke="#F97316" stroke-width="2"/><text x="16" y="24" fill="${textColorSvg}" font-size="13" font-weight="800" font-family="Arial">Eukaryotic Animal Cell</text>`
          : `<rect width="${W}" height="${H}" rx="14" fill="${canvasBg}"/><path d="M90,90 C160,40 220,180 290,130 C360,80 420,180 460,110" fill="none" stroke="#F97316" stroke-width="4"/><path d="M90,150 C160,200 220,60 290,110 C360,160 420,60 460,130" fill="none" stroke="#22D3EE" stroke-width="4"/><text x="16" y="24" fill="${textColorSvg}" font-size="13" font-weight="800" font-family="Arial">DNA Double Helix (A=T / G=C)</text>`,
      };
    }

    // preview3d
    const edgeTags = projected3D.edges
      .map(([a, b]) => {
        const pa = projected3D.pVerts[a];
        const pb = projected3D.pVerts[b];
        if (!pa || !pb) return '';
        return `<line x1="${pa.x.toFixed(1)}" y1="${pa.y.toFixed(1)}" x2="${pb.x.toFixed(1)}" y2="${pb.y.toFixed(1)}" stroke="${strokeColor}" stroke-width="2.4"/>`;
      })
      .join('');
    return {
      title: `3D Wireframe (${meshPreset === 'tetrahedron' ? 'Tetrahedral sp3' : 'Unit Cube'})`,
      subject: 'math',
      caption: `Azimuth ${azAngle} deg, Elevation ${elAngle} deg`,
      svgInner: `<rect width="${W}" height="${H}" rx="14" fill="${canvasBg}"/>${edgeTags}<text x="16" y="24" fill="${strokeColor}" font-size="13" font-weight="700" font-family="Arial">3D ${escapeXml(meshPreset)} (${azAngle}deg, ${elAngle}deg)</text>`,
    };
  };

  const handleSaveToImageLibrary = async () => {
    if (savingImage) return;
    setSavingImage(true);
    setSaveNotice(null);
    try {
      const meta = getActiveVisualMetadata();
      const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 260" width="520" height="260">${meta.svgInner}</svg>`;
      const bytes = estimateUtf8Bytes(svgMarkup);
      const [existingImages, planTier] = await Promise.all([
        StorageService.getGeneratedImages(),
        StorageService.getUserPlanTier(),
      ]);
      const quotaCheck = checkCanStoreGeneratedImage(existingImages, planTier, bytes);
      if (!quotaCheck.allowed) {
        setSaveNotice({
          ok: false,
          msg: quotaCheck.reason || 'Storage quota reached in AI Image Library.',
        });
        return;
      }
      const newImage: GeneratedStemImage = {
        id: `pg_${Date.now()}`,
        title: meta.title,
        prompt: meta.caption,
        subjectCategory: meta.subject,
        format: 'svg',
        dataUri: svgToDataUri(svgMarkup),
        svgMarkup,
        byteSize: bytes,
        width: 520,
        height: 260,
        createdAt: new Date().toISOString(),
        source: 'stem_engine',
        modelLabel: 'STEM Playground Export',
        caption: meta.caption,
        rotationDeg: 0,
        bgTheme: themeMode === 'dark' ? 'dark' : 'light',
        showGrid: true,
        showLabels: true,
        annotations: [],
      };
      const updated = await StorageService.saveGeneratedImage(newImage);
      setSaveNotice({
        ok: true,
        msg: `Saved "${meta.title}" to AI Image Library (${updated.length} visuals stored).`,
      });
    } catch {
      setSaveNotice({
        ok: false,
        msg: 'Could not export Playground diagram right now. Please try again.',
      });
    } finally {
      setSavingImage(false);
    }
  };

  const renderChemicalSvg = () => {
    if (chemPreset === 'benzene') {
      const cx = 120;
      const cy = 76;
      const r = 46;
      const hexPts = Array.from({ length: 6 }, (_, i) => {
        const ang = (Math.PI / 3) * i - Math.PI / 2;
        return `${(cx + r * Math.cos(ang)).toFixed(1)},${(cy + r * Math.sin(ang)).toFixed(1)}`;
      }).join(' ');
      return (
        <Svg width={240} height={152} viewBox="0 0 240 152">
          <Polyline
            points={`${hexPts} ${hexPts.split(' ')[0]}`}
            fill="none"
            stroke={colors.primary}
            strokeWidth={3}
          />
          <Circle
            cx={cx}
            cy={cy}
            r={28}
            fill="none"
            stroke={colors.cyan}
            strokeWidth={2}
            strokeDasharray="6 4"
          />
          <SvgText x={cx - 12} y={20} fill={atomStroke} fontSize={11} fontWeight="700">
            sp²
          </SvgText>
          <SvgText x={cx - 18} y={cy + 4} fill={colors.primary} fontSize={12} fontWeight="800">
            6π e⁻
          </SvgText>
        </Svg>
      );
    }

    if (chemPreset === 'ester') {
      return (
        <Svg width={260} height={152} viewBox="0 0 260 152">
          <Line x1={42} y1={90} x2={88} y2={90} stroke={atomStroke} strokeWidth={2.5} />
          <Line x1={85} y1={90} x2={85} y2={42} stroke={colors.primary} strokeWidth={2.5} />
          <Line x1={91} y1={90} x2={91} y2={42} stroke={colors.primary} strokeWidth={2.5} />
          <Line x1={88} y1={90} x2={132} y2={114} stroke={atomStroke} strokeWidth={2.5} />
          <Line x1={146} y1={114} x2={188} y2={90} stroke={atomStroke} strokeWidth={2.5} />
          <Line x1={188} y1={90} x2={228} y2={112} stroke={atomStroke} strokeWidth={2.5} />
          <SvgText x={14} y={94} fill={atomStroke} fontSize={12} fontWeight="700">
            CH₃
          </SvgText>
          <SvgText x={82} y={34} fill={colors.primary} fontSize={13} fontWeight="800">
            O
          </SvgText>
          <SvgText x={133} y={128} fill={colors.cyan} fontSize={13} fontWeight="800">
            O
          </SvgText>
          <SvgText x={180} y={80} fill={atomStroke} fontSize={11} fontWeight="700">
            CH₂
          </SvgText>
          <SvgText x={226} y={120} fill={atomStroke} fontSize={12} fontWeight="700">
            CH₃
          </SvgText>
        </Svg>
      );
    }

    if (chemPreset === 'alcohol') {
      return (
        <Svg width={250} height={152} viewBox="0 0 250 152">
          <Line x1={48} y1={96} x2={102} y2={62} stroke={atomStroke} strokeWidth={2.8} />
          <Line x1={102} y1={62} x2={156} y2={96} stroke={atomStroke} strokeWidth={2.8} />
          <Line x1={156} y1={96} x2={204} y2={70} stroke={colors.primary} strokeWidth={2.8} />
          <SvgText x={18} y={102} fill={atomStroke} fontSize={13} fontWeight="700">
            H₃C
          </SvgText>
          <SvgText x={90} y={50} fill={atomStroke} fontSize={12} fontWeight="700">
            CH₂
          </SvgText>
          <SvgText x={148} y={118} fill={colors.cyan} fontSize={13} fontWeight="800">
            O
          </SvgText>
          <SvgText x={208} y={73} fill={colors.primary} fontSize={14} fontWeight="800">
            H
          </SvgText>
        </Svg>
      );
    }

    return (
      <Svg width={250} height={152} viewBox="0 0 250 152">
        <Line x1={125} y1={78} x2={125} y2={28} stroke={colors.primary} strokeWidth={2.8} />
        <Line x1={125} y1={78} x2={68} y2={114} stroke={atomStroke} strokeWidth={2.8} />
        <Line x1={125} y1={78} x2={182} y2={114} stroke={atomStroke} strokeWidth={2.8} />
        <SvgText x={112} y={20} fill={colors.primary} fontSize={12.5} fontWeight="800">
          CH₃
        </SvgText>
        <SvgText x={114} y={96} fill={colors.cyan} fontSize={12.5} fontWeight="800">
          CH
        </SvgText>
        <SvgText x={36} y={124} fill={atomStroke} fontSize={12.5} fontWeight="700">
          CH₃
        </SvgText>
        <SvgText x={186} y={124} fill={atomStroke} fontSize={12.5} fontWeight="700">
          CH₃
        </SvgText>
      </Svg>
    );
  };

  const activeBioHotspot =
    (bioPreset === 'cell' ? BIO_CELL_HOTSPOTS : BIO_DNA_HOTSPOTS).find(
      (h) => h.id === selectedBioHotspot
    ) || (bioPreset === 'cell' ? BIO_CELL_HOTSPOTS[0] : BIO_DNA_HOTSPOTS[0]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextCol}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>STEM Graph Playground</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Functions, Conics, IUPAC Builder, Biology SVGs & 3D Lab
          </Text>
        </View>
        <Badge label="6 Labs" variant="primary" />
      </View>

      {/* Scrollable 6-Tab Mode Strip (mobile-safe without truncation) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabScroll}
        contentContainerStyle={[
          styles.tabBarScrollContent,
          { backgroundColor: colors.surface, borderColor: colors.borderSubtle },
        ]}
      >
        {(
          [
            { id: 'math', label: 'Math Plots' },
            { id: 'physics', label: 'Kinematics' },
            { id: 'coord', label: 'Coord Geom' },
            { id: 'chemistry', label: 'Chem & IUPAC' },
            { id: 'biology', label: 'Biology SVGs' },
            { id: 'preview3d', label: '3D Lab (Preview)' },
          ] as const
        ).map((tab) => {
          const active = activeMode === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              focusable={false}
              onPress={() => {
                setActiveMode(tab.id);
                setSaveNotice(null);
              }}
              style={[
                styles.tabBtnChip,
                {
                  backgroundColor: active ? colors.primary : 'transparent',
                },
              ]}
            >
              <Text
                numberOfLines={1}
                style={[styles.tabText, { color: active ? '#FFFFFF' : colors.textSecondary }]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Save Feedback Toast */}
      {saveNotice && (
        <View
          style={[
            styles.noticeBanner,
            {
              backgroundColor: saveNotice.ok
                ? themeMode === 'dark'
                  ? '#064E3B'
                  : '#DCFCE7'
                : colors.errorBg,
              borderColor: saveNotice.ok ? colors.success : colors.error,
            },
          ]}
        >
          <CheckCircle2 size={15} color={saveNotice.ok ? colors.success : colors.error} />
          <Text
            style={{
              flex: 1,
              fontSize: 12,
              fontWeight: '700',
              color: saveNotice.ok ? colors.success : colors.error,
            }}
          >
            {saveNotice.msg}
          </Text>
        </View>
      )}

      {/* MODE 1 & 2 & 3: MATH, KINEMATICS, COORDINATE GEOMETRY */}
      {(activeMode === 'math' || activeMode === 'physics' || activeMode === 'coord') && (
        <Card style={styles.canvasCard}>
          <View style={styles.canvasMeta}>
            <Text style={[styles.equationLabel, { color: colors.primary }]} numberOfLines={2}>
              {activeMode === 'math'
                ? mathFunc === 'sine'
                  ? `f(x) = ${paramA.toFixed(1)} · sin(${paramB.toFixed(1)} · 2πx)`
                  : mathFunc === 'quadratic'
                  ? `f(x) = ${paramA.toFixed(1)} · x²`
                  : `f(x) = e^(${paramA.toFixed(1)} · x)`
                : activeMode === 'physics'
                ? physicsPreset === 'projectile'
                  ? `y = x·tan(θ) - g·x² / (2v₀²cos²θ) · Scale ${paramA.toFixed(1)}`
                  : physicsPreset === 'shm'
                  ? `x(t) = ${paramA.toFixed(1)}·e^(-0.7t)·cos(${paramB.toFixed(1)}ωt)`
                  : `Kinematics v(t) · Gain ${paramA.toFixed(1)}`
                : coordMetrics.equation}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setParamA(1.5);
                setParamB(1.0);
              }}
              style={[styles.iconBtn, { backgroundColor: colors.surface }]}
              accessibilityLabel="Reset graph parameters"
            >
              <RotateCcw size={14} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.canvasFrame,
              { backgroundColor: canvasBg, borderColor: colors.border },
            ]}
          >
            <Svg width={canvasWidth} height={GRAPH_HEIGHT}>
              {[0.25, 0.75].map((frac) => (
                <Line
                  key={`gx_${frac}`}
                  x1={canvasWidth * frac}
                  y1={0}
                  x2={canvasWidth * frac}
                  y2={GRAPH_HEIGHT}
                  stroke={gridColor}
                  strokeDasharray="4 4"
                  strokeWidth={1}
                />
              ))}
              {[0.25, 0.75].map((frac) => (
                <Line
                  key={`gy_${frac}`}
                  x1={0}
                  y1={GRAPH_HEIGHT * frac}
                  x2={canvasWidth}
                  y2={GRAPH_HEIGHT * frac}
                  stroke={gridColor}
                  strokeDasharray="4 4"
                  strokeWidth={1}
                />
              ))}

              <Line
                x1={0}
                y1={GRAPH_HEIGHT / 2}
                x2={canvasWidth}
                y2={GRAPH_HEIGHT / 2}
                stroke={axisColor}
                strokeWidth={1.25}
              />
              <Line
                x1={canvasWidth / 2}
                y1={0}
                x2={canvasWidth / 2}
                y2={GRAPH_HEIGHT}
                stroke={axisColor}
                strokeWidth={1.25}
              />

              <SvgText x={canvasWidth / 2 + 5} y={13} fill={axisColor} fontSize={10}>
                +y
              </SvgText>
              <SvgText x={canvasWidth - 18} y={GRAPH_HEIGHT / 2 - 5} fill={axisColor} fontSize={10}>
                +x
              </SvgText>

              {activeMode !== 'coord' ? (
                <Polyline
                  points={polylinePoints}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : coordPreset === 'line' && coordMetrics.lineSeg ? (
                <Line
                  x1={coordMetrics.lineSeg.x1}
                  y1={coordMetrics.lineSeg.y1}
                  x2={coordMetrics.lineSeg.x2}
                  y2={coordMetrics.lineSeg.y2}
                  stroke={strokeColor}
                  strokeWidth={3}
                />
              ) : coordPreset === 'circle' || coordPreset === 'ellipse' ? (
                <>
                  <Ellipse
                    cx={canvasWidth / 2}
                    cy={GRAPH_HEIGHT / 2}
                    rx={coordMetrics.rx}
                    ry={coordMetrics.ry}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={3}
                  />
                  {coordMetrics.fociOffsetPx > 0 && (
                    <>
                      <Circle
                        cx={canvasWidth / 2 - coordMetrics.fociOffsetPx}
                        cy={GRAPH_HEIGHT / 2}
                        r={4.5}
                        fill={colors.cyan}
                      />
                      <Circle
                        cx={canvasWidth / 2 + coordMetrics.fociOffsetPx}
                        cy={GRAPH_HEIGHT / 2}
                        r={4.5}
                        fill={colors.cyan}
                      />
                    </>
                  )}
                </>
              ) : (
                <>
                  {coordMetrics.hypPaths.right ? (
                    <Path
                      d={coordMetrics.hypPaths.right}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={3}
                    />
                  ) : null}
                  {coordMetrics.hypPaths.left ? (
                    <Path
                      d={coordMetrics.hypPaths.left}
                      fill="none"
                      stroke={colors.cyan}
                      strokeWidth={3}
                    />
                  ) : null}
                </>
              )}
            </Svg>
          </View>

          {activeMode === 'coord' && (
            <View
              style={[
                styles.coordSummaryBar,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Compass size={14} color={colors.primary} />
              <Text style={{ flex: 1, fontSize: 11.5, fontWeight: '700', color: colors.text }}>
                {coordMetrics.summary}
              </Text>
            </View>
          )}

          {/* Steppers */}
          <View style={styles.controlsRow}>
            <View style={styles.controlGroup}>
              <Text style={[styles.controlLabel, { color: colors.textSecondary }]} numberOfLines={1}>
                {activeMode === 'coord'
                  ? coordPreset === 'line'
                    ? `Slope (m): ${(paramA - 0.5).toFixed(1)}`
                    : coordPreset === 'circle'
                    ? `Radius (r): ${paramA.toFixed(1)}`
                    : `Semi-axis (a): ${paramA.toFixed(1)}`
                  : `Amplitude (A): ${paramA.toFixed(1)}`}
              </Text>
              <View style={styles.btnRow}>
                <TouchableOpacity
                  onPress={() => setParamA((prev) => Math.max(0.5, prev - 0.25))}
                  style={[styles.paramBtn, { backgroundColor: colors.surface }]}
                >
                  <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>- 0.25</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setParamA((prev) => Math.min(2.5, prev + 0.25))}
                  style={[styles.paramBtn, { backgroundColor: colors.surface }]}
                >
                  <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>+ 0.25</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.controlGroup}>
              <Text style={[styles.controlLabel, { color: colors.textSecondary }]} numberOfLines={1}>
                {activeMode === 'coord'
                  ? coordPreset === 'line'
                    ? `Intercept (c): ${(paramB - 1.25).toFixed(1)}`
                    : `Semi-axis (b): ${paramB.toFixed(1)}`
                  : `Frequency (B): ${paramB.toFixed(1)}`}
              </Text>
              <View style={styles.btnRow}>
                <TouchableOpacity
                  onPress={() => setParamB((prev) => Math.max(0.5, prev - 0.25))}
                  style={[styles.paramBtn, { backgroundColor: colors.surface }]}
                >
                  <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>- 0.25</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setParamB((prev) => Math.min(2.25, prev + 0.25))}
                  style={[styles.paramBtn, { backgroundColor: colors.surface }]}
                >
                  <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>+ 0.25</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Presets */}
          <View style={styles.presetRow}>
            {activeMode === 'math' ? (
              (['sine', 'quadratic', 'exponential'] as const).map((func) => (
                <TouchableOpacity
                  key={func}
                  onPress={() => setMathFunc(func)}
                  style={[
                    styles.presetBtn,
                    {
                      backgroundColor: mathFunc === func ? colors.primary : colors.surface,
                      borderWidth: 1,
                      borderColor: mathFunc === func ? colors.primary : colors.borderSubtle,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: mathFunc === func ? '#FFF' : colors.textPrimary,
                      fontSize: 11.5,
                      fontWeight: '700',
                    }}
                  >
                    {func.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))
            ) : activeMode === 'physics' ? (
              (['projectile', 'shm', 'vt_graph'] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setPhysicsPreset(p)}
                  style={[
                    styles.presetBtn,
                    {
                      backgroundColor: physicsPreset === p ? colors.primary : colors.surface,
                      borderWidth: 1,
                      borderColor: physicsPreset === p ? colors.primary : colors.borderSubtle,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: physicsPreset === p ? '#FFF' : colors.textPrimary,
                      fontSize: 11.5,
                      fontWeight: '700',
                    }}
                  >
                    {p === 'projectile' ? 'Projectile' : p === 'shm' ? 'Damped SHM' : 'v-t Graph'}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              (['line', 'circle', 'ellipse', 'hyperbola'] as const).map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setCoordPreset(c)}
                  style={[
                    styles.presetBtn,
                    {
                      backgroundColor: coordPreset === c ? colors.primary : colors.surface,
                      borderWidth: 1,
                      borderColor: coordPreset === c ? colors.primary : colors.borderSubtle,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: coordPreset === c ? '#FFF' : colors.textPrimary,
                      fontSize: 11,
                      fontWeight: '700',
                    }}
                  >
                    {c.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </Card>
      )}

      {/* MODE 4: CHEMISTRY 2D STRUCTURES + INTERACTIVE IUPAC NAME BUILDER */}
      {activeMode === 'chemistry' && (
        <View style={{ gap: 14 }}>
          <Card style={styles.canvasCard}>
            <Text style={[styles.equationLabel, { color: colors.primary, marginBottom: 10 }]}>
              2D Molecular Bonding Structures
            </Text>

            <View
              style={[
                styles.chemVisualBox,
                { backgroundColor: canvasBg, borderColor: colors.border },
              ]}
            >
              {renderChemicalSvg()}
              <Text style={[styles.chemIupac, { color: colors.textPrimary }]}>
                {chemPreset === 'benzene'
                  ? 'Benzene (C₆H₆)'
                  : chemPreset === 'ester'
                  ? 'Ethyl Ethanoate (CH₃COOCH₂CH₃)'
                  : chemPreset === 'alcohol'
                  ? 'Ethanol (CH₃CH₂OH)'
                  : '2-Methylpropane · Isobutane'}
              </Text>
              <Text style={[styles.chemDetails, { color: colors.textSecondary }]}>
                {chemPreset === 'benzene'
                  ? 'Planar aromatic ring with 6 delocalized π-electrons (sp² hybridized) and 36 kcal/mol resonance energy.'
                  : chemPreset === 'ester'
                  ? 'Ester linkage formed by Fischer esterification of ethanoic acid + ethanol in acid medium.'
                  : chemPreset === 'alcohol'
                  ? 'Primary alcohol oxidized stepwise to ethanal and ethanoic acid with acidic K₂Cr₂O₇.'
                  : 'Branched alkane with sp³ tetrahedral carbon (109.5°) and one tertiary C-H center.'}
              </Text>
            </View>

            <View style={styles.presetRow}>
              {(['benzene', 'ester', 'alcohol', 'alkane'] as const).map((cp) => (
                <TouchableOpacity
                  key={cp}
                  onPress={() => setChemPreset(cp)}
                  style={[
                    styles.presetBtn,
                    {
                      backgroundColor: chemPreset === cp ? colors.primary : colors.surface,
                      borderWidth: 1,
                      borderColor: chemPreset === cp ? colors.primary : colors.borderSubtle,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: chemPreset === cp ? '#FFF' : colors.textPrimary,
                      fontSize: 11,
                      fontWeight: '700',
                    }}
                  >
                    {cp.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Interactive IUPAC Builder */}
          <Card style={styles.canvasCard}>
            <View style={styles.iupacHeader}>
              <FlaskConical size={16} color={colors.primary} />
              <Text style={[styles.equationLabel, { color: colors.textPrimary }]}>
                Interactive IUPAC Name Builder
              </Text>
              <Badge label={iupacResult.formula} variant="info" size="sm" />
            </View>

            <View
              style={[
                styles.iupacResultBox,
                {
                  backgroundColor: themeMode === 'dark' ? '#131A29' : '#FFF7ED',
                  borderColor: colors.primary,
                },
              ]}
            >
              <Text style={{ fontSize: 10, fontWeight: '800', color: colors.primary, letterSpacing: 0.6 }}>
                SYSTEMATIC IUPAC NAME
              </Text>
              <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text, marginTop: 3 }}>
                {iupacResult.iupacName}
              </Text>
              <Text style={{ fontSize: 11.5, color: colors.textSecondary, marginTop: 4 }}>
                {iupacResult.note}
              </Text>
            </View>

            <Text style={[styles.controlLabel, { color: colors.textSecondary }]}>
              Word Root (Longest Chain Carbons)
            </Text>
            <View style={styles.chipWrap}>
              {IUPAC_ROOTS.map((r) => {
                const active = iupacC === r.c;
                return (
                  <TouchableOpacity
                    key={r.c}
                    onPress={() => setIupacC(r.c)}
                    style={[
                      styles.builderChip,
                      {
                        backgroundColor: active ? colors.primary : colors.surface,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 11.5, fontWeight: '700', color: active ? '#FFF' : colors.text }}>
                      C{r.c} ({r.stem})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.controlLabel, { color: colors.textSecondary, marginTop: 10 }]}>
              Primary Suffix (C–C Saturation) & Substituent Prefix
            </Text>
            <View style={styles.chipWrap}>
              {(
                [
                  { id: 'ane', label: '-an- (Single)' },
                  { id: 'ene', label: '-en- (Double)' },
                  { id: 'yne', label: '-yn- (Triple)' },
                ] as const
              ).map((b) => (
                <TouchableOpacity
                  key={b.id}
                  onPress={() => setIupacBond(b.id)}
                  style={[
                    styles.builderChip,
                    {
                      backgroundColor: iupacBond === b.id ? colors.secondary : colors.surface,
                      borderColor: iupacBond === b.id ? colors.secondary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '700',
                      color: iupacBond === b.id ? '#FFF' : colors.text,
                    }}
                  >
                    {b.label}
                  </Text>
                </TouchableOpacity>
              ))}
              {(
                [
                  { id: 'none', label: 'No Prefix' },
                  { id: 'methyl', label: '2-Methyl' },
                  { id: 'chloro', label: '2-Chloro' },
                ] as const
              ).map((p) => (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => setIupacPrefix(p.id)}
                  style={[
                    styles.builderChip,
                    {
                      backgroundColor: iupacPrefix === p.id ? colors.primary : colors.surface,
                      borderColor: iupacPrefix === p.id ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '700',
                      color: iupacPrefix === p.id ? '#FFF' : colors.text,
                    }}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.controlLabel, { color: colors.textSecondary, marginTop: 10 }]}>
              Principal Functional Group
            </Text>
            <View style={styles.chipWrap}>
              {(
                [
                  { id: 'alkane', label: 'Hydrocarbon (-e)' },
                  { id: 'ol', label: 'Alcohol (-ol)' },
                  { id: 'al', label: 'Aldehyde (-al)' },
                  { id: 'one', label: 'Ketone (-one)' },
                  { id: 'oic', label: 'Acid (-oic acid)' },
                ] as const
              ).map((g) => (
                <TouchableOpacity
                  key={g.id}
                  onPress={() => setIupacGroup(g.id)}
                  style={[
                    styles.builderChip,
                    {
                      backgroundColor: iupacGroup === g.id ? colors.primary : colors.surface,
                      borderColor: iupacGroup === g.id ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '700',
                      color: iupacGroup === g.id ? '#FFF' : colors.text,
                    }}
                  >
                    {g.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        </View>
      )}

      {/* MODE 5: ANNOTATED BIOLOGY SVG DIAGRAMS */}
      {activeMode === 'biology' && (
        <Card style={styles.canvasCard}>
          <View style={styles.canvasMeta}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
              <Dna size={16} color={colors.primary} />
              <Text style={[styles.equationLabel, { color: colors.primary }]} numberOfLines={1}>
                {bioPreset === 'cell' ? 'Eukaryotic Animal Cell' : 'DNA Double Helix (B-DNA)'}
              </Text>
            </View>
            <Badge label="NEET / AP Bio" variant="info" size="sm" />
          </View>

          <View
            style={[
              styles.canvasFrame,
              { backgroundColor: canvasBg, borderColor: colors.border },
            ]}
          >
            {bioPreset === 'cell' ? (
              <Svg width={canvasWidth} height={GRAPH_HEIGHT}>
                {/* Plasma Membrane */}
                <Ellipse
                  cx={canvasWidth / 2}
                  cy={GRAPH_HEIGHT / 2}
                  rx={canvasWidth * 0.43}
                  ry={96}
                  fill="rgba(249,115,22,0.08)"
                  stroke="#F97316"
                  strokeWidth={selectedBioHotspot === 'nucleus' ? 2.5 : 3}
                />
                {/* Nucleus */}
                <Circle
                  cx={canvasWidth * 0.44}
                  cy={GRAPH_HEIGHT / 2}
                  r={38}
                  fill="rgba(139,92,246,0.22)"
                  stroke="#8B5CF6"
                  strokeWidth={selectedBioHotspot === 'nucleus' ? 3.5 : 2}
                />
                <Circle cx={canvasWidth * 0.44} cy={GRAPH_HEIGHT / 2} r={14} fill="#8B5CF6" />
                {/* Rough ER arcs */}
                <Path
                  d={`M${canvasWidth * 0.44 + 44},${GRAPH_HEIGHT / 2 - 22} Q${canvasWidth * 0.44 + 66},${GRAPH_HEIGHT / 2} ${canvasWidth * 0.44 + 44},${GRAPH_HEIGHT / 2 + 24}`}
                  fill="none"
                  stroke="#22D3EE"
                  strokeWidth={3.5}
                />
                {/* Mitochondrion */}
                <Ellipse
                  cx={canvasWidth * 0.72}
                  cy={GRAPH_HEIGHT / 2 - 26}
                  rx={26}
                  ry={13}
                  fill="rgba(249,115,22,0.25)"
                  stroke="#F97316"
                  strokeWidth={selectedBioHotspot === 'mito' ? 3 : 2}
                />
                {/* Golgi stack */}
                <Path
                  d={`M${canvasWidth * 0.22},${GRAPH_HEIGHT / 2 + 26} Q${canvasWidth * 0.28},${GRAPH_HEIGHT / 2 + 12} ${canvasWidth * 0.34},${GRAPH_HEIGHT / 2 + 28}`}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth={3.2}
                />
                <SvgText x={canvasWidth * 0.44 - 22} y={GRAPH_HEIGHT / 2 - 44} fill="#8B5CF6" fontSize={10.5} fontWeight="700">
                  Nucleus
                </SvgText>
                <SvgText x={canvasWidth * 0.72 - 28} y={GRAPH_HEIGHT / 2 - 44} fill="#F97316" fontSize={10} fontWeight="700">
                  Mitochondrion
                </SvgText>
                <SvgText x={canvasWidth * 0.16} y={GRAPH_HEIGHT / 2 + 48} fill="#10B981" fontSize={10} fontWeight="700">
                  Golgi Body
                </SvgText>
              </Svg>
            ) : (
              <Svg width={canvasWidth} height={GRAPH_HEIGHT}>
                {/* DNA Backbones + Base Pair Rungs */}
                {Array.from({ length: 12 }, (_, idx) => {
                  const x = 28 + idx * ((canvasWidth - 56) / 11);
                  const phase = (idx / 11) * Math.PI * 2.4;
                  const y1 = GRAPH_HEIGHT / 2 + Math.sin(phase) * 56;
                  const y2 = GRAPH_HEIGHT / 2 - Math.sin(phase) * 56;
                  return (
                    <Line
                      key={`bp_${idx}`}
                      x1={x}
                      y1={y1}
                      x2={x}
                      y2={y2}
                      stroke={idx % 2 === 0 ? '#10B981' : '#A78BFA'}
                      strokeWidth={2.5}
                    />
                  );
                })}
                <Polyline
                  points={Array.from({ length: 48 }, (_, i) => {
                    const x = 22 + (i / 47) * (canvasWidth - 44);
                    const y = GRAPH_HEIGHT / 2 + Math.sin((i / 47) * Math.PI * 2.4) * 56;
                    return `${x.toFixed(1)},${y.toFixed(1)}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#F97316"
                  strokeWidth={3.8}
                />
                <Polyline
                  points={Array.from({ length: 48 }, (_, i) => {
                    const x = 22 + (i / 47) * (canvasWidth - 44);
                    const y = GRAPH_HEIGHT / 2 - Math.sin((i / 47) * Math.PI * 2.4) * 56;
                    return `${x.toFixed(1)},${y.toFixed(1)}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#22D3EE"
                  strokeWidth={3.8}
                />
                <SvgText x={20} y={24} fill="#F97316" fontSize={10.5} fontWeight="700">
                  5&apos; → 3&apos; Sugar-Phosphate
                </SvgText>
                <SvgText x={canvasWidth - 130} y={GRAPH_HEIGHT - 16} fill="#22D3EE" fontSize={10.5} fontWeight="700">
                  3&apos; ← 5&apos; Antiparallel
                </SvgText>
              </Svg>
            )}
          </View>

          <View style={styles.presetRow}>
            {(
              [
                { id: 'cell', label: 'Animal Cell' },
                { id: 'dna', label: 'DNA Double Helix' },
              ] as const
            ).map((bp) => (
              <TouchableOpacity
                key={bp.id}
                onPress={() => {
                  setBioPreset(bp.id);
                  setSelectedBioHotspot(bp.id === 'cell' ? 'nucleus' : 'backbone');
                }}
                style={[
                  styles.presetBtn,
                  {
                    backgroundColor: bioPreset === bp.id ? colors.primary : colors.surface,
                    borderWidth: 1,
                    borderColor: bioPreset === bp.id ? colors.primary : colors.borderSubtle,
                  },
                ]}
              >
                <Text
                  style={{
                    color: bioPreset === bp.id ? '#FFF' : colors.textPrimary,
                    fontSize: 12,
                    fontWeight: '700',
                  }}
                >
                  {bp.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.chipWrap, { marginTop: 10 }]}>
            {(bioPreset === 'cell' ? BIO_CELL_HOTSPOTS : BIO_DNA_HOTSPOTS).map((hs) => {
              const active = activeBioHotspot.id === hs.id;
              return (
                <TouchableOpacity
                  key={hs.id}
                  onPress={() => setSelectedBioHotspot(hs.id)}
                  style={[
                    styles.builderChip,
                    {
                      backgroundColor: active ? hs.color : colors.surface,
                      borderColor: active ? hs.color : colors.border,
                    },
                  ]}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: active ? '#FFF' : colors.text }}>
                    {hs.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View
            style={[
              styles.bioNoteBox,
              { backgroundColor: colors.surface, borderColor: activeBioHotspot.color },
            ]}
          >
            <Text style={{ fontSize: 12, fontWeight: '800', color: activeBioHotspot.color }}>
              {activeBioHotspot.label}
            </Text>
            <Text style={{ fontSize: 12, color: colors.text, marginTop: 3, lineHeight: 17 }}>
              {activeBioHotspot.note}
            </Text>
          </View>
        </Card>
      )}

      {/* MODE 6: 3D GEOMETRY & MOLECULAR WIREFRAME LAB (PREVIEW) */}
      {activeMode === 'preview3d' && (
        <Card style={styles.canvasCard}>
          <View style={styles.canvasMeta}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
              <Cuboid size={16} color={colors.primary} />
              <Text style={[styles.equationLabel, { color: colors.primary }]} numberOfLines={1}>
                {meshPreset === 'tetrahedron'
                  ? 'sp³ Tetrahedral CH₄ (109.5°)'
                  : '3D Unit Cubic Lattice'}
              </Text>
            </View>
            <Badge label="Phase 5 WebGL Upgrade Preview" variant="warning" size="sm" />
          </View>

          <View
            style={[
              styles.canvasFrame,
              { backgroundColor: canvasBg, borderColor: colors.border },
            ]}
          >
            <Svg width={canvasWidth} height={GRAPH_HEIGHT}>
              <Rect x={0} y={0} width={canvasWidth} height={GRAPH_HEIGHT} fill="transparent" />
              {projected3D.edges.map(([a, b], idx) => {
                const pa = projected3D.pVerts[a];
                const pb = projected3D.pVerts[b];
                if (!pa || !pb) return null;
                const isPrimaryEdge = idx < projected3D.bondEdgesCount;
                return (
                  <Line
                    key={`e3d_${idx}`}
                    x1={pa.x}
                    y1={pa.y}
                    x2={pb.x}
                    y2={pb.y}
                    stroke={isPrimaryEdge ? colors.primary : colors.cyan}
                    strokeWidth={isPrimaryEdge ? 2.8 : 1.4}
                    strokeDasharray={isPrimaryEdge ? undefined : '4 4'}
                  />
                );
              })}
              {projected3D.pVerts.map((pt, idx) => (
                <React.Fragment key={`v3d_${idx}`}>
                  <Circle
                    cx={pt.x}
                    cy={pt.y}
                    r={meshPreset === 'tetrahedron' && idx === 4 ? 9 : 6}
                    fill={
                      meshPreset === 'tetrahedron' && idx === 4
                        ? colors.primary
                        : colors.cyan
                    }
                  />
                  <SvgText
                    x={pt.x + 8}
                    y={pt.y - 6}
                    fill={textColorSvg}
                    fontSize={10.5}
                    fontWeight="700"
                  >
                    {projected3D.labels[idx]}
                  </SvgText>
                </React.Fragment>
              ))}
            </Svg>
          </View>

          <View style={styles.controlsRow}>
            <View style={styles.controlGroup}>
              <Text style={[styles.controlLabel, { color: colors.textSecondary }]}>
                Azimuth θ: {azAngle}°
              </Text>
              <View style={styles.btnRow}>
                <TouchableOpacity
                  onPress={() => setAzAngle((a) => (a - 20 + 360) % 360)}
                  style={[styles.paramBtn, { backgroundColor: colors.surface }]}
                >
                  <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>- 20°</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setAzAngle((a) => (a + 20) % 360)}
                  style={[styles.paramBtn, { backgroundColor: colors.surface }]}
                >
                  <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>+ 20°</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.controlGroup}>
              <Text style={[styles.controlLabel, { color: colors.textSecondary }]}>
                Elevation φ: {elAngle}°
              </Text>
              <View style={styles.btnRow}>
                <TouchableOpacity
                  onPress={() => setElAngle((e) => Math.max(-75, e - 15))}
                  style={[styles.paramBtn, { backgroundColor: colors.surface }]}
                >
                  <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>- 15°</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setElAngle((e) => Math.min(75, e + 15))}
                  style={[styles.paramBtn, { backgroundColor: colors.surface }]}
                >
                  <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>+ 15°</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.presetRow}>
            {(
              [
                { id: 'tetrahedron', label: 'Tetrahedron (109.5°)' },
                { id: 'cube', label: 'Unit Cube Lattice' },
              ] as const
            ).map((m) => (
              <TouchableOpacity
                key={m.id}
                onPress={() => setMeshPreset(m.id)}
                style={[
                  styles.presetBtn,
                  {
                    backgroundColor: meshPreset === m.id ? colors.primary : colors.surface,
                    borderWidth: 1,
                    borderColor: meshPreset === m.id ? colors.primary : colors.borderSubtle,
                  },
                ]}
              >
                <Text
                  style={{
                    color: meshPreset === m.id ? '#FFF' : colors.textPrimary,
                    fontSize: 12,
                    fontWeight: '700',
                  }}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      )}

      {/* Save Active Diagram to AI Image Library CTA */}
      <TouchableOpacity
        focusable={false}
        onPress={handleSaveToImageLibrary}
        disabled={savingImage}
        style={[
          styles.saveLibBtn,
          {
            backgroundColor: colors.card,
            borderColor: colors.primary,
          },
        ]}
      >
        <BookmarkPlus size={16} color={colors.primary} />
        <Text style={{ fontSize: 13, fontWeight: '800', color: colors.primary }}>
          {savingImage ? 'Exporting SVG Snapshot...' : 'Save Active Diagram to AI Image Library'}
        </Text>
      </TouchableOpacity>

      {/* Educational Notice */}
      <Card style={[styles.infoCard, { backgroundColor: colors.surface }]}>
        <View style={styles.infoRow}>
          <Info size={18} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Interactive 2D functions, conics, IUPAC organic nomenclature, annotated Biology diagrams & 3D SVG wireframe projections saved directly to your AI Image Library.
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32, gap: 14 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  headerTextCol: { flex: 1, paddingRight: 8, minWidth: 0 },
  title: { fontSize: 21, fontWeight: '800' },
  subtitle: { fontSize: 12.5, marginTop: 2 },
  tabScroll: { flexGrow: 0 },
  tabBarScrollContent: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    gap: 6,
  },
  tabBtnChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tabText: { fontSize: 12, fontWeight: '700' },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  canvasCard: { padding: 16 },
  canvasMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  equationLabel: { fontSize: 13.5, fontWeight: '700', flex: 1 },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvasFrame: {
    width: '100%',
    height: GRAPH_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  coordSummaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  controlGroup: { flex: 1 },
  controlLabel: { fontSize: 11.5, fontWeight: '700', marginBottom: 6 },
  btnRow: { flexDirection: 'row', gap: 8 },
  paramBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
  },
  presetRow: { flexDirection: 'row', gap: 8 },
  presetBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  chemVisualBox: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
  },
  chemIupac: { fontSize: 15.5, fontWeight: '800', marginTop: 4, marginBottom: 4, textAlign: 'center' },
  chemDetails: { fontSize: 12, textAlign: 'center', lineHeight: 17 },
  iupacHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  iupacResultBox: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 12,
    marginBottom: 12,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  builderChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
    borderWidth: 1,
  },
  bioNoteBox: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.25,
  },
  saveLibBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  infoCard: { padding: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoText: { fontSize: 12, flex: 1, lineHeight: 17 },
});
