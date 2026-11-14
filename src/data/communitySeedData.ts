/**
 * Study Labs — Community Hub Seed Data
 * Pre-seeds peer doubt questions, step-by-step KaTeX solutions, community-uploaded notes,
 * and user karma scores across STEM & Computer Science.
 */

import type { CommunityQuestion, CommunityResource } from '../types';

export const SEED_COMMUNITY_QUESTIONS: CommunityQuestion[] = [
  {
    id: 'cq_phys_01',
    title: 'Why is the acceleration of a hollow sphere less than a solid sphere down the same rough incline?',
    content: 'Can someone explain the rotational mechanics step-by-step? If both have mass $M$ and radius $R$, why does the solid sphere reach the bottom first when released from rest? $a = \\frac{g\\sin\\theta}{1 + k^2/R^2}$',
    subject: 'physics',
    gradeLevel: 'Class 12 / JEE',
    tags: ['Rotational Dynamics', 'Rolling Motion', 'JEE Main'],
    bountyXp: 50,
    authorId: 'usr_local_01',
    authorName: 'Aarav Sharma',
    authorAvatarColor: '#F97316',
    createdAt: '2026-11-12T10:30:00.000Z',
    upvotesCount: 28,
    downvotesCount: 1,
    userVote: null,
    isResolved: true,
    verifiedAnswerId: 'ans_phys_01',
    answers: [
      {
        id: 'ans_phys_01',
        questionId: 'cq_phys_01',
        content: `Great question! When a body rolls without slipping down an incline, the linear acceleration is given by:
$$a = \\frac{g \\sin \\theta}{1 + \\frac{k^2}{R^2}} = \\frac{g \\sin \\theta}{1 + \\frac{I}{MR^2}}$$

1. **For a solid sphere**:
   $$I_{\\text{solid}} = \\frac{2}{5} M R^2 \\implies \\frac{I}{MR^2} = \\frac{2}{5} = 0.4$$
   $$a_{\\text{solid}} = \\frac{g \\sin \\theta}{1 + 0.4} = \\frac{5}{7} g \\sin \\theta \\approx 0.714 g \\sin \\theta$$

2. **For a hollow spherical shell**:
   $$I_{\\text{hollow}} = \\frac{2}{3} M R^2 \\implies \\frac{I}{MR^2} = \\frac{2}{3} \\approx 0.667$$
   $$a_{\\text{hollow}} = \\frac{g \\sin \\theta}{1 + \\frac{2}{3}} = \\frac{3}{5} g \\sin \\theta = 0.600 g \\sin \\theta$$

Since $\\frac{5}{7} > \\frac{3}{5}$, the solid sphere accelerates faster. In a hollow sphere, mass is concentrated far from the rotational axis, demanding a larger fraction of gravitational potential energy to be diverted into rotational kinetic energy ($\\frac{1}{2}I\\omega^2$), leaving less energy for translational acceleration!`,
        authorId: 'fac_dr_kapoor',
        authorName: 'Dr. R. Kapoor',
        authorRole: 'Principal / Physics Chair',
        authorAvatarColor: '#F59E0B',
        upvotesCount: 42,
        downvotesCount: 0,
        userVote: null,
        isVerified: true,
        createdAt: '2026-11-12T11:05:00.000Z',
      },
      {
        id: 'ans_phys_02',
        questionId: 'cq_phys_01',
        content: 'Another intuitive way to remember this is: smaller rotational inertia means the body is "easier to spin", so it translates down the slope quicker. Solid sphere wins every race against a hollow sphere or ring!',
        authorId: 'peer_ananya',
        authorName: 'Ananya Verma',
        authorRole: 'Student (Batch A1)',
        authorAvatarColor: '#8B5CF6',
        upvotesCount: 15,
        downvotesCount: 0,
        userVote: null,
        isVerified: false,
        createdAt: '2026-11-12T11:40:00.000Z',
      },
    ],
  },
  {
    id: 'cq_chem_01',
    title: 'How does polar protic solvent favor SN1 over SN2 reaction mechanisms?',
    content: 'In nucleophilic substitution, why does water or ethanol accelerate $S_N1$ while slowing down $S_N2$? Please explain with carbocation stabilization.',
    subject: 'chemistry',
    gradeLevel: 'Class 12 / NEET',
    tags: ['Organic Chemistry', 'SN1 vs SN2', 'Carbocations'],
    bountyXp: 35,
    authorId: 'peer_rohan',
    authorName: 'Rohan Kulkarni',
    authorAvatarColor: '#10B981',
    createdAt: '2026-11-12T14:15:00.000Z',
    upvotesCount: 21,
    downvotesCount: 0,
    userVote: null,
    isResolved: true,
    verifiedAnswerId: 'ans_chem_01',
    answers: [
      {
        id: 'ans_chem_01',
        questionId: 'cq_chem_01',
        content: `Here is the chemical thermodynamic breakdown:
1. **$S_N1$ Mechanism**:
   The rate-determining step is heterolytic cleavage of the $C-X$ bond to form a carbocation intermediate:
   $$\\text{R-X} \\xrightarrow{\\text{slow}} \\text{R}^+ + \\text{X}^-$$
   Polar protic solvents (like $H_2O, CH_3OH$) possess acidic hydrogen atoms capable of hydrogen bonding:
   - They solvate the leaving group $\\text{X}^-$ through hydrogen bonding.
   - They solvate the $\\text{R}^+$ carbocation through dipole-charge interactions with lone pairs on oxygen.
   This dramatically lowers the activation energy $\\Delta G^\\ddagger$ for ion separation!

2. **$S_N2$ Mechanism**:
   In $S_N2$, the nucleophile $\\text{Nu}^-$ directly attacks the substrate:
   $$\\text{Rate} = k[\\text{R-X}][\\text{Nu}^-]$$
   A polar protic solvent forms a tight hydrogen-bonding solvation cage around $\\text{Nu}^-$, quenching its nucleophilicity. Therefore, polar **aprotic** solvents (DMSO, DMF, Acetone) are preferred for $S_N2$ because they leave nucleophiles "naked" and reactive!`,
        authorId: 'fac_meera_chem',
        authorName: 'Prof. Meera Iyer',
        authorRole: 'Teacher (Chemistry)',
        authorAvatarColor: '#22D3EE',
        upvotesCount: 38,
        downvotesCount: 0,
        userVote: null,
        isVerified: true,
        createdAt: '2026-11-12T15:20:00.000Z',
      },
    ],
  },
  {
    id: 'cq_math_01',
    title: 'Evaluating definite integral: ∫[0 to π/2] (sin^4 x) / (sin^4 x + cos^4 x) dx',
    content: 'What is the fastest symmetry property of definite integrals to solve $\\int_0^{\\pi/2} \\frac{\\sin^4 x}{\\sin^4 x + \\cos^4 x} dx$ without calculating antiderivatives?',
    subject: 'math',
    gradeLevel: 'Class 12 / JEE',
    tags: ['Definite Integrals', 'Kings Rule', 'Calculus'],
    bountyXp: 40,
    authorId: 'peer_sneha',
    authorName: 'Sneha Nair',
    authorAvatarColor: '#EC4899',
    createdAt: '2026-11-12T16:00:00.000Z',
    upvotesCount: 19,
    downvotesCount: 0,
    userVote: null,
    isResolved: true,
    verifiedAnswerId: 'ans_math_01',
    answers: [
      {
        id: 'ans_math_01',
        questionId: 'cq_math_01',
        content: `Use King's Property: $\\int_a^b f(x) dx = \\int_a^b f(a + b - x) dx$.

Let:
$$I = \\int_0^{\\pi/2} \\frac{\\sin^4 x}{\\sin^4 x + \\cos^4 x} dx \\quad \\text{--- (1)}$$

Applying property with $a+b-x = \\frac{\\pi}{2} - x$:
$$I = \\int_0^{\\pi/2} \\frac{\\sin^4(\\frac{\\pi}{2} - x)}{\\sin^4(\\frac{\\pi}{2} - x) + \\cos^4(\\frac{\\pi}{2} - x)} dx$$
Since $\\sin(\\frac{\\pi}{2} - x) = \\cos x$ and $\\cos(\\frac{\\pi}{2} - x) = \\sin x$:
$$I = \\int_0^{\\pi/2} \\frac{\\cos^4 x}{\\cos^4 x + \\sin^4 x} dx \\quad \\text{--- (2)}$$

Adding $(1)$ and $(2)$:
$$2I = \\int_0^{\\pi/2} \\frac{\\sin^4 x + \\cos^4 x}{\\sin^4 x + \\cos^4 x} dx = \\int_0^{\\pi/2} 1 dx = \\frac{\\pi}{2}$$
$$I = \\frac{\\pi}{4}$$`,
        authorId: 'usr_local_01',
        authorName: 'Aarav Sharma',
        authorRole: 'Class Monitor',
        authorAvatarColor: '#F97316',
        upvotesCount: 29,
        downvotesCount: 0,
        userVote: null,
        isVerified: true,
        createdAt: '2026-11-12T16:30:00.000Z',
      },
    ],
  },
];

export const SEED_COMMUNITY_RESOURCES: CommunityResource[] = [
  {
    id: 'cres_01',
    title: 'Rotational Motion & Inertia Master Mind Map (PDF & Notes)',
    description: 'Comprehensive handwritten formulas, parallel & perpendicular axis theorems, rolling on incline, and angular momentum conservation.',
    subject: 'physics',
    gradeLevel: 'Class 11 / 12',
    format: 'notes',
    tags: ['Physics', 'Mechanics', 'Formula Sheet', 'Mind Map'],
    authorId: 'usr_local_01',
    authorName: 'Aarav Sharma',
    authorRole: 'Student (Batch A1)',
    status: 'approved',
    upvotesCount: 54,
    downloadsCount: 182,
    fileSizeFormatted: '1.4 MB',
    createdAt: '2026-11-10T14:00:00.000Z',
    userVote: null,
  },
  {
    id: 'cres_02',
    title: 'Named Organic Reactions Cheat Sheet (Aldol, Cannizzaro, Sandmeyer)',
    description: 'Quick revision cards for all 32 essential organic named reactions with reagents, intermediates, and stereochemical outcomes.',
    subject: 'chemistry',
    gradeLevel: 'Class 12 / NEET',
    format: 'formula_sheet',
    tags: ['Organic Chemistry', 'Named Reactions', 'Reagents'],
    authorId: 'fac_meera_chem',
    authorName: 'Prof. Meera Iyer',
    authorRole: 'Teacher',
    status: 'approved',
    upvotesCount: 89,
    downloadsCount: 340,
    fileSizeFormatted: '2.1 MB',
    createdAt: '2026-11-09T09:30:00.000Z',
    userVote: null,
  },
  {
    id: 'cres_03',
    title: 'Top 50 Definite Integration PYQs with Step-by-Step KaTeX Solutions',
    description: 'Curated previous 10 years JEE Main and Advanced questions on King Property, periodicity, and Leibniz integral rule.',
    subject: 'math',
    gradeLevel: 'Class 12 / JEE',
    format: 'questions',
    tags: ['Maths', 'Calculus', 'PYQ', 'JEE Advanced'],
    authorId: 'fac_dr_kapoor',
    authorName: 'Dr. R. Kapoor',
    authorRole: 'Principal',
    status: 'approved',
    upvotesCount: 76,
    downloadsCount: 295,
    fileSizeFormatted: '3.2 MB',
    createdAt: '2026-11-08T16:20:00.000Z',
    userVote: null,
  },
  {
    id: 'cres_04',
    title: 'Cybersecurity Threat Modeling & Incident Handling Handbook',
    description: 'Student guide to STRIDE threat modeling, network forensics basics, and blue team defense architectures.',
    subject: 'cs_cyber',
    gradeLevel: 'Undergraduate / Competitive',
    format: 'book',
    tags: ['Cybersecurity', 'Threat Modeling', 'Forensics', 'CS'],
    authorId: 'usr_local_01',
    authorName: 'Aarav Sharma',
    authorRole: 'Student',
    status: 'approved',
    upvotesCount: 41,
    downloadsCount: 120,
    fileSizeFormatted: '4.8 MB',
    createdAt: '2026-11-11T12:00:00.000Z',
    userVote: null,
  },
];

