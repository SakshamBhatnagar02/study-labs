import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../theme';
import { AppSettings, ParticleIntensity } from '../../types';
import { StorageService } from '../../services/storage';
import { SoundManager } from '../../services/soundManager';
import { HapticManager } from '../../services/hapticManager';
import {
  Volume2,
  VolumeX,
  Vibrate,
  Sparkles,
  Eye,
  Sliders,
  X,
  Check,
} from 'lucide-react-native';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose }) => {
  const { colors, mode } = useTheme();
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    if (visible) {
      StorageService.getSettings().then(setSettings);
    }
  }, [visible]);

  if (!settings) return null;

  const updateSetting = async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    await StorageService.saveSettings({ [key]: value });

    // Haptic feedback when flipping switches
    if (key === 'hapticFeedback' ? Boolean(value) : settings.hapticFeedback) {
      HapticManager.triggerSelection();
    }
  };

  const handleTestSound = () => {
    SoundManager.play('correct');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
            <View style={styles.titleRow}>
              <Sliders size={20} color={colors.primary} />
              <Text style={[styles.title, { color: colors.text }]}>Sound & Cyber Effects</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.surface }]}>
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            {/* Master Audio Section */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>AUDIO & SOUND EFFECTS</Text>
            
            <View style={[styles.settingRow, { borderBottomColor: colors.borderSubtle }]}>
              <View style={styles.labelCol}>
                <View style={styles.iconLabel}>
                  {settings.masterSound ? (
                    <Volume2 size={18} color={colors.primary} />
                  ) : (
                    <VolumeX size={18} color={colors.textSecondary} />
                  )}
                  <Text style={[styles.settingTitle, { color: colors.text }]}>Master Sound Effects</Text>
                </View>
                <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                  Enable digital audio chimes throughout the app
                </Text>
              </View>
              <Switch
                value={settings.masterSound}
                onValueChange={(val) => updateSetting('masterSound', val)}
                trackColor={{ false: '#64748B', true: colors.primary }}
              />
            </View>

            {/* Sub-sound toggles */}
            <View style={[styles.subGroup, !settings.masterSound && { opacity: 0.45 }]}>
              <View style={[styles.settingRow, { borderBottomColor: colors.borderSubtle }]}>
                <View style={styles.labelCol}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>Correct Answer Chime</Text>
                  <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                    Positive high-tech chime on correct solutions
                  </Text>
                </View>
                <Switch
                  disabled={!settings.masterSound}
                  value={settings.correctSound}
                  onValueChange={(val) => updateSetting('correctSound', val)}
                  trackColor={{ false: '#64748B', true: colors.primary }}
                />
              </View>

              <View style={[styles.settingRow, { borderBottomColor: colors.borderSubtle }]}>
                <View style={styles.labelCol}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>Incorrect Answer Tone</Text>
                  <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                    Gentle guidance sound on mistaken answers
                  </Text>
                </View>
                <Switch
                  disabled={!settings.masterSound}
                  value={settings.incorrectSound}
                  onValueChange={(val) => updateSetting('incorrectSound', val)}
                  trackColor={{ false: '#64748B', true: colors.primary }}
                />
              </View>

              <View style={[styles.settingRow, { borderBottomColor: colors.borderSubtle }]}>
                <View style={styles.labelCol}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>Test Completion Fanfare</Text>
                  <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                    Triumphant audio upon completing practice or exams
                  </Text>
                </View>
                <Switch
                  disabled={!settings.masterSound}
                  value={settings.completionSound}
                  onValueChange={(val) => updateSetting('completionSound', val)}
                  trackColor={{ false: '#64748B', true: colors.primary }}
                />
              </View>
            </View>

            {/* Haptic Feedback Section */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 18 }]}>
              HAPTICS & TACTILE
            </Text>
            <View style={[styles.settingRow, { borderBottomColor: colors.borderSubtle }]}>
              <View style={styles.labelCol}>
                <View style={styles.iconLabel}>
                  <Vibrate size={18} color={colors.info} />
                  <Text style={[styles.settingTitle, { color: colors.text }]}>Haptic Feedback</Text>
                </View>
                <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                  Physical vibrations for button clicks & celebrations
                </Text>
              </View>
              <Switch
                value={settings.hapticFeedback}
                onValueChange={(val) => updateSetting('hapticFeedback', val)}
                trackColor={{ false: '#64748B', true: colors.primary }}
              />
            </View>

            {/* Cyber Visual Effects Section */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 18 }]}>
              CYBER VISUAL EFFECTS
            </Text>
            <View style={[styles.settingRow, { borderBottomColor: colors.borderSubtle }]}>
              <View style={styles.labelCol}>
                <View style={styles.iconLabel}>
                  <Sparkles size={18} color={colors.warning} />
                  <Text style={[styles.settingTitle, { color: colors.text }]}>Celebration Particles</Text>
                </View>
                <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                  Burst neon particles and confetti upon finishing tests
                </Text>
              </View>
              <Switch
                value={settings.celebrationParticles}
                onValueChange={(val) => updateSetting('celebrationParticles', val)}
                trackColor={{ false: '#64748B', true: colors.primary }}
              />
            </View>

            {/* Particle Intensity Selector */}
            {settings.celebrationParticles && (
              <View style={[styles.intensityBox, { backgroundColor: colors.surface }]}>
                <Text style={[styles.intensityTitle, { color: colors.text }]}>Particle Budget Tier</Text>
                <View style={styles.tierRow}>
                  {(['low', 'standard', 'high'] as ParticleIntensity[]).map((tier) => (
                    <TouchableOpacity
                      key={tier}
                      onPress={() => updateSetting('particleIntensity', tier)}
                      style={[
                        styles.tierBtn,
                        settings.particleIntensity === tier && {
                          backgroundColor: colors.primary,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.tierBtnText,
                          {
                            color:
                              settings.particleIntensity === tier ? '#FFFFFF' : colors.textSecondary,
                            fontWeight: settings.particleIntensity === tier ? '700' : '500',
                          },
                        ]}
                      >
                        {tier.toUpperCase()} ({tier === 'low' ? '30' : tier === 'standard' ? '55' : '85'})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Reduced Motion Toggle */}
            <View style={[styles.settingRow, { borderBottomColor: colors.borderSubtle, marginTop: 8 }]}>
              <View style={styles.labelCol}>
                <View style={styles.iconLabel}>
                  <Eye size={18} color={colors.textSecondary} />
                  <Text style={[styles.settingTitle, { color: colors.text }]}>Reduced Motion Mode</Text>
                </View>
                <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                  Minimizes flashing animations and movement for low-latency or accessibility
                </Text>
              </View>
              <Switch
                value={settings.reducedMotion}
                onValueChange={(val) => updateSetting('reducedMotion', val)}
                trackColor={{ false: '#64748B', true: colors.primary }}
              />
            </View>

            {/* Test Sound Button */}
            {settings.masterSound && (
              <TouchableOpacity
                onPress={handleTestSound}
                style={[styles.testSoundBtn, { borderColor: colors.primary }]}
                activeOpacity={0.7}
              >
                <Volume2 size={16} color={colors.primary} />
                <Text style={[styles.testSoundText, { color: colors.primary }]}>
                  Play Preview Chime
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingVertical: 14,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  subGroup: {
    paddingLeft: 12,
  },
  labelCol: {
    flex: 1,
    paddingRight: 12,
  },
  iconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  settingTitle: {
    fontSize: 14.5,
    fontWeight: '600',
  },
  settingDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  intensityBox: {
    borderRadius: 14,
    padding: 12,
    marginVertical: 10,
  },
  intensityTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  tierRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tierBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  tierBtnText: {
    fontSize: 11,
  },
  testSoundBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 18,
  },
  testSoundText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
