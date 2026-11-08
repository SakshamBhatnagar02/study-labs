import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Award, Sparkles, Trophy } from 'lucide-react-native';
import { CelebrationTier } from '../../types';

interface TrophyAnimationProps {
  tier: CelebrationTier;
}

export const TrophyAnimation: React.FC<TrophyAnimationProps> = ({ tier }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringScaleAnim = useRef(new Animated.Value(0.6)).current;
  const ringOpacityAnim = useRef(new Animated.Value(0.8)).current;

  const isPersonalBest = tier === 'personal_best';
  const isExcellent = tier === 'excellent';

  const trophyColor = isPersonalBest ? '#FACC15' : isExcellent ? '#22D3EE' : '#F97316';
  const ringColor = isPersonalBest ? '#FACC15' : '#F97316';

  useEffect(() => {
    // 1. Entrance spring
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // 2. Subtle continuous rotation / shimmer
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: -1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 3. Neon energy ring pulse
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(ringScaleAnim, {
            toValue: 1.45,
            duration: 1600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(ringScaleAnim, {
            toValue: 0.8,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(ringOpacityAnim, {
            toValue: 0,
            duration: 1600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacityAnim, {
            toValue: 0.8,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-6deg', '6deg'],
  });

  return (
    <View style={styles.container}>
      {/* Outer Neon Energy Pulse Ring */}
      <Animated.View
        style={[
          styles.energyRing,
          {
            borderColor: ringColor,
            opacity: ringOpacityAnim,
            transform: [{ scale: ringScaleAnim }],
          },
        ]}
      />

      {/* Holographic Glowing Trophy Center */}
      <Animated.View
        style={[
          styles.trophyWrapper,
          {
            borderColor: trophyColor,
            backgroundColor: isPersonalBest ? '#422006' : '#1E1B4B',
            transform: [{ scale: scaleAnim }, { rotate: spin }],
          },
        ]}
      >
        {isPersonalBest ? (
          <Trophy size={48} color={trophyColor} strokeWidth={2.5} />
        ) : (
          <Award size={46} color={trophyColor} strokeWidth={2.2} />
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 140,
    height: 140,
    marginVertical: 12,
  },
  energyRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  trophyWrapper: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
});
