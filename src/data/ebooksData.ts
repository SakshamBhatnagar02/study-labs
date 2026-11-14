/**
 * Study Labs — Curated Digital E-Books, Textbooks & Handbooks Catalog
 * Includes syllabus handbooks, competitive exam manuals, cyber security guides,
 * and NCERT/STEM reference books with structured chapter content & KaTeX support.
 */

import type { EBook } from '../types';

export const CURATED_EBOOKS: EBook[] = [
  {
    id: 'book_jee_syllabus_2026',
    title: 'JEE Main 2026 Official Syllabus & Strategy Manual',
    subtitle: 'National Testing Agency (NTA) Complete Topic Specifications & Weightage',
    author: 'NTA & Vertex STEM Faculty',
    publisher: 'study.io Academic Press',
    category: 'jee_neet',
    subject: 'Physics, Chemistry & Mathematics',
    totalPages: 32,
    fileSizeFormatted: '1.2 MB',
    rating: 4.9,
    description:
      'Official syllabus specifications, chapter-wise weightage matrices, experimental skills topics, and high-yield scoring roadmap for JEE Main 2026.',
    tags: ['JEE Main', 'NTA', 'Syllabus', 'Physics', 'Chemistry', 'Maths'],
    coverPreset: 'jee',
    localPdfFileName: 'jee-main-2026-syllabus.pdf',
    chapters: [
      {
        id: 'jee_ch1',
        chapterNumber: 1,
        title: 'Physics & Measurement, Kinematics & Mechanics',
        pageStart: 1,
        pageEnd: 8,
        summary:
          'Dimensions of physical quantities, errors in measurement, vectors, motion in a straight line and plane, Newton laws of motion, work energy power, rotational dynamics.',
        content: `### 1.1 Physical Quantities & Dimensions
Measurement of physical quantities requires standard reference units. Dimensional formula of physical quantities:
$$[\\text{Force}] = [M L T^{-2}]$$
$$[\\text{Work / Energy}] = [M L^2 T^{-2}]$$
$$[\\text{Universal Gravitational Constant } G] = [M^{-1} L^3 T^{-2}]$$

### 1.2 Kinematics & Projectile Motion
For a projectile launched with initial velocity $u$ at angle $\\theta$ with the horizontal:
- **Maximum Height**: $H_{\\text{max}} = \\frac{u^2 \\sin^2 \\theta}{2g}$
- **Time of Flight**: $T = \\frac{2u \\sin \\theta}{g}$
- **Horizontal Range**: $R = \\frac{u^2 \\sin 2\\theta}{g}$

### 1.3 Rotational Dynamics & Moment of Inertia
Moment of inertia for standard symmetric bodies:
- Solid cylinder / disk about central axis: $I = \\frac{1}{2} M R^2$
- Solid sphere about diameter: $I = \\frac{2}{5} M R^2$
- Spherical shell about diameter: $I = \\frac{2}{3} M R^2$
Linear acceleration of a body rolling without slipping down an inclined plane:
$$a = \\frac{g \\sin \\theta}{1 + \\frac{k^2}{R^2}}$$`,
        keyFormulas: [
          'a = \\frac{g \\sin \\theta}{1 + k^2 / R^2}',
          'R = \\frac{u^2 \\sin 2\\theta}{g}',
          '\\vec{\\tau} = I \\vec{\\alpha} = \\frac{d\\vec{L}}{dt}',
        ],
        quizQuestions: [
          {
            question: 'What is the acceleration of a solid cylinder rolling down an incline of angle θ without slipping?',
            options: ['(1/2) g sin θ', '(2/3) g sin θ', '(3/4) g sin θ', 'g sin θ'],
            correctIndex: 1,
            explanation: 'For a solid cylinder, k²/R² = 1/2. Therefore, a = g sin θ / (1 + 1/2) = (2/3) g sin θ.',
          },
          {
            question: 'Which quantity has the same dimensional formula as torque?',
            options: ['Linear momentum', 'Work', 'Pressure', 'Surface tension'],
            correctIndex: 1,
            explanation: 'Both Torque and Work have dimensions [M L² T⁻²].',
          },
        ],
      },
      {
        id: 'jee_ch2',
        chapterNumber: 2,
        title: 'Physical & Organic Chemistry Core Topics',
        pageStart: 9,
        pageEnd: 18,
        summary:
          'Thermodynamics, chemical equilibrium, atomic structure, general organic chemistry (GOC), reaction mechanisms (SN1, SN2, E1, E2), and aromatic compounds.',
        content: `### 2.1 First and Second Laws of Thermodynamics
Internal energy change:
$$\\Delta U = q + w$$
For reversible isothermal expansion of an ideal gas:
$$w = -2.303 nRT \\log_{10} \\left(\\frac{V_2}{V_1}\\right)$$
Gibbs free energy change and spontaneity:
$$\\Delta G = \\Delta H - T\\Delta S$$
$$\\Delta G^\\circ = -RT \\ln K_{\\text{eq}}$$

### 2.2 Nucleophilic Substitution Mechanisms
- **$S_N1$ (Substitution Nucleophilic Unimolecular)**:
  - Two-step process proceeding via planar carbocation intermediate.
  - Rate $= k[\\text{R-X}]$ (First order).
  - Reactivity: $3^\\circ > 2^\\circ > 1^\\circ > \\text{CH}_3\\text{X}$.
  - Favored by polar protic solvents ($H_2O$, $CH_3OH$).
  - Results in racemization with partial inversion.

- **$S_N2$ (Substitution Nucleophilic Bimolecular)**:
  - Single-step concerted backside attack via pentacoordinate transition state.
  - Rate $= k[\\text{R-X}][\\text{Nu}^-]$ (Second order).
  - Reactivity: $\\text{CH}_3\\text{X} > 1^\\circ > 2^\\circ > 3^\\circ$.
  - Favored by polar aprotic solvents (DMSO, DMF, Acetone).
  - $100\\%$ Walden inversion of stereochemistry.`,
        keyFormulas: [
          '\\Delta G = \\Delta H - T \\Delta S',
          'r_{S_N1} = k[\\text{R-X}]',
          'r_{S_N2} = k[\\text{R-X}][\\text{Nu}^-]',
        ],
        quizQuestions: [
          {
            question: 'Which alkyl halide undergoes SN2 nucleophilic substitution most rapidly?',
            options: ['CH3Cl', '(CH3)3CCl', '(CH3)2CHCl', 'CH3CH2Cl'],
            correctIndex: 0,
            explanation: 'Methyl halides have the lowest steric hindrance, enabling fastest backside attack in SN2.',
          },
        ],
      },
    ],
  },
  {
    id: 'book_neet_handbook_2026',
    title: 'NEET UG 2026 Official Medical Entrance Handbook',
    subtitle: 'NMC / NTA Verified Biology, Human Physiology & Organic Chemistry Manual',
    author: 'National Medical Commission & AIIMS Faculty Guild',
    publisher: 'study.io Academic Press',
    category: 'jee_neet',
    subject: 'Biology, Physics & Chemistry',
    totalPages: 28,
    fileSizeFormatted: '873 KB',
    rating: 4.85,
    description:
      'Complete NMC NEET UG syllabus blueprint, NCERT line-by-line high-yield topics, assertion-reason pointers, human physiology summaries, and genetics review.',
    tags: ['NEET UG', 'Biology', 'NCERT', 'Medical', 'Genetics'],
    coverPreset: 'neet',
    localPdfFileName: 'neet-ug-2026-syllabus.pdf',
    chapters: [
      {
        id: 'neet_ch1',
        chapterNumber: 1,
        title: 'Molecular Basis of Inheritance & Genetics',
        pageStart: 1,
        pageEnd: 12,
        summary:
          'DNA structure, semiconservative replication, Meselson-Stahl experiment, transcription, genetic code, translation, and lac operon regulation.',
        content: `### 1.1 DNA as the Genetic Material
The double helix structure proposed by Watson and Crick (1953) is characterized by:
- Two polynucleotide chains with antiparallel polarity ($5' \\to 3'$ and $3' \\to 5'$).
- Purine-to-pyrimidine base pairing ($A=T$ with 2 hydrogen bonds, $G\\equiv C$ with 3 hydrogen bonds).
- Pitch of the helix is $3.4\\text{ nm}$ with roughly $10\\text{ bp}$ per turn.

### 1.2 DNA Replication Machinery
- Semiconservative replication proven by Meselson and Stahl using $^{15}N$ and $^{14}N$ isotopes in *E. coli*.
- **DNA Polymerase III**: Catalyzes polymerization only in $5' \\to 3'$ direction.
  - **Leading strand**: Synthesized continuously towards the replication fork.
  - **Lagging strand**: Synthesized discontinuously as Okazaki fragments away from the replication fork, joined by **DNA ligase**.

### 1.3 Lac Operon (Jacob & Monod)
- Regulatory gene ($i$ gene) produces active repressor protein.
- In absence of lactose (inducer): Repressor binds to operator ($o$) site, blocking RNA polymerase.
- In presence of lactose (allolactose): Inducer binds repressor, inactivating it and permitting transcription of structural genes:
  - $z$ gene $\\to$ $\\beta$-galactosidase (hydrolyzes lactose to glucose + galactose).
  - $y$ gene $\\to$ permease (increases cell permeability to lactose).
  - $a$ gene $\\to$ transacetylase.`,
        keyFormulas: [
          '\\text{Pitch} = 3.4\\text{ nm}',
          '\\text{Chargaff Rule: } A + G = T + C',
        ],
        quizQuestions: [
          {
            question: 'In the lac operon of E. coli, which gene encodes beta-galactosidase?',
            options: ['i gene', 'z gene', 'y gene', 'a gene'],
            correctIndex: 1,
            explanation: 'The z gene codes for beta-galactosidase which cleaves lactose into glucose and galactose.',
          },
        ],
      },
    ],
  },
  {
    id: 'book_nist_cyber_framework',
    title: 'NIST Cybersecurity Framework in a Nutshell',
    subtitle: 'Core Functions, Profile Tiers & Ransomware Preparedness Playbook',
    author: 'National Institute of Standards and Technology',
    publisher: 'NIST Computer Security Division',
    category: 'cyber_security',
    subject: 'Computer Science & Cyber Defense',
    totalPages: 16,
    fileSizeFormatted: '94 KB',
    rating: 4.9,
    description:
      'Executive guide to the 5 NIST Cybersecurity Framework functions (Identify, Protect, Detect, Respond, Recover) with enterprise implementation checklists.',
    tags: ['Cybersecurity', 'NIST', 'Infosec', 'Defense', 'DevSecOps'],
    coverPreset: 'cyber',
    localPdfFileName: 'NIST_Cybersecurity_Framework_in_a_nutshell_.pdf',
    chapters: [
      {
        id: 'nist_ch1',
        chapterNumber: 1,
        title: 'The Five Core Cybersecurity Functions',
        pageStart: 1,
        pageEnd: 8,
        summary:
          'Identify assets and risks, Protect systems with access control and encryption, Detect anomalies and security breaches, Respond to incidents, and Recover operations.',
        content: `### 1.1 The NIST CSF Structure
The NIST Framework for Improving Critical Infrastructure Cybersecurity organizes security activities into five concurrent and continuous functions:

1. **IDENTIFY (ID)**:
   - Asset Management: Inventory physical devices, systems, software platforms, and data flows.
   - Governance & Risk Assessment: Understand organizational risk tolerance, regulatory obligations, and threat vectors.

2. **PROTECT (PR)**:
   - Identity Management & Access Control: Multi-factor authentication (MFA), least-privilege RBAC.
   - Data Security: Encryption at rest (AES-256) and in transit (TLS 1.3), automated backups.
   - Awareness & Training: Continuous anti-phishing simulations for employees and students.

3. **DETECT (DE)**:
   - Anomalies and Events: Baseline normal network traffic; detect threshold spikes and lateral movement.
   - Security Continuous Monitoring (SIEM): Real-time analysis of authentication logs, DNS requests, and API access tokens.

4. **RESPOND (RS)**:
   - Incident Response Plan execution: Containment, mitigation, eradication, and stakeholder notifications.

5. **RECOVER (RC)**:
   - Disaster recovery: Restore systems from clean air-gapped backups, verify data integrity, and conduct post-incident review.`,
        keyFormulas: [
          '\\text{Risk} = \\text{Threat} \\times \\text{Vulnerability} \\times \\text{Impact}',
        ],
        quizQuestions: [
          {
            question: 'Which NIST CSF function deals with inventorying physical devices and organizational risk assessment?',
            options: ['Protect', 'Identify', 'Detect', 'Recover'],
            correctIndex: 1,
            explanation: 'The IDENTIFY function focuses on asset management, business environment, governance, and risk assessment.',
          },
        ],
      },
    ],
  },
  {
    id: 'book_ddos_defense_playbook',
    title: 'DDoS Attack Analysis & Mitigation Guide',
    subtitle: 'Volumetric, Protocol & Application-Layer Attack Defense Architecture',
    author: 'CERT-In & Global InfoSec Consortium',
    publisher: 'study.io Tech Library',
    category: 'cyber_security',
    subject: 'Network Security & Infrastructure',
    totalPages: 24,
    fileSizeFormatted: '270 KB',
    rating: 4.8,
    description:
      'In-depth study of SYN floods, UDP amplification, DNS reflection, HTTP GET/POST floods, BGP Anycast scrubbing, and Layer 7 bot mitigation.',
    tags: ['DDoS', 'Networking', 'Firewalls', 'Security', 'Infosec'],
    coverPreset: 'cyber',
    localPdfFileName: 'DDoS_Attack_Guide.pdf',
    chapters: [
      {
        id: 'ddos_ch1',
        chapterNumber: 1,
        title: 'Classifying DDoS Attack Vectors (L3/L4 vs L7)',
        pageStart: 1,
        pageEnd: 10,
        summary:
          'Understanding volumetric attacks, protocol exhaustion (SYN Flood, Ping of Death), and application-layer attacks (HTTP flood, Slowloris).',
        content: `### 1.1 Types of Distributed Denial of Service (DDoS) Attacks
DDoS attacks are categorized according to the OSI model layers targeted:

#### A. Volumetric Attacks (Layers 3 & 4)
- **Objective**: Saturate the target's network bandwidth (measured in Gbps or Tbps).
- **Mechanism**: UDP Floods, ICMP Floods, and Amplified Reflection attacks (NTP, DNS, Memcached).
  - *Amplification Factor*: NTP amplification can achieve up to $556\\times$ magnification between request and response bytes!

#### B. Protocol & State Exhaustion Attacks (Layer 4)
- **Objective**: Exhaust server connection state tables, load balancer session buffers, or firewall connection limits.
- **SYN Flood**: Attacker sends continuous TCP SYN packets with spoofed source IPs; target server allocates transmission control blocks (TCB) and waits with SYN-ACK without receiving final ACK.
  - *Countermeasure*: SYN Cookies (encodes connection state inside initial TCP sequence number without allocating memory until completion).

#### C. Application Layer Attacks (Layer 7)
- **Objective**: Exhaust CPU, memory, or database connection pools using seemingly legitimate HTTP/HTTPS requests.
- **Examples**: HTTP GET flood targeting heavy database queries, Slowloris (maintains open connections by trickling incomplete HTTP headers).
  - *Countermeasure*: Cloudflare/WAF rate-limiting, CAPTCHA bot challenges, and TLS fingerprinting (JA3).`,
        keyFormulas: [
          '\\text{Amp Factor} = \\frac{\\text{Response Size (Bytes)}}{\\text{Request Size (Bytes)}}',
          '\\text{Bandwidth Saturation} = \\sum_{i=1}^N \\text{Flow Rate}_i',
        ],
        quizQuestions: [
          {
            question: 'How do SYN Cookies mitigate TCP SYN flood attacks?',
            options: [
              'By blocking all incoming TCP packets',
              'By encoding state into sequence numbers without storing half-open TCB state in memory',
              'By encrypting the payload with RSA',
              'By disconnecting the network adapter',
            ],
            correctIndex: 1,
            explanation: 'SYN Cookies eliminate server state allocation for half-open connections until the client returns the valid ACK with matching hash.',
          },
        ],
      },
    ],
  },
  {
    id: 'book_devsecops_checklist',
    title: 'The Modern DevSecOps Security Checklist',
    subtitle: 'Shift-Left Security: SAST, DAST, Container Hardening & Secret Management',
    author: 'Open Web Application Security Project (OWASP) Contributors',
    publisher: 'Cloud Security Press',
    category: 'computer_science',
    subject: 'Software Engineering & Security',
    totalPages: 20,
    fileSizeFormatted: '308 KB',
    rating: 4.75,
    description:
      'Practical engineering checklist for CI/CD security scanning, pre-commit secret hooks, software composition analysis (SCA), and Docker container hardening.',
    tags: ['DevSecOps', 'CI/CD', 'Docker', 'OWASP', 'Cloud'],
    coverPreset: 'science',
    localPdfFileName: 'The_DevSecOps_Security_Checklist_.pdf',
    chapters: [
      {
        id: 'dso_ch1',
        chapterNumber: 1,
        title: 'Shift-Left Pipeline Hardening',
        pageStart: 1,
        pageEnd: 10,
        summary:
          'Pre-commit hooks for secret detection, static code analysis (SAST), software dependency auditing, container image vulnerability scanning, and infrastructure as code (IaC) linting.',
        content: `### 1.1 The Shift-Left Philosophy
Traditional security testing occurred right before deployment. DevSecOps embeds automated security gates throughout the development lifecycle:

1. **Pre-Commit / Local Phase**:
   - Secret Leak Prevention: Tools like \`gitleaks\` or custom regex prevent committing API keys, private keys, or passwords.
   - Code Style & Linter: Enforce static typing (TypeScript) and secure coding standards.

2. **Continuous Integration (CI) Phase**:
   - **SAST (Static Application Security Testing)**: Scans source code for SQL injection, cross-site scripting (XSS), and insecure deserialization.
   - **SCA (Software Composition Analysis)**: Checks \`package.json\` / \`npm audit\` against national vulnerability databases (CVEs).

3. **Build & Containerization**:
   - Run container images as unprivileged non-root users.
   - Minimize base image attack surface using Alpine or Distroless containers.

4. **Continuous Deployment (CD) & Runtime**:
   - DAST (Dynamic Application Security Testing) against staging endpoints.
   - Runtime Application Self-Protection (RASP) and centralized audit logging.`,
        keyFormulas: [
          '\\text{Mean Time to Remediate (MTTR)} = \\frac{\\sum \\text{Resolution Times}}{\\text{Total Vulnerabilities}}',
        ],
        quizQuestions: [
          {
            question: 'What is the primary benefit of Static Application Security Testing (SAST) in a CI pipeline?',
            options: [
              'Tests network latency',
              'Analyzes source code for security vulnerabilities without requiring running executable',
              'Automates payment processing',
              'Compiles CSS faster',
            ],
            correctIndex: 1,
            explanation: 'SAST analyzes source code statically to detect insecure coding patterns and vulnerabilities before build.',
          },
        ],
      },
    ],
  },
  {
    id: 'book_incident_response_plan',
    title: 'Cyber Incident Response & Forensics Playbook',
    subtitle: 'NIST SP 800-61 Rev 2 Incident Handling Lifecycle & Evidence Preservation',
    author: 'Enterprise Cyber Defense Taskforce',
    publisher: 'study.io Tech Library',
    category: 'cyber_security',
    subject: 'Digital Forensics & Incident Response',
    totalPages: 36,
    fileSizeFormatted: '980 KB',
    rating: 4.85,
    description:
      'Step-by-step procedures for triage, memory acquisition, chain of custody, containment strategies, eradicate malicious persistence, and post-mortem reporting.',
    tags: ['Incident Response', 'Forensics', 'NIST', 'Security Operations', 'Blue Team'],
    coverPreset: 'cyber',
    localPdfFileName: 'Incident_Response_Plan.pdf',
    chapters: [
      {
        id: 'ir_ch1',
        chapterNumber: 1,
        title: 'The Incident Response Lifecycle',
        pageStart: 1,
        pageEnd: 15,
        summary:
          'Preparation, Detection & Analysis, Containment, Eradication & Recovery, and Post-Incident Activity.',
        content: `### 1.1 The Four Phases of Incident Handling (NIST SP 800-61)
1. **Preparation**: Establish incident response teams, communication channels, forensic toolkits, and baseline logs.
2. **Detection & Analysis**: Identify attack vectors, correlate indicators of compromise (IoCs), and determine incident severity.
3. **Containment, Eradication & Recovery**:
   - *Short-term containment*: Isolate affected host from network; preserve volatile RAM.
   - *Eradication*: Remove rootkits, backdoors, rogue accounts, and persistence mechanisms.
   - *Recovery*: Restore systems from verified clean backups, reset credentials, and increase monitoring.
4. **Post-Incident Activity**: Document lessons learned, timeline analysis, and preventative controls.`,
        keyFormulas: [
          '\\text{Order of Volatility: } \\text{Registers/Cache} \\to \\text{RAM} \\to \\text{Network State} \\to \\text{Disk} \\to \\text{Archived Media}',
        ],
        quizQuestions: [
          {
            question: 'According to the order of volatility in digital forensics, what must be collected FIRST?',
            options: ['Hard drive image', 'CPU registers & RAM cache', 'Printed logs', 'External backup tape'],
            correctIndex: 1,
            explanation: 'Volatile memory (CPU registers, cache, RAM) is lost upon shutdown and must be preserved before secondary non-volatile storage.',
          },
        ],
      },
    ],
  },
  {
    id: 'book_10_keystones_cyber',
    title: 'The 10 Keystones of Modern Cybersecurity',
    subtitle: 'Zero Trust Architecture, Identity Management & Cloud Threat Mitigation',
    author: 'Security Architecture Council',
    publisher: 'Enterprise Defense Press',
    category: 'cyber_security',
    subject: 'Enterprise Security Architecture',
    totalPages: 48,
    fileSizeFormatted: '3.4 MB',
    rating: 4.9,
    description:
      'Strategic architectural manual on Zero Trust, principle of least privilege, defense in depth, micro-segmentation, and cryptographically verified telemetry.',
    tags: ['Zero Trust', 'Architecture', 'Enterprise', 'Cryptography', 'Cloud'],
    coverPreset: 'cyber',
    localPdfFileName: 'The_10_Keystones_Of_Cybersecurity_2020.pdf',
    chapters: [
      {
        id: 'ks_ch1',
        chapterNumber: 1,
        title: 'Zero Trust Principles & Defense in Depth',
        pageStart: 1,
        pageEnd: 20,
        summary:
          'Never trust, always verify: assume breach, verify explicitly, and use least-privileged access across all users, microservices, and devices.',
        content: `### 1.1 The Zero Trust Axioms
Traditional perimeter defense assumed internal network traffic was trustworthy. Zero Trust eliminates implicit trust:
1. **Verify Explicitly**: Authenticate and authorize based on all available data points (identity, location, device health, service or workload).
2. **Use Least Privileged Access**: Limit user access with Just-In-Time and Just-Enough-Access (JIT/JEA), risk-based adaptive policies, and data protection.
3. **Assume Breach**: Minimize blast radius by micro-segmenting access by network, user, devices, and application awareness. Encrypt all sessions end-to-end.`,
        keyFormulas: [
          '\\text{Zero Trust: } \\text{Access} = f(\\text{Identity}, \\text{Device Health}, \\text{Context}, \\text{Risk Score})',
        ],
        quizQuestions: [
          {
            question: 'What is the core philosophical tenet of Zero Trust architecture?',
            options: ['Trust anyone on the corporate VPN', 'Never trust, always verify', 'Disable all encryption', 'Use passwords instead of MFA'],
            correctIndex: 1,
            explanation: 'Zero Trust operates under the fundamental premise of "Never trust, always verify" regardless of network location.',
          },
        ],
      },
    ],
  },
];

export const SEED_EBOOKS = CURATED_EBOOKS;
