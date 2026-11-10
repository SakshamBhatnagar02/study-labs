import React, { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../../theme';
import { DailyGoalConfig } from '../../types';
import { StorageService } from '../../services/storage';
import { SoundManager } from '../../services/soundManager';
import { HapticManager } from '../../services/hapticManager';
import { Button } from './Button';
import { Bell, Clock, Flame, Mail, Target, Trophy, X } from 'lucide-react-native';

interface DailyGoalModalProps {
  visible: boolean;
  onClose: () => void;
  onSaved: (config: DailyGoalConfig) => void;
}

const TARGET_PRESETS = [10, 15, 20, 30, 50];
const REMINDER_TIMES = [
  { label: '7:00 AM', value: '07:00' },
  { label: '4:00 PM', value: '16:00' },
  { label: '8:00 PM', value: '20:00' },
  { label: '9:30 PM', value: '21:30' },
  { label: '10:30 PM', value: '22:30' },
];

export const DailyGoalModal: React.FC<DailyGoalModalProps> = ({
  visible,
  onClose,
  onSaved,
}) => {
  const { colors, mode } = useTheme();
  const [config, setConfig] = useState<DailyGoalConfig | null>(null);
  const [customTarget, setCustomTarget] = useState('15');

  useEffect(() => {
    if (visible) {
      StorageService.getDailyGoalConfig().then((cfg) => {
        setConfig(cfg);
        setCustomTarget(String(cfg.targetQuestions));
      });
    }
  }, [visible]);

  if (!config) return null;

  const handleSave = async () => {
    const parsed = parseInt(customTarget.trim(), 10);
    const safeTarget = !isNaN(parsed) && parsed > 0 ? Math.min(200, parsed) : config.targetQuestions;
    const saved = await StorageService.saveDailyGoalConfig({
      ...config,
      targetQuestions: safeTarget,
      lastReminderDismissedDate: undefined, // Reset snooze when user explicitly updates goal/reminder
    });
    SoundManager.play('notify');
    HapticManager.triggerSuccess();
    onSaved(saved);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.sheet,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
            <View style={styles.titleRow}>
              <Target size={20} color={colors.primary} />
              <Text style={[styles.title, { color: colors.text }]}>
                Daily Goal & Score Reminder
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSubtle }]}
            >
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              DAILY QUESTIONS TARGET
            </Text>
            <View style={styles.presetRow}>
              {TARGET_PRESETS.map((num) => {
                const selected = config.targetQuestions === num && customTarget === String(num);
                return (
                  <TouchableOpacity
                    key={num}
                    activeOpacity={0.75}
                    onPress={() => {
                      HapticManager.triggerSelection();
                      setConfig({ ...config, targetQuestions: num });
                      setCustomTarget(String(num));
                    }}
                    style={[
                      styles.presetChip,
                      {
                        backgroundColor: selected ? colors.primary : colors.surface,
                        borderColor: selected ? colors.primary : colors.borderSubtle,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.presetText,
                        { color: selected ? '#FFFFFF' : colors.text },
                      ]}
                    >
                      {num} Qs
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.customTargetRow}>
              <Flame size={16} color={colors.primary} />
              <Text style={[styles.customTargetLabel, { color: colors.text }]}>
                Custom daily goal (1–200 Qs):
              </Text>
              <TextInput
                keyboardType="numeric"
                value={customTarget}
                onChangeText={(txt) => {
                  const cleaned = txt.replace(/[^0-9]/g, '');
                  setCustomTarget(cleaned);
                  const n = parseInt(cleaned, 10);
                  if (!isNaN(n) && n > 0) {
                    setConfig({ ...config, targetQuestions: Math.min(200, n) });
                  }
                }}
                style={[
                  styles.targetInput,
                  {
                    color: colors.text,
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                  },
                ]}
                maxLength={3}
              />
            </View>

            <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 18 }]}>
              SCORE & STREAK REMINDERS
            </Text>

            <View style={[styles.switchRow, { borderBottomColor: colors.borderSubtle }]}>
              <View style={styles.switchInfo}>
                <View style={styles.iconTitle}>
                  <Bell size={16} color={colors.primary} />
                  <Text style={[styles.switchTitle, { color: colors.text }]}>
                    Daily Practice Reminder
                  </Text>
                </View>
                <Text style={[styles.switchDesc, { color: colors.textSecondary }]}>
                  Show daily score & streak reminder when target Qs are pending
                </Text>
              </View>
              <Switch
                value={config.reminderEnabled}
                onValueChange={(val) => {
                  setConfig({ ...config, reminderEnabled: val });
                }}
                trackColor={{ false: '#64748B', true: colors.primary }}
              />
            </View>

            {config.reminderEnabled && (
              <View style={[styles.timeBox, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSubtle }]}>
                <View style={styles.iconTitle}>
                  <Clock size={14} color={colors.info} />
                  <Text style={[styles.timeBoxTitle, { color: colors.text }]}>
                    Preferred Reminder Window
                  </Text>
                </View>
                <View style={styles.timeChipsRow}>
                  {REMINDER_TIMES.map((t) => {
                    const selected = config.reminderTime === t.value;
                    return (
                      <TouchableOpacity
                        key={t.value}
                        activeOpacity={0.75}
                        onPress={() => {
                          setConfig({ ...config, reminderTime: t.value });
                        }}
                        style={[
                          styles.timeChip,
                          {
                            backgroundColor: selected
                              ? mode === 'dark'
                                ? '#431407'
                                : '#FFEDD5'
                              : colors.card,
                            borderColor: selected ? colors.primary : colors.borderSubtle,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.timeChipText,
                            { color: selected ? colors.primary : colors.textSecondary },
                          ]}
                        >
                          {t.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            <View style={[styles.switchRow, { borderBottomColor: colors.borderSubtle }]}>
              <View style={styles.switchInfo}>
                <View style={styles.iconTitle}>
                  <Trophy size={16} color={colors.warning} />
                  <Text style={[styles.switchTitle, { color: colors.text }]}>
                    7-Day Score & Rank Alerts
                  </Text>
                </View>
                <Text style={[styles.switchDesc, { color: colors.textSecondary }]}>
                  Highlight weekly XP gap to reach the next League tier & top rank
                </Text>
              </View>
              <Switch
                value={config.scoreAlertsEnabled}
                onValueChange={(val) => {
                  setConfig({ ...config, scoreAlertsEnabled: val });
                }}
                trackColor={{ false: '#64748B', true: colors.primary }}
              />
            </View>

            <View style={[styles.switchRow, { borderBottomColor: colors.borderSubtle }]}>
              <View style={styles.switchInfo}>
                <View style={styles.iconTitle}>
                  <Bell size={16} color={colors.info} />
                  <Text style={[styles.switchTitle, { color: colors.text }]}>
                    Push Notification Preferences
                  </Text>
                </View>
                <Text style={[styles.switchDesc, { color: colors.textSecondary }]}>
                  Sync in-app practice & test score notification badges
                </Text>
              </View>
              <Switch
                value={config.pushNotifications}
                onValueChange={(val) => {
                  setConfig({ ...config, pushNotifications: val });
                }}
                trackColor={{ false: '#64748B', true: colors.primary }}
              />
            </View>

            <View style={[styles.switchRow, { borderBottomColor: 'transparent' }]}>
              <View style={styles.switchInfo}>
                <View style={styles.iconTitle}>
                  <Mail size={16} color={colors.textSecondary} />
                  <Text style={[styles.switchTitle, { color: colors.text }]}>
                    Weekly Digest Email
                  </Text>
                </View>
                <Text style={[styles.switchDesc, { color: colors.textSecondary }]}>
                  Receive weekly accuracy & test summary updates
                </Text>
              </View>
              <Switch
                value={config.emailNotifications}
                onValueChange={(val) => {
                  setConfig({ ...config, emailNotifications: val });
                }}
                trackColor={{ false: '#64748B', true: colors.primary }}
              />
            </View>
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: colors.borderSubtle }]}>
            <Button
              title="Cancel"
              variant="outline"
              size="md"
              onPress={onClose}
              style={{ flex: 1 }}
            />
            <Button
              title="Save Goal & Reminder"
              variant="primary"
              size="md"
              onPress={handleSave}
              style={{ flex: 1.5 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderTopWidth: 1,
    maxHeight: '88%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 17,
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
    marginBottom: 10,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  presetChip: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1.25,
    alignItems: 'center',
  },
  presetText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  customTargetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customTargetLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  targetInput: {
    width: 72,
    borderWidth: 1.25,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  switchInfo: {
    flex: 1,
    paddingRight: 12,
  },
  iconTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 3,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  switchDesc: {
    fontSize: 11.5,
    lineHeight: 16,
  },
  timeBox: {
    padding: 12,
    borderRadius: 14,
    marginVertical: 6,
  },
  timeBoxTitle: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  timeChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  timeChip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  timeChipText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
});

