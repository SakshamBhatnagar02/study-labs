import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { ParticleIntensity } from '../../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CYBER_COLORS = [
  '#F97316', // Orange
  '#22D3EE', // Cyan
  '#A855F7', // Violet
  '#EC4899', // Magenta
  '#FACC15', // Gold
  '#34D399', // Green
];

interface ParticleCanvasProps {
  intensity?: ParticleIntensity;
  reducedMotion?: boolean;
}

interface ParticleData {
  anim: Animated.Value;
  startX: number;
  startY: number;
  destX: number;
  destY: number;
  color: string;
  size: number;
  rotation: number;
  shape: 'circle' | 'square' | 'diamond' | 'star';
}

export const ParticleCanvas: React.FC<ParticleCanvasProps> = ({
  intensity = 'standard',
  reducedMotion = false,
}) => {
  if (reducedMotion) {
    return null;
  }

  const particleCount = intensity === 'low' ? 30 : intensity === 'high' ? 85 : 55;
  const particlesRef = useRef<ParticleData[]>([]);

  if (particlesRef.current.length === 0) {
    const list: ParticleData[] = [];
    const shapes: ('circle' | 'square' | 'diamond' | 'star')[] = ['circle', 'square', 'diamond', 'star'];

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 120 + Math.random() * 220;
      const startX = SCREEN_WIDTH / 2;
      const startY = SCREEN_HEIGHT * 0.38;

      list.push({
        anim: new Animated.Value(0),
        startX,
        startY,
        destX: startX + Math.cos(angle) * speed * (0.8 + Math.random() * 0.7),
        destY: startY + Math.sin(angle) * speed * (0.8 + Math.random() * 0.7) + 80,
        color: CYBER_COLORS[Math.floor(Math.random() * CYBER_COLORS.length)],
        size: 5 + Math.random() * 7,
        rotation: Math.random() * 360,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      });
    }
    particlesRef.current = list;
  }

  useEffect(() => {
    const animations = particlesRef.current.map((p, idx) => {
      return Animated.timing(p.anim, {
        toValue: 1,
        duration: 1200 + Math.random() * 600,
        delay: (idx % 12) * 25,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      });
    });

    Animated.stagger(15, animations).start();
  }, []);

  return (
    <View style={styles.overlay} pointerEvents="none">
      {particlesRef.current.map((p, idx) => {
        const translateX = p.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [p.startX, p.destX],
        });

        const translateY = p.anim.interpolate({
          inputRange: [0, 0.4, 1],
          outputRange: [p.startY, p.destY - 30, p.destY + 120],
        });

        const opacity = p.anim.interpolate({
          inputRange: [0, 0.15, 0.75, 1],
          outputRange: [0, 1, 0.8, 0],
        });

        const scale = p.anim.interpolate({
          inputRange: [0, 0.2, 1],
          outputRange: [0.2, 1.2, 0.6],
        });

        const rotate = p.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [`${p.rotation}deg`, `${p.rotation + 360}deg`],
        });

        const shapeStyle =
          p.shape === 'circle'
            ? { borderRadius: p.size / 2 }
            : p.shape === 'diamond'
            ? { transform: [{ rotate: '45deg' }] }
            : { borderRadius: 2 };

        return (
          <Animated.View
            key={idx}
            style={[
              styles.particle,
              shapeStyle,
              {
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                opacity,
                transform: [{ translateX }, { translateY }, { scale }, { rotate }],
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    zIndex: 999,
  },
  particle: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
