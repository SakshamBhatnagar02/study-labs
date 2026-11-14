/**
 * Study Labs — Community Hub & Doubt Exchange Screen
 * Allows students & educators to post academic questions, vote on step-by-step KaTeX answers,
 * upload community notes & study materials, and build reputation karma.
 */

import React, { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../theme';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '../components/common/Button';
import { MathRenderer, RichMathText } from '../components/common/MathRenderer';
import { CommunityEngine } from '../utils/communityEngine';
import { StorageService } from '../services/storage';
import { SoundManager } from '../services/soundManager';
import { HapticManager } from '../services/hapticManager';
import { AnimatedEmoji, ReactionPickerBar } from '../components/common/AnimatedEmoji';
import { compressImage, formatBytes } from '../utils/imageCompressor';
import { CloudStorageService } from '../services/cloudStorage';
import type {
  CommunityAnswer,
  CommunityQuestion,
  CommunityResource,
  CommunityResourceFormat,
  NavTab,
  SubjectId,
  UserProfile,
} from '../types';
import {
  ArrowBigDown,
  ArrowBigUp,
  Award,
  BookOpen,
  CheckCircle2,
  Download,
  FileText,
  Filter,
  Flame,
  HelpCircle,
  MessageSquare,
  Plus,
  Search,
  Send,
  Sparkles,
  Tag,
  UploadCloud,
  User,
  Users,
  X,
  Zap,
} from 'lucide-react-native';

interface CommunityScreenProps {
  onNavigate: (tab: NavTab) => void;
}

type CommunityTab = 'qa' | 'resources' | 'upload';

export const CommunityScreen: React.FC<CommunityScreenProps> = () => {
  const { colors, mode } = useTheme();

  const [activeTab, setActiveTab] = useState<CommunityTab>('qa');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [questions, setQuestions] = useState<CommunityQuestion[]>([]);
  const [resources, setResources] = useState<CommunityResource[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [qaFilter, setQaFilter] = useState<'all' | 'verified' | 'unanswered'>('all');

  // Detail / Answer Modal
  const [selectedQuestion, setSelectedQuestion] = useState<CommunityQuestion | null>(null);
  const [answerDraft, setAnswerDraft] = useState('');

  // Ask Question Modal
  const [askModalOpen, setAskModalOpen] = useState(false);
  const [askTitle, setAskTitle] = useState('');
  const [askContent, setAskContent] = useState('');
  const [askSubject, setAskSubject] = useState<SubjectId | 'cs_cyber'>('physics');
  const [askGrade, setAskGrade] = useState('Class 12 / JEE');
  const [askTags, setAskTags] = useState('Mechanics, Calculus');
  const [askBounty, setAskBounty] = useState('30');

  // Upload Resource Form state
  const [resTitle, setResTitle] = useState('');
  const [resDesc, setResDesc] = useState('');
  const [resSubject, setResSubject] = useState<SubjectId | 'cs_cyber'>('physics');
  const [resFormat, setResFormat] = useState<CommunityResourceFormat>('notes');
  const [resGrade, setResGrade] = useState('Class 12 / JEE');
  const [resTags, setResTags] = useState('Formulas, Summary');
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [uploadedImageUri, setUploadedImageUri] = useState<string | null>(null);
  const [compressionNotice, setCompressionNotice] = useState<string | null>(null);

  const handlePickUploadImage = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });
      if (!res.canceled && res.assets?.[0]?.uri) {
        const comp = await compressImage(res.assets[0].uri, {
          maxWidth: 1024,
          maxHeight: 1024,
          quality: 0.75,
        });
        setUploadedImageUri(comp.compressedUri);
        setCompressionNotice(
          `Compressed ${formatBytes(comp.originalSizeBytes)} → ${formatBytes(comp.compressedSizeBytes)} (${comp.savingsPercentage}% space saved)`
        );
        SoundManager.play('click');
        HapticManager.triggerSelection();
      }
    } catch {
      setUploadNotice('Unable to access photo library.');
    }
  };

  const handleToggleQuestionReaction = (qId: string, emojiId: string) => {
    SoundManager.play('click');
    HapticManager.triggerSelection();
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        const curReactions = { ...(q.reactions || {}) };
        const userReactions = [...(q.userReactions || [])];
        const hasReacted = userReactions.includes(emojiId);

        if (hasReacted) {
          curReactions[emojiId] = Math.max(0, (curReactions[emojiId] || 1) - 1);
          const nextUserReactions = userReactions.filter((e) => e !== emojiId);
          return { ...q, reactions: curReactions, userReactions: nextUserReactions };
        } else {
          curReactions[emojiId] = (curReactions[emojiId] || 0) + 1;
          return { ...q, reactions: curReactions, userReactions: [...userReactions, emojiId] };
        }
      })
    );

    if (selectedQuestion?.id === qId) {
      setSelectedQuestion((prev) => {
        if (!prev) return null;
        const curReactions = { ...(prev.reactions || {}) };
        const userReactions = [...(prev.userReactions || [])];
        const hasReacted = userReactions.includes(emojiId);
        if (hasReacted) {
          curReactions[emojiId] = Math.max(0, (curReactions[emojiId] || 1) - 1);
          return { ...prev, reactions: curReactions, userReactions: userReactions.filter((e) => e !== emojiId) };
        } else {
          curReactions[emojiId] = (curReactions[emojiId] || 0) + 1;
          return { ...prev, reactions: curReactions, userReactions: [...userReactions, emojiId] };
        }
      });
    }
  };

  const handleToggleAnswerReaction = (qId: string, ansId: string, emojiId: string) => {
    SoundManager.play('click');
    HapticManager.triggerSelection();
    const updateAnsList = (answers: CommunityAnswer[]) =>
      answers.map((ans) => {
        if (ans.id !== ansId) return ans;
        const curReactions = { ...(ans.reactions || {}) };
        const userReactions = [...(ans.userReactions || [])];
        const hasReacted = userReactions.includes(emojiId);
        if (hasReacted) {
          curReactions[emojiId] = Math.max(0, (curReactions[emojiId] || 1) - 1);
          return { ...ans, reactions: curReactions, userReactions: userReactions.filter((e) => e !== emojiId) };
        } else {
          curReactions[emojiId] = (curReactions[emojiId] || 0) + 1;
          return { ...ans, reactions: curReactions, userReactions: [...userReactions, emojiId] };
        }
      });

    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        return { ...q, answers: updateAnsList(q.answers) };
      })
    );

    if (selectedQuestion?.id === qId) {
      setSelectedQuestion((prev) => (prev ? { ...prev, answers: updateAnsList(prev.answers) } : null));
    }
  };

  const loadData = async () => {
    const [p, qList, rList] = await Promise.all([
      StorageService.getUserProfile(),
      CommunityEngine.getQuestions(),
      CommunityEngine.getResources(),
    ]);
    setProfile(p);
    setQuestions(qList);
    setResources(rList);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVoteQ = async (qId: string, type: 'up' | 'down') => {
    SoundManager.play('click');
    HapticManager.triggerSelection();
    const updated = await CommunityEngine.voteQuestion(qId, type);
    if (updated) {
      setQuestions((prev) => prev.map((item) => (item.id === qId ? updated : item)));
      if (selectedQuestion?.id === qId) setSelectedQuestion(updated);
    }
  };

  const handleVoteAns = async (qId: string, ansId: string, type: 'up' | 'down') => {
    SoundManager.play('click');
    HapticManager.triggerSelection();
    const updatedAns = await CommunityEngine.voteAnswer(qId, ansId, type);
    if (updatedAns) {
      setQuestions((prev) =>
        prev.map((q) => {
          if (q.id !== qId) return q;
          return {
            ...q,
            answers: q.answers.map((a) => (a.id === ansId ? updatedAns : a)),
          };
        })
      );
      if (selectedQuestion?.id === qId) {
        setSelectedQuestion((prev) =>
          prev
            ? {
                ...prev,
                answers: prev.answers.map((a) => (a.id === ansId ? updatedAns : a)),
              }
            : null
        );
      }
    }
  };

  const handleVerifyAnswer = async (qId: string, ansId: string) => {
    SoundManager.play('achievement');
    HapticManager.triggerSuccess();
    await CommunityEngine.toggleVerifyAnswer(qId, ansId);
    await loadData();
    if (selectedQuestion?.id === qId) {
      const reloaded = await CommunityEngine.getQuestions();
      const updatedQ = reloaded.find((q) => q.id === qId) || null;
      setSelectedQuestion(updatedQ);
    }
  };

  const handlePostAnswer = async () => {
    if (!selectedQuestion || !answerDraft.trim() || !profile) return;

    SoundManager.playMessageSend();
    HapticManager.triggerSuccess();

    await CommunityEngine.addAnswer(selectedQuestion.id, {
      content: answerDraft.trim(),
      authorId: profile.id,
      authorName: profile.name,
      authorRole: profile.educationLevel || 'Student',
      authorAvatarColor: profile.avatarColor || '#F97316',
    });

    setAnswerDraft('');
    const reloaded = await CommunityEngine.getQuestions();
    setQuestions(reloaded);
    const updated = reloaded.find((q) => q.id === selectedQuestion.id) || null;
    setSelectedQuestion(updated);
  };

  const handleCreateQuestion = async () => {
    if (!askTitle.trim() || !askContent.trim() || !profile) return;

    SoundManager.playMessageSend();
    HapticManager.triggerSuccess();

    const tagList = askTags.split(',').map((t) => t.trim()).filter(Boolean);
    const bounty = parseInt(askBounty, 10) || 25;

    await CommunityEngine.addQuestion({
      title: askTitle.trim(),
      content: askContent.trim(),
      subject: askSubject,
      gradeLevel: askGrade,
      tags: tagList,
      bountyXp: bounty,
      authorId: profile.id,
      authorName: profile.name,
      authorAvatarColor: profile.avatarColor || '#F97316',
    });

    setAskModalOpen(false);
    setAskTitle('');
    setAskContent('');
    await loadData();
  };

  const handleUploadResource = async () => {
    if (!resTitle.trim() || !resDesc.trim() || !profile) return;

    SoundManager.play('achievement');
    HapticManager.triggerSuccess();

    const tagList = resTags.split(',').map((t) => t.trim()).filter(Boolean);

    let cloudUploadResult = null;
    if (uploadedImageUri) {
      cloudUploadResult = await CloudStorageService.uploadResource(
        {
          fileName: `${resTitle.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`,
          mimeType: 'image/jpeg',
          sizeBytes: 150 * 1024,
          base64OrUri: uploadedImageUri,
          bucket: 'notes',
          compressed: true,
        },
        'b2'
      );
    }

    await CommunityEngine.uploadResource({
      title: resTitle.trim(),
      description: resDesc.trim(),
      subject: resSubject,
      gradeLevel: resGrade,
      format: resFormat,
      tags: tagList,
      authorId: profile.id,
      authorName: profile.name,
      authorRole: profile.educationLevel || 'Student',
    });

    const statusExtra = cloudUploadResult?.success
      ? ` (Synced to Backblaze B2 & Cloudflare R2: ${cloudUploadResult.provider})`
      : '';
    setUploadNotice(`Resource successfully submitted to the Admin Moderation Queue!${statusExtra}`);
    setResTitle('');
    setResDesc('');
    setUploadedImageUri(null);
    setCompressionNotice(null);
    await loadData();
  };

  const filteredQuestions = questions.filter((q) => {
    if (subjectFilter !== 'all' && q.subject !== subjectFilter) return false;
    if (qaFilter === 'verified' && !q.isResolved) return false;
    if (qaFilter === 'unanswered' && q.answers.length > 0) return false;
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      q.title.toLowerCase().includes(query) ||
      q.content.toLowerCase().includes(query) ||
      q.tags.some((t) => t.toLowerCase().includes(query))
    );
  });

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
        {/* Hero Card */}
        <Card style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View style={[styles.heroIconBox, { backgroundColor: mode === 'dark' ? '#431407' : '#FFEDD5' }]}>
              <Users size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.heroTitle, { color: colors.text }]}>
                  Community Library & Doubt Exchange
                </Text>
                <Badge label="Peer Q&A" variant="warning" size="sm" />
              </View>
              <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
                Ask doubts with step-by-step LaTeX, upvote solutions, and share curriculum notes
              </Text>
            </View>
          </View>

          {/* Navigation Pill Strip */}
          <View style={[styles.tabStrip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity
              onPress={() => setActiveTab('qa')}
              style={[
                styles.tabBtn,
                activeTab === 'qa' && { backgroundColor: colors.primary },
              ]}
            >
              <Text style={[styles.tabBtnText, { color: activeTab === 'qa' ? '#FFFFFF' : colors.text }]}>
                Doubt Exchange ({questions.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('resources')}
              style={[
                styles.tabBtn,
                activeTab === 'resources' && { backgroundColor: colors.primary },
              ]}
            >
              <Text style={[styles.tabBtnText, { color: activeTab === 'resources' ? '#FFFFFF' : colors.text }]}>
                Study Notes ({resources.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('upload')}
              style={[
                styles.tabBtn,
                activeTab === 'upload' && { backgroundColor: colors.primary },
              ]}
            >
              <Text style={[styles.tabBtnText, { color: activeTab === 'upload' ? '#FFFFFF' : colors.text }]}>
                + Upload Notes
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* TAB 1: DOUBT EXCHANGE (Q&A) */}
        {activeTab === 'qa' && (
          <View style={{ gap: 12 }}>
            {/* Search and Action Bar */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View
                style={[
                  styles.searchBar,
                  { backgroundColor: colors.card, borderColor: colors.border, flex: 1 },
                ]}
              >
                <Search size={15} color={colors.textSecondary} />
                <TextInput
                  style={[styles.searchInput, { color: colors.text }]}
                  placeholder="Search questions, formulas, tags..."
                  placeholderTextColor={colors.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              <Button
                title="Ask Doubt"
                variant="primary"
                size="sm"
                icon={<Plus size={14} color="#FFFFFF" />}
                onPress={() => setAskModalOpen(true)}
              />
            </View>

            {/* Filter Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {[
                { id: 'all', label: 'All Subjects' },
                { id: 'physics', label: 'Physics' },
                { id: 'chemistry', label: 'Chemistry' },
                { id: 'math', label: 'Mathematics' },
                { id: 'biology', label: 'Biology' },
                { id: 'cs_cyber', label: 'CS / Cyber' },
              ].map((sub) => (
                <TouchableOpacity
                  key={sub.id}
                  onPress={() => setSubjectFilter(sub.id)}
                  style={[
                    styles.filterPill,
                    {
                      backgroundColor: subjectFilter === sub.id ? colors.primary : colors.card,
                      borderColor: subjectFilter === sub.id ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: subjectFilter === sub.id ? '#FFFFFF' : colors.text }}>
                    {sub.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Questions Feed */}
            {filteredQuestions.map((q) => {
              const netScore = q.upvotesCount - q.downvotesCount;
              return (
                <Card key={q.id} style={styles.questionCard}>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    {/* Voting Column */}
                    <View style={styles.voteColumn}>
                      <TouchableOpacity
                        onPress={() => handleVoteQ(q.id, 'up')}
                        style={[styles.voteArrowBtn, q.userVote === 'up' && { backgroundColor: `${colors.primary}22` }]}
                      >
                        <ArrowBigUp size={20} color={q.userVote === 'up' ? colors.primary : colors.textSecondary} />
                      </TouchableOpacity>
                      <Text style={[styles.voteCount, { color: q.userVote ? colors.primary : colors.text }]}>
                        {netScore}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleVoteQ(q.id, 'down')}
                        style={[styles.voteArrowBtn, q.userVote === 'down' && { backgroundColor: `${colors.error}22` }]}
                      >
                        <ArrowBigDown size={20} color={q.userVote === 'down' ? colors.error : colors.textSecondary} />
                      </TouchableOpacity>
                    </View>

                    {/* Question Content */}
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => {
                        setSelectedQuestion(q);
                        SoundManager.play('click');
                      }}
                      style={{ flex: 1, minWidth: 0, gap: 6 }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                        <Badge label={q.subject.toUpperCase()} variant="primary" size="sm" />
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Zap size={12} color={colors.warning} />
                          <Text style={{ fontSize: 11, fontWeight: '800', color: colors.warning }}>
                            +{q.bountyXp} XP Bounty
                          </Text>
                        </View>
                      </View>

                      <Text style={[styles.questionTitle, { color: colors.text }]} numberOfLines={2}>
                        {q.title}
                      </Text>

                      <Text style={[styles.authorLine, { color: colors.textSecondary }]}>
                        Asked by {q.authorName} · {q.gradeLevel}
                      </Text>

                      {/* Tags & Answer Count */}
                      <View style={styles.questionFooter}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <MessageSquare size={13} color={colors.primary} />
                          <Text style={{ fontSize: 11, fontWeight: '700', color: colors.primary }}>
                            {q.answers.length} {q.answers.length === 1 ? 'Answer' : 'Answers'}
                          </Text>
                        </View>

                        {q.isResolved && (
                          <View style={styles.verifiedTag}>
                            <CheckCircle2 size={12} color={colors.success} />
                            <Text style={{ fontSize: 10.5, fontWeight: '800', color: colors.success }}>
                              Verified Answer
                            </Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        {/* TAB 2: COMMUNITY NOTES & RESOURCES */}
        {activeTab === 'resources' && (
          <View style={{ gap: 10 }}>
            {resources.map((res) => (
              <Card key={res.id} style={styles.resourceCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={[styles.resIconBox, { backgroundColor: mode === 'dark' ? '#1E293B' : '#EDE9FE' }]}>
                    <FileText size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Badge label={res.format.toUpperCase().replace('_', ' ')} variant="primary" size="sm" />
                      <Text style={{ fontSize: 10, color: colors.textSecondary }}>{res.fileSizeFormatted}</Text>
                    </View>
                    <Text style={[styles.resTitle, { color: colors.text }]} numberOfLines={1}>
                      {res.title}
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.textSecondary }} numberOfLines={2}>
                      {res.description}
                    </Text>
                  </View>
                </View>

                <View style={[styles.resFooter, { borderTopColor: colors.border }]}>
                  <Text style={{ fontSize: 10.5, color: colors.textSecondary }}>
                    Shared by {res.authorName}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <ArrowBigUp size={14} color={colors.primary} />
                      <Text style={{ fontSize: 11, fontWeight: '800', color: colors.text }}>{res.upvotesCount}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Download size={13} color={colors.textSecondary} />
                      <Text style={{ fontSize: 11, color: colors.textSecondary }}>{res.downloadsCount}</Text>
                    </View>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* TAB 3: UPLOAD NEW RESOURCE */}
        {activeTab === 'upload' && (
          <Card style={styles.uploadCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <UploadCloud size={20} color={colors.primary} />
              <Text style={[styles.sectionHeading, { color: colors.text }]}>Upload Study Resource</Text>
            </View>
            <Text style={{ fontSize: 11.5, color: colors.textSecondary }}>
              Share formula cheat sheets, handwritten notes, or solved question sets with the Study Labs student community.
            </Text>

            {uploadNotice && (
              <View style={[styles.noticeBox, { backgroundColor: mode === 'dark' ? '#064E3B' : '#DCFCE7', borderColor: colors.success }]}>
                <CheckCircle2 size={16} color={colors.success} />
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.success, flex: 1 }}>{uploadNotice}</Text>
              </View>
            )}

            <View style={{ gap: 10, marginTop: 8 }}>
              <View>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Resource Title</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                  placeholder="e.g. Modern Physics Formula Deck"
                  placeholderTextColor={colors.textSecondary}
                  value={resTitle}
                  onChangeText={setResTitle}
                />
              </View>

              <View>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Detailed Description</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, height: 70 }]}
                  placeholder="Summary of chapters covered, key theorems, and derivations included..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  value={resDesc}
                  onChangeText={setResDesc}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Subject</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                    value={resSubject}
                    onChangeText={(t) => setResSubject(t as any)}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Format</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                    value={resFormat}
                    onChangeText={(t) => setResFormat(t as any)}
                  />
                </View>
              </View>

              {/* Image / Attachment with Client-Side Compression */}
              <View style={{ gap: 6 }}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Resource Attachment / Scan</Text>
                <TouchableOpacity
                  onPress={handlePickUploadImage}
                  style={[
                    styles.uploadPickBtn,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <UploadCloud size={16} color={colors.primary} />
                  <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primary }}>
                    {uploadedImageUri ? 'Change Uploaded Scan' : 'Pick Notes Scan (Auto-Compressed)'}
                  </Text>
                </TouchableOpacity>
                {compressionNotice && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, padding: 6, borderRadius: 6, backgroundColor: 'rgba(16,185,129,0.12)' }}>
                    <CheckCircle2 size={13} color="#10B981" />
                    <Text style={{ fontSize: 10.5, color: '#10B981', fontWeight: '700' }}>
                      {compressionNotice}
                    </Text>
                  </View>
                )}
              </View>

              <Button
                title="Submit for Moderation & Community Publish"
                variant="primary"
                size="md"
                disabled={!resTitle.trim() || !resDesc.trim()}
                onPress={handleUploadResource}
                style={{ marginTop: 8 }}
              />
            </View>
          </Card>
        )}
      </ScrollView>

      {/* QUESTION DETAIL & ANSWERS MODAL */}
      {selectedQuestion && (
        <Modal visible={Boolean(selectedQuestion)} animationType="slide" onRequestClose={() => setSelectedQuestion(null)}>
          <View style={[styles.modalRoot, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                <Badge label={selectedQuestion.subject.toUpperCase()} variant="primary" size="sm" />
                <Text style={[styles.modalTitle, { color: colors.text }]} numberOfLines={1}>
                  {selectedQuestion.title}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedQuestion(null)} style={{ padding: 4 }}>
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, gap: 12 }}>
              {/* Question Body Card */}
              <Card style={{ padding: 14, gap: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>
                  {selectedQuestion.title}
                </Text>
                <RichMathText content={selectedQuestion.content} />
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 }}>
                  <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                    Asked by {selectedQuestion.authorName} · {selectedQuestion.gradeLevel}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <TouchableOpacity
                      onPress={() => handleVoteQ(selectedQuestion.id, 'up')}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}
                    >
                      <ArrowBigUp size={18} color={selectedQuestion.userVote === 'up' ? colors.primary : colors.textSecondary} />
                      <Text style={{ fontSize: 12, fontWeight: '800', color: colors.text }}>
                        {selectedQuestion.upvotesCount - selectedQuestion.downvotesCount}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Animated Emoji Reactions for Question */}
                  <ReactionPickerBar
                    reactions={selectedQuestion.reactions}
                    userReactions={selectedQuestion.userReactions}
                    onToggleReaction={(eid) => handleToggleQuestionReaction(selectedQuestion.id, eid)}
                  />
                </View>
              </Card>

              {/* Answers Header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: colors.text }}>
                  {selectedQuestion.answers.length} Community Solutions
                </Text>
              </View>

              {/* Answers Feed */}
              {selectedQuestion.answers.map((ans) => {
                const ansNet = ans.upvotesCount - ans.downvotesCount;
                return (
                  <Card
                    key={ans.id}
                    style={[
                      styles.answerCard,
                      ans.isVerified && { borderColor: colors.success, borderWidth: 1.5 },
                    ]}
                  >
                    <View style={styles.ansHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <View style={[styles.avatarCircle, { backgroundColor: ans.authorAvatarColor || colors.primary }]}>
                          <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '800' }}>
                            {ans.authorName.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>
                          {ans.authorName}
                        </Text>
                        <Badge label={ans.authorRole} variant="neutral" size="sm" />
                      </View>

                      {ans.isVerified ? (
                        <View style={styles.verifiedBadge}>
                          <CheckCircle2 size={13} color={colors.success} />
                          <Text style={{ fontSize: 11, fontWeight: '800', color: colors.success }}>Verified</Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          onPress={() => handleVerifyAnswer(selectedQuestion.id, ans.id)}
                          style={[styles.verifyBtn, { borderColor: colors.border }]}
                        >
                          <Text style={{ fontSize: 10.5, fontWeight: '700', color: colors.textSecondary }}>
                            Mark Verified
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    <RichMathText content={ans.content} />

                    {/* Animated Emoji Reactions for Answer */}
                    <ReactionPickerBar
                      reactions={ans.reactions}
                      userReactions={ans.userReactions}
                      onToggleReaction={(eid) => handleToggleAnswerReaction(selectedQuestion.id, ans.id, eid)}
                    />

                    <View style={[styles.ansFooter, { borderTopColor: colors.border }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <TouchableOpacity
                          onPress={() => handleVoteAns(selectedQuestion.id, ans.id, 'up')}
                          style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}
                        >
                          <ArrowBigUp size={16} color={ans.userVote === 'up' ? colors.primary : colors.textSecondary} />
                          <Text style={{ fontSize: 11, fontWeight: '800', color: colors.text }}>{ansNet}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleVoteAns(selectedQuestion.id, ans.id, 'down')}>
                          <ArrowBigDown size={16} color={ans.userVote === 'down' ? colors.error : colors.textSecondary} />
                        </TouchableOpacity>
                      </View>
                      <Text style={{ fontSize: 10, color: colors.textSecondary }}>
                        {new Date(ans.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </Card>
                );
              })}

              {/* Post Answer Box */}
              <Card style={{ padding: 12, gap: 8, marginTop: 6 }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>
                  Submit Your Step-by-Step Solution ($LaTeX$ Supported)
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, height: 80 }]}
                  placeholder="Write clear explanation using $...$ for inline math and $$...$$ for display formulas..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  value={answerDraft}
                  onChangeText={setAnswerDraft}
                />
                <Button
                  title="Post Solution"
                  variant="primary"
                  size="sm"
                  disabled={!answerDraft.trim()}
                  onPress={handlePostAnswer}
                />
              </Card>
            </ScrollView>
          </View>
        </Modal>
      )}

      {/* ASK QUESTION MODAL */}
      <Modal visible={askModalOpen} animationType="slide" onRequestClose={() => setAskModalOpen(false)}>
        <View style={[styles.modalRoot, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Ask a Community Doubt</Text>
            <TouchableOpacity onPress={() => setAskModalOpen(false)}>
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, gap: 10 }}>
            <View>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Question Title</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                placeholder="What is your doubt? Be specific..."
                placeholderTextColor={colors.textSecondary}
                value={askTitle}
                onChangeText={setAskTitle}
              />
            </View>

            <View>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Question Details ($LaTeX$ Supported)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border, height: 100 }]}
                placeholder="Paste the problem statement, equations e.g. $F = ma$, and where you are stuck..."
                placeholderTextColor={colors.textSecondary}
                multiline
                value={askContent}
                onChangeText={setAskContent}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Subject</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                  value={askSubject}
                  onChangeText={(t) => setAskSubject(t as any)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Bounty XP</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                  value={askBounty}
                  onChangeText={setAskBounty}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <Button
              title="Broadcast Question to Community"
              variant="primary"
              size="md"
              disabled={!askTitle.trim() || !askContent.trim()}
              onPress={handleCreateQuestion}
              style={{ marginTop: 10 }}
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { padding: 14, gap: 12, paddingBottom: 30 },
  heroCard: { padding: 14, gap: 12 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heroIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: { fontSize: 15, fontWeight: '900' },
  heroSubtitle: { fontSize: 11.5, marginTop: 2, lineHeight: 16 },
  tabStrip: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnText: { fontSize: 11.5, fontWeight: '700' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    height: 38,
    borderRadius: 9,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 12.5 },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  questionCard: { padding: 12 },
  voteColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    gap: 2,
  },
  voteArrowBtn: {
    padding: 2,
    borderRadius: 4,
  },
  voteCount: {
    fontSize: 12,
    fontWeight: '800',
  },
  questionTitle: { fontSize: 13.5, fontWeight: '800', lineHeight: 18 },
  authorLine: { fontSize: 10.5 },
  questionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  resourceCard: { padding: 12, gap: 8 },
  resIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resTitle: { fontSize: 13, fontWeight: '800' },
  resFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
  },
  uploadCard: { padding: 14, gap: 10 },
  sectionHeading: { fontSize: 14, fontWeight: '900' },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 9,
    borderWidth: 1,
  },
  fieldLabel: { fontSize: 11, fontWeight: '700', marginBottom: 4 },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
  },
  uploadPickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  modalRoot: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  modalTitle: { fontSize: 14, fontWeight: '800', flex: 1 },
  answerCard: { padding: 12, gap: 8 },
  ansHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifyBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  ansFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
  },
});
