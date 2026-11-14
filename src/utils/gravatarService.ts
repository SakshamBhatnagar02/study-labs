/**
 * Study Labs — Gravatar User Image & Profile Integration Engine
 * Conforms to Gravatar Developer API standards (https://docs.gravatar.com/api/)
 * Resolves user avatars and profile bios via SHA-256 email hashing with zero external dependencies.
 */

/**
 * Pure TypeScript implementation of SHA-256 for universal compatibility across
 * React Native, Expo Go, Web and Node environments without native crypto bindings.
 */
function sha256Hex(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let i = 0;
  let j = 0;
  const result: number[] = [];
  const words: number[] = [];
  const asciiLength = ascii.length;

  const hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;

  const isComposite: Record<number, boolean> = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isComposite[i] = true;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  ascii += '\x80';
  while ((ascii.length % 64) - 56) ascii += '\x00';
  for (i = 0; i < ascii.length; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return ''; // ASCII only
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words[words.length] = (asciiLength * 8) / maxWord | 0;
  words[words.length] = (asciiLength * 8) | 0;

  for (j = 0; j < words.length;) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash.slice(0);

    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15];
      const w2 = w[i - 2];

      const s0 = i >= 16 ? (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) : 0;
      const s1 = i >= 16 ? (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10)) : 0;

      const val = i < 16 ? w[i] : (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      w[i] = val;

      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const temp1 = (hash[7] + (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) + ch + k[i] + val) | 0;
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp2 = ((rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) + maj) | 0;

      hash[7] = hash[6];
      hash[6] = hash[5];
      hash[5] = hash[4];
      hash[4] = (hash[3] + temp1) | 0;
      hash[3] = hash[2];
      hash[2] = hash[1];
      hash[1] = hash[0];
      hash[0] = (temp1 + temp2) | 0;
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result.push(b);
    }
  }

  return result.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export interface GravatarOptions {
  size?: number; // 80 to 2048
  defaultImage?: 'identicon' | 'mp' | 'retro' | 'robohash' | 'monsterid' | 'wavatar' | '404';
  rating?: 'g' | 'pg' | 'r' | 'x';
}

export interface GravatarProfileResult {
  hasCustomAvatar: boolean;
  avatarUrl: string;
  emailHash: string;
  displayName?: string;
  profileUrl?: string;
}

export class GravatarService {
  /**
   * Normalize an email address per Gravatar specifications
   * (Trim leading/trailing whitespace and force lowercase)
   */
  static normalizeEmail(email: string): string {
    return (email || '').trim().toLowerCase();
  }

  /**
   * Generate standard SHA-256 hash of normalized email
   */
  static getEmailHash(email: string): string {
    const normalized = this.normalizeEmail(email);
    if (!normalized) return '';
    return sha256Hex(normalized);
  }

  /**
   * Build Gravatar Avatar URL
   * Example: https://gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50?d=identicon&s=200
   */
  static getAvatarUrl(email: string, options: GravatarOptions = {}): string {
    const {
      size = 200,
      defaultImage = 'identicon',
      rating = 'g',
    } = options;

    const hash = this.getEmailHash(email);
    if (!hash) {
      return `https://gravatar.com/avatar/00000000000000000000000000000000?d=${defaultImage}&s=${size}`;
    }

    return `https://gravatar.com/avatar/${hash}?d=${defaultImage}&s=${size}&r=${rating}`;
  }

  /**
   * Check if an email has an established Gravatar avatar
   */
  static async checkHasGravatar(email: string): Promise<boolean> {
    const hash = this.getEmailHash(email);
    if (!hash) return false;

    try {
      // 404 mode returns HTTP 404 if no user avatar is configured
      const testUrl = `https://gravatar.com/avatar/${hash}?d=404`;
      const res = await fetch(testUrl, { method: 'HEAD' });
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Fetch public Gravatar profile details
   */
  static async getProfile(email: string): Promise<GravatarProfileResult> {
    const hash = this.getEmailHash(email);
    const avatarUrl = this.getAvatarUrl(email);

    if (!hash) {
      return {
        hasCustomAvatar: false,
        avatarUrl,
        emailHash: '',
      };
    }

    try {
      const profileUrl = `https://gravatar.com/${hash}.json`;
      const res = await fetch(profileUrl);
      if (!res.ok) {
        return {
          hasCustomAvatar: false,
          avatarUrl,
          emailHash: hash,
          profileUrl: `https://gravatar.com/${hash}`,
        };
      }

      const data = await res.json();
      const entry = data?.entry?.[0];

      return {
        hasCustomAvatar: true,
        avatarUrl,
        emailHash: hash,
        displayName: entry?.displayName || entry?.preferredUsername,
        profileUrl: entry?.profileUrl || `https://gravatar.com/${hash}`,
      };
    } catch {
      return {
        hasCustomAvatar: false,
        avatarUrl,
        emailHash: hash,
      };
    }
  }
}

