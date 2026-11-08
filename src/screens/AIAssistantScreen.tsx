import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../theme';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { GeminiAIService, AIResponse } from '../services/gemini';
import { ChatMessage } from '../types';
import { MathRenderer } from '../components/common/MathRenderer';
import { 
  Sparkles, 
  Send, 
  BrainCircuit, 
  Lightbulb, 
  CheckCircle,
  HelpCircle
} from 'lucide-react-native';

export const AIAssistantScreen: React.FC = () => {
  const { colors, mode } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      text: "👋 Hello! I am your **Study Labs AI Tutor**.\n\nI can explain complex concepts, solve STEM questions step-by-step, generate practice quizzes, and break down tricky formulas for CBSE, ICSE, JEE & NEET.\n\nWhat would you like to master today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [latestSteps, setLatestSteps] = useState<string[] | undefined>();
  const [latestTips, setLatestTips] = useState<string[] | undefined>();

  const scrollViewRef = useRef<any>(null);

  const quickPrompts = [
    'Explain Photoelectric Effect',
    'Integration by Parts Formula',
    'SN1 vs SN2 Mechanism',
    'Moment of Inertia of Disc',
  ];

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    setLatestSteps(undefined);
    setLatestTips(undefined);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const response: AIResponse = await GeminiAIService.askTutor(query, {
        subject: 'STEM',
        grade: 'Class 12',
      });

      const aiMsg: ChatMessage = {
        id: 'msg_ai_' + Date.now(),
        sender: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
      }, 100);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      {/* Header Banner */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.borderSubtle }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.avatarIcon, { backgroundColor: mode === 'dark' ? '#431407' : '#FFEDD5' }]}>
            <Sparkles size={20} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>AI Master Tutor</Text>
            <Text style={[styles.headerStatus, { color: colors.success }]}>● Gemini Intelligence Ready</Text>
          </View>
        </View>
        <Badge label="24/7 DOUBT SOLVER" variant="primary" size="sm" />
      </View>

      {/* Messages Scroll Area */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Suggestion Pills */}
        <View style={styles.quickPromptContainer}>
          <Text style={[styles.quickPromptLabel, { color: colors.textSecondary }]}>Quick Academic Prompts:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickScroll}>
            {quickPrompts.map((p) => (
              <TouchableOpacity
                key={p}
                activeOpacity={0.7}
                onPress={() => handleSend(p)}
                style={[styles.promptPill, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}
              >
                <Text style={[styles.promptPillText, { color: colors.text }]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {messages.map((m) => {
          const isUser = m.sender === 'user';
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
                    ? [styles.userBubble, { backgroundColor: colors.primary }]
                    : [styles.aiBubble, { backgroundColor: colors.card, borderColor: colors.borderSubtle }],
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    { color: isUser ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {m.text}
                </Text>
                {!isUser && m.text.includes('\\') && (
                  <MathRenderer math={m.text} displayMode={false} />
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
          );
        })}

        {/* Step-by-Step Breakdown Cards if provided */}
        {latestSteps && latestSteps.length > 0 && (
          <Card style={[styles.stepsCard, { borderColor: colors.primary }]}>
            <View style={styles.cardHeader}>
              <Lightbulb size={16} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.primary }]}>Step-by-Step Strategy</Text>
            </View>
            {latestSteps.map((step, idx) => (
              <View key={idx} style={styles.stepRow}>
                <View style={[styles.stepNum, { backgroundColor: colors.primary }]}>
                  <Text style={styles.stepNumText}>{idx + 1}</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.text }]}>{step}</Text>
              </View>
            ))}
          </Card>
        )}

        {/* Exam Tips if provided */}
        {latestTips && latestTips.length > 0 && (
          <Card style={[styles.tipsCard, { backgroundColor: mode === 'dark' ? '#1E293B' : '#FEF3C7', borderColor: colors.warning }]}>
            <View style={styles.cardHeader}>
              <CheckCircle size={16} color={colors.warning} />
              <Text style={[styles.cardTitle, { color: colors.warning }]}>High-Yield Exam Tips</Text>
            </View>
            {latestTips.map((tip, idx) => (
              <Text key={idx} style={[styles.tipText, { color: colors.text }]}>
                ⭐ {tip}
              </Text>
            ))}
          </Card>
        )}

        {isLoading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Study Labs AI is formulating step-by-step solution...
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Input Bottom Bar */}
      <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.borderSubtle }]}>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.borderSubtle }]}
          placeholder="Ask any concept, question or formula..."
          placeholderTextColor={colors.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={() => handleSend()}
        />
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={!inputText.trim() || isLoading}
          onPress={() => handleSend()}
          style={[
            styles.sendBtn,
            {
              backgroundColor: inputText.trim() && !isLoading ? colors.primary : colors.borderSubtle,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  headerStatus: {
    fontSize: 11,
    fontWeight: '600',
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  quickPromptContainer: {
    marginBottom: 14,
  },
  quickPromptLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  quickScroll: {
    flexDirection: 'row',
  },
  promptPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
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
  },
  userBubbleWrapper: {
    justifyContent: 'flex-end',
  },
  aiBubbleWrapper: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 14,
    borderRadius: 16,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 21,
  },
  timestampText: {
    fontSize: 10,
    marginTop: 6,
    alignSelf: 'flex-end',
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
    marginTop: 1,
  },
  stepNumText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  stepText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  tipText: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 4,
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
