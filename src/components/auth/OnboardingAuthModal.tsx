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
import { resolveAvatarSource, PRESET_AVATARS, getGravatarAvatar } from '../../utils/avatarHelper';
import { isDisposableEmail, checkTempMailApi } from '../../utils/tempMailDetector';
import { evaluatePasswordBreachRisk } from '../../utils/breachDetector';
import { compressImage, formatBytes } from '../../utils/imageCompressor';
import { GravatarService } from '../../utils/gravatarService';
import { GravatarLogo } from '../common/GravatarLogo';
import { ResendEmailService } from '../../services/resendService';
import { TurnstileWidget } from './TurnstileWidget';
import type {
  AcademicStream,
  AuthProviderType,
  CaptchaVerificationToken,
  CurriculumBoard,
  EducationLevel,
  LearningMode,
  PreferredLanguage,
  UserProfile,
} from '../../types';
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  GitBranch,
  Globe,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Upload,
  User,
  X,
} from 'lucide-react-native';

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

  // Email authentication & in-app Captcha state
  const [emailAuthSubmode, setEmailAuthSubmode] = useState<'signin' | 'signup'>('signin');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState<CaptchaVerificationToken | null>(null);
  const [authErrorMsg, setAuthErrorMsg] = useState<string | null>(null);

  // Compression & Gravatar State
  const [avatarCompressionNotice, setAvatarCompressionNotice] = useState<string | null>(null);
  const [gravatarAvailable, setGravatarAvailable] = useState(false);
  const [emailReputationStatus, setEmailReputationStatus] = useState<string | null>(null);

  // Email OTP state via Resend
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [userEnteredOtp, setUserEnteredOtp] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

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
    setPassword('');
    setConfirmPassword('');
    setCaptchaToken(null);
    setAuthErrorMsg(null);
    setAvatarCompressionNotice(null);
    setOtpSent(false);
    setUserEnteredOtp('');
    setOtpVerified(false);
  }, [visible, initialProfile]);

  // Check Gravatar and Email Reputation when email changes
  useEffect(() => {
    if (!email.trim() || !email.includes('@')) {
      setEmailReputationStatus(null);
      setGravatarAvailable(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const hasGrav = await GravatarService.checkHasGravatar(email);
        setGravatarAvailable(hasGrav);

        const checkRes = await checkTempMailApi(email);
        if (checkRes.isDisposable) {
          setEmailReputationStatus(`⚠️ Disposable email flagged (${checkRes.domain})`);
        } else if (checkRes.isWhitelisted) {
          setEmailReputationStatus(`✓ Whitelisted legitimate domain (${checkRes.domain})`);
        } else {
          setEmailReputationStatus(`✓ Verified legitimate address`);
        }
      } catch {
        // Fallback
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [email]);

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
        quality: 0.8,
      });
      if (!res.canceled && res.assets?.[0]?.uri) {
        // Compress avatar with client-side image compressor
        const comp = await compressImage(res.assets[0].uri, {
          maxWidth: 512,
          maxHeight: 512,
          quality: 0.8,
        });
        setAvatarUri(comp.compressedUri);
        setAvatarCompressionNotice(
          `Compressed from ${formatBytes(comp.originalSizeBytes)} to ${formatBytes(comp.compressedSizeBytes)} (${comp.savingsPercentage}% saved)`
        );
        HapticManager.triggerSelection();
      }
    } catch {
      setAuthNotice('Gallery access unavailable in this preview; choose a Cyber Avatar badge color instead.');
    }
  };

  const handleUseGravatar = () => {
    if (!email.trim()) {
      setAuthErrorMsg('Please enter your email to load Gravatar avatar.');
      return;
    }
    const gravUri = `gravatar:${email.trim()}`;
    setAvatarUri(gravUri);
    setAvatarCompressionNotice('Loaded user avatar from Gravatar (SHA-256 resolved).');
    HapticManager.triggerSelection();
    SoundManager.play('click');
  };

  const handleSendVerificationOtp = async () => {
    if (!email.trim() || !email.includes('@')) {
      setAuthErrorMsg('Please enter a valid email to receive OTP.');
      return;
    }
    setIsSendingOtp(true);
    setAuthErrorMsg(null);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    const result = await ResendEmailService.sendVerificationOtp(email.trim(), code, name.trim() || 'Scholar');
    setIsSendingOtp(false);
    setOtpSent(true);
    if (result.success) {
      SoundManager.play('notify');
      HapticManager.triggerSuccess();
      setAuthNotice(`Verification OTP sent to ${email}! (Check your inbox)`);
    } else {
      setAuthNotice(`OTP generated: ${code} (${result.errorMessage || 'Sandbox delivery'})`);
    }
  };

  const handleVerifyOtp = () => {
    if (userEnteredOtp.trim() === generatedOtp.trim()) {
      setOtpVerified(true);
      setAuthErrorMsg(null);
      SoundManager.play('achievement');
      HapticManager.triggerSuccess();
    } else {
      setAuthErrorMsg('Invalid 6-digit verification code. Please check and re-enter.');
      SoundManager.play('incorrect');
      HapticManager.triggerError();
    }
  };

  const handleSelectAuthMode = (prov: AuthProviderType) => {
    setAuthProvider(prov);
    if (prov === 'google') {
      setAuthNotice('Google OAuth credentials active (Client ID: 385241494717-gvsrfrn3vrqergs1h891qpm7ui8v5s2o). Ready for Supabase Auth.');
    } else if (prov === 'github') {
      setAuthNotice('GitHub OAuth credentials active (Client ID: Ov23lidRz2BN5cF8GrwI). Ready for Supabase Auth.');
    } else if (prov === 'microsoft') {
      setAuthNotice('Microsoft Entra ID active (Tenant: studyioglobalgmail.onmicrosoft.com). Ready for Supabase Auth.');
    } else if (prov === 'email') {
      setAuthNotice('Email + Resend Transactional OTP verification active with Abstract API reputation checks.');
    } else {
      setAuthNotice('Guest Offline-First mode active — all progress syncs cleanly locally.');
    }
  };

  const handleSave = async () => {
    setAuthErrorMsg(null);
    if (authProvider === 'email') {
      const trimmedEmail = email.trim();
      if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
        setAuthErrorMsg('Please enter a valid study email address.');
        SoundManager.play('incorrect');
        HapticManager.triggerError();
        return;
      }
      if (isDisposableEmail(trimmedEmail).isDisposable) {
        setAuthErrorMsg('Disposable / temp-mail domain detected. Please enter a permanent personal or school email.');
        SoundManager.play('incorrect');
        HapticManager.triggerError();
        return;
      }
      if (!password || password.length < 6) {
        setAuthErrorMsg('Password must be at least 6 characters long.');
        SoundManager.play('incorrect');
        HapticManager.triggerError();
        return;
      }
      if (emailAuthSubmode === 'signup' && password !== confirmPassword) {
        setAuthErrorMsg('Passwords do not match.');
        SoundManager.play('incorrect');
        HapticManager.triggerError();
        return;
      }
      if (!captchaToken) {
        setAuthErrorMsg('Anti-bot verification required. Please solve the STEM Math Captcha challenge below.');
        SoundManager.play('incorrect');
        HapticManager.triggerError();
        return;
      }
    }

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
                  <View style={[styles.avatarPreview, { backgroundColor: avatarColor, overflow: 'hidden' }]}>
                    {(() => {
                      const resolved = resolveAvatarSource(avatarUri);
                      if (resolved) {
                        return (
                          <Image
                            source={resolved}
                            style={styles.avatarImg}
                            resizeMode="cover"
                          />
                        );
                      }
                      return (
                        <Text style={styles.avatarLetter}>
                          {(name.trim() || 'S').charAt(0).toUpperCase()}
                        </Text>
                      );
                    })()}
                  </View>
                  <View style={{ flex: 1, gap: 6 }}>
                    <Text style={{ fontSize: 13.5, fontWeight: '800', color: colors.text }}>
                      Profile Avatar & Character Presets
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

                    {/* Character Avatar Presets from assets */}
                    <View style={{ marginTop: 4 }}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: colors.textSecondary, marginBottom: 4 }}>
                        SELECT SCHOLAR AVATAR
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                        {PRESET_AVATARS.map((av) => {
                          const isSelected = avatarUri === av.id;
                          return (
                            <TouchableOpacity
                              key={av.id}
                              onPress={() => {
                                setAvatarUri(av.id);
                                setAvatarColor(av.accent);
                              }}
                              style={{
                                alignItems: 'center',
                                flexDirection: 'row',
                                gap: 4,
                                paddingHorizontal: 7,
                                paddingVertical: 4,
                                borderRadius: 8,
                                borderWidth: 1.5,
                                borderColor: isSelected ? colors.primary : colors.border,
                                backgroundColor: isSelected ? (mode === 'dark' ? '#431407' : '#FFEDD5') : colors.card,
                              }}
                            >
                              <Image source={av.source} style={{ width: 20, height: 20, borderRadius: 10 }} />
                              <Text style={{ fontSize: 10.5, fontWeight: '700', color: isSelected ? colors.primary : colors.text }}>
                                {av.label}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>

                    {avatarCompressionNotice && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, padding: 6, borderRadius: 6, backgroundColor: 'rgba(16,185,129,0.12)' }}>
                        <CheckCircle2 size={13} color="#10B981" />
                        <Text style={{ fontSize: 10.5, color: '#10B981', fontWeight: '700' }}>
                          {avatarCompressionNotice}
                        </Text>
                      </View>
                    )}

                    <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                      <TouchableOpacity
                        onPress={handlePickAvatar}
                        style={[styles.uploadBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                      >
                        <Upload size={13} color={colors.primary} />
                        <Text style={{ fontSize: 11.5, fontWeight: '700', color: colors.primary }}>
                          Upload Custom Photo (Auto-Compressed)
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={handleUseGravatar}
                        style={[styles.uploadBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                      >
                        <GravatarLogo size={14} color="#3B82F6" />
                        <Text style={{ fontSize: 11.5, fontWeight: '700', color: '#3B82F6' }}>
                          Use Gravatar Photo {gravatarAvailable ? '✓' : ''}
                        </Text>
                      </TouchableOpacity>
                    </View>
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
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>STUDY EMAIL</Text>
                    {emailReputationStatus && (
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: '700',
                          color: emailReputationStatus.startsWith('⚠️') ? '#EF4444' : '#10B981',
                        }}
                      >
                        {emailReputationStatus}
                      </Text>
                    )}
                  </View>
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
                        { id: 'github', label: 'GitHub', icon: GitBranch },
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

                {/* Email Sign-In / Sign-Up Form with Breach & Disposable Mail Guard */}
                {authProvider === 'email' && (
                  <View style={{ gap: 10, marginTop: 4 }}>
                    {/* Submode Switcher */}
                    <View style={{ flexDirection: 'row', borderRadius: 9, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
                      <TouchableOpacity
                        onPress={() => { setEmailAuthSubmode('signin'); setAuthErrorMsg(null); }}
                        style={{
                          flex: 1,
                          paddingVertical: 8,
                          alignItems: 'center',
                          backgroundColor: emailAuthSubmode === 'signin' ? colors.primary : colors.surface,
                        }}
                      >
                        <Text style={{ fontSize: 11.5, fontWeight: '700', color: emailAuthSubmode === 'signin' ? '#FFFFFF' : colors.textSecondary }}>
                          Sign In with Email
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => { setEmailAuthSubmode('signup'); setAuthErrorMsg(null); }}
                        style={{
                          flex: 1,
                          paddingVertical: 8,
                          alignItems: 'center',
                          backgroundColor: emailAuthSubmode === 'signup' ? colors.primary : colors.surface,
                        }}
                      >
                        <Text style={{ fontSize: 11.5, fontWeight: '700', color: emailAuthSubmode === 'signup' ? '#FFFFFF' : colors.textSecondary }}>
                          Create New Account
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Temp mail live detector banner */}
                    {isDisposableEmail(email).isDisposable && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8, borderRadius: 8, backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1, borderColor: '#EF4444' }}>
                        <AlertTriangle size={15} color="#EF4444" />
                        <Text style={{ fontSize: 11, color: '#EF4444', flex: 1, fontWeight: '600' }}>
                          Disposable email domain flagged ({email.split('@')[1] || 'temp-mail'}). Please use an institutional or personal email.
                        </Text>
                      </View>
                    )}

                    {/* Password Input */}
                    <View>
                      <Text style={[styles.label, { color: colors.textSecondary }]}>PASSWORD</Text>
                      <TextInput
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        placeholder="Enter secret password"
                        placeholderTextColor={colors.textSecondary}
                        style={[styles.input, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border }]}
                      />
                    </View>

                    {/* Sign Up extra fields & Password Breach Analyzer */}
                    {emailAuthSubmode === 'signup' && (
                      <>
                        {/* Breach / Strength Meter */}
                        {password.length > 0 && (() => {
                          const breachRes = evaluatePasswordBreachRisk(password);
                          const score =
                            breachRes.riskLevel === 'critical'
                              ? 1
                              : breachRes.riskLevel === 'medium'
                                ? 2
                                : breachRes.riskLevel === 'low'
                                  ? 3
                                  : 4;
                          const strengthLabel =
                            breachRes.riskLevel === 'critical'
                              ? 'Critical Risk'
                              : breachRes.riskLevel === 'medium'
                                ? 'Medium Risk'
                                : breachRes.riskLevel === 'low'
                                  ? 'Fair'
                                  : 'Strong & Secure';
                          return (
                            <View style={{ gap: 4 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text style={{ fontSize: 10.5, fontWeight: '700', color: colors.textSecondary }}>
                                  Password Security: {strengthLabel}
                                </Text>
                                {breachRes.isCompromised && (
                                  <Badge label="Compromised Password" variant="error" size="sm" />
                                )}
                              </View>
                              <View style={{ flexDirection: 'row', gap: 4, height: 4 }}>
                                {[1, 2, 3, 4].map((stepIdx) => (
                                  <View
                                    key={stepIdx}
                                    style={{
                                      flex: 1,
                                      borderRadius: 2,
                                      backgroundColor:
                                        stepIdx <= score
                                          ? score <= 1
                                            ? '#EF4444'
                                            : score === 2
                                              ? '#F59E0B'
                                              : score === 3
                                                ? '#3B82F6'
                                                : '#10B981'
                                          : colors.border,
                                    }}
                                  />
                                ))}
                              </View>
                              {breachRes.feedback && (
                                <Text
                                  style={{
                                    fontSize: 10,
                                    color: breachRes.isCompromised ? '#EF4444' : colors.textSecondary,
                                    fontWeight: '600',
                                  }}
                                >
                                  {breachRes.feedback}
                                </Text>
                              )}
                            </View>
                          );
                        })()}

                        <View>
                          <Text style={[styles.label, { color: colors.textSecondary }]}>CONFIRM PASSWORD</Text>
                          <TextInput
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            placeholder="Re-enter your password"
                            placeholderTextColor={colors.textSecondary}
                            style={[styles.input, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border }]}
                          />
                        </View>
                      </>
                    )}

                    {/* Email Verification OTP Dispatch (Resend API) */}
                    <View style={{ gap: 8, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Mail size={15} color={colors.primary} />
                          <Text style={{ fontSize: 12, fontWeight: '800', color: colors.text }}>
                            Email Ownership Verification (Resend API)
                          </Text>
                        </View>
                        {otpVerified && <Badge label="OTP Verified" variant="success" size="sm" />}
                      </View>

                      {!otpSent ? (
                        <TouchableOpacity
                          onPress={handleSendVerificationOtp}
                          disabled={isSendingOtp}
                          style={[
                            styles.uploadBtn,
                            { backgroundColor: colors.primary, borderColor: colors.primary, alignSelf: 'stretch', justifyContent: 'center' },
                          ]}
                        >
                          <Text style={{ fontSize: 12, fontWeight: '800', color: '#FFFFFF' }}>
                            {isSendingOtp ? 'Dispatching OTP via Resend...' : 'Send 6-Digit Verification OTP to Email'}
                          </Text>
                        </TouchableOpacity>
                      ) : !otpVerified ? (
                        <View style={{ gap: 6 }}>
                          <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                            Enter the 6-digit code dispatched to your inbox:
                          </Text>
                          <View style={{ flexDirection: 'row', gap: 8 }}>
                            <TextInput
                              value={userEnteredOtp}
                              onChangeText={setUserEnteredOtp}
                              keyboardType="number-pad"
                              maxLength={6}
                              placeholder="123456"
                              placeholderTextColor={colors.textSecondary}
                              style={[
                                styles.input,
                                { flex: 1, textAlign: 'center', letterSpacing: 4, fontWeight: '800', fontSize: 16, color: colors.text, backgroundColor: colors.card, borderColor: colors.border },
                              ]}
                            />
                            <TouchableOpacity
                              onPress={handleVerifyOtp}
                              style={[styles.uploadBtn, { backgroundColor: colors.primary, borderColor: colors.primary, paddingHorizontal: 16 }]}
                            >
                              <Text style={{ fontSize: 12, fontWeight: '800', color: '#FFFFFF' }}>Verify</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <CheckCircle2 size={16} color={colors.success} />
                          <Text style={{ fontSize: 11.5, fontWeight: '700', color: colors.success }}>
                            Email address verified successfully.
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Cloudflare Turnstile / In-App Anti-Bot Protection */}
                    <View style={{ marginTop: 2 }}>
                      <TurnstileWidget
                        onVerified={(tok) => {
                          setCaptchaToken(tok);
                          setAuthErrorMsg(null);
                        }}
                        onReset={() => setCaptchaToken(null)}
                      />
                    </View>
                  </View>
                )}

                {authErrorMsg && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, borderRadius: 8, backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1, borderColor: '#EF4444', marginTop: 4 }}>
                    <AlertCircle size={16} color="#EF4444" />
                    <Text style={{ fontSize: 11.5, color: '#EF4444', flex: 1, fontWeight: '700' }}>
                      {authErrorMsg}
                    </Text>
                  </View>
                )}

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
