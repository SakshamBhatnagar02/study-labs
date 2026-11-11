export type CountryCode = 'IN' | 'US' | 'UK' | 'SG' | 'AE' | 'GLOBAL';

export type CurriculumBoard =
  | 'CBSE'
  | 'ICSE'
  | 'PSEB'
  | 'JEE_MAIN'
  | 'JEE_ADVANCED'
  | 'NEET'
  | 'STATE_BOARD'
  | 'IB_CAMBRIDGE'
  | 'AP_SAT'
  | 'US_COMMON_CORE'
  | 'UK_GCSE_ALEVEL'
  | 'SINGAPORE_MOE';

export type EducationLevel =
  | 'Middle School'
  | 'High School'
  | 'Competitive Prep'
  | 'Undergraduate / Self-Study';

export type PreferredLanguage =
  | 'English'
  | 'Hindi'
  | 'Spanish'
  | 'French'
  | 'German'
  | 'Arabic'
  | 'Mandarin';

export type AuthProviderType = 'guest' | 'email' | 'google' | 'microsoft';

export type LearningMode = 'Detailed' | 'Normal' | 'Rapid Revision';

export type AcademicStream =
  | 'Science (PCM)'
  | 'Science (PCB)'
  | 'Science (PCMB)'
  | 'Commerce'
  | 'Arts & Humanities'
  | 'General STEM';

export interface UserProfile {
  id: string;
  ioId: string; // e.g. "STUDY-8942-IO"
  name: string;
  email: string;
  country: string;
  board: CurriculumBoard;
  classGrade: string; // e.g. "Class 11", "Class 12", "Dropper/Repeater"
  stream: AcademicStream;
  targetYear?: number;
  targetExams: string[];
  preferredMode: LearningMode;
  studyStreakDays: number;
  totalXp: number;
  level: number;
  educationLevel?: EducationLevel;
  language?: PreferredLanguage;
  avatarUri?: string;
  avatarColor?: string;
  authProvider?: AuthProviderType;
  onboardingCompleted?: boolean;
}

export type SubjectId = 'physics' | 'chemistry' | 'math' | 'biology';

export interface Subject {
  id: SubjectId;
  name: string;
  icon: string;
  color: string;
  totalChapters: number;
  completedChapters: number;
}

export interface Chapter {
  id: string;
  subjectId: SubjectId;
  title: string;
  chapterNumber: number;
  totalQuestions: number;
  completedQuestions: number;
  highYield: boolean;
  topics: Topic[];
}

export interface Topic {
  id: string;
  chapterId: string;
  title: string;
  isCompleted: boolean;
  revisionCount: number;
  notesAvailable: boolean;
  pyqCount: number;
}

export type QuestionType = 'single_mcq' | 'multiple_mcq' | 'numerical';

export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard';

export type HintCategory = 'concept' | 'formula' | 'strategy';

export interface QuestionHint {
  id: string;
  category: HintCategory;
  title: string;
  content: string;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  chapterId: string;
  topicId?: string;
  subjectId: SubjectId;
  type: QuestionType;
  prompt: string;
  options?: QuestionOption[];
  numericalAnswer?: number;
  numericalTolerance?: number;
  explanation: string;
  hints?: QuestionHint[];
  difficulty: QuestionDifficulty;
  examOrigin?: string; // e.g., "JEE Main 2024 Morning Shift"
  year?: number;
  tags?: string[];
  peerStats?: Record<string, number>; // optionId -> percentage (0-100)
  isBookmarked?: boolean;
  userNotes?: string;
}

export interface TestAttempt {
  id: string;
  testTitle: string;
  subjectId?: SubjectId;
  mode: 'timed' | 'untimed';
  totalQuestions: number;
  timeSpentSeconds: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unattempted: number;
  score: number;
  maxScore: number;
  percentage: number;
  marksPerCorrect?: number;
  negativeMarks?: number;
  estimatedPercentile?: number;
  estimatedRank?: number;
  date: string;
  answers: Record<string, string | number>; // questionId -> answer
}

export interface OfflineTestRecord {
  id: string;
  testName: string;
  instituteName: string; // e.g., "Allen", "Aakash", "FIITJEE", "School Unit Test"
  date: string; // ISO date YYYY-MM-DD
  testType: 'Part Test' | 'Full Syllabus Mock' | 'Topic Drill' | 'School Exam';
  subject: string; // "Physics", "Full PCM", "Chemistry", etc.
  maxMarks: number;
  obtainedMarks: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  rank?: number;
  totalCandidates?: number;
  syllabusCovered?: string;
  notes?: string;
  calculatedPercentage: number;
}

export interface FormulaItem {
  id: string;
  subjectId: SubjectId;
  chapterId?: string;
  chapterTitle: string;
  title: string;
  formula: string;
  variables: string;
  notes?: string;
}

export interface PeriodicElement {
  number: number;
  symbol: string;
  name: string;
  mass: number;
  category: 'nonmetal' | 'noble_gas' | 'alkali_metal' | 'alkaline_earth' | 'metalloid' | 'halogen' | 'transition_metal' | 'post_transition_metal' | 'lanthanide' | 'actinide';
  group: number;
  period: number;
  electronConfig: string;
  electronegativity?: number;
  oxidationStates?: string;
  stateAtStp?: 'Solid' | 'Liquid' | 'Gas';
  valenceElectrons?: string;
}

export interface PeriodicGroupInfo {
  groupNumber: number;
  id: string;
  iupacGroup: string;
  casGroup: string;
  familyName: string;
  block: string;
  valenceShell: string;
  commonOxidationStates: string;
  bondingCharacter: string;
  periodicTrends: string;
  keyProperties: string[];
  signatureCompounds: string[];
}

export type ReasoningPower = 'auto' | 'flash-lite' | 'flash' | 'pro';

export type AIAttachmentKind = 'image' | 'pdf' | 'ppt' | 'text' | 'document';

export type AttachmentFilterPreset = 'none' | 'high_contrast' | 'inverted' | 'warm';

export interface AIUploadedAttachment {
  id: string;
  name: string;
  mimeType: string;
  kind: AIAttachmentKind;
  sizeBytes?: number;
  base64?: string;
  extractedText?: string;
  uri?: string;
  summaryHint?: string;
  edited?: boolean;
  editedAt?: string;
  rotationDeg?: number;
  filterPreset?: AttachmentFilterPreset;
}

export interface WebSearchCitation {
  title: string;
  uri: string;
}

export interface MessageFeedback {
  rating?: 'up' | 'down';
  reason?: string;
  comment?: string;
  updatedAt: string;
}

export type AppErrorSource =
  | 'gemini'
  | 'gemini_image'
  | 'supabase'
  | 'calendar'
  | 'attachment'
  | 'quota';

export interface AppErrorInfo {
  id: string;
  source: AppErrorSource;
  code?: string | number;
  title: string;
  message: string;
  suggestion: string;
  rawError: string;
  timestamp: string;
  canRetry: boolean;
  canUseOffline?: boolean;
}

export type StemVisualSubject = 'math' | 'physics' | 'chemistry';
export type StemVisualBgTheme = 'dark' | 'light' | 'blueprint';

export interface StemVisualAnnotation {
  id: string;
  text: string;
  xPct: number;
  yPct: number;
  color?: string;
}

export type UserPlanTier = 'free' | 'pro' | 'ultra';

export interface UserPlanQuota {
  planId: UserPlanTier;
  label: string;
  maxStorageBytes: number;
  maxImages: number;
  priceLabel: string;
  features: string[];
}

export interface GeneratedStemImage {
  id: string;
  title: string;
  prompt: string;
  subjectCategory: StemVisualSubject;
  format: 'png' | 'svg';
  dataUri: string;
  svgMarkup?: string;
  byteSize: number;
  width: number;
  height: number;
  createdAt: string;
  editedAt?: string;
  source: 'gemini' | 'stem_engine';
  modelLabel?: string;
  caption?: string;
  visualPresetKey?: string;
  rotationDeg: number;
  flipX?: boolean;
  bgTheme: StemVisualBgTheme;
  showGrid: boolean;
  showLabels: boolean;
  annotations: StemVisualAnnotation[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  subjectContext?: SubjectId;
  isMathFormula?: boolean;
  modelId?: string;
  modelLabel?: string;
  reasoningPower?: ReasoningPower;
  detectedDifficulty?: QuestionDifficulty;
  isFallback?: boolean;
  promptQuery?: string;
  feedback?: MessageFeedback;
  citations?: WebSearchCitation[];
  webSearchUsed?: boolean;
  generatedImageId?: string;
  errorInfo?: AppErrorInfo;
  steps?: string[];
  tips?: string[];
  attachments?: AIUploadedAttachment[];
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  webSearchEnabled?: boolean;
  messages: ChatMessage[];
}

export type ResolvedCountryCode = 'IN' | 'US' | 'GB' | 'CA' | 'AU' | 'SG' | 'AE';
export type HolidayCountryCode = 'AUTO' | ResolvedCountryCode;

export interface CalendarHoliday {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  country: ResolvedCountryCode;
  category: 'public' | 'academic' | 'observance';
  note?: string;
}

export interface PlannerExam {
  id: string;
  name: string;
  targetDate: string; // YYYY-MM-DD
  category: string;
  reminderDaysBefore?: 1 | 2 | 3;
}

export interface PlannerGoal {
  id: string;
  title: string;
  subject: string;
  dateKey: string; // YYYY-MM-DD
  dueToday: boolean;
  isCompleted: boolean;
  durationMinutes: number;
}

export interface PlannerCalendarState {
  selectedCountry: HolidayCountryCode;
  exams: PlannerExam[];
  goals: PlannerGoal[];
}

export type ParticleIntensity = 'low' | 'standard' | 'high';

export interface AppSettings {
  masterSound: boolean;
  correctSound: boolean;
  incorrectSound: boolean;
  completionSound: boolean;
  clickSound: boolean;
  hapticFeedback: boolean;
  celebrationParticles: boolean;
  reducedMotion: boolean;
  particleIntensity: ParticleIntensity;
  aiReasoningPower?: ReasoningPower;
}

export type CelebrationTier = 'normal' | 'excellent' | 'personal_best';

export interface CelebrationEvent {
  tier: CelebrationTier;
  score: number;
  maxScore: number;
  percentage: number;
  isPersonalBest: boolean;
  correctAnswers: number;
  incorrectAnswers: number;
  timeSpentStr: string;
}

export type QuestionTextSize = 'small' | 'medium' | 'large' | 'xlarge';

export interface QuestionViewSettings {
  showHints: boolean;
  alwaysShowMyNote: boolean;
  solutionModeOnReopen: boolean;
  autoStartTimer: boolean;
  playSounds: boolean;
  deferCorrectAnswer: boolean;
  textSize: QuestionTextSize;
  showPeerInsights: boolean;
}

export interface QuestionAttemptStat {
  questionId: string;
  subjectId: SubjectId;
  chapterId: string;
  difficulty: QuestionDifficulty;
  isCorrect: boolean;
  timeSpentSeconds: number;
  selectedAnswer: string | number;
  attemptedAt: string;
}

export interface DailyGoalConfig {
  targetQuestions: number;
  reminderEnabled: boolean;
  reminderTime: string; // HH:mm (24h), e.g., "20:00"
  scoreAlertsEnabled: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  lastReminderDismissedDate?: string;
}

export interface DailyActivitySummary {
  date: string; // YYYY-MM-DD local date
  questionsSolved: number;
  correctCount: number;
  totalTimeSeconds: number;
  xpEarned: number;
}

export interface WeekStreakDay {
  date: string;
  dayShort: string; // Mon..Sun
  questionsSolved: number;
  metGoal: boolean;
  isToday: boolean;
  isFuture: boolean;
}

export type LeagueTierId = 'starter' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface LeaderboardEntry {
  id: string;
  name: string;
  ioId: string;
  weeklyXp: number;
  todayXp: number;
  weeklyQuestions: number;
  todayQuestions: number;
  accuracyPercent: number;
  streakDays: number;
  rank?: number;
  isCurrentUser?: boolean;
}

export interface CustomNotebook {
  id: string;
  name: string;
  color: string;
  questionIds: string[];
  createdAt: string;
}

export type FormulaStatus = 'unseen' | 'seen' | 'need_revision';

export interface CustomTestConfig {
  id: string;
  title: string;
  subjectIds: SubjectId[];
  difficulties: QuestionDifficulty[];
  questionIds: string[];
  mode: 'practice' | 'exam';
  durationMinutes: number;
  marksPerCorrect?: number;
  negativeMarks?: number;
  targetRank?: number;
  totalCandidates?: number;
  createdAt: string;
}

export interface TestSessionLaunch {
  title: string;
  mode: 'practice' | 'exam';
  questionIds: string[];
  initialQuestionIndex?: number;
  marksPerCorrect?: number;
  negativeMarks?: number;
  targetRank?: number;
  totalCandidates?: number;
  nonce: number;
}

export interface ActiveTestWorkspaceState {
  sessionTitle: string;
  activeQuestionIds: string[];
  currentIdx: number;
  draftAnswers: Record<string, string | number>;
  submittedAnswers: Record<string, string | number>;
  numericalInputs: Record<string, string>;
  isPracticeMode: boolean;
  marksPerCorrect: number;
  negativeMarks: number;
  targetRank?: number;
  totalCandidates?: number;
  isSubmitted: boolean;
  secondsElapsed: number;
  questionSeconds: Record<string, number>;
}

// ---------- Rich Chapter Study Material (Module C) ----------
export interface WorkedExample {
  id: string;
  title: string;
  problem: string;
  solutionSteps: string[];
  finalAnswer: string;
}

export interface MindMapBranch {
  id: string;
  title: string;
  color: string;
  nodes: string[];
  keyFormula?: string;
}

export interface ChapterStudyModule {
  chapterId: string;
  summary: string;
  detailedNotes: string[];
  normalNotes: string[];
  rapidBullets: string[];
  flowSteps: string[];
  mindMapRoot: string;
  mindMapBranches: MindMapBranch[];
  workedExamples: WorkedExample[];
  examPitfalls: string[];
}

// ---------- Editable Custom Syllabus & Revision Tracker (Module G) ----------
export type SyllabusTopicStatus = 'not_started' | 'in_progress' | 'revised';

export interface CustomSyllabusTopic {
  id: string;
  title: string;
  status: SyllabusTopicStatus;
}

export interface CustomSyllabusModule {
  id: string;
  subject: string;
  color: string;
  completedChapters: number;
  totalChapters: number;
  recentTopic: string;
  status: 'Ahead' | 'On Track' | 'Needs Acceleration';
  topics: CustomSyllabusTopic[];
}

// ---------- Extended Gamification (Module M) ----------
export type LeaderboardTimeframe = 'today' | 'week' | 'month' | 'year' | 'all_time';

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  iconName: 'flame' | 'target' | 'trophy' | 'sparkles' | 'book' | 'users' | 'award';
  color: string;
  unlocked: boolean;
  progressLabel: string;
}

export interface DailyChallenge {
  id: string;
  title: string;
  subtitle: string;
  xpReward: number;
  currentCount: number;
  targetCount: number;
  claimed: boolean;
}

// ---------- Community, Clubs & Teacher/Institute Platform (Modules L & N) ----------
export type ClubKind = 'institute' | 'study_club';

export type ClubCategoryTag =
  | 'JEE / NEET Cohort'
  | 'School / Board Class'
  | 'Peer Study Guild'
  | 'Olympiad & STEM Lab'
  | 'IB / AP / SAT Circle'
  | 'Doubt Solving Hub';

export type SystemStaffRole =
  | 'Platform Admin'
  | 'Institute Owner'
  | 'Principal'
  | 'Teacher'
  | 'Subject Teacher'
  | 'Class Monitor'
  | 'Student';

export interface ClubPermissions {
  canManageClub: boolean;
  canManageChannels: boolean;
  canManageRoles: boolean;
  canCreateAssignments: boolean;
  canTakeAttendance: boolean;
  canModerateMessages: boolean;
  canPostAnnouncements: boolean;
  canPinMessages: boolean;
  canViewAnalytics: boolean;
}

export interface ClubRole {
  id: string;
  name: string;
  color: string;
  badgeIcon: string; // e.g. 'crown' | 'shield' | 'graduation' | 'sparkles' | 'book' | 'user'
  priority: number;
  isDefault?: boolean;
  permissions: ClubPermissions;
}

export type ChannelCategoryType = 'Information' | 'Academic Feeds' | 'Study Channels';

export type ChannelType = 'text' | 'announcements' | 'assignments' | 'resources' | 'polls' | 'rules';

export type ChannelAccessMode = 'open' | 'public_view' | 'role_private';

export interface ClubChannel {
  id: string;
  clubId: string;
  name: string;
  topic: string;
  category: ChannelCategoryType;
  type: ChannelType;
  accessMode: ChannelAccessMode;
  isReadOnly: boolean;
  isSystem?: boolean; // #rules, #announcements cannot be deleted
  allowedRoleIds: string[];
  blockExternalLinks?: boolean;
  unreadCount?: number;
}

export interface ClubMember {
  userId: string;
  name: string;
  ioId: string;
  avatarColor: string;
  staffLabel: SystemStaffRole;
  roleIds: string[];
  joinedAt: string;
  isOnline: boolean;
  xp: number;
  bio?: string;
}

export interface ClubJoinRequest {
  id: string;
  userId: string;
  name: string;
  ioId: string;
  message: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ClubPollOption {
  id: string;
  text: string;
  voterIds: string[];
}

export interface ClubPoll {
  question: string;
  allowMultiple?: boolean;
  options: ClubPollOption[];
}

export interface ClubResourceAttachment {
  id: string;
  title: string;
  kind: 'pdf' | 'notes' | 'ppt' | 'image';
  sizeLabel: string;
  previewSummary: string;
}

export interface ClubMessageReaction {
  emoji: string;
  userIds: string[];
}

export interface ClubMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderRoleBadge?: string;
  senderRoleColor?: string;
  content: string;
  createdAt: string;
  isPinned?: boolean;
  isVerifiedAnswer?: boolean;
  isSystemMessage?: boolean;
  isBotMessage?: boolean;
  poll?: ClubPoll;
  assignmentId?: string;
  resource?: ClubResourceAttachment;
  reactions: ClubMessageReaction[];
  replyToSnippet?: string;
}

export interface InstituteAssignment {
  id: string;
  clubId: string;
  channelId: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  maxMarks: number;
  createdByName: string;
  createdAt: string;
  linkedQuestionIds?: string[]; // Opens directly in Study Labs Test Engine!
  linkedTestMode?: 'practice' | 'exam';
  targetExamLabel?: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  responseText: string;
  submittedAt: string;
  score?: number;
  feedback?: string;
  status: 'submitted' | 'graded';
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceRecord {
  id: string;
  clubId: string;
  date: string; // YYYY-MM-DD
  sessionLabel: string;
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
  markedByName: string;
  recordedAt: string;
  note?: string;
}

export interface StudyClub {
  id: string;
  name: string;
  slug: string;
  inviteCode: string;
  kind: ClubKind;
  category: ClubCategoryTag;
  description: string;
  tags: string[];
  primaryLanguage: PreferredLanguage;
  country: string;
  isPrivate: boolean;
  isVerified: boolean;
  isOfficial?: boolean;
  ownerId: string;
  ownerName: string;
  aboutAdmin: string;
  bannerColor: string;
  iconColor: string;
  rules: string[];
  createdAt: string;
  roles: ClubRole[];
  members: ClubMember[];
  channels: ClubChannel[];
  messages: ClubMessage[];
  assignments: InstituteAssignment[];
  submissions: AssignmentSubmission[];
  attendance: AttendanceRecord[];
  joinRequests: ClubJoinRequest[];
}

export interface DirectMessageItem {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

export interface DirectMessageThread {
  id: string;
  peerUserId: string;
  peerName: string;
  peerIoId: string;
  peerRole: string;
  avatarColor: string;
  messages: DirectMessageItem[];
}

export interface SafetyReport {
  id: string;
  targetType: 'message' | 'user' | 'club';
  targetId: string;
  targetName: string;
  reason: string;
  details: string;
  createdAt: string;
  status: 'logged_locally' | 'submitted';
}

export interface ClubsWorkspaceState {
  clubs: StudyClub[];
  activeClubId: string;
  activeChannelId: string;
  joinedClubIds: string[];
  dmThreads: DirectMessageThread[];
  blockedUserIds: string[];
  followingUserIds: string[];
  safetyReports: SafetyReport[];
  roleOverrideByClub: Record<string, SystemStaffRole | 'actual'>;
}



