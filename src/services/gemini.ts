import type { Question, QuestionDifficulty, ReasoningPower, SubjectId } from '../types';

export type GeminiModelId =
  | 'gemini-flash-lite-latest'
  | 'gemini-flash-latest'
  | 'gemini-pro-latest';

export interface ReasoningModelMeta {
  mode: ReasoningPower;
  modelId?: GeminiModelId;
  label: string;
  shortLabel: string;
  description: string;
}

export const REASONING_POWER_OPTIONS: ReasoningModelMeta[] = [
  {
    mode: 'auto',
    label: 'Auto (Adaptive)',
    shortLabel: 'Auto',
    description: 'Routes Easy → Flash Lite, Medium → Flash, Hard → Pro automatically',
  },
  {
    mode: 'flash-lite',
    modelId: 'gemini-flash-lite-latest',
    label: 'Flash Lite Latest',
    shortLabel: 'Flash Lite',
    description: 'Ultra-fast lookups, definitions, formulas & quick doubts',
  },
  {
    mode: 'flash',
    modelId: 'gemini-flash-latest',
    label: 'Flash Latest',
    shortLabel: 'Flash',
    description: 'Balanced speed & multi-step STEM problem solving',
  },
  {
    mode: 'pro',
    modelId: 'gemini-pro-latest',
    label: 'Pro Latest',
    shortLabel: 'Pro',
    description: 'Maximum reasoning depth for proofs & JEE Advanced problems',
  },
];

export interface ResolvedModelSelection {
  modelId: GeminiModelId;
  modelLabel: string;
  shortLabel: string;
  reasoningMode: ReasoningPower;
  detectedDifficulty: QuestionDifficulty;
  selectionReason: string;
}

export interface AIResponse {
  text: string;
  steps?: string[];
  tips?: string[];
  isFallback: boolean;
  modelId: GeminiModelId;
  modelLabel: string;
  reasoningMode: ReasoningPower;
  detectedDifficulty: QuestionDifficulty;
  selectionReason: string;
}

export interface AskTutorContext {
  subject?: string;
  grade?: string;
  difficulty?: QuestionDifficulty;
  reasoningMode?: ReasoningPower;
}

const MODEL_META_BY_ID: Record<GeminiModelId, { label: string; shortLabel: string }> = {
  'gemini-flash-lite-latest': { label: 'Flash Lite Latest', shortLabel: 'Flash Lite' },
  'gemini-flash-latest': { label: 'Flash Latest', shortLabel: 'Flash' },
  'gemini-pro-latest': { label: 'Pro Latest', shortLabel: 'Pro' },
};

const HARD_CUES =
  /\b(prove|proof|derive|derivation|mechanism|jee\s*advanced|olympiad|stereochemistry|differential\s*equation|eigen|thermodynamic|entropy|schrodinger|hamiltonian|matrix|determinant|induction|contradiction|rigorous|compare\s+and\s+contrast|evaluate\s+the\s+integral|sn1\s+vs\s+sn2|multi[- ]step)\b/i;

const EASY_CUES =
  /^(what\s+is|define|unit\s+of|si\s+unit|value\s+of|atomic\s+number|symbol\s+for|state\s+|formula\s+for|who\s+discovered)/i;

export function classifyQuestionDifficulty(
  prompt: string,
  explicitDifficulty?: QuestionDifficulty
): QuestionDifficulty {
  if (explicitDifficulty) return explicitDifficulty;

  const clean = (prompt || '').trim();
  const hasMultiPart = /\([a-d1-4]\)|[\n].*[\n]/i.test(clean) || (clean.match(/\?/g) || []).length >= 2;
  const latexCount = (clean.match(/(\$|\\frac|\\int|\\sum|\\vec|\\sqrt)/g) || []).length;

  if (HARD_CUES.test(clean) || hasMultiPart || clean.length >= 165 || latexCount >= 3) {
    return 'Hard';
  }

  if (
    (EASY_CUES.test(clean) && clean.length <= 90) ||
    (clean.length <= 42 && !/\b(solve|calculate|find|explain|integral|moment\s+of\s+inertia)\b/i.test(clean))
  ) {
    return 'Easy';
  }

  return 'Medium';
}

export function resolveModelForPrompt(
  reasoningMode: ReasoningPower,
  prompt: string,
  explicitDifficulty?: QuestionDifficulty
): ResolvedModelSelection {
  const detectedDifficulty = classifyQuestionDifficulty(prompt, explicitDifficulty);

  if (reasoningMode === 'flash-lite') {
    const modelId: GeminiModelId = 'gemini-flash-lite-latest';
    return {
      modelId,
      ...MODEL_META_BY_ID[modelId],
      modelLabel: MODEL_META_BY_ID[modelId].label,
      reasoningMode,
      detectedDifficulty,
      selectionReason: 'Manual selection: Flash Lite Latest',
    };
  }

  if (reasoningMode === 'flash') {
    const modelId: GeminiModelId = 'gemini-flash-latest';
    return {
      modelId,
      modelLabel: MODEL_META_BY_ID[modelId].label,
      shortLabel: MODEL_META_BY_ID[modelId].shortLabel,
      reasoningMode,
      detectedDifficulty,
      selectionReason: 'Manual selection: Flash Latest',
    };
  }

  if (reasoningMode === 'pro') {
    const modelId: GeminiModelId = 'gemini-pro-latest';
    return {
      modelId,
      modelLabel: MODEL_META_BY_ID[modelId].label,
      shortLabel: MODEL_META_BY_ID[modelId].shortLabel,
      reasoningMode,
      detectedDifficulty,
      selectionReason: 'Manual selection: Pro Latest',
    };
  }

  // Adaptive Auto mode based on question difficulty
  let modelId: GeminiModelId = 'gemini-flash-latest';
  if (detectedDifficulty === 'Easy') {
    modelId = 'gemini-flash-lite-latest';
  } else if (detectedDifficulty === 'Hard') {
    modelId = 'gemini-pro-latest';
  }

  return {
    modelId,
    modelLabel: MODEL_META_BY_ID[modelId].label,
    shortLabel: MODEL_META_BY_ID[modelId].shortLabel,
    reasoningMode: 'auto',
    detectedDifficulty,
    selectionReason: `Auto (${detectedDifficulty} question → ${MODEL_META_BY_ID[modelId].shortLabel})`,
  };
}

const GEMINI_API_KEY = (process.env.EXPO_PUBLIC_GEMINI_API_KEY || '').trim();
const hasApiKey =
  Boolean(GEMINI_API_KEY) &&
  !GEMINI_API_KEY.includes('your-gemini-api-key') &&
  !GEMINI_API_KEY.includes('ExampleKey');

async function requestGeminiEndpoint(
  modelId: GeminiModelId,
  promptText: string
): Promise<string | null> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: promptText }],
          },
        ],
        generationConfig: {
          temperature: modelId === 'gemini-pro-latest' ? 0.3 : 0.4,
          maxOutputTokens: 2048,
        },
      }),
    }
  );

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(`Gemini HTTP ${response.status}: ${errBody.slice(0, 180)}`);
  }

  const data = await response.json();
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return null;

  const text = parts
    .map((p: any) => (typeof p?.text === 'string' ? p.text : ''))
    .filter(Boolean)
    .join('\n')
    .trim();

  return text || null;
}

export const GeminiAIService = {
  hasApiKey,
  classifyQuestionDifficulty,
  resolveModelForPrompt,

  async askTutor(prompt: string, context?: AskTutorContext): Promise<AIResponse> {
    const mode: ReasoningPower = context?.reasoningMode || 'auto';
    const resolved = resolveModelForPrompt(mode, prompt, context?.difficulty);

    const depthInstruction =
      resolved.modelId === 'gemini-flash-lite-latest'
        ? 'Keep your explanation crisp, clear, and concise (key definition, essential equation, final result).'
        : resolved.modelId === 'gemini-pro-latest'
        ? 'Provide deep first-principles reasoning, full mathematical derivations, edge cases, and competitive-exam pitfalls.'
        : 'Provide a balanced, structured step-by-step academic explanation with core formulas and exam tips.';

    const engineeredPrompt = [
      `You are the Study Labs AI Master Tutor for ${context?.grade || 'Class 11-12 STEM'} (${context?.subject || 'Science & Math'}).`,
      depthInstruction,
      'Formatting rules:',
      '- Use valid LaTeX delimiters strictly: $...$ for inline formulas/symbols and $$...$$ on its own line for block equations.',
      '- Use clean Markdown headings (###), bullet lists, and bold emphasis for readability.',
      '',
      `User Question: ${prompt}`,
    ].join('\n');

    if (hasApiKey) {
      try {
        const output = await requestGeminiEndpoint(resolved.modelId, engineeredPrompt);
        if (output) {
          return {
            text: output,
            isFallback: false,
            modelId: resolved.modelId,
            modelLabel: resolved.modelLabel,
            reasoningMode: resolved.reasoningMode,
            detectedDifficulty: resolved.detectedDifficulty,
            selectionReason: resolved.selectionReason,
          };
        }
      } catch (err: any) {
        const isRateLimit = String(err?.message || '').includes('429');
        // In adaptive Auto mode, or when Pro hits free-tier HTTP 429 rate limit, fall back live to Flash Latest
        if ((mode === 'auto' || isRateLimit) && resolved.modelId !== 'gemini-flash-latest') {
          try {
            const fallbackModel: GeminiModelId = 'gemini-flash-latest';
            const output = await requestGeminiEndpoint(fallbackModel, engineeredPrompt);
            if (output) {
              return {
                text: output,
                isFallback: false,
                modelId: fallbackModel,
                modelLabel: isRateLimit
                  ? `${MODEL_META_BY_ID[fallbackModel].label} (429 Fallback)`
                  : MODEL_META_BY_ID[fallbackModel].label,
                reasoningMode: resolved.reasoningMode,
                detectedDifficulty: resolved.detectedDifficulty,
                selectionReason: isRateLimit
                  ? `${resolved.shortLabel} hit HTTP 429 quota → served live by Flash`
                  : `Auto fallback (${resolved.detectedDifficulty} → Flash)`,
              };
            }
          } catch {
            // Fall through to local offline STEM engine
          }
        }
        console.warn('[Study Labs] Gemini API unavailable, using offline STEM tutor engine.', err);
      }
    }

    return this.generateOfflineEducationalResponse(prompt, context?.subject, resolved);
  },

  generateOfflineEducationalResponse(
    query: string,
    subject?: string,
    resolved?: ResolvedModelSelection
  ): AIResponse {
    const modelMeta = resolved || resolveModelForPrompt('auto', query);
    const q = query.toLowerCase();

    if (q.includes('photoelectric') || q.includes('einstein') || q.includes('work function')) {
      return {
        text:
          '### Photoelectric Effect & Einstein\'s Equation\n\n' +
          'When light of sufficient frequency strikes a metal surface, electrons are ejected instantaneously without measurable time lag.\n\n' +
          '$$h\\nu = \\Phi_0 + K_{\\max}$$\n\n' +
          '- **$h\\nu$**: Energy of each incident photon ($h\\nu = \\frac{hc}{\\lambda}$)\n' +
          '- **$\\Phi_0 = h\\nu_0$**: Work function (minimum threshold energy for emission)\n' +
          '- **$K_{\\max} = eV_0$**: Maximum kinetic energy ($V_0$ = Stopping Potential)\n\n' +
          '**Key Exam Takeaways**:\n' +
          '1. Emission occurs only when incident frequency $\\nu \\ge \\nu_0$, regardless of intensity.\n' +
          '2. Higher **intensity** increases photon flux and photocurrent, without changing $K_{\\max}$ or $V_0$.',
        steps: [
          'Compute incident photon energy: $E = h\\nu = \\frac{hc}{\\lambda}$ (shortcut: $hc \\approx 1240\\text{ eV}\\cdot\\text{nm}$).',
          'Calculate the threshold work function: $\\Phi_0 = h\\nu_0$.',
          'Apply energy conservation: $K_{\\max} = h\\nu - \\Phi_0$.',
          'Relate to stopping potential: $eV_0 = K_{\\max} \\implies V_0 = \\frac{K_{\\max}}{e}$.',
        ],
        tips: [
          'Always match units between Joules and electron-volts ($1\\text{ eV} = 1.6 \\times 10^{-19}\\text{ J}$).',
          'Stopping potential $V_0$ increases linearly with frequency $\\nu$, with slope $\\frac{h}{e}$.',
        ],
        isFallback: true,
        ...modelMeta,
      };
    }

    if (q.includes('integration') || q.includes('calculus') || q.includes('derivative') || q.includes('by parts')) {
      return {
        text:
          '### Integration by Parts (ILATE Rule)\n\n' +
          '$$\\int u \\cdot v\\,dx = u \\int v\\,dx - \\int \\left(\\frac{du}{dx} \\int v\\,dx\\right)dx$$\n\n' +
          '**Priority order for choosing the first function $u$ (ILATE)**:\n' +
          '1. **I** — Inverse Trigonometric ($\\arcsin x, \\arctan x$)\n' +
          '2. **L** — Logarithmic ($\\ln x, \\log x$)\n' +
          '3. **A** — Algebraic ($x^2, 3x + 1$)\n' +
          '4. **T** — Trigonometric ($\\sin x, \\cos x$)\n' +
          '5. **E** — Exponential ($e^x, a^x$)',
        steps: [
          'Assign $u$ to whichever factor appears earlier in the **ILATE** hierarchy.',
          'Assign $v$ to the remaining factor.',
          'Compute the derivative $\\frac{du}{dx}$ and integral $\\int v\\,dx$.',
          'Substitute into $u\\int v\\,dx - \\int u\'(\\int v\\,dx)\\,dx$ and simplify.',
        ],
        tips: [
          'When integrating $\\ln x$ or $\\arctan x$ alone, introduce $v = 1$ as the algebraic second function: $\\int (\\ln x \\cdot 1)\\,dx$.',
          'For cyclic integrals like $\\int e^x\\sin x\\,dx$, apply by parts twice and solve algebraically for $I$.',
        ],
        isFallback: true,
        ...modelMeta,
      };
    }

    if (q.includes('sn1') || q.includes('sn2') || q.includes('organic') || q.includes('nucleophilic')) {
      return {
        text:
          '### $\\text{S}_\\text{N}1$ vs $\\text{S}_\\text{N}2$ Nucleophilic Substitution\n\n' +
          '| Feature | **$\\text{S}_\\text{N}1$ Mechanism** | **$\\text{S}_\\text{N}2$ Mechanism** |\n' +
          '| :--- | :--- | :--- |\n' +
          '| **Rate Law** | First order: $r = k[\\text{R-X}]$ | Second order: $r = k[\\text{R-X}][\\text{Nu}^-]$ |\n' +
          '| **Steps** | 2 steps via carbocation | 1 concerted backside step |\n' +
          '| **Stereochemistry** | Racemization | $100\\%$ Walden Inversion |\n' +
          '| **Substrate Order** | $3^\\circ > 2^\\circ > 1^\\circ > \\text{CH}_3\\text{X}$ | $\\text{CH}_3\\text{X} > 1^\\circ > 2^\\circ > 3^\\circ$ |\n' +
          '| **Preferred Solvent** | Polar protic ($\\text{H}_2\\text{O}, \\text{EtOH}$) | Polar aprotic ($\\text{DMSO}, \\text{DMF}$) |',
        steps: [
          'Inspect substrate steric hindrance: $1^\\circ$ strongly favors $\\text{S}_\\text{N}2$; $3^\\circ$ or benzylic/allylic favors $\\text{S}_\\text{N}1$.',
          'Check solvent polarity: polar aprotic solvents leave anions unsolvated ($\\text{S}_\\text{N}2$); polar protic stabilizes carbocations ($\\text{S}_\\text{N}1$).',
          'Identify nucleophile strength and check leaving-group ability ($\\text{I}^- > \\text{Br}^- > \\text{Cl}^- \\gg \\text{F}^-$).',
        ],
        tips: [
          'Always check for $1,2$-hydride or methyl shifts when a carbocation intermediate forms in $\\text{S}_\\text{N}1$.',
        ],
        isFallback: true,
        ...modelMeta,
      };
    }

    if (q.includes('moment of inertia') || q.includes('disc') || q.includes('cylinder') || q.includes('rolling')) {
      return {
        text:
          '### Moment of Inertia of a Uniform Circular Disc\n\n' +
          'For a uniform solid disc of mass $M$ and radius $R$, the moment of inertia about the central axis perpendicular to its plane is:\n\n' +
          '$$I_{\\text{axis}} = \\int_0^R r^2\\,dm = \\int_0^R r^2 \\left(\\frac{M}{\\pi R^2} \\cdot 2\\pi r\\,dr\\right) = \\frac{1}{2}MR^2$$\n\n' +
          '**Important Axis Variants**:\n' +
          '- **About a diameter** (by Perpendicular Axis Theorem $I_z = I_x + I_y$): $I_{\\text{dia}} = \\frac{1}{4}MR^2$\n' +
          '- **About a tangent in its plane** (Parallel Axis Theorem): $I = \\frac{1}{4}MR^2 + MR^2 = \\frac{5}{4}MR^2$\n' +
          '- **Rolling acceleration on incline $\\theta$**: $a = \\frac{g\\sin\\theta}{1 + I/(MR^2)} = \\frac{2}{3}g\\sin\\theta$',
        steps: [
          'Break the disc into concentric thin rings of radius $r$ and width $dr$ with area $dA = 2\\pi r\\,dr$.',
          'Express elemental mass $dm = \\sigma\\,dA = \\frac{2M}{R^2} r\\,dr$.',
          'Integrate $dI = r^2\\,dm$ from $r = 0$ to $r = R$ to obtain $I = \\frac{1}{2}MR^2$.',
        ],
        tips: [
          'A solid cylinder has the exact same cross-sectional distribution as stacked discs, so its central-axis moment of inertia is also $\\frac{1}{2}MR^2$.',
        ],
        isFallback: true,
        ...modelMeta,
      };
    }

    return {
      text:
        `### Study Labs AI Academic Breakdown\n\n` +
        `Analyzing **"${query}"** in **${subject || 'General STEM'}** (*${modelMeta.shortLabel}*):\n\n` +
        `1. **Core Principle**: Identify the governing conservation law or invariant relationship before substituting numbers.\n` +
        `2. **Symbolic Setup**: Express known quantities consistently in SI base units ($\\text{m}, \\text{kg}, \\text{s}, \\text{mol}, \\text{K}$).\n` +
        `3. **Verification Check**: Verify dimensional consistency and boundary limits (e.g., $\\theta \\to 0$ or $r \\to \\infty$).`,
      steps: [
        'Write down all given values and target unknown clearly with units.',
        'Sketch a free-body diagram, circuit, or reaction coordinate to avoid sign mistakes.',
        'Derive the symbolic expression first, then plug in numerical values.',
        'Cross-check dimensions of your final result.',
      ],
      tips: [
        'In multi-step JEE/NEET numericals, retain symbolic fractions like $\\frac{\\pi}{4}$ or $\\sqrt{2}$ until the final calculation step.',
      ],
      isFallback: true,
      ...modelMeta,
    };
  },

  async generateCustomQuestions(params: {
    subjectIds: SubjectId[];
    difficulties: QuestionDifficulty[];
    count: number;
    topicHint?: string;
    reasoningMode?: ReasoningPower;
  }): Promise<{ questions: Question[]; isFallback: boolean; modelLabel: string }> {
    const {
      subjectIds,
      difficulties,
      count,
      topicHint,
      reasoningMode = 'flash',
    } = params;

    if (subjectIds.length === 0 || difficulties.length === 0) {
      return { questions: [], isFallback: true, modelLabel: 'Offline Generator' };
    }

    const safeCount = Math.max(1, Math.min(10, count));
    const resolved = resolveModelForPrompt(
      reasoningMode === 'auto' ? 'flash' : reasoningMode,
      topicHint || subjectIds.join(', '),
      difficulties.includes('Hard') ? 'Hard' : difficulties.includes('Medium') ? 'Medium' : 'Easy'
    );

    if (hasApiKey) {
      try {
        const prompt = [
          `Generate ${safeCount} original, non-duplicate JEE/NEET/Class-12 single-choice MCQ questions.`,
          `Allowed subjects ONLY: ${subjectIds.join(', ')}.`,
          `Allowed difficulties ONLY: ${difficulties.join(', ')}.`,
          topicHint?.trim() ? `Focus topic / title hint: ${topicHint.trim()}` : '',
          'Use LaTeX $...$ inside prompt, options, hints, and explanation.',
          'Return STRICT valid JSON array ONLY (no markdown fences) matching this exact schema:',
          `[{"subjectId":"physics|chemistry|math|biology","difficulty":"Easy|Medium|Hard","prompt":"...","options":[{"id":"a","text":"...","isCorrect":false},{"id":"b","text":"...","isCorrect":true},{"id":"c","text":"...","isCorrect":false},{"id":"d","text":"...","isCorrect":false}],"explanation":"...","hints":[{"category":"concept","title":"Core Concept","content":"..."},{"category":"formula","title":"Key Formula","content":"..."}]}]`,
        ]
          .filter(Boolean)
          .join('\n');

        const raw = await requestGeminiEndpoint(resolved.modelId, prompt);
        if (raw) {
          const cleaned = raw
            .replace(/^```(?:json)?/i, '')
            .replace(/```$/i, '')
            .trim();
          const parsed = JSON.parse(cleaned);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const stamp = Date.now();
            const normalized: Question[] = parsed
              .slice(0, safeCount)
              .map((item: any, idx: number): Question | null => {
                const sub = subjectIds.includes(item?.subjectId)
                  ? item.subjectId
                  : subjectIds[idx % subjectIds.length];
                const diff = difficulties.includes(item?.difficulty)
                  ? item.difficulty
                  : difficulties[idx % difficulties.length];
                const opts = Array.isArray(item?.options)
                  ? item.options.slice(0, 4).map((o: any, oi: number) => ({
                      id: String(o?.id || ['a', 'b', 'c', 'd'][oi]),
                      text: String(o?.text || `Option ${oi + 1}`),
                      isCorrect: Boolean(o?.isCorrect),
                    }))
                  : [];
                if (!item?.prompt || opts.length < 2) return null;
                if (!opts.some((o: any) => o.isCorrect)) opts[0].isCorrect = true;
                return {
                  id: `q_ai_${stamp}_${idx}`,
                  chapterId: 'ch_ai_custom',
                  subjectId: sub,
                  type: 'single_mcq',
                  prompt: String(item.prompt),
                  options: opts,
                  explanation: String(item.explanation || 'Solved step by step using core principles.'),
                  hints: Array.isArray(item?.hints)
                    ? item.hints.map((h: any, hi: number) => ({
                        id: `h_ai_${stamp}_${idx}_${hi}`,
                        category: h?.category || 'concept',
                        title: String(h?.title || `Hint ${hi + 1}`),
                        content: String(h?.content || ''),
                      }))
                    : undefined,
                  difficulty: diff,
                  examOrigin: `AI Custom (${resolved.shortLabel})`,
                  year: 2026,
                };
              })
              .filter((q): q is Question => q !== null);

            if (normalized.length > 0) {
              return {
                questions: normalized,
                isFallback: false,
                modelLabel: resolved.modelLabel,
              };
            }
          }
        }
      } catch (err) {
        console.warn('[Study Labs] AI question generation fell back offline:', err);
      }
    }

    // Deterministic Offline STEM Generator matching exact subjectIds & difficulties
    const stamp = Date.now();
    const BANK: Record<SubjectId, Record<QuestionDifficulty, Array<Omit<Question, 'id' | 'chapterId'>>>> = {
      physics: {
        Easy: [
          {
            subjectId: 'physics',
            difficulty: 'Easy',
            type: 'single_mcq',
            prompt: 'A body of mass $2\\text{ kg}$ moves with uniform velocity $5\\text{ m/s}$. What is its kinetic energy?',
            options: [
              { id: 'a', text: '$10\\text{ J}$', isCorrect: false },
              { id: 'b', text: '$25\\text{ J}$', isCorrect: true },
              { id: 'c', text: '$50\\text{ J}$', isCorrect: false },
              { id: 'd', text: '$12.5\\text{ J}$', isCorrect: false },
            ],
            explanation: 'Using $K = \\frac{1}{2}mv^2 = \\frac{1}{2}(2)(5)^2 = 25\\text{ J}$.',
            hints: [{ id: 'h1', category: 'formula', title: 'Kinetic Energy', content: 'Recall $K = \\frac{1}{2}mv^2$.' }],
            examOrigin: 'Study Labs Offline Bank',
          },
          {
            subjectId: 'physics',
            difficulty: 'Easy',
            type: 'single_mcq',
            prompt: 'Two resistors of $6\\,\\Omega$ and $3\\,\\Omega$ are connected in parallel. The equivalent resistance is:',
            options: [
              { id: 'a', text: '$9\\,\\Omega$', isCorrect: false },
              { id: 'b', text: '$2\\,\\Omega$', isCorrect: true },
              { id: 'c', text: '$4.5\\,\\Omega$', isCorrect: false },
              { id: 'd', text: '$18\\,\\Omega$', isCorrect: false },
            ],
            explanation: 'In parallel, $R_{\\text{eq}} = \\frac{R_1 R_2}{R_1 + R_2} = \\frac{6 \\times 3}{6 + 3} = 2\\,\\Omega$.',
            hints: [{ id: 'h2', category: 'formula', title: 'Parallel Resistors', content: '$\\frac{1}{R_{\\text{eq}}} = \\frac{1}{R_1} + \\frac{1}{R_2}$.' }],
            examOrigin: 'Study Labs Offline Bank',
          },
        ],
        Medium: [
          {
            subjectId: 'physics',
            difficulty: 'Medium',
            type: 'single_mcq',
            prompt: 'A projectile is launched at $45^\\circ$ with speed $u$. At the highest point of its trajectory, its kinetic energy is $K_0$. What is its initial kinetic energy?',
            options: [
              { id: 'a', text: '$K_0$', isCorrect: false },
              { id: 'b', text: '$\\sqrt{2}K_0$', isCorrect: false },
              { id: 'c', text: '$2K_0$', isCorrect: true },
              { id: 'd', text: '$4K_0$', isCorrect: false },
            ],
            explanation: 'At the peak, $v_x = u\\cos 45^\\circ = \\frac{u}{\\sqrt{2}}$, so $K_0 = \\frac{1}{2}m(u^2/2) = \\frac{1}{2}K_{\\text{init}} \\implies K_{\\text{init}} = 2K_0$.',
            hints: [{ id: 'h3', category: 'concept', title: 'Peak Velocity', content: 'Vertical velocity vanishes at peak; only horizontal $u\\cos\\theta$ remains.' }],
            examOrigin: 'Study Labs Offline Bank',
          },
        ],
        Hard: [
          {
            subjectId: 'physics',
            difficulty: 'Hard',
            type: 'single_mcq',
            prompt: 'A particle executes SHM with amplitude $A$. At what displacement $x$ from the mean position are kinetic and potential energies equal?',
            options: [
              { id: 'a', text: '$\\pm\\frac{A}{2}$', isCorrect: false },
              { id: 'b', text: '$\\pm\\frac{A}{\\sqrt{2}}$', isCorrect: true },
              { id: 'c', text: '$\\pm\\frac{A}{\\sqrt{3}}$', isCorrect: false },
              { id: 'd', text: '$\\pm\\frac{\\sqrt{3}A}{2}$', isCorrect: false },
            ],
            explanation: 'Since $K = \\frac{1}{2}k(A^2 - x^2)$ and $U = \\frac{1}{2}kx^2$, setting $K = U$ gives $A^2 - x^2 = x^2 \\implies x = \\pm\\frac{A}{\\sqrt{2}}$.',
            hints: [{ id: 'h4', category: 'formula', title: 'SHM Energy', content: 'Set $\\frac{1}{2}kx^2 = \\frac{1}{2}k(A^2 - x^2)$.' }],
            examOrigin: 'Study Labs Offline Bank',
          },
        ],
      },
      chemistry: {
        Easy: [
          {
            subjectId: 'chemistry',
            difficulty: 'Easy',
            type: 'single_mcq',
            prompt: 'What is the $\\text{pH}$ of a $10^{-3}\\text{ M}$ aqueous $\\text{HCl}$ solution at $298\\text{ K}$?',
            options: [
              { id: 'a', text: '$1$', isCorrect: false },
              { id: 'b', text: '$3$', isCorrect: true },
              { id: 'c', text: '$11$', isCorrect: false },
              { id: 'd', text: '$2$', isCorrect: false },
            ],
            explanation: '$\\text{HCl}$ is a strong monoprotic acid: $[\\text{H}^+] = 10^{-3}\\text{ M} \\implies \\text{pH} = -\\log_{10}(10^{-3}) = 3$.',
            hints: [{ id: 'h5', category: 'formula', title: 'pH Definition', content: '$\\text{pH} = -\\log_{10}[\\text{H}^+]$.' }],
            examOrigin: 'Study Labs Offline Bank',
          },
        ],
        Medium: [
          {
            subjectId: 'chemistry',
            difficulty: 'Medium',
            type: 'single_mcq',
            prompt: 'For the reaction $\\text{N}_2(g) + 3\\text{H}_2(g) \\rightleftharpoons 2\\text{NH}_3(g)$, how are $K_p$ and $K_c$ related?',
            options: [
              { id: 'a', text: '$K_p = K_c(RT)^2$', isCorrect: false },
              { id: 'b', text: '$K_p = K_c(RT)^{-2}$', isCorrect: true },
              { id: 'c', text: '$K_p = K_c(RT)^{-1}$', isCorrect: false },
              { id: 'd', text: '$K_p = K_c$', isCorrect: false },
            ],
            explanation: '$\\Delta n_g = 2 - (1 + 3) = -2$. Using $K_p = K_c(RT)^{\\Delta n_g}$, we obtain $K_p = K_c(RT)^{-2}$.',
            hints: [{ id: 'h6', category: 'formula', title: 'Kp vs Kc', content: 'Compute $\\Delta n_g = \\text{gaseous products} - \\text{gaseous reactants}$.' }],
            examOrigin: 'Study Labs Offline Bank',
          },
        ],
        Hard: [
          {
            subjectId: 'chemistry',
            difficulty: 'Hard',
            type: 'single_mcq',
            prompt: 'For a first-order reaction, what fraction of the initial reactant remains after a time equal to $3t_{1/2}$?',
            options: [
              { id: 'a', text: '$\\frac{1}{4}$', isCorrect: false },
              { id: 'b', text: '$\\frac{1}{8}$', isCorrect: true },
              { id: 'c', text: '$\\frac{1}{6}$', isCorrect: false },
              { id: 'd', text: '$\\frac{1}{16}$', isCorrect: false },
            ],
            explanation: 'After $n$ half-lives, $[A]_t = [A]_0 (1/2)^n$. For $n = 3$, fraction left is $(1/2)^3 = \\frac{1}{8}$.',
            hints: [{ id: 'h7', category: 'concept', title: 'Half-life Scaling', content: 'First-order half-life is independent of initial concentration.' }],
            examOrigin: 'Study Labs Offline Bank',
          },
        ],
      },
      math: {
        Easy: [
          {
            subjectId: 'math',
            difficulty: 'Easy',
            type: 'single_mcq',
            prompt: 'Evaluate $\\lim_{x \\to 0} \\frac{\\sin 5x}{x}$.',
            options: [
              { id: 'a', text: '$1$', isCorrect: false },
              { id: 'b', text: '$5$', isCorrect: true },
              { id: 'c', text: '$\\frac{1}{5}$', isCorrect: false },
              { id: 'd', text: '$0$', isCorrect: false },
            ],
            explanation: 'Write $\\frac{\\sin 5x}{x} = 5 \\cdot \\frac{\\sin 5x}{5x}$. As $x \\to 0$, limit is $5 \\times 1 = 5$.',
            hints: [{ id: 'h8', category: 'formula', title: 'Standard Trig Limit', content: 'Use $\\lim_{\\theta\\to 0}\\frac{\\sin\\theta}{\\theta} = 1$.' }],
            examOrigin: 'Study Labs Offline Bank',
          },
        ],
        Medium: [
          {
            subjectId: 'math',
            difficulty: 'Medium',
            type: 'single_mcq',
            prompt: 'If $\\alpha, \\beta$ are the roots of $x^2 - 5x + 6 = 0$, find $\\alpha^2 + \\beta^2$.',
            options: [
              { id: 'a', text: '$13$', isCorrect: true },
              { id: 'b', text: '$25$', isCorrect: false },
              { id: 'c', text: '$19$', isCorrect: false },
              { id: 'd', text: '$31$', isCorrect: false },
            ],
            explanation: '$\\alpha + \\beta = 5$ and $\\alpha\\beta = 6$. Therefore $\\alpha^2 + \\beta^2 = (\\alpha+\\beta)^2 - 2\\alpha\\beta = 25 - 12 = 13$.',
            hints: [{ id: 'h9', category: 'formula', title: 'Vieta Formulas', content: 'Express $\\alpha^2 + \\beta^2$ via sum and product of roots.' }],
            examOrigin: 'Study Labs Offline Bank',
          },
        ],
        Hard: [
          {
            subjectId: 'math',
            difficulty: 'Hard',
            type: 'single_mcq',
            prompt: 'Evaluate the definite integral $\\int_0^{\\pi/2} \\frac{\\sqrt{\\sin x}}{\\sqrt{\\sin x} + \\sqrt{\\cos x}}\\,dx$.',
            options: [
              { id: 'a', text: '$\\frac{\\pi}{2}$', isCorrect: false },
              { id: 'b', text: '$\\frac{\\pi}{4}$', isCorrect: true },
              { id: 'c', text: '$\\frac{\\pi}{6}$', isCorrect: false },
              { id: 'd', text: '$1$', isCorrect: false },
            ],
            explanation: 'Applying King\'s property $x \\mapsto \\frac{\\pi}{2} - x$ and adding gives $2I = \\int_0^{\\pi/2} 1\\,dx = \\frac{\\pi}{2} \\implies I = \\frac{\\pi}{4}$.',
            hints: [{ id: 'h10', category: 'strategy', title: 'King Property', content: 'Substitute $x \\to \\frac{\\pi}{2} - x$ and add $I + I$.' }],
            examOrigin: 'Study Labs Offline Bank',
          },
        ],
      },
      biology: {
        Easy: [
          {
            subjectId: 'biology',
            difficulty: 'Easy',
            type: 'single_mcq',
            prompt: 'Which cell organelle possesses its own circular DNA and $70\\text{S}$ ribosomes in animal cells?',
            options: [
              { id: 'a', text: 'Golgi apparatus', isCorrect: false },
              { id: 'b', text: 'Mitochondria', isCorrect: true },
              { id: 'c', text: 'Lysosome', isCorrect: false },
              { id: 'd', text: 'Peroxisome', isCorrect: false },
            ],
            explanation: 'Mitochondria are semi-autonomous organelles containing circular DNA and $70\\text{S}$ ribosomes.',
            hints: [{ id: 'h11', category: 'concept', title: 'Endosymbiotic Theory', content: 'Think of the powerhouse organelle with prokaryotic-like $70\\text{S}$ ribosomes.' }],
            examOrigin: 'Study Labs Offline Bank',
          },
        ],
        Medium: [
          {
            subjectId: 'biology',
            difficulty: 'Medium',
            type: 'single_mcq',
            prompt: 'During DNA replication, Okazaki fragments on the lagging strand are joined by which enzyme?',
            options: [
              { id: 'a', text: 'DNA helicase', isCorrect: false },
              { id: 'b', text: 'DNA ligase', isCorrect: true },
              { id: 'c', text: 'RNA primase', isCorrect: false },
              { id: 'd', text: 'Topoisomerase', isCorrect: false },
            ],
            explanation: 'DNA ligase catalyzes phosphodiester bond formation to seal nicks between Okazaki fragments.',
            hints: [{ id: 'h12', category: 'concept', title: 'Lagging Strand Synthesis', content: 'Which enzyme seals phosphodiester breaks between adjacent DNA fragments?' }],
            examOrigin: 'Study Labs Offline Bank',
          },
        ],
        Hard: [
          {
            subjectId: 'biology',
            difficulty: 'Hard',
            type: 'single_mcq',
            prompt: 'In the Hardy-Weinberg equilibrium equation $p^2 + 2pq + q^2 = 1$, if the recessive allele frequency $q = 0.2$, what percentage of the population is heterozygous carriers ($2pq$)?',
            options: [
              { id: 'a', text: '$16\\%$', isCorrect: false },
              { id: 'b', text: '$32\\%$', isCorrect: true },
              { id: 'c', text: '$64\\%$', isCorrect: false },
              { id: 'd', text: '$4\\%$', isCorrect: false },
            ],
            explanation: 'With $q = 0.2$, $p = 1 - q = 0.8$. Heterozygote frequency is $2pq = 2(0.8)(0.2) = 0.32 = 32\\%$.',
            hints: [{ id: 'h13', category: 'formula', title: 'Population Genetics', content: 'Compute $p = 1 - q$ first, then evaluate $2pq$.' }],
            examOrigin: 'Study Labs Offline Bank',
          },
        ],
      },
    };

    const generated: Question[] = [];
    for (let i = 0; i < safeCount; i++) {
      const sub = subjectIds[i % subjectIds.length];
      const diff = difficulties[Math.floor(i / subjectIds.length) % difficulties.length];
      const pool = BANK[sub][diff];
      const tpl = pool[i % pool.length];
      generated.push({
        ...tpl,
        id: `q_gen_${stamp}_${i}`,
        chapterId: `ch_gen_${sub}`,
      });
    }

    return {
      questions: generated,
      isFallback: true,
      modelLabel: 'Offline Custom Builder',
    };
  },
};
