import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { useTheme } from '../theme';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ApiErrorCard, EmptyResourceCard } from '../components/common/StateFeedbackCard';
import { AppErrorInfo, OfflineTestRecord } from '../types';
import { StorageService } from '../services/storage';
import { SupabaseService } from '../services/supabase';
import { computeRankPercentile } from '../utils/customTestBuilder';
import { 
  Plus, 
  Trash2, 
  TrendingUp, 
  Award, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  HelpCircle,
  BarChart3,
  BookOpen,
  Sparkles,
  AlertTriangle,
  Edit3
} from 'lucide-react-native';

export const OfflineTrackerScreen: React.FC = () => {
  const { colors, mode } = useTheme();
  const [tests, setTests] = useState<OfflineTestRecord[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);

  // Form State
  const [testName, setTestName] = useState('');
  const [instituteName, setInstituteName] = useState('');
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [testType, setTestType] = useState<OfflineTestRecord['testType']>('Part Test');
  const [subject, setSubject] = useState('Physics');
  const [maxMarks, setMaxMarks] = useState('100');
  const [obtainedMarks, setObtainedMarks] = useState('');
  const [correctCount, setCorrectCount] = useState('');
  const [incorrectCount, setIncorrectCount] = useState('');
  const [unattemptedCount, setUnattemptedCount] = useState('');
  const [rank, setRank] = useState('');
  const [totalCandidates, setTotalCandidates] = useState('1000');
  const [syllabus, setSyllabus] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<AppErrorInfo | null>(null);

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    const list = await StorageService.getOfflineTests();
    setTests(list);
  };

  const syncWithCloud = async (records: OfflineTestRecord[]) => {
    const res = await SupabaseService.syncOfflineTests(records);
    if (!res.success && res.errorInfo) {
      setSyncError(res.errorInfo);
    } else {
      setSyncError(null);
    }
  };

  const openCreateModal = () => {
    resetForm();
    setEditingRecordId(null);
    setModalVisible(true);
  };

  const openEditModal = (rec: OfflineTestRecord) => {
    setFormError(null);
    setEditingRecordId(rec.id);
    setTestName(rec.testName);
    setInstituteName(rec.instituteName);
    setTestDate(rec.date);
    setTestType(rec.testType);
    setSubject(rec.subject);
    setMaxMarks(String(rec.maxMarks));
    setObtainedMarks(String(rec.obtainedMarks));
    setCorrectCount(String(rec.correctCount));
    setIncorrectCount(String(rec.incorrectCount));
    setUnattemptedCount(String(rec.unattemptedCount));
    setRank(rec.rank ? String(rec.rank) : '');
    setTotalCandidates(rec.totalCandidates ? String(rec.totalCandidates) : '1000');
    setSyllabus(rec.syllabusCovered || '');
    setNotes(rec.notes || '');
    setModalVisible(true);
  };

  const handleAutoCalcFromCounts = (pos = 4, neg = 1) => {
    const corr = parseInt(correctCount, 10) || 0;
    const incorr = parseInt(incorrectCount, 10) || 0;
    const unatt = parseInt(unattemptedCount, 10) || 0;
    const totalQs = corr + incorr + unatt;
    const calcObt = corr * pos - incorr * neg;
    setObtainedMarks(String(calcObt));
    if (totalQs > 0) {
      setMaxMarks(String(totalQs * pos));
    }
    if (formError) setFormError(null);
  };

  const handleAddTest = async () => {
    setFormError(null);
    const max = parseFloat(maxMarks);
    const obt = parseFloat(obtainedMarks);

    if (!testName.trim()) {
      setFormError('Please enter a test name.');
      return;
    }
    if (isNaN(max) || max <= 0) {
      setFormError('Maximum marks must be a positive number.');
      return;
    }
    if (isNaN(obt) || obt < -max || obt > max) {
      setFormError(`Obtained marks must be between -${max} and ${max}.`);
      return;
    }

    const calculatedPercentage = parseFloat(((Math.max(0, obt) / max) * 100).toFixed(1));

    const newRecord: OfflineTestRecord = {
      id: editingRecordId || 'off_' + Date.now(),
      testName: testName.trim(),
      instituteName: instituteName.trim() || 'Coaching Institute',
      date: testDate || new Date().toISOString().split('T')[0],
      testType,
      subject,
      maxMarks: max,
      obtainedMarks: obt,
      correctCount: parseInt(correctCount, 10) || 0,
      incorrectCount: parseInt(incorrectCount, 10) || 0,
      unattemptedCount: parseInt(unattemptedCount, 10) || 0,
      rank: rank ? parseInt(rank, 10) : undefined,
      totalCandidates: totalCandidates ? parseInt(totalCandidates, 10) : undefined,
      syllabusCovered: syllabus.trim(),
      notes: notes.trim(),
      calculatedPercentage,
    };

    const updated = await StorageService.saveOfflineTest(newRecord);
    setTests(updated);
    void syncWithCloud(updated);
    setModalVisible(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    const updated = await StorageService.deleteOfflineTest(id);
    setTests(updated);
    void syncWithCloud(updated);
  };

  const resetForm = () => {
    setFormError(null);
    setEditingRecordId(null);
    setTestName('');
    setInstituteName('');
    setTestDate(new Date().toISOString().split('T')[0]);
    setTestType('Part Test');
    setSubject('Physics');
    setMaxMarks('100');
    setObtainedMarks('');
    setCorrectCount('');
    setIncorrectCount('');
    setUnattemptedCount('');
    setRank('');
    setTotalCandidates('1000');
    setSyllabus('');
    setNotes('');
  };

  // Performance calculations
  const filteredTests = selectedSubject === 'All' 
    ? tests 
    : tests.filter(t => t.subject.toLowerCase().includes(selectedSubject.toLowerCase()));

  const avgPercentage = tests.length > 0 
    ? (tests.reduce((acc, t) => acc + t.calculatedPercentage, 0) / tests.length).toFixed(1) 
    : '0';

  const personalBest = tests.length > 0 
    ? Math.max(...tests.map(t => t.calculatedPercentage)).toFixed(1) 
    : '0';

  const subjectOptions = ['All', 'Physics', 'Chemistry', 'Mathematics', 'Full PCM'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Action Header */}
      <View style={styles.topBar}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[styles.screenTitle, { color: colors.text }]}>Coaching Tracker</Text>
          <Text style={[styles.screenSubtitle, { color: colors.textSecondary }]}>
            Log & analyze offline institute test results
          </Text>
        </View>
        <Button
          title="Log Test"
          size="sm"
          onPress={openCreateModal}
          icon={<Plus size={16} color="#FFFFFF" />}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Analytics Summary Cards */}
        <View style={styles.metricsGrid}>
          <Card style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Average Score</Text>
              <TrendingUp size={16} color={colors.primary} />
            </View>
            <Text style={[styles.metricValue, { color: colors.text }]}>{avgPercentage}%</Text>
            <Text style={[styles.metricSub, { color: colors.textSecondary }]}>{tests.length} Tests Logged</Text>
          </Card>

          <Card style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Personal Best</Text>
              <Award size={16} color={colors.warning} />
            </View>
            <Text style={[styles.metricValue, { color: colors.warning }]}>{personalBest}%</Text>
            <Text style={[styles.metricSub, { color: colors.success }]}>Top score recorded</Text>
          </Card>
        </View>

        {/* Visual Score Trends / Bar Chart */}
        <Card style={styles.trendCard}>
          <View style={styles.trendHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <BarChart3 size={18} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>Performance Trends</Text>
            </View>
            <Badge label="Recent Scores" variant="primary" size="sm" />
          </View>

          <View style={styles.chartBarsContainer}>
            {tests.slice(0, 5).reverse().map((test, index) => {
              const barHeight = Math.max(20, (test.calculatedPercentage / 100) * 120);
              const isHigh = test.calculatedPercentage >= 75;

              return (
                <View key={test.id} style={styles.barColumn}>
                  <Text style={[styles.barPercentText, { color: colors.textSecondary }]}>
                    {test.calculatedPercentage}%
                  </Text>
                  <View style={[styles.barTrack, { backgroundColor: colors.borderSubtle }]}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: barHeight,
                          backgroundColor: isHigh ? colors.primary : colors.warning,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barDateText, { color: colors.textSecondary }]} numberOfLines={1}>
                    {test.date.slice(5)}
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {subjectOptions.map((sub) => (
            <TouchableOpacity
              key={sub}
              activeOpacity={0.7}
              onPress={() => {
                setSelectedSubject(sub);
              }}
              style={[
                styles.filterPill,
                {
                  backgroundColor: selectedSubject === sub ? colors.primary : colors.card,
                  borderColor: selectedSubject === sub ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterPillText,
                  { color: selectedSubject === sub ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                {sub}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {syncError && (
          <View style={{ marginBottom: 12 }}>
            <ApiErrorCard
              compact
              error={syncError}
              onRetry={() => void syncWithCloud(tests)}
              onUseOffline={() => setSyncError(null)}
              onDismiss={() => setSyncError(null)}
            />
          </View>
        )}

        {/* Test Records List */}
        <Text style={[styles.sectionHeading, { color: colors.text }]}>
          Test History ({filteredTests.length})
        </Text>

        {filteredTests.length === 0 ? (
          <EmptyResourceCard
            title={
              selectedSubject === 'All'
                ? 'No Coaching Tests Logged Yet'
                : `No ${selectedSubject} Tests Found`
            }
            message={
              selectedSubject === 'All'
                ? 'Tap "Log Test" to add your physical coaching or school exam marks and track percentile growth.'
                : `No offline test records match the "${selectedSubject}" filter.`
            }
            actionLabel="Log Test"
            onAction={openCreateModal}
            secondaryLabel={selectedSubject !== 'All' ? 'Show All Subjects' : undefined}
            onSecondaryAction={
              selectedSubject !== 'All' ? () => setSelectedSubject('All') : undefined
            }
          />
        ) : (
          filteredTests.map((test) => (
            <Card key={test.id} style={styles.testCard}>
              <View style={styles.testCardHeader}>
                <View style={{ flex: 1 }}>
                  <View style={styles.metaRow}>
                    <Badge label={test.subject.toUpperCase()} variant="primary" size="sm" />
                    <Badge label={test.testType} variant="neutral" size="sm" />
                  </View>
                  <Text style={[styles.testNameText, { color: colors.text }]}>{test.testName}</Text>
                  <View style={styles.subMetaRow}>
                    <Building2 size={13} color={colors.textSecondary} />
                    <Text style={[styles.instituteText, { color: colors.textSecondary }]}>
                      {test.instituteName}
                    </Text>
                    <Calendar size={13} color={colors.textSecondary} style={{ marginLeft: 8 }} />
                    <Text style={[styles.dateText, { color: colors.textSecondary }]}>{test.date}</Text>
                  </View>
                </View>

                {/* Score Pill */}
                <View style={[styles.scoreBadge, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
                  <Text style={[styles.scoreBig, { color: colors.primary }]}>{test.calculatedPercentage}%</Text>
                  <Text style={[styles.scoreSub, { color: colors.textSecondary }]}>
                    {test.obtainedMarks} / {test.maxMarks}
                  </Text>
                </View>
              </View>

              {/* Accuracy & Counts Row */}
              <View style={[styles.accuracyRow, { borderTopColor: colors.borderSubtle }]}>
                <View style={styles.accItem}>
                  <CheckCircle2 size={14} color={colors.success} />
                  <Text style={[styles.accCount, { color: colors.success }]}>{test.correctCount} Correct</Text>
                </View>
                <View style={styles.accItem}>
                  <XCircle size={14} color={colors.error} />
                  <Text style={[styles.accCount, { color: colors.error }]}>{test.incorrectCount} Wrong</Text>
                </View>
                <View style={styles.accItem}>
                  <HelpCircle size={14} color={colors.textSecondary} />
                  <Text style={[styles.accCount, { color: colors.textSecondary }]}>{test.unattemptedCount} Skipped</Text>
                </View>
                {test.rank && (
                  <View style={styles.rankPill}>
                    <Text style={[styles.rankText, { color: colors.primary }]}>
                      Rank #{test.rank}
                      {test.totalCandidates
                        ? `/${test.totalCandidates} (${computeRankPercentile(test.rank, test.totalCandidates)}%ile)`
                        : ''}
                    </Text>
                  </View>
                )}
              </View>

              {/* Notes & Syllabus if available */}
              {test.syllabusCovered ? (
                <View style={styles.metaRowWithIcon}>
                  <BookOpen size={13} color={colors.primary} />
                  <Text style={[styles.notesText, { color: colors.textSecondary }]} numberOfLines={2}>
                    <Text style={{ fontWeight: '600', color: colors.text }}>Syllabus: </Text>
                    {test.syllabusCovered}
                  </Text>
                </View>
              ) : null}

              {test.notes ? (
                <View style={styles.metaRowWithIcon}>
                  <Sparkles size={13} color={colors.warning} />
                  <Text style={[styles.notesText, { color: colors.textSecondary }]} numberOfLines={2}>
                    <Text style={{ fontWeight: '600', color: colors.text }}>Notes: </Text>
                    {test.notes}
                  </Text>
                </View>
              ) : null}

              {/* Edit & Delete Actions */}
              <View style={styles.cardFooter}>
                <TouchableOpacity onPress={() => openEditModal(test)} style={styles.editEntryBtn}>
                  <Edit3 size={14} color={colors.primary} />
                  <Text style={[styles.deleteText, { color: colors.primary }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(test.id)} style={styles.deleteBtn}>
                  <Trash2 size={14} color={colors.error} />
                  <Text style={[styles.deleteText, { color: colors.error }]}>Delete Entry</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Add / Edit Test Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingRecordId ? 'Edit Offline Test Record' : 'Log Offline Test Record'}
            </Text>

            {formError && (
              <View
                style={[
                  styles.errorBanner,
                  { backgroundColor: colors.errorBg, borderColor: colors.error },
                ]}
              >
                <AlertTriangle size={15} color={colors.error} />
                <Text style={[styles.errorBannerText, { color: mode === 'dark' ? '#FCA5A5' : colors.error }]}>
                  {formError}
                </Text>
              </View>
            )}

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 440 }}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Test Name *</Text>
              <TextInput
                style={[
                  styles.input,
                  { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
                ]}
                placeholder="e.g. Major Test 1 - Mechanics"
                placeholderTextColor={colors.textSecondary}
                value={testName}
                onChangeText={(txt) => {
                  if (formError) setFormError(null);
                  setTestName(txt);
                }}
              />

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Coaching / Institute Name</Text>
              <TextInput
                style={[
                  styles.input,
                  { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
                ]}
                placeholder="e.g. Allen, Aakash, FIITJEE, School"
                placeholderTextColor={colors.textSecondary}
                value={instituteName}
                onChangeText={setInstituteName}
              />

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Subject & Category</Text>
              <View style={styles.chipRow}>
                {['Physics', 'Chemistry', 'Mathematics', 'Full PCM'].map((sub) => {
                  const active = subject === sub;
                  return (
                    <TouchableOpacity
                      key={sub}
                      onPress={() => setSubject(sub)}
                      style={[
                        styles.miniChip,
                        {
                          backgroundColor: active ? colors.primary : colors.surface,
                          borderColor: active ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '700', color: active ? '#FFFFFF' : colors.text }}>
                        {sub}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={[styles.chipRow, { marginTop: 6 }]}>
                {(['Part Test', 'Full Syllabus Mock', 'Topic Drill', 'School Exam'] as const).map((tt) => {
                  const active = testType === tt;
                  return (
                    <TouchableOpacity
                      key={tt}
                      onPress={() => setTestType(tt)}
                      style={[
                        styles.miniChip,
                        {
                          backgroundColor: active ? colors.secondary : colors.surface,
                          borderColor: active ? colors.secondary : colors.border,
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '700', color: active ? '#FFFFFF' : colors.text }}>
                        {tt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.inputRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Max Marks *</Text>
                  <TextInput
                    style={[
                      styles.input,
                      { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
                    ]}
                    keyboardType="numeric"
                    value={maxMarks}
                    onChangeText={(txt) => {
                      if (formError) setFormError(null);
                      setMaxMarks(txt);
                    }}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Obtained Marks *</Text>
                  <TextInput
                    style={[
                      styles.input,
                      { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
                    ]}
                    keyboardType="numeric"
                    placeholder="e.g. 78"
                    placeholderTextColor={colors.textSecondary}
                    value={obtainedMarks}
                    onChangeText={(txt) => {
                      if (formError) setFormError(null);
                      setObtainedMarks(txt);
                    }}
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Correct Qs</Text>
                  <TextInput
                    style={[
                      styles.input,
                      { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
                    ]}
                    keyboardType="numeric"
                    placeholder="e.g. 20"
                    placeholderTextColor={colors.textSecondary}
                    value={correctCount}
                    onChangeText={setCorrectCount}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Incorrect Qs</Text>
                  <TextInput
                    style={[
                      styles.input,
                      { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
                    ]}
                    keyboardType="numeric"
                    placeholder="e.g. 2"
                    placeholderTextColor={colors.textSecondary}
                    value={incorrectCount}
                    onChangeText={setIncorrectCount}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Skipped</Text>
                  <TextInput
                    style={[
                      styles.input,
                      { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
                    ]}
                    keyboardType="numeric"
                    placeholder="3"
                    placeholderTextColor={colors.textSecondary}
                    value={unattemptedCount}
                    onChangeText={setUnattemptedCount}
                  />
                </View>
              </View>

              <View style={styles.autoCalcRow}>
                <TouchableOpacity
                  onPress={() => handleAutoCalcFromCounts(4, 1)}
                  style={[styles.autoCalcBtn, { backgroundColor: colors.surface, borderColor: colors.primary }]}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: colors.primary }}>
                    Auto-Calc Score (+4 / -1)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleAutoCalcFromCounts(1, 0)}
                  style={[styles.autoCalcBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: colors.text }}>
                    Auto-Calc (+1 / 0)
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Rank (Optional)</Text>
                  <TextInput
                    style={[
                      styles.input,
                      { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
                    ]}
                    keyboardType="numeric"
                    placeholder="e.g. 42"
                    placeholderTextColor={colors.textSecondary}
                    value={rank}
                    onChangeText={setRank}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Total Candidates</Text>
                  <TextInput
                    style={[
                      styles.input,
                      { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
                    ]}
                    keyboardType="numeric"
                    placeholder="e.g. 1000"
                    placeholderTextColor={colors.textSecondary}
                    value={totalCandidates}
                    onChangeText={setTotalCandidates}
                  />
                </View>
              </View>

              {Boolean(rank) && Boolean(totalCandidates) && parseInt(rank, 10) > 0 && parseInt(totalCandidates, 10) > 0 && (
                <Text style={{ fontSize: 11.5, fontWeight: '700', color: colors.primary, marginTop: 6 }}>
                  Projected Cohort Percentile: {computeRankPercentile(parseInt(rank, 10), parseInt(totalCandidates, 10))}%ile
                </Text>
              )}

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Syllabus Covered</Text>
              <TextInput
                style={[
                  styles.input,
                  { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
                ]}
                placeholder="e.g. Kinematics, Work Power, Electrostatics"
                placeholderTextColor={colors.textSecondary}
                value={syllabus}
                onChangeText={setSyllabus}
              />

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Notes & Mistakes Analysis</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.text,
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    height: 60,
                  },
                ]}
                multiline
                placeholder="Where did you lose marks? Silly mistakes, formulas forgotten?"
                placeholderTextColor={colors.textSecondary}
                value={notes}
                onChangeText={setNotes}
              />
            </ScrollView>

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => {
                  setFormError(null);
                  setModalVisible(false);
                }}
                style={{ flex: 1 }}
              />
              <Button
                title="Save Test"
                variant="primary"
                onPress={handleAddTest}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 12,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 40,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  metricCard: {
    flex: 1,
    padding: 14,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  metricSub: {
    fontSize: 11,
  },
  trendCard: {
    padding: 16,
    marginBottom: 16,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  chartBarsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 150,
    paddingTop: 10,
  },
  barColumn: {
    alignItems: 'center',
    width: 44,
  },
  barPercentText: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
  },
  barTrack: {
    width: 20,
    height: 110,
    borderRadius: 10,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 10,
  },
  barDateText: {
    fontSize: 10,
    marginTop: 6,
  },
  filterScroll: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  testCard: {
    padding: 16,
    marginBottom: 12,
  },
  testCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  testNameText: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  subMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4,
  },
  instituteText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 11,
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 70,
  },
  scoreBig: {
    fontSize: 17,
    fontWeight: '800',
  },
  scoreSub: {
    fontSize: 10,
  },
  accuracyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: 10,
    rowGap: 6,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  accItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  accCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  rankPill: {
    marginLeft: 'auto',
  },
  rankText: {
    fontSize: 12,
    fontWeight: '700',
  },
  notesText: {
    fontSize: 12,
    lineHeight: 16,
  },
  metaRowWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  cardFooter: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 14,
  },
  editEntryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  deleteText: {
    fontSize: 11,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 540,
    alignSelf: 'center',
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  miniChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
    borderWidth: 1,
  },
  autoCalcRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  autoCalcBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
    borderWidth: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  errorBannerText: {
    fontSize: 12.5,
    fontWeight: '700',
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  inputRow: {
    flexDirection: 'row',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
});

