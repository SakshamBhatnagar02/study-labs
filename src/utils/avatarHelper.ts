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
    // Non-fatal
  }
  return { uri: fallbackUri } as ImageSourcePropType;
}

export const PRESET_AVATARS: PresetAvatar[] = [
  {
    id: 'preset:boy',
    label: 'Scholar Boy',
    role: 'student',
    source: getAssetSource(() => require('../../assets/avatars/avatar-boy.png'), 'avatar-boy.png'),
    accent: '#3B82F6',
  },
  {
    id: 'preset:girl',
    label: 'Scholar Girl',
    role: 'student',
    source: getAssetSource(() => require('../../assets/avatars/avatar-girl.png'), 'avatar-girl.png'),
    accent: '#EC4899',
  },
  {
    id: 'preset:male-teacher',
    label: 'Prof. Sir',
    role: 'teacher',
    source: getAssetSource(() => require('../../assets/avatars/avatar-male-teacher.png'), 'avatar-male-teacher.png'),
    accent: '#10B981',
  },
  {
    id: 'preset:female-teacher',
    label: 'Prof. Ma\'am',
    role: 'teacher',
    source: getAssetSource(() => require('../../assets/avatars/avatar-female-teacher.png'), 'avatar-female-teacher.png'),
    accent: '#8B5CF6',
  },
  {
    id: 'preset:ai-mascot',
    label: 'StudyBot AI',
    role: 'teacher',
    source: getAssetSource(() => require('../../assets/branding/ai-mascot.png'), 'ai-mascot.png'),
    accent: '#F97316',
  },
  {
    id: 'preset:app-logo',
    label: 'Study IO Scholar',
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
 * Generate a Gravatar avatar reference for a student email
 */
export function getGravatarAvatar(email: string, size: number = 200): { uri: string } {
  return { uri: GravatarService.getAvatarUrl(email, { size }) };
}

export function resolveAvatarSource(
  avatarUri?: string
): ImageSourcePropType | { uri: string } | null {
  if (!avatarUri) return null;
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
