export interface ExamEventDate {
  type: 'registration_start' | 'registration_end' | 'admit_card' | 'exam_date' | 'result' | 'counselling';
  date: string;
  label: string;
  tentative?: boolean;
}

export interface NationalExamMeta {
  id: string;
  name: string;
  shortName: string;
  category: 'engineering' | 'medical' | 'general' | 'management' | 'government';
  conductingBody: string;
  officialUrl: string;
  eligibility: string;
  color: string;
  icon: string;
  syllabusAvailable: boolean;
  syllabusFileName?: string;
  dates: ExamEventDate[];
}

export const NATIONAL_EXAMS_CALENDAR: NationalExamMeta[] = [
  {
    id: 'jee-main',
    name: 'Joint Entrance Examination (Main)',
    shortName: 'JEE Main',
    category: 'engineering',
    conductingBody: 'National Testing Agency (NTA)',
    officialUrl: 'https://jeemain.nta.ac.in',
    eligibility: 'Class 12 appearing/passed with Physics & Mathematics; no age limit.',
    color: '#3B82F6',
    icon: 'Atom',
    syllabusAvailable: true,
    syllabusFileName: 'jee-main-2026-syllabus.pdf',
    dates: [
      { type: 'registration_start', date: '2025-10-31', label: 'Session 1 Registration Opens' },
      { type: 'registration_end', date: '2025-11-27', label: 'Session 1 Registration Closes' },
      { type: 'admit_card', date: '2026-01-17', label: 'Admit Card - Session 1' },
      { type: 'exam_date', date: '2026-01-21', label: 'JEE Main Session 1 Exam Week Begins' },
      { type: 'result', date: '2026-02-16', label: 'Session 1 Official Scorecard Release' },
      { type: 'registration_start', date: '2026-02-01', label: 'Session 2 Registration Opens' },
      { type: 'registration_end', date: '2026-03-13', label: 'Session 2 Final Registration Deadline' },
      { type: 'admit_card', date: '2026-03-29', label: 'Admit Card - Session 2' },
      { type: 'exam_date', date: '2026-04-02', label: 'JEE Main Session 2 Exam Week Begins' },
      { type: 'result', date: '2026-04-20', label: 'Session 2 Final Results & All India Ranks' },
      { type: 'counselling', date: '2026-06-10', label: 'JoSAA Joint Seat Allocation Begins' },
    ],
  },
  {
    id: 'neet-ug',
    name: 'National Eligibility cum Entrance Test (UG)',
    shortName: 'NEET UG',
    category: 'medical',
    conductingBody: 'National Testing Agency (NTA)',
    officialUrl: 'https://neet.nta.nic.in',
    eligibility: 'Class 12 with Physics, Chemistry, Biology/Biotech; age 17+ years.',
    color: '#10B981',
    icon: 'HeartPulse',
    syllabusAvailable: true,
    syllabusFileName: 'neet-ug-2026-syllabus.pdf',
    dates: [
      { type: 'registration_start', date: '2026-02-09', label: 'NEET UG Application Window Opens' },
      { type: 'registration_end', date: '2026-03-16', label: 'Application Form Submission Closes' },
      { type: 'admit_card', date: '2026-05-01', label: 'Hall Ticket & City Intimation Slip' },
      { type: 'exam_date', date: '2026-05-04', label: 'NEET UG 2026 Pen-and-Paper Examination' },
      { type: 'result', date: '2026-06-14', label: 'NEET UG All India Ranks & Cutoffs' },
      { type: 'counselling', date: '2026-07-06', label: 'MCC 15% All India Quota Counselling' },
    ],
  },
  {
    id: 'bitsat',
    name: 'BITS Admission Test (Pilani, Goa, Hyderabad)',
    shortName: 'BITSAT',
    category: 'engineering',
    conductingBody: 'Birla Institute of Technology and Science',
    officialUrl: 'https://www.bitsadmission.com',
    eligibility: 'Class 12 with 75% aggregate in PCM/PCB (min 60% in each subject).',
    color: '#F59E0B',
    icon: 'Zap',
    syllabusAvailable: false,
    dates: [
      { type: 'registration_start', date: '2026-01-15', label: 'BITSAT Session 1 Registration Opens' },
      { type: 'registration_end', date: '2026-04-11', label: 'Session 1 Registration Deadline' },
      { type: 'exam_date', date: '2026-05-20', label: 'BITSAT Session 1 Online Exam Window' },
      { type: 'exam_date', date: '2026-06-22', label: 'BITSAT Session 2 Online Exam Window' },
    ],
  },
  {
    id: 'cuet-ug',
    name: 'Common University Entrance Test (UG)',
    shortName: 'CUET UG',
    category: 'general',
    conductingBody: 'National Testing Agency (NTA)',
    officialUrl: 'https://cuetug.ntaonline.in',
    eligibility: 'Class 12 pass/appearing from any recognized education board.',
    color: '#8B5CF6',
    icon: 'GraduationCap',
    syllabusAvailable: false,
    dates: [
      { type: 'registration_start', date: '2026-02-27', label: 'CUET UG Registration Opens' },
      { type: 'registration_end', date: '2026-03-31', label: 'Registration Closes' },
      { type: 'admit_card', date: '2026-05-10', label: 'Admit Card Issued' },
      { type: 'exam_date', date: '2026-05-15', label: 'CUET UG 2026 Hybrid Exam Begins' },
      { type: 'result', date: '2026-06-30', label: 'Scorecards Declared' },
    ],
  },
  {
    id: 'gate',
    name: 'Graduate Aptitude Test in Engineering',
    shortName: 'GATE',
    category: 'engineering',
    conductingBody: 'Indian Institute of Technology (IIT)',
    officialUrl: 'https://gate2026.iit.ac.in',
    eligibility: 'Engineering/Tech graduates or final-year students.',
    color: '#EC4899',
    icon: 'Cpu',
    syllabusAvailable: false,
    dates: [
      { type: 'registration_start', date: '2025-08-28', label: 'GATE Online Applications Open' },
      { type: 'registration_end', date: '2025-10-11', label: 'Late Registration Closes' },
      { type: 'admit_card', date: '2026-01-02', label: 'Admit Card Available for Download' },
      { type: 'exam_date', date: '2026-02-07', label: 'GATE 2026 Examination Weekend 1' },
      { type: 'result', date: '2026-03-19', label: 'GATE Official Results & Normalised Marks' },
    ],
  },
];
