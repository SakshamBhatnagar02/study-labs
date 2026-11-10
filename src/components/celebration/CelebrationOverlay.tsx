import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { CelebrationEvent, AppSettings } from '../../types';
import { StorageService } from '../../services/storage';
import { ParticleCanvas } from './ParticleCanvas';
import { TrophyAnimation } from './TrophyAnimation';
import { CheckCircle2, Clock, XCircle, Sparkles, ArrowRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface CelebrationOverlayProps {
  event: CelebrationEvent | null;
  onClose: () => void;
}

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({
  event,
  onClose,
}) => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (event) {
      StorageService.getSettings().then(setSettings);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [event]);

  if (!event) return null;

  const isPersonalBest = event.tier === 'personal_best';
  const isExcellent = event.tier === 'excellent';

  const title = isPersonalBest
    ? 'NEW PERSONAL BEST!'
    : isExcellent
    ? 'EXCEPTIONAL ACCURACY!'
    : 'TEST COMPLETED!';

  const subtitle = isPersonalBest
    ? 'You set a new all-time high score on Study Labs!'
    : isExcellent
    ? 'Outstanding mastery of the curriculum concepts.'
    : 'Great effort! Review your step-by-step solutions below.';

  return (
    <Modal visible={!!event} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        {/* Cyber Particle Burst Engine */}
        {settings?.celebrationParticles && (
          <ParticleCanvas
            intensity={settings.particleIntensity}
            reducedMotion={settings.reducedMotion}
          />
        )}

        <View style={styles.card}>
          {/* Cyber Trophy Animation */}
          <TrophyAnimation tier={event.tier} />

          {/* Achievement Title */}
          <Text style={[styles.title, isPersonalBest && { color: '#FACC15' }]}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          {/* Score & Percentage Display */}
          <View style={styles.scoreRow}>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreValue}>{event.percentage}%</Text>
              <Text style={styles.scoreLabel}>ACCURACY</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.scoreBox}>
              <Text style={styles.scoreValue}>
                {event.score > 0 ? `+${event.score}` : event.score} / {event.maxScore}
              </Text>
              <Text style={styles.scoreLabel}>TOTAL MARKS</Text>
            </View>
          </View>

          {/* Metrics Summary Strip */}
          <View style={styles.metricsStrip}>
            <View style={styles.metricItem}>
              <CheckCircle2 size={16} color="#34D399" />
              <Text style={styles.metricText}>{event.correctAnswers} Correct</Text>
            </View>
            <View style={styles.metricItem}>
              <XCircle size={16} color="#F87171" />
              <Text style={styles.metricText}>{event.incorrectAnswers} Incorrect</Text>
            </View>
            <View style={styles.metricItem}>
              <Clock size={16} color="#94A3B8" />
              <Text style={styles.metricText}>{event.timeSpentStr}</Text>
            </View>
          </View>

          {/* Close / Proceed Action */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={styles.actionBtnText}>Review Solutions & Answers</Text>
            <ArrowRight size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(9, 13, 22, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: Math.min(width - 36, 380),
    backgroundColor: '#131A29',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#334155',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 16,
    zIndex: 1000,
  },
  title: {
    fontSize: 21,
    fontWeight: '800',
    color: '#F97316',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 12.5,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 18,
    width: '100%',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: '#334155',
  },
  scoreBox: {
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: '#334155',
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 2,
    letterSpacing: 0.8,
  },
  metricsStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 14,
    paddingHorizontal: 6,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F97316',
    borderRadius: 14,
    paddingVertical: 14,
    width: '100%',
    marginTop: 20,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

