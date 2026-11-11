import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useTheme } from '../theme';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { RichMathText } from '../components/common/MathRenderer';
import { EmptyResourceCard } from '../components/common/StateFeedbackCard';
import { ClubDirectoryModal } from '../components/clubs/ClubDirectoryModal';
import { ClubPreviewModal } from '../components/clubs/ClubPreviewModal';
import { CreateClubModal } from '../components/clubs/CreateClubModal';
import {
  ChannelSettingsModal,
  ChannelSettingsTabId,
} from '../components/clubs/ChannelSettingsModal';
import { TeacherManagementModal } from '../components/clubs/TeacherManagementModal';
import { DEFAULT_USER, StorageService } from '../services/storage';
import { SoundManager } from '../services/soundManager';
import { HapticManager } from '../services/hapticManager';
import {
  ATTENDANCE_POLICY_DISCLAIMER,
  canPostInChannel,
  canViewChannel,
  checkMessageAntiSpam,
  resolveMemberPermissions,
} from '../utils/clubsEngine';
import type {
  AssignmentSubmission,
  AttendanceRecord,
  ChannelCategoryType,
  ChannelType,
  ClubChannel,
  ClubMessage,
  ClubRole,
  ClubsWorkspaceState,
  InstituteAssignment,
  SafetyReport,
  StudyClub,
  SystemStaffRole,
  TestSessionLaunch,
  UserProfile,
} from '../types';
import {
  AtSign,
  Award,
  BarChart2,
  BookmarkCheck,
  CheckCircle2,
  Compass,
  Eye,
  FileText,
  Flag,
  GraduationCap,
  Hash,
  Lock,
  Menu,
  MessageSquare,
  Pin,
  Play,
  Plus,
  Send,
  Settings,
  ShieldCheck,
  Trash2,
  Upload,
  UserPlus,
  Users,
  X,
} from 'lucide-react-native';

interface ClubsScreenProps {
  onLaunchSession: (session: TestSessionLaunch) => void;
  onOpenProfile?: () => void;
}

const ROLE_SIM_OPTIONS: Array<SystemStaffRole | 'actual'> = [
  'actual',
  'Institute Owner',
  'Teacher',
  'Class Monitor',
  'Student',
];

export const ClubsScreen: React.FC<ClubsScreenProps> = ({
  onLaunchSession,
  onOpenProfile,
}) => {
  const { colors, mode } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 940;
  const isTablet = width >= 720;

  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER);
  const [workspace, setWorkspace] = useState<ClubsWorkspaceState | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileMembersOpen, setMobileMembersOpen] = useState(false);

  // Modals
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [previewClub, setPreviewClub] = useState<StudyClub | null>(null);
  const [createClubOpen, setCreateClubOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<ChannelSettingsTabId>('info');
  const [teacherOpen, setTeacherOpen] = useState(false);

  // Quick Channel Create Modal
  const [createChannelOpen, setCreateChannelOpen] = useState(false);
  const [newChName, setNewChName] = useState('');
  const [newChTopic, setNewChTopic] = useState('');
  const [newChCategory, setNewChCategory] = useState<ChannelCategoryType>('Study Channels');
  const [newChType, setNewChType] = useState<ChannelType>('text');

  // Composer & Message Actions
  const [draftMsg, setDraftMsg] = useState('');
  const [replySnippet, setReplySnippet] = useState<string | null>(null);
  const [antiSpamNotice, setAntiSpamNotice] = useState<string | null>(null);
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [mentionPickerOpen, setMentionPickerOpen] = useState(false);

  // Poll / Resource / Assignment Takeaway / Safety Modals
  const [pollModalOpen, setPollModalOpen] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOpt1, setPollOpt1] = useState('');
  const [pollOpt2, setPollOpt2] = useState('');
  const [pollOpt3, setPollOpt3] = useState('');

  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [resTitle, setResTitle] = useState('');
  const [resSummary, setResSummary] = useState('');
  const [resKind, setResKind] = useState<'pdf' | 'notes' | 'ppt' | 'image'>('pdf');

  const [submissionModalAsg, setSubmissionModalAsg] = useState<InstituteAssignment | null>(null);
  const [submissionNote, setSubmissionNote] = useState('');

  const [dmModalThreadId, setDmModalThreadId] = useState<string | null>(null);
  const [dmDraft, setDmDraft] = useState('');
  const [reportModalTarget, setReportModalTarget] = useState<{
    type: 'message' | 'user' | 'club';
    id: string;
    name: string;
  } | null>(null);
  const [reportReason, setReportReason] = useState('Off-topic / Spam link');
  const [reportDetails, setReportDetails] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadWorkspace = useCallback(async () => {
    const [prof, ws] = await Promise.all([
      StorageService.getUserProfile(),
      StorageService.getClubsWorkspace(),
    ]);
    setProfile(prof);
    setWorkspace(ws);
  }, []);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2600);
  };

  const persistWorkspace = async (next: ClubsWorkspaceState) => {
    setWorkspace(next);
    await StorageService.saveClubsWorkspace(next);
  };

  const activeClub = useMemo(() => {
    if (!workspace) return null;
    return (
      workspace.clubs.find((c) => c.id === workspace.activeClubId) || workspace.clubs[0] || null
    );
  }, [workspace]);

  const simulatedRole: SystemStaffRole | 'actual' = useMemo(() => {
    if (!workspace || !activeClub) return 'actual';
    return workspace.roleOverrideByClub[activeClub.id] || 'actual';
  }, [workspace, activeClub]);

  const myPermissions = useMemo(() => {
    if (!activeClub) {
      return resolveMemberPermissions(
        {
          id: 'tmp',
          name: 'tmp',
          slug: 'tmp',
          inviteCode: 'TMP',
          kind: 'study_club',
          category: 'Peer Study Guild',
          description: '',
          tags: [],
          primaryLanguage: 'English',
          country: 'GLOBAL',
          isPrivate: false,
          isVerified: false,
          ownerId: 'tmp',
          ownerName: 'tmp',
          aboutAdmin: '',
          bannerColor: '#F97316',
          iconColor: '#F97316',
          rules: [],
          createdAt: '',
          roles: [],
          members: [],
          channels: [],
          messages: [],
          assignments: [],
          submissions: [],
          attendance: [],
          joinRequests: [],
        },
        profile.id,
        'actual'
      );
    }
    return resolveMemberPermissions(activeClub, profile.id, simulatedRole);
  }, [activeClub, profile.id, simulatedRole]);

  const myRoleIds = useMemo(() => myPermissions.roles.map((r) => r.id), [myPermissions]);

  const visibleChannels = useMemo(() => {
    if (!activeClub) return [];
    return activeClub.channels.filter((ch) =>
      canViewChannel(ch, myRoleIds, myPermissions.isManager)
    );
  }, [activeClub, myRoleIds, myPermissions.isManager]);

  const activeChannel = useMemo(() => {
    if (!workspace || !activeClub) return null;
    return (
      visibleChannels.find((ch) => ch.id === workspace.activeChannelId) ||
      visibleChannels[0] ||
      null
    );
  }, [workspace, activeClub, visibleChannels]);

  const postGate = useMemo(() => {
    if (!activeChannel) return { allowed: false, reason: 'Select a channel first.' };
    return canPostInChannel(
      activeChannel,
      myRoleIds,
      myPermissions.isManager,
      myPermissions.permissions.canPostAnnouncements
    );
  }, [activeChannel, myRoleIds, myPermissions]);

  const channelMessages = useMemo(() => {
    if (!activeClub || !activeChannel || !workspace) return [];
    const blocked = new Set(workspace.blockedUserIds || []);
    return activeClub.messages
      .filter((m) => m.channelId === activeChannel.id && !blocked.has(m.senderId))
      .filter((m) => (!showPinnedOnly ? true : Boolean(m.isPinned)));
  }, [activeClub, activeChannel, workspace, showPinnedOnly]);

  const mutateActiveClub = async (updater: (club: StudyClub) => StudyClub) => {
    if (!workspace || !activeClub) return;
    const updatedClubs = workspace.clubs.map((c) => (c.id === activeClub.id ? updater(c) : c));
    await persistWorkspace({ ...workspace, clubs: updatedClubs });
  };

  const handleSelectClub = async (clubId: string) => {
    if (!workspace) return;
    const target = workspace.clubs.find((c) => c.id === clubId);
    if (!target) return;
    const nextChannel = target.channels[0]?.id || '';
    await persistWorkspace({
      ...workspace,
      activeClubId: clubId,
      activeChannelId: nextChannel,
    });
    setShowPinnedOnly(false);
    setMobileNavOpen(false);
  };

  const handleSelectChannel = async (channelId: string) => {
    if (!workspace) return;
    await persistWorkspace({ ...workspace, activeChannelId: channelId });
    setShowPinnedOnly(false);
    setMobileNavOpen(false);
  };

  const handleSendMessage = async () => {
    if (!activeClub || !activeChannel || !postGate.allowed) return;
    const text = draftMsg.trim();
    if (!text) return;

    const spamCheck = checkMessageAntiSpam(text, activeChannel.blockExternalLinks !== false);
    if (!spamCheck.ok) {
      setAntiSpamNotice(spamCheck.reason || 'External link blocked by anti-spam protection.');
      HapticManager.triggerError();
      return;
    }

    const msg: ClubMessage = {
      id: `msg_${Date.now()}`,
      channelId: activeChannel.id,
      senderId: profile.id,
      senderName: profile.name,
      senderRoleBadge: myPermissions.highestRole?.name || myPermissions.staffLabel,
      senderRoleColor: myPermissions.highestRole?.color || colors.primary,
      content: text,
      createdAt: new Date().toISOString(),
      reactions: [],
      replyToSnippet: replySnippet || undefined,
    };

    await mutateActiveClub((c) => ({
      ...c,
      messages: [...c.messages, msg],
    }));
    setDraftMsg('');
    setReplySnippet(null);
    setAntiSpamNotice(null);
    SoundManager.play('notify');
    HapticManager.triggerSelection();
  };

  const handleSendPoll = async () => {
    if (!activeClub || !activeChannel || !postGate.allowed) return;
    const q = pollQuestion.trim();
    const opts = [pollOpt1, pollOpt2, pollOpt3].map((o) => o.trim()).filter(Boolean);
    if (!q || opts.length < 2) return;

    const msg: ClubMessage = {
      id: `msg_${Date.now()}`,
      channelId: activeChannel.id,
      senderId: profile.id,
      senderName: profile.name,
      senderRoleBadge: myPermissions.highestRole?.name || myPermissions.staffLabel,
      senderRoleColor: myPermissions.highestRole?.color || colors.primary,
      content: `Community Poll launched in #${activeChannel.name}:`,
      createdAt: new Date().toISOString(),
      poll: {
        question: q,
        options: opts.map((text, idx) => ({
          id: `po_${Date.now()}_${idx}`,
          text,
          voterIds: [],
        })),
      },
      reactions: [],
    };
    await mutateActiveClub((c) => ({ ...c, messages: [...c.messages, msg] }));
    setPollModalOpen(false);
    setPollQuestion('');
    setPollOpt1('');
    setPollOpt2('');
    setPollOpt3('');
    showToast('Poll posted to channel!');
  };

  const handleVotePoll = async (messageId: string, optionId: string) => {
    await mutateActiveClub((c) => ({
      ...c,
      messages: c.messages.map((m) => {
        if (m.id !== messageId || !m.poll) return m;
        return {
          ...m,
          poll: {
            ...m.poll,
            options: m.poll.options.map((o) => {
              const filtered = o.voterIds.filter((v) => v !== profile.id);
              return o.id === optionId ? { ...o, voterIds: [...filtered, profile.id] } : { ...o, voterIds: filtered };
            }),
          },
        };
      }),
    }));
  };

  const handleSendResource = async () => {
    if (!activeClub || !activeChannel || !postGate.allowed) return;
    const cleanTitle = resTitle.trim();
    if (!cleanTitle) return;

    const msg: ClubMessage = {
      id: `msg_${Date.now()}`,
      channelId: activeChannel.id,
      senderId: profile.id,
      senderName: profile.name,
      senderRoleBadge: myPermissions.highestRole?.name || myPermissions.staffLabel,
      senderRoleColor: myPermissions.highestRole?.color || colors.primary,
      content: `Shared ${resKind.toUpperCase()} study resource with the cohort:`,
      createdAt: new Date().toISOString(),
      resource: {
        id: `res_${Date.now()}`,
        title: cleanTitle,
        kind: resKind,
        sizeLabel: 'Attached Local Note',
        previewSummary: resSummary.trim() || 'Click to review summary & discussion notes.',
      },
      reactions: [],
    };
    await mutateActiveClub((c) => ({ ...c, messages: [...c.messages, msg] }));
    setResourceModalOpen(false);
    setResTitle('');
    setResSummary('');
    showToast('Study resource card posted!');
  };

  const handleToggleReaction = async (messageId: string, emoji: string) => {
    await mutateActiveClub((c) => ({
      ...c,
      messages: c.messages.map((m) => {
        if (m.id !== messageId) return m;
        const existing = m.reactions.find((r) => r.emoji === emoji);
        if (!existing) {
          return { ...m, reactions: [...m.reactions, { emoji, userIds: [profile.id] }] };
        }
        const already = existing.userIds.includes(profile.id);
        const nextUserIds = already
          ? existing.userIds.filter((id) => id !== profile.id)
          : [...existing.userIds, profile.id];
        return {
          ...m,
          reactions: m.reactions
            .map((r) => (r.emoji === emoji ? { ...r, userIds: nextUserIds } : r))
            .filter((r) => r.userIds.length > 0),
        };
      }),
    }));
  };

  const handleTogglePin = async (messageId: string) => {
    if (!myPermissions.permissions.canPinMessages) return;
    await mutateActiveClub((c) => ({
      ...c,
      messages: c.messages.map((m) => (m.id === messageId ? { ...m, isPinned: !m.isPinned } : m)),
    }));
  };

  const handleToggleVerifiedAnswer = async (messageId: string) => {
    if (!myPermissions.permissions.canModerateMessages) return;
    await mutateActiveClub((c) => ({
      ...c,
      messages: c.messages.map((m) =>
        m.id === messageId ? { ...m, isVerifiedAnswer: !m.isVerifiedAnswer } : m
      ),
    }));
  };

  const handleDeleteMessage = async (messageId: string) => {
    await mutateActiveClub((c) => ({
      ...c,
      messages: c.messages.filter((m) => m.id !== messageId),
    }));
  };

  const handleJoinPublicClub = async (clubId: string) => {
    if (!workspace) return;
    const nextJoined = Array.from(new Set([...workspace.joinedClubIds, clubId]));
    const updatedClubs = workspace.clubs.map((c) => {
      if (c.id !== clubId) return c;
      if (c.members.some((m) => m.userId === profile.id)) return c;
      const studentRole = c.roles.find((r) => r.name === 'Student') || c.roles[c.roles.length - 1];
      return {
        ...c,
        members: [
          ...c.members,
          {
            userId: profile.id,
            name: profile.name,
            ioId: profile.ioId,
            avatarColor: profile.avatarColor || '#F97316',
            staffLabel: 'Student' as const,
            roleIds: studentRole ? [studentRole.id] : [],
            joinedAt: new Date().toISOString(),
            isOnline: true,
            xp: profile.totalXp,
          },
        ],
      };
    });
    const target = updatedClubs.find((c) => c.id === clubId);
    await persistWorkspace({
      ...workspace,
      clubs: updatedClubs,
      joinedClubIds: nextJoined,
      activeClubId: clubId,
      activeChannelId: target?.channels[0]?.id || '',
    });
    showToast(`Joined ${target?.name || 'club'}!`);
  };

  const handleJoinByInviteCode = (code: string) => {
    if (!workspace) return { ok: false, message: 'Workspace loading...' };
    const matched = workspace.clubs.find((c) => c.inviteCode.toUpperCase() === code.toUpperCase());
    if (!matched) {
      return { ok: false, message: `No Institute or Study Club found matching code "${code}".` };
    }
    handleJoinPublicClub(matched.id);
    setDirectoryOpen(false);
    return { ok: true, message: `Joined ${matched.name}!`, clubId: matched.id };
  };

  const handleRequestPrivateJoin = async (clubId: string, note: string) => {
    if (!workspace) return;
    const updatedClubs = workspace.clubs.map((c) => {
      if (c.id !== clubId) return c;
      return {
        ...c,
        joinRequests: [
          ...c.joinRequests,
          {
            id: `jr_${Date.now()}`,
            userId: profile.id,
            name: profile.name,
            ioId: profile.ioId,
            message: note,
            requestedAt: new Date().toISOString(),
            status: 'pending' as const,
          },
        ],
      };
    });
    await persistWorkspace({ ...workspace, clubs: updatedClubs });
    showToast('Membership request sent to Institute Admins.');
  };

  const handleCreateNewChannel = async () => {
    if (!activeClub || !workspace) return;
    const clean = newChName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (clean.length < 2) return;
    const ch: ClubChannel = {
      id: `${activeClub.id}_ch_${Date.now()}`,
      clubId: activeClub.id,
      name: clean,
      topic: newChTopic.trim() || `${clean} discussion channel`,
      category: newChCategory,
      type: newChType,
      accessMode: 'open',
      isReadOnly: false,
      allowedRoleIds: [],
      blockExternalLinks: true,
    };
    const nextClubs = workspace.clubs.map((c) =>
      c.id === activeClub.id ? { ...c, channels: [...c.channels, ch] } : c
    );
    await persistWorkspace({
      ...workspace,
      clubs: nextClubs,
      activeChannelId: ch.id,
    });
    setCreateChannelOpen(false);
    setNewChName('');
    setNewChTopic('');
    showToast(`Created #${ch.name}`);
  };

  const handleSubmitTakeaway = async () => {
    if (!submissionModalAsg || !submissionNote.trim()) return;
    const sub: AssignmentSubmission = {
      id: `sub_${Date.now()}`,
      assignmentId: submissionModalAsg.id,
      studentId: profile.id,
      studentName: profile.name,
      responseText: submissionNote.trim(),
      submittedAt: new Date().toISOString(),
      status: 'submitted',
    };
    await mutateActiveClub((c) => ({
      ...c,
      submissions: [sub, ...c.submissions],
    }));
    setSubmissionModalAsg(null);
    setSubmissionNote('');
    showToast('Submission recorded for Teacher grading!');
  };

  const handleOpenOrStartDm = async (member: {
    userId: string;
    name: string;
    ioId: string;
    staffLabel: string;
    avatarColor: string;
  }) => {
    if (!workspace) return;
    const existing = workspace.dmThreads.find((t) => t.peerUserId === member.userId);
    if (existing) {
      setDmModalThreadId(existing.id);
      return;
    }
    const created = {
      id: `dm_${Date.now()}`,
      peerUserId: member.userId,
      peerName: member.name,
      peerIoId: member.ioId,
      peerRole: member.staffLabel,
      avatarColor: member.avatarColor,
      messages: [],
    };
    await persistWorkspace({
      ...workspace,
      dmThreads: [created, ...workspace.dmThreads],
    });
    setDmModalThreadId(created.id);
  };

  const handleSendDm = async () => {
    if (!workspace || !dmModalThreadId || !dmDraft.trim()) return;
    const nextThreads = workspace.dmThreads.map((t) =>
      t.id === dmModalThreadId
        ? {
            ...t,
            messages: [
              ...t.messages,
              {
                id: `dmm_${Date.now()}`,
                senderId: profile.id,
                senderName: profile.name,
                text: dmDraft.trim(),
                createdAt: new Date().toISOString(),
              },
            ],
          }
        : t
    );
    await persistWorkspace({ ...workspace, dmThreads: nextThreads });
    setDmDraft('');
  };

  const handleSubmitSafetyReport = async () => {
    if (!workspace || !reportModalTarget) return;
    const report: SafetyReport = {
      id: `rep_${Date.now()}`,
      targetType: reportModalTarget.type,
      targetId: reportModalTarget.id,
      targetName: reportModalTarget.name,
      reason: reportReason,
      details: reportDetails.trim() || 'Flagged via Study Labs Club safety moderation.',
      createdAt: new Date().toISOString(),
      status: 'logged_locally',
    };
    await persistWorkspace({
      ...workspace,
      safetyReports: [report, ...workspace.safetyReports],
    });
    setReportModalTarget(null);
    setReportDetails('');
    showToast('Moderation report saved.');
  };

  if (!workspace || !activeClub) {
    return (
      <View style={[styles.centerWrap, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>Loading Study Clubs & Institute Workspace...</Text>
      </View>
    );
  }

  const joinedClubs = workspace.clubs.filter((c) => workspace.joinedClubIds.includes(c.id));
  const pendingCount = activeClub.joinRequests.filter((r) => r.status === 'pending').length;
  const activeDmThread = workspace.dmThreads.find((t) => t.id === dmModalThreadId) || null;

  const renderChannelNavPane = () => {
    const categories: ChannelCategoryType[] = ['Information', 'Academic Feeds', 'Study Channels'];
    return (
      <View style={styles.splitSideRoot}>
        {/* Left Server Rail */}
        <View style={[styles.serverRail, { backgroundColor: colors.card, borderRightColor: colors.border }]}>
          <ScrollView contentContainerStyle={styles.serverRailList} showsVerticalScrollIndicator={false}>
            {joinedClubs.map((c) => {
              const isAct = c.id === activeClub.id;
              return (
                <Pressable
                  key={c.id}
                  focusable={false}
                  onPress={() => handleSelectClub(c.id)}
                  style={[
                    styles.serverPill,
                    {
                      backgroundColor: isAct ? c.iconColor : colors.surface,
                      borderColor: isAct ? '#FFFFFF' : colors.border,
                    },
                  ]}
                  accessibilityLabel={`Switch to ${c.name}`}
                >
                  <Text style={{ fontSize: 15, fontWeight: '900', color: isAct ? '#FFFFFF' : colors.text }}>
                    {c.name.charAt(0).toUpperCase()}
                  </Text>
                </Pressable>
              );
            })}

            <View style={[styles.railDivider, { backgroundColor: colors.border }]} />

            <Pressable
              focusable={false}
              onPress={() => setDirectoryOpen(true)}
              style={[styles.serverRailAction, { backgroundColor: colors.surface, borderColor: colors.primary }]}
              accessibilityLabel="Explore Clubs Directory"
            >
              <Compass size={18} color={colors.primary} />
            </Pressable>

            <Pressable
              focusable={false}
              onPress={() => setCreateClubOpen(true)}
              style={[styles.serverRailAction, { backgroundColor: colors.surface, borderColor: colors.success }]}
              accessibilityLabel="Create New Study Club"
            >
              <Plus size={18} color={colors.success} />
            </Pressable>
          </ScrollView>
        </View>

        {/* Channel Sidebar */}
        <View style={[styles.channelSidebar, { backgroundColor: colors.surface, borderRightColor: colors.border }]}>
          <View style={[styles.clubHeaderBox, { borderBottomColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Text style={{ fontSize: 13.5, fontWeight: '800', color: colors.text }} numberOfLines={1}>
                  {activeClub.name}
                </Text>
                {activeClub.isVerified && <ShieldCheck size={14} color={colors.primary} />}
              </View>
              <Text style={{ fontSize: 10.5, color: colors.textSecondary, marginTop: 1 }} numberOfLines={1}>
                {activeClub.kind === 'institute' ? 'Institute Workspace' : 'Peer Club'} · {activeClub.inviteCode}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setSettingsInitialTab('invite');
                setSettingsOpen(true);
              }}
            >
              <Settings size={15} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 8, gap: 10 }}>
            {categories.map((cat) => {
              const items = visibleChannels.filter((ch) => ch.category === cat);
              if (items.length === 0) return null;
              return (
                <View key={cat} style={{ gap: 2 }}>
                  <Text style={[styles.catLabel, { color: colors.textSecondary }]}>
                    {cat.toUpperCase()}
                  </Text>
                  {items.map((ch) => {
                    const isAct = activeChannel?.id === ch.id;
                    const IconComp =
                      ch.accessMode === 'role_private'
                        ? Lock
                        : ch.accessMode === 'public_view'
                        ? Eye
                        : Hash;
                    return (
                      <Pressable
                        key={ch.id}
                        focusable={false}
                        onPress={() => handleSelectChannel(ch.id)}
                        style={[
                          styles.channelRow,
                          {
                            backgroundColor: isAct
                              ? mode === 'dark'
                                ? '#431407'
                                : '#FFEDD5'
                              : 'transparent',
                            borderColor: isAct ? colors.primary : 'transparent',
                          },
                        ]}
                      >
                        <IconComp size={14} color={isAct ? colors.primary : colors.textSecondary} />
                        <Text
                          numberOfLines={1}
                          style={{
                            flex: 1,
                            fontSize: 12.5,
                            fontWeight: isAct ? '800' : '600',
                            color: isAct ? colors.primary : colors.text,
                          }}
                        >
                          {ch.name}
                        </Text>
                        {ch.isReadOnly && (
                          <Lock size={11} color={colors.textSecondary} />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              );
            })}

            {myPermissions.permissions.canManageChannels && (
              <TouchableOpacity
                onPress={() => setCreateChannelOpen(true)}
                style={[styles.newChannelBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
              >
                <Plus size={13} color={colors.primary} />
                <Text style={{ fontSize: 11.5, fontWeight: '700', color: colors.primary }}>
                  Create Channel
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          {/* Bottom User Status Bar */}
          <Pressable
            focusable={false}
            onPress={() => onOpenProfile?.()}
            style={[styles.userFooter, { backgroundColor: colors.card, borderTopColor: colors.border }]}
          >
            <View style={[styles.miniAvatar, { backgroundColor: profile.avatarColor || colors.primary }]}>
              <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>
                {profile.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11.5, fontWeight: '700', color: colors.text }} numberOfLines={1}>
                {profile.name}
              </Text>
              <Text style={{ fontSize: 9.5, color: simulatedRole !== 'actual' ? colors.warning : colors.textSecondary }} numberOfLines={1}>
                {simulatedRole !== 'actual' ? `Viewing as ${simulatedRole}` : profile.ioId}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    );
  };

  const renderMembersPane = () => {
    const admins = activeClub.members.filter((m) => m.staffLabel !== 'Student');
    const students = activeClub.members.filter((m) => m.staffLabel === 'Student');
    return (
      <View style={[styles.membersPane, { backgroundColor: colors.surface, borderLeftColor: colors.border }]}>
        <View style={[styles.membersHdr, { borderBottomColor: colors.border }]}>
          <Text style={[styles.catLabel, { color: colors.textSecondary }]}>
            COHORT MEMBERS ({activeClub.members.length})
          </Text>
          <TouchableOpacity
            onPress={() => setDirectoryOpen(true)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
          >
            <UserPlus size={13} color={colors.primary} />
            <Text style={{ fontSize: 11, fontWeight: '700', color: colors.primary }}>Directory</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 10, gap: 10 }}>
          {[
            { title: `Faculty & Staff (${admins.length})`, items: admins },
            { title: `Students (${students.length})`, items: students },
          ].map((grp) => (
            <View key={grp.title} style={{ gap: 5 }}>
              <Text style={[styles.catLabel, { color: colors.textSecondary }]}>{grp.title}</Text>
              {grp.items.map((m) => {
                const blocked = workspace.blockedUserIds.includes(m.userId);
                return (
                  <View
                    key={m.userId}
                    style={[styles.memberRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                  >
                    <View style={[styles.miniAvatar, { backgroundColor: m.avatarColor }]}>
                      <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>
                        {m.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }} numberOfLines={1}>
                        {m.name} {m.userId === profile.id ? '(You)' : ''}
                      </Text>
                      <Text style={{ fontSize: 10, color: colors.textSecondary }} numberOfLines={1}>
                        {m.staffLabel} · {m.xp} XP
                      </Text>
                    </View>
                    {m.userId !== profile.id && (
                      <View style={{ flexDirection: 'row', gap: 4 }}>
                        <TouchableOpacity
                          onPress={() => handleOpenOrStartDm(m)}
                          style={[styles.tinyIconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                          accessibilityLabel={`Direct message ${m.name}`}
                        >
                          <MessageSquare size={12} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={async () => {
                            const nextBlocked = blocked
                              ? workspace.blockedUserIds.filter((id) => id !== m.userId)
                              : [...workspace.blockedUserIds, m.userId];
                            await persistWorkspace({ ...workspace, blockedUserIds: nextBlocked });
                            showToast(blocked ? `Unblocked ${m.name}` : `Blocked ${m.name}`);
                          }}
                          style={[styles.tinyIconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        >
                          <Flag size={12} color={blocked ? colors.error : colors.textSecondary} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ))}

          {/* Recent DMs Quick Access */}
          <Text style={[styles.catLabel, { color: colors.textSecondary, marginTop: 4 }]}>
            DIRECT MESSAGES ({workspace.dmThreads.length})
          </Text>
          {workspace.dmThreads.map((th) => (
            <TouchableOpacity
              key={th.id}
              onPress={() => setDmModalThreadId(th.id)}
              style={[styles.memberRow, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.miniAvatar, { backgroundColor: th.avatarColor }]}>
                <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>
                  {th.peerName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }} numberOfLines={1}>
                  {th.peerName}
                </Text>
                <Text style={{ fontSize: 10, color: colors.textSecondary }} numberOfLines={1}>
                  {th.messages[th.messages.length - 1]?.text || 'Open direct chat'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Top Toolbar */}
      <View
        style={[
          styles.topBar,
          !isTablet && styles.topBarCompact,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            flex: isTablet ? 1 : undefined,
            width: isTablet ? undefined : '100%',
            minWidth: 0,
          }}
        >
          {!isTablet && (
            <TouchableOpacity
              focusable={false}
              onPress={() => setMobileNavOpen(true)}
              style={[styles.toolBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              accessibilityLabel="Open clubs and channels navigation"
            >
              <Menu size={16} color={colors.primary} />
            </TouchableOpacity>
          )}
          <Hash size={17} color={colors.primary} style={{ flexShrink: 0 }} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontSize: 14, fontWeight: '800', color: colors.text }} numberOfLines={1}>
              {activeChannel?.name || 'general'} · <Text style={{ color: colors.primary }}>{activeClub.name}</Text>
            </Text>
            <Text style={{ fontSize: 11, color: colors.textSecondary }} numberOfLines={1}>
              {activeChannel?.topic || activeClub.description}
            </Text>
          </View>
        </View>

        <View style={[styles.topActions, !isTablet && styles.topActionsCompact]}>
          {/* Quick View-As Role Switcher (Demo / Institute RBAC Preview) */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={isTablet ? { maxWidth: isDesktop ? 360 : 210 } : { flex: 1, minWidth: 0 }}
            contentContainerStyle={{ gap: 4, alignItems: 'center' }}
          >
            {ROLE_SIM_OPTIONS.map((r) => {
              const active = simulatedRole === r;
              const label = r === 'actual' ? 'My Role' : r.replace('Institute ', '');
              return (
                <TouchableOpacity
                  focusable={false}
                  key={r}
                  onPress={async () => {
                    await persistWorkspace({
                      ...workspace,
                      roleOverrideByClub: {
                        ...workspace.roleOverrideByClub,
                        [activeClub.id]: r,
                      },
                    });
                  }}
                  style={[
                    styles.roleSimPill,
                    {
                      backgroundColor: active ? colors.primary : colors.surface,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={{ fontSize: 10.5, fontWeight: '700', color: active ? '#FFFFFF' : colors.textSecondary }}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, flexShrink: 0 }}>
            <TouchableOpacity
              focusable={false}
              onPress={() => setShowPinnedOnly((p) => !p)}
              style={[
                styles.toolBtn,
                {
                  backgroundColor: showPinnedOnly ? colors.warning : colors.surface,
                  borderColor: showPinnedOnly ? colors.warning : colors.border,
                },
              ]}
              accessibilityLabel="Filter pinned messages"
            >
              <Pin size={14} color={showPinnedOnly ? '#FFFFFF' : colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              focusable={false}
              onPress={() => setTeacherOpen(true)}
              style={[styles.toolBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              accessibilityLabel="Open Teacher and Institute Tools"
            >
              <GraduationCap size={15} color={colors.primary} />
              {pendingCount > 0 && <View style={[styles.dotBadge, { backgroundColor: colors.error }]} />}
            </TouchableOpacity>

            <TouchableOpacity
              focusable={false}
              onPress={() => {
                setSettingsInitialTab('access');
                setSettingsOpen(true);
              }}
              style={[styles.toolBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              accessibilityLabel="Channel and role settings"
            >
              <Settings size={15} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              focusable={false}
              onPress={() => setDirectoryOpen(true)}
              style={[styles.toolBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              accessibilityLabel="Explore Study Clubs Directory"
            >
              <Compass size={15} color={colors.cyan} />
            </TouchableOpacity>

            {!isDesktop && (
              <TouchableOpacity
                focusable={false}
                onPress={() => setMobileMembersOpen(true)}
                style={[styles.toolBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                accessibilityLabel="Cohort members and direct messages"
              >
                <Users size={15} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {toastMsg && (
        <View style={[styles.toastBar, { backgroundColor: mode === 'dark' ? '#052E16' : '#DCFCE7', borderBottomColor: colors.success }]}>
          <CheckCircle2 size={14} color={colors.success} />
          <Text style={{ fontSize: 12, fontWeight: '700', color: colors.success }}>{toastMsg}</Text>
        </View>
      )}

      {/* Main Responsive Multi-Pane Area */}
      <View style={styles.workspaceRow}>
        {isTablet && <View style={styles.leftSplitWrap}>{renderChannelNavPane()}</View>}

        {/* Main Channel Chat Feed */}
        <View style={styles.chatColumn}>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, gap: 10 }}>
            {/* Channel Welcome Card */}
            <View style={[styles.welcomeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                <Text style={{ fontSize: 16, fontWeight: '900', color: colors.text }}>
                  Welcome to #{activeChannel?.name || 'general'}
                </Text>
                <Badge
                  label={
                    activeChannel?.accessMode === 'role_private'
                      ? 'Role Private'
                      : activeChannel?.accessMode === 'public_view'
                      ? 'View-Only Mode'
                      : 'Open Discussion'
                  }
                  variant={activeChannel?.isReadOnly ? 'warning' : 'success'}
                  size="sm"
                />
              </View>
              <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 3 }}>
                {activeChannel?.topic}
              </Text>
              {activeChannel?.type === 'rules' && (
                <View style={{ marginTop: 8, gap: 4 }}>
                  {activeClub.rules.map((rule, idx) => (
                    <Text key={idx} style={{ fontSize: 12, color: colors.text }}>
                      {idx + 1}. {rule}
                    </Text>
                  ))}
                </View>
              )}
              {activeClub.kind === 'institute' && activeChannel?.type === 'assignments' && (
                <Text style={{ fontSize: 11, color: colors.info, marginTop: 6 }}>
                  {ATTENDANCE_POLICY_DISCLAIMER}
                </Text>
              )}
            </View>

            {/* Message Feed */}
            {channelMessages.length === 0 ? (
              <EmptyResourceCard
                title={showPinnedOnly ? 'No Pinned Messages' : `No Messages in #${activeChannel?.name || 'channel'}`}
                message="Start a concept thread with LaTeX formulas ($...$), launch a cohort poll, or attach revision PDFs."
              />
            ) : (
              channelMessages.map((msg) => {
                const linkedAsg = msg.assignmentId
                  ? activeClub.assignments.find((a) => a.id === msg.assignmentId)
                  : undefined;

                return (
                  <View
                    key={msg.id}
                    style={[
                      styles.msgCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: msg.isVerifiedAnswer
                          ? colors.success
                          : msg.isPinned
                          ? colors.warning
                          : colors.border,
                      },
                    ]}
                  >
                    {msg.replyToSnippet && (
                      <View style={[styles.replyStrip, { backgroundColor: colors.surface, borderLeftColor: colors.primary }]}>
                        <Text style={{ fontSize: 11, color: colors.textSecondary }} numberOfLines={1}>
                          Replying to: {msg.replyToSnippet}
                        </Text>
                      </View>
                    )}

                    <View style={styles.msgHdr}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, flexWrap: 'wrap', flex: 1 }}>
                        <Text style={{ fontSize: 13.5, fontWeight: '800', color: colors.text }}>
                          {msg.senderName}
                        </Text>
                        {msg.senderRoleBadge && (
                          <View
                            style={[
                              styles.rolePillTag,
                              { backgroundColor: msg.senderRoleColor || colors.primary },
                            ]}
                          >
                            <Text style={{ fontSize: 9.5, fontWeight: '800', color: '#FFFFFF' }}>
                              {msg.senderRoleBadge}
                            </Text>
                          </View>
                        )}
                        {msg.isVerifiedAnswer && (
                          <Badge label="Verified Answer" variant="success" size="sm" />
                        )}
                        {msg.isPinned && <Badge label="Pinned" variant="warning" size="sm" />}
                      </View>
                      <Text style={{ fontSize: 10, color: colors.textSecondary }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>

                    {/* Rich LaTeX & Text Body */}
                    <View style={{ marginTop: 4 }}>
                      <RichMathText
                        content={msg.content}
                        fontSize={13.5}
                        color={colors.text}
                        allowPanModal
                        panTitle={`${msg.senderName} · Math Inspector`}
                      />
                    </View>

                    {/* Linked Assignment Card (Module N -> Test Engine Launch!) */}
                    {linkedAsg && (
                      <View style={[styles.asgCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 13.5, fontWeight: '800', color: colors.primary }}>
                              {linkedAsg.title}
                            </Text>
                            <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                              {linkedAsg.subject} · Due {linkedAsg.dueDate} · Max {linkedAsg.maxMarks} marks
                            </Text>
                          </View>
                          <Badge label={linkedAsg.targetExamLabel || 'Assignment'} variant="primary" size="sm" />
                        </View>
                        <Text style={{ fontSize: 12, color: colors.text, lineHeight: 17 }}>
                          {linkedAsg.description}
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                          {linkedAsg.linkedQuestionIds && linkedAsg.linkedQuestionIds.length > 0 && (
                            <Button
                              title="Launch Timed Quiz"
                              size="sm"
                              icon={<Play size={13} color="#FFFFFF" />}
                              onPress={() =>
                                onLaunchSession({
                                  title: linkedAsg.title,
                                  mode: linkedAsg.linkedTestMode || 'exam',
                                  questionIds: linkedAsg.linkedQuestionIds!,
                                  marksPerCorrect: 4,
                                  negativeMarks: 1,
                                  nonce: Date.now(),
                                })
                              }
                            />
                          )}
                          <Button
                            title="Submit Takeaway Note"
                            size="sm"
                            variant="outline"
                            onPress={() => {
                              setSubmissionModalAsg(linkedAsg);
                              setSubmissionNote('');
                            }}
                          />
                        </View>
                      </View>
                    )}

                    {/* Resource Attachment Card */}
                    {msg.resource && (
                      <View style={[styles.resourceCard, { backgroundColor: colors.surface, borderColor: colors.cyan }]}>
                        <FileText size={16} color={colors.cyan} />
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 12.5, fontWeight: '800', color: colors.text }}>
                            {msg.resource.title}
                          </Text>
                          <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                            {msg.resource.kind.toUpperCase()} · {msg.resource.sizeLabel}
                          </Text>
                          <Text style={{ fontSize: 11.5, color: colors.text, marginTop: 3 }}>
                            {msg.resource.previewSummary}
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* Interactive Poll */}
                    {msg.poll && (() => {
                      const totalVotes = msg.poll.options.reduce((acc, o) => acc + o.voterIds.length, 0);
                      return (
                        <View style={[styles.pollCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                          <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>
                            {msg.poll.question}
                          </Text>
                          {msg.poll.options.map((opt) => {
                            const voted = opt.voterIds.includes(profile.id);
                            const pct = totalVotes > 0 ? Math.round((opt.voterIds.length / totalVotes) * 100) : 0;
                            return (
                              <TouchableOpacity
                                key={opt.id}
                                onPress={() => handleVotePoll(msg.id, opt.id)}
                                style={[
                                  styles.pollOption,
                                  {
                                    backgroundColor: colors.card,
                                    borderColor: voted ? colors.primary : colors.border,
                                  },
                                ]}
                              >
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Text style={{ fontSize: 12, fontWeight: voted ? '800' : '600', color: colors.text, flex: 1 }}>
                                    {voted ? '✓ ' : ''}{opt.text}
                                  </Text>
                                  <Text style={{ fontSize: 11, fontWeight: '800', color: colors.primary }}>
                                    {pct}% ({opt.voterIds.length})
                                  </Text>
                                </View>
                                <View style={[styles.pollTrack, { backgroundColor: colors.borderSubtle }]}>
                                  <View
                                    style={[
                                      styles.pollFill,
                                      { width: `${pct}%`, backgroundColor: voted ? colors.primary : colors.cyan },
                                    ]}
                                  />
                                </View>
                              </TouchableOpacity>
                            );
                          })}
                          <Text style={{ fontSize: 10.5, color: colors.textSecondary }}>
                            Total votes: {totalVotes}
                          </Text>
                        </View>
                      );
                    })()}

                    {/* Reaction Bar & Moderation Actions */}
                    <View style={styles.msgFooterRow}>
                      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                        {['🔥', '👍', '✅'].map((emoji) => {
                          const r = msg.reactions.find((item) => item.emoji === emoji);
                          const count = r?.userIds.length || 0;
                          const reacted = r?.userIds.includes(profile.id);
                          return (
                            <TouchableOpacity
                              key={`${msg.id}_${emoji}`}
                              onPress={() => handleToggleReaction(msg.id, emoji)}
                              style={[
                                styles.reactBtn,
                                {
                                  backgroundColor: reacted
                                    ? mode === 'dark'
                                      ? '#431407'
                                      : '#FFEDD5'
                                    : colors.surface,
                                  borderColor: reacted ? colors.primary : colors.border,
                                },
                              ]}
                            >
                              <Text style={{ fontSize: 11.5 }}>{emoji}</Text>
                              {count > 0 && (
                                <Text style={{ fontSize: 11, fontWeight: '700', color: colors.text }}>
                                  {count}
                                </Text>
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </View>

                      <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                        <TouchableOpacity
                          onPress={() => setReplySnippet(`${msg.senderName}: ${msg.content.slice(0, 48)}`)}
                          style={[styles.tinyIconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        >
                          <Text style={{ fontSize: 10.5, fontWeight: '700', color: colors.textSecondary }}>Reply</Text>
                        </TouchableOpacity>
                        {myPermissions.permissions.canPinMessages && (
                          <TouchableOpacity
                            onPress={() => handleTogglePin(msg.id)}
                            style={[styles.tinyIconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                          >
                            <Pin size={12} color={msg.isPinned ? colors.warning : colors.textSecondary} />
                          </TouchableOpacity>
                        )}
                        {myPermissions.permissions.canModerateMessages && (
                          <>
                            <TouchableOpacity
                              onPress={() => handleToggleVerifiedAnswer(msg.id)}
                              style={[styles.tinyIconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                            >
                              <BookmarkCheck size={12} color={msg.isVerifiedAnswer ? colors.success : colors.textSecondary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => handleDeleteMessage(msg.id)}
                              style={[styles.tinyIconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                            >
                              <Trash2 size={12} color={colors.error} />
                            </TouchableOpacity>
                          </>
                        )}
                        <TouchableOpacity
                          onPress={() =>
                            setReportModalTarget({
                              type: 'message',
                              id: msg.id,
                              name: `${msg.senderName}'s post`,
                            })
                          }
                          style={[styles.tinyIconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        >
                          <Flag size={11} color={colors.textSecondary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Composer Area */}
          <View style={[styles.composerBox, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
            {replySnippet && (
              <View style={[styles.replyBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={{ fontSize: 11, color: colors.textSecondary, flex: 1 }} numberOfLines={1}>
                  Replying to {replySnippet}
                </Text>
                <TouchableOpacity onPress={() => setReplySnippet(null)}>
                  <X size={13} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            )}

            {antiSpamNotice && (
              <View style={[styles.replyBar, { backgroundColor: mode === 'dark' ? '#3F1D2B' : '#FEF2F2', borderColor: colors.error }]}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: colors.error, flex: 1 }}>
                  {antiSpamNotice}
                </Text>
                <TouchableOpacity onPress={() => setAntiSpamNotice(null)}>
                  <X size={13} color={colors.error} />
                </TouchableOpacity>
              </View>
            )}

            {mentionPickerOpen && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, marginBottom: 6 }}>
                {['@everyone', '@Teacher', '@Student', ...activeClub.members.map((m) => `@${m.name.split(' ')[0]}`)].map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    onPress={() => {
                      setDraftMsg((prev) => `${prev}${prev.endsWith(' ') || !prev ? '' : ' '}${tag} `);
                      setMentionPickerOpen(false);
                    }}
                    style={[styles.mentionChip, { backgroundColor: colors.surface, borderColor: colors.primary }]}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '700', color: colors.primary }}>{tag}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {!postGate.allowed ? (
              <View style={[styles.lockedBanner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Lock size={14} color={colors.warning} />
                <Text style={{ fontSize: 12, color: colors.textSecondary, flex: 1 }}>
                  {postGate.reason || 'Read-only channel for your active role.'}
                </Text>
              </View>
            ) : (
              <View style={styles.inputRow}>
                <TouchableOpacity
                  onPress={() => setMentionPickerOpen((v) => !v)}
                  style={[styles.compIconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  accessibilityLabel="Mention peer or role"
                >
                  <AtSign size={15} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setPollModalOpen(true)}
                  style={[styles.compIconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  accessibilityLabel="Create poll"
                >
                  <BarChart2 size={15} color={colors.cyan} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setResourceModalOpen(true)}
                  style={[styles.compIconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  accessibilityLabel="Attach study resource"
                >
                  <Upload size={15} color={colors.success} />
                </TouchableOpacity>
                <TextInput
                  value={draftMsg}
                  onChangeText={setDraftMsg}
                  placeholder={`Message #${activeChannel?.name || 'channel'} ($LaTeX$ supported)...`}
                  placeholderTextColor={colors.textSecondary}
                  onSubmitEditing={handleSendMessage}
                  style={[
                    styles.msgInput,
                    { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
                  ]}
                />
                <Pressable
                  focusable={false}
                  onPress={handleSendMessage}
                  style={[styles.sendBtn, { backgroundColor: colors.primary }]}
                  accessibilityLabel="Send club message"
                >
                  <Send size={16} color="#FFFFFF" />
                </Pressable>
              </View>
            )}
          </View>
        </View>

        {isDesktop && <View style={styles.rightSplitWrap}>{renderMembersPane()}</View>}
      </View>

      {/* Mobile Drawers */}
      <Modal visible={mobileNavOpen} transparent animationType="slide" onRequestClose={() => setMobileNavOpen(false)}>
        <View style={styles.drawerOverlay}>
          <View style={[styles.drawerPanel, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.drawerHdr, { borderBottomColor: colors.border }]}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: colors.text }}>Clubs & Channels</Text>
              <TouchableOpacity onPress={() => setMobileNavOpen(false)} accessibilityLabel="Close navigation drawer">
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>{renderChannelNavPane()}</View>
          </View>
        </View>
      </Modal>

      <Modal visible={mobileMembersOpen} transparent animationType="slide" onRequestClose={() => setMobileMembersOpen(false)}>
        <View style={styles.drawerOverlay}>
          <View style={[styles.drawerPanel, { backgroundColor: colors.card, borderColor: colors.border, alignSelf: 'flex-end' }]}>
            <View style={[styles.drawerHdr, { borderBottomColor: colors.border }]}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: colors.text }}>Members & Direct Messages</Text>
              <TouchableOpacity onPress={() => setMobileMembersOpen(false)} accessibilityLabel="Close members drawer">
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>{renderMembersPane()}</View>
          </View>
        </View>
      </Modal>

      {/* Directory, Preview & Create Modals */}
      <ClubDirectoryModal
        visible={directoryOpen}
        onClose={() => setDirectoryOpen(false)}
        clubs={workspace.clubs}
        joinedClubIds={workspace.joinedClubIds}
        onPreviewClub={(c) => {
          setDirectoryOpen(false);
          setPreviewClub(c);
        }}
        onOpenJoinedClub={(clubId) => {
          handleSelectClub(clubId);
          setDirectoryOpen(false);
        }}
        onJoinByInviteCode={handleJoinByInviteCode}
        onOpenCreateClub={() => {
          setDirectoryOpen(false);
          setCreateClubOpen(true);
        }}
      />

      <ClubPreviewModal
        club={previewClub}
        visible={Boolean(previewClub)}
        onClose={() => setPreviewClub(null)}
        isJoined={Boolean(previewClub && workspace.joinedClubIds.includes(previewClub.id))}
        onJoinPublic={handleJoinPublicClub}
        onRequestPrivateJoin={handleRequestPrivateJoin}
        onOpenClub={(id) => {
          handleSelectClub(id);
          setPreviewClub(null);
        }}
      />

      <CreateClubModal
        visible={createClubOpen}
        onClose={() => setCreateClubOpen(false)}
        owner={{ userId: profile.id, name: profile.name, ioId: profile.ioId }}
        onCreateClub={async (created) => {
          await persistWorkspace({
            ...workspace,
            clubs: [created, ...workspace.clubs],
            joinedClubIds: Array.from(new Set([...workspace.joinedClubIds, created.id])),
            activeClubId: created.id,
            activeChannelId: created.channels[0]?.id || '',
          });
          showToast(`Created "${created.name}" (${created.inviteCode})!`);
        }}
      />

      <ChannelSettingsModal
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        club={activeClub}
        channel={activeChannel}
        canManageChannels={myPermissions.permissions.canManageChannels}
        canManageRoles={myPermissions.permissions.canManageRoles}
        initialTab={settingsInitialTab}
        onUpdateChannel={(updated) =>
          mutateActiveClub((c) => ({
            ...c,
            channels: c.channels.map((ch) => (ch.id === updated.id ? updated : ch)),
          }))
        }
        onDeleteChannel={async (channelId) => {
          const nextChannels = activeClub.channels.filter((ch) => ch.id !== channelId);
          await persistWorkspace({
            ...workspace,
            clubs: workspace.clubs.map((c) =>
              c.id === activeClub.id ? { ...c, channels: nextChannels } : c
            ),
            activeChannelId: nextChannels[0]?.id || '',
          });
          showToast('Channel deleted.');
        }}
        onCreateRole={(role: ClubRole) =>
          mutateActiveClub((c) => ({ ...c, roles: [...c.roles, role] }))
        }
        onUpdateRole={(role: ClubRole) =>
          mutateActiveClub((c) => ({
            ...c,
            roles: c.roles.map((r) => (r.id === role.id ? role : r)),
          }))
        }
        onToggleMemberRole={(userId, roleId) =>
          mutateActiveClub((c) => ({
            ...c,
            members: c.members.map((m) => {
              if (m.userId !== userId) return m;
              const has = m.roleIds.includes(roleId);
              return {
                ...m,
                roleIds: has ? m.roleIds.filter((id) => id !== roleId) : [...m.roleIds, roleId],
              };
            }),
          }))
        }
      />

      <TeacherManagementModal
        visible={teacherOpen}
        onClose={() => setTeacherOpen(false)}
        club={activeClub}
        actorName={profile.name}
        canManageClub={myPermissions.permissions.canManageClub}
        canCreateAssignments={myPermissions.permissions.canCreateAssignments}
        canTakeAttendance={myPermissions.permissions.canTakeAttendance}
        onApproveRequest={(reqId) =>
          mutateActiveClub((c) => {
            const req = c.joinRequests.find((r) => r.id === reqId);
            if (!req) return c;
            const studentRole = c.roles.find((r) => r.name === 'Student');
            const already = c.members.some((m) => m.userId === req.userId);
            return {
              ...c,
              joinRequests: c.joinRequests.map((r) =>
                r.id === reqId ? { ...r, status: 'approved' as const } : r
              ),
              members: already
                ? c.members
                : [
                    ...c.members,
                    {
                      userId: req.userId,
                      name: req.name,
                      ioId: req.ioId,
                      avatarColor: '#10B981',
                      staffLabel: 'Student',
                      roleIds: studentRole ? [studentRole.id] : [],
                      joinedAt: new Date().toISOString(),
                      isOnline: true,
                      xp: 120,
                    },
                  ],
            };
          })
        }
        onRejectRequest={(reqId) =>
          mutateActiveClub((c) => ({
            ...c,
            joinRequests: c.joinRequests.map((r) =>
              r.id === reqId ? { ...r, status: 'rejected' as const } : r
            ),
          }))
        }
        onCreateAssignment={(assignment) =>
          mutateActiveClub((c) => ({
            ...c,
            assignments: [assignment, ...c.assignments],
            messages: [
              ...c.messages,
              {
                id: `msg_asg_${Date.now()}`,
                channelId: assignment.channelId,
                senderId: profile.id,
                senderName: profile.name,
                senderRoleBadge: myPermissions.highestRole?.name || 'Faculty',
                senderRoleColor: myPermissions.highestRole?.color || colors.primary,
                content: `Published Assignment: **${assignment.title}** (Due ${assignment.dueDate}).`,
                createdAt: new Date().toISOString(),
                assignmentId: assignment.id,
                reactions: [],
              },
            ],
          }))
        }
        onGradeSubmission={(subId, score, feedback) =>
          mutateActiveClub((c) => ({
            ...c,
            submissions: c.submissions.map((s) =>
              s.id === subId ? { ...s, score, feedback, status: 'graded' as const } : s
            ),
          }))
        }
        onSaveAttendanceBatch={(records: AttendanceRecord[]) =>
          mutateActiveClub((c) => ({
            ...c,
            attendance: [...records, ...c.attendance],
          }))
        }
      />

      {/* Quick Create Channel Modal */}
      <Modal visible={createChannelOpen} transparent animationType="fade" onRequestClose={() => setCreateChannelOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.smallModal, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>Create Channel in {activeClub.name}</Text>
            <TextInput
              value={newChName}
              onChangeText={setNewChName}
              placeholder="Channel name (e.g. organic-mechanisms)"
              placeholderTextColor={colors.textSecondary}
              style={[styles.modalInput, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border }]}
            />
            <TextInput
              value={newChTopic}
              onChangeText={setNewChTopic}
              placeholder="Channel description..."
              placeholderTextColor={colors.textSecondary}
              style={[styles.modalInput, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border }]}
            />
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
              {(['Study Channels', 'Academic Feeds', 'Information'] as ChannelCategoryType[]).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setNewChCategory(cat)}
                  style={[
                    styles.mentionChip,
                    {
                      backgroundColor: newChCategory === cat ? colors.primary : colors.surface,
                      borderColor: newChCategory === cat ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: newChCategory === cat ? '#FFF' : colors.textSecondary }}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
              {(['text', 'resources', 'polls', 'assignments'] as ChannelType[]).map((tp) => (
                <TouchableOpacity
                  key={tp}
                  onPress={() => setNewChType(tp)}
                  style={[
                    styles.mentionChip,
                    {
                      backgroundColor: newChType === tp ? colors.cyan : colors.surface,
                      borderColor: newChType === tp ? colors.cyan : colors.border,
                    },
                  ]}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: newChType === tp ? '#0F172A' : colors.textSecondary }}>
                    {tp}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
              <Button title="Cancel" variant="outline" onPress={() => setCreateChannelOpen(false)} style={{ flex: 1 }} />
              <Button title="Create Channel" onPress={handleCreateNewChannel} style={{ flex: 1.3 }} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Poll Modal */}
      <Modal visible={pollModalOpen} transparent animationType="fade" onRequestClose={() => setPollModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.smallModal, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>Launch Channel Poll</Text>
            <TextInput
              value={pollQuestion}
              onChangeText={setPollQuestion}
              placeholder="Poll question (e.g. Sunday live sprint subject?)"
              placeholderTextColor={colors.textSecondary}
              style={[styles.modalInput, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border }]}
            />
            <TextInput
              value={pollOpt1}
              onChangeText={setPollOpt1}
              placeholder="Option 1"
              placeholderTextColor={colors.textSecondary}
              style={[styles.modalInput, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border }]}
            />
            <TextInput
              value={pollOpt2}
              onChangeText={setPollOpt2}
              placeholder="Option 2"
              placeholderTextColor={colors.textSecondary}
              style={[styles.modalInput, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border }]}
            />
            <TextInput
              value={pollOpt3}
              onChangeText={setPollOpt3}
              placeholder="Option 3 (optional)"
              placeholderTextColor={colors.textSecondary}
              style={[styles.modalInput, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border }]}
            />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button title="Cancel" variant="outline" onPress={() => setPollModalOpen(false)} style={{ flex: 1 }} />
              <Button title="Post Poll" onPress={handleSendPoll} style={{ flex: 1.3 }} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Resource Share Modal */}
      <Modal visible={resourceModalOpen} transparent animationType="fade" onRequestClose={() => setResourceModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.smallModal, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>Share Study Resource</Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {(['pdf', 'notes', 'ppt', 'image'] as const).map((k) => (
                <TouchableOpacity
                  key={k}
                  onPress={() => setResKind(k)}
                  style={[
                    styles.mentionChip,
                    {
                      backgroundColor: resKind === k ? colors.primary : colors.surface,
                      borderColor: resKind === k ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: resKind === k ? '#FFF' : colors.textSecondary }}>
                    {k.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              value={resTitle}
              onChangeText={setResTitle}
              placeholder="Resource title (e.g. Electrostatics_Formula_Sheet.pdf)"
              placeholderTextColor={colors.textSecondary}
              style={[styles.modalInput, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border }]}
            />
            <TextInput
              value={resSummary}
              onChangeText={setResSummary}
              multiline
              placeholder="Key summary & chapters covered..."
              placeholderTextColor={colors.textSecondary}
              style={[
                styles.modalInput,
                { minHeight: 58, textAlignVertical: 'top', color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
              ]}
            />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button title="Cancel" variant="outline" onPress={() => setResourceModalOpen(false)} style={{ flex: 1 }} />
              <Button title="Attach & Post" onPress={handleSendResource} style={{ flex: 1.3 }} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Assignment Takeaway Submission Modal */}
      <Modal visible={Boolean(submissionModalAsg)} transparent animationType="fade" onRequestClose={() => setSubmissionModalAsg(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.smallModal, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>
              Submit Work · {submissionModalAsg?.title}
            </Text>
            <TextInput
              value={submissionNote}
              onChangeText={setSubmissionNote}
              multiline
              placeholder="Write your derivation summary, score reflection, or solved takeaway..."
              placeholderTextColor={colors.textSecondary}
              style={[
                styles.modalInput,
                { minHeight: 74, textAlignVertical: 'top', color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
              ]}
            />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button title="Cancel" variant="outline" onPress={() => setSubmissionModalAsg(null)} style={{ flex: 1 }} />
              <Button title="Submit to Faculty" onPress={handleSubmitTakeaway} style={{ flex: 1.4 }} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Direct Message Modal */}
      <Modal visible={Boolean(activeDmThread)} transparent animationType="fade" onRequestClose={() => setDmModalThreadId(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.smallModal, { maxHeight: '80%', backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>
                DM · {activeDmThread?.peerName} ({activeDmThread?.peerRole})
              </Text>
              <TouchableOpacity onPress={() => setDmModalThreadId(null)}>
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 260 }} contentContainerStyle={{ gap: 8, paddingVertical: 8 }}>
              {(activeDmThread?.messages || []).length === 0 ? (
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                  Start a direct academic chat with {activeDmThread?.peerName}.
                </Text>
              ) : (
                activeDmThread?.messages.map((m) => (
                  <View
                    key={m.id}
                    style={{
                      alignSelf: m.senderId === profile.id ? 'flex-end' : 'flex-start',
                      backgroundColor: m.senderId === profile.id ? colors.primary : colors.surface,
                      padding: 9,
                      borderRadius: 11,
                      maxWidth: '85%',
                    }}
                  >
                    <Text style={{ fontSize: 12.5, color: m.senderId === profile.id ? '#FFFFFF' : colors.text }}>
                      {m.text}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput
                value={dmDraft}
                onChangeText={setDmDraft}
                placeholder="Write a direct message..."
                placeholderTextColor={colors.textSecondary}
                style={[styles.modalInput, { flex: 1, color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border }]}
              />
              <Button title="Send" size="sm" onPress={handleSendDm} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Safety Report Modal */}
      <Modal visible={Boolean(reportModalTarget)} transparent animationType="fade" onRequestClose={() => setReportModalTarget(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.smallModal, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>
              Report Moderation Issue ({reportModalTarget?.name})
            </Text>
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
              {['Off-topic / Spam link', 'Harassment / Conduct', 'Incorrect Academic Claim'].map((rs) => (
                <TouchableOpacity
                  key={rs}
                  onPress={() => setReportReason(rs)}
                  style={[
                    styles.mentionChip,
                    {
                      backgroundColor: reportReason === rs ? colors.error : colors.surface,
                      borderColor: reportReason === rs ? colors.error : colors.border,
                    },
                  ]}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: reportReason === rs ? '#FFF' : colors.textSecondary }}>
                    {rs}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              value={reportDetails}
              onChangeText={setReportDetails}
              multiline
              placeholder="Optional moderation details..."
              placeholderTextColor={colors.textSecondary}
              style={[
                styles.modalInput,
                { minHeight: 56, textAlignVertical: 'top', color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
              ]}
            />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button title="Cancel" variant="outline" onPress={() => setReportModalTarget(null)} style={{ flex: 1 }} />
              <Button title="Log Safety Report" onPress={handleSubmitSafetyReport} style={{ flex: 1.4, backgroundColor: colors.error }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
  },
  topBarCompact: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 7,
    paddingVertical: 8,
  },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  topActionsCompact: { width: '100%', justifyContent: 'space-between' },
  roleSimPill: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  toolBtn: {
    width: 32,
    height: 32,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  dotBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  toastBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderBottomWidth: 1,
  },
  workspaceRow: { flex: 1, flexDirection: 'row', minHeight: 0 },
  leftSplitWrap: { width: 278, flexDirection: 'row' },
  rightSplitWrap: { width: 256 },
  splitSideRoot: { flex: 1, flexDirection: 'row' },
  serverRail: { width: 58, borderRightWidth: 1, alignItems: 'center' },
  serverRailList: { alignItems: 'center', paddingVertical: 10, gap: 9 },
  serverPill: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  railDivider: { width: 26, height: 1.5, marginVertical: 2 },
  serverRailAction: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  channelSidebar: { flex: 1, borderRightWidth: 1 },
  clubHeaderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 6,
  },
  catLabel: { fontSize: 9.5, fontWeight: '800', letterSpacing: 0.6, paddingHorizontal: 4, marginBottom: 2 },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  newChannelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 9,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  userFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderTopWidth: 1,
  },
  miniAvatar: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatColumn: { flex: 1, minWidth: 0 },
  welcomeCard: { padding: 12, borderRadius: 14, borderWidth: 1 },
  msgCard: { padding: 12, borderRadius: 14, borderWidth: 1, gap: 6 },
  replyStrip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderLeftWidth: 3,
    borderRadius: 6,
  },
  msgHdr: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  rolePillTag: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  asgCard: { padding: 10, borderRadius: 12, borderWidth: 1, gap: 6, marginTop: 4 },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  pollCard: { padding: 10, borderRadius: 12, borderWidth: 1, gap: 7, marginTop: 4 },
  pollOption: { padding: 8, borderRadius: 9, borderWidth: 1, gap: 4 },
  pollTrack: { height: 5, borderRadius: 3, overflow: 'hidden' },
  pollFill: { height: '100%', borderRadius: 3 },
  msgFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  reactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  tinyIconBtn: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 7,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  composerBox: { paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, gap: 6 },
  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  mentionChip: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
  lockedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  compIconBtn: {
    width: 34,
    height: 36,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 8,
    fontSize: 13,
    minWidth: 0,
  },
  sendBtn: {
    width: 38,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  membersPane: { flex: 1, borderLeftWidth: 1 },
  membersHdr: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  drawerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.58)' },
  drawerPanel: { width: 310, height: '100%', borderWidth: 1 },
  drawerHdr: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.68)', justifyContent: 'center', alignItems: 'center', padding: 14 },
  smallModal: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 16,
    gap: 10,
  },
  modalInput: {
    minWidth: 0,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 9,
    fontSize: 13,
  },
});
