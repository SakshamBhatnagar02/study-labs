import React, { useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useTheme } from '../../theme';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { EmptyResourceCard } from '../common/StateFeedbackCard';
import {
  ATTENDANCE_POLICY_DISCLAIMER,
  computeClubCohortStats,
} from '../../utils/clubsEngine';
import type {
  AssignmentSubmission,
  AttendanceRecord,
  AttendanceStatus,
  InstituteAssignment,
  StudyClub,
} from '../../types';
import {
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  Info,
  Plus,
  UserCheck,
  X,
} from 'lucide-react-native';

export type TeacherTabId = 'requests' | 'assignments' | 'attendance' | 'insights';

interface TeacherManagementModalProps {
  visible: boolean;
  onClose: () => void;
  club: StudyClub;
  actorName: string;
  canManageClub: boolean;
  canCreateAssignments: boolean;
  canTakeAttendance: boolean;
  onApproveRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string) => void;
  onCreateAssignment: (assignment: InstituteAssignment) => void;
  onGradeSubmission: (submissionId: string, score: number, feedback: string) => void;
  onSaveAttendanceBatch: (records: AttendanceRecord[]) => void;
}

const ATTENDANCE_STATUSES: Array<{ id: AttendanceStatus; label: string; colorKey: 'success' | 'warning' | 'error' | 'cyan' }> = [
  { id: 'present', label: 'Present', colorKey: 'success' },
  { id: 'late', label: 'Late', colorKey: 'warning' },
  { id: 'absent', label: 'Absent', colorKey: 'error' },
  { id: 'excused', label: 'Excused', colorKey: 'cyan' },
];

export const TeacherManagementModal: React.FC<TeacherManagementModalProps> = ({
  visible,
  onClose,
  club,
  actorName,
  canManageClub,
  canCreateAssignments,
  canTakeAttendance,
  onApproveRequest,
  onRejectRequest,
  onCreateAssignment,
  onGradeSubmission,
  onSaveAttendanceBatch,
}) => {
  const { colors, mode } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<TeacherTabId>('assignments');
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  // Assignment Builder State
  const [asgTitle, setAsgTitle] = useState('');
  const [asgSubject, setAsgSubject] = useState('Physics & Chemistry');
  const [asgDesc, setAsgDesc] = useState('');
  const [asgDueDate, setAsgDueDate] = useState('2026-11-24');
  const [asgMaxMarks, setAsgMaxMarks] = useState('25');
  const [linkCoreQuiz, setLinkCoreQuiz] = useState(true);
  const [linkedTestMode, setLinkedTestMode] = useState<'practice' | 'exam'>('exam');

  // Grading inline state
  const [scoreInputs, setScoreInputs] = useState<Record<string, string>>({});
  const [feedbackInputs, setFeedbackInputs] = useState<Record<string, string>>({});

  // Attendance state
  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [attDate, setAttDate] = useState(todayKey);
  const [attSessionLabel, setAttSessionLabel] = useState('Morning Concept Lecture & Drill');
  const studentMembers = useMemo(
    () => club.members.filter((m) => m.staffLabel === 'Student'),
    [club.members]
  );
  const [attDraft, setAttDraft] = useState<Record<string, AttendanceStatus>>({});

  const stats = useMemo(() => computeClubCohortStats(club), [club]);
  const pendingRequests = club.joinRequests.filter((r) => r.status === 'pending');

  const handlePublishAssignment = () => {
    const cleanTitle = asgTitle.trim();
    if (cleanTitle.length < 3) {
      setFeedbackBanner('Enter an assignment title (at least 3 characters).');
      return;
    }
    const assignChannel =
      club.channels.find((c) => c.type === 'assignments') ||
      club.channels.find((c) => c.type === 'text') ||
      club.channels[0];

    const created: InstituteAssignment = {
      id: `asg_${Date.now()}`,
      clubId: club.id,
      channelId: assignChannel.id,
      title: cleanTitle,
      subject: asgSubject.trim() || 'STEM Mixed',
      description:
        asgDesc.trim() || 'Complete the linked Study Labs quiz and submit a short reflection note.',
      dueDate: asgDueDate.trim() || todayKey,
      maxMarks: Math.max(5, parseInt(asgMaxMarks, 10) || 20),
      createdByName: actorName,
      createdAt: new Date().toISOString(),
      linkedQuestionIds: linkCoreQuiz ? ['q_p1', 'q_p2', 'q_c1', 'q_m1'] : undefined,
      linkedTestMode: linkCoreQuiz ? linkedTestMode : undefined,
      targetExamLabel: `${club.name} Cohort`,
    };
    onCreateAssignment(created);
    setAsgTitle('');
    setAsgDesc('');
    setFeedbackBanner(`Published "${created.title}" into #${assignChannel.name}!`);
  };

  const handleCommitAttendance = () => {
    if (studentMembers.length === 0) {
      setFeedbackBanner('No enrolled Student members to record participation for.');
      return;
    }
    const nowIso = new Date().toISOString();
    const records: AttendanceRecord[] = studentMembers.map((stu) => ({
      id: `att_${Date.now()}_${stu.userId}`,
      clubId: club.id,
      date: attDate.trim() || todayKey,
      sessionLabel: attSessionLabel.trim() || 'Cohort Study Session',
      studentId: stu.userId,
      studentName: stu.name,
      status: attDraft[stu.userId] || 'present',
      markedByName: actorName,
      recordedAt: nowIso,
    }));
    onSaveAttendanceBatch(records);
    setFeedbackBanner(
      `Saved participation log for ${records.length} students on ${attDate} (${attSessionLabel}).`
    );
  };

  const tabs: Array<{ id: TeacherTabId; label: string; Icon: typeof ClipboardList }> = [
    { id: 'assignments', label: `Assignments (${club.assignments.length})`, Icon: ClipboardList },
    { id: 'attendance', label: 'Attendance', Icon: CalendarCheck },
    { id: 'requests', label: `Join Requests (${pendingRequests.length})`, Icon: UserCheck },
    { id: 'insights', label: 'Insights', Icon: BarChart3 },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.sheet,
            {
              width: Math.min(windowWidth - 24, 640),
              maxWidth: '100%',
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 0, paddingRight: 8 }}>
              <View style={[styles.hdrIcon, { backgroundColor: mode === 'dark' ? '#431407' : '#FFEDD5' }]}>
                <GraduationCap size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                  Teacher & Institute Console
                </Text>
                <Text style={[styles.sub, { color: colors.textSecondary }]} numberOfLines={2}>
                  {club.name} · Assignments, Grading, Participation Logs & Requests
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={{ flexShrink: 0, padding: 4 }} accessibilityLabel="Close teacher suite">
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={[styles.tabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
            contentContainerStyle={{ gap: 6, paddingHorizontal: 14, paddingVertical: 8 }}
          >
            {tabs.map(({ id, label, Icon }) => {
              const active = activeTab === id;
              return (
                <TouchableOpacity
                  key={id}
                  onPress={() => {
                    setActiveTab(id);
                    setFeedbackBanner(null);
                  }}
                  style={[
                    styles.tabBtn,
                    {
                      backgroundColor: active ? colors.primary : colors.card,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Icon size={13} color={active ? '#FFFFFF' : colors.textSecondary} />
                  <Text style={{ fontSize: 11.5, fontWeight: '700', color: active ? '#FFFFFF' : colors.text }}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <ScrollView style={styles.body} contentContainerStyle={{ gap: 12, paddingVertical: 14 }}>
            {feedbackBanner && (
              <View style={[styles.bannerOk, { backgroundColor: mode === 'dark' ? '#052E16' : '#DCFCE7', borderColor: colors.success }]}>
                <CheckCircle2 size={14} color={colors.success} />
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.success, flex: 1 }}>
                  {feedbackBanner}
                </Text>
              </View>
            )}

            {activeTab === 'assignments' && (
              <>
                {canCreateAssignments ? (
                  <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.secLbl, { color: colors.textSecondary }]}>PUBLISH NEW ASSIGNMENT / QUIZ</Text>
                    <TextInput
                      value={asgTitle}
                      onChangeText={setAsgTitle}
                      placeholder="Assignment title (e.g. Rotational Dynamics Weekly Quiz #5)"
                      placeholderTextColor={colors.textSecondary}
                      style={[styles.input, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border }]}
                    />
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TextInput
                        value={asgSubject}
                        onChangeText={setAsgSubject}
                        placeholder="Subject"
                        placeholderTextColor={colors.textSecondary}
                        style={[styles.input, { flex: 1, color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border }]}
                      />
                      <TextInput
                        value={asgDueDate}
                        onChangeText={setAsgDueDate}
                        placeholder="Due YYYY-MM-DD"
                        placeholderTextColor={colors.textSecondary}
                        style={[styles.input, { width: 118, color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border }]}
                      />
                      <TextInput
                        value={asgMaxMarks}
                        onChangeText={setAsgMaxMarks}
                        keyboardType="numeric"
                        placeholder="Marks"
                        placeholderTextColor={colors.textSecondary}
                        style={[styles.input, { width: 70, color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border }]}
                      />
                    </View>
                    <TextInput
                      value={asgDesc}
                      onChangeText={setAsgDesc}
                      multiline
                      placeholder="Instructions & concept checklist..."
                      placeholderTextColor={colors.textSecondary}
                      style={[
                        styles.input,
                        { minHeight: 54, textAlignVertical: 'top', color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
                      ]}
                    />
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                      <TouchableOpacity
                        onPress={() => setLinkCoreQuiz((v) => !v)}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: linkCoreQuiz ? colors.cyan : colors.card,
                            borderColor: linkCoreQuiz ? colors.cyan : colors.border,
                          },
                        ]}
                      >
                        <Text style={{ fontSize: 11.5, fontWeight: '700', color: linkCoreQuiz ? '#0F172A' : colors.textSecondary }}>
                          {linkCoreQuiz ? '✓ Link Study Labs 4-Q Quiz' : '+ Link Study Labs Quiz'}
                        </Text>
                      </TouchableOpacity>
                      {linkCoreQuiz && (
                        <View style={{ flexDirection: 'row', gap: 6 }}>
                          {(['exam', 'practice'] as const).map((m) => (
                            <TouchableOpacity
                              key={m}
                              onPress={() => setLinkedTestMode(m)}
                              style={[
                                styles.chip,
                                {
                                  backgroundColor: linkedTestMode === m ? colors.primary : colors.card,
                                  borderColor: linkedTestMode === m ? colors.primary : colors.border,
                                },
                              ]}
                            >
                              <Text style={{ fontSize: 11, fontWeight: '700', color: linkedTestMode === m ? '#FFFFFF' : colors.textSecondary }}>
                                {m === 'exam' ? 'Timed Exam' : 'Practice'}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                    <Button
                      title="Publish Assignment to Channel"
                      onPress={handlePublishAssignment}
                      icon={<Plus size={15} color="#FFFFFF" />}
                    />
                  </View>
                ) : (
                  <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.warning }]}>
                    <Text style={{ fontSize: 12, color: colors.warning, fontWeight: '700' }}>
                      Your current role view does not allow creating assignments. Switch to Teacher or Owner to publish & grade.
                    </Text>
                  </View>
                )}

                <Text style={[styles.secLbl, { color: colors.textSecondary }]}>
                  SUBMISSIONS TO REVIEW ({club.submissions.length})
                </Text>
                {club.submissions.length === 0 ? (
                  <EmptyResourceCard
                    title="No Student Submissions Yet"
                    message="Once students submit written takeaways or quiz reflections from #assignments-and-tests, grade them here."
                  />
                ) : (
                  club.submissions.map((sub: AssignmentSubmission) => {
                    const asg = club.assignments.find((a) => a.id === sub.assignmentId);
                    const scoreVal = scoreInputs[sub.id] ?? (sub.score !== undefined ? String(sub.score) : '');
                    const fbVal = feedbackInputs[sub.id] ?? sub.feedback ?? '';
                    return (
                      <View
                        key={sub.id}
                        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={{ fontSize: 13.5, fontWeight: '800', color: colors.text }}>
                            {sub.studentName}
                          </Text>
                          <Badge
                            label={sub.status === 'graded' ? `${sub.score ?? 0}/${asg?.maxMarks ?? 20} Graded` : 'Pending Review'}
                            variant={sub.status === 'graded' ? 'success' : 'warning'}
                            size="sm"
                          />
                        </View>
                        <Text style={{ fontSize: 11, color: colors.primary, fontWeight: '700' }}>
                          {asg?.title || sub.assignmentId}
                        </Text>
                        <Text style={{ fontSize: 12, color: colors.text, lineHeight: 17 }}>{sub.responseText}</Text>

                        {canCreateAssignments && (
                          <View style={{ flexDirection: 'row', gap: 8, marginTop: 4, alignItems: 'center' }}>
                            <TextInput
                              value={scoreVal}
                              onChangeText={(v) => setScoreInputs((p) => ({ ...p, [sub.id]: v }))}
                              keyboardType="numeric"
                              placeholder={`Score / ${asg?.maxMarks ?? 20}`}
                              placeholderTextColor={colors.textSecondary}
                              style={[styles.input, { width: 88, color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border }]}
                            />
                            <TextInput
                              value={fbVal}
                              onChangeText={(v) => setFeedbackInputs((p) => ({ ...p, [sub.id]: v }))}
                              placeholder="Written faculty feedback..."
                              placeholderTextColor={colors.textSecondary}
                              style={[styles.input, { flex: 1, color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border }]}
                            />
                            <Button
                              title="Save"
                              size="sm"
                              onPress={() => {
                                const num = Math.max(0, Math.min(asg?.maxMarks ?? 100, parseInt(scoreVal, 10) || 0));
                                onGradeSubmission(sub.id, num, fbVal.trim() || 'Reviewed cleanly.');
                                setFeedbackBanner(`Saved grade ${num}/${asg?.maxMarks ?? 20} for ${sub.studentName}.`);
                              }}
                            />
                          </View>
                        )}
                      </View>
                    );
                  })
                )}
              </>
            )}

            {activeTab === 'attendance' && (
              <>
                {/* Mandatory Participation Transparency Notice */}
                <View style={[styles.policyCard, { backgroundColor: mode === 'dark' ? '#172554' : '#EFF6FF', borderColor: colors.info }]}>
                  <Info size={16} color={colors.info} />
                  <Text style={{ fontSize: 11.5, color: colors.text, flex: 1, lineHeight: 17 }}>
                    <Text style={{ fontWeight: '800', color: colors.info }}>Participation Policy: </Text>
                    {ATTENDANCE_POLICY_DISCLAIMER}
                  </Text>
                </View>

                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.secLbl, { color: colors.textSecondary }]}>SESSION LOG METADATA</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TextInput
                      value={attDate}
                      onChangeText={setAttDate}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={colors.textSecondary}
                      style={[styles.input, { width: 120, color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border }]}
                    />
                    <TextInput
                      value={attSessionLabel}
                      onChangeText={setAttSessionLabel}
                      placeholder="Session topic or batch check-in label"
                      placeholderTextColor={colors.textSecondary}
                      style={[styles.input, { flex: 1, color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border }]}
                    />
                  </View>

                  {studentMembers.map((stu) => {
                    const status = attDraft[stu.userId] || 'present';
                    return (
                      <View
                        key={stu.userId}
                        style={{
                          paddingVertical: 8,
                          borderTopWidth: StyleSheet.hairlineWidth,
                          borderTopColor: colors.borderSubtle,
                          gap: 6,
                        }}
                      >
                        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>
                          {stu.name} <Text style={{ fontSize: 11, color: colors.textSecondary }}>({stu.ioId})</Text>
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                          {ATTENDANCE_STATUSES.map((st) => {
                            const active = status === st.id;
                            const tint = colors[st.colorKey];
                            return (
                              <TouchableOpacity
                                key={st.id}
                                disabled={!canTakeAttendance}
                                onPress={() => setAttDraft((prev) => ({ ...prev, [stu.userId]: st.id }))}
                                style={[
                                  styles.chip,
                                  {
                                    backgroundColor: active ? tint : colors.card,
                                    borderColor: active ? tint : colors.border,
                                  },
                                ]}
                              >
                                <Text style={{ fontSize: 11, fontWeight: '700', color: active ? '#FFFFFF' : colors.textSecondary }}>
                                  {st.label}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    );
                  })}

                  {canTakeAttendance && (
                    <Button title="Record Session Participation Batch" onPress={handleCommitAttendance} />
                  )}
                </View>

                <Text style={[styles.secLbl, { color: colors.textSecondary }]}>
                  RECENT ATTENDANCE ENTRIES ({club.attendance.length})
                </Text>
                {club.attendance.slice(0, 8).map((rec) => (
                  <View
                    key={rec.id}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 10,
                      borderRadius: 10,
                      borderWidth: 1,
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12.5, fontWeight: '700', color: colors.text }}>
                        {rec.studentName} · {rec.date}
                      </Text>
                      <Text style={{ fontSize: 11, color: colors.textSecondary }}>{rec.sessionLabel}</Text>
                    </View>
                    <Badge
                      label={rec.status.toUpperCase()}
                      variant={
                        rec.status === 'present'
                          ? 'success'
                          : rec.status === 'late'
                          ? 'warning'
                          : rec.status === 'absent'
                          ? 'error'
                          : 'neutral'
                      }
                      size="sm"
                    />
                  </View>
                ))}
              </>
            )}

            {activeTab === 'requests' && (
              <>
                {pendingRequests.length === 0 ? (
                  <EmptyResourceCard
                    title="No Pending Join Requests"
                    message="Learners who request membership to private cohorts appear here for faculty review."
                  />
                ) : (
                  pendingRequests.map((req) => (
                    <View
                      key={req.id}
                      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 13.5, fontWeight: '800', color: colors.text }}>{req.name}</Text>
                        <Badge label={req.ioId} variant="neutral" size="sm" />
                      </View>
                      <Text style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 17 }}>
                        "{req.message}"
                      </Text>
                      {canManageClub && (
                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                          <Button
                            title="Decline"
                            variant="outline"
                            size="sm"
                            onPress={() => onRejectRequest(req.id)}
                            style={{ flex: 1 }}
                          />
                          <Button
                            title="Approve Student"
                            size="sm"
                            onPress={() => {
                              onApproveRequest(req.id);
                              setFeedbackBanner(`Approved ${req.name} as a Student member!`);
                            }}
                            style={{ flex: 1.4 }}
                          />
                        </View>
                      )}
                    </View>
                  ))
                )}
              </>
            )}

            {activeTab === 'insights' && (
              <View style={styles.statsGrid}>
                {[
                  { label: 'Total Members', value: String(stats.totalMembers), color: colors.primary },
                  { label: 'Enrolled Students', value: String(stats.studentCount), color: colors.cyan },
                  { label: 'Attendance Rate', value: `${stats.attendancePct}%`, color: colors.success },
                  { label: 'Active Assignments', value: String(stats.totalAssignments), color: colors.warning },
                  { label: 'Graded Submissions', value: String(stats.gradedCount), color: '#8B5CF6' },
                  { label: 'Pending Review', value: String(stats.pendingReviewCount), color: colors.error },
                ].map((box) => (
                  <View
                    key={box.label}
                    style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  >
                    <Text style={{ fontSize: 20, fontWeight: '900', color: box.color }}>{box.value}</Text>
                    <Text style={{ fontSize: 11, color: colors.textSecondary, textAlign: 'center' }}>{box.label}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.68)', justifyContent: 'center', alignItems: 'center', padding: 12 },
  sheet: {
    width: '100%',
    maxWidth: 640,
    maxHeight: '90%',
    alignSelf: 'center',
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
  },
  hdrIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 15.5, fontWeight: '800' },
  sub: { fontSize: 11, marginTop: 1 },
  tabBar: { maxHeight: 50, borderBottomWidth: 1 },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
    borderWidth: 1,
  },
  body: { paddingHorizontal: 16 },
  bannerOk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  policyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 11,
    borderRadius: 12,
    borderWidth: 1,
  },
  card: { padding: 12, borderRadius: 14, borderWidth: 1, gap: 8 },
  secLbl: { fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  input: {
    minWidth: 0,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 8,
    fontSize: 13,
  },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9, borderWidth: 1 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statBox: {
    width: '47%',
    minWidth: 140,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
});
