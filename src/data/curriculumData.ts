import type {
  AcademicStream,
  Chapter,
  ChapterStudyModule,
  CurriculumBoard,
  EducationLevel,
  FormulaItem,
  PreferredLanguage,
  Question,
  Subject,
} from '../types';

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

// =========================================================================
// GLOBAL MULTI-SYSTEM CURRICULUM CATALOG (Module A & Module C)
// =========================================================================
export interface GlobalCountryCurriculum {
  country: string;
  flagLabel: string;
  boards: { id: CurriculumBoard; label: string; category: string }[];
  defaultExams: string[];
}

export const GLOBAL_CURRICULUM_CATALOG: GlobalCountryCurriculum[] = [
  {
    country: 'India',
    flagLabel: 'IN · India',
    boards: [
      { id: 'CBSE', label: 'CBSE (NCERT)', category: 'National Board' },
      { id: 'ICSE', label: 'ICSE / ISC', category: 'Council Board' },
      { id: 'PSEB', label: 'PSEB (Punjab Board)', category: 'State Board' },
      { id: 'STATE_BOARD', label: 'Other State Boards', category: 'State Board' },
      { id: 'JEE_MAIN', label: 'JEE Main Track', category: 'Engineering Entrance' },
      { id: 'JEE_ADVANCED', label: 'JEE Advanced Track', category: 'Engineering Entrance' },
      { id: 'NEET', label: 'NEET UG Track', category: 'Medical Entrance' },
    ],
    defaultExams: ['JEE Main', 'JEE Advanced', 'NEET UG', 'BITSAT', 'CBSE Boards'],
  },
  {
    country: 'United States',
    flagLabel: 'US · United States',
    boards: [
      { id: 'AP_SAT', label: 'AP & SAT Track', category: 'College Prep' },
      { id: 'US_COMMON_CORE', label: 'US High School / NextGen STEM', category: 'School System' },
      { id: 'IB_CAMBRIDGE', label: 'IB Diploma (US)', category: 'International' },
    ],
    defaultExams: ['AP Physics C', 'AP Calculus BC', 'SAT Math', 'ACT STEM'],
  },
  {
    country: 'United Kingdom',
    flagLabel: 'UK · United Kingdom',
    boards: [
      { id: 'UK_GCSE_ALEVEL', label: 'GCSE & A-Level (Edexcel / OCR)', category: 'UK System' },
      { id: 'IB_CAMBRIDGE', label: 'Cambridge International / IB', category: 'International' },
    ],
    defaultExams: ['A-Level Physics', 'A-Level Further Math', 'UCAT', 'BMAT'],
  },
  {
    country: 'Singapore',
    flagLabel: 'SG · Singapore',
    boards: [
      { id: 'SINGAPORE_MOE', label: 'Singapore MOE (O / A-Level H2)', category: 'MOE Curriculum' },
      { id: 'IB_CAMBRIDGE', label: 'IB Diploma (SG)', category: 'International' },
    ],
    defaultExams: ['GCE A-Level H2', 'GCE O-Level', 'SMO Olympiad'],
  },
  {
    country: 'United Arab Emirates',
    flagLabel: 'AE · UAE',
    boards: [
      { id: 'IB_CAMBRIDGE', label: 'IB / British IGCSE', category: 'International' },
      { id: 'CBSE', label: 'CBSE Gulf Track', category: 'Indian Curriculum Abroad' },
      { id: 'AP_SAT', label: 'American AP / SAT Track', category: 'College Prep' },
    ],
    defaultExams: ['EmSAT STEM', 'SAT', 'IB HL Sciences', 'CBSE Gulf'],
  },
  {
    country: 'Global',
    flagLabel: 'GLOBAL · International',
    boards: [
      { id: 'IB_CAMBRIDGE', label: 'IB / Cambridge IGCSE & A-Level', category: 'International' },
      { id: 'AP_SAT', label: 'AP / SAT Prep', category: 'International' },
      { id: 'CBSE', label: 'CBSE International', category: 'Board' },
    ],
    defaultExams: ['IPhO / IChO / IMO', 'SAT', 'IB HL STEM'],
  },
];

export const EDUCATION_LEVELS: EducationLevel[] = [
  'Middle School',
  'High School',
  'Competitive Prep',
  'Undergraduate / Self-Study',
];

export const PREFERRED_LANGUAGES: PreferredLanguage[] = [
  'English',
  'Hindi',
  'Spanish',
  'French',
  'German',
  'Arabic',
  'Mandarin',
];

export const GRADE_LEVEL_OPTIONS = [
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Class 11',
  'Class 12',
  'Dropper / Gap Year',
  'University Year 1',
];

export const BOARD_DISPLAY_NAMES: Record<CurriculumBoard, string> = {
  CBSE: 'CBSE (NCERT)',
  ICSE: 'ICSE / ISC',
  PSEB: 'PSEB (Punjab)',
  STATE_BOARD: 'State Board',
  JEE_MAIN: 'JEE Main',
  JEE_ADVANCED: 'JEE Advanced',
  NEET: 'NEET UG',
  IB_CAMBRIDGE: 'IB / Cambridge',
  AP_SAT: 'AP & SAT',
  US_COMMON_CORE: 'US High School STEM',
  UK_GCSE_ALEVEL: 'GCSE & A-Level',
  SINGAPORE_MOE: 'Singapore MOE',
};

// =========================================================================
// MODE-ADAPTIVE NOTES, FLOWCHARTS, MIND MAPS & WORKED EXAMPLES (Module C)
// =========================================================================
export const CHAPTER_STUDY_MODULES: Record<string, ChapterStudyModule> = {
  ch_p_01: {
    chapterId: 'ch_p_01',
    summary:
      'Rigid body rotational dynamics unites translational and angular motion using torque ($\\vec{\\tau} = \\vec{r} \\times \\vec{F}$), rotational inertia ($I = \\sum m_i r_i^2$), parallel & perpendicular axis theorems, and pure rolling constraint $v_{cm} = \\omega R$.',
    detailedNotes: [
      '1. **Moment of Inertia ($I$)**: Scalar analog of mass measuring rotational opposition: $I = \\int r^2 \\, dm$. Always depends on axis location & mass distribution.',
      '2. **Parallel Axis Theorem**: Valid for *all* shapes (planar or 3D): $I = I_{\\text{cm}} + Md^2$ where $I_{\\text{cm}}$ passes through the center of mass.',
      '3. **Perpendicular Axis Theorem**: Strictly for planar laminae in $x$-$y$ plane: $I_z = I_x + I_y$.',
      '4. **Rolling Without Slipping**: Static friction does zero net work! Down an incline of angle $\\theta$, $a = \\frac{g\\sin\\theta}{1 + I/(MR^2)}$ and $K_{\\text{total}} = \\frac{1}{2}Mv^2(1 + k^2/R^2)$.',
      '5. **Angular Momentum Conservation**: If $\\vec{\\tau}_{\\text{ext}} = 0$ about a fixed point, $\\vec{L} = \\vec{r} \\times \\vec{p} + I\\vec{\\omega}$ remains conserved even during non-elastic collisions.',
    ],
    normalNotes: [
      'Torque $\\tau = I\\alpha$; rolling kinetic energy combines translation $\\frac{1}{2}Mv^2$ and rotation $\\frac{1}{2}I\\omega^2$.',
      'Always use $I_{\\text{cm}} + Md^2$ when shifting to a parallel axis, never between two non-COM axes directly.',
      'For pure rolling on incline: $a = \\frac{g\\sin\\theta}{1 + I/(MR^2)}$; smaller $I/(MR^2)$ reaches bottom fastest (solid sphere beats disc & ring).',
    ],
    rapidBullets: [
      '$\\tau = I\\alpha = \\frac{dL}{dt}$',
      'Sphere $\\frac{2}{5}MR^2$ · Cylinder $\\frac{1}{2}MR^2$ · Ring $MR^2$',
      'Rolling race: Solid Sphere > Solid Cylinder > Hollow Sphere > Ring',
      'Conserve $\\vec{L}$ about hinge/impulse point whenever external impulse passes through it!',
    ],
    flowSteps: [
      'Identify Fixed / Instantaneous Axis',
      'Compute $I_{\\text{axis}}$ via Parallel/Perp Theorem',
      'Check Constraints ($a = \\alpha R$ for pure rolling)',
      'Solve Torque ($\\tau = I\\alpha$) OR Energy ($\\Delta K + \\Delta U = 0$)',
      'Verify $f_s \\le \\mu_s N$ before assuming no slip',
    ],
    mindMapRoot: 'Rotational Mechanics',
    mindMapBranches: [
      {
        id: 'mm_p1_1',
        title: 'Inertia & Axis Theorems',
        color: '#3B82F6',
        nodes: ['Parallel Axis $I = I_{cm}+Md^2$', 'Perp Axis $I_z=I_x+I_y$', 'Radius of Gyration $k$'],
        keyFormula: '$I_{\\text{rod, end}} = \\frac{1}{3}ML^2$',
      },
      {
        id: 'mm_p1_2',
        title: 'Angular Impulse & $\\vec{L}$',
        color: '#F97316',
        nodes: ['$\\vec{L} = \\vec{r}\\times m\\vec{v}_{cm} + I\\vec{\\omega}$', 'Bullet-Rod Collision Conservation'],
        keyFormula: '$\\int \\tau\\,dt = \\Delta L$',
      },
      {
        id: 'mm_p1_3',
        title: 'Pure Rolling Dynamics',
        color: '#10B981',
        nodes: ['Zero work by $f_s$', 'Contact point speed $= 0$', 'Minimum $\\mu_s$ condition'],
        keyFormula: '$a = \\frac{g\\sin\\theta}{1 + k^2/R^2}$',
      },
    ],
    workedExamples: [
      {
        id: 'we_p1',
        title: 'Rolling Sphere vs Disc Speed Ratio',
        problem:
          'A solid sphere and a solid disc roll without slipping from rest down the same incline of vertical height $h$. Find the ratio of their speeds at the bottom.',
        solutionSteps: [
          'By energy conservation (pure rolling => $f_s$ does zero work): $Mgh = \\frac{1}{2}Mv^2\\left(1 + \\frac{k^2}{R^2}\\right)$.',
          'For solid sphere, $k^2/R^2 = \\frac{2}{5} \\Rightarrow v_{\\text{sphere}} = \\sqrt{\\frac{10gh}{7}}$.',
          'For solid disc, $k^2/R^2 = \\frac{1}{2} \\Rightarrow v_{\\text{disc}} = \\sqrt{\\frac{4gh}{3}}$.',
        ],
        finalAnswer: '$v_{\\text{sphere}} : v_{\\text{disc}} = \\sqrt{15} : \\sqrt{14}$',
      },
    ],
    examPitfalls: [
      'Applying perpendicular axis theorem to cylinders or spheres (valid ONLY for thin 2D flat laminae!).',
      'Assuming friction is $\\mu N$ during pure rolling; static friction is self-adjusting ($f_s \\le \\mu_s N$).',
    ],
  },

  ch_p_02: {
    chapterId: 'ch_p_02',
    summary:
      'Electrostatics connects inverse-square forces ($\\vec{F} = q\\vec{E}$), Gauss’s flux law ($\\oint \\vec{E}\\cdot d\\vec{A} = q_{\\text{in}}/\\varepsilon_0$), conservative electric potential ($V$), and conductors in electrostatic equilibrium.',
    detailedNotes: [
      '1. **Gauss’s Law Symmetry**: Choose Gaussian surfaces matching spherical, cylindrical, or planar symmetry so $\\vec{E}$ is constant & normal.',
      '2. **Field vs Potential**: $\\vec{E} = -\\nabla V$; $E$ points in the direction of steepest *decrease* of $V$. Equipotentials are always perpendicular to field lines.',
      '3. **Conductor Cavities**: Inside a bulk conductor $\\vec{E}=0$ and $V$ is constant. Any enclosed charge $+q$ induces $-q$ on inner wall and $+q$ distributes cleanly outside (Faraday shielding).',
      '4. **Electric Dipole**: Axial field $E_a = \\frac{2kp}{r^3}$ is double equatorial $E_e = \\frac{kp}{r^3}$; torque $\\vec{\\tau} = \\vec{p}\\times\\vec{E}$ and potential energy $U = -\\vec{p}\\cdot\\vec{E}$.',
    ],
    normalNotes: [
      'Flux depends ONLY on charge enclosed ($q_{\\text{in}}/\\varepsilon_0$), while $\\vec{E}$ at every point depends on *all* charges (inside & outside).',
      'Shell theorem: Outside a uniform sphere it acts like a point charge; inside a hollow conducting shell, $E = 0$ and $V = \\frac{kQ}{R}$.',
    ],
    rapidBullets: [
      '$\\Phi_E = \\frac{q_{\\text{in}}}{\\varepsilon_0}$ (zero for closed surface with no enclosed $q$)',
      'Solid Sphere Self-Energy: $U = \\frac{3}{5}\\frac{kQ^2}{R}$',
      'Cube corner charge flux: $\\Phi = \\frac{q}{8\\varepsilon_0}$ (share of 8 cubes)',
    ],
    flowSteps: [
      'Check Charge Symmetry (Point, Line, Sheet, Sphere)',
      'Pick Law: Coulomb Integration vs Gauss Surface',
      'Use Potential $V$ for scalar work $W = q(V_f - V_i)$',
      'Enforce Grounding ($V=0$) or Shell Earthing Charge Flow',
    ],
    mindMapRoot: 'Electrostatics',
    mindMapBranches: [
      {
        id: 'mm_p2_1',
        title: 'Flux & Gauss Law',
        color: '#22D3EE',
        nodes: ['Closed Surface $\\Phi=q_{in}/\\varepsilon_0$', 'Cube Corner = $q/24\\varepsilon_0$ per face'],
        keyFormula: '$E_{\\text{sheet}} = \\frac{\\sigma}{2\\varepsilon_0}$',
      },
      {
        id: 'mm_p2_2',
        title: 'Conducting Shells',
        color: '#F97316',
        nodes: ['Zero internal $E$', 'Concentric Earthing => $V_{\\text{shell}}=0$'],
        keyFormula: '$V_{\\text{shell}} = \\frac{kQ_1}{r_1} + \\frac{kQ_2}{r_2}$',
      },
    ],
    workedExamples: [
      {
        id: 'we_p2',
        title: 'Flux Through Five Faces of a Cube',
        problem: 'A charge $q$ sits at the center of one open face of a cube. Find the electric flux passing through the other five faces.',
        solutionSteps: [
          'Imagine placing an identical second cube adjacent to the open face so $q$ lies at the exact center of the 2-cube prism.',
          'Total flux exiting both cubes (10 outer faces total) is $q/\\varepsilon_0$.',
          'By symmetry each cube receives half the total flux: $\\Phi_{\\text{cube}} = \\frac{q}{2\\varepsilon_0}$.',
        ],
        finalAnswer: '$\\Phi = \\frac{q}{2\\varepsilon_0}$',
      },
    ],
    examPitfalls: [
      'Confusing potential of a uniform non-conducting solid sphere at center ($1.5 \\frac{kQ}{R}$) vs surface ($\\frac{kQ}{R}$).',
    ],
  },

  ch_c_01: {
    chapterId: 'ch_c_01',
    summary:
      'General Organic Chemistry governs carbocation/carbanion stability, resonance canonical weight, $+I/-I/+M/-M$ electronic effects, Hückel aromaticity ($4n+2\\,\\pi\\,e^-$), and $pK_a$ / $pK_b$ rankings.',
    detailedNotes: [
      '1. **Electronic Hierarchy**: Resonance ($M/R$) > Hyperconjugation ($H$) > Inductive ($I$) in deciding carbocation & radical stability — EXCEPT halogens on benzene where $-I > +M$.',
      '2. **Hückel Aromaticity Rules**: Molecule must be **Cyclic**, **Planar ($sp^2$)**, **Completely Conjugated**, and contain $(4n+2)\\pi$ electrons ($2, 6, 10, 14\\dots$). Anti-aromatic has $4n\\,\\pi$ electrons and is highly unstable.',
      '3. **Ortho Effect in Benzoic Acid**: Almost any ortho-substituent increases acidity of benzoic acid relative to para/meta due to steric inhibition of resonance (SIR) forcing $-COOH$ out of plane and stabilizing conjugate base.',
    ],
    normalNotes: [
      'Count $\\alpha$-C–H bonds next to alkene or carbocation to rank Hyperconjugation stability.',
      'Basicity order of amines in water ($\\text{R}=\\text{Et}$): $2^\\circ > 3^\\circ > 1^\\circ > \\text{NH}_3$; in gas phase: $3^\\circ > 2^\\circ > 1^\\circ$.',
    ],
    rapidBullets: [
      'Stability: Aromatic > Conjugated $3^\\circ$ > $3^\\circ$ > $2^\\circ$ > $1^\\circ$ > Anti-aromatic',
      'Acidity $\\propto$ stability of conjugate base $A^-$',
      'Tropylium cation ($C_7H_7^+$) & Cyclopentadienyl anion ($C_5H_5^-$) are aromatic ($6\\pi\\,e^-$)!',
    ],
    flowSteps: [
      'Draw Resonance Structures & Check Octets',
      'Apply Aromatic / Anti-aromatic $4n+2$ Test',
      'Compare Hybridization Electronegativity ($sp > sp^2 > sp^3$)',
      'Rank Conjugate Base Stability for $K_a$ / $pK_a$',
    ],
    mindMapRoot: 'GOC Mastery',
    mindMapBranches: [
      {
        id: 'mm_c1_1',
        title: 'Electronic Effects',
        color: '#10B981',
        nodes: ['Inductive ($\sigma$ permanent)', 'Resonance ($\pi$ delocalized)', 'Hyperconjugation ($\sigma$-$\\pi$)'],
        keyFormula: 'Electronegativity: $sp > sp^2 > sp^3$',
      },
      {
        id: 'mm_c1_2',
        title: 'Aromaticity & Strength',
        color: '#F97316',
        nodes: ['Aromatic $(4n+2)\\pi$', 'Ortho Effect (SIR)', 'Guanidine strong base'],
        keyFormula: '$pK_a + pK_b = 14$ (conj pair)',
      },
    ],
    workedExamples: [
      {
        id: 'we_c1',
        title: 'Comparing Phenol, Ethanol & Acetic Acid Acidity',
        problem: 'Arrange $CH_3CH_2OH$, $C_6H_5OH$, and $CH_3COOH$ in increasing order of acidic strength.',
        solutionSteps: [
          'Acetate ion ($CH_3COO^-$) has two equivalent resonance structures distributing negative charge on electronegative O atoms.',
          'Phenoxide ion ($C_6H_5O^-$) delocalizes charge onto less electronegative ring carbons (non-equivalent canonical forms).',
          'Ethoxide ion ($CH_3CH_2O^-$) suffers destabilizing $+I$ effect from ethyl group.',
        ],
        finalAnswer: '$CH_3CH_2OH < C_6H_5OH < CH_3COOH$',
      },
    ],
    examPitfalls: [
      'Forgetting Bredt’s Rule: Carbocations/alkenes cannot stably form at bridgehead carbons of small bicyclic systems.',
    ],
  },

  ch_m_01: {
    chapterId: 'ch_m_01',
    summary:
      'Definite Integration solves area and limit-of-sum problems rapidly using symmetry properties (King’s Property, even/odd parity, periodicity) and Newton-Leibniz differentiation under the integral sign.',
    detailedNotes: [
      '1. **King’s Property**: $\\int_a^b f(x)\\,dx = \\int_a^b f(a+b-x)\\,dx$. Add $I + I$ whenever denominator contains symmetric expressions like $f(x)+f(a+b-x)$ or $\\sin^n x + \\cos^n x$.',
      '2. **Wallis / Reduction Intuition**: On $[0, \\pi/2]$, $\\int \\sin^n x\\,dx = \\int \\cos^n x\\,dx$.',
      '3. **Leibnitz Rule**: $\\frac{d}{dx}\\int_{g(x)}^{h(x)} f(t)\\,dt = f(h(x))h\'(x) - f(g(x))g\'(x)$. Essential for $0/0$ L’Hôpital limit problems.',
    ],
    normalNotes: [
      'Always test odd/even parity first on symmetric interval $[-a, a]$: $\\int_{-a}^a \\text{odd}\\,dx = 0$.',
      'Convert Limit of a Sum $\\lim_{n\\to\\infty} \\frac{1}{n}\\sum f(r/n)$ into $\\int_0^1 f(x)\\,dx$.',
    ],
    rapidBullets: [
      '$I = \\int_a^b \\frac{f(x)}{f(x)+f(a+b-x)}\\,dx = \\frac{b-a}{2}$',
      'Area between $y^2 = 4ax$ & $x^2 = 4by$: $A = \\frac{16ab}{3}$',
      'Periodic $f(x+T)=f(x)$: $\\int_0^{nT} f(x)\\,dx = n\\int_0^T f(x)\\,dx$',
    ],
    flowSteps: [
      'Check Interval Symmetry ($[-a,a]$ -> Even/Odd)',
      'Try King Substitution ($x \\to a+b-x$)',
      'Handle Piecewise / $|\\cdot|$ / $[\\cdot]$ Split Points',
      'Apply Leibnitz if Differentiating Variable Limits',
    ],
    mindMapRoot: 'Definite Calculus',
    mindMapBranches: [
      {
        id: 'mm_m1_1',
        title: 'Core Integral Theorems',
        color: '#8B5CF6',
        nodes: ['King’s Property', 'Queen’s Property ($0..2a$)', 'Even/Odd Parity'],
        keyFormula: '$\\int_{-a}^a f(x)dx = 2\\int_0^a f(x)dx$ (even)',
      },
      {
        id: 'mm_m1_2',
        title: 'Leibnitz & Area Traps',
        color: '#F97316',
        nodes: ['Derivative of Integral', 'Parabola-Line Area $\\frac{8a^2}{3m^3}$', 'Symmetry Sketching'],
        keyFormula: '$\\frac{d}{dx}\\int_{g}^{h} f(t)dt = f(h)h\'-f(g)g\'$',
      },
    ],
    workedExamples: [
      {
        id: 'we_m1',
        title: 'Classic Trigonometric King Integral',
        problem: 'Evaluate $I = \\int_0^{\\pi/2} \\frac{\\sqrt{\\sin x}}{\\sqrt{\\sin x} + \\sqrt{\\cos x}}\\,dx$.',
        solutionSteps: [
          'Replace $x \\to \\frac{\\pi}{2} - x$ using King’s Property.',
          'Then $I = \\int_0^{\\pi/2} \\frac{\\sqrt{\\cos x}}{\\sqrt{\\cos x} + \\sqrt{\\sin x}}\\,dx$.',
          'Adding the two integrals: $2I = \\int_0^{\\pi/2} 1\\,dx = \\frac{\\pi}{2}$.',
        ],
        finalAnswer: '$I = \\frac{\\pi}{4}$',
      },
    ],
    examPitfalls: [
      'Integrating across vertical asymptotes (like $\\int_{-1}^1 \\frac{1}{x^2}\\,dx$) using naive antiderivatives — always check continuity!',
    ],
  },

  ch_b_01: {
    chapterId: 'ch_b_01',
    summary:
      'Molecular Genetics explains semiconservative DNA replication, transcription/translation through the genetic code, Lac Operon transcriptional control, and population genetics via Hardy-Weinberg equilibrium.',
    detailedNotes: [
      '1. **DNA Replication Fork**: Leading strand synthesizes continuously $5\'\\to 3\'$; lagging strand forms Okazaki fragments joined by **DNA Ligase**. RNA primers placed by **Primase**.',
      '2. **Lac Operon**: Negatively regulated inducible operon. In presence of lactose (allolactose inducer), repressor detaches from Operator so RNA polymerase transcribes `lacZ` ($\\beta$-galactosidase), `lacY` (permease), `lacA` (transacetylase).',
      '3. **Hardy-Weinberg Equilibrium**: Allele frequencies remain constant across generations only when NO mutation, NO gene flow, NO genetic drift, NO natural selection, and strictly random mating hold.',
    ],
    normalNotes: [
      'Chargaff rule holds for dsDNA: $[A]=[T]$ and $[G]=[C]$.',
      'AUG codes for Methionine (Start codon); UAA, UAG, UGA are Stop (nonsense) codons.',
    ],
    rapidBullets: [
      'DNA Pol ALWAYS polymerizes $5\' \\to 3\'$ (template read $3\' \\to 5\'$)',
      '$p + q = 1$; Carriers = $2pq$; Homozygous Recessive = $q^2$',
      'Heterochromatin = darkly stained, transcriptionally inactive',
    ],
    flowSteps: [
      'DNA Unwinds (Helicase) + SSB stabilization',
      'Leading / Lagging $5\'\\to 3\'$ Synthesis (DNA Pol III)',
      'Transcription to pre-mRNA (Capping + Poly-A + Splicing)',
      'Ribosomal Translation ($AUG \\to$ Polypeptide)',
    ],
    mindMapRoot: 'Molecular Genetics',
    mindMapBranches: [
      {
        id: 'mm_b1_1',
        title: 'Central Dogma & Enzymes',
        color: '#EC4899',
        nodes: ['Helicase & Topoisomerase', 'DNA Ligase', 'Intron Splicing (snRNP)'],
        keyFormula: '$[A+G] / [T+C] = 1$ (dsDNA)',
      },
      {
        id: 'mm_b1_2',
        title: 'Operon & Population',
        color: '#10B981',
        nodes: ['Inducer: Allolactose', 'Carrier Freq = $2pq$', '5 Evolution Violations'],
        keyFormula: '$p^2 + 2pq + q^2 = 1$',
      },
    ],
    workedExamples: [
      {
        id: 'we_b1',
        title: 'Hardy-Weinberg Carrier Frequency Problem',
        problem: 'In a randomly mating population, $9\\%$ of individuals show an autosomal recessive trait. Find the percentage of heterozygous carriers.',
        solutionSteps: [
          'Recessive phenotype frequency is $q^2 = 0.09 \\Rightarrow q = \\sqrt{0.09} = 0.3$.',
          'Dominant allele frequency $p = 1 - q = 0.7$.',
          'Heterozygous carrier frequency $= 2pq = 2(0.7)(0.3) = 0.42$.',
        ],
        finalAnswer: '$42\\%$ of the population are heterozygous carriers',
      },
    ],
    examPitfalls: [
      'Confusing template strand ($3\'\\to 5\'$) vs coding strand ($5\'\\to 3\'$) sequence when writing mRNA transcripts (replace T with U directly in coding strand!).',
    ],
  },
};

export function getChapterStudyModule(chapter: Chapter): ChapterStudyModule {
  if (CHAPTER_STUDY_MODULES[chapter.id]) {
    return CHAPTER_STUDY_MODULES[chapter.id];
  }
  return {
    chapterId: chapter.id,
    summary: `${chapter.title} covers ${chapter.topics.length} core syllabus pillars with ${chapter.totalQuestions} exam-style practice problems.`,
    detailedNotes: chapter.topics.map(
      (t, i) => `${i + 1}. **${t.title}** — Master definitions, boundary conditions, and ${t.pyqCount} past-year problem patterns.`
    ),
    normalNotes: chapter.topics.map((t) => `${t.title}: focus on core derivations & ${t.pyqCount} high-yield PYQs.`),
    rapidBullets: chapter.topics.map((t) => `${t.title} · ${t.pyqCount} PYQs`),
    flowSteps: chapter.topics.map((t) => t.title),
    mindMapRoot: chapter.title,
    mindMapBranches: chapter.topics.map((t, idx) => ({
      id: `${chapter.id}_mm_${idx}`,
      title: t.title,
      color: idx % 2 === 0 ? '#F97316' : '#22D3EE',
      nodes: [`PYQs: ${t.pyqCount}`, `Revisions logged: ${t.revisionCount}`],
    })),
    workedExamples: [],
    examPitfalls: ['Verify SI units and sign conventions before locking numerical answers.'],
  };
}

// =========================================================================
// CHEMISTRY REFERENCE TABLES (Module H: Academic Tools)
// =========================================================================
export interface ChemReferenceSection {
  id: string;
  title: string;
  subtitle: string;
  rows: { col1: string; col2: string; col3: string }[];
  headers: [string, string, string];
}

export const CHEMISTRY_REFERENCE_TABLES: ChemReferenceSection[] = [
  {
    id: 'iupac_priority',
    title: 'IUPAC Functional Group Priority Order',
    subtitle: 'Ordered from highest principal suffix priority to prefix-only substituents',
    headers: ['Priority / Class', 'Formula', 'Prefix / Suffix'],
    rows: [
      { col1: '1. Carboxylic Acid', col2: '-COOH', col3: 'carboxy- / -oic acid' },
      { col1: '2. Sulfonic Acid', col2: '-SO₃H', col3: 'sulfo- / -sulfonic acid' },
      { col1: '3. Ester', col2: '-COOR', col3: 'alkoxycarbonyl- / -oate' },
      { col1: '4. Acyl Halide', col2: '-COX', col3: 'halocarbonyl- / -oyl halide' },
      { col1: '5. Amide', col2: '-CONH₂', col3: 'carbamoyl- / -amide' },
      { col1: '6. Nitrile', col2: '-CN', col3: 'cyano- / -nitrile' },
      { col1: '7. Aldehyde', col2: '-CHO', col3: 'formyl- / -al' },
      { col1: '8. Ketone', col2: '>C=O', col3: 'oxo- / -one' },
      { col1: '9. Alcohol', col2: '-OH', col3: 'hydroxy- / -ol' },
      { col1: '10. Amine', col2: '-NH₂', col3: 'amino- / -amine' },
    ],
  },
  {
    id: 'indicators',
    title: 'Acid–Base Indicators & pH Transitions',
    subtitle: 'Standard titration endpoints for strong/weak acid-base curves',
    headers: ['Indicator', 'pH Range', 'Acid → Base Color'],
    rows: [
      { col1: 'Methyl Orange', col2: '3.1 – 4.4', col3: 'Red → Yellow' },
      { col1: 'Methyl Red', col2: '4.4 – 6.2', col3: 'Red → Yellow' },
      { col1: 'Bromothymol Blue', col2: '6.0 – 7.6', col3: 'Yellow → Blue' },
      { col1: 'Litmus', col2: '5.0 – 8.0', col3: 'Red → Blue' },
      { col1: 'Phenolphthalein', col2: '8.2 – 10.0', col3: 'Colorless → Pink' },
    ],
  },
  {
    id: 'flame_tests',
    title: 'Qualitative Flame Tests & Cation Analysis',
    subtitle: 'Characteristic emission wavelengths and precipitate confirmatory hues',
    headers: ['Cation', 'Flame Color', 'Group / Confirmatory Note'],
    rows: [
      { col1: 'Li⁺ (Lithium)', col2: 'Crimson Red', col3: '670.8 nm · Intense red-carmine' },
      { col1: 'Na⁺ (Sodium)', col2: 'Golden Yellow', col3: '589 nm D-doublet' },
      { col1: 'K⁺ (Potassium)', col2: 'Lilac / Violet', col3: 'Viewed through cobalt glass' },
      { col1: 'Ca²⁺ (Calcium)', col2: 'Brick Red', col3: 'Group V · (NH₄)₂C₂O₄ white ppt' },
      { col1: 'Ba²⁺ (Barium)', col2: 'Apple Green', col3: 'Group V · K₂CrO₄ yellow ppt' },
      { col1: 'Cu²⁺ (Copper)', col2: 'Bluish-Green', col3: 'Deep blue [Cu(NH₃)₄]²⁺ in NH₃' },
    ],
  },
];
