export interface AIResponse {
  text: string;
  steps?: string[];
  tips?: string[];
  isFallback: boolean;
}

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const hasApiKey = Boolean(GEMINI_API_KEY) && !GEMINI_API_KEY.includes('ExampleKey');

export const GeminiAIService = {
  hasApiKey,

  async askTutor(prompt: string, context?: { subject?: string; grade?: string }): Promise<AIResponse> {
    if (hasApiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are the Study Labs AI Master Tutor for ${context?.grade || 'Class 11-12 STEM'} (${context?.subject || 'Science/Math'}). 
Provide clear, step-by-step academic explanations with formulas, key principles, and memory tips.
User Question: ${prompt}`,
                    },
                  ],
                },
              ],
            }),
          }
        );
        const data = await response.json();
        const output = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (output) {
          return { text: output, isFallback: false };
        }
      } catch (err) {
        console.warn('[Study Labs] Gemini API call failed, using intelligent offline tutor engine.', err);
      }
    }

    // Intelligent Offline Knowledge Engine
    return this.generateOfflineEducationalResponse(prompt, context?.subject);
  },

  generateOfflineEducationalResponse(query: string, subject?: string): AIResponse {
    const q = query.toLowerCase();

    if (q.includes('photoelectric') || q.includes('einstein') || q.includes('work function')) {
      return {
        text: `### Photoelectric Effect & Einstein's Equation\n\nWhen light of sufficient frequency strikes a metal surface, electrons are ejected immediately without time lag.\n\n$$\\mathbf{h\\nu = \\Phi_0 + K_{max}}$$\n\nWhere:\n- **$h\\nu$**: Energy of incident photon\n- **$\\Phi_0 = h\\nu_0$**: Metal Work Function (minimum energy required)\n- **$K_{max} = eV_0$**: Maximum Kinetic Energy of ejected photoelectrons ($V_0$ = Stopping Potential)\n\n**Key Takeaways for Exams**:\n1. Emission depends on **frequency** (must exceed threshold $\\nu_0$), NOT intensity.\n2. **Intensity** increases the *rate* of electron emission (current), but does not alter kinetic energy.`,
        steps: [
          'Identify incident photon energy: E = hν = hc/λ (use hc ≈ 1240 eV·nm).',
          'Calculate work function Φ = hν0.',
          'Deduct work function to get maximum kinetic energy: Kmax = E - Φ.',
          'Relate Kmax to stopping potential: V0 = Kmax / e.',
        ],
        tips: ['Watch out for units! Convert between Joules and eV (1 eV = 1.6 × 10⁻¹⁹ J).', 'Stopping potential is independent of the source intensity.'],
        isFallback: true,
      };
    }

    if (q.includes('integration') || q.includes('calculus') || q.includes('derivative') || q.includes('by parts')) {
      return {
        text: `### Integration by Parts Formula (ILATE Rule)\n\n$$\\int u \\cdot v \\, dx = u \\int v \\, dx - \\int \\left( \\frac{du}{dx} \\int v \\, dx \\right) dx$$\n\n**Precedence for selecting $u$ (first function) via ILATE**:\n1. **I**: Inverse Trigonometric ($\\\\arcsin, \\\\arctan$)\n2. **L**: Logarithmic ($\\\\ln x, \\\\log x$)\n3. **A**: Algebraic ($x^2, 3x$)\n4. **T**: Trigonometric ($\\\\sin x, \\\\cos x$)\n5. **E**: Exponential ($e^x, a^x$)`,
        steps: [
          'Assign u to the function earlier in ILATE.',
          'Assign v to the remaining factor including dx.',
          'Differentiate u to find du/dx and integrate v to find ∫v dx.',
          'Substitute into the integration by parts equation and evaluate.',
        ],
        tips: ['If integrating ln(x) or arcsin(x) alone, treat 1 as the algebraic second function: ∫ (ln x · 1) dx.'],
        isFallback: true,
      };
    }

    if (q.includes('sn1') || q.includes('sn2') || q.includes('organic') || q.includes('nucleophilic')) {
      return {
        text: `### SN1 vs SN2 Nucleophilic Substitution Mechanism\n\n| Feature | **SN1 Mechanism** | **SN2 Mechanism** |\n| :--- | :--- | :--- |\n| **Kinetics** | First order: Rate = k[R-X] | Second order: Rate = k[R-X][Nu⁻] |\n| **Steps** | 2 steps (via Carbocation intermediate) | 1 concerted step (Transition State) |\n| **Stereochemistry** | Racemization (inversion + retention) | 100% Walden Inversion |\n| **Substrate Order** | 3° > 2° > 1° > Methyl | Methyl > 1° > 2° > 3° |\n| **Solvent** | Polar Protic (H₂O, EtOH) stabilizes carbocation | Polar Aprotic (Acetone, DMSO, DMF) |\n| **Nucleophile** | Weak nucleophiles suffice (H₂O, MeOH) | Requires strong nucleophile (OH⁻, CN⁻) |`,
        steps: [
          'Check substrate hindrance: 1° strongly favors SN2; 3° strongly favors SN1.',
          'Examine solvent: protic stabilizes carbocation (SN1); aprotic leaves nucleophile naked and reactive (SN2).',
          'Evaluate nucleophile strength and concentration.',
        ],
        tips: ['Watch out for carbocation rearrangements (hydride and methyl shifts) in SN1 reactions!'],
        isFallback: true,
      };
    }

    return {
      text: `### Study Labs AI Academic Synthesis\n\nAnalyzing **"${query}"** in the context of **${subject || 'General STEM'}**:\n\n1. **Core Definition**: Fundamental principles in this topic center around conservation laws, mathematical rigor, and systematic problem breakdown.\n2. **Standard Formula & Relations**: Ensure all dimensional units conform to SI standards before substitution.\n3. **Problem-Solving Strategy**: Draw a clear diagram or coordinate frame, list given values and required target quantities, and select governing equations before numerical computation.\n\n*Tip: Connect your Gemini API key in \`.env\` for live multi-modal generative tutoring across thousands of complex academic questions.*`,
      steps: [
        'Read the question twice and note the required unit/format.',
        'List known parameters and target variable.',
        'Select the fundamental governing formula.',
        'Check extreme cases or dimensional consistency.',
      ],
      tips: ['Consistent daily practice and tracking weak chapters in Study Labs builds exam-winning intuition.'],
      isFallback: true,
    };
  },
};

