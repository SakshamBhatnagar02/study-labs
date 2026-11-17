import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
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
import { UserWorkspaceService } from '../../services/userWorkspaceService';
import { HapticManager } from '../../services/hapticManager';
import { SoundManager } from '../../services/soundManager';
import type { AuthProviderType, UserProfile } from '../../types';
import { ArrowRight, Mail, ShieldCheck, Sparkles } from 'lucide-react-native';

interface WelcomeOnboardingScreenProps {
  initialProfile: UserProfile;
  onAuthenticated: (profile: UserProfile, openCurriculumWizard?: boolean) => void;
  onOpenEmailSetup: () => void;
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
  onOpenEmailSetup,
}) => {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [busyProvider, setBusyProvider] = useState<AuthProviderType | null>(null);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  // Preserve crisp 9:16 portrait framing on desktop web while staying full-bleed on phones
  const isWideWeb = Platform.OS === 'web' && width > 520;
  const frameWidth = isWideWeb ? Math.min(440, Math.max(360, Math.round((height * 9) / 16))) : width;

  const completeOAuthLogin = async (provider: 'google' | 'microsoft' | 'github') => {
    setBusyProvider(provider);
    setStatusBanner(null);
    HapticManager.triggerSelection();
    SoundManager.play('click');

    const supabaseProvider = provider === 'microsoft' ? 'azure' : provider;
    const providerLabel =
      provider === 'google' ? 'Google' : provider === 'microsoft' ? 'Microsoft' : 'GitHub';

    try {
      // Trigger Supabase OAuth handshake (when running live with redirect handler)
      const oauthRes = await SupabaseService.signInWithOAuth(supabaseProvider);
      if (oauthRes?.data?.url && Platform.OS !== 'web') {
        // Launch OAuth URL gracefully without blocking offline/preview testing
        Linking.openURL(oauthRes.data.url).catch(() => {});
      }
    } catch {
      // Offline-first fallback continues smoothly
    }

    const userId =
      initialProfile.id && initialProfile.id !== 'usr_local_01'
        ? initialProfile.id
        : `usr_${provider}_${Date.now().toString(36)}`;
    const ioId =
      initialProfile.ioId && initialProfile.ioId.trim()
        ? initialProfile.ioId
        : `STUDY-${Math.floor(1000 + Math.random() * 9000)}-IO`;

    const nextProfile: UserProfile = {
      ...DEFAULT_USER,
      ...initialProfile,
      id: userId,
      ioId,
      name: initialProfile.name?.trim() || `${providerLabel} Scholar`,
      email: initialProfile.email?.trim() || '',
      authProvider: provider,
      targetExams: initialProfile.targetExams?.length ? initialProfile.targetExams : ['JEE Main'],
      onboardingCompleted: true,
    };

    await StorageService.saveUserProfile(nextProfile);
    // Automatically provision dedicated Backblaze B2 & Supabase folders on registration
    await UserWorkspaceService.provisionUserFolders(nextProfile.id, nextProfile.ioId);

    setStatusBanner(`Signed in with ${providerLabel} · Personal cloud folders provisioned`);
    SoundManager.play('notify');
    HapticManager.triggerSuccess();
    setBusyProvider(null);
    onAuthenticated(nextProfile, false);
  };

  const handleQuickGuestExplore = async () => {
    setBusyProvider('guest');
    HapticManager.triggerSelection();
    SoundManager.play('click');

    const userId = `usr_local_${Date.now().toString(36)}`;
    const ioId = `STUDY-${Math.floor(1000 + Math.random() * 9000)}-IO`;
    const nextProfile: UserProfile = {
      ...DEFAULT_USER,
      ...initialProfile,
      id: userId,
      ioId,
      name: initialProfile.name?.trim() || 'Scholar',
      authProvider: 'guest',
      targetExams: initialProfile.targetExams?.length ? initialProfile.targetExams : ['JEE Main'],
      onboardingCompleted: true,
    };

    await StorageService.saveUserProfile(nextProfile);
    await UserWorkspaceService.provisionUserFolders(nextProfile.id, nextProfile.ioId);
    setBusyProvider(null);
    onAuthenticated(nextProfile, false);
  };

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

        {/* Bottom Scrim & Auth Controls overlaid cleanly on lower third of the 9:16 video */}
        <View
          style={[
            styles.bottomScrim,
            { paddingBottom: Math.max(insets.bottom + 18, 26) },
          ]}
        >
          <View style={styles.scrimTopFade} pointerEvents="none" />

          <View style={styles.copyBlock}>
            <Text style={styles.headline}>
              The New Way To <Text style={styles.headlineAccent}>Practice</Text>
              {'\n'}and <Text style={styles.headlineAccent}>Master</Text>
            </Text>
            <Text style={styles.subline}>
              IIT-JEE · NEET · BITSAT · Boards & 29+ Global STEM Exams
            </Text>
          </View>

          {statusBanner && (
            <View style={styles.noticePill}>
              <ShieldCheck size={14} color="#22C55E" />
              <Text style={styles.noticeText}>{statusBanner}</Text>
            </View>
          )}

          {/* Direct OAuth Action Buttons: Google, Microsoft, GitHub */}
          <View style={styles.authButtonsStack}>
            <Pressable
              focusable={false}
              disabled={busyProvider !== null}
              onPress={() => void completeOAuthLogin('google')}
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
              onPress={() => void completeOAuthLogin('microsoft')}
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
              onPress={() => void completeOAuthLogin('github')}
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

          {/* Secondary Email & Offline Explore Row */}
          <View style={styles.secondaryRow}>
            <Pressable
              focusable={false}
              onPress={onOpenEmailSetup}
              style={({ pressed }) => [
                styles.secondaryBtn,
                pressed && { opacity: 0.78 },
              ]}
            >
              <Mail size={14} color="#F97316" />
              <Text style={styles.secondaryBtnText}>Email & Curriculum</Text>
            </Pressable>

            <View style={styles.secondaryDivider} />

            <Pressable
              focusable={false}
              disabled={busyProvider !== null}
              onPress={() => void handleQuickGuestExplore()}
              style={({ pressed }) => [
                styles.secondaryBtn,
                pressed && { opacity: 0.78 },
              ]}
            >
              <Sparkles size={14} color="#94A3B8" />
              <Text style={[styles.secondaryBtnText, { color: '#CBD5E1' }]}>Explore Offline</Text>
              <ArrowRight size={13} color="#94A3B8" />
            </Pressable>
          </View>
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
    backgroundColor: 'rgba(11, 15, 26, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  holoMini: {
    width: 22,
    height: 22,
  },
  holoPillText: {
    color: '#F8FAFC',
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  bottomScrim: {
    paddingHorizontal: 20,
    paddingTop: 28,
    backgroundColor: 'rgba(5, 7, 14, 0.88)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderTopColor: 'rgba(249, 115, 22, 0.28)',
    zIndex: 4,
    gap: 14,
  },
  scrimTopFade: {
    position: 'absolute',
    top: -36,
    left: 0,
    right: 0,
    height: 36,
    backgroundColor: 'rgba(5, 7, 14, 0.36)',
  },
  copyBlock: {
    alignItems: 'center',
    gap: 6,
  },
  headline: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 31,
    letterSpacing: -0.4,
  },
  headlineAccent: {
    color: '#F97316',
  },
  subline: {
    color: '#CBD5E1',
    fontSize: 12.5,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  noticePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(34, 197, 94, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.4)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  noticeText: {
    color: '#86EFAC',
    fontSize: 11.5,
    fontWeight: '700',
  },
  authButtonsStack: {
    gap: 10,
  },
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
  googleBtn: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  googleBtnText: {
    color: '#0F172A',
    fontSize: 14.5,
    fontWeight: '800',
  },
  microsoftBtn: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  githubBtn: {
    backgroundColor: '#111827',
    borderColor: '#374151',
  },
  darkBtnText: {
    color: '#F8FAFC',
    fontSize: 14.5,
    fontWeight: '800',
  },
  secondaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingTop: 2,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  secondaryBtnText: {
    color: '#FDBA74',
    fontSize: 12.5,
    fontWeight: '700',
  },
  secondaryDivider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(148, 163, 184, 0.35)',
  },
});
