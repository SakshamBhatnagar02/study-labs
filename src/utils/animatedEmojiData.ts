/**
 * Study Labs — Google Fonts Noto Animated Emoji Data & Resolvers
 * Standalone TypeScript data layer for cross-platform and Node ESM compatibility.
 * Reference: https://googlefonts.github.io/noto-emoji-animation/
 */

export interface AnimatedEmojiData {
  id: string;
  char: string;
  codepoint: string;
  label: string;
}

export const NOTO_ANIMATED_EMOJIS: Record<string, AnimatedEmojiData> = {
  fire: { id: 'fire', char: '🔥', codepoint: '1f525', label: 'Fire / On streak' },
  sparkles: { id: 'sparkles', char: '✨', codepoint: '2728', label: 'Brilliant insight' },
  heart: { id: 'heart', char: '❤️', codepoint: '2764_fe0f', label: 'Love this solution' },
  thumbsup: { id: 'thumbsup', char: '👍', codepoint: '1f44d', label: 'Helpful / Approved' },
  party: { id: 'party', char: '🎉', codepoint: '1f389', label: 'Celebration' },
  hundred: { id: 'hundred', char: '💯', codepoint: '1f4af', label: '100% Correct' },
  bulb: { id: 'bulb', char: '💡', codepoint: '1f4a1', label: 'Eureka moment' },
  rocket: { id: 'rocket', char: '🚀', codepoint: '1f680', label: 'To the top' },
  clap: { id: 'clap', char: '👏', codepoint: '1f44f', label: 'Well done' },
  brain: { id: 'brain', char: '🧠', codepoint: '1f9e0', label: 'Big brain thinking' },
  target: { id: 'target', char: '🎯', codepoint: '1f3af', label: 'Bullseye precision' },
};

export const NOTO_EMOJI_LIST: AnimatedEmojiData[] = Object.values(NOTO_ANIMATED_EMOJIS);

/**
 * Resolve animated WebP URL on Google Fonts CDN for a given emoji or ID
 */
export function getNotoAnimatedEmojiUrl(emojiOrId: string): string {
  const match =
    NOTO_ANIMATED_EMOJIS[emojiOrId] ||
    NOTO_EMOJI_LIST.find((e) => e.char === emojiOrId || e.id === emojiOrId);

  const codepoint = match ? match.codepoint : '1f525';
  return `https://fonts.gstatic.com/s/e/notoemoji/latest/${codepoint}/512.webp`;
}

