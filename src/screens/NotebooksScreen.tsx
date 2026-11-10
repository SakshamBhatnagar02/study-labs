import React, { useCallback, useEffect, useState } from 'react';
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
import { Button } from '../components/common/Button';
import { RichMathText } from '../components/common/MathRenderer';
import { CHAPTERS, SAMPLE_QUESTIONS, SUBJECTS } from '../data/curriculumData';
import { StorageService } from '../services/storage';
import { SoundManager } from '../services/soundManager';
import { HapticManager } from '../services/hapticManager';
import { CustomNotebook, Question, QuestionAttemptStat, TestSessionLaunch } from '../types';
import { getLatestQuestionStatusMap } from '../utils/activityStats';
import {
  BookMarked,
  Bookmark,
  CheckCircle2,
  FileEdit,
  FolderPlus,
  Layers,
  Play,
  Trash2,
  X,
  XCircle,
} from 'lucide-react-native';

interface NotebooksScreenProps {
  onLaunchSession: (session: TestSessionLaunch) => void;
}

const NOTEBOOK_COLORS = ['#F97316', '#22D3EE', '#A855F7', '#10B981', '#FACC15'];

export const NotebooksScreen: React.FC<NotebooksScreenProps> = ({ onLaunchSession }) => {
  const { colors, mode } = useTheme();
  const [subTab, setSubTab] = useState<'notebooks' | 'smart' | 'notes'>('notebooks');
  const [statusFilter, setStatusFilter] = useState<'all' | 'incorrect' | 'correct' | 'unattempted'>('all');

  const [notebooks, setNotebooks] = useState<CustomNotebook[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [questionNotes, setQuestionNotes] = useState<Record<string, string>>({});
  const [latestStats, setLatestStats] = useState<Record<string, QuestionAttemptStat>>({});
  const [customQuestions, setCustomQuestions] = useState<Question[]>([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(NOTEBOOK_COLORS[0]);
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    const [nbs, bms, notes, logs, customQs] = await Promise.all([
      StorageService.getNotebooks(),
      StorageService.getBookmarkedIds(),
      StorageService.getQuestionNotes(),
      StorageService.getAttemptLogs(),
      StorageService.getCustomQuestions(),
    ]);
    setNotebooks(nbs);
    setBookmarkedIds(bms);
    setQuestionNotes(notes);
    setLatestStats(getLatestQuestionStatusMap(logs));
    setCustomQuestions(customQs);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleCreateNotebook = async () => {
    if (!newName.trim()) return;
    const updated = await StorageService.createNotebook(newName.trim(), newColor);
    setNotebooks(updated);
    setNewName('');
    setCreateOpen(false);
    SoundManager.play('notify');
    HapticManager.triggerSuccess();
  };

  const handleDeleteNotebook = async (nbId: string) => {
    const updated = await StorageService.deleteNotebook(nbId);
    setNotebooks(updated);
    if (selectedNotebookId === nbId) setSelectedNotebookId(null);
    HapticManager.triggerSelection();
  };

  const allQuestions = React.useMemo(() => {
    const map = new Map<string, Question>();
    for (const q of SAMPLE_QUESTIONS) map.set(q.id, q);
    for (const q of customQuestions) map.set(q.id, q);
    return Array.from(map.values());
  }, [customQuestions]);

  const bookmarkedQuestions = allQuestions.filter((q) => bookmarkedIds.includes(q.id));

  const filteredSmartQuestions = bookmarkedQuestions.filter((q) => {
    const stat = latestStats[q.id];
    if (statusFilter === 'incorrect') return stat && !stat.isCorrect;
    if (statusFilter === 'correct') return stat && stat.isCorrect;
    if (statusFilter === 'unattempted') return !stat;
    return true;
  });

  const notedQuestions = allQuestions.filter((q) => Boolean(questionNotes[q.id]?.trim()));
  const activeNotebook = notebooks.find((nb) => nb.id === selectedNotebookId) || null;

  const launchQuestions = (title: string, qs: Question[]) => {
    if (qs.length === 0) return;
    onLaunchSession({
      title,
      mode: 'practice',
      questionIds: qs.map((q) => q.id),
      nonce: Date.now(),
    });
  };

  const renderStatusBadge = (qId: string) => {
    const st = latestStats[qId];
    if (!st) return <Badge label="UNATTEMPTED" variant="neutral" size="sm" />;
    return st.isCorrect ? (
      <Badge label="CORRECT" variant="success" size="sm" />
    ) : (
      <Badge label="MISTAKE" variant="error" size="sm" />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Sub-navigation tabs */}
      <View style={[styles.topTabsBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {(
          [
            { id: 'notebooks', label: 'My Notebooks', Icon: BookMarked },
            { id: 'smart', label: 'Smart Bank', Icon: Layers },
            { id: 'notes', label: 'My Notes', Icon: FileEdit },
          ] as const
        ).map(({ id, label, Icon }) => {
          const active = subTab === id;
          return (
            <TouchableOpacity
              key={id}
              activeOpacity={0.75}
              onPress={() => {
                setSubTab(id);
                setSelectedNotebookId(null);
              }}
              style={[
                styles.topTab,
                active && { borderBottomColor: colors.primary, borderBottomWidth: 2.5 },
              ]}
            >
              <Icon size={14} color={active ? colors.primary : colors.textSecondary} />
              <Text
                style={[
                  styles.topTabText,
                  { color: active ? colors.primary : colors.textSecondary },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* TAB 1: MY NOTEBOOKS */}
        {subTab === 'notebooks' && !activeNotebook && (
          <>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Custom Revision Notebooks
                </Text>
                <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                  Organize bookmarked questions by topic or exam priority
                </Text>
              </View>
              <Button
                title="New"
                size="sm"
                onPress={() => setCreateOpen(true)}
                icon={<FolderPlus size={14} color="#FFFFFF" />}
              />
            </View>

            {notebooks.map((nb) => {
              const nbQuestions = allQuestions.filter((q) => nb.questionIds.includes(q.id));
              return (
                <Card key={nb.id} style={[styles.nbCard, { borderLeftColor: nb.color, borderLeftWidth: 4 }]}>
                  <View style={styles.nbTopRow}>
                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={() => {
                        setSelectedNotebookId(nb.id);
                      }}
                      style={{ flex: 1 }}
                    >
                      <Text style={[styles.nbTitle, { color: colors.text }]}>{nb.name}</Text>
                      <Text style={[styles.nbMeta, { color: colors.textSecondary }]}>
                        {nbQuestions.length} Saved Questions
                      </Text>
                    </TouchableOpacity>

                    <View style={styles.nbActions}>
                      {nbQuestions.length > 0 && (
                        <Button
                          title="Practice"
                          size="sm"
                          onPress={() => launchQuestions(nb.name, nbQuestions)}
                          icon={<Play size={12} color="#FFFFFF" />}
                        />
                      )}
                      <TouchableOpacity
                        onPress={() => handleDeleteNotebook(nb.id)}
                        style={[styles.iconDeleteBtn, { backgroundColor: colors.surface }]}
                      >
                        <Trash2 size={15} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              );
            })}

            {notebooks.length === 0 && (
              <Card style={styles.emptyCard}>
                <BookMarked size={28} color={colors.textSecondary} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No Notebooks Yet</Text>
                <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                  Step 1: Bookmark Qs while practicing · Step 2: Create a Notebook · Step 3: Revise fast!
                </Text>
              </Card>
            )}
          </>
        )}

        {/* Active Notebook Drilldown */}
        {subTab === 'notebooks' && activeNotebook && (
          <>
            <View style={styles.sectionHeader}>
              <TouchableOpacity
                onPress={() => {
                  setSelectedNotebookId(null);
                }}
              >
                <Text style={[styles.backLink, { color: colors.primary }]}>← All Notebooks</Text>
              </TouchableOpacity>
              <Button
                title="Practice All"
                size="sm"
                disabled={activeNotebook.questionIds.length === 0}
                onPress={() =>
                  launchQuestions(
                    activeNotebook.name,
                    allQuestions.filter((q) => activeNotebook.questionIds.includes(q.id))
                  )
                }
              />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 10 }]}>
              {activeNotebook.name}
            </Text>

            {allQuestions.filter((q) => activeNotebook.questionIds.includes(q.id)).map((q) => (
              <Card key={q.id} style={styles.qCard}>
                <View style={styles.qCardHeader}>
                  <Badge label={q.subjectId.toUpperCase()} variant="primary" size="sm" />
                  {renderStatusBadge(q.id)}
                </View>
                <RichMathText content={q.prompt} fontSize={13.5} color={colors.text} accentColor={colors.primary} compact />
                <View style={styles.qFooterRow}>
                  <Button
                    title="Solve Question"
                    size="sm"
                    variant="outline"
                    onPress={() => launchQuestions(activeNotebook.name, [q])}
                  />
                </View>
              </Card>
            ))}
          </>
        )}

        {/* TAB 2: SMART BOOKMARKS BY SUBJECT & CHAPTER */}
        {subTab === 'smart' && (
          <>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Smart Bookmarks</Text>
                <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                  {filteredSmartQuestions.length} Bookmarked Questions Organized Automatically
                </Text>
              </View>
              {filteredSmartQuestions.length > 0 && (
                <Button
                  title="Drill All"
                  size="sm"
                  onPress={() => launchQuestions('Smart Bookmarks Drill', filteredSmartQuestions)}
                  icon={<Play size={13} color="#FFFFFF" />}
                />
              )}
            </View>

            <View style={styles.filterRow}>
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'incorrect', label: 'Mistakes' },
                  { id: 'correct', label: 'Correct' },
                  { id: 'unattempted', label: 'New' },
                ] as const
              ).map((f) => {
                const active = statusFilter === f.id;
                return (
                  <TouchableOpacity
                    key={f.id}
                    onPress={() => {
                      setStatusFilter(f.id);
                    }}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: active ? colors.primary : colors.card,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        { color: active ? '#FFFFFF' : colors.textSecondary },
                      ]}
                    >
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {SUBJECTS.map((sub) => {
              const subQs = filteredSmartQuestions.filter((q) => q.subjectId === sub.id);
              if (subQs.length === 0) return null;

              return (
                <View key={sub.id} style={styles.groupBlock}>
                  <Text style={[styles.groupTitle, { color: colors.primary }]}>
                    {sub.name.toUpperCase()} ({subQs.length})
                  </Text>
                  {subQs.map((q) => {
                    const ch = CHAPTERS.find((c) => c.id === q.chapterId);
                    return (
                      <Card key={q.id} style={styles.qCard}>
                        <View style={styles.qCardHeader}>
                          <Text style={[styles.chapterMini, { color: colors.textSecondary }]}>
                            {ch?.title || 'Chapter Drill'}
                          </Text>
                          {renderStatusBadge(q.id)}
                        </View>
                        <RichMathText
                          content={q.prompt}
                          fontSize={13.5}
                          color={colors.text}
                          accentColor={colors.primary}
                          compact
                        />
                        <View style={styles.qFooterRow}>
                          <Button
                            title="Practice Now"
                            variant="outline"
                            size="sm"
                            onPress={() => launchQuestions(ch?.title || 'Bookmark Practice', [q])}
                          />
                        </View>
                      </Card>
                    );
                  })}
                </View>
              );
            })}

            {filteredSmartQuestions.length === 0 && (
              <Card style={styles.emptyCard}>
                <Bookmark size={28} color={colors.textSecondary} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  No Matching Bookmarks
                </Text>
                <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                  Tap the bookmark icon during any practice question to save it here.
                </Text>
              </Card>
            )}
          </>
        )}

        {/* TAB 3: MY NOTES */}
        {subTab === 'notes' && (
          <>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>My Question Notes</Text>
                <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                  Personal formulas, shortcuts & traps saved per question
                </Text>
              </View>
              {notedQuestions.length > 0 && (
                <Button
                  title="Revise"
                  size="sm"
                  onPress={() => launchQuestions('Noted Questions Revision', notedQuestions)}
                />
              )}
            </View>

            {notedQuestions.map((q) => (
              <Card key={q.id} style={styles.qCard}>
                <View style={styles.qCardHeader}>
                  <Badge label={q.subjectId.toUpperCase()} variant="primary" size="sm" />
                  <Badge label={q.difficulty} variant="neutral" size="sm" />
                </View>

                <View
                  style={[
                    styles.noteHighlight,
                    {
                      backgroundColor: mode === 'dark' ? '#2B1508' : '#FFF7ED',
                      borderColor: colors.primary,
                    },
                  ]}
                >
                  <Text style={[styles.noteLabel, { color: colors.primary }]}>MY NOTE</Text>
                  <RichMathText
                    content={questionNotes[q.id]}
                    fontSize={13}
                    color={colors.text}
                    accentColor={colors.primary}
                    compact
                  />
                </View>

                <RichMathText
                  content={q.prompt}
                  fontSize={13}
                  color={colors.textSecondary}
                  accentColor={colors.primary}
                  compact
                />

                <View style={styles.qFooterRow}>
                  <Button
                    title="Open Question"
                    size="sm"
                    variant="outline"
                    onPress={() => launchQuestions('My Notes Revision', [q])}
                  />
                </View>
              </Card>
            ))}

            {notedQuestions.length === 0 && (
              <Card style={styles.emptyCard}>
                <FileEdit size={28} color={colors.textSecondary} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No Personal Notes Yet</Text>
                <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                  Enable &quot;Always show My note&quot; inside Question View Settings or tap + Note while practicing.
                </Text>
              </Card>
            )}
          </>
        )}
      </ScrollView>

      {/* Create Notebook Modal */}
      <Modal visible={createOpen} transparent animationType="fade" onRequestClose={() => setCreateOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Create Notebook</Text>
              <TouchableOpacity onPress={() => setCreateOpen(false)}>
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="e.g. Rotational Motion Traps"
              placeholderTextColor={colors.textSecondary}
              value={newName}
              onChangeText={setNewName}
              style={[
                styles.modalInput,
                {
                  color: colors.text,
                  backgroundColor: colors.inputBg,
                  borderColor: colors.border,
                },
              ]}
            />

            <Text style={[styles.colorLabel, { color: colors.textSecondary }]}>Accent Tag Color</Text>
            <View style={styles.colorRow}>
              {NOTEBOOK_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => {
                    setNewColor(c);
                  }}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: c },
                    newColor === c && styles.colorCircleActive,
                  ]}
                />
              ))}
            </View>

            <Button title="Create Notebook" onPress={handleCreateNotebook} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  topTabsBar: { flexDirection: 'row', borderBottomWidth: 1, paddingHorizontal: 8 },
  topTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  topTabText: { fontSize: 12.5, fontWeight: '700' },
  scrollContent: { padding: 16, paddingBottom: 32, gap: 12 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800' },
  sectionSub: { fontSize: 11.5, marginTop: 2 },
  backLink: { fontSize: 13, fontWeight: '700' },
  nbCard: { padding: 14 },
  nbTopRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  nbTitle: { fontSize: 15, fontWeight: '800' },
  nbMeta: { fontSize: 12, marginTop: 3 },
  nbActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconDeleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  filterChip: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  filterChipText: { fontSize: 11.5, fontWeight: '700' },
  groupBlock: { gap: 8 },
  groupTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 0.7, marginTop: 4 },
  qCard: { padding: 14, gap: 10 },
  qCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  chapterMini: { fontSize: 11.5, fontWeight: '700', flex: 1 },
  qFooterRow: { alignItems: 'flex-end' },
  noteHighlight: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 3,
  },
  noteLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  noteText: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  emptyCard: { padding: 28, alignItems: 'center', gap: 8 },
  emptyTitle: { fontSize: 15, fontWeight: '800' },
  emptySub: { fontSize: 12.5, textAlign: 'center', lineHeight: 18 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: { padding: 18, borderRadius: 20, borderWidth: 1, gap: 12 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 16, fontWeight: '800' },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  colorLabel: { fontSize: 12, fontWeight: '600' },
  colorRow: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  colorCircle: { width: 28, height: 28, borderRadius: 14 },
  colorCircleActive: { borderWidth: 3, borderColor: '#FFFFFF' },
});

