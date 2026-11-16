import type { ImageSourcePropType } from 'react-native';
import { GravatarService } from './gravatarService';

export interface PresetAvatar {
  id: string;
  label: string;
  role: 'student' | 'teacher';
  source: ImageSourcePropType;
  accent: string;
}

// In Metro/React Native, require is available. In Node ESM test environment, provide fallback object.
function getAssetSource(loader: () => ImageSourcePropType, fallbackUri: string): ImageSourcePropType {
  try {
    if (typeof require !== 'undefined') {
      return loader();
    }
  } catch {
    // Non-fatal fallback for non-bundler test environments
  }
  return { uri: fallbackUri } as ImageSourcePropType;
}

/**
 * Dedicated Study Labs AI Tutor Mascot Source
 * (Exclusively for StudyBot / AI Tutor — not selectable as student user avatar)
 */
export const AI_MASCOT_SOURCE: ImageSourcePropType = getAssetSource(
  () => require('../../assets/branding/ai-mascot.png'),
  'ai-mascot.png'
);

/**
 * High-Resolution Cropped Student & Faculty Preset Avatars
 * Sliced into 1024x1024 portraits from authentic Study IO asset sheets.
 */
export const PRESET_AVATARS: PresetAvatar[] = [
  // Boys Scholar Collective
  {
    id: 'preset:boy',
    label: 'Math Scholar Boy',
    role: 'student',
    source: getAssetSource(() => require('../../assets/avatars/boy-1.png'), 'boy-1.png'),
    accent: '#3B82F6',
  },
  {
    id: 'preset:boy-2',
    label: 'Bio Scholar Boy',
    role: 'student',
    source: getAssetSource(() => require('../../assets/avatars/boy-2.png'), 'boy-2.png'),
    accent: '#10B981',
  },
  {
    id: 'preset:boy-3',
    label: 'Cyber Scholar Boy',
    role: 'student',
    source: getAssetSource(() => require('../../assets/avatars/boy-3.png'), 'boy-3.png'),
    accent: '#06B6D4',
  },
  {
    id: 'preset:boy-4',
    label: 'Commerce Scholar Boy',
    role: 'student',
    source: getAssetSource(() => require('../../assets/avatars/boy-4.png'), 'boy-4.png'),
    accent: '#F59E0B',
  },

  // Girls Scholar Collective
  {
    id: 'preset:girl',
    label: 'Math Scholar Girl',
    role: 'student',
    source: getAssetSource(() => require('../../assets/avatars/girl-1.png'), 'girl-1.png'),
    accent: '#EC4899',
  },
  {
    id: 'preset:girl-2',
    label: 'Bio Scholar Girl',
    role: 'student',
    source: getAssetSource(() => require('../../assets/avatars/girl-2.png'), 'girl-2.png'),
    accent: '#8B5CF6',
  },
  {
    id: 'preset:girl-3',
    label: 'Cyber Scholar Girl',
    role: 'student',
    source: getAssetSource(() => require('../../assets/avatars/girl-3.png'), 'girl-3.png'),
    accent: '#14B8A6',
  },
  {
    id: 'preset:girl-4',
    label: 'Commerce Scholar Girl',
    role: 'student',
    source: getAssetSource(() => require('../../assets/avatars/girl-4.png'), 'girl-4.png'),
    accent: '#F97316',
  },

  // Faculty & Professors (Male)
  {
    id: 'preset:male-teacher',
    label: 'Prof. David (Math)',
    role: 'teacher',
    source: getAssetSource(() => require('../../assets/avatars/male-teacher-1.png'), 'male-teacher-1.png'),
    accent: '#2563EB',
  },
  {
    id: 'preset:male-teacher-2',
    label: 'Prof. James (Physics)',
    role: 'teacher',
    source: getAssetSource(() => require('../../assets/avatars/male-teacher-2.png'), 'male-teacher-2.png'),
    accent: '#D97706',
  },
  {
    id: 'preset:male-teacher-3',
    label: 'Dean Robert (Senior)',
    role: 'teacher',
    source: getAssetSource(() => require('../../assets/avatars/male-teacher-3.png'), 'male-teacher-3.png'),
    accent: '#64748B',
  },
  {
    id: 'preset:male-teacher-4',
    label: 'Prof. Marcus (CS & AI)',
    role: 'teacher',
    source: getAssetSource(() => require('../../assets/avatars/male-teacher-4.png'), 'male-teacher-4.png'),
    accent: '#7C3AED',
  },

  // Faculty & Professors (Female)
  {
    id: 'preset:female-teacher',
    label: 'Prof. Elena (Math)',
    role: 'teacher',
    source: getAssetSource(() => require('../../assets/avatars/female-teacher-1.png'), 'female-teacher-1.png'),
    accent: '#9333EA',
  },
  {
    id: 'preset:female-teacher-2',
    label: 'Prof. Sarah (Physics)',
    role: 'teacher',
    source: getAssetSource(() => require('../../assets/avatars/female-teacher-2.png'), 'female-teacher-2.png'),
    accent: '#EA580C',
  },
  {
    id: 'preset:female-teacher-3',
    label: 'Dean Maya (Dean of STEM)',
    role: 'teacher',
    source: getAssetSource(() => require('../../assets/avatars/female-teacher-3.png'), 'female-teacher-3.png'),
    accent: '#475569',
  },
  {
    id: 'preset:female-teacher-4',
    label: 'Prof. Aisha (Chemistry)',
    role: 'teacher',
    source: getAssetSource(() => require('../../assets/avatars/female-teacher-4.png'), 'female-teacher-4.png'),
    accent: '#059669',
  },

  // Study IO Scholar Seal
  {
    id: 'preset:app-logo',
    label: 'Study IO Emblem',
    role: 'student',
    source: getAssetSource(() => require('../../assets/branding/app-logo.png'), 'app-logo.png'),
    accent: '#22D3EE',
  },
];

/**
 * Check if an avatar identifier is powered by Gravatar
 */
export function isGravatarUri(uri?: string): boolean {
  if (!uri) return false;
  return uri.startsWith('gravatar:') || uri.includes('gravatar.com/avatar/');
}

/**
 * Check if identifier corresponds to the AI Mascot
 */
export function isAiMascotUri(uri?: string): boolean {
  if (!uri) return false;
  return uri === 'ai-mascot' || uri === 'preset:ai-mascot' || uri.includes('ai-mascot');
}

/**
 * Generate a Gravatar avatar reference for a student email
 */
export function getGravatarAvatar(email: string, size: number = 200): { uri: string } {
  return { uri: GravatarService.getAvatarUrl(email, { size }) };
}

/**
 * Resolve avatar image source for React Native <Image source={...} />
 */
export function resolveAvatarSource(
  avatarUri?: string
): ImageSourcePropType | { uri: string } | null {
  if (!avatarUri) return null;
  if (isAiMascotUri(avatarUri)) {
    return AI_MASCOT_SOURCE;
  }
  if (avatarUri.startsWith('gravatar:')) {
    const email = avatarUri.replace('gravatar:', '');
    return getGravatarAvatar(email);
  }
  const matched = PRESET_AVATARS.find((p) => p.id === avatarUri);
  if (matched) {
    return matched.source;
  }
  return { uri: avatarUri };
}
