/**
 * Study Labs — Google Noto Animated Emoji Engine
 * Powered by Google Fonts Noto Emoji Animation (https://googlefonts.github.io/noto-emoji-animation/)
 * Delivers buttery smooth 60fps vector/WebP animated emoji reactions for
 * Community Doubt Exchange, Club Study Chats, and AI Master Tutor praise.
 */

import React, { useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../../theme';
import {
  AnimatedEmojiData,
  NOTO_ANIMATED_EMOJIS,
  NOTO_EMOJI_LIST,
  getNotoAnimatedEmojiUrl,
} from '../../utils/animatedEmojiData';

export type { AnimatedEmojiData };
export { NOTO_ANIMATED_EMOJIS, NOTO_EMOJI_LIST, getNotoAnimatedEmojiUrl };

interface AnimatedEmojiProps {
  emoji: string; // ID ('fire') or character ('🔥')
  size?: number;
  style?: any;
}

export const AnimatedEmoji: React.FC<AnimatedEmojiProps> = ({
  emoji,
  size = 24,
  style,
}) => {
  const [loadError, setLoadError] = useState(false);
  const matched =
    NOTO_ANIMATED_EMOJIS[emoji] ||
    NOTO_EMOJI_LIST.find((e) => e.char === emoji || e.id === emoji);

  const charFallback = matched ? matched.char : emoji;

  if (loadError || !matched) {
    return (
      <Text style={[{ fontSize: size * 0.85, lineHeight: size }, style]}>
        {charFallback}
      </Text>
    );
  }

  const uri = getNotoAnimatedEmojiUrl(matched.id);

  return (
    <Image
      source={{ uri }}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
      onError={() => setLoadError(true)}
      accessibilityLabel={matched.label}
    />
  );
};

export interface ReactionItem {
  id: string;
  count: number;
  userReacted?: boolean;
}

interface ReactionPickerBarProps {
  reactions?: Record<string, number>;
  userReactions?: string[];
  onToggleReaction: (emojiId: string) => void;
  size?: number;
}

export const ReactionPickerBar: React.FC<ReactionPickerBarProps> = ({
  reactions = {},
  userReactions = [],
  onToggleReaction,
  size = 20,
}) => {
  const { colors, mode } = useTheme();

  return (
    <View style={styles.reactionBarContainer}>
      {NOTO_EMOJI_LIST.slice(0, 6).map((item) => {
        const count = reactions[item.id] || 0;
        const isActive = userReactions.includes(item.id);

        return (
          <TouchableOpacity
            key={item.id}
            focusable={false}
            onPress={() => onToggleReaction(item.id)}
            style={[
              styles.reactionChip,
              {
                backgroundColor: isActive
                  ? 'rgba(249, 115, 22, 0.18)'
                  : mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : '#F1F5F9',
                borderColor: isActive ? '#F97316' : colors.border,
              },
            ]}
            accessibilityLabel={`${item.label}, count: ${count}`}
          >
            <AnimatedEmoji emoji={item.id} size={size} />
            {count > 0 && (
              <Text
                style={[
                  styles.reactionCount,
                  {
                    color: isActive ? '#F97316' : colors.textSecondary,
                    fontWeight: isActive ? '800' : '600',
                  },
                ]}
              >
                {count}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  reactionBarContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
    marginTop: 6,
  },
  reactionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
  },
  reactionCount: {
    fontSize: 11,
  },
});
