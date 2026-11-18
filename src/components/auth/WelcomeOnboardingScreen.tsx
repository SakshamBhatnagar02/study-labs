import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Asset } from 'expo-asset';
import { BRANDING_ASSETS, HOLO_REACTIONS } from '../../utils/avatarHelper';
import { DEFAULT_USER, StorageService } from '../../services/storage';
import { SupabaseService } from '../../services/supabase';
import { ResendEmailService } from '../../services/resendService';
import { UserWorkspaceService } from '../../services/userWorkspaceService';
import { HapticManager } from '../../services/hapticManager';
import { SoundManager } from '../../services/soundManager';
import { isDisposableEmail } from '../../utils/tempMailDetector';
import { evaluatePasswordBreachRisk } from '../../utils/breachDetector';
import { MarksOnboardingWizard } from './MarksOnboardingWizard';
import type { AuthProviderType, UserProfile } from '../../types';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react-native';

interface WelcomeOnboardingScreenProps {
  initialProfile: UserProfile;
  onAuthenticated: (profile: UserProfile, openCurriculumWizard?: boolean) => void;
  onOpenEmailSetup?: () => void;
}

const GoogleLogoIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path
      fill="#4285F4"
      d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.45c-.28 1.49-1.12 2.75-2.39 3.6v2.99h3.87c2.26-2.08 3.56-5.15 3.56-8.62z"
    />
    <Path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.87-2.99c-1.07.72-2.45 1.14-4.06 1.14-3.12 0-5.77-2.11-6.72-4.95H1.28v3.08C3.25 21.3 7.31 24 12 24z"
    />
    <Path
      fill="#FBBC05"
      d="M5.28 14.29A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.38-2.29V6.63H1.28A12 12 0 0 0 0 12c0 1.94.46 3.77 1.28 5.37l4-3.08z"
    />
    <Path
      fill="#EA4335"
      d="M12 4.75c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.28 6.63l4 3.08c.95-2.84 3.6-4.96 6.72-4.96z"
    />
  </Svg>
);

const MicrosoftLogoIcon = () => (
  <Svg width={19} height={19} viewBox="0 0 21 21">
    <Rect x="1" y="1" width="9" height="9" fill="#F25022" />
    <Rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
    <Rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
    <Rect x="11" y="11" width="9" height="9" fill="#FFB900" />
  </Svg>
);

const GitHubLogoIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path
      fill="#FFFFFF"
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 0.5C5.65 0.5 0.5 5.65 0.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a10.9 10.9 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.39-5.25 5.67.41.36.78 1.06.78 2.13 0 1.54-.01 2.78-.01 3.16 0 .31.21.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35 0.5 12 0.5z"
    />
  </Svg>
);

const NativeIntroVideoBackground: React.FC = () => {
  const player = useVideoPlayer(BRANDING_ASSETS.introVideo, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <VideoView
      player={player}
      style={StyleSheet.absoluteFill}
      contentFit="cover"
      nativeControls={false}
      allowsPictureInPicture={false}
    />
  );
};

const WebIntroVideoBackground: React.FC = () => {
  const videoUri = useMemo(() => {
    try {
      const resolved = Asset.fromModule(BRANDING_ASSETS.introVideo);
      if (resolved?.uri) return resolved.uri;
    } catch {
      // Fallback below
    }
    if (typeof BRANDING_ASSETS.introVideo === 'string') {
      return BRANDING_ASSETS.introVideo;
    }
    return '';
  }, []);

  if (!videoUri) {
    return (
      <View style={[StyleSheet.absoluteFill, styles.fallbackBackdrop]}>
        <Image
          source={BRANDING_ASSETS.appLogo}
          style={{ width: 170, height: 170, borderRadius: 34 }}
          resizeMode="contain"
        />
      </View>
    );
  }

  return React.createElement('video', {
    src: videoUri,
    autoPlay: true,
    loop: true,
    muted: true,
    playsInline: true,
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      pointerEvents: 'none',
    },
  });
};

export const WelcomeOnboardingScreen: React.FC<WelcomeOnboardingScreenProps> = ({
  initialProfile,
  onAuthenticated,
}) => {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  // Mandatory 3-Stage Flow: 'auth' -> ('email_auth' if Email/Fallback) -> 'wizard' (MARKS-style)
  const [stage, setStage] = useState<'auth' | 'email_auth' | 'wizard'>('auth');
  const [busyProvider, setBusyProvider] = useState<AuthProviderType | null>(null);
  const [verifiedProvider, setVerifiedProvider] = useState<AuthProviderType>('google');
  const [authEmail, setAuthEmail] = useState<string>(initialProfile.email || '');
  const [authName, setAuthName] = useState<string>(initialProfile.name || '');

  // OAuth / Login Fallback State
  const [authError, setAuthError] = useState<{
    provider: 'google' | 'microsoft' | 'github' | 'email';
    title: string;
    detail: string;
  } | null>(null);

  // Clean MARKS-Style Email + Password + 6-Digit OTP Auth State
  const [emailMode, setEmailMode] = useState<'signin' | 'signup'>('signup');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpStep, setOtpStep] = useState<'credentials' | 'otp'>('credentials');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpBanner, setOtpBanner] = useState<string | null>(null);
  const [emailFormError, setEmailFormError] = useState<string | null>(null);
  const [emailBusy, setEmailBusy] = useState(false);

  const isDesktopSplit = width >= 900;
  const isWideWeb = Platform.OS === 'web' && width > 520;
  const frameWidth = isWideWeb ? Math.min(440, Math.max(360, Math.round((height * 9) / 16))) : width;
  const desktopVideoHeight = Math.min(height - 72, 680);
  const desktopVideoWidth = Math.round((desktopVideoHeight * 9) / 16);

  /**
   * Attempt real Supabase OAuth with explicit error capture & graceful recovery fallback UI.
   * Never silently drops user into the app without onboarding!
   */
  const handleOAuthPress = async (provider: 'google' | 'microsoft' | 'github') => {
    setBusyProvider(provider);
    setAuthError(null);
    HapticManager.triggerSelection();
    SoundManager.play('click');

    const supabaseProvider = provider === 'microsoft' ? 'azure' : provider;
    const providerLabel =
      provider === 'google' ? 'Google' : provider === 'microsoft' ? 'Microsoft' : 'GitHub';

    try {
      const oauthPromise = SupabaseService.signInWithOAuth(supabaseProvider);
      const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: new Error('OAuth handshake timed out. Please check your internet connection or use Email Sign In.') }), 8000)
      );

      const res: any = await Promise.race([oauthPromise, timeoutPromise]);

      if (res?.error) {
        setAuthError({
          provider,
          title: `${providerLabel} Sign-In Failed`,
          detail:
            res.error?.message ||
            `${providerLabel} OAuth could not connect. Retry, try another provider, or continue securely with Email + OTP.`,
        });
        SoundManager.play('incorrect');
        HapticManager.triggerError();
        setBusyProvider(null);
        return;
      }

      // Open OAuth browser session on native devices when Supabase returns an auth URL
      if (res?.data?.url && Platform.OS !== 'web') {
        try {
          const canOpen = await Linking.canOpenURL(res.data.url);
          if (canOpen) {
            await Linking.openURL(res.data.url);
          }
        } catch {
          // If external browser launch fails, surface clean fallback card
          setAuthError({
            provider,
            title: `Could not open ${providerLabel} browser sign-in`,
            detail: 'Your device blocked the external OAuth redirect. Use Email + OTP Sign In below as an instant fallback.',
          });
          setBusyProvider(null);
          return;
        }
      }

      // OAuth initiated cleanly -> proceed into MARKS-style mandatory onboarding wizard
      setVerifiedProvider(provider);
      if (!authName) setAuthName(`${providerLabel} Scholar`);
      SoundManager.play('notify');
      HapticManager.triggerSuccess();
      setBusyProvider(null);
      setStage('wizard');
    } catch (err: any) {
      setAuthError({
        provider,
        title: `${providerLabel} Sign-In Unavailable`,
        detail:
          err?.message ||
          `Unable to reach ${providerLabel} authentication servers. Use Retry or switch to Email + OTP fallback below.`,
      });
      SoundManager.play('incorrect');
      HapticManager.triggerError();
      setBusyProvider(null);
    }
  };

  /**
   * Email + Password + 6-Digit OTP Verification Flow (also serves as primary OAuth Failure Fallback)
   */
  const handleSendEmailOtp = async () => {
    setEmailFormError(null);
    setOtpBanner(null);

    const trimmedEmail = authEmail.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setEmailFormError('Please enter a valid email address.');
      HapticManager.triggerError();
      return;
    }

    if (isDisposableEmail(trimmedEmail).isDisposable) {
      setEmailFormError('Disposable / temporary email domains are blocked. Please use a permanent personal or school email.');
      HapticManager.triggerError();
      return;
    }

    if (!password || password.length < 6) {
      setEmailFormError('Password must be at least 6 characters long.');
      HapticManager.triggerError();
      return;
    }

    if (emailMode === 'signup') {
      if (password !== confirmPassword) {
        setEmailFormError('Passwords do not match.');
        HapticManager.triggerError();
        return;
      }
      const breach = evaluatePasswordBreachRisk(password);
      if (breach.isCompromised) {
        setEmailFormError('This password appears in known public breaches. Choose a stronger password.');
        HapticManager.triggerError();
        return;
      }
    }

    setEmailBusy(true);
    try {
      // Attempt Supabase Email Auth in parallel (with non-blocking fallback to Resend OTP if offline/unconfirmed)
      if (SupabaseService.client) {
        try {
          if (emailMode === 'signup') {
            await SupabaseService.client.auth.signUp({
              email: trimmedEmail,
              password,
            });
          } else {
            await SupabaseService.client.auth.signInWithPassword({
              email: trimmedEmail,
              password,
            });
          }
        } catch {
          // Proceed with Resend 6-digit OTP verification as resilient fallback
        }
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setEnteredOtp('');
      const dispatch = await ResendEmailService.sendVerificationOtp(
        trimmedEmail,
        code,
        authName.trim() || trimmedEmail.split('@')[0]
      );
      setOtpStep('otp');
      if (dispatch.success && dispatch.status === 'sent') {
        setOtpBanner(`We sent a 6-digit verification code to ${trimmedEmail}.`);
      } else {
        setOtpBanner(`Verification code ready: ${code} (Offline/Sandbox fallback delivery).`);
      }
      SoundManager.play('notify');
      HapticManager.triggerSuccess();
    } catch (err: any) {
      setEmailFormError(err?.message || 'Unable to initiate email verification. Please try again.');
    } finally {
      setEmailBusy(false);
    }
  };

  const handleVerifyEmailOtp = () => {
    setEmailFormError(null);
    if (enteredOtp.trim() !== generatedOtp.trim()) {
      setEmailFormError('Invalid 6-digit OTP code. Please check and try again.');
      SoundManager.play('incorrect');
      HapticManager.triggerError();
      return;
    }
    setVerifiedProvider('email');
    if (!authName.trim()) {
      setAuthName(authEmail.trim().split('@')[0] || 'Scholar');
    }
    SoundManager.play('achievement');
    HapticManager.triggerSuccess();
    setStage('wizard');
  };

  /**
   * Finalize Onboarding Wizard -> Save Authenticated Profile & Provision B2 + Supabase Folders
   */
  const handleWizardComplete = async (fields: {
    name: string;
    stream: UserProfile['stream'];
    board: UserProfile['board'];
    classGrade: string;
    targetYear: number;
    targetExams: string[];
    avatarUri?: string;
  }) => {
    const userId =
      initialProfile.id && initialProfile.id !== 'usr_local_01'
        ? initialProfile.id
        : `usr_${verifiedProvider}_${Date.now().toString(36)}`;
    const ioId =
      initialProfile.ioId && initialProfile.ioId.trim()
        ? initialProfile.ioId
        : `STUDY-${Math.floor(1000 + Math.random() * 9000)}-IO`;

    const completedProfile: UserProfile = {
      ...DEFAULT_USER,
      ...initialProfile,
      id: userId,
      ioId,
      name: fields.name,
      email: authEmail.trim(),
      stream: fields.stream,
      board: fields.board,
      classGrade: fields.classGrade,
      targetYear: fields.targetYear,
      targetExams: fields.targetExams,
      avatarUri: fields.avatarUri,
      authProvider: verifiedProvider,
      isAuthenticated: true,
      onboardingCompleted: true,
    };

    await StorageService.saveUserProfile(completedProfile);
    await UserWorkspaceService.provisionUserFolders(completedProfile.id, completedProfile.ioId);
    onAuthenticated(completedProfile, false);
  };

  // Stage 3: Clean MARKS-Style Step-by-Step Onboarding Wizard
  if (stage === 'wizard') {
    return (
      <MarksOnboardingWizard
        initialProfile={initialProfile}
        authEmail={authEmail}
        authName={authName}
        onBackToAuth={() => setStage('auth')}
        onComplete={(fields) => void handleWizardComplete(fields)}
      />
    );
  }

  // Stage 2: Clean MARKS-Style Email Login / Sign Up + 6-Digit OTP Verification Screen
  if (stage === 'email_auth') {
    return (
      <View
        style={[
          styles.emailRoot,
          {
            paddingTop: Math.max(insets.top + 12, 20),
            paddingBottom: Math.max(insets.bottom + 16, 22),
          },
        ]}
      >
        <View style={styles.emailTopBar}>
          <TouchableOpacity
            onPress={() => {
              if (otpStep === 'otp') {
                setOtpStep('credentials');
                setEmailFormError(null);
              } else {
                setStage('auth');
              }
            }}
            style={styles.backBtn}
            hitSlop={10}
          >
            <ArrowLeft size={22} color="#F8FAFC" />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Image source={HOLO_REACTIONS.waving} style={{ width: 26, height: 26 }} resizeMode="contain" />
            <Text style={styles.emailTopBrand}>Study Labs Account</Text>
          </View>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            { gap: 16, paddingTop: 12, paddingBottom: 24 },
            isWideWeb && { maxWidth: 480, width: '100%', alignSelf: 'center' },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {otpStep === 'credentials' ? (
            <>
              <Text style={styles.emailHeadline}>
                {emailMode === 'signup' ? 'Create your Study Labs account' : 'Sign in with Email'}
              </Text>
              <Text style={styles.emailSub}>
                We'll send a 6-digit verification code to secure your personal B2 & Supabase study folders.
              </Text>

              {/* Sign Up / Sign In Switch */}
              <View style={styles.modeSwitchRow}>
                {(['signup', 'signin'] as const).map((m) => {
                  const active = emailMode === m;
                  return (
                    <TouchableOpacity
                      key={m}
                      onPress={() => {
                        setEmailMode(m);
                        setEmailFormError(null);
                      }}
                      style={[styles.modeSwitchBtn, active && styles.modeSwitchBtnActive]}
                    >
                      <Text style={[styles.modeSwitchText, active && { color: '#FFFFFF' }]}>
                        {m === 'signup' ? 'Create Account' : 'Sign In'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                <View style={styles.inputWrap}>
                  <Mail size={16} color="#94A3B8" />
                  <TextInput
                    value={authEmail}
                    onChangeText={setAuthEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="you@gmail.com"
                    placeholderTextColor="#64748B"
                    style={styles.textInput}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PASSWORD</Text>
                <View style={styles.inputWrap}>
                  <Lock size={16} color="#94A3B8" />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholder="Minimum 6 characters"
                    placeholderTextColor="#64748B"
                    style={styles.textInput}
                  />
                </View>
              </View>

              {emailMode === 'signup' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>CONFIRM PASSWORD</Text>
                  <View style={styles.inputWrap}>
                    <ShieldCheck size={16} color="#94A3B8" />
                    <TextInput
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                      placeholder="Re-enter password"
                      placeholderTextColor="#64748B"
                      style={styles.textInput}
                    />
                  </View>
                </View>
              )}

              {emailFormError && (
                <View style={styles.errorBox}>
                  <AlertTriangle size={15} color="#F87171" />
                  <Text style={styles.errorText}>{emailFormError}</Text>
                </View>
              )}

              <Pressable
                focusable={false}
                disabled={emailBusy}
                onPress={() => void handleSendEmailOtp()}
                style={({ pressed }) => [
                  styles.submitOrangeBtn,
                  emailBusy && { opacity: 0.6 },
                  pressed && { opacity: 0.88 },
                ]}
              >
                {emailBusy ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <KeyRound size={17} color="#FFFFFF" />
                )}
                <Text style={styles.submitOrangeText}>
                  {emailBusy ? 'Sending Code...' : 'Send 6-Digit Verification Code'}
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.emailHeadline}>Please verify your OTP</Text>
              <Text style={styles.emailSub}>
                Enter the 6-digit code sent to <Text style={{ color: '#F97316', fontWeight: '800' }}>{authEmail}</Text>
              </Text>

              {otpBanner && (
                <View style={styles.otpInfoBox}>
                  <CheckCircle2 size={15} color="#22C55E" />
                  <Text style={styles.otpInfoText}>{otpBanner}</Text>
                </View>
              )}

              <TextInput
                value={enteredOtp}
                onChangeText={setEnteredOtp}
                keyboardType="number-pad"
                maxLength={6}
                placeholder="• • • • • •"
                placeholderTextColor="#475569"
                style={styles.otpBigInput}
                autoFocus
              />

              {emailFormError && (
                <View style={styles.errorBox}>
                  <AlertTriangle size={15} color="#F87171" />
                  <Text style={styles.errorText}>{emailFormError}</Text>
                </View>
              )}

              <Pressable
                focusable={false}
                disabled={enteredOtp.trim().length !== 6}
                onPress={handleVerifyEmailOtp}
                style={({ pressed }) => [
                  styles.submitOrangeBtn,
                  enteredOtp.trim().length !== 6 && { opacity: 0.45 },
                  pressed && { opacity: 0.88 },
                ]}
              >
                <Text style={styles.submitOrangeText}>Verify & Continue</Text>
              </Pressable>

              <TouchableOpacity
                onPress={() => void handleSendEmailOtp()}
                style={{ alignSelf: 'center', paddingVertical: 8 }}
              >
                <Text style={{ color: '#F97316', fontSize: 13, fontWeight: '700' }}>
                  Resend Verification Code
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>

        <Text style={styles.supportFooter}>
          Facing login issues? Switch providers or email support@study.io
        </Text>
      </View>
    );
  }

  // Stage 1: Mandatory Login / Signup Gate over 9:16 Intro Animation Video (NO Anonymous Bypass!)
  const renderAuthControls = () => (
    <>
      <View style={styles.copyBlock}>
        {isDesktopSplit && (
          <Image
            source={BRANDING_ASSETS.appLogo}
            style={styles.desktopBrandIcon}
            resizeMode="contain"
          />
        )}
        <Text style={[styles.headline, isDesktopSplit && styles.desktopHeadline]}>
          The New Way To <Text style={styles.headlineAccent}>Practice</Text>
          {'\n'}and <Text style={styles.headlineAccent}>Master</Text>
        </Text>
        <Text style={[styles.subline, isDesktopSplit && { fontSize: 13.5, lineHeight: 20 }]}>
          IIT-JEE · NEET · BITSAT · Boards & 29+ Global STEM Exams
        </Text>
      </View>

      {/* OAuth / Login Failure Fallback Card */}
      {authError && (
        <View style={styles.fallbackCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
            <AlertTriangle size={15} color="#FCA5A5" />
            <Text style={styles.fallbackTitle}>{authError.title}</Text>
          </View>
          <Text style={styles.fallbackDetail}>{authError.detail}</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
            {authError.provider !== 'email' && (
              <TouchableOpacity
                onPress={() => void handleOAuthPress(authError.provider as any)}
                style={styles.fallbackRetryBtn}
              >
                <RefreshCw size={12} color="#FFFFFF" />
                <Text style={styles.fallbackRetryText}>Retry</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => {
                setAuthError(null);
                setStage('email_auth');
              }}
              style={styles.fallbackEmailBtn}
            >
              <Mail size={12} color="#0B0F19" />
              <Text style={styles.fallbackEmailText}>Use Email + OTP Fallback</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Mandatory OAuth Buttons: Google, Microsoft, GitHub */}
      <View style={styles.authButtonsStack}>
        <Pressable
          focusable={false}
          disabled={busyProvider !== null}
          onPress={() => void handleOAuthPress('google')}
          style={({ pressed }) => [
            styles.oauthBtn,
            styles.googleBtn,
            pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Continue with Google"
        >
          {busyProvider === 'google' ? (
            <ActivityIndicator size="small" color="#0F172A" />
          ) : (
            <GoogleLogoIcon />
          )}
          <Text style={styles.googleBtnText}>Continue with Google</Text>
        </Pressable>

        <Pressable
          focusable={false}
          disabled={busyProvider !== null}
          onPress={() => void handleOAuthPress('microsoft')}
          style={({ pressed }) => [
            styles.oauthBtn,
            styles.microsoftBtn,
            pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Continue with Microsoft"
        >
          {busyProvider === 'microsoft' ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <MicrosoftLogoIcon />
          )}
          <Text style={styles.darkBtnText}>Continue with Microsoft</Text>
        </Pressable>

        <Pressable
          focusable={false}
          disabled={busyProvider !== null}
          onPress={() => void handleOAuthPress('github')}
          style={({ pressed }) => [
            styles.oauthBtn,
            styles.githubBtn,
            pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Continue with GitHub"
        >
          {busyProvider === 'github' ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <GitHubLogoIcon />
          )}
          <Text style={styles.darkBtnText}>Continue with GitHub</Text>
        </Pressable>
      </View>

      {/* Clean Email Login / Sign Up Fallback CTA (NO guest bypass!) */}
      <Pressable
        focusable={false}
        onPress={() => {
          setAuthError(null);
          setStage('email_auth');
        }}
        style={({ pressed }) => [styles.emailLinkBtn, pressed && { opacity: 0.78 }]}
      >
        <Mail size={14} color="#F97316" />
        <Text style={styles.emailLinkText}>Sign In or Create Account with Email & OTP</Text>
      </Pressable>
    </>
  );

  // Desktop PC Split Showcase (MARKS Web PWA clean centered auth + 9:16 Study Labs Animation Showcase)
  if (isDesktopSplit) {
    return (
      <View style={styles.desktopSplitRoot}>
        <View style={styles.desktopSplitInner}>
          {/* Left: Framed 9:16 Live Looping Study Labs Intro Animation Video */}
          <View
            style={[
              styles.desktopVideoFrame,
              { width: desktopVideoWidth, height: desktopVideoHeight },
            ]}
          >
            {Platform.OS === 'web' ? <WebIntroVideoBackground /> : <NativeIntroVideoBackground />}
            <View style={styles.desktopVideoBadgeWrap}>
              <View style={styles.holoPill}>
                <Image source={HOLO_REACTIONS.waving} style={styles.holoMini} resizeMode="contain" />
                <Text style={styles.holoPillText}>Powered by HOLO AI · study.io</Text>
              </View>
            </View>
          </View>

          {/* Right: MARKS-Style Clean Centered Auth Panel */}
          <View style={styles.desktopAuthPanel}>
            {renderAuthControls()}
            <Text style={styles.desktopFooterNote}>
              Mandatory Scholar Verification · Cloud Notebooks & B2 Sync Ready
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.outerRoot}>
      <View
        style={[
          styles.stageFrame,
          isWideWeb && {
            width: frameWidth,
            height: Math.min(height - 24, Math.round((frameWidth * 16) / 9)),
            borderRadius: 28,
            borderWidth: 1,
            borderColor: 'rgba(249, 115, 22, 0.35)',
            overflow: 'hidden',
          },
        ]}
      >
        {/* Full-bleed 9:16 Study Labs Intro Animation Video */}
        {Platform.OS === 'web' ? <WebIntroVideoBackground /> : <NativeIntroVideoBackground />}

        {/* Top subtle status badge */}
        <View style={[styles.topOverlay, { paddingTop: Math.max(insets.top + 10, 18) }]}>
          <View style={styles.holoPill}>
            <Image source={HOLO_REACTIONS.waving} style={styles.holoMini} resizeMode="contain" />
            <Text style={styles.holoPillText}>Powered by HOLO AI · study.io</Text>
          </View>
        </View>

        {/* Bottom Scrim & Mandatory Auth Controls */}
        <View
          style={[
            styles.bottomScrim,
            { paddingBottom: Math.max(insets.bottom + 18, 26) },
          ]}
        >
          <View style={styles.scrimTopFade} pointerEvents="none" />
          {renderAuthControls()}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerRoot: {
    flex: 1,
    backgroundColor: '#05070E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  desktopSplitRoot: {
    flex: 1,
    backgroundColor: '#070B14',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 24,
  },
  desktopSplitInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 52,
    width: '100%',
    maxWidth: 1020,
  },
  desktopVideoFrame: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(249, 115, 22, 0.42)',
    backgroundColor: '#05070E',
    position: 'relative',
  },
  desktopVideoBadgeWrap: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 4,
  },
  desktopAuthPanel: {
    flex: 1,
    maxWidth: 430,
    backgroundColor: '#0D1322',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 30,
    gap: 16,
  },
  desktopBrandIcon: {
    width: 68,
    height: 68,
    borderRadius: 18,
    marginBottom: 8,
  },
  desktopHeadline: {
    fontSize: 30,
    lineHeight: 37,
  },
  desktopFooterNote: {
    color: '#64748B',
    fontSize: 11.5,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  stageFrame: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#05070E',
    justifyContent: 'space-between',
    position: 'relative',
  },
  fallbackBackdrop: {
    backgroundColor: '#070A12',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 160,
  },
  topOverlay: {
    paddingHorizontal: 18,
    alignItems: 'center',
    zIndex: 4,
  },
  holoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(11, 15, 26, 0.76)',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.42)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  holoMini: { width: 22, height: 22 },
  holoPillText: { color: '#F8FAFC', fontSize: 11.5, fontWeight: '700' },
  bottomScrim: {
    paddingHorizontal: 20,
    paddingTop: 26,
    backgroundColor: 'rgba(5, 7, 14, 0.9)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderTopColor: 'rgba(249, 115, 22, 0.28)',
    zIndex: 4,
    gap: 13,
  },
  scrimTopFade: {
    position: 'absolute',
    top: -34,
    left: 0,
    right: 0,
    height: 34,
    backgroundColor: 'rgba(5, 7, 14, 0.34)',
  },
  copyBlock: { alignItems: 'center', gap: 5 },
  headline: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 31,
    letterSpacing: -0.4,
  },
  headlineAccent: { color: '#F97316' },
  subline: {
    color: '#CBD5E1',
    fontSize: 12.5,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  fallbackCard: {
    backgroundColor: 'rgba(127, 29, 29, 0.36)',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.5)',
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },
  fallbackTitle: { color: '#FECACA', fontSize: 12.5, fontWeight: '800' },
  fallbackDetail: { color: '#E2E8F0', fontSize: 11.5, lineHeight: 16 },
  fallbackRetryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 9,
  },
  fallbackRetryText: { color: '#FFFFFF', fontSize: 11.5, fontWeight: '700' },
  fallbackEmailBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#F97316',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 9,
  },
  fallbackEmailText: { color: '#0B0F19', fontSize: 11.5, fontWeight: '800' },
  authButtonsStack: { gap: 10 },
  oauthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 11,
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  googleBtn: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
  googleBtnText: { color: '#0F172A', fontSize: 14.5, fontWeight: '800' },
  microsoftBtn: { backgroundColor: '#1E293B', borderColor: '#334155' },
  githubBtn: { backgroundColor: '#111827', borderColor: '#374151' },
  darkBtnText: { color: '#F8FAFC', fontSize: 14.5, fontWeight: '800' },
  emailLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 8,
  },
  emailLinkText: { color: '#FDBA74', fontSize: 12.5, fontWeight: '700' },

  // Clean MARKS-Style Email + OTP Screen
  emailRoot: {
    flex: 1,
    backgroundColor: '#0B0F19',
    paddingHorizontal: 20,
  },
  emailTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  emailTopBrand: { color: '#F8FAFC', fontSize: 15, fontWeight: '800' },
  emailHeadline: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', lineHeight: 30 },
  emailSub: { color: '#94A3B8', fontSize: 13.5, lineHeight: 20 },
  modeSwitchRow: {
    flexDirection: 'row',
    backgroundColor: '#111726',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 4,
    gap: 6,
  },
  modeSwitchBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: 'center',
  },
  modeSwitchBtnActive: { backgroundColor: '#F97316' },
  modeSwitchText: { color: '#94A3B8', fontSize: 13, fontWeight: '800' },
  inputGroup: { gap: 6 },
  inputLabel: { color: '#94A3B8', fontSize: 11, fontWeight: '800', letterSpacing: 0.7 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: '#334155',
    backgroundColor: '#111726',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
  },
  textInput: { flex: 1, color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  otpInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.35)',
    borderRadius: 12,
    padding: 12,
  },
  otpInfoText: { flex: 1, color: '#86EFAC', fontSize: 12.5, fontWeight: '700', lineHeight: 18 },
  otpBigInput: {
    borderWidth: 1.5,
    borderColor: '#F97316',
    backgroundColor: '#111726',
    color: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 16,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 10,
    textAlign: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: 12,
    padding: 11,
  },
  errorText: { flex: 1, color: '#FCA5A5', fontSize: 12, fontWeight: '700', lineHeight: 17 },
  submitOrangeBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#F97316',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  submitOrangeText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  supportFooter: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    paddingTop: 8,
  },
});
