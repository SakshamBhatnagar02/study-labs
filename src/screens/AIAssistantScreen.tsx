import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../theme';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { hasRichMathOrMarkdown, RichMathText } from '../components/common/MathRenderer';
import { ApiErrorCard, EmptyResourceCard, copyTextSafely } from '../components/common/StateFeedbackCard';
import { AttachmentPreviewModal } from '../components/ai/AttachmentPreviewModal';
import { ImageLibraryModal, StemVisualPreview } from '../components/ai/ImageLibraryModal';
import {
  AIResponse,
  GeminiAIService,
  REASONING_POWER_OPTIONS,
  resolveModelForPrompt,
} from '../services/gemini';
import { StorageService } from '../services/storage';
import { HapticManager } from '../services/hapticManager';
import { prepareAIUploadedAttachment } from '../utils/attachmentParser';
import { buildApiErrorInfo } from '../utils/errorHandling';
import {
  checkCanStoreGeneratedImage,
  computeStorageQuotaUsage,
  formatByteSize,
} from '../utils/aiImageLibrary';
import type {
  AIAttachmentKind,
  AIUploadedAttachment,
  AppErrorInfo,
  ChatMessage,
  ChatSession,
  GeneratedStemImage,
  MessageFeedback,
  QuestionDifficulty,
  ReasoningPower,
  StemVisualSubject,
  UserPlanTier,
} from '../types';
import { AskAITutorPayload } from './TestEngineScreen';
import {
  BrainCircuit,
  Check,
  CheckCircle,
  Copy,
  Edit3,
  ExternalLink,
  FileText,
  Gauge,
  Globe,
  History,
  Image as ImageIcon,
  Lightbulb,
  Paperclip,
  Plus,
  Presentation,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  Wand2,
  X,
  Zap,
} from 'lucide-react-native';

interface AIAssistantScreenProps {
  prefillPrompt?: AskAITutorPayload | null;
}

const WELCOME_TEXT =
  'Hello! I am your **Study Labs AI Master Tutor**.\n\n' +
  'Ask STEM doubts with full LaTeX typography, toggle **Web** for grounded search citations, attach & edit **Images / PDFs / PPTX**, or enable **Gen Visual** to generate Math graphs & Physics/Chemistry diagrams in your Image Library.';

function createWelcomeMessage(): ChatMessage {
  return {
    id: `msg_welcome_${Date.now()}`,
    sender: 'assistant',
    text: WELCOME_TEXT,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

function createFreshSession(title = 'New Study Session'): ChatSession {
  const now = new Date().toISOString();
  return {
    id: `chat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title,
    createdAt: now,
    updatedAt: now,
    webSearchEnabled: false,
    messages: [createWelcomeMessage()],
  };
}

const FEEDBACK_REASONS = [
  'Incorrect concept or math',
  'Missing derivation steps',
  'LaTeX or formatting issue',
  'Incomplete file analysis',
  'Other',
];

const ThinkingBubble: React.FC<{
  modelLabel: string;
  difficulty: QuestionDifficulty;
  reducedMotion: boolean;
  isVisualGen?: boolean;
}> = ({ modelLabel, difficulty, reducedMotion, isVisualGen }) => {
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
            {isVisualGen ? (
              <Wand2 size={14} color={colors.primary} />
            ) : (
              <BrainCircuit size={14} color={colors.primary} />
            )}
            <Text style={[styles.thinkingBadgeText, { color: colors.primary }]}>
              {isVisualGen ? 'Generating Visual' : 'Thinking'}
            </Text>
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
          {isVisualGen
            ? 'Rendering high-contrast STEM diagram for your Image Library...'
            : `Reasoning with ${modelLabel} · ${difficulty} depth...`}
        </Text>
      </View>
    </View>
  );
};

export const AIAssistantScreen: React.FC<AIAssistantScreenProps> = ({ prefillPrompt }) => {
  const { colors, mode } = useTheme();

  // Persistent multi-session chat history
  const [sessions, setSessions] = useState<ChatSession[]>(() => [createFreshSession()]);
  const sessionsRef = useRef<ChatSession[]>(sessions);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [sessionsLoaded, setSessionsLoaded] = useState(false);

  // Composer & attachments
  const [inputText, setInputText] = useState('');
  const [stagedAttachments, setStagedAttachments] = useState<AIUploadedAttachment[]>([]);
  const [attachmentBusy, setAttachmentBusy] = useState(false);
  const [attachmentError, setAttachmentError] = useState<AppErrorInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingIsVisual, setLoadingIsVisual] = useState(false);

  // AI Mode Controls
  const [reasoningMode, setReasoningMode] = useState<ReasoningPower>('auto');
  const [difficultyOverride, setDifficultyOverride] = useState<QuestionDifficulty | 'auto'>('auto');
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [visualGenMode, setVisualGenMode] = useState(false);
  const [visualSubjectPref, setVisualSubjectPref] = useState<StemVisualSubject | 'auto'>('auto');
  const [reducedMotion, setReducedMotion] = useState(false);

  // Separate Image Library & Plan Quota State (Free Plan default)
  const [generatedImages, setGeneratedImages] = useState<GeneratedStemImage[]>([]);
  const [userPlanTier, setUserPlanTier] = useState<UserPlanTier>('free');
  const [libraryVisible, setLibraryVisible] = useState(false);
  const [libraryEditId, setLibraryEditId] = useState<string | null>(null);

  // Modals: Chat History, Attachment Preview/Editor, Feedback, Error/Copy
  const [historyVisible, setHistoryVisible] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [renamingSessionId, setRenamingSessionId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState('');

  const [previewTarget, setPreviewTarget] = useState<{
    attachment: AIUploadedAttachment;
    messageId?: string;
  } | null>(null);

  const [feedbackTargetMsg, setFeedbackTargetMsg] = useState<ChatMessage | null>(null);
  const [feedbackReason, setFeedbackReason] = useState(FEEDBACK_REASONS[0]);
  const [feedbackComment, setFeedbackComment] = useState('');

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingMessageText, setEditingMessageText] = useState('');

  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [dismissedErrors, setDismissedErrors] = useState<Record<string, boolean>>({});
  const [expandedStepsByMsg, setExpandedStepsByMsg] = useState<Record<string, boolean>>({});

  const scrollViewRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const handledPrefillNonce = useRef<number | null>(null);

  // Hydrate settings, chat history sessions, generated image library & Free plan
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [settings, storedSessions, storedActiveId, storedImages, plan] = await Promise.all([
          StorageService.getSettings(),
          StorageService.getChatSessions(),
          StorageService.getActiveChatSessionId(),
          StorageService.getGeneratedImages(),
          StorageService.getUserPlanTier(),
        ]);
        if (!mounted) return;
        if (settings.aiReasoningPower) setReasoningMode(settings.aiReasoningPower);
        setReducedMotion(Boolean(settings.reducedMotion));
        setGeneratedImages(storedImages);
        setUserPlanTier(plan);

        if (storedSessions.length > 0) {
          const picked =
            storedSessions.find((s) => s.id === storedActiveId) || storedSessions[0];
          sessionsRef.current = storedSessions;
          setSessions(storedSessions);
          setActiveSessionId(picked.id);
          setWebSearchEnabled(Boolean(picked.webSearchEnabled));
        } else {
          const initial = createFreshSession('Study Session #1');
          sessionsRef.current = [initial];
          setSessions([initial]);
          setActiveSessionId(initial.id);
          await StorageService.saveChatSessions([initial]);
          await StorageService.saveActiveChatSessionId(initial.id);
        }
      } finally {
        if (mounted) setSessionsLoaded(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const activeSession = useMemo(() => {
    return sessions.find((s) => s.id === activeSessionId) || sessions[0];
  }, [sessions, activeSessionId]);

  const messages = activeSession?.messages || [];

  const quotaSnapshot = useMemo(
    () => computeStorageQuotaUsage(generatedImages, userPlanTier),
    [generatedImages, userPlanTier]
  );

  const imageMap = useMemo(() => {
    const map: Record<string, GeneratedStemImage> = {};
    for (const img of generatedImages) map[img.id] = img;
    return map;
  }, [generatedImages]);

  const persistSessionUpdate = async (
    targetId: string,
    updater: (prevSession: ChatSession) => ChatSession
  ) => {
    const base = sessionsRef.current;
    let updatedTarget: ChatSession | null = null;
    const next = base.map((s) => {
      if (s.id !== targetId) return s;
      updatedTarget = updater(s);
      return updatedTarget;
    });
    if (!updatedTarget) return;
    sessionsRef.current = next;
    setSessions(next);
    await StorageService.upsertChatSession(updatedTarget);
  };

  const handleStartNewChat = async () => {
    HapticManager.triggerSelection();
    const fresh = createFreshSession(`Study Chat ${sessionsRef.current.length + 1}`);
    fresh.webSearchEnabled = webSearchEnabled;
    const next = [fresh, ...sessionsRef.current];
    sessionsRef.current = next;
    setSessions(next);
    setActiveSessionId(fresh.id);
    setStagedAttachments([]);
    setAttachmentError(null);
    setEditingMessageId(null);
    setHistoryVisible(false);
    await StorageService.upsertChatSession(fresh);
    await StorageService.saveActiveChatSessionId(fresh.id);
  };

  const handleSwitchSession = async (session: ChatSession) => {
    HapticManager.triggerSelection();
    setActiveSessionId(session.id);
    setWebSearchEnabled(Boolean(session.webSearchEnabled));
    setEditingMessageId(null);
    setHistoryVisible(false);
    await StorageService.saveActiveChatSessionId(session.id);
  };

  const handleDeleteSession = async (sessionId: string) => {
    const remaining = await StorageService.deleteChatSession(sessionId);
    if (remaining.length === 0) {
      const fresh = createFreshSession('Study Session #1');
      sessionsRef.current = [fresh];
      setSessions([fresh]);
      setActiveSessionId(fresh.id);
      await StorageService.saveChatSessions([fresh]);
      await StorageService.saveActiveChatSessionId(fresh.id);
    } else {
      sessionsRef.current = remaining;
      setSessions(remaining);
      if (activeSessionId === sessionId) {
        setActiveSessionId(remaining[0].id);
        setWebSearchEnabled(Boolean(remaining[0].webSearchEnabled));
        await StorageService.saveActiveChatSessionId(remaining[0].id);
      }
    }
  };

  const handleCommitRename = async (sessionId: string) => {
    const clean = renameText.trim();
    if (!clean) {
      setRenamingSessionId(null);
      return;
    }
    await persistSessionUpdate(sessionId, (s) => ({
      ...s,
      title: clean.slice(0, 56),
      updatedAt: new Date().toISOString(),
    }));
    setRenamingSessionId(null);
  };

  const quickPrompts = [
    'Compare SN1 vs SN2 Mechanism',
    'Explain Photoelectric Effect',
    'Integration by Parts Formula',
    'Prove Moment of Inertia of Disc',
    'Plot Projectile Motion Diagram',
  ];

  const selectReasoningMode = async (nextMode: ReasoningPower) => {
    HapticManager.triggerSelection();
    setReasoningMode(nextMode);
    await StorageService.saveSettings({ aiReasoningPower: nextMode });
  };

  const toggleWebSearch = async () => {
    const nextVal = !webSearchEnabled;
    HapticManager.triggerSelection();
    setWebSearchEnabled(nextVal);
    if (activeSession) {
      await persistSessionUpdate(activeSession.id, (s) => ({
        ...s,
        webSearchEnabled: nextVal,
      }));
    }
  };

  const handlePickImages = async () => {
    if (attachmentBusy || isLoading) return;
    setAttachmentError(null);
    setAttachmentBusy(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        base64: true,
        quality: 0.85,
        allowsMultipleSelection: true,
      });
      if (result.canceled || !result.assets || result.assets.length === 0) return;

      const prepared = await Promise.all(
        result.assets.slice(0, 4).map((asset, idx) =>
          prepareAIUploadedAttachment({
            name: asset.fileName || `image_${Date.now()}_${idx}.jpg`,
            mimeType: asset.mimeType || 'image/jpeg',
            uri: asset.uri,
            base64: asset.base64 || undefined,
            sizeBytes: asset.fileSize,
            webFile: asset.file,
          })
        )
      );
      setStagedAttachments((prev) => [...prev, ...prepared].slice(0, 5));
      HapticManager.triggerSelection();
    } catch (err) {
      setAttachmentError(
        buildApiErrorInfo('attachment', err, { canRetry: true, canUseOffline: false })
      );
    } finally {
      setAttachmentBusy(false);
    }
  };

  const handlePickDocuments = async () => {
    if (attachmentBusy || isLoading) return;
    setAttachmentError(null);
    setAttachmentBusy(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: true,
        type: '*/*',
      });
      if (result.canceled || !result.assets || result.assets.length === 0) return;

      const prepared = await Promise.all(
        result.assets.slice(0, 4).map((asset) =>
          prepareAIUploadedAttachment({
            name: asset.name,
            mimeType: asset.mimeType,
            uri: asset.uri,
            base64: asset.base64,
            sizeBytes: asset.size,
            webFile: asset.file,
          })
        )
      );
      setStagedAttachments((prev) => [...prev, ...prepared].slice(0, 5));
      HapticManager.triggerSelection();
    } catch (err) {
      setAttachmentError(
        buildApiErrorInfo('attachment', err, { canRetry: true, canUseOffline: false })
      );
    } finally {
      setAttachmentBusy(false);
    }
  };

  const removeStagedAttachment = (id: string) => {
    HapticManager.triggerSelection();
    setStagedAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Run a STEM Visual Generation request and store to Image Library under active quota
  const handleGenerateVisualRequest = async (
    rawPrompt: string,
    targetSessionId: string,
    skipUserBubble = false,
    replaceAssistantMsgId?: string
  ) => {
    const cleanPrompt =
      rawPrompt.trim() || 'Projectile motion parabolic velocity diagram';
    if (!skipUserBubble) {
      const userMsg: ChatMessage = {
        id: `msg_u_${Date.now()}`,
        sender: 'user',
        text: `[Generate Visual] ${cleanPrompt}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        promptQuery: cleanPrompt,
      };
      await persistSessionUpdate(targetSessionId, (s) => ({
        ...s,
        title:
          s.messages.length <= 1 ? cleanPrompt.slice(0, 40) : s.title,
        updatedAt: new Date().toISOString(),
        messages: [...s.messages, userMsg],
      }));
      setInputText('');
    }

    const writeAiMsg = async (nextMsg: ChatMessage) => {
      await persistSessionUpdate(targetSessionId, (s) => ({
        ...s,
        updatedAt: new Date().toISOString(),
        messages:
          replaceAssistantMsgId && s.messages.some((m) => m.id === replaceAssistantMsgId)
            ? s.messages.map((m) => (m.id === replaceAssistantMsgId ? nextMsg : m))
            : [...s.messages, nextMsg],
      }));
    };

    setIsLoading(true);
    setLoadingIsVisual(true);
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 80);

    try {
      // Pre-check quota slot count before calling generator
      const slotCheck = checkCanStoreGeneratedImage(generatedImages, userPlanTier, 4096);
      if (!slotCheck.allowed && slotCheck.errorInfo) {
        await writeAiMsg({
          id: replaceAssistantMsgId || `msg_quota_${Date.now()}`,
          sender: 'assistant',
          text:
            `### Storage Quota Reached (${quotaSnapshot.plan.label})\n\n` +
            `${slotCheck.reason}\n\nOpen your **Image Library** to delete older visuals or download backups to free space.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          promptQuery: cleanPrompt,
          errorInfo: slotCheck.errorInfo,
        });
        return;
      }

      const genRes = await GeminiAIService.generateStemVisual({
        prompt: cleanPrompt,
        preferredCategory:
          visualSubjectPref === 'auto' ? undefined : visualSubjectPref,
        bgTheme: mode === 'dark' ? 'dark' : 'light',
      });

      const sizeCheck = checkCanStoreGeneratedImage(
        generatedImages,
        userPlanTier,
        genRes.image.byteSize
      );
      if (!sizeCheck.allowed && sizeCheck.errorInfo) {
        await writeAiMsg({
          id: replaceAssistantMsgId || `msg_quota_${Date.now()}`,
          sender: 'assistant',
          text:
            `### Insufficient Visual Storage (${quotaSnapshot.plan.label})\n\n` +
            `${sizeCheck.reason}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          promptQuery: cleanPrompt,
          errorInfo: sizeCheck.errorInfo,
        });
        return;
      }

      const nextLibrary = await StorageService.saveGeneratedImage(genRes.image);
      setGeneratedImages(nextLibrary);

      await writeAiMsg({
        id: replaceAssistantMsgId || `msg_vis_${Date.now()}`,
        sender: 'assistant',
        text:
          `### ${genRes.image.title}\n\n` +
          `${genRes.image.caption || 'Saved to your STEM Image Library.'}\n\n` +
          `Saved **${formatByteSize(genRes.image.byteSize)}** under **${quotaSnapshot.plan.label}** (${nextLibrary.length}/${quotaSnapshot.maxImages} slots used).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelLabel: genRes.modelLabel,
        isFallback: genRes.isFallback,
        generatedImageId: genRes.image.id,
        promptQuery: cleanPrompt,
        errorInfo: genRes.errorInfo,
      });
    } catch (err) {
      await writeAiMsg({
        id: replaceAssistantMsgId || `msg_vis_err_${Date.now()}`,
        sender: 'assistant',
        text: 'Could not complete STEM visual generation right now.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        promptQuery: cleanPrompt,
        errorInfo: buildApiErrorInfo('gemini_image', err, {
          canRetry: true,
          canUseOffline: true,
        }),
      });
    } finally {
      setIsLoading(false);
      setLoadingIsVisual(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 120);
    }
  };

  const handleSend = async (
    textToSend?: string,
    explicitDiff?: QuestionDifficulty,
    subjectCtx?: string,
    overrideAttachments?: AIUploadedAttachment[],
    skipUserBubble = false,
    replaceAssistantMsgId?: string
  ) => {
    const targetSession = activeSession;
    if (!targetSession || isLoading) return;

    const rawQuery = (textToSend ?? inputText).trim();
    const attachmentsToSend = overrideAttachments ?? stagedAttachments;

    // Auto-detect explicit diagram/visual generation when toggled OR when user asks to plot/draw visual cleanly
    if (
      visualGenMode &&
      attachmentsToSend.length === 0 &&
      !skipUserBubble
    ) {
      await handleGenerateVisualRequest(rawQuery, targetSession.id);
      return;
    }

    const query =
      rawQuery ||
      (attachmentsToSend.length > 0
        ? `Analyze the uploaded ${attachmentsToSend.map((a) => a.name).join(', ')}, generate a clear structured summary, and provide step-by-step solutions for any problems inside.`
        : '');
    if (!query) return;

    const effectiveDifficulty =
      explicitDiff ?? (difficultyOverride === 'auto' ? undefined : difficultyOverride);
    const previewResolved = resolveModelForPrompt(reasoningMode, query, effectiveDifficulty);

    const historyContext = targetSession.messages
      .filter((m) => m.id !== 'msg_welcome' && !m.id.startsWith('msg_welcome'))
      .slice(-6)
      .map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('model' as const),
        text: m.text,
      }));

    if (!skipUserBubble) {
      const userMsg: ChatMessage = {
        id: `msg_u_${Date.now()}`,
        sender: 'user',
        text: query,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        promptQuery: query,
        attachments: attachmentsToSend.length > 0 ? attachmentsToSend : undefined,
      };
      await persistSessionUpdate(targetSession.id, (s) => ({
        ...s,
        title: s.messages.length <= 1 ? query.slice(0, 42) : s.title,
        updatedAt: new Date().toISOString(),
        messages: [...s.messages, userMsg],
      }));
      if (!textToSend) setInputText('');
      if (!overrideAttachments) setStagedAttachments([]);
    }

    setAttachmentError(null);
    setIsLoading(true);
    setLoadingIsVisual(false);

    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 80);

    try {
      const profile = await StorageService.getUserProfile();
      const response: AIResponse = await GeminiAIService.askTutor(query, {
        subject: subjectCtx || 'STEM',
        grade: profile.classGrade || 'Class 12',
        country: profile.country,
        board: profile.board,
        language: profile.language,
        learningMode: profile.preferredMode,
        reasoningMode,
        difficulty: previewResolved.detectedDifficulty,
        attachments: attachmentsToSend,
        webSearchEnabled,
        history: historyContext,
      });

      const aiMsgId = replaceAssistantMsgId || `msg_ai_${Date.now()}`;
      const aiMsg: ChatMessage = {
        id: aiMsgId,
        sender: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelId: response.modelId,
        modelLabel: response.modelLabel,
        reasoningPower: response.reasoningMode,
        detectedDifficulty: response.detectedDifficulty,
        isFallback: response.isFallback,
        steps: response.steps,
        tips: response.tips,
        citations: response.citations,
        webSearchUsed: response.webSearchUsed,
        promptQuery: query,
        errorInfo: response.errorInfo,
      };

      await persistSessionUpdate(targetSession.id, (s) => ({
        ...s,
        updatedAt: new Date().toISOString(),
        messages:
          replaceAssistantMsgId && s.messages.some((m) => m.id === replaceAssistantMsgId)
            ? s.messages.map((m) => (m.id === replaceAssistantMsgId ? aiMsg : m))
            : [...s.messages, aiMsg],
      }));
      if (replaceAssistantMsgId) {
        setDismissedErrors((prev) => ({ ...prev, [replaceAssistantMsgId]: false }));
      }
      if (aiMsg.steps?.length || aiMsg.tips?.length) {
        setExpandedStepsByMsg((prev) => ({ ...prev, [aiMsgId]: true }));
      }
    } catch (err) {
      const errMsgId = replaceAssistantMsgId || `msg_err_${Date.now()}`;
      const errMsg: ChatMessage = {
        id: errMsgId,
        sender: 'assistant',
        text: 'Sorry, I encountered a network or service issue while answering your request.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        promptQuery: query,
        errorInfo: buildApiErrorInfo('gemini', err, {
          canRetry: true,
          canUseOffline: true,
        }),
      };
      await persistSessionUpdate(targetSession.id, (s) => ({
        ...s,
        updatedAt: new Date().toISOString(),
        messages:
          replaceAssistantMsgId && s.messages.some((m) => m.id === replaceAssistantMsgId)
            ? s.messages.map((m) => (m.id === replaceAssistantMsgId ? errMsg : m))
            : [...s.messages, errMsg],
      }));
    } finally {
      setIsLoading(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 120);
    }
  };

  // Auto-submit if opened via "Ask AI" button on a test question
  useEffect(() => {
    if (
      sessionsLoaded &&
      prefillPrompt &&
      prefillPrompt.nonce !== handledPrefillNonce.current
    ) {
      handledPrefillNonce.current = prefillPrompt.nonce;
      setVisualGenMode(false);
      setDifficultyOverride(prefillPrompt.difficulty);
      void handleSend(prefillPrompt.prompt, prefillPrompt.difficulty, prefillPrompt.subject);
    }
  }, [prefillPrompt, sessionsLoaded]);

  // Regenerate a given assistant message using its originating user prompt & attachments
  const handleRegenerate = async (assistantMsgId: string) => {
    if (!activeSession || isLoading) return;
    const idx = messages.findIndex((m) => m.id === assistantMsgId);
    if (idx === -1) return;
    const targetMsg = messages[idx];

    // Look backwards for preceding user message
    let originatingUser: ChatMessage | undefined;
    for (let i = idx - 1; i >= 0; i--) {
      if (messages[i].sender === 'user') {
        originatingUser = messages[i];
        break;
      }
    }

    const queryText =
      targetMsg.promptQuery ||
      originatingUser?.promptQuery ||
      originatingUser?.text ||
      'Explain clearly step-by-step';

    if (targetMsg.generatedImageId || originatingUser?.text.startsWith('[Generate Visual]')) {
      await handleGenerateVisualRequest(
        queryText.replace(/^\[Generate Visual\]\s*/i, ''),
        activeSession.id,
        true,
        assistantMsgId
      );
      return;
    }

    await handleSend(
      queryText,
      targetMsg.detectedDifficulty,
      targetMsg.subjectContext || 'STEM',
      originatingUser?.attachments,
      true,
      assistantMsgId
    );
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!activeSession) return;
    HapticManager.triggerSelection();
    await persistSessionUpdate(activeSession.id, (s) => ({
      ...s,
      updatedAt: new Date().toISOString(),
      messages: s.messages.filter((m) => m.id !== msgId),
    }));
  };

  const handleSaveEditedUserMessage = async (msgId: string, reRun: boolean) => {
    if (!activeSession) return;
    const trimmed = editingMessageText.trim();
    if (!trimmed) {
      setEditingMessageId(null);
      return;
    }
    const existingMsg = messages.find((m) => m.id === msgId);
    await persistSessionUpdate(activeSession.id, (s) => ({
      ...s,
      updatedAt: new Date().toISOString(),
      messages: s.messages.map((m) =>
        m.id === msgId ? { ...m, text: trimmed, promptQuery: trimmed } : m
      ),
    }));
    setEditingMessageId(null);
    if (reRun) {
      await handleSend(trimmed, undefined, undefined, existingMsg?.attachments, true);
    }
  };

  const handleCopyMessage = async (msg: ChatMessage) => {
    const copied = await copyTextSafely(msg.text);
    if (copied) {
      setCopiedMessageId(msg.id);
      setTimeout(() => {
        setCopiedMessageId((prev) => (prev === msg.id ? null : prev));
      }, 2000);
    } else if (Platform.OS !== 'web') {
      try {
        await Share.share({ message: msg.text, title: 'Study Labs AI Tutor Response' });
      } catch {
        // User dismissed share
      }
    }
  };

  const handleThumbsUp = async (msg: ChatMessage) => {
    if (!activeSession) return;
    HapticManager.triggerSelection();
    const isAlreadyUp = msg.feedback?.rating === 'up';
    const nextFeedback: MessageFeedback | undefined = isAlreadyUp
      ? undefined
      : { rating: 'up', updatedAt: new Date().toISOString() };
    await persistSessionUpdate(activeSession.id, (s) => ({
      ...s,
      messages: s.messages.map((m) =>
        m.id === msg.id ? { ...m, feedback: nextFeedback } : m
      ),
    }));
  };

  const handleOpenThumbsDownModal = (msg: ChatMessage) => {
    setFeedbackTargetMsg(msg);
    setFeedbackReason(msg.feedback?.reason || FEEDBACK_REASONS[0]);
    setFeedbackComment(msg.feedback?.comment || '');
  };

  const handleSubmitNegativeFeedback = async () => {
    if (!activeSession || !feedbackTargetMsg) return;
    const feedback: MessageFeedback = {
      rating: 'down',
      reason: feedbackReason,
      comment: feedbackComment.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };
    await persistSessionUpdate(activeSession.id, (s) => ({
      ...s,
      messages: s.messages.map((m) =>
        m.id === feedbackTargetMsg.id ? { ...m, feedback } : m
      ),
    }));
    setFeedbackTargetMsg(null);
  };

  // Save edits to either staged or already-sent attachment (and optionally re-ask AI!)
  const handleSaveAttachmentEdit = async (
    updated: AIUploadedAttachment,
    messageId?: string
  ) => {
    if (!messageId) {
      setStagedAttachments((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a))
      );
      return;
    }
    if (!activeSession) return;
    await persistSessionUpdate(activeSession.id, (s) => ({
      ...s,
      updatedAt: new Date().toISOString(),
      messages: s.messages.map((m) => {
        if (m.id !== messageId || !m.attachments) return m;
        return {
          ...m,
          attachments: m.attachments.map((a) => (a.id === updated.id ? updated : a)),
        };
      }),
    }));
  };

  const handleReaskWithEditedAttachment = async (
    updated: AIUploadedAttachment,
    messageId?: string
  ) => {
    await handleSaveAttachmentEdit(updated, messageId);
    const noteLine = updated.summaryHint ? ` Focus: ${updated.summaryHint}.` : '';
    const prompt = `Re-analyze updated attachment "${updated.name}" incorporating my edits.${noteLine}`;
    await handleSend(prompt, undefined, 'STEM', [updated], false);
  };

  const activePreview = resolveModelForPrompt(
    reasoningMode,
    inputText.trim() || 'Explain concept',
    difficultyOverride === 'auto' ? undefined : difficultyOverride
  );

  const filteredSessions = useMemo(() => {
    const q = historySearch.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.messages.some((m) => m.text.toLowerCase().includes(q))
    );
  }, [sessions, historySearch]);

  const openCitationUrl = (url: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    void Linking.openURL(url);
  };

  const renderAttachmentIcon = (kind: AIAttachmentKind, colorHex: string) => {
    if (kind === 'image') return <ImageIcon size={13} color={colorHex} />;
    if (kind === 'ppt') return <Presentation size={13} color={colorHex} />;
    return <FileText size={13} color={colorHex} />;
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      {/* Header Banner with History, Image Library & New Chat */}
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
            <Sparkles size={19} color={colors.primary} />
          </View>
          <View style={{ minWidth: 0, flexShrink: 1 }}>
            <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
              AI Master Tutor
            </Text>
            <Text
              style={[
                styles.headerStatus,
                { color: GeminiAIService.hasApiKey ? colors.success : colors.warning },
              ]}
              numberOfLines={1}
            >
              ● {GeminiAIService.hasApiKey ? 'Gemini Live Connected' : 'Offline STEM Solver'}
              {webSearchEnabled ? ' · Web Search' : ''}
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setHistoryVisible(true)}
            style={[
              styles.headerToolBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            accessibilityLabel="Open chat history"
          >
            <History size={14} color={colors.text} />
            <Text style={[styles.headerToolText, { color: colors.text }]}>
              {sessions.length}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => {
              setLibraryEditId(null);
              setLibraryVisible(true);
            }}
            style={[
              styles.headerToolBtn,
              { backgroundColor: colors.surface, borderColor: colors.primary },
            ]}
            accessibilityLabel="Open AI image library"
          >
            <ImageIcon size={14} color={colors.primary} />
            <Text style={[styles.headerToolText, { color: colors.primary }]}>
              {generatedImages.length}/{quotaSnapshot.maxImages}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => void handleStartNewChat()}
            style={[
              styles.headerIconBtn,
              { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
            accessibilityLabel="Start new chat"
          >
            <Plus size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Model Reasoning Power Selector Bar */}
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
                onPress={() => void selectReasoningMode(opt.mode)}
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

        <View style={styles.routingSubRow}>
          <View style={styles.routingMetaFlex}>
            <Text style={[styles.routingHintText, { color: colors.textSecondary, flex: 1 }]} numberOfLines={1}>
              {reasoningMode === 'auto'
                ? inputText.trim()
                  ? `Auto → ${activePreview.shortLabel} (${activePreview.detectedDifficulty})`
                  : 'Auto: Easy → Lite · Med → Flash · Hard → Pro'
                : REASONING_POWER_OPTIONS.find((o) => o.mode === reasoningMode)?.description}
            </Text>
            <Badge label={activePreview.shortLabel.toUpperCase()} variant="primary" size="sm" />
          </View>

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
                  if (p.toLowerCase().includes('plot') || p.toLowerCase().includes('diagram')) {
                    if (activeSession) {
                      void handleGenerateVisualRequest(p, activeSession.id);
                    }
                  } else {
                    void handleSend(p);
                  }
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

        {messages.map((m, msgIndex) => {
          const isUser = m.sender === 'user';
          const isWelcome = m.id.startsWith('msg_welcome');
          const userNeedsRichWidth = isUser && hasRichMathOrMarkdown(m.text);
          const linkedImage = m.generatedImageId ? imageMap[m.generatedImageId] : undefined;
          const isLatestAi = !isUser && msgIndex === messages.length - 1;
          const showSteps = Boolean(
            (m.steps && m.steps.length > 0) || (m.tips && m.tips.length > 0)
          );
          const stepsExpanded = expandedStepsByMsg[m.id] ?? isLatestAi;

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
                {/* Sent Attachments (Tappable to Preview & Edit AFTER Uploading!) */}
                {m.attachments && m.attachments.length > 0 && (
                  <View style={styles.msgAttList}>
                    {m.attachments.map((att) => {
                      const thumbUri =
                        att.kind === 'image'
                          ? att.uri ||
                            (att.base64
                              ? `data:${att.mimeType || 'image/jpeg'};base64,${att.base64}`
                              : undefined)
                          : undefined;
                      return (
                        <TouchableOpacity
                          key={att.id}
                          activeOpacity={0.78}
                          onPress={() =>
                            setPreviewTarget({ attachment: att, messageId: m.id })
                          }
                          style={[
                            styles.msgAttCard,
                            {
                              backgroundColor: isUser
                                ? 'rgba(255,255,255,0.18)'
                                : colors.surface,
                              borderColor: isUser
                                ? 'rgba(255,255,255,0.4)'
                                : colors.border,
                            },
                          ]}
                        >
                          {thumbUri ? (
                            <Image
                              source={{ uri: thumbUri }}
                              style={[
                                styles.msgAttThumb,
                                att.rotationDeg
                                  ? { transform: [{ rotate: `${att.rotationDeg}deg` }] }
                                  : undefined,
                              ]}
                            />
                          ) : (
                            <View
                              style={[
                                styles.msgAttIconBox,
                                {
                                  backgroundColor: isUser
                                    ? 'rgba(0,0,0,0.2)'
                                    : colors.primaryLight,
                                },
                              ]}
                            >
                              {renderAttachmentIcon(
                                att.kind,
                                isUser ? '#FFFFFF' : colors.primary
                              )}
                            </View>
                          )}
                          <View style={{ flex: 1, minWidth: 0 }}>
                            <Text
                              style={[
                                styles.msgAttName,
                                { color: isUser ? '#FFFFFF' : colors.text },
                              ]}
                              numberOfLines={1}
                            >
                              {att.name}
                            </Text>
                            <Text
                              style={{
                                fontSize: 10,
                                color: isUser ? '#FFEDD5' : colors.textSecondary,
                              }}
                              numberOfLines={1}
                            >
                              {att.edited ? 'Edited · ' : ''}
                              {att.summaryHint || 'Tap to preview / edit'}
                            </Text>
                          </View>
                          <Edit3
                            size={12}
                            color={isUser ? '#FFFFFF' : colors.primary}
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {/* Editable inline prompt if editing this user message */}
                {isUser && editingMessageId === m.id ? (
                  <View style={{ gap: 8 }}>
                    <TextInput
                      multiline
                      value={editingMessageText}
                      onChangeText={setEditingMessageText}
                      style={[
                        styles.inlineEditInput,
                        { color: colors.text, backgroundColor: colors.card, borderColor: '#FFFFFF' },
                      ]}
                    />
                    <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'flex-end' }}>
                      <TouchableOpacity
                        onPress={() => setEditingMessageId(null)}
                        style={[styles.inlineEditBtn, { backgroundColor: 'rgba(0,0,0,0.25)' }]}
                      >
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#FFFFFF' }}>
                          Cancel
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => void handleSaveEditedUserMessage(m.id, true)}
                        style={[styles.inlineEditBtn, { backgroundColor: '#FFFFFF' }]}
                      >
                        <Text style={{ fontSize: 11, fontWeight: '800', color: colors.primary }}>
                          Save & Re-Ask
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={{ minWidth: 0, flexShrink: 1 }}>
                    <RichMathText
                      content={m.text}
                      fontSize={14}
                      lineHeight={21}
                      color={isUser ? '#FFFFFF' : colors.text}
                      accentColor={isUser ? '#FFFFFF' : colors.primary}
                      nonInteractive={false}
                      allowPanModal={!isUser && !isWelcome}
                      panTitle={
                        m.promptQuery
                          ? `AI Response · ${m.promptQuery.slice(0, 30)}`
                          : 'AI Tutor Solution'
                      }
                    />
                  </View>
                )}

                {/* Linked Generated STEM Image inside Assistant Message */}
                {!isUser && m.generatedImageId && (
                  <View style={{ marginTop: 10, gap: 7 }}>
                    {linkedImage ? (
                      <>
                        <StemVisualPreview item={linkedImage} height={185} />
                        <View style={styles.visualCardActions}>
                          <TouchableOpacity
                            onPress={() => {
                              setLibraryEditId(linkedImage.id);
                              setLibraryVisible(true);
                            }}
                            style={[
                              styles.visualActionPill,
                              { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                            ]}
                          >
                            <Edit3 size={12} color={colors.primary} />
                            <Text style={{ fontSize: 11, fontWeight: '800', color: colors.primary }}>
                              Edit in Library
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => {
                              setLibraryEditId(null);
                              setLibraryVisible(true);
                            }}
                            style={[
                              styles.visualActionPill,
                              { backgroundColor: colors.surface, borderColor: colors.border },
                            ]}
                          >
                            <ImageIcon size={12} color={colors.text} />
                            <Text style={{ fontSize: 11, fontWeight: '700', color: colors.text }}>
                              Open Library ({generatedImages.length})
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    ) : (
                      <Text style={{ fontSize: 11.5, fontStyle: 'italic', color: colors.textSecondary }}>
                        This generated visual was deleted from your Image Library.
                      </Text>
                    )}
                  </View>
                )}

                {/* Web Search Citations */}
                {!isUser && m.citations && m.citations.length > 0 && (
                  <View style={[styles.citationsBox, { borderTopColor: colors.borderSubtle }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <Globe size={12} color={colors.info} />
                      <Text style={{ fontSize: 11, fontWeight: '800', color: colors.info }}>
                        Grounded Web Sources ({m.citations.length})
                      </Text>
                    </View>
                    <View style={styles.citationsRow}>
                      {m.citations.map((cit, cIdx) => (
                        <TouchableOpacity
                          key={`${cit.uri}_${cIdx}`}
                          onPress={() => openCitationUrl(cit.uri)}
                          style={[
                            styles.citationChip,
                            { backgroundColor: colors.surface, borderColor: colors.border },
                          ]}
                        >
                          <Text
                            style={{ fontSize: 10.5, fontWeight: '700', color: colors.text, maxWidth: 180 }}
                            numberOfLines={1}
                          >
                            {cit.title}
                          </Text>
                          <ExternalLink size={10} color={colors.info} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* Steps & Exam Tips Section with Pannable LaTeX */}
                {!isUser && showSteps && (
                  <View style={[styles.stepsSection, { borderTopColor: colors.borderSubtle }]}>
                    <TouchableOpacity
                      onPress={() =>
                        setExpandedStepsByMsg((prev) => ({
                          ...prev,
                          [m.id]: !stepsExpanded,
                        }))
                      }
                      style={styles.stepsToggleHdr}
                    >
                      <Lightbulb size={13} color={colors.primary} />
                      <Text style={{ fontSize: 11.5, fontWeight: '800', color: colors.primary, flex: 1 }}>
                        Strategy & High-Yield Tips
                      </Text>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textSecondary }}>
                        {stepsExpanded ? 'Hide' : 'Show'}
                      </Text>
                    </TouchableOpacity>

                    {stepsExpanded && (
                      <View style={{ gap: 8, marginTop: 6 }}>
                        {m.steps?.map((step, sIdx) => (
                          <View key={sIdx} style={styles.stepRow}>
                            <View style={[styles.stepNum, { backgroundColor: colors.primary }]}>
                              <Text style={styles.stepNumText}>{sIdx + 1}</Text>
                            </View>
                            <View style={{ flex: 1, minWidth: 0 }}>
                              <RichMathText
                                content={step}
                                fontSize={13}
                                color={colors.text}
                                accentColor={colors.primary}
                                compact
                                allowPanModal
                                panTitle={`Step ${sIdx + 1}`}
                              />
                            </View>
                          </View>
                        ))}
                        {m.tips?.map((tip, tIdx) => (
                          <View
                            key={tIdx}
                            style={[
                              styles.tipBox,
                              {
                                backgroundColor: mode === 'dark' ? '#2A1D08' : '#FEF3C7',
                                borderColor: colors.warning,
                              },
                            ]}
                          >
                            <CheckCircle size={13} color={colors.warning} style={{ marginTop: 2 }} />
                            <View style={{ flex: 1, minWidth: 0 }}>
                              <RichMathText
                                content={tip}
                                fontSize={12.5}
                                color={colors.text}
                                accentColor={colors.warning}
                                compact
                                allowPanModal
                                panTitle="High-Yield Exam Tip"
                              />
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}

                {/* Informative API Error Banner inside Assistant Bubble */}
                {!isUser && m.errorInfo && !dismissedErrors[m.id] && (
                  <View style={{ marginTop: 8 }}>
                    <ApiErrorCard
                      compact
                      error={m.errorInfo}
                      onRetry={() => void handleRegenerate(m.id)}
                      onUseOffline={() =>
                        setDismissedErrors((prev) => ({ ...prev, [m.id]: true }))
                      }
                      onDismiss={() =>
                        setDismissedErrors((prev) => ({ ...prev, [m.id]: true }))
                      }
                    />
                  </View>
                )}

                {/* Message Footer Metadata */}
                <View style={styles.msgFooterRow}>
                  {!isUser && m.modelLabel && (
                    <Text style={[styles.modelTagText, { color: colors.primary }]}>
                      {m.modelLabel}
                      {m.detectedDifficulty ? ` · ${m.detectedDifficulty}` : ''}
                      {m.webSearchUsed ? ' · Web' : ''}
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

                {/* User Bubble Actions: Edit & Delete */}
                {isUser && editingMessageId !== m.id && (
                  <View style={styles.userMsgActions}>
                    <TouchableOpacity
                      onPress={() => {
                        setEditingMessageId(m.id);
                        setEditingMessageText(m.text);
                      }}
                      style={styles.userMsgBtn}
                    >
                      <Edit3 size={11} color="#FFFFFF" />
                      <Text style={styles.userMsgBtnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => void handleDeleteMessage(m.id)}
                      style={styles.userMsgBtn}
                    >
                      <Trash2 size={11} color="#FFFFFF" />
                      <Text style={styles.userMsgBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Assistant Action Toolbar: Thumbs Up, Thumbs Down + Feedback, Regenerate, Copy, Delete */}
                {!isUser && (
                  <View style={[styles.aiActionsBar, { borderTopColor: colors.borderSubtle }]}>
                    <TouchableOpacity
                      onPress={() => void handleThumbsUp(m)}
                      style={[
                        styles.aiActionChip,
                        {
                          backgroundColor:
                            m.feedback?.rating === 'up' ? colors.successBg : colors.surface,
                          borderColor:
                            m.feedback?.rating === 'up' ? colors.success : colors.borderSubtle,
                        },
                      ]}
                      accessibilityLabel="Good response"
                    >
                      <ThumbsUp
                        size={12}
                        color={m.feedback?.rating === 'up' ? colors.success : colors.textSecondary}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleOpenThumbsDownModal(m)}
                      style={[
                        styles.aiActionChip,
                        {
                          backgroundColor:
                            m.feedback?.rating === 'down' ? colors.errorBg : colors.surface,
                          borderColor:
                            m.feedback?.rating === 'down' ? colors.error : colors.borderSubtle,
                        },
                      ]}
                      accessibilityLabel="Bad response and give feedback"
                    >
                      <ThumbsDown
                        size={12}
                        color={m.feedback?.rating === 'down' ? colors.error : colors.textSecondary}
                      />
                      {m.feedback?.rating === 'down' && (
                        <Text style={{ fontSize: 10, fontWeight: '700', color: colors.error }}>
                          Feedback
                        </Text>
                      )}
                    </TouchableOpacity>

                    {!isWelcome && (
                      <TouchableOpacity
                        disabled={isLoading}
                        onPress={() => void handleRegenerate(m.id)}
                        style={[
                          styles.aiActionChip,
                          { backgroundColor: colors.surface, borderColor: colors.borderSubtle },
                        ]}
                        accessibilityLabel="Regenerate response"
                      >
                        <RefreshCw size={12} color={colors.primary} />
                        <Text style={{ fontSize: 10.5, fontWeight: '700', color: colors.text }}>
                          Regen
                        </Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      onPress={() => void handleCopyMessage(m)}
                      style={[
                        styles.aiActionChip,
                        { backgroundColor: colors.surface, borderColor: colors.borderSubtle },
                      ]}
                      accessibilityLabel="Copy response"
                    >
                      {copiedMessageId === m.id ? (
                        <Check size={12} color={colors.success} />
                      ) : (
                        <Copy size={12} color={colors.textSecondary} />
                      )}
                      <Text
                        style={{
                          fontSize: 10.5,
                          fontWeight: '700',
                          color: copiedMessageId === m.id ? colors.success : colors.textSecondary,
                        }}
                      >
                        {copiedMessageId === m.id ? 'Copied' : 'Copy'}
                      </Text>
                    </TouchableOpacity>

                    {!isWelcome && (
                      <TouchableOpacity
                        onPress={() => void handleDeleteMessage(m.id)}
                        style={[
                          styles.aiActionChip,
                          {
                            marginLeft: 'auto',
                            backgroundColor: colors.surface,
                            borderColor: colors.borderSubtle,
                          },
                        ]}
                        accessibilityLabel="Delete response"
                      >
                        <Trash2 size={12} color={colors.error} />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            </View>
          );
        })}

        {isLoading && (
          <ThinkingBubble
            modelLabel={activePreview.shortLabel}
            difficulty={activePreview.detectedDifficulty}
            reducedMotion={reducedMotion}
            isVisualGen={loadingIsVisual}
          />
        )}
      </ScrollView>

      {/* Multimodal Upload, Web Search & Visual Generation Dock */}
      <View
        style={[
          styles.composerDock,
          { backgroundColor: colors.card, borderTopColor: colors.border },
        ]}
      >
        {attachmentError && (
          <ApiErrorCard
            compact
            error={attachmentError}
            onRetry={handlePickDocuments}
            onDismiss={() => setAttachmentError(null)}
          />
        )}

        {/* Staged Attachments (Tap to Preview & Edit BEFORE sending!) */}
        {stagedAttachments.length > 0 && (
          <View style={styles.stagedSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stagedRow}>
              {stagedAttachments.map((att) => (
                <TouchableOpacity
                  key={att.id}
                  activeOpacity={0.8}
                  onPress={() => setPreviewTarget({ attachment: att })}
                  style={[
                    styles.stagedChip,
                    { backgroundColor: colors.surface, borderColor: colors.primary },
                  ]}
                >
                  {att.kind === 'image' && (att.uri || att.base64) ? (
                    <Image
                      source={{
                        uri:
                          att.uri ||
                          `data:${att.mimeType || 'image/jpeg'};base64,${att.base64}`,
                      }}
                      style={[
                        styles.stagedThumb,
                        att.rotationDeg
                          ? { transform: [{ rotate: `${att.rotationDeg}deg` }] }
                          : undefined,
                      ]}
                    />
                  ) : att.kind === 'ppt' ? (
                    <Presentation size={16} color={colors.warning} />
                  ) : (
                    <FileText size={16} color={colors.primary} />
                  )}
                  <View style={{ maxWidth: 145, minWidth: 0 }}>
                    <Text style={[styles.stagedName, { color: colors.text }]} numberOfLines={1}>
                      {att.name}
                    </Text>
                    <Text style={[styles.stagedSub, { color: colors.primary }]} numberOfLines={1}>
                      {att.edited ? 'Edited · ' : ''}
                      {att.summaryHint || 'Tap to preview / edit'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeStagedAttachment(att.id)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <X size={14} color={colors.textSecondary} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.fileActionsRow}>
              {[
                { label: 'Summarize', prompt: 'Generate a clear structured summary of these uploaded materials with key takeaways.' },
                { label: 'Solve Questions', prompt: 'Read all problems/questions in the attached file(s) and solve them step-by-step.' },
                { label: 'Extract Formulas', prompt: 'Extract every important formula, definition, and theorem from the attached file(s).' },
              ].map((act) => (
                <TouchableOpacity
                  key={act.label}
                  disabled={isLoading}
                  onPress={() => void handleSend(act.prompt)}
                  style={[styles.fileQuickAction, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: colors.primary }}>
                    {act.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Tool Controls Bar: Attachments + Web Search + Gen STEM Visual */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.attachBar}
        >
          <TouchableOpacity
            activeOpacity={0.75}
            disabled={attachmentBusy || isLoading}
            onPress={() => void handlePickImages()}
            style={[
              styles.attachBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <ImageIcon size={13.5} color={colors.primary} />
            <Text style={[styles.attachBtnText, { color: colors.text }]}>+ Image</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            disabled={attachmentBusy || isLoading}
            onPress={() => void handlePickDocuments()}
            style={[
              styles.attachBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Paperclip size={13.5} color={colors.primary} />
            <Text style={[styles.attachBtnText, { color: colors.text }]}>
              {attachmentBusy ? 'Reading...' : '+ PDF/PPT/TXT'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => void toggleWebSearch()}
            style={[
              styles.attachBtn,
              {
                backgroundColor: webSearchEnabled ? colors.info : colors.surface,
                borderColor: webSearchEnabled ? colors.info : colors.border,
              },
            ]}
          >
            <Globe size={13.5} color={webSearchEnabled ? '#FFFFFF' : colors.info} />
            <Text
              style={[
                styles.attachBtnText,
                { color: webSearchEnabled ? '#FFFFFF' : colors.text },
              ]}
            >
              Web {webSearchEnabled ? 'On' : 'Search'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => {
              HapticManager.triggerSelection();
              setVisualGenMode((v) => !v);
            }}
            style={[
              styles.attachBtn,
              {
                backgroundColor: visualGenMode ? colors.primary : colors.surface,
                borderColor: visualGenMode ? colors.primary : colors.border,
              },
            ]}
          >
            <Wand2 size={13.5} color={visualGenMode ? '#FFFFFF' : colors.primary} />
            <Text
              style={[
                styles.attachBtnText,
                { color: visualGenMode ? '#FFFFFF' : colors.text },
              ]}
            >
              Gen Visual
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Visual Generation Subject Strip when Gen Visual Mode is active */}
        {visualGenMode && (
          <View style={styles.visualSubRow}>
            <Text style={{ fontSize: 10.5, fontWeight: '700', color: colors.primary }}>
              Diagram Mode ({quotaSnapshot.plan.label}):
            </Text>
            {(['auto', 'math', 'physics', 'chemistry'] as const).map((sub) => {
              const active = visualSubjectPref === sub;
              return (
                <TouchableOpacity
                  key={sub}
                  onPress={() => setVisualSubjectPref(sub)}
                  style={[
                    styles.visSubPill,
                    {
                      backgroundColor: active ? colors.primary : colors.surface,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '700',
                      color: active ? '#FFFFFF' : colors.textSecondary,
                    }}
                  >
                    {sub === 'auto' ? 'Auto' : sub.charAt(0).toUpperCase() + sub.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
            ]}
            placeholder={
              visualGenMode
                ? 'Describe Math graph, Physics diagram or Chemistry reaction...'
                : stagedAttachments.length > 0
                ? 'Ask about attached file(s) or tap Send...'
                : 'Ask any concept, question or formula...'
            }
            placeholderTextColor={colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => void handleSend()}
          />
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={(!inputText.trim() && stagedAttachments.length === 0) || isLoading}
            onPress={() => void handleSend()}
            style={[
              styles.sendBtn,
              {
                backgroundColor:
                  (inputText.trim() || stagedAttachments.length > 0) && !isLoading
                    ? colors.primary
                    : colors.borderSubtle,
              },
            ]}
          >
            {visualGenMode ? (
              <Wand2 size={18} color="#FFFFFF" />
            ) : (
              <Send size={18} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat History Modal */}
      <Modal
        visible={historyVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setHistoryVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.historySheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.historyHeader, { borderBottomColor: colors.borderSubtle }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <History size={18} color={colors.primary} />
                <Text style={[styles.historyTitle, { color: colors.text }]}>
                  Chat History ({sessions.length})
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Button
                  title="New Chat"
                  size="sm"
                  icon={<Plus size={14} color="#FFFFFF" />}
                  onPress={() => void handleStartNewChat()}
                />
                <TouchableOpacity onPress={() => setHistoryVisible(false)} hitSlop={8}>
                  <X size={19} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.historySearchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Search size={14} color={colors.textSecondary} />
              <TextInput
                value={historySearch}
                onChangeText={setHistorySearch}
                placeholder="Search past study threads..."
                placeholderTextColor={colors.textSecondary}
                style={[styles.historySearchInput, { color: colors.text }]}
              />
              {historySearch.length > 0 && (
                <TouchableOpacity onPress={() => setHistorySearch('')}>
                  <X size={14} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 14, gap: 8 }}
            >
              {filteredSessions.length === 0 ? (
                <EmptyResourceCard
                  title="Chat Thread Not Found"
                  message={`No conversation history matched "${historySearch}".`}
                  actionLabel="Clear Search"
                  onAction={() => setHistorySearch('')}
                />
              ) : (
                filteredSessions.map((sess) => {
                  const isCurrent = sess.id === activeSession?.id;
                  const isRenaming = renamingSessionId === sess.id;
                  const msgCount = sess.messages.filter((m) => !m.id.startsWith('msg_welcome')).length;
                  return (
                    <Card
                      key={sess.id}
                      style={[
                        styles.sessionCard,
                        {
                          borderColor: isCurrent ? colors.primary : colors.border,
                          backgroundColor: isCurrent
                            ? mode === 'dark'
                              ? '#1E293B'
                              : '#FFF7ED'
                            : colors.surface,
                        },
                      ]}
                    >
                      {isRenaming ? (
                        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                          <TextInput
                            value={renameText}
                            onChangeText={setRenameText}
                            style={[
                              styles.renameInput,
                              { color: colors.text, backgroundColor: colors.card, borderColor: colors.primary },
                            ]}
                          />
                          <TouchableOpacity
                            onPress={() => void handleCommitRename(sess.id)}
                            style={[styles.renameSaveBtn, { backgroundColor: colors.primary }]}
                          >
                            <Check size={14} color="#FFFFFF" />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View style={styles.sessionRow}>
                          <TouchableOpacity
                            style={{ flex: 1, minWidth: 0 }}
                            onPress={() => void handleSwitchSession(sess)}
                          >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <Text style={[styles.sessionTitle, { color: colors.text }]} numberOfLines={1}>
                                {sess.title}
                              </Text>
                              {isCurrent && <Badge label="ACTIVE" variant="primary" size="sm" />}
                            </View>
                            <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>
                              {msgCount} messages · {new Date(sess.updatedAt).toLocaleDateString()}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => {
                              setRenamingSessionId(sess.id);
                              setRenameText(sess.title);
                            }}
                            style={styles.sessionIconBtn}
                            accessibilityLabel="Rename chat"
                          >
                            <Edit3 size={14} color={colors.textSecondary} />
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => void handleDeleteSession(sess.id)}
                            style={styles.sessionIconBtn}
                            accessibilityLabel="Delete chat"
                          >
                            <Trash2 size={14} color={colors.error} />
                          </TouchableOpacity>
                        </View>
                      )}
                    </Card>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Negative Response Feedback Modal */}
      <Modal
        visible={feedbackTargetMsg !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setFeedbackTargetMsg(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.feedbackCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.feedbackHeader}>
              <Text style={[styles.feedbackTitle, { color: colors.text }]}>
                Report Response Issue
              </Text>
              <TouchableOpacity onPress={() => setFeedbackTargetMsg(null)}>
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
              Tell us what went wrong so Study Labs can improve accuracy & LaTeX formatting:
            </Text>

            <View style={styles.reasonChipsRow}>
              {FEEDBACK_REASONS.map((r) => {
                const active = feedbackReason === r;
                return (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setFeedbackReason(r)}
                    style={[
                      styles.reasonChip,
                      {
                        backgroundColor: active ? colors.primary : colors.surface,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 11.5,
                        fontWeight: '700',
                        color: active ? '#FFFFFF' : colors.text,
                      }}
                    >
                      {r}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TextInput
              multiline
              value={feedbackComment}
              onChangeText={setFeedbackComment}
              placeholder="Optional details (e.g. sign error in step 2, equation clipped)..."
              placeholderTextColor={colors.textSecondary}
              style={[
                styles.feedbackInput,
                { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
              ]}
            />

            <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end' }}>
              <Button
                title="Cancel"
                variant="outline"
                size="sm"
                onPress={() => setFeedbackTargetMsg(null)}
              />
              <Button
                title="Submit Feedback"
                size="sm"
                onPress={() => void handleSubmitNegativeFeedback()}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Attachment Preview & Editor Modal (Before OR After Sending) */}
      <AttachmentPreviewModal
        visible={previewTarget !== null}
        attachment={previewTarget?.attachment || null}
        isSentAttachment={Boolean(previewTarget?.messageId)}
        onClose={() => setPreviewTarget(null)}
        onSaveEdits={(updated) => void handleSaveAttachmentEdit(updated, previewTarget?.messageId)}
        onReaskWithEdits={(updated) =>
          void handleReaskWithEditedAttachment(updated, previewTarget?.messageId)
        }
      />

      {/* Separate AI STEM Image Library & Plan Quota Modal */}
      <ImageLibraryModal
        visible={libraryVisible}
        images={generatedImages}
        planTier={userPlanTier}
        initialEditImageId={libraryEditId}
        onClose={() => {
          setLibraryVisible(false);
          setLibraryEditId(null);
        }}
        onUpdateImage={async (updated) => {
          const next = await StorageService.updateGeneratedImage(updated);
          setGeneratedImages(next);
        }}
        onDeleteImage={async (imgId) => {
          const next = await StorageService.deleteGeneratedImage(imgId);
          setGeneratedImages(next);
        }}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexGrow: 0,
    flexShrink: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    flex: 1,
    minWidth: 0,
  },
  avatarIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 15, fontWeight: '800' },
  headerStatus: { fontSize: 10.5, fontWeight: '600' },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerToolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  headerToolText: { fontSize: 11, fontWeight: '800' },
  headerIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  reasoningWrapper: {
    flexGrow: 0,
    flexShrink: 0,
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  reasoningScroll: { flexGrow: 0, flexShrink: 0 },
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
    overflow: 'hidden',
  },
  modelChipText: { fontSize: 12, fontWeight: '700' },
  routingSubRow: { paddingHorizontal: 14, gap: 6 },
  routingMetaFlex: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  routingHintText: { fontSize: 11, fontWeight: '500' },
  diffPillsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  diffMiniPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  diffMiniText: { fontSize: 10.5, fontWeight: '700' },
  messagesScroll: { flex: 1 },
  messagesContainer: { padding: 14, paddingBottom: 24 },
  quickPromptContainer: { marginBottom: 12 },
  quickPromptLabel: { fontSize: 11, fontWeight: '600', marginBottom: 6 },
  quickScroll: { flexGrow: 0 },
  quickScrollContent: { alignItems: 'center' },
  promptPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
    overflow: 'hidden',
  },
  promptPillText: { fontSize: 12, fontWeight: '600' },
  messageBubbleWrapper: { marginVertical: 6, flexDirection: 'row', width: '100%' },
  userBubbleWrapper: { justifyContent: 'flex-end' },
  aiBubbleWrapper: { justifyContent: 'flex-start' },
  messageBubble: { padding: 13, borderRadius: 16 },
  userBubble: { maxWidth: '86%', borderBottomRightRadius: 4 },
  userBubbleRich: { width: '84%' },
  aiBubble: { width: '95%', borderBottomLeftRadius: 4, borderWidth: 1 },
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
    overflow: 'hidden',
  },
  thinkingBadgeText: { fontSize: 12, fontWeight: '800' },
  dotsWaveRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingRight: 4 },
  waveDot: { width: 8, height: 8, borderRadius: 4 },
  loadingText: { fontSize: 12, fontStyle: 'italic' },
  msgAttList: { gap: 6, marginBottom: 8 },
  msgAttCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  msgAttThumb: { width: 38, height: 38, borderRadius: 7 },
  msgAttIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgAttName: { fontSize: 11.5, fontWeight: '800' },
  inlineEditInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    minHeight: 54,
  },
  inlineEditBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  visualCardActions: {
    flexDirection: 'row',
    gap: 7,
    flexWrap: 'wrap',
  },
  visualActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
    borderWidth: 1,
    overflow: 'hidden',
  },
  citationsBox: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    gap: 6,
  },
  citationsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  citationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  stepsSection: { marginTop: 10, paddingTop: 8, borderTopWidth: 1 },
  stepsToggleHdr: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  stepNum: {
    width: 19,
    height: 19,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumText: { color: '#FFFFFF', fontSize: 10.5, fontWeight: '800' },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  msgFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  modelTagText: { fontSize: 10, fontWeight: '700', flex: 1 },
  timestampText: { fontSize: 10, marginLeft: 'auto' },
  userMsgActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 6,
  },
  userMsgBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  userMsgBtnText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  aiActionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    flexWrap: 'wrap',
  },
  aiActionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9,
    borderWidth: 1,
    overflow: 'hidden',
  },
  composerDock: {
    flexGrow: 0,
    flexShrink: 0,
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 7,
  },
  stagedSection: { gap: 6 },
  stagedRow: { gap: 8, alignItems: 'center' },
  stagedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  stagedThumb: { width: 32, height: 32, borderRadius: 7 },
  stagedName: { fontSize: 11.5, fontWeight: '700' },
  stagedSub: { fontSize: 10, fontWeight: '600' },
  fileActionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  fileQuickAction: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  attachBar: { flexDirection: 'row', gap: 7, alignItems: 'center' },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 11,
    borderWidth: 1,
    overflow: 'hidden',
  },
  attachBtnText: { fontSize: 11.5, fontWeight: '700' },
  visualSubRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  visSubPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  inputContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
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
    overflow: 'hidden',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  historySheet: {
    width: '100%',
    maxWidth: 520,
    height: '82%',
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  historyTitle: { fontSize: 15.5, fontWeight: '800' },
  historySearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 14,
    marginTop: 10,
    borderRadius: 11,
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  historySearchInput: { flex: 1, fontSize: 13, paddingVertical: 0 },
  sessionCard: { padding: 11 },
  sessionRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sessionTitle: { fontSize: 13.5, fontWeight: '800', flexShrink: 1 },
  sessionIconBtn: { padding: 6 },
  renameInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
  },
  renameSaveBtn: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feedbackTitle: { fontSize: 15, fontWeight: '800' },
  reasonChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  reasonChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  feedbackInput: {
    borderWidth: 1,
    borderRadius: 11,
    padding: 10,
    minHeight: 75,
    textAlignVertical: 'top',
    fontSize: 13,
  },
});
