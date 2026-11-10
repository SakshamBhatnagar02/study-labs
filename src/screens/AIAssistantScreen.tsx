import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../theme';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { hasRichMathOrMarkdown, RichMathText } from '../components/common/MathRenderer';
import {
  AIResponse,
  GeminiAIService,
  REASONING_POWER_OPTIONS,
  resolveModelForPrompt,
} from '../services/gemini';
import { StorageService } from '../services/storage';
import { HapticManager } from '../services/hapticManager';
import { ChatMessage, QuestionDifficulty, ReasoningPower } from '../types';
import { AskAITutorPayload } from './TestEngineScreen';
import {
  Sparkles,
  Send,
  BrainCircuit,
  Lightbulb,
  CheckCircle,
  Zap,
  Gauge,
} from 'lucide-react-native';

interface AIAssistantScreenProps {
  prefillPrompt?: AskAITutorPayload | null;
}

const ThinkingBubble: React.FC<{
  modelLabel: string;
  difficulty: QuestionDifficulty;
  reducedMotion: boolean;
}> = ({ modelLabel, difficulty, reducedMotion }) => {
  const { colors, mode } = useTheme();
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    if (reducedMotion) {
      dot1.setValue(0);
      dot2.setValue(0);
      dot3.setValue(0);
      pulse.setValue(1);
      return;
    }

    const makeDotLoop = (val: Animated.Value, delayMs: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delayMs),
          Animated.timing(val, {
            toValue: -6,
            duration: 280,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: 0,
            duration: 280,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.delay(Math.max(0, 420 - delayMs)),
        ])
      );

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.08,
          duration: 650,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.9,
          duration: 650,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const anim = Animated.parallel([
      makeDotLoop(dot1, 0),
      makeDotLoop(dot2, 140),
      makeDotLoop(dot3, 280),
      pulseLoop,
    ]);
    anim.start();
    return () => anim.stop();
  }, [dot1, dot2, dot3, pulse, reducedMotion]);

  return (
    <View style={[styles.messageBubbleWrapper, styles.aiBubbleWrapper]}>
      <View
        style={[
          styles.thinkingBubble,
          {
            backgroundColor: colors.card,
            borderColor: colors.primary,
          },
        ]}
      >
        <View style={styles.thinkingTopRow}>
          <Animated.View
            style={[
              styles.thinkingBadge,
              {
                backgroundColor: mode === 'dark' ? '#431407' : '#FFEDD5',
                borderColor: colors.primary,
                transform: [{ scale: pulse }],
              },
            ]}
          >
            <BrainCircuit size={14} color={colors.primary} />
            <Text style={[styles.thinkingBadgeText, { color: colors.primary }]}>Thinking</Text>
          </Animated.View>

          <View style={styles.dotsWaveRow}>
            {[dot1, dot2, dot3].map((dot, idx) => (
              <Animated.View
                key={idx}
                style={[
                  styles.waveDot,
                  {
                    backgroundColor: colors.primary,
                    transform: [{ translateY: dot }],
                    opacity: idx === 0 ? 1 : idx === 1 ? 0.8 : 0.6,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Reasoning with {modelLabel} · {difficulty} depth...
        </Text>
      </View>
    </View>
  );
};

export const AIAssistantScreen: React.FC<AIAssistantScreenProps> = ({ prefillPrompt }) => {
  const { colors, mode } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      text:
        'Hello! I am your **Study Labs AI Master Tutor**.\n\n' +
        'I can explain concepts, derive STEM formulas step-by-step with full LaTeX typography, and adapt reasoning depth based on your question difficulty.\n\n' +
        'Select **Auto** (adaptive) or manually pick **Flash Lite**, **Flash**, or **Pro** above, then ask any doubt below!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reasoningMode, setReasoningMode] = useState<ReasoningPower>('auto');
  const [difficultyOverride, setDifficultyOverride] = useState<QuestionDifficulty | 'auto'>('auto');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [latestSteps, setLatestSteps] = useState<string[] | undefined>();
  const [latestTips, setLatestTips] = useState<string[] | undefined>();

  const scrollViewRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const handledPrefillNonce = useRef<number | null>(null);

  useEffect(() => {
    StorageService.getSettings().then((settings) => {
      if (settings.aiReasoningPower) {
        setReasoningMode(settings.aiReasoningPower);
      }
      setReducedMotion(Boolean(settings.reducedMotion));
    });
  }, []);

  const quickPrompts = [
    'What is the SI unit of work function?',
    'Explain Photoelectric Effect',
    'Integration by Parts Formula',
    'Prove Moment of Inertia of Disc (JEE Advanced)',
    'Compare SN1 vs SN2 Mechanism',
  ];

  const selectReasoningMode = async (nextMode: ReasoningPower) => {
    HapticManager.triggerSelection();
    setReasoningMode(nextMode);
    await StorageService.saveSettings({ aiReasoningPower: nextMode });
  };

  const handleSend = async (
    textToSend?: string,
    explicitDiff?: QuestionDifficulty,
    subjectCtx?: string
  ) => {
    const query = (textToSend ?? inputText).trim();
    if (!query || isLoading) return;

    const effectiveDifficulty =
      explicitDiff ?? (difficultyOverride === 'auto' ? undefined : difficultyOverride);

    const previewResolved = resolveModelForPrompt(reasoningMode, query, effectiveDifficulty);

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsLoading(true);
    setLatestSteps(undefined);
    setLatestTips(undefined);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 80);

    try {
      const response: AIResponse = await GeminiAIService.askTutor(query, {
        subject: subjectCtx || 'STEM',
        grade: 'Class 12 / JEE & NEET',
        reasoningMode,
        difficulty: previewResolved.detectedDifficulty,
      });

      const aiMsg: ChatMessage = {
        id: 'msg_ai_' + Date.now(),
        sender: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelId: response.modelId,
        modelLabel: response.modelLabel,
        reasoningPower: response.reasoningMode,
        detectedDifficulty: response.detectedDifficulty,
        isFallback: response.isFallback,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setLatestSteps(response.steps);
      setLatestTips(response.tips);
    } catch {
      const errorMsg: ChatMessage = {
        id: 'msg_err_' + Date.now(),
        sender: 'assistant',
        text: 'Sorry, I encountered an issue processing your request. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 120);
    }
  };

  // Auto-submit if opened via "Ask AI" button on a test question
  useEffect(() => {
    if (prefillPrompt && prefillPrompt.nonce !== handledPrefillNonce.current) {
      handledPrefillNonce.current = prefillPrompt.nonce;
      setDifficultyOverride(prefillPrompt.difficulty);
      handleSend(prefillPrompt.prompt, prefillPrompt.difficulty, prefillPrompt.subject);
    }
  }, [prefillPrompt]);

  const activePreview = resolveModelForPrompt(
    reasoningMode,
    inputText.trim() || 'Explain concept',
    difficultyOverride === 'auto' ? undefined : difficultyOverride
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      {/* Header Banner */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.avatarIcon,
              { backgroundColor: mode === 'dark' ? '#431407' : '#FFEDD5' },
            ]}
          >
            <Sparkles size={20} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>AI Master Tutor</Text>
            <Text
              style={[
                styles.headerStatus,
                { color: GeminiAIService.hasApiKey ? colors.success : colors.warning },
              ]}
            >
              ● {GeminiAIService.hasApiKey ? 'Gemini Live Connected' : 'Offline STEM Solver'}
            </Text>
          </View>
        </View>
        <Badge label={activePreview.shortLabel.toUpperCase()} variant="primary" size="sm" />
      </View>

      {/* Model Reasoning Power Selector Bar (non-shrinking container) */}
      <View
        style={[
          styles.reasoningWrapper,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.reasoningScroll}
          contentContainerStyle={styles.reasoningScrollContent}
        >
          {REASONING_POWER_OPTIONS.map((opt) => {
            const isSelected = reasoningMode === opt.mode;
            return (
              <TouchableOpacity
                key={opt.mode}
                activeOpacity={0.75}
                onPress={() => selectReasoningMode(opt.mode)}
                style={[
                  styles.modelChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.borderSubtle,
                  },
                ]}
              >
                {opt.mode === 'auto' && (
                  <Sparkles size={13} color={isSelected ? '#FFFFFF' : colors.primary} />
                )}
                {opt.mode === 'flash-lite' && (
                  <Zap size={13} color={isSelected ? '#FFFFFF' : '#22D3EE'} />
                )}
                {opt.mode === 'flash' && (
                  <Gauge size={13} color={isSelected ? '#FFFFFF' : '#F59E0B'} />
                )}
                {opt.mode === 'pro' && (
                  <BrainCircuit size={13} color={isSelected ? '#FFFFFF' : '#A855F7'} />
                )}
                <Text
                  style={[
                    styles.modelChipText,
                    { color: isSelected ? '#FFFFFF' : colors.text },
                  ]}
                  numberOfLines={1}
                >
                  {opt.shortLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Auto-mode Difficulty Context & Live Routing Indicator */}
        <View style={styles.routingSubRow}>
          <Text style={[styles.routingHintText, { color: colors.textSecondary }]} numberOfLines={1}>
            {reasoningMode === 'auto'
              ? inputText.trim()
                ? `Auto → ${activePreview.shortLabel} (${activePreview.detectedDifficulty})`
                : 'Auto: Easy → Flash Lite · Med → Flash · Hard → Pro'
              : REASONING_POWER_OPTIONS.find((o) => o.mode === reasoningMode)?.description}
          </Text>

          {reasoningMode === 'auto' && (
            <View style={styles.diffPillsRow}>
              {(['auto', 'Easy', 'Medium', 'Hard'] as const).map((diff) => {
                const active = difficultyOverride === diff;
                return (
                  <TouchableOpacity
                    key={diff}
                    activeOpacity={0.7}
                    onPress={() => {
                      HapticManager.triggerSelection();
                      setDifficultyOverride(diff);
                    }}
                    style={[
                      styles.diffMiniPill,
                      {
                        backgroundColor: active ? colors.primaryLight : colors.surface,
                        borderColor: active ? colors.primary : colors.borderSubtle,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.diffMiniText,
                        { color: active ? colors.primary : colors.textSecondary },
                      ]}
                    >
                      {diff === 'auto' ? 'Auto-Diff' : diff}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </View>

      {/* Messages Scroll Area */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesScroll}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Suggestion Pills */}
        <View style={styles.quickPromptContainer}>
          <Text style={[styles.quickPromptLabel, { color: colors.textSecondary }]}>
            Quick Academic Prompts:
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.quickScroll}
            contentContainerStyle={styles.quickScrollContent}
          >
            {quickPrompts.map((p) => (
              <TouchableOpacity
                key={p}
                activeOpacity={0.7}
                onPress={() => {
                  handleSend(p);
                }}
                style={[
                  styles.promptPill,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.promptPillText, { color: colors.text }]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {messages.map((m) => {
          const isUser = m.sender === 'user';
          const userNeedsRichWidth = isUser && hasRichMathOrMarkdown(m.text);
          return (
            <View
              key={m.id}
              style={[
                styles.messageBubbleWrapper,
                isUser ? styles.userBubbleWrapper : styles.aiBubbleWrapper,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  isUser
                    ? [
                        styles.userBubble,
                        userNeedsRichWidth && styles.userBubbleRich,
                        { backgroundColor: colors.primary },
                      ]
                    : [
                        styles.aiBubble,
                        { backgroundColor: colors.card, borderColor: colors.border },
                      ],
                ]}
              >
                <RichMathText
                  content={m.text}
                  fontSize={14}
                  lineHeight={21}
                  color={isUser ? '#FFFFFF' : colors.text}
                  accentColor={isUser ? '#FFFFFF' : colors.primary}
                />

                <View style={styles.msgFooterRow}>
                  {!isUser && m.modelLabel && (
                    <Text style={[styles.modelTagText, { color: colors.primary }]}>
                      {m.modelLabel}
                      {m.detectedDifficulty ? ` · ${m.detectedDifficulty}` : ''}
                      {m.isFallback ? ' (Offline)' : ''}
                    </Text>
                  )}
                  <Text
                    style={[
                      styles.timestampText,
                      { color: isUser ? '#FED7AA' : colors.textSecondary },
                    ]}
                  >
                    {m.timestamp}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}

        {/* Step-by-Step Strategy Card with LaTeX */}
        {latestSteps && latestSteps.length > 0 && (
          <Card style={[styles.stepsCard, { borderColor: colors.primary }]}>
            <View style={styles.cardHeader}>
              <Lightbulb size={16} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.primary }]}>
                Step-by-Step Strategy
              </Text>
            </View>
            {latestSteps.map((step, idx) => (
              <View key={idx} style={styles.stepRow}>
                <View style={[styles.stepNum, { backgroundColor: colors.primary }]}>
                  <Text style={styles.stepNumText}>{idx + 1}</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <RichMathText
                    content={step}
                    fontSize={13.5}
                    color={colors.text}
                    accentColor={colors.primary}
                    compact={true}
                  />
                </View>
              </View>
            ))}
          </Card>
        )}

        {/* Exam Tips Card with LaTeX */}
        {latestTips && latestTips.length > 0 && (
          <Card
            style={[
              styles.tipsCard,
              {
                backgroundColor: mode === 'dark' ? '#2A1D08' : '#FEF3C7',
                borderColor: colors.warning,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <CheckCircle size={16} color={colors.warning} />
              <Text style={[styles.cardTitle, { color: colors.warning }]}>
                High-Yield Exam Tips
              </Text>
            </View>
            {latestTips.map((tip, idx) => (
              <View key={idx} style={styles.tipRow}>
                <Sparkles size={13} color={colors.warning} style={{ marginTop: 3 }} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <RichMathText
                    content={tip}
                    fontSize={13}
                    color={colors.text}
                    accentColor={colors.warning}
                    compact={true}
                  />
                </View>
              </View>
            ))}
          </Card>
        )}

        {isLoading && (
          <ThinkingBubble
            modelLabel={activePreview.shortLabel}
            difficulty={activePreview.detectedDifficulty}
            reducedMotion={reducedMotion}
          />
        )}
      </ScrollView>

      {/* Input Bottom Bar */}
      <View
        style={[
          styles.inputContainer,
          { backgroundColor: colors.card, borderTopColor: colors.border },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
          ]}
          placeholder="Ask any concept, question or formula..."
          placeholderTextColor={colors.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={() => handleSend()}
        />
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={!inputText.trim() || isLoading}
          onPress={() => {
            handleSend();
          }}
          style={[
            styles.sendBtn,
            {
              backgroundColor:
                inputText.trim() && !isLoading ? colors.primary : colors.borderSubtle,
            },
          ]}
        >
          <Send size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexGrow: 0,
    flexShrink: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 15.5,
    fontWeight: '800',
  },
  headerStatus: {
    fontSize: 11,
    fontWeight: '600',
  },
  reasoningWrapper: {
    flexGrow: 0,
    flexShrink: 0,
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  reasoningScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  reasoningScrollContent: {
    paddingHorizontal: 14,
    paddingTop: 9,
    paddingBottom: 6,
    alignItems: 'center',
  },
  modelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 34,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1.25,
    marginRight: 8,
  },
  modelChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  routingSubRow: {
    paddingHorizontal: 14,
    gap: 6,
  },
  routingHintText: {
    fontSize: 11,
    fontWeight: '500',
  },
  diffPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  diffMiniPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  diffMiniText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  quickPromptContainer: {
    marginBottom: 12,
  },
  quickPromptLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  quickScroll: {
    flexGrow: 0,
  },
  quickScrollContent: {
    alignItems: 'center',
  },
  promptPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  promptPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  messageBubbleWrapper: {
    marginVertical: 6,
    flexDirection: 'row',
    width: '100%',
  },
  userBubbleWrapper: {
    justifyContent: 'flex-end',
  },
  aiBubbleWrapper: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    padding: 14,
    borderRadius: 16,
  },
  userBubble: {
    maxWidth: '84%',
    borderBottomRightRadius: 4,
  },
  userBubbleRich: {
    width: '82%',
  },
  aiBubble: {
    width: '93%',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  thinkingBubble: {
    width: '86%',
    padding: 14,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    borderWidth: 1.25,
    gap: 8,
  },
  thinkingTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  thinkingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  thinkingBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  dotsWaveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 4,
  },
  waveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  msgFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  modelTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  timestampText: {
    fontSize: 10,
    marginLeft: 'auto',
  },
  stepsCard: {
    padding: 16,
    marginTop: 10,
    borderWidth: 1.5,
  },
  tipsCard: {
    padding: 16,
    marginTop: 10,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  stepNum: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
  },
  loadingText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexGrow: 0,
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
