import type {
  AttendanceRecord,
  ClubCategoryTag,
  ClubChannel,
  ClubKind,
  ClubMember,
  ClubPermissions,
  ClubRole,
  InstituteAssignment,
  PreferredLanguage,
  StudyClub,
  SystemStaffRole,
} from '../types';

export const ATTENDANCE_POLICY_DISCLAIMER =
  'Digital attendance check-ins log session participation records only and do NOT verify physical classroom presence or real-time attentiveness.';

export const ROLE_COLOR_SWATCHES = [
  '#F97316',
  '#EF4444',
  '#22D3EE',
  '#10B981',
  '#8B5CF6',
  '#F59E0B',
  '#EC4899',
  '#64748B',
];

export const ROLE_ICON_OPTIONS = [
  { id: 'crown', label: 'Crown' },
  { id: 'shield', label: 'Shield' },
  { id: 'graduation', label: 'Faculty' },
  { id: 'sparkles', label: 'Monitor' },
  { id: 'book', label: 'Scholar' },
  { id: 'user', label: 'Member' },
];

export const CLUB_CATEGORY_OPTIONS: ClubCategoryTag[] = [
  'JEE / NEET Cohort',
  'School / Board Class',
  'Peer Study Guild',
  'Olympiad & STEM Lab',
  'IB / AP / SAT Circle',
  'Doubt Solving Hub',
];

export const FULL_ADMIN_PERMS: ClubPermissions = {
  canManageClub: true,
  canManageChannels: true,
  canManageRoles: true,
  canCreateAssignments: true,
  canTakeAttendance: true,
  canModerateMessages: true,
  canPostAnnouncements: true,
  canPinMessages: true,
  canViewAnalytics: true,
};

export const TEACHER_PERMS: ClubPermissions = {
  canManageClub: false,
  canManageChannels: true,
  canManageRoles: false,
  canCreateAssignments: true,
  canTakeAttendance: true,
  canModerateMessages: true,
  canPostAnnouncements: true,
  canPinMessages: true,
  canViewAnalytics: true,
};

export const MONITOR_PERMS: ClubPermissions = {
  canManageClub: false,
  canManageChannels: false,
  canManageRoles: false,
  canCreateAssignments: false,
  canTakeAttendance: false,
  canModerateMessages: true,
  canPostAnnouncements: false,
  canPinMessages: true,
  canViewAnalytics: false,
};

export const STUDENT_PERMS: ClubPermissions = {
  canManageClub: false,
  canManageChannels: false,
  canManageRoles: false,
  canCreateAssignments: false,
  canTakeAttendance: false,
  canModerateMessages: false,
  canPostAnnouncements: false,
  canPinMessages: false,
  canViewAnalytics: false,
};

export function staffRolePresetPermissions(staff: SystemStaffRole): ClubPermissions {
  if (staff === 'Platform Admin' || staff === 'Institute Owner' || staff === 'Principal') {
    return { ...FULL_ADMIN_PERMS };
  }
  if (staff === 'Teacher' || staff === 'Subject Teacher') {
    return { ...TEACHER_PERMS };
  }
  if (staff === 'Class Monitor') {
    return { ...MONITOR_PERMS };
  }
  return { ...STUDENT_PERMS };
}

export function buildStandardRolesForClub(prefix: string): ClubRole[] {
  return [
    {
      id: `${prefix}_role_owner`,
      name: 'Institute Owner',
      color: '#F59E0B',
      badgeIcon: 'crown',
      priority: 100,
      permissions: { ...FULL_ADMIN_PERMS },
    },
    {
      id: `${prefix}_role_principal`,
      name: 'Principal',
      color: '#EF4444',
      badgeIcon: 'shield',
      priority: 90,
      permissions: { ...FULL_ADMIN_PERMS },
    },
    {
      id: `${prefix}_role_teacher`,
      name: 'Teacher',
      color: '#22D3EE',
      badgeIcon: 'graduation',
      priority: 75,
      permissions: { ...TEACHER_PERMS },
    },
    {
      id: `${prefix}_role_monitor`,
      name: 'Class Monitor',
      color: '#8B5CF6',
      badgeIcon: 'sparkles',
      priority: 50,
      permissions: { ...MONITOR_PERMS },
    },
    {
      id: `${prefix}_role_student`,
      name: 'Student',
      color: '#10B981',
      badgeIcon: 'book',
      priority: 20,
      permissions: { ...STUDENT_PERMS },
    },
    {
      id: `${prefix}_role_everyone`,
      name: 'everyone',
      color: '#94A3B8',
      badgeIcon: 'user',
      priority: 0,
      isDefault: true,
      permissions: { ...STUDENT_PERMS },
    },
  ];
}

export function resolveMemberPermissions(
  club: StudyClub,
  userId: string,
  simulatedStaffRole?: SystemStaffRole | 'actual'
): {
  staffLabel: SystemStaffRole;
  roles: ClubRole[];
  highestRole?: ClubRole;
  permissions: ClubPermissions;
  isManager: boolean;
} {
  if (simulatedStaffRole && simulatedStaffRole !== 'actual') {
    const perms = staffRolePresetPermissions(simulatedStaffRole);
    const matchedRole =
      club.roles.find((r) => r.name.toLowerCase() === simulatedStaffRole.toLowerCase()) ||
      club.roles.find((r) =>
        simulatedStaffRole.includes('Teacher')
          ? r.name.toLowerCase().includes('teacher')
          : simulatedStaffRole.includes('Owner') || simulatedStaffRole.includes('Admin')
          ? r.name.toLowerCase().includes('owner')
          : r.name.toLowerCase().includes('student')
      );
    return {
      staffLabel: simulatedStaffRole,
      roles: matchedRole ? [matchedRole] : [],
      highestRole: matchedRole,
      permissions: perms,
      isManager:
        perms.canManageClub ||
        perms.canManageChannels ||
        perms.canManageRoles ||
        club.ownerId === userId && simulatedStaffRole === 'Institute Owner',
    };
  }

  const member = club.members.find((m) => m.userId === userId);
  if (!member) {
    const everyone = club.roles.find((r) => r.isDefault || r.name === 'everyone');
    return {
      staffLabel: 'Student',
      roles: everyone ? [everyone] : [],
      highestRole: everyone,
      permissions: { ...STUDENT_PERMS },
      isManager: false,
    };
  }

  const assignedRoles = club.roles
    .filter((r) => member.roleIds.includes(r.id) || r.isDefault)
    .sort((a, b) => b.priority - a.priority);

  const staffBase = staffRolePresetPermissions(member.staffLabel);
  const combined: ClubPermissions = { ...staffBase };
  for (const role of assignedRoles) {
    (Object.keys(combined) as Array<keyof ClubPermissions>).forEach((k) => {
      if (role.permissions[k]) combined[k] = true;
    });
  }
  if (club.ownerId === userId || member.staffLabel === 'Platform Admin') {
    (Object.keys(combined) as Array<keyof ClubPermissions>).forEach((k) => {
      combined[k] = true;
    });
  }

  const highest = assignedRoles.find((r) => !r.isDefault) || assignedRoles[0];
  return {
    staffLabel: member.staffLabel,
    roles: assignedRoles,
    highestRole: highest,
    permissions: combined,
    isManager:
      combined.canManageClub ||
      combined.canManageChannels ||
      combined.canManageRoles ||
      club.ownerId === userId,
  };
}

/**
 * Enforces the 3-way channel visibility model adapted from clubs/view.ejs:
 * - open: visible to all members
 * - public_view: visible to all members (viewing permitted)
 * - role_private: hidden completely unless user holds an allowed role or is Manager/Admin
 */
export function canViewChannel(
  channel: ClubChannel,
  memberRoleIds: string[],
  isManager: boolean
): boolean {
  if (isManager) return true;
  if (channel.accessMode === 'open' || channel.accessMode === 'public_view') {
    return true;
  }
  if (channel.allowedRoleIds.length === 0) return false;
  return memberRoleIds.some((rid) => channel.allowedRoleIds.includes(rid));
}

/**
 * Enforces whether the user can send messages in the active channel:
 * - Managers/Admins can bypass read-only mode on announcement/rules channels (except rules system lock preview)
 * - In public_view mode, only allowed roles or managers can send messages; others read-only
 * - In role_private mode, allowed roles can chat unless isReadOnly is also enabled
 */
export function canPostInChannel(
  channel: ClubChannel,
  memberRoleIds: string[],
  isManager: boolean,
  canPostAnnouncements = false
): { allowed: boolean; reason?: string } {
  if (channel.isReadOnly) {
    if (isManager || (channel.type === 'announcements' && canPostAnnouncements)) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'Read-only channel. Only Faculty, Mentors, or Admins can post here.',
    };
  }

  if (channel.accessMode === 'public_view') {
    const hasWhitelistedRole = memberRoleIds.some((rid) =>
      channel.allowedRoleIds.includes(rid)
    );
    if (!isManager && !hasWhitelistedRole) {
      return {
        allowed: false,
        reason: 'View-only channel. Designated faculty & role holders can reply.',
      };
    }
  }

  if (channel.accessMode === 'role_private') {
    const hasWhitelistedRole = memberRoleIds.some((rid) =>
      channel.allowedRoleIds.includes(rid)
    );
    if (!isManager && !hasWhitelistedRole) {
      return {
        allowed: false,
        reason: 'Locked to private roles.',
      };
    }
  }

  return { allowed: true };
}

export function filterDirectoryClubs(
  clubs: StudyClub[],
  params: {
    query?: string;
    access?: 'all' | 'public' | 'private' | 'joined';
    country?: string;
    sortBy?: 'members' | 'newest';
    joinedIds?: string[];
  }
): StudyClub[] {
  const q = (params.query || '').trim().toLowerCase();
  const joinedSet = new Set(params.joinedIds || []);

  const filtered = clubs.filter((club) => {
    if (params.access === 'public' && club.isPrivate) return false;
    if (params.access === 'private' && !club.isPrivate) return false;
    if (params.access === 'joined' && !joinedSet.has(club.id)) return false;

    if (params.country && params.country !== 'ALL' && club.country !== params.country) {
      return false;
    }

    if (q) {
      const hay = [
        club.name,
        club.description,
        club.inviteCode,
        club.category,
        club.tags.join(' '),
      ]
        .join(' ')
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }

    return true;
  });

  if (params.sortBy === 'newest') {
    return [...filtered].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  return [...filtered].sort((a, b) => b.members.length - a.members.length);
}

const TRUSTED_EDU_DOMAINS = [
  'study.io',
  'studylabs.app',
  'ncert.nic.in',
  'khanacademy.org',
  'mit.edu',
  'arxiv.org',
  'en.wikipedia.org',
];

export function checkMessageAntiSpam(
  text: string,
  blockExternalLinks = true
): { ok: boolean; blockedDomain?: string; reason?: string } {
  if (!blockExternalLinks || !text) return { ok: true };
  const matches = text.match(/https?:\/\/([a-zA-Z0-9.-]+)/gi);
  if (!matches) return { ok: true };

  for (const rawUrl of matches) {
    const host = rawUrl.replace(/^https?:\/\//i, '').toLowerCase();
    const isTrusted = TRUSTED_EDU_DOMAINS.some(
      (d) => host === d || host.endsWith('.' + d)
    );
    if (!isTrusted) {
      return {
        ok: false,
        blockedDomain: host,
        reason: `External unverified link (${host}) blocked by club safety filter. Only Study Labs or approved academic links are permitted.`,
      };
    }
  }
  return { ok: true };
}

export function slugifyClubName(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 32) || 'study-club'
  );
}

export function generateInviteCode(kind: ClubKind): string {
  const prefix = kind === 'institute' ? 'INST' : 'CLUB';
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  const num = Math.floor(10 + Math.random() * 89);
  return `${prefix}-${rand}${num}`;
}

export function createNewStudyClubObject(input: {
  name: string;
  description: string;
  kind: ClubKind;
  category: ClubCategoryTag;
  tags: string[];
  primaryLanguage: PreferredLanguage;
  country: string;
  isPrivate: boolean;
  aboutAdmin: string;
  rules: string[];
  bannerColor: string;
  iconColor: string;
  owner: { userId: string; name: string; ioId: string };
}): StudyClub {
  const clubId = `club_${Date.now()}`;
  const roles = buildStandardRolesForClub(clubId);
  const ownerRole = roles[0];
  const teacherRole = roles[2];
  const everyoneRole = roles[roles.length - 1];
  const nowIso = new Date().toISOString();

  const chRulesId = `${clubId}_ch_rules`;
  const chAnnId = `${clubId}_ch_ann`;
  const chAssignId = `${clubId}_ch_assign`;
  const chGeneralId = `${clubId}_ch_general`;
  const chPollsId = `${clubId}_ch_polls`;

  const creatorMember: ClubMember = {
    userId: input.owner.userId,
    name: input.owner.name,
    ioId: input.owner.ioId,
    avatarColor: input.iconColor,
    staffLabel: input.kind === 'institute' ? 'Institute Owner' : 'Platform Admin',
    roleIds: [ownerRole.id, everyoneRole.id],
    joinedAt: nowIso,
    isOnline: true,
    xp: 420,
    bio: input.aboutAdmin || 'Founder & organizer.',
  };

  return {
    id: clubId,
    name: input.name.trim(),
    slug: slugifyClubName(input.name),
    inviteCode: generateInviteCode(input.kind),
    kind: input.kind,
    category: input.category,
    description: input.description.trim() || 'Focused academic community on Study Labs.',
    tags: input.tags.slice(0, 8),
    primaryLanguage: input.primaryLanguage,
    country: input.country,
    isPrivate: input.isPrivate,
    isVerified: input.kind === 'institute',
    ownerId: input.owner.userId,
    ownerName: input.owner.name,
    aboutAdmin: input.aboutAdmin.trim() || `${input.owner.name} — Club Organizer`,
    bannerColor: input.bannerColor,
    iconColor: input.iconColor,
    rules:
      input.rules.length > 0
        ? input.rules
        : [
            'Keep discussions respectful and academically constructive.',
            'No spam links or unverified promotions.',
          ],
    createdAt: nowIso,
    roles,
    members: [creatorMember],
    channels: [
      {
        id: chRulesId,
        clubId,
        name: 'rules',
        topic: 'Code of conduct & study guidelines',
        category: 'Information',
        type: 'rules',
        accessMode: 'public_view',
        isReadOnly: true,
        isSystem: true,
        allowedRoleIds: [ownerRole.id],
      },
      {
        id: chAnnId,
        clubId,
        name: 'announcements',
        topic: 'Official notices, schedules & exam circulars',
        category: 'Information',
        type: 'announcements',
        accessMode: 'public_view',
        isReadOnly: true,
        isSystem: true,
        allowedRoleIds: [ownerRole.id, teacherRole.id],
      },
      {
        id: chAssignId,
        clubId,
        name: input.kind === 'institute' ? 'assignments-and-tests' : 'shared-resources',
        topic:
          input.kind === 'institute'
            ? 'Homework, mock quizzes & grading'
            : 'Notes, formula sheets & study guides',
        category: 'Academic Feeds',
        type: input.kind === 'institute' ? 'assignments' : 'resources',
        accessMode: 'open',
        isReadOnly: false,
        allowedRoleIds: [],
        blockExternalLinks: true,
      },
      {
        id: chGeneralId,
        clubId,
        name: 'general-doubts',
        topic: 'Ask subject doubts & collaborate with peers',
        category: 'Study Channels',
        type: 'text',
        accessMode: 'open',
        isReadOnly: false,
        allowedRoleIds: [],
        blockExternalLinks: true,
      },
      {
        id: chPollsId,
        clubId,
        name: 'polls',
        topic: 'Vote on revision sessions & mock timings',
        category: 'Study Channels',
        type: 'polls',
        accessMode: 'open',
        isReadOnly: false,
        allowedRoleIds: [],
      },
    ],
    messages: [
      {
        id: `${clubId}_msg_1`,
        channelId: chAnnId,
        senderId: input.owner.userId,
        senderName: input.owner.name,
        senderRoleBadge: ownerRole.name,
        senderRoleColor: ownerRole.color,
        content: `Welcome to **${input.name.trim()}**! Use #general-doubts for LaTeX Q&A and check #rules before posting.`,
        createdAt: nowIso,
        isPinned: true,
        reactions: [{ emoji: '🔥', userIds: [input.owner.userId] }],
      },
      {
        id: `${clubId}_msg_2`,
        channelId: chGeneralId,
        senderId: 'bot_studylabs',
        senderName: 'Study Labs Assistant',
        senderRoleBadge: 'BOT',
        senderRoleColor: '#22D3EE',
        content: `Channel initialized cleanly for @everyone. Invite peers using code ${
          input.kind === 'institute' ? 'from Channel Settings' : 'in Header'
        }.`,
        createdAt: nowIso,
        isBotMessage: true,
        reactions: [],
      },
    ],
    assignments: [] as InstituteAssignment[],
    submissions: [],
    attendance: [] as AttendanceRecord[],
    joinRequests: [],
  };
}

export function computeClubCohortStats(club: StudyClub) {
  const studentMembers = club.members.filter((m) => m.staffLabel === 'Student');
  const totalAttendanceEntries = club.attendance.length;
  const presentOrLate = club.attendance.filter(
    (a) => a.status === 'present' || a.status === 'late'
  ).length;
  const attendancePct =
    totalAttendanceEntries > 0
      ? Math.round((presentOrLate / totalAttendanceEntries) * 100)
      : 100;

  const totalAssignments = club.assignments.length;
  const gradedCount = club.submissions.filter((s) => s.status === 'graded').length;
  const pendingReviewCount = club.submissions.filter((s) => s.status === 'submitted').length;

  return {
    totalMembers: club.members.length,
    studentCount: studentMembers.length,
    attendancePct,
    totalAssignments,
    totalSubmissions: club.submissions.length,
    gradedCount,
    pendingReviewCount,
    pendingJoinRequests: club.joinRequests.filter((r) => r.status === 'pending').length,
  };
}

