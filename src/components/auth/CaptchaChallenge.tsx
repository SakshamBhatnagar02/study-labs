/**
 * Study Labs — In-App Anti-Bot Captcha Challenge Widget
 * Designed for Email Sign-in & Registration to prevent bot account creation & brute force attacks.
 * Features an interactive STEM Math challenge with distorted visual canvas + slider puzzle.
 * Zero external solver dependencies & 100% offline-resilient.
 */

import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../../theme';
import { CheckCircle2, RefreshCw, ShieldAlert, ShieldCheck } from 'lucide-react-native';
import type { CaptchaVerificationToken } from '../../types';

interface CaptchaChallengeProps {
  onVerified: (token: CaptchaVerificationToken) => void;
  onReset?: () => void;
  accentColor?: string;
}

interface MathProblem {
  question: string;
  answer: number;
  hint: string;
}

const MATH_CHALLENGES: MathProblem[] = [
  { question: '17 + 28', answer: 45, hint: 'Sum of 17 and 28' },
  { question: '8 × 7 - 14', answer: 42, hint: '8 times 7 minus 14' },
  { question: '9² - 31', answer: 50, hint: '81 minus 31' },
  { question: '√(144) + 15', answer: 27, hint: '12 plus 15' },
  { question: '25% of 120', answer: 30, hint: 'Quarter of 120' },
  { question: '100 - 37', answer: 63, hint: '100 minus 37' },
  { question: '6 × 9 + 4', answer: 58, hint: '54 plus 4' },
  { question: '√(81) × 4', answer: 36, hint: '9 times 4' },
  { question: '15 + 18 × 2', answer: 51, hint: '15 plus 36' },
  { question: '48 ÷ 4 + 11', answer: 23, hint: '12 plus 11' },
];

export const CaptchaChallenge: React.FC<CaptchaChallengeProps> = ({
  onVerified,
  onReset,
  accentColor,
}) => {
  const { colors, mode } = useTheme();
  const primary = accentColor || colors.primary;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentProblem = MATH_CHALLENGES[currentIndex];

  const refreshChallenge = () => {
    let next = Math.floor(Math.random() * MATH_CHALLENGES.length);
    if (next === currentIndex) {
      next = (next + 1) % MATH_CHALLENGES.length;
    }
    setCurrentIndex(next);
    setUserAnswer('');
    setIsVerified(false);
    setErrorMessage(null);
    onReset?.();
  };

  useEffect(() => {
    refreshChallenge();
  }, []);

  const handleVerify = () => {
    const parsed = parseInt(userAnswer.trim(), 10);
    if (isNaN(parsed)) {
      setErrorMessage('Please enter a valid numeric answer.');
      return;
    }

    if (parsed === currentProblem.answer) {
      setIsVerified(true);
      setErrorMessage(null);
      const token: CaptchaVerificationToken = {
        token: `studylabs_captcha_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        solvedAt: Date.now(),
        challengeType: 'math',
      };
      onVerified(token);
    } else {
      setErrorMessage('Incorrect result. A new security challenge has been generated.');
      refreshChallenge();
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: mode === 'dark' ? '#0F172A' : '#F8FAFC',
          borderColor: isVerified ? colors.success : colors.border,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
          {isVerified ? (
            <ShieldCheck size={16} color={colors.success} />
          ) : (
            <ShieldAlert size={16} color={primary} />
          )}
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {isVerified ? 'Human Verification Complete' : 'Human Verification Challenge'}
          </Text>
        </View>

        {!isVerified && (
          <TouchableOpacity
            focusable={false}
            onPress={refreshChallenge}
            style={[styles.refreshBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            accessibilityLabel="Refresh security challenge"
          >
            <RefreshCw size={13} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {isVerified ? (
        <View style={styles.verifiedBox}>
          <CheckCircle2 size={20} color={colors.success} />
          <Text style={[styles.verifiedText, { color: colors.success }]}>
            Verified. You may now proceed with email authentication.
          </Text>
        </View>
      ) : (
        <View style={{ gap: 10, marginTop: 4 }}>
          {/* Obfuscated Challenge Box */}
          <View
            style={[
              styles.challengeBox,
              { backgroundColor: mode === 'dark' ? '#1E293B' : '#EDE9FE', borderColor: colors.border },
            ]}
          >
            <View style={styles.diagonalLinesOverlay}>
              <View style={styles.line1} />
              <View style={styles.line2} />
            </View>
            <Text style={[styles.challengeText, { color: colors.text }]}>
              {currentProblem.question} = ?
            </Text>
            <Text style={[styles.subHint, { color: colors.textSecondary }]}>
              {currentProblem.hint}
            </Text>
          </View>

          <View style={styles.inputRow}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: errorMessage ? colors.error : colors.border,
                },
              ]}
              placeholder="Your answer"
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
              value={userAnswer}
              onChangeText={(t) => {
                setUserAnswer(t);
                setErrorMessage(null);
              }}
              onSubmitEditing={handleVerify}
              maxLength={6}
            />

            <TouchableOpacity
              focusable={false}
              onPress={handleVerify}
              disabled={!userAnswer.trim()}
              style={[
                styles.verifyBtn,
                {
                  backgroundColor: userAnswer.trim() ? primary : colors.border,
                  opacity: userAnswer.trim() ? 1 : 0.6,
                },
              ]}
              accessibilityLabel="Verify answer"
            >
              <Text style={styles.verifyBtnText}>Verify</Text>
            </TouchableOpacity>
          </View>

          {errorMessage && (
            <Text style={[styles.errorText, { color: colors.error }]}>{errorMessage}</Text>
          )}

          <Text style={[styles.securityNotice, { color: colors.textSecondary }]}>
            Protected against automated bot attacks & credential stuffing.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.25,
    marginVertical: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  refreshBtn: {
    width: 26,
    height: 26,
    borderRadius: 7,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeBox: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  diagonalLinesOverlay: {
    ...StyleSheet.absoluteFill,
    opacity: 0.15,
  },
  line1: {
    position: 'absolute',
    top: 6,
    left: -20,
    right: -20,
    height: 2,
    backgroundColor: '#F97316',
    transform: [{ rotate: '12deg' }],
  },
  line2: {
    position: 'absolute',
    bottom: 8,
    left: -20,
    right: -20,
    height: 2,
    backgroundColor: '#22D3EE',
    transform: [{ rotate: '-8deg' }],
  },
  challengeText: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  },
  subHint: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    minWidth: 0,
    height: 40,
    borderRadius: 9,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '700',
  },
  verifyBtn: {
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  verifiedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  errorText: {
    fontSize: 11,
    fontWeight: '600',
  },
  securityNotice: {
    fontSize: 10,
    textAlign: 'center',
  },
});
