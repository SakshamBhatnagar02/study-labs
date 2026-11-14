/**
 * Study Labs — Digital E-Book Reader Modal & AI Reading Assistant
 * Features responsive typography, Light/Dark/Sepia reading modes, Chapter TOC drawer,
 * embedded KaTeX math rendering, and integrated "AI Book Buddy" for summaries & quizzes.
 */

import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../../theme';
import { MathRenderer, RichMathText } from '../common/MathRenderer';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { SoundManager } from '../../services/soundManager';
import { HapticManager } from '../../services/hapticManager';
import type { EBook, EBookChapter } from '../../types';
import {
  BookOpen,
  Bookmark,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  List,
  Moon,
  Send,
  Sparkles,
  Sun,
  X,
  Zap,
} from 'lucide-react-native';

interface EBookReaderModalProps {
  visible: boolean;
  book: EBook | null;
  onClose: () => void;
  onBookmarkToggle?: (bookId: string, chapterId: string) => void;
}

type ReadingTheme = 'dark' | 'light' | 'sepia';

export const EBookReaderModal: React.FC<EBookReaderModalProps> = ({
  visible,
  book,
  onClose,
}) => {
  const { colors, mode } = useTheme();

  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [readingTheme, setReadingTheme] = useState<ReadingTheme>(mode === 'dark' ? 'dark' : 'light');
  const [fontSizeOffset, setFontSizeOffset] = useState(0); // -2, 0, +2, +4
  const [tocDrawerOpen, setTocDrawerOpen] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiDoubtInput, setAiDoubtInput] = useState('');
  const [aiAssistantLogs, setAiAssistantLogs] = useState<Array<{ role: 'ai' | 'user'; text: string }>>([
    {
      role: 'ai',
      text: 'Hello! I am your AI Reading Companion. Ask me to summarize this section, explain formulas, or generate chapter flashcards!',
    },
  ]);
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<number, number>>({});
  const [isBookmarked, setIsBookmarked] = useState(false);

  if (!book) return null;

  const currentChapter: EBookChapter | undefined = book.chapters[activeChapterIndex] || book.chapters[0];

  const getThemePalette = () => {
    switch (readingTheme) {
      case 'sepia':
        return {
          bg: '#FBF0D9',
          card: '#F4E4C1',
          text: '#433422',
          textSecondary: '#78624A',
          border: '#E2CEAA',
        };
      case 'light':
        return {
          bg: '#FFFFFF',
          card: '#F8FAFC',
          text: '#0F172A',
          textSecondary: '#475569',
          border: '#E2E8F0',
        };
      case 'dark':
      default:
        return {
          bg: '#090D16',
          card: '#111827',
          text: '#F8FAFC',
          textSecondary: '#94A3B8',
          border: '#1E293B',
        };
    }
  };

  const themeColors = getThemePalette();

  const handleAskAi = () => {
    const q = aiDoubtInput.trim();
    if (!q) return;

    setAiAssistantLogs((prev) => [
      ...prev,
      { role: 'user', text: q },
      {
        role: 'ai',
        text: `Here is the explanation for "${q}" based on ${book.title} (Chapter ${currentChapter?.chapterNumber}):\n\nAccording to ${currentChapter?.title}, key principles apply with high mathematical rigor. Review the core formula $${currentChapter?.keyFormulas?.[0] || 'E = mc^2'}$ in the chapter summary!`,
      },
    ]);
    setAiDoubtInput('');
    SoundManager.playMessageReceived();
    HapticManager.triggerSelection();
  };

  const handleAiQuickAction = (action: 'summary' | 'formula' | 'quiz') => {
    if (action === 'summary') {
      setAiAssistantLogs((prev) => [
        ...prev,
        { role: 'user', text: 'Summarize this chapter' },
        {
          role: 'ai',
          text: `**Chapter ${currentChapter?.chapterNumber} Key Takeaways**:\n\n${currentChapter?.summary}\n\n*High yield for exams & revision.*`,
        },
      ]);
    } else if (action === 'formula') {
      const formulas = currentChapter?.keyFormulas?.map((f) => `$${f}$`).join('\n\n') || '$E = mc^2$';
      setAiAssistantLogs((prev) => [
        ...prev,
        { role: 'user', text: 'Show all important formulas' },
        {
          role: 'ai',
          text: `**Essential Formulas for Chapter ${currentChapter?.chapterNumber}**:\n\n${formulas}`,
        },
      ]);
    } else if (action === 'quiz') {
      setAiAssistantLogs((prev) => [
        ...prev,
        { role: 'user', text: 'Generate quick check questions' },
        {
          role: 'ai',
          text: `I've prepared ${currentChapter?.quizQuestions?.length || 2} interactive assessment questions below in your study reader. Test yourself and inspect instant grading!`,
        },
      ]);
    }
    setAiPanelOpen(true);
    SoundManager.playMessageReceived();
    HapticManager.triggerSelection();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.root, { backgroundColor: themeColors.bg }]}>
        {/* Top Reading Toolbar */}
        <View style={[styles.topBar, { backgroundColor: themeColors.card, borderBottomColor: themeColors.border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
            <TouchableOpacity
              focusable={false}
              onPress={onClose}
              style={[styles.iconBtn, { borderColor: themeColors.border }]}
              accessibilityLabel="Close e-book reader"
            >
              <ChevronLeft size={18} color={themeColors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              focusable={false}
              onPress={() => setTocDrawerOpen((o) => !o)}
              style={[
                styles.iconBtn,
                {
                  backgroundColor: tocDrawerOpen ? colors.primary : 'transparent',
                  borderColor: themeColors.border,
                },
              ]}
              accessibilityLabel="Table of contents"
            >
              <List size={16} color={tocDrawerOpen ? '#FFFFFF' : themeColors.text} />
            </TouchableOpacity>

            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[styles.bookTitle, { color: themeColors.text }]} numberOfLines={1}>
                {book.title}
              </Text>
              <Text style={[styles.chapterSubtitle, { color: themeColors.textSecondary }]} numberOfLines={1}>
                Ch {currentChapter?.chapterNumber}: {currentChapter?.title}
              </Text>
            </View>
          </View>

          {/* Reader Controls Right */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, flexShrink: 0 }}>
            {/* Font size */}
            <TouchableOpacity
              focusable={false}
              onPress={() => setFontSizeOffset((s) => (s <= -2 ? 4 : s - 2))}
              style={[styles.iconBtn, { borderColor: themeColors.border }]}
              accessibilityLabel="Adjust font size"
            >
              <Text style={{ fontSize: 11, fontWeight: '800', color: themeColors.text }}>
                {fontSizeOffset > 0 ? `+${fontSizeOffset}` : fontSizeOffset === 0 ? 'A' : fontSizeOffset}
              </Text>
            </TouchableOpacity>

            {/* Reading Theme Toggle */}
            <TouchableOpacity
              focusable={false}
              onPress={() => {
                const nextTheme = readingTheme === 'dark' ? 'light' : readingTheme === 'light' ? 'sepia' : 'dark';
                setReadingTheme(nextTheme);
              }}
              style={[styles.iconBtn, { borderColor: themeColors.border }]}
              accessibilityLabel="Toggle reading theme"
            >
              {readingTheme === 'dark' ? (
                <Moon size={15} color={colors.primary} />
              ) : readingTheme === 'sepia' ? (
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#B45309' }}>S</Text>
              ) : (
                <Sun size={15} color="#F59E0B" />
              )}
            </TouchableOpacity>

            {/* Bookmark */}
            <TouchableOpacity
              focusable={false}
              onPress={() => {
                setIsBookmarked((b) => !b);
                HapticManager.triggerSelection();
              }}
              style={[styles.iconBtn, { borderColor: themeColors.border }]}
              accessibilityLabel="Bookmark chapter"
            >
              <Bookmark
                size={15}
                color={isBookmarked ? colors.primary : themeColors.textSecondary}
                fill={isBookmarked ? colors.primary : 'none'}
              />
            </TouchableOpacity>

            {/* AI Assistant Button */}
            <TouchableOpacity
              focusable={false}
              onPress={() => setAiPanelOpen((o) => !o)}
              style={[
                styles.iconBtn,
                {
                  backgroundColor: aiPanelOpen ? colors.primary : 'transparent',
                  borderColor: aiPanelOpen ? colors.primary : themeColors.border,
                },
              ]}
              accessibilityLabel="Open AI Reading Companion"
            >
              <Sparkles size={16} color={aiPanelOpen ? '#FFFFFF' : colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Reading Workspace with TOC Drawer & Content */}
        <View style={styles.workspaceBody}>
          {/* TOC Drawer Overlay / Column */}
          {tocDrawerOpen && (
            <View style={[styles.tocSidebar, { backgroundColor: themeColors.card, borderRightColor: themeColors.border }]}>
              <View style={[styles.tocHeader, { borderBottomColor: themeColors.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <BookOpen size={16} color={colors.primary} />
                  <Text style={[styles.tocTitle, { color: themeColors.text }]}>Table of Contents</Text>
                </View>
                <TouchableOpacity onPress={() => setTocDrawerOpen(false)} style={{ padding: 4 }}>
                  <X size={16} color={themeColors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 8, gap: 6 }}>
                {book.chapters.map((ch, idx) => {
                  const active = idx === activeChapterIndex;
                  return (
                    <TouchableOpacity
                      key={ch.id}
                      onPress={() => {
                        setActiveChapterIndex(idx);
                        setTocDrawerOpen(false);
                        HapticManager.triggerSelection();
                      }}
                      style={[
                        styles.tocItem,
                        {
                          backgroundColor: active ? (readingTheme === 'dark' ? '#1E293B' : '#FFEDD5') : 'transparent',
                          borderColor: active ? colors.primary : 'transparent',
                        },
                      ]}
                    >
                      <View style={[styles.tocNumBox, { backgroundColor: active ? colors.primary : themeColors.bg }]}>
                        <Text style={{ fontSize: 10, fontWeight: '800', color: active ? '#FFFFFF' : themeColors.text }}>
                          {ch.chapterNumber}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[styles.tocItemTitle, { color: active ? colors.primary : themeColors.text }]}
                          numberOfLines={2}
                        >
                          {ch.title}
                        </Text>
                        <Text style={[styles.tocPages, { color: themeColors.textSecondary }]}>
                          pp. {ch.pageStart}–{ch.pageEnd}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Chapter Reading Column */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={[styles.readingContent, { paddingHorizontal: 16 }]}
          >
            {/* Chapter Header Banner */}
            <View
              style={[
                styles.chapterBanner,
                { backgroundColor: themeColors.card, borderColor: themeColors.border },
              ]}
            >
              <Badge label={`Chapter ${currentChapter?.chapterNumber} of ${book.chapters.length}`} variant="primary" size="sm" />
              <Text
                style={[
                  styles.chapterHeading,
                  { color: themeColors.text, fontSize: 20 + fontSizeOffset },
                ]}
              >
                {currentChapter?.title}
              </Text>
              <Text style={[styles.chapterPagesMeta, { color: themeColors.textSecondary }]}>
                Pages {currentChapter?.pageStart}–{currentChapter?.pageEnd} · {book.publisher}
              </Text>

              {/* AI Quick Prompts Strip */}
              <View style={styles.aiQuickStrip}>
                <TouchableOpacity
                  focusable={false}
                  onPress={() => handleAiQuickAction('summary')}
                  style={[styles.aiPill, { backgroundColor: themeColors.bg, borderColor: colors.border }]}
                >
                  <Sparkles size={12} color={colors.primary} />
                  <Text style={[styles.aiPillText, { color: themeColors.text }]}>Summarize</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  focusable={false}
                  onPress={() => handleAiQuickAction('formula')}
                  style={[styles.aiPill, { backgroundColor: themeColors.bg, borderColor: colors.border }]}
                >
                  <Zap size={12} color={colors.warning} />
                  <Text style={[styles.aiPillText, { color: themeColors.text }]}>Formulas</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  focusable={false}
                  onPress={() => handleAiQuickAction('quiz')}
                  style={[styles.aiPill, { backgroundColor: themeColors.bg, borderColor: colors.border }]}
                >
                  <HelpCircle size={12} color={colors.cyan} />
                  <Text style={[styles.aiPillText, { color: themeColors.text }]}>Practice Quiz</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Chapter Text & KaTeX Equations */}
            <View style={{ marginVertical: 10 }}>
              <RichMathText
                content={currentChapter?.content || ''}
                fontSize={15 + fontSizeOffset}
                lineHeight={24 + fontSizeOffset}
              />
            </View>

            {/* Key Formulas Section */}
            {currentChapter?.keyFormulas && currentChapter.keyFormulas.length > 0 && (
              <View
                style={[
                  styles.formulaVault,
                  { backgroundColor: themeColors.card, borderColor: colors.primary },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <Zap size={15} color={colors.primary} />
                  <Text style={[styles.formulaTitle, { color: themeColors.text }]}>
                    Key Formulas for Quick Memorization
                  </Text>
                </View>
                <View style={{ gap: 8 }}>
                  {currentChapter.keyFormulas.map((formStr, idx) => (
                    <View
                      key={idx}
                      style={[styles.formulaRow, { backgroundColor: themeColors.bg, borderColor: themeColors.border }]}
                    >
                      <RichMathText content={`$$${formStr}$$`} />
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* In-Book Chapter Quiz Self-Test */}
            {currentChapter?.quizQuestions && currentChapter.quizQuestions.length > 0 && (
              <View
                style={[
                  styles.quizContainer,
                  { backgroundColor: themeColors.card, borderColor: themeColors.border },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={16} color={colors.success} />
                    <Text style={[styles.quizSectionTitle, { color: themeColors.text }]}>
                      Chapter Comprehension Check ({currentChapter.quizQuestions.length} Qs)
                    </Text>
                  </View>
                  <Badge label="Instant Grading" variant="success" size="sm" />
                </View>

                <View style={{ gap: 14, marginTop: 10 }}>
                  {currentChapter.quizQuestions.map((qItem, qIdx) => {
                    const chosen = selectedQuizAnswers[qIdx];
                    const isGraded = chosen !== undefined;
                    const isCorrect = chosen === qItem.correctIndex;
                    return (
                      <View
                        key={qIdx}
                        style={[
                          styles.quizCard,
                          {
                            backgroundColor: themeColors.bg,
                            borderColor: isGraded ? (isCorrect ? colors.success : colors.error) : themeColors.border,
                          },
                        ]}
                      >
                        <Text style={[styles.quizPrompt, { color: themeColors.text }]}>
                          {qIdx + 1}. {qItem.question}
                        </Text>
                        <View style={{ gap: 6, marginTop: 6 }}>
                          {qItem.options.map((opt, optIdx) => {
                            const isSelected = chosen === optIdx;
                            const isAnswerCorrect = optIdx === qItem.correctIndex;
                            let optBg = themeColors.card;
                            if (isGraded) {
                              if (isAnswerCorrect) optBg = mode === 'dark' ? '#064E3B' : '#DCFCE7';
                              else if (isSelected) optBg = mode === 'dark' ? '#7F1D1D' : '#FEE2E2';
                            }
                            return (
                              <TouchableOpacity
                                key={optIdx}
                                focusable={false}
                                disabled={isGraded}
                                onPress={() => {
                                  setSelectedQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
                                  if (isAnswerCorrect) {
                                    SoundManager.play('correct');
                                  } else {
                                    SoundManager.play('incorrect');
                                  }
                                  HapticManager.triggerSelection();
                                }}
                                style={[
                                  styles.quizOptionBtn,
                                  { backgroundColor: optBg, borderColor: isSelected ? colors.primary : themeColors.border },
                                ]}
                              >
                                <View style={[styles.optionDot, isSelected && { backgroundColor: colors.primary }]} />
                                <Text style={[styles.quizOptionText, { color: themeColors.text }]}>
                                  {opt}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                        {isGraded && (
                          <Text style={[styles.quizExplanation, { color: isCorrect ? colors.success : colors.error }]}>
                            {isCorrect ? 'Correct! ' : 'Incorrect. '} {qItem.explanation}
                          </Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Bottom Chapter Navigation Bar */}
            <View style={[styles.chapterNavBar, { borderTopColor: themeColors.border }]}>
              <Button
                title="Previous"
                variant="outline"
                size="sm"
                icon={<ChevronLeft size={14} color={themeColors.text} />}
                disabled={activeChapterIndex <= 0}
                onPress={() => {
                  if (activeChapterIndex > 0) {
                    setActiveChapterIndex(activeChapterIndex - 1);
                    setSelectedQuizAnswers({});
                  }
                }}
              />
              <Text style={{ fontSize: 11, fontWeight: '700', color: themeColors.textSecondary }}>
                Ch {activeChapterIndex + 1} of {book.chapters.length}
              </Text>
              <Button
                title="Next Chapter"
                variant="primary"
                size="sm"
                icon={<ChevronRight size={14} color="#FFFFFF" />}
                disabled={activeChapterIndex >= book.chapters.length - 1}
                onPress={() => {
                  if (activeChapterIndex < book.chapters.length - 1) {
                    setActiveChapterIndex(activeChapterIndex + 1);
                    setSelectedQuizAnswers({});
                  }
                }}
              />
            </View>
          </ScrollView>

          {/* AI Book Companion Drawer */}
          {aiPanelOpen && (
            <View style={[styles.aiSidebar, { backgroundColor: themeColors.card, borderLeftColor: themeColors.border }]}>
              <View style={[styles.aiHeader, { borderBottomColor: themeColors.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={16} color={colors.primary} />
                  <Text style={[styles.aiTitle, { color: themeColors.text }]}>AI Book Companion</Text>
                </View>
                <TouchableOpacity onPress={() => setAiPanelOpen(false)} style={{ padding: 4 }}>
                  <X size={16} color={themeColors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10, gap: 10 }}>
                {aiAssistantLogs.map((msg, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.aiMessageBubble,
                      {
                        backgroundColor: msg.role === 'user' ? (mode === 'dark' ? '#312E81' : '#E0E7FF') : themeColors.bg,
                        borderColor: themeColors.border,
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      },
                    ]}
                  >
                    <RichMathText content={msg.text} fontSize={13} lineHeight={19} />
                  </View>
                ))}
              </ScrollView>

              <View style={[styles.aiInputRow, { borderTopColor: themeColors.border }]}>
                <TextInput
                  style={[styles.aiInput, { backgroundColor: themeColors.bg, color: themeColors.text, borderColor: themeColors.border }]}
                  placeholder="Ask about this chapter..."
                  placeholderTextColor={themeColors.textSecondary}
                  value={aiDoubtInput}
                  onChangeText={setAiDoubtInput}
                  onSubmitEditing={handleAskAi}
                />
                <TouchableOpacity
                  onPress={handleAskAi}
                  style={[styles.aiSendBtn, { backgroundColor: colors.primary }]}
                  accessibilityLabel="Send question to AI"
                >
                  <Send size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    gap: 8,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookTitle: { fontSize: 13, fontWeight: '800' },
  chapterSubtitle: { fontSize: 11 },
  workspaceBody: { flex: 1, flexDirection: 'row' },
  tocSidebar: {
    width: 260,
    borderRightWidth: 1,
  },
  tocHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  tocTitle: { fontSize: 13, fontWeight: '800' },
  tocItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  tocNumBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tocItemTitle: { fontSize: 11.5, fontWeight: '700' },
  tocPages: { fontSize: 10, marginTop: 1 },
  readingContent: { paddingVertical: 14, gap: 10 },
  chapterBanner: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  chapterHeading: { fontWeight: '900', letterSpacing: 0.3 },
  chapterPagesMeta: { fontSize: 11 },
  aiQuickStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  aiPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 7,
    borderWidth: 1,
  },
  aiPillText: { fontSize: 11, fontWeight: '700' },
  formulaVault: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    marginVertical: 8,
  },
  formulaTitle: { fontSize: 13, fontWeight: '800' },
  formulaRow: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  quizContainer: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 8,
  },
  quizSectionTitle: { fontSize: 13.5, fontWeight: '800' },
  quizCard: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  quizPrompt: { fontSize: 13, fontWeight: '700' },
  quizOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  optionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#94A3B8',
  },
  quizOptionText: { fontSize: 12, fontWeight: '600', flex: 1 },
  quizExplanation: { fontSize: 11, fontWeight: '700', marginTop: 6 },
  chapterNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderTopWidth: 1,
    marginTop: 10,
  },
  aiSidebar: {
    width: 290,
    borderLeftWidth: 1,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  aiTitle: { fontSize: 13, fontWeight: '800' },
  aiMessageBubble: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    maxWidth: '92%',
  },
  aiInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderTopWidth: 1,
  },
  aiInput: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 12,
  },
  aiSendBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
