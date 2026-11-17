// Auto-compiled from GlobalExamCalender (MIT License)
export interface GlobalExamRecord {
  id: string;
  name: string;
  shortName: string;
  country: string;
  countryCode: string;
  region: string;
  category: string;
  conductingBody: string;
  frequency: string;
  officialUrl: string;
  eligibility: string;
  tags: string[];
  dates: Array<{ type: string; date: string; label: string; tentative?: boolean }>;
}

export const GLOBAL_EXAMS_IMPORT: GlobalExamRecord[] = [
  {
    "id": "atar",
    "name": "Australian Tertiary Admission Rank",
    "shortName": "ATAR/HSC",
    "country": "Australia",
    "countryCode": "AU",
    "region": "Oceania",
    "category": "entrance",
    "conductingBody": "Universities Admissions Centre (UAC) / State Education Authorities",
    "frequency": "annual",
    "officialUrl": "https://www.uac.edu.au",
    "eligibility": "Year 12 students in Australia",
    "tags": [
      "australia",
      "university",
      "hsc",
      "vce",
      "atar"
    ],
    "dates": [
      {
        "type": "registration_start",
        "date": "2026-04-08",
        "label": "UAC Applications Open",
        "tentative": false
      },
      {
        "type": "exam_date",
        "date": "2026-10-13",
        "label": "HSC Written Exams Begin (NSW)",
        "tentative": false
      },
      {
        "type": "exam_date",
        "date": "2026-11-06",
        "label": "HSC Written Exams End (NSW)",
        "tentative": true
      },
      {
        "type": "result",
        "date": "2026-12-16",
        "label": "ATAR Released (NSW & ACT)",
        "tentative": false
      }
    ]
  },
  {
    "id": "enem",
    "name": "Exame Nacional do Ensino Médio",
    "shortName": "ENEM",
    "country": "Brazil",
    "countryCode": "BR",
    "region": "South America",
    "category": "entrance",
    "conductingBody": "INEP (Instituto Nacional de Estudos e Pesquisas Educacionais Anísio Teixeira)",
    "frequency": "annual",
    "officialUrl": "https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem",
    "eligibility": "High school graduates or final-year high school students",
    "tags": [
      "brazil",
      "university",
      "undergraduate"
    ],
    "dates": [
      {
        "type": "registration_start",
        "date": "2026-05-25",
        "label": "Registration Opens",
        "tentative": true
      },
      {
        "type": "registration_end",
        "date": "2026-06-07",
        "label": "Registration Closes",
        "tentative": true
      },
      {
        "type": "exam_date",
        "date": "2026-11-01",
        "label": "ENEM Day 1",
        "tentative": true
      },
      {
        "type": "exam_date",
        "date": "2026-11-08",
        "label": "ENEM Day 2",
        "tentative": true
      },
      {
        "type": "result",
        "date": "2027-01-13",
        "label": "ENEM Results",
        "tentative": true
      }
    ]
  },
  {
    "id": "gaokao",
    "name": "National College Entrance Examination",
    "shortName": "Gaokao",
    "country": "China",
    "countryCode": "CN",
    "region": "Asia",
    "category": "entrance",
    "conductingBody": "Ministry of Education China",
    "frequency": "annual",
    "officialUrl": "http://en.moe.gov.cn",
    "eligibility": "High school graduates in China",
    "tags": [
      "university",
      "china",
      "undergraduate",
      "national"
    ],
    "dates": [
      {
        "type": "registration_start",
        "date": "2025-11-01",
        "label": "Candidate Registration Opens",
        "tentative": true
      },
      {
        "type": "registration_end",
        "date": "2026-03-31",
        "label": "Registration Closes",
        "tentative": true
      },
      {
        "type": "admit_card",
        "date": "2026-05-25",
        "label": "Admit Card Release",
        "tentative": true
      },
      {
        "type": "exam_date",
        "date": "2026-06-07",
        "label": "Gaokao Day 1",
        "tentative": false
      },
      {
        "type": "exam_date",
        "date": "2026-06-08",
        "label": "Gaokao Day 2",
        "tentative": false
      },
      {
        "type": "result",
        "date": "2026-06-25",
        "label": "Results Published",
        "tentative": true
      }
    ]
  },
  {
    "id": "abitur",
    "name": "Abitur (Allgemeine Hochschulreife)",
    "shortName": "Abitur",
    "country": "Germany",
    "countryCode": "DE",
    "region": "Europe",
    "category": "academic",
    "conductingBody": "Kultusministerkonferenz (KMK)",
    "frequency": "annual",
    "officialUrl": "https://www.kmk.org",
    "eligibility": "Successful completion of the gymnasiale Oberstufe (upper secondary school) in Germany",
    "tags": [
      "germany",
      "university-entrance",
      "secondary",
      "europe"
    ],
    "dates": [
      {
        "type": "exam_date",
        "date": "2026-04-15",
        "label": "Written Exams Begin (State Dependent)",
        "tentative": true
      },
      {
        "type": "exam_date",
        "date": "2026-05-19",
        "label": "Written Exams End (State Dependent)",
        "tentative": true
      },
      {
        "type": "exam_date",
        "date": "2026-06-15",
        "label": "Oral Exams (State Dependent)",
        "tentative": true
      },
      {
        "type": "result",
        "date": "2026-07-01",
        "label": "Certificates Issued (General Deadline)",
        "tentative": true
      }
    ]
  },
  {
    "id": "delf-dalf",
    "name": "Diplôme d'études en langue française",
    "shortName": "DELF/DALF",
    "country": "Global",
    "countryCode": "GLOBAL",
    "region": "Global",
    "category": "language",
    "conductingBody": "France Éducation international",
    "frequency": "multiple",
    "officialUrl": "https://www.france-education-international.fr/delf-dalf",
    "eligibility": "Non-native French speakers",
    "tags": [
      "french",
      "language proficiency",
      "study abroad",
      "europe"
    ],
    "dates": [
      {
        "type": "exam_date",
        "date": "2026-03-03",
        "label": "March Session (DELF/DALF Starts)",
        "tentative": false
      },
      {
        "type": "exam_date",
        "date": "2026-06-09",
        "label": "June Session (DELF/DALF Starts)",
        "tentative": false
      },
      {
        "type": "exam_date",
        "date": "2026-11-03",
        "label": "November Session (DELF/DALF Starts)",
        "tentative": false
      }
    ]
  },
  {
    "id": "a-levels",
    "name": "GCE Advanced Level Examinations",
    "shortName": "A-Levels",
    "country": "United Kingdom",
    "countryCode": "GB",
    "region": "Europe",
    "category": "academic",
    "conductingBody": "Joint Council for Qualifications (AQA, Edexcel, OCR, WJEC, CCEA)",
    "frequency": "annual",
    "officialUrl": "https://www.jcq.org.uk",
    "eligibility": "Year 13 students in England, Wales, and Northern Ireland",
    "tags": [
      "a-levels",
      "uk",
      "university",
      "school-leaving",
      "secondary"
    ],
    "dates": [
      {
        "type": "exam_date",
        "date": "2026-05-11",
        "label": "A-Level Exams Begin",
        "tentative": false
      },
      {
        "type": "exam_date",
        "date": "2026-06-24",
        "label": "A-Level Exams End (Including Contingency Day)",
        "tentative": true
      },
      {
        "type": "result",
        "date": "2026-08-13",
        "label": "A-Level Results Day",
        "tentative": false
      }
    ]
  },
  {
    "id": "aws-saa",
    "name": "AWS Certified Solutions Architect - Associate",
    "shortName": "AWS SAA",
    "country": "Global",
    "countryCode": "GLOBAL",
    "region": "Global",
    "category": "professional",
    "conductingBody": "Amazon Web Services (AWS)",
    "frequency": "on-demand",
    "officialUrl": "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
    "eligibility": "Familiarity with AWS services (AWS recommends 1+ year of hands-on experience)",
    "tags": [
      "cloud",
      "aws",
      "certification",
      "it"
    ],
    "dates": [
      {
        "type": "registration_start",
        "date": "2026-01-01",
        "label": "Registration Open Year-Round",
        "tentative": false
      },
      {
        "type": "exam_date",
        "date": "2026-12-31",
        "label": "Exam Available On-Demand Year-Round",
        "tentative": false
      },
      {
        "type": "result",
        "date": "2026-12-31",
        "label": "Results Declared Typically within 5 Business Days",
        "tentative": true
      }
    ]
  },
  {
    "id": "cfa-level1",
    "name": "Chartered Financial Analyst Level I",
    "shortName": "CFA L1",
    "country": "Global",
    "countryCode": "GLOBAL",
    "region": "Global",
    "category": "professional",
    "conductingBody": "CFA Institute",
    "frequency": "quarterly",
    "officialUrl": "https://www.cfainstitute.org",
    "eligibility": "Bachelor's degree or within 23 months of graduation",
    "tags": [
      "finance",
      "investment",
      "accounting",
      "cfa"
    ],
    "dates": [
      {
        "type": "registration_end",
        "date": "2026-02-12",
        "label": "May Window Registration Deadline",
        "tentative": false
      },
      {
        "type": "exam_date",
        "date": "2026-05-12",
        "label": "May Window Exam Starts",
        "tentative": false
      },
      {
        "type": "registration_end",
        "date": "2026-05-06",
        "label": "August Window Registration Deadline",
        "tentative": false
      },
      {
        "type": "exam_date",
        "date": "2026-08-18",
        "label": "August Window Exam Starts",
        "tentative": false
      },
      {
        "type": "registration_start",
        "date": "2026-02-11",
        "label": "November Window Registration Opens",
        "tentative": false
      },
      {
        "type": "exam_date",
        "date": "2026-11-11",
        "label": "November Window Exam Starts",
        "tentative": false
      }
    ]
  },
  {
    "id": "gmat",
    "name": "Graduate Management Admission Test",
    "shortName": "GMAT",
    "country": "Global",
    "countryCode": "GLOBAL",
    "region": "Global",
    "category": "entrance",
    "conductingBody": "Graduate Management Admission Council (GMAC)",
    "frequency": "on-demand",
    "officialUrl": "https://www.mba.com/exams/gmat",
    "eligibility": "Minimum 18 years of age (13-17 years with parental consent)",
    "tags": [
      "mba",
      "business",
      "management",
      "global"
    ],
    "dates": [
      {
        "type": "registration_start",
        "date": "2026-01-01",
        "label": "Year-Round Registration Starts",
        "tentative": false
      },
      {
        "type": "exam_date",
        "date": "2026-12-31",
        "label": "GMAT Available Year-Round (On-Demand)",
        "tentative": false
      },
      {
        "type": "result",
        "date": "2026-12-31",
        "label": "Unofficial Results (Available Immediately After Exam)",
        "tentative": false
      }
    ]
  },
  {
    "id": "gre-general",
    "name": "Graduate Record Examinations General Test",
    "shortName": "GRE",
    "country": "Global",
    "countryCode": "GLOBAL",
    "region": "Global",
    "category": "entrance",
    "conductingBody": "Educational Testing Service (ETS)",
    "frequency": "year-round",
    "officialUrl": "https://www.ets.org/gre",
    "eligibility": "Anyone can take the test; usually intended for those pursuing a master's or doctoral degree.",
    "tags": [
      "graduate",
      "ms",
      "phd",
      "usa",
      "global"
    ],
    "dates": [
      {
        "type": "registration_start",
        "date": "2026-01-01",
        "label": "Registration Open (Year-Round)",
        "tentative": false
      },
      {
        "type": "exam_date",
        "date": "2026-12-31",
        "label": "Tests Available Year-Round (Continuous)",
        "tentative": false
      },
      {
        "type": "result",
        "date": "2026-12-31",
        "label": "Results Available 8-10 Days After Test Date",
        "tentative": true
      }
    ]
  },
  {
    "id": "ielts",
    "name": "International English Language Testing System",
    "shortName": "IELTS",
    "country": "Global",
    "countryCode": "GLOBAL",
    "region": "Global",
    "category": "language",
    "conductingBody": "British Council / IDP / Cambridge",
    "frequency": "monthly",
    "officialUrl": "https://www.ielts.org",
    "eligibility": "Anyone above the age of 16 with a valid passport",
    "tags": [
      "english",
      "language",
      "immigration",
      "study-abroad"
    ],
    "dates": [
      {
        "type": "exam_date",
        "date": "2026-01-03",
        "label": "IELTS Academic (Paper-Based) - January",
        "tentative": false
      },
      {
        "type": "exam_date",
        "date": "2026-01-10",
        "label": "IELTS Academic & General (Paper-Based) - January",
        "tentative": false
      },
      {
        "type": "exam_date",
        "date": "2026-02-07",
        "label": "IELTS Academic & General (Paper-Based) - February",
        "tentative": false
      },
      {
        "type": "exam_date",
        "date": "2026-02-12",
        "label": "IELTS Academic (Paper-Based) - February",
        "tentative": false
      },
      {
        "type": "exam_date",
        "date": "2026-04-04",
        "label": "IELTS Academic (Paper-Based) - April",
        "tentative": false
      }
    ]
  },
  {
    "id": "pmp-global",
    "name": "Project Management Professional",
    "shortName": "PMP",
    "country": "Global",
    "countryCode": "GLOBAL",
    "region": "Global",
    "category": "professional",
    "conductingBody": "Project Management Institute (PMI)",
    "frequency": "on-demand",
    "officialUrl": "https://www.pmi.org/certifications/project-management-pmp",
    "eligibility": "4-year degree with 36 months experience OR High school diploma with 60 months experience, plus 35 hours of PM education.",
    "tags": [
      "project management",
      "pmi",
      "certification",
      "management"
    ],
    "dates": [
      {
        "type": "registration_start",
        "date": "2026-01-01",
        "label": "Rolling Application (Year-Round)",
        "tentative": false
      },
      {
        "type": "exam_date",
        "date": "2026-12-31",
        "label": "Exams Available On-Demand (Year-Round)",
        "tentative": false
      }
    ]
  },
  {
    "id": "toefl",
    "name": "Test of English as a Foreign Language",
    "shortName": "TOEFL iBT",
    "country": "Global",
    "countryCode": "GLOBAL",
    "region": "Global",
    "category": "language",
    "conductingBody": "Educational Testing Service (ETS)",
    "frequency": "continuous",
    "officialUrl": "https://www.ets.org/toefl",
    "eligibility": "Open to all candidates; typically taken by non-native English speakers for academic, professional, and visa purposes.",
    "tags": [
      "english",
      "proficiency",
      "study-abroad",
      "immigration"
    ],
    "dates": [
      {
        "type": "exam_date",
        "date": "2026-05-16",
        "label": "TOEFL iBT Test Date (Sample Center Date)",
        "tentative": true
      },
      {
        "type": "exam_date",
        "date": "2026-06-20",
        "label": "TOEFL iBT Test Date (Sample Center Date)",
        "tentative": true
      },
      {
        "type": "exam_date",
        "date": "2026-07-18",
        "label": "TOEFL iBT Test Date (Sample Center Date)",
        "tentative": true
      }
    ]
  },
  {
    "id": "cat-exam",
    "name": "Common Admission Test",
    "shortName": "CAT",
    "country": "India",
    "countryCode": "IN",
    "region": "Asia",
    "category": "entrance",
    "conductingBody": "Indian Institutes of Management (IIMs)",
    "frequency": "annual",
    "officialUrl": "https://iimcat.ac.in",
    "eligibility": "Bachelor's degree with at least 50% aggregate marks (45% for SC/ST/PwD)",
    "tags": [
      "mba",
      "iim",
      "management",
      "business"
    ],
    "dates": [
      {
        "type": "registration_start",
        "date": "2026-08-01",
        "label": "Registration Opens",
        "tentative": true
      },
      {
        "type": "registration_end",
        "date": "2026-09-20",
        "label": "Registration Closes",
        "tentative": true
      },
      {
        "type": "admit_card",
        "date": "2026-11-05",
        "label": "Admit Card Release",
        "tentative": true
      },
      {
        "type": "exam_date",
        "date": "2026-11-29",
        "label": "CAT 2026 Exam Day",
        "tentative": true
      },
      {
        "type": "result",
        "date": "2026-12-21",
        "label": "Result Declaration",
        "tentative": true
      }
    ]
  },
  {
    "id": "cuet-ug",
    "name": "Common University Entrance Test (Undergraduate)",
    "shortName": "CUET UG",
    "country": "India",
    "countryCode": "IN",
    "region": "Asia",
    "category": "entrance",
    "conductingBody": "National Testing Agency (NTA)",
    "frequency": "annual",
    "officialUrl": "https://cuet.nta.nic.in/",
    "eligibility": "Passed or appearing in Class 12 or equivalent qualification from a recognized board.",
    "tags": [
      "undergraduate",
      "central universities",
      "india",
      "admissions"
    ],
    "dates": [
      {
        "type": "registration_start",
        "date": "2026-01-03",
        "label": "Application Window Opens",
        "tentative": false
      },
      {
        "type": "registration_end",
        "date": "2026-02-26",
        "label": "Re-opened Registration Deadline",
        "tentative": false
      },
      {
        "type": "exam_date",
        "date": "2026-05-11",
        "label": "CUET UG Exam Window Starts",
        "tentative": true
      },
      {
        "type": "exam_date",
        "date": "2026-05-31",
        "label": "CUET UG Exam Window Ends",
        "tentative": true
      }
    ]
  },
  {
    "id": "gate",
    "name": "Graduate Aptitude Test in Engineering",
    "shortName": "GATE",
    "country": "India",
    "countryCode": "IN",
    "region": "Asia",
    "category": "entrance",
    "conductingBody": "IIT Guwahati",
    "frequency": "annual",
    "officialUrl": "https://gate2026.iitg.ac.in",
    "eligibility": "B.E/B.Tech/M.Sc or final year students",
    "tags": [
      "engineering",
      "psu",
      "mtech",
      "research"
    ],
    "dates": [
      {
        "type": "registration_start",
        "date": "2025-08-25",
        "label": "Online Registration Opens",
        "tentative": false
      },
      {
        "type": "registration_end",
        "date": "2025-09-25",
        "label": "Online Registration Closes (Without Late Fee)",
        "tentative": false
      },
      {
        "type": "admit_card",
        "date": "2026-01-02",
        "label": "Admit Card Download Begins",
        "tentative": false
      },
      {
        "type": "exam_date",
        "date": "2026-02-07",
        "label": "GATE 2026 Exam (Day 1)",
        "tentative": false
      },
      {
        "type": "exam_date",
        "date": "2026-02-08",
        "label": "GATE 2026 Exam (Day 2)",
        "tentative": false
      },
      {
        "type": "exam_date",
        "date": "2026-02-14",
        "label": "GATE 2026 Exam (Day 3)",
        "tentative": false
      }
    ]
  },
  {
    "id": "jee-main",
    "name": "Joint Entrance Examination Main",
    "shortName": "JEE Main",
    "country": "India",
    "countryCode": "IN",
    "region": "Asia",
    "category": "entrance",
    "conductingBody": "National Testing Agency",
    "frequency": "biannual",
    "officialUrl": "https://jeemain.nta.ac.in",
    "eligibility": "Class 12 pass/appearing in 2026 with Physics and Mathematics; no upper age limit.",
    "tags": [
      "engineering",
      "iit",
      "nit",
      "b.tech",
      "stem"
    ],
    "dates": [
      {
        "type": "registration_start",
        "date": "2025-10-31",
        "label": "Session 1 Registration Opens"
      },
      {
        "type": "registration_end",
        "date": "2025-11-27",
        "label": "Session 1 Registration Closes"
      },
      {
        "type": "admit_card",
        "date": "2026-01-17",
        "label": "Admit Card - Session 1"
      },
      {
        "type": "exam_date",
        "date": "2026-01-21",
        "label": "JEE Main Session 1 Begins",
        "tentative": false
      },
      {
        "type": "result",
        "date": "2026-02-16",
        "label": "Session 1 Result (Paper 1)"
      },
      {
        "type": "registration_start",
        "date": "2026-02-01",
        "label": "Session 2 Registration Opens"
      }
    ]
  },
  {
    "id": "neet-ug",
    "name": "National Eligibility cum Entrance Test (Undergraduate)",
    "shortName": "NEET UG",
    "country": "India",
    "countryCode": "IN",
    "region": "Asia",
    "category": "entrance",
    "conductingBody": "National Testing Agency",
    "frequency": "annual",
    "officialUrl": "https://exams.nta.ac.in/NEET",
    "eligibility": "12th pass (PCB & English) with 50% aggregate (40% for SC/ST/OBC); Min 17 years by Dec 31, 2026; No upper age limit.",
    "tags": [
      "medical",
      "mbbs",
      "bds",
      "ayush",
      "healthcare"
    ],
    "dates": [
      {
        "type": "registration_start",
        "date": "2026-02-08",
        "label": "Online Registration Opens"
      },
      {
        "type": "registration_end",
        "date": "2026-03-11",
        "label": "Extended Registration Deadline"
      },
      {
        "type": "admit_card",
        "date": "2026-04-25",
        "label": "Admit Card Release",
        "tentative": true
      },
      {
        "type": "exam_date",
        "date": "2026-05-03",
        "label": "NEET UG 2026 Exam Day",
        "tentative": false
      },
      {
        "type": "result",
        "date": "2026-06-14",
        "label": "Result Declaration",
        "tentative": true
      },
      {
        "type": "counselling",
        "date": "2026-07-15",
        "label": "All India Quota Counselling Starts",
        "tentative": true
      }
    ]
  },
  {
    "id": "upsc-cse",
    "name": "Union Public Service Commission Civil Services Examination",
    "shortName": "UPSC CSE",
    "country": "India",
    "countryCode": "IN",
    "region": "Asia",
    "category": "competitive",
    "conductingBody": "Union Public Service Commission",
    "frequency": "annual",
    "officialUrl": "https://upsc.gov.in",
    "eligibility": "Graduate degree from a recognized university; Age 21-32 as of August 1, 2026.",
    "tags": [
      "government",
      "civil services",
      "ias",
      "ips"
    ],
    "dates": [
      {
        "type": "registration_start",
        "date": "2026-02-04",
        "label": "Official Notification & Registration Opens"
      },
      {
        "type": "registration_end",
        "date": "2026-02-27",
        "label": "Last Date to Apply (Extended)"
      },
      {
        "type": "admit_card",
        "date": "2026-05-04",
        "label": "Prelims e-Admit Card Release",
        "tentative": true
      },
      {
        "type": "exam_date",
        "date": "2026-05-24",
        "label": "Civil Services (Preliminary) Examination"
      },
      {
        "type": "result",
        "date": "2026-06-25",
        "label": "Prelims Result Declaration",
        "tentative": true
      },
      {
        "type": "exam_date",
        "date": "2026-08-21",
        "label": "Civil Services (Main) Examination Begins"
      }
    ]
  },
  {
    "id": "jlpt",
    "name": "Japanese Language Proficiency Test",
    "shortName": "JLPT",
    "country": "Global",
    "countryCode": "GLOBAL",
    "region": "Global",
    "category": "language",
    "conductingBody": "Japan Foundation / Japan Educational Exchanges and Services (JEES)",
    "frequency": "biannual",
    "officialUrl": "https://www.jlpt.jp/",
    "eligibility": "Non-native Japanese speakers (no age or academic restrictions).",
    "tags": [
      "japanese",
      "language-proficiency",
      "study-abroad",
      "n1-n5",
      "certification"
    ],
    "dates": [
      {
        "type": "registration_start",
        "date": "2026-03-01",
        "label": "July Session Registration Opens",
        "tentative": true
      },
      {
        "type": "registration_end",
        "date": "2026-03-31",
        "label": "July Session Registration Closes",
        "tentative": false
      },
      {
        "type": "exam_date",
        "date": "2026-07-05",
        "label": "JLPT July Session (First Sunday)",
        "tentative": false
      },
      {
        "type": "result",
        "date": "2026-08-25",
        "label": "July Session Online Results",
        "tentative": true
      },
      {
        "type": "registration_start",
        "date": "2026-08-15",
        "label": "December Session Registration Opens",
        "tentative": true
      },
      {
        "type": "registration_end",
        "date": "2026-09-15",
        "label": "December Session Registration Closes",
        "tentative": true
      }
    ]
  },
  {
    "id": "csat-suneung",
    "name": "College Scholastic Ability Test",
    "shortName": "CSAT (Suneung)",
    "country": "South Korea",
    "countryCode": "KR",
    "region": "Asia",
    "category": "entrance",
    "conductingBody": "Korea Institute for Curriculum and Evaluation",
    "frequency": "annual",
    "officialUrl": "https://www.suneung.re.kr",
    "eligibility": "High school seniors, graduates, or those with equivalent recognized educational background.",
    "tags": [
      "suneung",
      "south-korea",
      "university-entrance",
      "kice"
    ],
    "dates": [
      {
        "type": "registration_start",
        "date": "2026-08-24",
        "label": "Application Period Opens"
      },
      {
        "type": "registration_end",
        "date": "2026-09-04",
        "label": "Application Period Closes"
      },
      {
        "type": "exam_date",
        "date": "2026-11-19",
        "label": "CSAT Exam Day",
        "tentative": false
      },
      {
        "type": "result",
        "date": "2026-12-11",
        "label": "Score Report Distribution",
        "tentative": false
      }
    ]
  },
  {
    "id": "utme",
    "name": "Unified Tertiary Matriculation Examination",
    "shortName": "UTME",
    "country": "Nigeria",
    "countryCode": "NG",
    "region": "Africa",
    "category": "entrance",
    "conductingBody": "Joint Admissions and Matriculation Board (JAMB)",
    "frequency": "annual",
    "officialUrl": "https://www.jamb.gov.ng",
    "eligibility": "Candidates must have obtained five (5) credit passes in relevant subjects including English Language in SSCE/GCE/NECO/NABTEB.",
    "tags": [
      "nigeria",
      "university",
      "admission",
      "jamb"
    ],
    "dates": [
      {
        "type": "registration_start",
        "date": "2026-01-15",
        "label": "Registration Opens",
        "tentative": false
      },
      {
        "type": "registration_end",
        "date": "2026-02-26",
        "label": "Registration Closes",
        "tentative": false
      },
      {
        "type": "admit_card",
        "date": "2026-04-10",
        "label": "Examination Slip Printing",
        "tentative": true
      },
      {
        "type": "exam_date",
        "date": "2026-04-19",
        "label": "UTME Main Examination Start",
        "tentative": false
      },
      {
        "type": "result",
        "date": "2026-05-05",
        "label": "Release of Results",
        "tentative": true
      }
    ]
  },
  {
    "id": "wassce",
    "name": "West African Senior School Certificate Examination",
    "shortName": "WASSCE",
    "country": "Nigeria",
    "countryCode": "NG",
    "region": "Africa",
    "category": "academic",
    "conductingBody": "West African Examinations Council (WAEC)",
    "frequency": "annual",
    "officialUrl": "https://www.waecnigeria.org",
    "eligibility": "Senior Secondary 3 (SS3) students in recognized schools.",
    "tags": [
      "secondary",
      "waec",
      "nigeria",
      "cb-wassce"
    ],
    "dates": [
      {
        "type": "registration_start",
        "date": "2026-01-15",
        "label": "Registration Period Starts"
      },
      {
        "type": "registration_end",
        "date": "2026-03-13",
        "label": "Extended Registration Deadline (Final)"
      },
      {
        "type": "exam_date",
        "date": "2026-04-21",
        "label": "WASSCE Exams Begin (Practical Sessions)"
      },
      {
        "type": "exam_date",
        "date": "2026-06-19",
        "label": "WASSCE Exams End"
      },
      {
        "type": "result",
        "date": "2026-08-10",
        "label": "Results Expected Release Date",
        "tentative": true
      }
    ]
  },
  {
    "id": "ube-usa",
    "name": "Uniform Bar Examination",
    "shortName": "UBE",
    "country": "United States",
    "countryCode": "US",
    "region": "North America",
    "category": "professional",
    "conductingBody": "National Conference of Bar Examiners",
    "frequency": "biannual",
    "officialUrl": "https://www.ncbex.org",
    "eligibility": "Juris Doctor (JD) from an ABA-approved law school (most jurisdictions); specific character and fitness requirements.",
    "tags": [
      "law",
      "legal",
      "bar exam",
      "jd",
      "attorney"
    ],
    "dates": [
      {
        "type": "exam_date",
        "date": "2026-02-24",
        "label": "February Exam Day 1 (MEE/MPT)",
        "tentative": false
      },
      {
        "type": "exam_date",
        "date": "2026-02-25",
        "label": "February Exam Day 2 (MBE)",
        "tentative": false
      },
      {
        "type": "result",
        "date": "2026-04-15",
        "label": "February Results Window (Varies by State)",
        "tentative": true
      },
      {
        "type": "registration_start",
        "date": "2026-03-02",
        "label": "July Registration Opens (Standard Deadline)",
        "tentative": false
      },
      {
        "type": "registration_end",
        "date": "2026-05-01",
        "label": "July Timely Filing Deadline",
        "tentative": false
      },
      {
        "type": "exam_date",
        "date": "2026-07-28",
        "label": "July Exam Day 1 (MEE/MPT or NextGen Day 1)",
        "tentative": false
      }
    ]
  },
  {
    "id": "lsat",
    "name": "Law School Admission Test",
    "shortName": "LSAT",
    "country": "USA",
    "countryCode": "US",
    "region": "Americas",
    "category": "entrance",
    "conductingBody": "Law School Admission Council",
    "frequency": "8 times per year",
    "officialUrl": "https://www.lsac.org",
    "eligibility": "Varies by law school; typically requires a bachelor's degree or being in the final year of undergraduate study.",
    "tags": [
      "law",
      "jd",
      "legal-education",
      "admissions"
    ],
    "dates": [
      {
        "type": "registration_end",
        "date": "2026-02-26",
        "label": "Registration Deadline (April Exam)"
      },
      {
        "type": "exam_date",
        "date": "2026-04-09",
        "label": "LSAT April 2026 Window Begins",
        "tentative": false
      },
      {
        "type": "result",
        "date": "2026-04-29",
        "label": "April Score Release"
      },
      {
        "type": "registration_end",
        "date": "2026-04-21",
        "label": "Registration Deadline (June Exam)"
      },
      {
        "type": "exam_date",
        "date": "2026-06-03",
        "label": "LSAT June 2026 Window Begins",
        "tentative": false
      },
      {
        "type": "result",
        "date": "2026-06-24",
        "label": "June Score Release"
      }
    ]
  },
  {
    "id": "mcat",
    "name": "Medical College Admission Test",
    "shortName": "MCAT",
    "country": "USA",
    "countryCode": "US",
    "region": "Americas",
    "category": "entrance",
    "conductingBody": "Association of American Medical Colleges",
    "frequency": "monthly",
    "officialUrl": "https://students-residents.aamc.org/mcat",
    "eligibility": "Students intending to apply to health professions schools (MD, DO, Podiatric, Veterinary).",
    "tags": [
      "medical",
      "premed",
      "medschool",
      "aamc"
    ],
    "dates": [
      {
        "type": "exam_date",
        "date": "2026-04-10",
        "label": "MCAT Test Date (US/Canada)",
        "tentative": false
      },
      {
        "type": "exam_date",
        "date": "2026-05-14",
        "label": "MCAT Test Date (US/International)",
        "tentative": false
      },
      {
        "type": "result",
        "date": "2026-06-16",
        "label": "Score Release (for May 14 Test)",
        "tentative": false
      },
      {
        "type": "exam_date",
        "date": "2026-06-19",
        "label": "MCAT Test Date (US/Canada)",
        "tentative": false
      },
      {
        "type": "exam_date",
        "date": "2026-07-17",
        "label": "MCAT Test Date (US/Canada)",
        "tentative": false
      },
      {
        "type": "exam_date",
        "date": "2026-08-15",
        "label": "MCAT Test Date (US/International)",
        "tentative": false
      }
    ]
  },
  {
    "id": "sat-global",
    "name": "Scholastic Assessment Test",
    "shortName": "SAT",
    "country": "Global",
    "countryCode": "GLOBAL",
    "region": "Global",
    "category": "entrance",
    "conductingBody": "College Board",
    "frequency": "monthly",
    "officialUrl": "https://satsuite.collegeboard.org",
    "eligibility": "Open to all students; primarily taken by high school juniors and seniors.",
    "tags": [
      "undergraduate",
      "university",
      "college-admissions",
      "digital-sat"
    ],
    "dates": [
      {
        "type": "registration_end",
        "date": "2026-02-27",
        "label": "March Registration Deadline"
      },
      {
        "type": "exam_date",
        "date": "2026-03-14",
        "label": "SAT March 2026",
        "tentative": false
      },
      {
        "type": "result",
        "date": "2026-03-27",
        "label": "March Scores Released"
      },
      {
        "type": "registration_end",
        "date": "2026-04-17",
        "label": "May Registration Deadline"
      },
      {
        "type": "exam_date",
        "date": "2026-05-02",
        "label": "SAT May 2026",
        "tentative": false
      },
      {
        "type": "result",
        "date": "2026-05-15",
        "label": "May Scores Released"
      }
    ]
  },
  {
    "id": "usmle-step-1",
    "name": "United States Medical Licensing Examination Step 1",
    "shortName": "USMLE Step 1",
    "country": "USA",
    "countryCode": "US",
    "region": "Americas",
    "category": "professional",
    "conductingBody": "FSMB & NBME",
    "frequency": "monthly",
    "officialUrl": "https://www.usmle.org",
    "eligibility": "Medical students/graduates of LCME/COCA accredited programs (US/Canada) or WDOMS-listed schools meeting ECFMG criteria.",
    "tags": [
      "medical",
      "licensing",
      "residency",
      "usmle",
      "physician"
    ],
    "dates": [
      {
        "type": "registration_start",
        "date": "2025-11-01",
        "label": "2026 Eligibility Period Applications Open"
      },
      {
        "type": "exam_date",
        "date": "2026-01-12",
        "label": "Testing Resumes (Post-Transition)",
        "tentative": false
      },
      {
        "type": "exam_date",
        "date": "2026-01-01",
        "label": "Year-Round CBT Scheduling",
        "tentative": false
      }
    ]
  },
  {
    "id": "matric-sa",
    "name": "National Senior Certificate (Matric)",
    "shortName": "Matric NSC",
    "country": "South Africa",
    "countryCode": "ZA",
    "region": "Africa",
    "category": "academic",
    "conductingBody": "Department of Basic Education",
    "frequency": "annual",
    "officialUrl": "https://www.education.gov.za",
    "eligibility": "Grade 12 students or individuals with a Grade 11/equivalent certificate and a valid SBA record.",
    "tags": [
      "matric",
      "secondary education",
      "nsc",
      "caps",
      "south africa"
    ],
    "dates": [
      {
        "type": "registration_end",
        "date": "2026-03-13",
        "label": "Final Registration Deadline",
        "tentative": false
      },
      {
        "type": "exam_date",
        "date": "2026-10-26",
        "label": "NSC Final Examinations Begin",
        "tentative": false
      },
      {
        "type": "exam_date",
        "date": "2026-12-04",
        "label": "NSC Final Examinations End",
        "tentative": false
      },
      {
        "type": "result",
        "date": "2027-01-14",
        "label": "National Release of Results",
        "tentative": true
      },
      {
        "type": "result",
        "date": "2027-01-15",
        "label": "School-Level Result Collection",
        "tentative": true
      }
    ]
  }
];
