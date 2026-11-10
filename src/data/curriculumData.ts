import type { Chapter, FormulaItem, Question, Subject } from '../types';

export const SUBJECTS: Subject[] = [
  {
    id: 'physics',
    name: 'Physics',
    icon: 'Atom',
    color: '#0284C7',
    totalChapters: 28,
    completedChapters: 19,
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    icon: 'FlaskConical',
    color: '#10B981',
    totalChapters: 30,
    completedChapters: 22,
  },
  {
    id: 'math',
    name: 'Mathematics',
    icon: 'FunctionSquare',
    color: '#8B5CF6',
    totalChapters: 26,
    completedChapters: 17,
  },
  {
    id: 'biology',
    name: 'Biology',
    icon: 'Dna',
    color: '#EC4899',
    totalChapters: 38,
    completedChapters: 25,
  },
];

export interface ExamBankPreset {
  id: string;
  name: string;
  subtitle: string;
  stream: 'Engineering' | 'Medical' | 'Boards';
  accent: string;
  defaultSubject: Subject['id'];
}

export const EXAM_BANK_PRESETS: ExamBankPreset[] = [
  {
    id: 'jee_main',
    name: 'JEE Main',
    subtitle: '2019 - 2026 Drills',
    stream: 'Engineering',
    accent: '#F97316',
    defaultSubject: 'physics',
  },
  {
    id: 'jee_adv',
    name: 'JEE Advanced',
    subtitle: 'Multi-Concept Depth',
    stream: 'Engineering',
    accent: '#A855F7',
    defaultSubject: 'math',
  },
  {
    id: 'neet',
    name: 'NEET UG',
    subtitle: 'NCERT & Concept Bank',
    stream: 'Medical',
    accent: '#10B981',
    defaultSubject: 'biology',
  },
  {
    id: 'bitsat',
    name: 'BITSAT Prep',
    subtitle: 'Speed & Accuracy',
    stream: 'Engineering',
    accent: '#22D3EE',
    defaultSubject: 'math',
  },
  {
    id: 'mht_cet',
    name: 'MHT CET',
    subtitle: 'Formula Intensive',
    stream: 'Engineering',
    accent: '#FACC15',
    defaultSubject: 'chemistry',
  },
  {
    id: 'cbse_boards',
    name: 'CBSE Boards',
    subtitle: 'NCERT Stepwise Proofs',
    stream: 'Boards',
    accent: '#3B82F6',
    defaultSubject: 'physics',
  },
];

export const CHAPTERS: Chapter[] = [
  // Physics
  {
    id: 'ch_p_01',
    subjectId: 'physics',
    title: 'Rotational Motion & Moment of Inertia',
    chapterNumber: 7,
    totalQuestions: 145,
    completedQuestions: 98,
    highYield: true,
    topics: [
      { id: 'top_p1', chapterId: 'ch_p_01', title: 'Torque and Angular Momentum Conservation', isCompleted: true, revisionCount: 3, notesAvailable: true, pyqCount: 42 },
      { id: 'top_p2', chapterId: 'ch_p_01', title: 'Moment of Inertia & Parallel Axis Theorem', isCompleted: true, revisionCount: 2, notesAvailable: true, pyqCount: 51 },
      { id: 'top_p3', chapterId: 'ch_p_01', title: 'Rolling Motion on Inclined Planes', isCompleted: false, revisionCount: 1, notesAvailable: true, pyqCount: 52 },
    ],
  },
  {
    id: 'ch_p_02',
    subjectId: 'physics',
    title: 'Electrostatics & Electric Potential',
    chapterNumber: 12,
    totalQuestions: 160,
    completedQuestions: 112,
    highYield: true,
    topics: [
      { id: 'top_p4', chapterId: 'ch_p_02', title: "Coulomb's Law & Electric Field Lines", isCompleted: true, revisionCount: 4, notesAvailable: true, pyqCount: 38 },
      { id: 'top_p5', chapterId: 'ch_p_02', title: "Gauss's Law & Flux Calculations", isCompleted: true, revisionCount: 2, notesAvailable: true, pyqCount: 46 },
      { id: 'top_p6', chapterId: 'ch_p_02', title: 'Electric Dipole & Potential Energy', isCompleted: false, revisionCount: 1, notesAvailable: true, pyqCount: 76 },
    ],
  },
  {
    id: 'ch_p_03',
    subjectId: 'physics',
    title: 'Wave Optics & Interference',
    chapterNumber: 19,
    totalQuestions: 95,
    completedQuestions: 64,
    highYield: false,
    topics: [
      { id: 'top_p7', chapterId: 'ch_p_03', title: "Huygens' Principle & Wavefronts", isCompleted: true, revisionCount: 2, notesAvailable: true, pyqCount: 24 },
      { id: 'top_p8', chapterId: 'ch_p_03', title: "Young's Double Slit Experiment (YDSE)", isCompleted: true, revisionCount: 3, notesAvailable: true, pyqCount: 45 },
      { id: 'top_p9', chapterId: 'ch_p_03', title: 'Diffraction & Resolving Power', isCompleted: false, revisionCount: 0, notesAvailable: true, pyqCount: 26 },
    ],
  },

  // Chemistry
  {
    id: 'ch_c_01',
    subjectId: 'chemistry',
    title: 'General Organic Chemistry (GOC)',
    chapterNumber: 14,
    totalQuestions: 190,
    completedQuestions: 154,
    highYield: true,
    topics: [
      { id: 'top_c1', chapterId: 'ch_c_01', title: 'Inductive, Mesomeric & Hyperconjugation Effects', isCompleted: true, revisionCount: 4, notesAvailable: true, pyqCount: 68 },
      { id: 'top_c2', chapterId: 'ch_c_01', title: 'Aromaticity & Huckel Rule', isCompleted: true, revisionCount: 3, notesAvailable: true, pyqCount: 42 },
      { id: 'top_c3', chapterId: 'ch_c_01', title: 'Acidic & Basic Strength Comparisons', isCompleted: true, revisionCount: 3, notesAvailable: true, pyqCount: 80 },
    ],
  },
  {
    id: 'ch_c_02',
    subjectId: 'chemistry',
    title: 'Chemical Bonding & Molecular Structure',
    chapterNumber: 4,
    totalQuestions: 130,
    completedQuestions: 105,
    highYield: true,
    topics: [
      { id: 'top_c4', chapterId: 'ch_c_02', title: 'VSEPR Theory & Hybridization', isCompleted: true, revisionCount: 3, notesAvailable: true, pyqCount: 48 },
      { id: 'top_c5', chapterId: 'ch_c_02', title: 'Molecular Orbital Theory (MOT)', isCompleted: true, revisionCount: 3, notesAvailable: true, pyqCount: 52 },
      { id: 'top_c6', chapterId: 'ch_c_02', title: 'Dipole Moments & Hydrogen Bonding', isCompleted: false, revisionCount: 1, notesAvailable: true, pyqCount: 30 },
    ],
  },

  // Mathematics
  {
    id: 'ch_m_01',
    subjectId: 'math',
    title: 'Definite Integrals & Area Under Curves',
    chapterNumber: 8,
    totalQuestions: 175,
    completedQuestions: 120,
    highYield: true,
    topics: [
      { id: 'top_m1', chapterId: 'ch_m_01', title: 'King Property & Periodic Function Integrals', isCompleted: true, revisionCount: 4, notesAvailable: true, pyqCount: 65 },
      { id: 'top_m2', chapterId: 'ch_m_01', title: 'Leibnitz Rule of Differentiation Under Integral', isCompleted: true, revisionCount: 2, notesAvailable: true, pyqCount: 45 },
      { id: 'top_m3', chapterId: 'ch_m_01', title: 'Area Enclosed Between Parabolas & Lines', isCompleted: false, revisionCount: 1, notesAvailable: true, pyqCount: 65 },
    ],
  },
  {
    id: 'ch_m_02',
    subjectId: 'math',
    title: 'Vector Algebra & 3D Geometry',
    chapterNumber: 11,
    totalQuestions: 150,
    completedQuestions: 115,
    highYield: true,
    topics: [
      { id: 'top_m4', chapterId: 'ch_m_02', title: 'Scalar & Vector Triple Product', isCompleted: true, revisionCount: 3, notesAvailable: true, pyqCount: 54 },
      { id: 'top_m5', chapterId: 'ch_m_02', title: 'Shortest Distance Between Skew Lines', isCompleted: true, revisionCount: 3, notesAvailable: true, pyqCount: 50 },
      { id: 'top_m6', chapterId: 'ch_m_02', title: 'Equation of Plane & Line-Plane Angle', isCompleted: false, revisionCount: 1, notesAvailable: true, pyqCount: 46 },
    ],
  },

  // Biology
  {
    id: 'ch_b_01',
    subjectId: 'biology',
    title: 'Genetics & Molecular Basis of Inheritance',
    chapterNumber: 6,
    totalQuestions: 140,
    completedQuestions: 96,
    highYield: true,
    topics: [
      { id: 'top_b1', chapterId: 'ch_b_01', title: 'DNA Replication Enzymes & Central Dogma', isCompleted: true, revisionCount: 3, notesAvailable: true, pyqCount: 48 },
      { id: 'top_b2', chapterId: 'ch_b_01', title: 'Hardy-Weinberg Equilibrium & Allele Frequency', isCompleted: true, revisionCount: 2, notesAvailable: true, pyqCount: 52 },
      { id: 'top_b3', chapterId: 'ch_b_01', title: 'Lac Operon & Gene Regulation', isCompleted: false, revisionCount: 1, notesAvailable: true, pyqCount: 40 },
    ],
  },
];

export const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 'q_p1',
    chapterId: 'ch_p_01',
    topicId: 'top_p3',
    subjectId: 'physics',
    type: 'single_mcq',
    prompt:
      'A solid cylinder of mass $M$ and radius $R$ rolls without slipping down an inclined plane of inclination $\\theta$. The linear acceleration of the cylinder is:',
    options: [
      { id: 'opt_1', text: '$g \\sin\\theta$', isCorrect: false },
      { id: 'opt_2', text: '$\\frac{2}{3} g \\sin\\theta$', isCorrect: true },
      { id: 'opt_3', text: '$\\frac{1}{2} g \\sin\\theta$', isCorrect: false },
      { id: 'opt_4', text: '$\\frac{3}{4} g \\sin\\theta$', isCorrect: false },
    ],
    explanation:
      'For a rigid body rolling without slipping down an incline of angle $\\theta$:\n\n$$a = \\frac{g \\sin\\theta}{1 + \\frac{I}{MR^2}}$$\n\nFor a solid cylinder about its symmetry axis, $I = \\frac{1}{2}MR^2$, so $\\frac{I}{MR^2} = \\frac{1}{2}$.\n\nTherefore:\n\n$$a = \\frac{g \\sin\\theta}{1 + \\frac{1}{2}} = \\frac{2}{3} g \\sin\\theta$$',
    hints: [
      {
        id: 'h_p1_1',
        category: 'concept',
        title: 'Core Principle',
        content:
          'Combine translational motion down the incline ($Mg\\sin\\theta - f = Ma$) with rotational motion about the center of mass ($fR = I\\alpha$) under pure rolling ($a = \\alpha R$).',
      },
      {
        id: 'h_p1_2',
        category: 'formula',
        title: 'Key Formula',
        content:
          '$$a = \\frac{g\\sin\\theta}{1 + \\frac{I}{MR^2}}$$\n\nMoment of inertia of a solid cylinder: $I = \\frac{1}{2}MR^2$.',
      },
      {
        id: 'h_p1_3',
        category: 'strategy',
        title: 'First Step',
        content:
          'Substitute $\\frac{I}{MR^2} = \\frac{1}{2}$ into the denominator $1 + \\frac{I}{MR^2}$ and invert the resulting fraction.',
      },
    ],
    difficulty: 'Medium',
    examOrigin: 'JEE Main 2023 Evening Shift',
    year: 2023,
    tags: ['Formula-Based', 'Mechanics'],
    peerStats: { opt_1: 12, opt_2: 68, opt_3: 13, opt_4: 7 },
    isBookmarked: true,
  },
  {
    id: 'q_p2',
    chapterId: 'ch_p_02',
    topicId: 'top_p4',
    subjectId: 'physics',
    type: 'numerical',
    prompt:
      'Two point charges of $+4\\,\\mu\\text{C}$ and $-1\\,\\mu\\text{C}$ are placed in air $12\\text{ cm}$ apart. Find the distance (in $\\text{cm}$) from the $-1\\,\\mu\\text{C}$ charge on the line joining them (outside the segment) where electric potential is zero.',
    numericalAnswer: 4,
    numericalTolerance: 0.1,
    explanation:
      'Let the zero-potential point lie at distance $x\\text{ cm}$ outside the segment on the side of $-1\\,\\mu\\text{C}$. Its distance from $+4\\,\\mu\\text{C}$ is $(12 + x)\\text{ cm}$.\n\n$$V = k\\left(\\frac{q_1}{r_1} + \\frac{q_2}{r_2}\\right) = 0 \\implies \\frac{4}{12 + x} - \\frac{1}{x} = 0$$\n\n$$4x = 12 + x \\implies 3x = 12 \\implies x = 4\\text{ cm}$$',
    hints: [
      {
        id: 'h_p2_1',
        category: 'concept',
        title: 'Core Principle',
        content:
          'Electric potential is a scalar ($V = V_1 + V_2$), so opposite-sign potentials cancel wherever their magnitudes are equal.',
      },
      {
        id: 'h_p2_2',
        category: 'formula',
        title: 'Key Formula',
        content:
          '$$V = \\frac{kq_1}{r_1} + \\frac{kq_2}{r_2} = 0 \\implies \\frac{|q_1|}{r_1} = \\frac{|q_2|}{r_2}$$',
      },
      {
        id: 'h_p2_3',
        category: 'strategy',
        title: 'First Step',
        content:
          'Since the external zero-potential point lies closer to the smaller charge $-1\\,\\mu\\text{C}$, set $r_2 = x$ and $r_1 = 12 + x$.',
      },
    ],
    difficulty: 'Easy',
    examOrigin: 'CBSE Board / NEET Practice',
    year: 2022,
    tags: ['Numerical', 'Concept'],
    isBookmarked: false,
  },
  {
    id: 'q_c1',
    chapterId: 'ch_c_01',
    topicId: 'top_c1',
    subjectId: 'chemistry',
    type: 'single_mcq',
    prompt:
      'Which of the following carbocations is the most stable due to complete octet resonance contribution?',
    options: [
      { id: 'opt_c1', text: '$\\text{CH}_3 - \\text{C}^+\\text{H} - \\text{OCH}_3$', isCorrect: true },
      { id: 'opt_c2', text: '$(\\text{CH}_3)_3\\text{C}^+$', isCorrect: false },
      { id: 'opt_c3', text: '$\\text{C}_6\\text{H}_5 - \\text{C}^+\\text{H}_2$', isCorrect: false },
      { id: 'opt_c4', text: '$\\text{CH}_2 = \\text{CH} - \\text{C}^+\\text{H}_2$', isCorrect: false },
    ],
    explanation:
      'In $\\text{CH}_3 - \\text{C}^+\\text{H} - \\text{OCH}_3$, the lone pair on oxygen donates via $+M$ resonance:\n\n$$\\text{CH}_3 - \\text{C}^+\\text{H} - \\ddot{\\text{O}}\\text{CH}_3 \\longleftrightarrow \\text{CH}_3 - \\text{CH} = \\text{O}^+ - \\text{CH}_3$$\n\nIn the second contributor, every atom attains a **complete valence octet**, which strongly dominates over $3^\\circ$ hyperconjugation in $(\\text{CH}_3)_3\\text{C}^+$ or ordinary benzylic/allylic delocalization.',
    hints: [
      {
        id: 'h_c1_1',
        category: 'concept',
        title: 'Core Principle',
        content:
          'Compare stabilizing effects in priority order: complete-octet $+M$ resonance $\\gg$ $\\pi$-conjugation $>$ hyperconjugation ($+H$) $>$ $+I$.',
      },
      {
        id: 'h_c1_2',
        category: 'formula',
        title: 'Resonance Pattern',
        content:
          'Look for an atom bearing a lone pair immediately adjacent to the $sp^2$ carbocation: $-\\text{C}^+\\text{H}-\\ddot{\\text{O}}\\text{R} \\leftrightarrow -\\text{CH}=\\text{O}^+\\text{R}$.',
      },
      {
        id: 'h_c1_3',
        category: 'strategy',
        title: 'First Step',
        content:
          'Count the valence electrons on every non-hydrogen atom in the major resonance contributor; identify which structure gives all atoms 8 electrons.',
      },
    ],
    difficulty: 'Hard',
    examOrigin: 'JEE Advanced',
    year: 2021,
    tags: ['Concept', 'Organic'],
    peerStats: { opt_c1: 54, opt_c2: 26, opt_c3: 14, opt_4: 6, opt_c4: 6 },
    isBookmarked: true,
  },
  {
    id: 'q_m1',
    chapterId: 'ch_m_01',
    topicId: 'top_m1',
    subjectId: 'math',
    type: 'single_mcq',
    prompt:
      'Evaluate the definite integral:\n\n$$I = \\int_{0}^{\\pi/2} \\frac{\\sin^4 x}{\\sin^4 x + \\cos^4 x}\\,dx$$',
    options: [
      { id: 'opt_m1', text: '$\\frac{\\pi}{2}$', isCorrect: false },
      { id: 'opt_m2', text: '$\\frac{\\pi}{4}$', isCorrect: true },
      { id: 'opt_m3', text: '$\\pi$', isCorrect: false },
      { id: 'opt_m4', text: '$0$', isCorrect: false },
    ],
    explanation:
      'Using King\'s Property $\\int_{0}^{a} f(x)\\,dx = \\int_{0}^{a} f(a-x)\\,dx$ with $a = \\frac{\\pi}{2}$:\n\n$$I = \\int_{0}^{\\pi/2} \\frac{\\cos^4 x}{\\cos^4 x + \\sin^4 x}\\,dx$$\n\nAdding both equations gives:\n\n$$2I = \\int_{0}^{\\pi/2} \\frac{\\sin^4 x + \\cos^4 x}{\\sin^4 x + \\cos^4 x}\\,dx = \\int_{0}^{\\pi/2} 1\\,dx = \\frac{\\pi}{2} \\implies I = \\frac{\\pi}{4}$$',
    hints: [
      {
        id: 'h_m1_1',
        category: 'concept',
        title: 'Core Principle',
        content:
          'Notice the complementary symmetry between $\\sin x$ and $\\cos x$ over the interval $[0, \\frac{\\pi}{2}]$ rather than expanding fourth powers.',
      },
      {
        id: 'h_m1_2',
        category: 'formula',
        title: 'Key Formula',
        content:
          'King\'s Property:\n\n$$\\int_{0}^{a} f(x)\\,dx = \\int_{0}^{a} f(a - x)\\,dx$$',
      },
      {
        id: 'h_m1_3',
        category: 'strategy',
        title: 'First Step',
        content:
          'Substitute $x \\to \\frac{\\pi}{2} - x$ so $\\sin(\\frac{\\pi}{2} - x) = \\cos x$, then add the new expression to the original $I$.',
      },
    ],
    difficulty: 'Medium',
    examOrigin: 'JEE Main 2024 Morning Shift',
    year: 2024,
    tags: ['Formula-Based', 'Calculus'],
    peerStats: { opt_m1: 11, opt_m2: 76, opt_m3: 8, opt_m4: 5 },
    isBookmarked: false,
  },
  {
    id: 'q_m2',
    chapterId: 'ch_m_02',
    topicId: 'top_m5',
    subjectId: 'math',
    type: 'numerical',
    prompt:
      'Find the shortest distance between the parallel lines:\n\n$$\\vec{r}_1 = (\\hat{i} + 2\\hat{j} - 4\\hat{k}) + \\lambda(2\\hat{i} + 3\\hat{j} + 6\\hat{k})$$\n\n$$\\vec{r}_2 = (3\\hat{i} + 3\\hat{j} - 5\\hat{k}) + \\mu(2\\hat{i} + 3\\hat{j} + 6\\hat{k})$$\n\nRound your answer to $2$ decimal places (in units).',
    numericalAnswer: 2.45,
    numericalTolerance: 0.1,
    explanation:
      'For parallel lines $\\vec{r} = \\vec{a}_1 + \\lambda\\vec{b}$ and $\\vec{r} = \\vec{a}_2 + \\mu\\vec{b}$, the shortest distance is:\n\n$$d = \\frac{|\\vec{b} \\times (\\vec{a}_2 - \\vec{a}_1)|}{|\\vec{b}|}$$\n\nHere $\\vec{a}_2 - \\vec{a}_1 = 2\\hat{i} + \\hat{j} - \\hat{k}$ and $|\\vec{b}| = \\sqrt{2^2 + 3^2 + 6^2} = \\sqrt{49} = 7$.\n\n$$\\vec{b} \\times (\\vec{a}_2 - \\vec{a}_1) = -9\\hat{i} + 14\\hat{j} - 4\\hat{k}$$\n\n$$d = \\frac{\\sqrt{(-9)^2 + 14^2 + (-4)^2}}{7} = \\frac{\\sqrt{293}}{7} \\approx 2.45\\text{ units}$$',
    hints: [
      {
        id: 'h_m2_1',
        category: 'concept',
        title: 'Core Principle',
        content:
          'Both lines have identical direction vectors $\\vec{b} = 2\\hat{i} + 3\\hat{j} + 6\\hat{k}$, so they are parallel (not skew).',
      },
      {
        id: 'h_m2_2',
        category: 'formula',
        title: 'Key Formula',
        content:
          '$$d = \\frac{|\\vec{b} \\times (\\vec{a}_2 - \\vec{a}_1)|}{|\\vec{b}|}$$',
      },
      {
        id: 'h_m2_3',
        category: 'strategy',
        title: 'First Step',
        content:
          'Compute $\\vec{a}_2 - \\vec{a}_1 = 2\\hat{i} + \\hat{j} - \\hat{k}$, evaluate the $3 \\times 3$ determinant for $\\vec{b} \\times (\\vec{a}_2 - \\vec{a}_1)$, and divide its norm by $|\\vec{b}| = 7$.',
      },
    ],
    difficulty: 'Medium',
    examOrigin: 'CBSE Class 12 Board & BITSAT',
    year: 2023,
    tags: ['Numerical', 'Vectors 3D'],
    isBookmarked: true,
  },
  {
    id: 'q_p3',
    chapterId: 'ch_p_03',
    topicId: 'top_p8',
    subjectId: 'physics',
    type: 'single_mcq',
    prompt:
      'In Young\'s double-slit experiment using monochromatic light of wavelength $\\lambda$, two coherent sources of equal intensity $I_0$ produce maximum intensity $I_{\\max} = 4I_0$. What is the intensity at a point where the path difference is $\\frac{\\lambda}{3}$?',
    options: [
      { id: 'opt_p3_1', text: '$4I_0$', isCorrect: false },
      { id: 'opt_p3_2', text: '$2I_0$', isCorrect: false },
      { id: 'opt_p3_3', text: '$I_0$', isCorrect: true },
      { id: 'opt_p3_4', text: '$\\frac{I_0}{2}$', isCorrect: false },
    ],
    explanation:
      'Phase difference corresponding to path difference $\\Delta x = \\frac{\\lambda}{3}$ is:\n\n$$\\phi = \\frac{2\\pi}{\\lambda} \\Delta x = \\frac{2\\pi}{3}$$\n\nUsing resultant interference intensity:\n\n$$I = 4I_0 \\cos^2\\!\\left(\\frac{\\phi}{2}\\right) = 4I_0 \\cos^2\\!\\left(\\frac{\\pi}{3}\\right) = 4I_0 \\left(\\frac{1}{2}\\right)^2 = I_0$$',
    hints: [
      {
        id: 'h_p3_1',
        category: 'concept',
        title: 'Core Principle',
        content:
          'Convert path difference $\\Delta x$ into phase difference $\\phi$ before computing coherent superposition intensity.',
      },
      {
        id: 'h_p3_2',
        category: 'formula',
        title: 'Key Formula',
        content:
          '$$\\phi = \\frac{2\\pi}{\\lambda}\\Delta x, \\qquad I = 4I_0\\cos^2\\!\\left(\\frac{\\phi}{2}\\right)$$',
      },
      {
        id: 'h_p3_3',
        category: 'strategy',
        title: 'First Step',
        content:
          'Compute $\\frac{\\phi}{2} = \\frac{\\pi}{3}$ and recall $\\cos(\\frac{\\pi}{3}) = \\frac{1}{2}$.',
      },
    ],
    difficulty: 'Medium',
    examOrigin: 'JEE Main 2024',
    year: 2024,
    tags: ['Formula-Based', 'Wave Optics'],
    peerStats: { opt_p3_1: 8, opt_p3_2: 19, opt_p3_3: 64, opt_p3_4: 9 },
  },
  {
    id: 'q_p4',
    chapterId: 'ch_p_02',
    topicId: 'top_p5',
    subjectId: 'physics',
    type: 'single_mcq',
    prompt:
      'A point charge $q$ is placed at the center of one face of a cube of side $L$. What is the electric flux linked with the entire closed cube if $q$ sits slightly inside that face at distance $\\epsilon \\to 0^+$?',
    options: [
      { id: 'opt_p4_1', text: '$\\frac{q}{\\varepsilon_0}$', isCorrect: true },
      { id: 'opt_p4_2', text: '$\\frac{q}{2\\varepsilon_0}$', isCorrect: false },
      { id: 'opt_p4_3', text: '$\\frac{q}{6\\varepsilon_0}$', isCorrect: false },
      { id: 'opt_p4_4', text: '$\\frac{q}{8\\varepsilon_0}$', isCorrect: false },
    ],
    explanation:
      'By **Gauss\'s Law**, the total flux through any closed Gaussian surface depends solely on the net enclosed charge $q_{\\text{in}}$:\n\n$$\\Phi_{\\text{closed}} = \\frac{q_{\\text{in}}}{\\varepsilon_0}$$\n\nSince the charge is placed at $\\epsilon \\to 0^+$ *inside* the cube, $100\\%$ of $q$ is enclosed, so total closed-cube flux is $\\frac{q}{\\varepsilon_0}$. *(Contrast: strictly on the boundary face without enclosing it requires symmetry with two cubes, yielding $\\frac{q}{2\\varepsilon_0}$.)*',
    hints: [
      {
        id: 'h_p4_1',
        category: 'concept',
        title: 'Core Principle',
        content:
          'Read boundary qualifiers carefully: a charge strictly inside ($\\epsilon \\to 0^+$) contributes full enclosed charge to a closed surface.',
      },
      {
        id: 'h_p4_2',
        category: 'formula',
        title: 'Gauss Law',
        content:
          '$$\\oint \\vec{E}\\cdot d\\vec{A} = \\frac{q_{\\text{enclosed}}}{\\varepsilon_0}$$',
      },
      {
        id: 'h_p4_3',
        category: 'strategy',
        title: 'First Step',
        content:
          'Confirm whether the entire point charge lies inside the Gaussian cube; if yes, flux is independent of symmetry position.',
      },
    ],
    difficulty: 'Hard',
    examOrigin: 'JEE Advanced Concept Check',
    year: 2023,
    tags: ['Concept', 'Electrostatics'],
    peerStats: { opt_p4_1: 39, opt_p4_2: 42, opt_p4_3: 15, opt_p4_4: 4 },
  },
  {
    id: 'q_c2',
    chapterId: 'ch_c_02',
    topicId: 'top_c5',
    subjectId: 'chemistry',
    type: 'single_mcq',
    prompt:
      'According to Molecular Orbital Theory (MOT), which of the following species has a bond order of $2.5$ and is paramagnetic?',
    options: [
      { id: 'opt_c2_1', text: '$\\text{N}_2^+$', isCorrect: true },
      { id: 'opt_c2_2', text: '$\\text{O}_2^{2-}$', isCorrect: false },
      { id: 'opt_c2_3', text: '$\\text{CN}^-$', isCorrect: false },
      { id: 'opt_c2_4', text: '$\\text{C}_2$', isCorrect: false },
    ],
    explanation:
      '$\\text{N}_2^+$ contains $13$ total valence/molecular electrons ($N_b = 9$, $N_a = 4$):\n\n$$\\text{Bond Order} = \\frac{N_b - N_a}{2} = \\frac{9 - 4}{2} = 2.5$$\n\nWith an odd electron count ($13e^-$), $\\text{N}_2^+$ retains one unpaired electron in $\\sigma_{2p_z}$, making it **paramagnetic**.',
    hints: [
      {
        id: 'h_c2_1',
        category: 'concept',
        title: 'Core Principle',
        content:
          'Species with odd total electron counts always contain at least one unpaired electron (paramagnetic) and yield half-integer bond orders.',
      },
      {
        id: 'h_c2_2',
        category: 'formula',
        title: 'Key Formula',
        content:
          '$$\\text{BO} = \\frac{1}{2}(N_b - N_a)$$\n\n14 electrons $\\implies$ BO $= 3.0$; 13 or 15 electrons $\\implies$ BO $= 2.5$.',
      },
      {
        id: 'h_c2_3',
        category: 'strategy',
        title: 'First Step',
        content:
          'Sum total electrons for each ion: $\\text{N}_2^+ = 7 + 7 - 1 = 13$, which immediately matches BO $= 2.5$.',
      },
    ],
    difficulty: 'Easy',
    examOrigin: 'NEET & MHT CET',
    year: 2024,
    tags: ['Concept', 'Bonding'],
    peerStats: { opt_c2_1: 79, opt_c2_2: 7, opt_c2_3: 8, opt_c2_4: 6 },
    isBookmarked: true,
  },
  {
    id: 'q_c3',
    chapterId: 'ch_c_01',
    topicId: 'top_c3',
    subjectId: 'chemistry',
    type: 'single_mcq',
    prompt:
      'Arrange the following compounds in decreasing order of acidic strength: Phenol (I), p-Nitrophenol (II), Ethanol (III), Acetic Acid (IV).',
    options: [
      { id: 'opt_c3_1', text: '$\\text{II} > \\text{IV} > \\text{I} > \\text{III}$', isCorrect: false },
      { id: 'opt_c3_2', text: '$\\text{IV} > \\text{II} > \\text{I} > \\text{III}$', isCorrect: true },
      { id: 'opt_c3_3', text: '$\\text{IV} > \\text{I} > \\text{II} > \\text{III}$', isCorrect: false },
      { id: 'opt_c3_4', text: '$\\text{I} > \\text{II} > \\text{IV} > \\text{III}$', isCorrect: false },
    ],
    explanation:
      'Acetic acid ($pK_a \\approx 4.76$) forms an **equivalent carboxylate resonance hybrid** ($\\text{RCOO}^-$), making it stronger than p-nitrophenol ($pK_a \\approx 7.15$), which in turn is stabilized by $-M$ of $-\\text{NO}_2$ relative to phenol ($pK_a \\approx 10.0$) and ethanol ($pK_a \\approx 15.9$). Thus $\\text{IV} > \\text{II} > \\text{I} > \\text{III}$.',
    hints: [
      {
        id: 'h_c3_1',
        category: 'concept',
        title: 'Core Principle',
        content:
          'Acid strength tracks conjugate base stability. Carboxylate ions possess two equivalent oxygen-bearing resonance contributors.',
      },
      {
        id: 'h_c3_2',
        category: 'formula',
        title: 'pKa Benchmark',
        content:
          'Carboxylic acid ($pK_a \\approx 4.8$) $<$ nitrophenol ($\\approx 7.2$) $<$ phenol ($\\approx 10$) $<$ alcohol ($\\approx 16$).',
      },
      {
        id: 'h_c3_3',
        category: 'strategy',
        title: 'First Step',
        content:
          'Anchor the strongest acid (carboxylic acid IV) and weakest acid (aliphatic alcohol III), then order the phenolics.',
      },
    ],
    difficulty: 'Medium',
    examOrigin: 'JEE Main 2022',
    year: 2022,
    tags: ['Concept', 'Organic'],
    peerStats: { opt_c3_1: 18, opt_c3_2: 67, opt_c3_3: 11, opt_c3_4: 4 },
  },
  {
    id: 'q_m3',
    chapterId: 'ch_m_01',
    topicId: 'top_m2',
    subjectId: 'math',
    type: 'single_mcq',
    prompt:
      'Let $g(x) = \\int_{x^2}^{x^3} \\frac{dt}{\\ln t}$ for $x > 1$. Find the value of $g\'(2)$.',
    options: [
      { id: 'opt_m3_1', text: '$\\frac{12}{\\ln 8} - \\frac{4}{\\ln 4}$', isCorrect: false },
      { id: 'opt_m3_2', text: '$\\frac{12}{\\ln 8} - \\frac{4}{\\ln 2}$', isCorrect: false },
      { id: 'opt_m3_3', text: '$\\frac{4}{\\ln 2} - \\frac{2}{\\ln 2} = \\frac{2}{\\ln 2}$', isCorrect: true },
      { id: 'opt_m3_4', text: '$\\frac{6}{\\ln 2}$', isCorrect: false },
    ],
    explanation:
      'By the **Leibniz Differentiation Rule**:\n\n$$g\'(x) = \\frac{1}{\\ln(x^3)} \\cdot 3x^2 - \\frac{1}{\\ln(x^2)} \\cdot 2x$$\n\nUsing $\\ln(x^k) = k\\ln x$, this simplifies cleanly to:\n\n$$g\'(x) = \\frac{3x^2}{3\\ln x} - \\frac{2x}{2\\ln x} = \\frac{x^2 - x}{\\ln x}$$\n\nAt $x = 2$: $g\'(2) = \\frac{4 - 2}{\\ln 2} = \\frac{2}{\\ln 2}$.',
    hints: [
      {
        id: 'h_m3_1',
        category: 'concept',
        title: 'Core Principle',
        content:
          'Differentiate the integral using Newton-Leibniz rule with variable lower and upper limits.',
      },
      {
        id: 'h_m3_2',
        category: 'formula',
        title: 'Key Formula',
        content:
          '$$\\frac{d}{dx}\\int_{u(x)}^{v(x)} f(t)\\,dt = f(v(x))v\'(x) - f(u(x))u\'(x)$$',
      },
      {
        id: 'h_m3_3',
        category: 'strategy',
        title: 'First Step',
        content:
          'Simplify $\\ln(x^3) = 3\\ln x$ and $\\ln(x^2) = 2\\ln x$ immediately to cancel factors of $3$ and $2$.',
      },
    ],
    difficulty: 'Hard',
    examOrigin: 'JEE Main / Advanced Drill',
    year: 2024,
    tags: ['Formula-Based', 'Calculus'],
    peerStats: { opt_m3_1: 22, opt_m3_2: 14, opt_m3_3: 55, opt_m3_4: 9 },
    isBookmarked: true,
  },
  {
    id: 'q_b1',
    chapterId: 'ch_b_01',
    topicId: 'top_b1',
    subjectId: 'biology',
    type: 'single_mcq',
    prompt:
      'During semiconservative DNA replication in *E. coli*, which enzyme catalyzes the polymerization of deoxynucleotides exclusively in the $5\' \\to 3\'$ direction along both leading and lagging templates?',
    options: [
      { id: 'opt_b1_1', text: 'DNA Ligase', isCorrect: false },
      { id: 'opt_b1_2', text: 'DNA Polymerase III', isCorrect: true },
      { id: 'opt_b1_3', text: 'RNA Primase', isCorrect: false },
      { id: 'opt_b1_4', text: 'Topoisomerase II', isCorrect: false },
    ],
    explanation:
      'In prokaryotes, **DNA Polymerase III** is the primary replicative enzyme extending primers only in the $5\' \\to 3\'$ polarity (continuous on the leading strand and via Okazaki fragments on the lagging strand). DNA Ligase later seals the nicks.',
    hints: [
      {
        id: 'h_b1_1',
        category: 'concept',
        title: 'Core Principle',
        content:
          'Distinguish primer synthesis (Primase), chain elongation (DNA Pol III), nick sealing (Ligase), and supercoil relief (Topoisomerase).',
      },
      {
        id: 'h_b1_2',
        category: 'formula',
        title: 'Replication Polarity',
        content:
          'New strand synthesis polarity: $5\' \\longrightarrow 3\'$; template read direction: $3\' \\longrightarrow 5\'$.',
      },
      {
        id: 'h_b1_3',
        category: 'strategy',
        title: 'First Step',
        content:
          'Look specifically for the enzyme catalyzing bulk deoxynucleotide phosphodiester bond elongation.',
      },
    ],
    difficulty: 'Easy',
    examOrigin: 'NEET UG NCERT Recall',
    year: 2024,
    tags: ['Concept', 'Genetics'],
    peerStats: { opt_b1_1: 6, opt_b1_2: 84, opt_b1_3: 7, opt_b1_4: 3 },
  },
  {
    id: 'q_b2',
    chapterId: 'ch_b_01',
    topicId: 'top_b2',
    subjectId: 'biology',
    type: 'single_mcq',
    prompt:
      'In a large randomly mating population in Hardy-Weinberg equilibrium, $16\\%$ of individuals express a recessive autosomal trait ($aa$). What percentage of the population are heterozygous carriers ($Aa$)?',
    options: [
      { id: 'opt_b2_1', text: '$36\\%$', isCorrect: false },
      { id: 'opt_b2_2', text: '$40\\%$', isCorrect: false },
      { id: 'opt_b2_3', text: '$48\\%$', isCorrect: true },
      { id: 'opt_b2_4', text: '$60\\%$', isCorrect: false },
    ],
    explanation:
      'Given recessive phenotype frequency $q^2 = 0.16$, the recessive allele frequency is $q = \\sqrt{0.16} = 0.4$.\n\nSince $p + q = 1$, dominant allele frequency $p = 0.6$.\n\nHeterozygous carrier frequency:\n\n$$2pq = 2(0.6)(0.4) = 0.48 = 48\\%$$',
    hints: [
      {
        id: 'h_b2_1',
        category: 'concept',
        title: 'Core Principle',
        content:
          'Identify $16\\% = 0.16$ as homozygous recessive genotype frequency $q^2$, not $q$ itself.',
      },
      {
        id: 'h_b2_2',
        category: 'formula',
        title: 'Hardy-Weinberg Equations',
        content:
          '$$p + q = 1, \\qquad p^2 + 2pq + q^2 = 1$$',
      },
      {
        id: 'h_b2_3',
        category: 'strategy',
        title: 'First Step',
        content:
          'Take $q = \\sqrt{0.16} = 0.4$, subtract from $1$ to get $p = 0.6$, then compute $2pq$.',
      },
    ],
    difficulty: 'Medium',
    examOrigin: 'NEET UG Genetics Drill',
    year: 2023,
    tags: ['Numerical', 'Genetics'],
    peerStats: { opt_b2_1: 14, opt_b2_2: 19, opt_b2_3: 59, opt_b2_4: 8 },
  },
];

export const FORMULA_CARDS: FormulaItem[] = [
  {
    id: 'f_p1',
    subjectId: 'physics',
    chapterId: 'ch_p_01',
    chapterTitle: 'Rotational Motion',
    title: 'Pure Rolling Acceleration on Incline',
    formula: '$$a = \\frac{g\\sin\\theta}{1 + \\frac{I}{MR^2}}$$',
    variables: '$I$: moment of inertia, $M$: mass, $R$: radius, $\\theta$: incline angle',
    notes: 'Solid sphere: $\\frac{5}{7}g\\sin\\theta$, Solid cylinder: $\\frac{2}{3}g\\sin\\theta$, Ring: $\\frac{1}{2}g\\sin\\theta$.',
  },
  {
    id: 'f_p2',
    subjectId: 'physics',
    chapterId: 'ch_p_01',
    chapterTitle: 'Rotational Motion',
    title: 'Parallel & Perpendicular Axis Theorems',
    formula: '$$I = I_{\\text{cm}} + Md^2 \\qquad I_z = I_x + I_y$$',
    variables: '$I_{\\text{cm}}$: COM inertia, $d$: parallel separation; $I_z$ for planar lamina only',
    notes: 'Perpendicular axis theorem applies strictly to flat 2D rigid bodies.',
  },
  {
    id: 'f_p3',
    subjectId: 'physics',
    chapterId: 'ch_p_02',
    chapterTitle: 'Electrostatics',
    title: 'Electric Dipole Torque & Potential Energy',
    formula: '$$\\vec{\\tau} = \\vec{p} \\times \\vec{E}, \\qquad U = -\\vec{p} \\cdot \\vec{E}$$',
    variables: '$\\vec{p} = q\\vec{d}$ (negative to positive charge), $\\vec{E}$: uniform field',
    notes: 'Stable equilibrium at $\\theta = 0^\\circ$ ($U = -pE$); unstable at $\\theta = 180^\\circ$.',
  },
  {
    id: 'f_p4',
    subjectId: 'physics',
    chapterId: 'ch_p_03',
    chapterTitle: 'Wave Optics',
    title: 'YDSE Fringe Width & Interference Intensity',
    formula: '$$\\beta = \\frac{\\lambda D}{d}, \\qquad I = I_1 + I_2 + 2\\sqrt{I_1 I_2}\\cos\\phi$$',
    variables: '$D$: slit-screen distance, $d$: slit spacing, $\\phi = \\frac{2\\pi}{\\lambda}\\Delta x$',
    notes: 'For identical slits $I_1 = I_2 = I_0$, $I = 4I_0\\cos^2(\\phi/2)$.',
  },
  {
    id: 'f_c1',
    subjectId: 'chemistry',
    chapterId: 'ch_c_01',
    chapterTitle: 'General Organic Chemistry',
    title: 'Huckel Aromaticity Criterion',
    formula: '$$\\pi\\text{ electrons} = (4n + 2), \\quad n \\in \\{0, 1, 2, \\dots\\}$$',
    variables: 'Requires cyclic, planar, fully conjugated ring with $4n+2$ delocalized $\\pi$ electrons',
    notes: '$4n$ planar conjugated cycles are antiaromatic and destabilized.',
  },
  {
    id: 'f_c2',
    subjectId: 'chemistry',
    chapterId: 'ch_c_02',
    chapterTitle: 'Chemical Bonding',
    title: 'MOT Bond Order & Magnetic Nature',
    formula: '$$\\text{Bond Order} = \\frac{N_b - N_a}{2}$$',
    variables: '$N_b$: bonding electrons, $N_a$: antibonding electrons',
    notes: 'Even species can still be paramagnetic if degenerate $\\pi^*$ orbitals have 1 $e^-$ each (e.g. $\\text{O}_2$, $\\text{B}_2$).',
  },
  {
    id: 'f_c3',
    subjectId: 'chemistry',
    chapterId: 'ch_c_02',
    chapterTitle: 'Chemical Bonding',
    title: 'Dipole Moment & Ionic Character',
    formula: '$$\\mu = q \\cdot d, \\qquad \\%\\text{ Ionic} = \\frac{\\mu_{\\text{obs}}}{\\mu_{\\text{calc}}} \\times 100$$',
    variables: '$1\\text{ D} = 3.336 \\times 10^{-30}\\text{ C}\\cdot\\text{m}$',
    notes: 'Symmetric $\\text{BF}_3$, $\\text{CH}_4$, $\\text{SF}_6$ have zero net dipole moment.',
  },
  {
    id: 'f_m1',
    subjectId: 'math',
    chapterId: 'ch_m_01',
    chapterTitle: 'Definite Integrals',
    title: 'King\'s & Queen\'s Reflection Identities',
    formula: '$$\\int_{a}^{b} f(x)\\,dx = \\int_{a}^{b} f(a + b - x)\\,dx$$',
    variables: 'Symmetric reflection keeps interval limits unchanged while inverting integrand',
    notes: 'Add transformed integral to original $I$ whenever $f(x)+f(a+b-x)$ simplifies.',
  },
  {
    id: 'f_m2',
    subjectId: 'math',
    chapterId: 'ch_m_01',
    chapterTitle: 'Definite Integrals',
    title: 'Newton-Leibniz Derivative Under Integral',
    formula: '$$\\frac{d}{dx}\\int_{u(x)}^{v(x)} f(t)\\,dt = f(v(x))v\'(x) - f(u(x))u\'(x)$$',
    variables: 'Applicable when $u, v$ are differentiable and $f$ is continuous',
    notes: 'Useful for evaluating $\\lim$ forms via L\'Hopital\'s Rule.',
  },
  {
    id: 'f_m3',
    subjectId: 'math',
    chapterId: 'ch_m_02',
    chapterTitle: 'Vectors & 3D Geometry',
    title: 'Shortest Distance: Skew vs Parallel Lines',
    formula: '$$d_{\\text{skew}} = \\frac{|(\\vec{a}_2 - \\vec{a}_1) \\cdot (\\vec{b}_1 \\times \\vec{b}_2)|}{|\\vec{b}_1 \\times \\vec{b}_2|}, \\quad d_{\\parallel} = \\frac{|\\vec{b} \\times (\\vec{a}_2 - \\vec{a}_1)|}{|\\vec{b}|}$$',
    variables: '$\\vec{a}_1, \\vec{a}_2$: position vectors, $\\vec{b}_1, \\vec{b}_2$: direction vectors',
    notes: 'Lines intersect iff $(\\vec{a}_2-\\vec{a}_1)\\cdot(\\vec{b}_1\\times\\vec{b}_2)=0$ with $\\vec{b}_1 \\nparallel \\vec{b}_2$.',
  },
  {
    id: 'f_b1',
    subjectId: 'biology',
    chapterId: 'ch_b_01',
    chapterTitle: 'Genetics & Inheritance',
    title: 'Hardy-Weinberg Genotype Frequencies',
    formula: '$$p + q = 1, \\qquad p^2 + 2pq + q^2 = 1$$',
    variables: '$p$: dominant allele, $q$: recessive allele, $2pq$: carrier frequency',
    notes: 'Always extract $q = \\sqrt{q^2}$ from the recessive homozygous frequency first.',
  },
  {
    id: 'f_b2',
    subjectId: 'biology',
    chapterId: 'ch_b_01',
    chapterTitle: 'Genetics & Inheritance',
    title: 'Chargaff\'s Base-Pairing Ratio Law',
    formula: '$$[\\text{A}] = [\\text{T}], \\quad [\\text{G}] = [\\text{C}], \\quad \\frac{[\\text{A}] + [\\text{G}]}{[\\text{T}] + [\\text{C}]} = 1$$',
    variables: 'Holds strictly for double-stranded DNA helices across all species',
    notes: 'Purines (A, G) equal Pyrimidines (T, C); AT rich DNA denatures at lower $T_m$.',
  },
];
