import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HOLO_NAME, HOLO_REACTIONS, PRESET_AVATARS } from '../../utils/avatarHelper';
import { HapticManager } from '../../services/hapticManager';
import { SoundManager } from '../../services/soundManager';
import type { AcademicStream, CurriculumBoard, UserProfile } from '../../types';
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronRight,
  Flame,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react-native';

interface MarksOnboardingWizardProps {
  initialProfile: UserProfile;
  authEmail: string;
  authName: string;
  onBackToAuth: () => void;
  onComplete: (completedFields: {
    name: string;
    stream: AcademicStream;
    board: CurriculumBoard;
    classGrade: string;
    targetYear: number;
    targetExams: string[];
    avatarUri?: string;
  }) => void;
}

const TRACK_OPTIONS: Array<{
  id: string;
  label: string;
  sub: string;
  stream: AcademicStream;
  board: CurriculumBoard;
}> = [
  {
    id: 'engineering',
    label: 'Engineering',
    sub: 'IIT-JEE Main, JEE Advanced, BITSAT, MHT-CET & State CETs',
    stream: 'Science (PCM)',
    board: 'JEE_MAIN',
  },
  {
    id: 'medical',
    label: 'Medical',
    sub: 'NEET UG, AIIMS & Biology Mastery',
    stream: 'Science (PCB)',
    board: 'NEET',
  },
  {
    id: 'boards',
    label: 'School Boards',
    sub: 'CBSE, ICSE, PSEB & State Board Class 11–12',
    stream: 'Science (PCMB)',
    board: 'CBSE',
  },
  {
    id: 'global',
    label: 'Global STEM & CS',
    sub: 'SAT, AP, IB, Cambridge & Computer Science',
    stream: 'General STEM',
    board: 'IB_CAMBRIDGE',
  },
];

const CLASS_OPTIONS = [
  'Class 11',
  'Class 12',
  '1st Time Dropper',
  '2nd Time Dropper',
  'Undergraduate / Self-Study',
];

const YEAR_OPTIONS = ['2026', '2027', '2028', '2029'];

const EXAM_TILES: Array<{ id: string; label: string; accent: string }> = [
  { id: 'JEE Main', label: 'JEE Main', accent: '#F97316' },
  { id: 'JEE Advanced', label: 'JEE Adv.', accent: '#EF4444' },
  { id: 'MHT CET', label: 'MHT CET', accent: '#3B82F6' },
  { id: 'NEET UG', label: 'NEET UG', accent: '#10B981' },
  { id: 'BITSAT', label: 'BITSAT', accent: '#8B5CF6' },
  { id: 'CBSE Boards', label: 'CBSE Boards', accent: '#06B6D4' },
  { id: 'COMEDK', label: 'COMEDK', accent: '#EC4899' },
  { id: 'WBJEE', label: 'WBJEE', accent: '#F59E0B' },
  { id: 'KCET', label: 'KCET', accent: '#14B8A6' },
  { id: 'VITEEE', label: 'VITEEE', accent: '#6366F1' },
  { id: 'CUET', label: 'CUET UG', accent: '#A855F7' },
  { id: 'NDA', label: 'NDA', accent: '#84CC16' },
];

const HIGHLIGHT_SLIDES = [
  {
    title: 'Practice Authentic PYQs & Open STEM Banks',
    subtitle: '375+ JEE Main Shift Questions in crisp LaTeX + 60 Open STEM & CS quizzes + Digital Books.',
    stat: 'Chapter-Wise · Year-Wise · KaTeX Ready',
    Icon: BookOpen,
    accent: '#F97316',
  },
  {
    title: 'Organized Mock Tests & Custom Test Builder',
    subtitle: 'Take full shift papers or build custom chapter tests with +4/-1 marking & rank analytics.',
    stat: 'PYQ Mocks · Custom Tests · Coaching Tracker',
    Icon: Target,
    accent: '#3B82F6',
  },
  {
    title: `Meet ${HOLO_NAME} · Your Personal AI Tutor`,
    subtitle: 'Daily Goal streaks, 7-Day League leaderboards, Study Clubs & HOLO multimodal STEM help.',
    stat: 'Daily Goals · 7-Day Leagues · HOLO AI',
    Icon: Trophy,
    accent: '#10B981',
  },
];

export const MarksOnboardingWizard: React.FC<MarksOnboardingWizardProps> = ({
  initialProfile,
  authEmail,
  authName,
  onBackToAuth,
  onComplete,
}) => {
  const insets = useSafeAreaInsets();
  // Steps 1..5: Profile preferences, Step 6: Feature Highlights, Step 7: Final Welcome Splash
  const [step, setStep] = useState<number>(1);
  const [selectedTrack, setSelectedTrack] = useState<string>('engineering');
  const [selectedClass, setSelectedClass] = useState<string>(initialProfile.classGrade || 'Class 12');
  const [targetYear, setTargetYear] = useState<string>(String(initialProfile.targetYear || 2027));
  const [selectedExams, setSelectedExams] = useState<string[]>(
    initialProfile.targetExams?.length ? initialProfile.targetExams : ['JEE Main']
  );
  const [studentName, setStudentName] = useState<string>(
    authName || initialProfile.name || (authEmail ? authEmail.split('@')[0] : '')
  );
  const [avatarUri, setAvatarUri] = useState<string | undefined>(
    initialProfile.avatarUri || 'preset:boy'
  );
  const [highlightIndex, setHighlightIndex] = useState<number>(0);

  const totalProgressSteps = 6;
  const activeTrackObj = TRACK_OPTIONS.find((t) => t.id === selectedTrack) || TRACK_OPTIONS[0];

  const toggleExam = (examId: string) => {
    HapticManager.triggerSelection();
    SoundManager.play('click');
    setSelectedExams((prev) =>
      prev.includes(examId)
        ? prev.length > 1
          ? prev.filter((e) => e !== examId)
          : prev
        : [...prev, examId]
    );
  };

  const handleBack = () => {
    HapticManager.triggerSelection();
    if (step === 6 && highlightIndex > 0) {
      setHighlightIndex((i) => i - 1);
      return;
    }
    if (step > 1) {
      setStep((s) => s - 1);
    } else {
      onBackToAuth();
    }
  };

  const handleNext = () => {
    HapticManager.triggerSelection();
    SoundManager.play('click');
    if (step < 5) {
      setStep((s) => s + 1);
      return;
    }
    if (step === 5) {
      if (!studentName.trim()) return;
      setStep(6);
      setHighlightIndex(0);
      return;
    }
    if (step === 6) {
      if (highlightIndex < HIGHLIGHT_SLIDES.length - 1) {
        setHighlightIndex((i) => i + 1);
      } else {
        setStep(7);
      }
      return;
    }
    // Step 7: Final Launch -> Dashboard
    SoundManager.play('achievement');
    HapticManager.triggerSuccess();
    onComplete({
      name: studentName.trim() || 'Scholar',
      stream: activeTrackObj.stream,
      board: activeTrackObj.board,
      classGrade: selectedClass,
      targetYear: parseInt(targetYear, 10) || 2027,
      targetExams: selectedExams.length > 0 ? selectedExams : ['JEE Main'],
      avatarUri,
    });
  };

  const canProceed =
    step !== 5 ? true : studentName.trim().length >= 2;

  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: Math.max(insets.top + 10, 18),
          paddingBottom: Math.max(insets.bottom + 14, 20),
        },
      ]}
    >
      {/* Top MARKS-Style Navigation + Segmented Progress Bar */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={handleBack} style={styles.backIconBtn} hitSlop={10}>
          <ArrowLeft size={21} color="#F8FAFC" />
        </TouchableOpacity>

        <View style={styles.progressTrackRow}>
          {Array.from({ length: totalProgressSteps }).map((_, idx) => {
            const filled = step > idx + 1 || (step === 7);
            const current = step === idx + 1;
            return (
              <View
                key={idx}
                style={[
                  styles.progressSegment,
                  filled && styles.progressSegmentDone,
                  current && styles.progressSegmentActive,
                ]}
              />
            );
          })}
        </View>

        {step === 6 ? (
          <TouchableOpacity onPress={() => setStep(7)} hitSlop={8}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 28 }} />
        )}
      </View>

      {/* Main Step Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {step === 1 && (
          <View style={styles.stepWrap}>
            <Text style={styles.questionTitle}>What are you preparing for?</Text>
            <View style={styles.optionsColumn}>
              {TRACK_OPTIONS.map((opt) => {
                const active = selectedTrack === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    focusable={false}
                    onPress={() => {
                      setSelectedTrack(opt.id);
                      HapticManager.triggerSelection();
                      SoundManager.play('click');
                      if (opt.id === 'medical') setSelectedExams(['NEET UG']);
                      else if (opt.id === 'boards') setSelectedExams(['CBSE Boards']);
                      else setSelectedExams(['JEE Main']);
                    }}
                    style={[
                      styles.radioCard,
                      active && styles.radioCardActive,
                    ]}
                  >
                    <View style={[styles.radioOuter, active && styles.radioOuterActive]}>
                      {active && <View style={styles.radioInner} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.radioTitle}>{opt.label}</Text>
                      <Text style={styles.radioSub}>{opt.sub}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepWrap}>
            <Text style={styles.questionTitle}>Which class are you in?</Text>
            <View style={styles.optionsColumn}>
              {CLASS_OPTIONS.map((cls) => {
                const active = selectedClass === cls;
                return (
                  <Pressable
                    key={cls}
                    focusable={false}
                    onPress={() => {
                      setSelectedClass(cls);
                      HapticManager.triggerSelection();
                      SoundManager.play('click');
                    }}
                    style={[styles.simpleOptionCard, active && styles.radioCardActive]}
                  >
                    <Text style={[styles.radioTitle, active && { color: '#FFFFFF' }]}>{cls}</Text>
                    {active && <Check size={18} color="#F97316" />}
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepWrap}>
            <Text style={styles.questionTitle}>In which year are you appearing for exam?</Text>
            <TextInput
              value={targetYear}
              onChangeText={setTargetYear}
              keyboardType="number-pad"
              maxLength={4}
              placeholder="2027"
              placeholderTextColor="#64748B"
              style={styles.cleanInput}
            />
            <View style={styles.yearChipsRow}>
              {YEAR_OPTIONS.map((yr) => {
                const active = targetYear === yr;
                return (
                  <TouchableOpacity
                    key={yr}
                    onPress={() => {
                      setTargetYear(yr);
                      HapticManager.triggerSelection();
                    }}
                    style={[styles.yearChip, active && styles.yearChipActive]}
                  >
                    <Text style={[styles.yearChipText, active && { color: '#FFFFFF' }]}>{yr}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {step === 4 && (
          <View style={styles.stepWrap}>
            <Text style={styles.questionTitle}>Pick the exams you're preparing for</Text>
            <Text style={styles.stepHelper}>Select one or more target exams to customize your PYQ Bank & tests.</Text>
            <View style={styles.examGrid}>
              {EXAM_TILES.map((ex) => {
                const active = selectedExams.includes(ex.id);
                return (
                  <Pressable
                    key={ex.id}
                    focusable={false}
                    onPress={() => toggleExam(ex.id)}
                    style={[
                      styles.examGridTile,
                      active && {
                        borderColor: '#F97316',
                        backgroundColor: 'rgba(249, 115, 22, 0.14)',
                      },
                    ]}
                  >
                    <View style={[styles.examTileDot, { backgroundColor: ex.accent }]}>
                      {active ? (
                        <Check size={13} color="#FFFFFF" />
                      ) : (
                        <Text style={styles.examTileDotText}>{ex.label.charAt(0)}</Text>
                      )}
                    </View>
                    <Text style={styles.examGridLabel} numberOfLines={1}>
                      {ex.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {step === 5 && (
          <View style={styles.stepWrap}>
            <Text style={styles.questionTitle}>What's your name?</Text>
            <Text style={styles.stepHelper}>
              {authEmail
                ? `Linked to ${authEmail}. Feel free to update how HOLO greets you.`
                : 'Enter your display name & pick a scholar avatar.'}
            </Text>
            <TextInput
              value={studentName}
              onChangeText={setStudentName}
              placeholder="Enter your full name"
              placeholderTextColor="#64748B"
              style={styles.cleanInput}
              autoFocus
            />

            <Text style={styles.avatarHeading}>CHOOSE YOUR SCHOLAR AVATAR</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10, paddingVertical: 6 }}
            >
              {PRESET_AVATARS.slice(0, 12).map((av) => {
                const active = avatarUri === av.id;
                return (
                  <TouchableOpacity
                    key={av.id}
                    onPress={() => {
                      setAvatarUri(av.id);
                      HapticManager.triggerSelection();
                    }}
                    style={[
                      styles.avatarChoiceWrap,
                      active && { borderColor: '#F97316', borderWidth: 2.5 },
                    ]}
                  >
                    <Image source={av.source} style={styles.avatarChoiceImg} resizeMode="cover" />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {step === 6 && (
          <View style={styles.highlightWrap}>
            {(() => {
              const slide = HIGHLIGHT_SLIDES[highlightIndex];
              const SlideIcon = slide.Icon;
              return (
                <>
                  <View style={[styles.highlightCard, { borderColor: slide.accent }]}>
                    <View style={[styles.highlightIconBadge, { backgroundColor: `${slide.accent}22` }]}>
                      <SlideIcon size={34} color={slide.accent} />
                    </View>
                    <Image
                      source={
                        highlightIndex === 0
                          ? HOLO_REACTIONS.studying
                          : highlightIndex === 1
                          ? HOLO_REACTIONS.thinking
                          : HOLO_REACTIONS.celebrating_jump
                      }
                      style={styles.highlightHolo}
                      resizeMode="contain"
                    />
                    <Text style={styles.highlightTitle}>{slide.title}</Text>
                    <Text style={styles.highlightSub}>{slide.subtitle}</Text>
                    <View style={styles.highlightStatPill}>
                      <Sparkles size={13} color="#F97316" />
                      <Text style={styles.highlightStatText}>{slide.stat}</Text>
                    </View>
                  </View>

                  <View style={styles.dotsRow}>
                    {HIGHLIGHT_SLIDES.map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.slideDot,
                          i === highlightIndex && styles.slideDotActive,
                        ]}
                      />
                    ))}
                  </View>
                </>
              );
            })()}
          </View>
        )}

        {step === 7 && (
          <View style={styles.welcomeSplashWrap}>
            <Image
              source={HOLO_REACTIONS.waving}
              style={styles.welcomeHolo}
              resizeMode="contain"
            />
            <Text style={styles.welcomeHey}>Hey {studentName.trim() || 'Scholar'}!</Text>
            <Text style={styles.welcomeBig}>WELCOME</Text>
            <Text style={styles.welcomeBig}>
              TO <Text style={{ color: '#F97316' }}>STUDY LABS</Text>
            </Text>
            <Text style={styles.welcomeDesc}>
              Your Complete AI-Powered Practice App for{' '}
              <Text style={{ color: '#FDBA74', fontWeight: '800' }}>
                {selectedExams.slice(0, 3).join(', ')}
              </Text>
            </Text>
            <View style={styles.folderReadyPill}>
              <Flame size={14} color="#22C55E" />
              <Text style={styles.folderReadyText}>
                Personal B2 & Supabase folders ready on launch
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Sticky CTA Footer */}
      <View style={styles.footer}>
        {step <= 5 && (
          <Text style={styles.footerNote}>
            You can update this in future from Profile section.
          </Text>
        )}
        <Pressable
          focusable={false}
          disabled={!canProceed}
          onPress={handleNext}
          style={({ pressed }) => [
            styles.primaryBtn,
            step === 7 && styles.whiteProceedBtn,
            !canProceed && { opacity: 0.45 },
            pressed && { opacity: 0.88 },
          ]}
        >
          <Text style={[styles.primaryBtnText, step === 7 && { color: '#0B0F19' }]}>
            {step === 5
              ? 'Complete Profile'
              : step === 7
              ? 'Proceed to Dashboard'
              : 'Next'}
          </Text>
          {step === 7 && <ChevronRight size={18} color="#0B0F19" />}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0B0F19',
    paddingHorizontal: 18,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 22,
    width: '100%',
    maxWidth: 540,
    alignSelf: 'center',
  },
  backIconBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrackRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#1E293B',
  },
  progressSegmentDone: {
    backgroundColor: '#22C55E',
  },
  progressSegmentActive: {
    backgroundColor: '#F97316',
  },
  skipText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
    width: '100%',
    maxWidth: 540,
    alignSelf: 'center',
  },
  stepWrap: {
    gap: 14,
  },
  questionTitle: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '800',
    lineHeight: 32,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  stepHelper: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 19,
    marginTop: -6,
  },
  optionsColumn: {
    gap: 12,
    marginTop: 6,
  },
  radioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#1E293B',
    backgroundColor: '#111726',
  },
  simpleOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 17,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#1E293B',
    backgroundColor: '#111726',
  },
  radioCardActive: {
    borderColor: '#F97316',
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#64748B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: '#F97316',
  },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#F97316',
  },
  radioTitle: {
    color: '#F1F5F9',
    fontSize: 15.5,
    fontWeight: '700',
  },
  radioSub: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  cleanInput: {
    borderWidth: 1.5,
    borderColor: '#334155',
    backgroundColor: '#111726',
    color: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 16,
    fontWeight: '700',
  },
  yearChipsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  yearChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    backgroundColor: '#111726',
    alignItems: 'center',
  },
  yearChipActive: {
    borderColor: '#F97316',
    backgroundColor: '#F97316',
  },
  yearChipText: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '800',
  },
  examGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
    marginTop: 6,
  },
  examGridTile: {
    width: '31.5%',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#1E293B',
    backgroundColor: '#111726',
    alignItems: 'center',
    gap: 8,
  },
  examTileDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  examTileDotText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  examGridLabel: {
    color: '#F1F5F9',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  avatarHeading: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.7,
    marginTop: 8,
  },
  avatarChoiceWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1.5,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  avatarChoiceImg: {
    width: '100%',
    height: '100%',
  },
  highlightWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18,
    paddingVertical: 14,
  },
  highlightCard: {
    width: '100%',
    borderRadius: 22,
    borderWidth: 1.5,
    backgroundColor: '#111726',
    padding: 24,
    alignItems: 'center',
    gap: 14,
  },
  highlightIconBadge: {
    width: 62,
    height: 62,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightHolo: {
    width: 110,
    height: 110,
  },
  highlightTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 26,
  },
  highlightSub: {
    color: '#CBD5E1',
    fontSize: 13.5,
    textAlign: 'center',
    lineHeight: 20,
  },
  highlightStatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(249, 115, 22, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.35)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  highlightStatText: {
    color: '#FDBA74',
    fontSize: 11.5,
    fontWeight: '800',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  slideDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#334155',
  },
  slideDotActive: {
    width: 24,
    backgroundColor: '#F97316',
  },
  welcomeSplashWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  welcomeHolo: {
    width: 120,
    height: 120,
    marginBottom: 6,
  },
  welcomeHey: {
    color: '#CBD5E1',
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 4,
  },
  welcomeBig: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  welcomeDesc: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 8,
    paddingHorizontal: 12,
  },
  folderReadyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 14,
    backgroundColor: 'rgba(34, 197, 94, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.35)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  folderReadyText: {
    color: '#86EFAC',
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    gap: 10,
    paddingTop: 10,
    width: '100%',
    maxWidth: 540,
    alignSelf: 'center',
  },
  footerNote: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
  },
  primaryBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#F97316',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  whiteProceedBtn: {
    backgroundColor: '#FFFFFF',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '800',
  },
});
