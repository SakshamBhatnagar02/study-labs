import React, { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../theme';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  EDUCATION_LEVELS,
  GLOBAL_CURRICULUM_CATALOG,
  GRADE_LEVEL_OPTIONS,
  PREFERRED_LANGUAGES,
} from '../../data/curriculumData';
import { StorageService } from '../../services/storage';
import { HapticManager } from '../../services/hapticManager';
import { SoundManager } from '../../services/soundManager';
import type {
  AcademicStream,
  AuthProviderType,
  CurriculumBoard,
  EducationLevel,
  LearningMode,
  PreferredLanguage,
  UserProfile,
} from '../../types';
import { Check, Globe, Mail, ShieldCheck, Sparkles, Upload, User, X } from 'lucide-react-native';

interface OnboardingAuthModalProps {
  visible: boolean;
  onClose: () => void;
  initialProfile: UserProfile;
  onSaved: (updated: UserProfile) => void;
}

const STREAM_OPTIONS: AcademicStream[] = [
  'Science (PCM)',
  'Science (PCB)',
  'Science (PCMB)',
  'Commerce',
  'Arts & Humanities',
  'General STEM',
];

const AVATAR_SWATCHES = ['#F97316', '#22D3EE', '#10B981', '#8B5CF6', '#EC4899', '#3B82F6'];

export const OnboardingAuthModal: React.FC<OnboardingAuthModalProps> = ({
  visible,
  onClose,
  initialProfile,
  onSaved,
}) => {
  const { colors, mode } = useTheme();
  const [step, setStep] = useState<'account' | 'curriculum'>('curriculum');
  const [authProvider, setAuthProvider] = useState<AuthProviderType>(
    initialProfile.authProvider || 'guest'
  );
  const [name, setName] = useState(initialProfile.name);
  const [email, setEmail] = useState(initialProfile.email);
  const [country, setCountry] = useState(initialProfile.country || 'India');
  const [board, setBoard] = useState<CurriculumBoard>(initialProfile.board || 'JEE_MAIN');
  const [eduLevel, setEduLevel] = useState<EducationLevel>(
    initialProfile.educationLevel || 'Competitive Prep'
  );
  const [classGrade, setClassGrade] = useState(initialProfile.classGrade || 'Class 12');
  const [stream, setStream] = useState<AcademicStream>(initialProfile.stream || 'Science (PCM)');
  const [language, setLanguage] = useState<PreferredLanguage>(
    initialProfile.language || 'English'
  );
  const [learningMode, setLearningMode] = useState<LearningMode>(
    initialProfile.preferredMode || 'Normal'
  );
  const [targetYear, setTargetYear] = useState(String(initialProfile.targetYear || 2027));
  const [targetExams, setTargetExams] = useState<string[]>(
    initialProfile.targetExams || ['JEE Main']
  );
  const [avatarColor, setAvatarColor] = useState(initialProfile.avatarColor || '#F97316');
  const [avatarUri, setAvatarUri] = useState<string | undefined>(initialProfile.avatarUri);
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setAuthProvider(initialProfile.authProvider || 'guest');
    setName(initialProfile.name);
    setEmail(initialProfile.email);
    setCountry(initialProfile.country || 'India');
    setBoard(initialProfile.board || 'JEE_MAIN');
    setEduLevel(initialProfile.educationLevel || 'Competitive Prep');
    setClassGrade(initialProfile.classGrade || 'Class 12');
    setStream(initialProfile.stream || 'Science (PCM)');
    setLanguage(initialProfile.language || 'English');
    setLearningMode(initialProfile.preferredMode || 'Normal');
    setTargetYear(String(initialProfile.targetYear || 2027));
    setTargetExams(initialProfile.targetExams || ['JEE Main']);
    setAvatarColor(initialProfile.avatarColor || '#F97316');
    setAvatarUri(initialProfile.avatarUri);
    setAuthNotice(null);
  }, [visible, initialProfile]);

  const activeCountryCatalog =
    GLOBAL_CURRICULUM_CATALOG.find((c) => c.country === country) || GLOBAL_CURRICULUM_CATALOG[0];

  const handleSelectCountry = (nextCountry: string) => {
    setCountry(nextCountry);
    const cat =
      GLOBAL_CURRICULUM_CATALOG.find((c) => c.country === nextCountry) ||
      GLOBAL_CURRICULUM_CATALOG[0];
    if (!cat.boards.some((b) => b.id === board)) {
      setBoard(cat.boards[0].id);
    }
    setTargetExams([cat.defaultExams[0]]);
  };

  const toggleExamTag = (exam: string) => {
    setTargetExams((prev) =>
      prev.includes(exam)
        ? prev.length > 1
          ? prev.filter((e) => e !== exam)
          : prev
        : [...prev, exam]
    );
  };

  const handlePickAvatar = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });
      if (!res.canceled && res.assets?.[0]?.uri) {
        setAvatarUri(res.assets[0].uri);
        HapticManager.triggerSelection();
      }
    } catch {
      setAuthNotice('Gallery access unavailable in this preview; choose a Cyber Avatar badge color instead.');
    }
  };

  const handleSelectAuthMode = (prov: AuthProviderType) => {
    setAuthProvider(prov);
    if (prov === 'google') {
      setAuthNotice('Google SSO provider queued for Supabase Auth OAuth configuration (Phase 5). Local session works immediately.');
    } else if (prov === 'microsoft') {
      setAuthNotice('Microsoft Entra SSO queued for Supabase Auth configuration (Phase 5). Local session works immediately.');
    } else if (prov === 'email') {
      setAuthNotice('Email + Magic Link ready locally; connects to Supabase Auth once project OAuth keys are added.');
    } else {
      setAuthNotice('Guest Offline-First mode active — progress syncs cleanly locally.');
    }
  };

  const handleSave = async () => {
    const parsedYear = parseInt(targetYear, 10) || 2027;
    const updated: UserProfile = {
      ...initialProfile,
      name: name.trim() || initialProfile.name,
      email: email.trim() || initialProfile.email,
      country,
      board,
      educationLevel: eduLevel,
      classGrade,
      stream,
      language,
      preferredMode: learningMode,
      targetYear: parsedYear,
      targetExams,
      avatarColor,
      avatarUri,
      authProvider,
      onboardingCompleted: true,
    };
    await StorageService.saveUserProfile(updated);
    SoundManager.play('notify');
    HapticManager.triggerSuccess();
    onSaved(updated);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 0, paddingRight: 8 }}>
              <View style={[styles.badgeIcon, { backgroundColor: mode === 'dark' ? '#431407' : '#FFEDD5' }]}>
                <Globe size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                  Study Labs Global Setup
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={2}>
                  Personalize curriculum, language, learning style & account
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={{ flexShrink: 0, padding: 4 }} accessibilityLabel="Close onboarding">
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Top 2-step Pill Bar */}
          <View style={[styles.stepBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <TouchableOpacity
              onPress={() => setStep('curriculum')}
              style={[
                styles.stepBtn,
                step === 'curriculum' && { backgroundColor: colors.primary },
              ]}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: step === 'curriculum' ? '#FFFFFF' : colors.textSecondary }}>
                1. Global Curriculum & Style
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setStep('account')}
              style={[
                styles.stepBtn,
                step === 'account' && { backgroundColor: colors.primary },
              ]}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: step === 'account' ? '#FFFFFF' : colors.textSecondary }}>
                2. Account, Auth & Avatar
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll} contentContainerStyle={{ gap: 14, paddingVertical: 14 }}>
            {step === 'curriculum' ? (
              <>
                <View>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>COUNTRY / REGION</Text>
                  <View style={styles.chipWrap}>
                    {GLOBAL_CURRICULUM_CATALOG.map((item) => {
                      const active = country === item.country;
                      return (
                        <TouchableOpacity
                          key={item.country}
                          onPress={() => handleSelectCountry(item.country)}
                          style={[
                            styles.chip,
                            {
                              backgroundColor: active ? colors.primary : colors.surface,
                              borderColor: active ? colors.primary : colors.border,
                            },
                          ]}
                        >
                          <Text style={{ fontSize: 11.5, fontWeight: '700', color: active ? '#FFFFFF' : colors.text }}>
                            {item.flagLabel}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>
                    EXAM BOARD / EDUCATION SYSTEM ({country.toUpperCase()})
                  </Text>
                  <View style={styles.chipWrap}>
                    {activeCountryCatalog.boards.map((b) => {
                      const active = board === b.id;
                      return (
                        <TouchableOpacity
                          key={b.id}
                          onPress={() => setBoard(b.id)}
                          style={[
                            styles.chip,
                            {
                              backgroundColor: active ? colors.primary : colors.surface,
                              borderColor: active ? colors.primary : colors.border,
                            },
                          ]}
                        >
                          <Text style={{ fontSize: 11.5, fontWeight: '700', color: active ? '#FFFFFF' : colors.text }}>
                            {b.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>EDUCATION LEVEL</Text>
                  <View style={styles.chipWrap}>
                    {EDUCATION_LEVELS.map((lvl) => {
                      const active = eduLevel === lvl;
                      return (
                        <TouchableOpacity
                          key={lvl}
                          onPress={() => setEduLevel(lvl)}
                          style={[
                            styles.chip,
                            {
                              backgroundColor: active ? colors.secondary : colors.surface,
                              borderColor: active ? colors.secondary : colors.border,
                            },
                          ]}
                        >
                          <Text style={{ fontSize: 11.5, fontWeight: '700', color: active ? '#FFFFFF' : colors.text }}>
                            {lvl}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>GRADE / CLASS</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                    {GRADE_LEVEL_OPTIONS.map((g) => {
                      const active = classGrade === g;
                      return (
                        <TouchableOpacity
                          key={g}
                          onPress={() => setClassGrade(g)}
                          style={[
                            styles.chip,
                            {
                              backgroundColor: active ? colors.primary : colors.surface,
                              borderColor: active ? colors.primary : colors.border,
                            },
                          ]}
                        >
                          <Text style={{ fontSize: 11.5, fontWeight: '700', color: active ? '#FFFFFF' : colors.text }}>
                            {g}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                <View>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>ACADEMIC STREAM</Text>
                  <View style={styles.chipWrap}>
                    {STREAM_OPTIONS.map((st) => {
                      const active = stream === st;
                      return (
                        <TouchableOpacity
                          key={st}
                          onPress={() => setStream(st)}
                          style={[
                            styles.chip,
                            {
                              backgroundColor: active ? colors.primary : colors.surface,
                              borderColor: active ? colors.primary : colors.border,
                            },
                          ]}
                        >
                          <Text style={{ fontSize: 11.5, fontWeight: '700', color: active ? '#FFFFFF' : colors.text }}>
                            {st}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>TARGET EXAMS</Text>
                  <View style={styles.chipWrap}>
                    {activeCountryCatalog.defaultExams.map((ex) => {
                      const active = targetExams.includes(ex);
                      return (
                        <TouchableOpacity
                          key={ex}
                          onPress={() => toggleExamTag(ex)}
                          style={[
                            styles.chip,
                            {
                              backgroundColor: active ? (mode === 'dark' ? '#431407' : '#FFEDD5') : colors.surface,
                              borderColor: active ? colors.primary : colors.border,
                            },
                          ]}
                        >
                          <Text style={{ fontSize: 11.5, fontWeight: '700', color: active ? colors.primary : colors.text }}>
                            {active ? `✓ ${ex}` : ex}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1.5 }}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>PREFERRED LANGUAGE</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                      {PREFERRED_LANGUAGES.map((lang) => {
                        const active = language === lang;
                        return (
                          <TouchableOpacity
                            key={lang}
                            onPress={() => setLanguage(lang)}
                            style={[
                              styles.chip,
                              {
                                backgroundColor: active ? colors.primary : colors.surface,
                                borderColor: active ? colors.primary : colors.border,
                              },
                            ]}
                          >
                            <Text style={{ fontSize: 11, fontWeight: '700', color: active ? '#FFFFFF' : colors.text }}>
                              {lang}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                  <View style={{ width: 92 }}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>TARGET YEAR</Text>
                    <TextInput
                      keyboardType="numeric"
                      maxLength={4}
                      value={targetYear}
                      onChangeText={(t) => setTargetYear(t.replace(/[^0-9]/g, ''))}
                      style={[
                        styles.input,
                        { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
                      ]}
                    />
                  </View>
                </View>

                <View>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>DEFAULT LEARNING MODE</Text>
                  <View style={styles.chipWrap}>
                    {(['Detailed', 'Normal', 'Rapid Revision'] as LearningMode[]).map((lm) => {
                      const active = learningMode === lm;
                      return (
                        <TouchableOpacity
                          key={lm}
                          onPress={() => setLearningMode(lm)}
                          style={[
                            styles.chip,
                            {
                              backgroundColor: active ? colors.secondary : colors.surface,
                              borderColor: active ? colors.secondary : colors.border,
                            },
                          ]}
                        >
                          <Text style={{ fontSize: 11.5, fontWeight: '700', color: active ? '#FFFFFF' : colors.text }}>
                            {lm}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </>
            ) : (
              <>
                {/* Avatar Preview & Upload */}
                <View style={[styles.avatarBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={[styles.avatarPreview, { backgroundColor: avatarColor }]}>
                    {avatarUri ? (
                      <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
                    ) : (
                      <Text style={styles.avatarLetter}>
                        {(name.trim() || 'S').charAt(0).toUpperCase()}
                      </Text>
                    )}
                  </View>
                  <View style={{ flex: 1, gap: 6 }}>
                    <Text style={{ fontSize: 13.5, fontWeight: '800', color: colors.text }}>
                      Profile Avatar & Badge Theme
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                      {AVATAR_SWATCHES.map((sw) => (
                        <TouchableOpacity
                          key={sw}
                          onPress={() => {
                            setAvatarColor(sw);
                            setAvatarUri(undefined);
                          }}
                          style={[
                            styles.swatch,
                            {
                              backgroundColor: sw,
                              borderColor: avatarColor === sw && !avatarUri ? '#FFFFFF' : 'transparent',
                            },
                          ]}
                        />
                      ))}
                    </View>
                    <TouchableOpacity
                      onPress={handlePickAvatar}
                      style={[styles.uploadBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                    >
                      <Upload size={13} color={colors.primary} />
                      <Text style={{ fontSize: 11.5, fontWeight: '700', color: colors.primary }}>
                        Upload Avatar Photo
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>FULL NAME</Text>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Your display name"
                    placeholderTextColor={colors.textSecondary}
                    style={[
                      styles.input,
                      { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
                    ]}
                  />
                </View>

                <View>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>STUDY EMAIL</Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="scholar@study.io"
                    placeholderTextColor={colors.textSecondary}
                    style={[
                      styles.input,
                      { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
                    ]}
                  />
                </View>

                <View>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>
                    AUTHENTICATION PROVIDER
                  </Text>
                  <View style={styles.authGrid}>
                    {(
                      [
                        { id: 'google', label: 'Google SSO', icon: Sparkles },
                        { id: 'microsoft', label: 'Microsoft', icon: ShieldCheck },
                        { id: 'email', label: 'Email / OTP', icon: Mail },
                        { id: 'guest', label: 'Guest Offline', icon: User },
                      ] as const
                    ).map(({ id, label, icon: Icon }) => {
                      const active = authProvider === id;
                      return (
                        <Pressable
                          key={id}
                          focusable={false}
                          onPress={() => handleSelectAuthMode(id)}
                          style={({ pressed }) => [
                            styles.authBtn,
                            {
                              backgroundColor: active ? colors.primary : colors.surface,
                              borderColor: active ? colors.primary : colors.border,
                              opacity: pressed ? 0.78 : 1,
                            },
                          ]}
                        >
                          <Icon size={14} color={active ? '#FFFFFF' : colors.primary} />
                          <Text style={{ fontSize: 12, fontWeight: '700', color: active ? '#FFFFFF' : colors.text }}>
                            {label}
                          </Text>
                          {active && <Check size={13} color="#FFFFFF" />}
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {authNotice && (
                  <View style={[styles.noticeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Badge label={authProvider.toUpperCase()} variant="primary" size="sm" />
                    <Text style={{ fontSize: 11.5, color: colors.textSecondary, flex: 1, lineHeight: 16 }}>
                      {authNotice}
                    </Text>
                  </View>
                )}
              </>
            )}
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <Button title="Cancel" variant="outline" onPress={onClose} style={{ flex: 1 }} />
            <Button
              title={step === 'curriculum' ? 'Next: Account & Avatar' : 'Save & Apply Setup'}
              variant={step === 'curriculum' ? 'secondary' : 'primary'}
              onPress={() => {
                if (step === 'curriculum') setStep('account');
                else void handleSave();
              }}
              style={{ flex: 1.5 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  sheet: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  badgeIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 16, fontWeight: '800' },
  subtitle: { fontSize: 11, marginTop: 1 },
  stepBar: {
    flexDirection: 'row',
    gap: 8,
    padding: 8,
    borderBottomWidth: 1,
  },
  stepBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  scroll: { paddingHorizontal: 18 },
  label: { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.5, marginBottom: 6 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  input: {
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13.5,
  },
  avatarBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  avatarPreview: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarLetter: { color: '#FFFFFF', fontSize: 24, fontWeight: '900' },
  swatch: { width: 22, height: 22, borderRadius: 11, borderWidth: 2 },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9,
    borderWidth: 1,
    marginTop: 2,
  },
  authGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  authBtn: {
    minWidth: '47%',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 11,
    borderWidth: 1,
    overflow: 'hidden',
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 11,
    borderWidth: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
});
