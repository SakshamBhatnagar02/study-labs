import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useTheme } from '../../theme';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { copyTextSafely } from '../common/StateFeedbackCard';
import {
  ROLE_COLOR_SWATCHES,
  ROLE_ICON_OPTIONS,
  STUDENT_PERMS,
} from '../../utils/clubsEngine';
import type {
  ChannelAccessMode,
  ChannelCategoryType,
  ChannelType,
  ClubChannel,
  ClubPermissions,
  ClubRole,
  StudyClub,
} from '../../types';
import {
  Check,
  Copy,
  Edit3,
  Eye,
  Hash,
  Info,
  KeyRound,
  Lock,
  Plus,
  Settings,
  Shield,
  Trash2,
  X,
} from 'lucide-react-native';

export type ChannelSettingsTabId = 'info' | 'invite' | 'access' | 'edit' | 'roles' | 'delete';

interface ChannelSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  club: StudyClub;
  channel: ClubChannel | null;
  canManageChannels: boolean;
  canManageRoles: boolean;
  initialTab?: ChannelSettingsTabId;
  onUpdateChannel: (updated: ClubChannel) => void;
  onDeleteChannel: (channelId: string) => void;
  onCreateRole: (role: ClubRole) => void;
  onUpdateRole: (role: ClubRole) => void;
  onToggleMemberRole: (userId: string, roleId: string) => void;
}

const ACCESS_MODES: Array<{
  id: ChannelAccessMode;
  title: string;
  desc: string;
  Icon: typeof Hash;
}> = [
  {
    id: 'open',
    title: 'Public Open Chat',
    desc: 'All club members can view and send messages in this channel.',
    Icon: Hash,
  },
  {
    id: 'public_view',
    title: 'View Only for Members',
    desc: 'All members can read, while only selected roles or Faculty can post.',
    Icon: Eye,
  },
  {
    id: 'role_private',
    title: 'Private to Selected Roles',
    desc: 'Completely hidden from unauthorized students; only allowed roles & managers see it.',
    Icon: Lock,
  },
];

const PERM_LABELS: Array<{ key: keyof ClubPermissions; label: string }> = [
  { key: 'canManageClub', label: 'Manage Club Profile & Settings' },
  { key: 'canManageChannels', label: 'Create, Lock & Edit Channels' },
  { key: 'canManageRoles', label: 'Manage Roles & Permissions' },
  { key: 'canCreateAssignments', label: 'Create Assignments & Grade Submissions' },
  { key: 'canTakeAttendance', label: 'Record Digital Attendance' },
  { key: 'canModerateMessages', label: 'Delete Messages & Verify Answers' },
  { key: 'canPostAnnouncements', label: 'Post in #announcements' },
  { key: 'canPinMessages', label: 'Pin & Unpin Messages' },
  { key: 'canViewAnalytics', label: 'View Cohort Insights' },
];

export const ChannelSettingsModal: React.FC<ChannelSettingsModalProps> = ({
  visible,
  onClose,
  club,
  channel,
  canManageChannels,
  canManageRoles,
  initialTab = 'info',
  onUpdateChannel,
  onDeleteChannel,
  onCreateRole,
  onUpdateRole,
  onToggleMemberRole,
}) => {
  const { colors, mode } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<ChannelSettingsTabId>(initialTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Edit/Access states synced from channel
  const [draftName, setDraftName] = useState('');
  const [draftTopic, setDraftTopic] = useState('');
  const [draftCategory, setDraftCategory] = useState<ChannelCategoryType>('Study Channels');
  const [draftType, setDraftType] = useState<ChannelType>('text');
  const [accessMode, setAccessMode] = useState<ChannelAccessMode>('open');
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [blockExternalLinks, setBlockExternalLinks] = useState(true);
  const [allowedRoleIds, setAllowedRoleIds] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Role Builder / Editor
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleColor, setNewRoleColor] = useState(ROLE_COLOR_SWATCHES[0]);
  const [newRoleIcon, setNewRoleIcon] = useState(ROLE_ICON_OPTIONS[3].id);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setActiveTab(initialTab);
    setStatusMsg(null);
    setConfirmDelete(false);
    if (channel) {
      setDraftName(channel.name);
      setDraftTopic(channel.topic);
      setDraftCategory(channel.category);
      setDraftType(channel.type);
      setAccessMode(channel.accessMode);
      setIsReadOnly(channel.isReadOnly);
      setBlockExternalLinks(channel.blockExternalLinks !== false);
      setAllowedRoleIds(channel.allowedRoleIds || []);
    }
    if (club.roles.length > 0 && !selectedRoleId) {
      setSelectedRoleId(club.roles[0].id);
    }
  }, [visible, initialTab, channel, club.roles, selectedRoleId]);

  const handleCopy = async (label: string, val: string) => {
    await copyTextSafely(val);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveChannelChanges = () => {
    if (!channel) return;
    const cleanName = draftName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    onUpdateChannel({
      ...channel,
      name: cleanName || channel.name,
      topic: draftTopic.trim() || channel.topic,
      category: draftCategory,
      type: draftType,
      accessMode,
      isReadOnly,
      blockExternalLinks,
      allowedRoleIds,
    });
    setStatusMsg('Channel settings & access rules updated.');
  };

  const toggleAllowedRole = (roleId: string) => {
    setAllowedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const activeRole = club.roles.find((r) => r.id === selectedRoleId) || club.roles[0];

  const handleCreateCustomRole = () => {
    const clean = newRoleName.trim();
    if (!clean) {
      setStatusMsg('Enter a name for the new role.');
      return;
    }
    const created: ClubRole = {
      id: `${club.id}_role_${Date.now()}`,
      name: clean,
      color: newRoleColor,
      badgeIcon: newRoleIcon,
      priority: 40,
      permissions: { ...STUDENT_PERMS, canPinMessages: true },
    };
    onCreateRole(created);
    setSelectedRoleId(created.id);
    setNewRoleName('');
    setStatusMsg(`Created role "${created.name}". Toggle permissions below.`);
  };

  const handleToggleRolePerm = (permKey: keyof ClubPermissions, nextVal: boolean) => {
    if (!activeRole || !canManageRoles) return;
    onUpdateRole({
      ...activeRole,
      permissions: {
        ...activeRole.permissions,
        [permKey]: nextVal,
      },
    });
  };

  const tabs: Array<{ id: ChannelSettingsTabId; label: string; Icon: typeof Info }> = [
    { id: 'info', label: 'Info', Icon: Info },
    { id: 'invite', label: 'Invite', Icon: KeyRound },
    { id: 'access', label: 'Access & Lock', Icon: Lock },
    { id: 'edit', label: 'Edit', Icon: Edit3 },
    { id: 'roles', label: 'Roles & Perms', Icon: Shield },
    { id: 'delete', label: 'Delete', Icon: Trash2 },
  ];

  const inviteUrl = `study.io/clubs/${club.slug}?code=${club.inviteCode}`;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.sheet,
            {
              width: Math.min(windowWidth - 24, 620),
              maxWidth: '100%',
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 0, paddingRight: 8 }}>
              <View style={[styles.hdrIcon, { backgroundColor: mode === 'dark' ? '#431407' : '#FFEDD5' }]}>
                <Settings size={17} color={colors.primary} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                  {channel ? `#${channel.name}` : club.name} · Workspace Settings
                </Text>
                <Text style={[styles.sub, { color: colors.textSecondary }]} numberOfLines={2}>
                  {club.name} · {club.roles.length} roles · {club.channels.length} channels
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={{ flexShrink: 0, padding: 4 }} accessibilityLabel="Close channel settings">
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* 6-Tab Navigation Strip (Adapted from clubs/view.ejs) */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={[styles.tabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
            contentContainerStyle={{ gap: 6, paddingHorizontal: 14, paddingVertical: 8 }}
          >
            {tabs.map(({ id, label, Icon }) => {
              const active = activeTab === id;
              const isDanger = id === 'delete';
              return (
                <TouchableOpacity
                  key={id}
                  onPress={() => {
                    setActiveTab(id);
                    setStatusMsg(null);
                  }}
                  style={[
                    styles.tabBtn,
                    {
                      backgroundColor: active
                        ? isDanger
                          ? colors.error
                          : colors.primary
                        : colors.card,
                      borderColor: active
                        ? isDanger
                          ? colors.error
                          : colors.primary
                        : colors.border,
                    },
                  ]}
                >
                  <Icon size={13} color={active ? '#FFFFFF' : isDanger ? colors.error : colors.textSecondary} />
                  <Text
                    style={{
                      fontSize: 11.5,
                      fontWeight: '700',
                      color: active ? '#FFFFFF' : isDanger ? colors.error : colors.text,
                    }}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <ScrollView style={styles.body} contentContainerStyle={{ gap: 12, paddingVertical: 14 }}>
            {statusMsg && (
              <View style={[styles.statusBanner, { backgroundColor: mode === 'dark' ? '#052E16' : '#DCFCE7', borderColor: colors.success }]}>
                <Check size={14} color={colors.success} />
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.success, flex: 1 }}>
                  {statusMsg}
                </Text>
              </View>
            )}

            {activeTab === 'info' && (
              <>
                <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.secLbl, { color: colors.textSecondary }]}>CHANNEL SUMMARY</Text>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>
                    #{channel?.name || 'general'}
                  </Text>
                  <Text style={{ fontSize: 12.5, color: colors.textSecondary, marginTop: 4, lineHeight: 18 }}>
                    {channel?.topic || club.description}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                    <Badge label={`Category: ${channel?.category || 'Study'}`} variant="neutral" size="sm" />
                    <Badge label={`Mode: ${channel?.accessMode || 'open'}`} variant="primary" size="sm" />
                    {channel?.isReadOnly && <Badge label="Read-Only Lock" variant="warning" size="sm" />}
                    {channel?.blockExternalLinks !== false && (
                      <Badge label="Link Anti-Spam ON" variant="success" size="sm" />
                    )}
                  </View>
                </View>

                <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.secLbl, { color: colors.textSecondary }]}>CLUB & FACULTY INFO</Text>
                  <Text style={{ fontSize: 13.5, fontWeight: '800', color: colors.text }}>{club.name}</Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                    Owner: {club.ownerName} · {club.members.length} members · {club.country} · {club.primaryLanguage}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.text, marginTop: 6, lineHeight: 17 }}>
                    {club.aboutAdmin}
                  </Text>
                </View>
              </>
            )}

            {activeTab === 'invite' && (
              <>
                <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.secLbl, { color: colors.textSecondary }]}>CLUB INVITE CODE</Text>
                  <View style={styles.copyBox}>
                    <Text style={{ fontSize: 18, fontWeight: '900', color: colors.primary, letterSpacing: 1 }}>
                      {club.inviteCode}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleCopy('code', club.inviteCode)}
                      style={[styles.copyBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                    >
                      {copiedKey === 'code' ? (
                        <Check size={14} color={colors.success} />
                      ) : (
                        <Copy size={14} color={colors.primary} />
                      )}
                      <Text style={{ fontSize: 11.5, fontWeight: '700', color: colors.text }}>
                        {copiedKey === 'code' ? 'Copied' : 'Copy Code'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.secLbl, { color: colors.textSecondary }]}>DIRECT JOIN LINK</Text>
                  <View style={styles.copyBox}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text, flex: 1 }} numberOfLines={1}>
                      {inviteUrl}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleCopy('link', inviteUrl)}
                      style={[styles.copyBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                    >
                      {copiedKey === 'link' ? (
                        <Check size={14} color={colors.success} />
                      ) : (
                        <Copy size={14} color={colors.primary} />
                      )}
                      <Text style={{ fontSize: 11.5, fontWeight: '700', color: colors.text }}>
                        {copiedKey === 'link' ? 'Copied' : 'Copy Link'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 6 }}>
                    Learners can paste {club.inviteCode} inside Study Clubs Discovery to join directly.
                  </Text>
                </View>
              </>
            )}

            {activeTab === 'access' && channel && (
              <>
                {!canManageChannels && (
                  <View style={[styles.warnBox, { backgroundColor: colors.surface, borderColor: colors.warning }]}>
                    <Text style={{ fontSize: 12, color: colors.warning, fontWeight: '700' }}>
                      Read-only preview: Switch "View As Role" to Institute Owner or Teacher to save channel lock changes.
                    </Text>
                  </View>
                )}

                <Text style={[styles.secLbl, { color: colors.textSecondary }]}>3-WAY CHANNEL VISIBILITY & ACCESS</Text>
                {ACCESS_MODES.map(({ id, title, desc, Icon }) => {
                  const active = accessMode === id;
                  return (
                    <Pressable
                      key={id}
                      focusable={false}
                      disabled={!canManageChannels}
                      onPress={() => setAccessMode(id)}
                      style={[
                        styles.accessCard,
                        {
                          backgroundColor: active
                            ? mode === 'dark'
                              ? '#431407'
                              : '#FFEDD5'
                            : colors.surface,
                          borderColor: active ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Icon size={16} color={active ? colors.primary : colors.textSecondary} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: active ? colors.primary : colors.text }}>
                          {title}
                        </Text>
                        <Text style={{ fontSize: 11.5, color: colors.textSecondary, marginTop: 2 }}>{desc}</Text>
                      </View>
                    </Pressable>
                  );
                })}

                {accessMode !== 'open' && (
                  <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.secLbl, { color: colors.textSecondary }]}>ALLOWED ROLES FOR THIS CHANNEL</Text>
                    <View style={styles.chipWrap}>
                      {club.roles.map((r) => {
                        const selected = allowedRoleIds.includes(r.id);
                        return (
                          <TouchableOpacity
                            key={r.id}
                            disabled={!canManageChannels}
                            onPress={() => toggleAllowedRole(r.id)}
                            style={[
                              styles.rolePill,
                              {
                                backgroundColor: selected ? r.color : colors.card,
                                borderColor: selected ? r.color : colors.border,
                              },
                            ]}
                          >
                            <View style={[styles.dot, { backgroundColor: selected ? '#FFFFFF' : r.color }]} />
                            <Text style={{ fontSize: 11.5, fontWeight: '700', color: selected ? '#FFFFFF' : colors.text }}>
                              {r.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}

                <View style={[styles.switchRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>Read-Only Channel Lock</Text>
                    <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                      Students can read, while only Faculty / Admins can post.
                    </Text>
                  </View>
                  <Switch
                    value={isReadOnly}
                    disabled={!canManageChannels}
                    onValueChange={setIsReadOnly}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#FFFFFF"
                    ios_backgroundColor={colors.border}
                    {...({ activeThumbColor: '#FFFFFF' } as object)}
                  />
                </View>

                <View style={[styles.switchRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>Anti-Spam External Link Filter</Text>
                    <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                      Blocks unknown external domains while allowing study.io / academic links.
                    </Text>
                  </View>
                  <Switch
                    value={blockExternalLinks}
                    disabled={!canManageChannels}
                    onValueChange={setBlockExternalLinks}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#FFFFFF"
                    ios_backgroundColor={colors.border}
                    {...({ activeThumbColor: '#FFFFFF' } as object)}
                  />
                </View>

                {canManageChannels && (
                  <Button title="Save Access & Lock Settings" onPress={handleSaveChannelChanges} />
                )}
              </>
            )}

            {activeTab === 'edit' && channel && (
              <>
                <View>
                  <Text style={[styles.secLbl, { color: colors.textSecondary }]}>CHANNEL NAME</Text>
                  <TextInput
                    value={draftName}
                    editable={canManageChannels}
                    onChangeText={setDraftName}
                    placeholder="physics-doubts"
                    placeholderTextColor={colors.textSecondary}
                    style={[styles.input, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border }]}
                  />
                </View>
                <View>
                  <Text style={[styles.secLbl, { color: colors.textSecondary }]}>TOPIC / HEADER DESCRIPTION</Text>
                  <TextInput
                    value={draftTopic}
                    editable={canManageChannels}
                    onChangeText={setDraftTopic}
                    multiline
                    style={[
                      styles.input,
                      { minHeight: 62, textAlignVertical: 'top', color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
                    ]}
                  />
                </View>
                <View>
                  <Text style={[styles.secLbl, { color: colors.textSecondary }]}>SIDEBAR CATEGORY GROUP</Text>
                  <View style={styles.chipWrap}>
                    {(['Information', 'Academic Feeds', 'Study Channels'] as ChannelCategoryType[]).map((cat) => {
                      const active = draftCategory === cat;
                      return (
                        <TouchableOpacity
                          key={cat}
                          disabled={!canManageChannels}
                          onPress={() => setDraftCategory(cat)}
                          style={[
                            styles.chip,
                            {
                              backgroundColor: active ? colors.primary : colors.surface,
                              borderColor: active ? colors.primary : colors.border,
                            },
                          ]}
                        >
                          <Text style={{ fontSize: 11.5, fontWeight: '700', color: active ? '#FFFFFF' : colors.textSecondary }}>
                            {cat}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
                {canManageChannels && (
                  <Button title="Save Channel Details" onPress={handleSaveChannelChanges} />
                )}
              </>
            )}

            {activeTab === 'roles' && (
              <>
                <Text style={[styles.secLbl, { color: colors.textSecondary }]}>SELECT ROLE TO INSPECT / EDIT</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                  {club.roles.map((r) => {
                    const active = activeRole?.id === r.id;
                    return (
                      <TouchableOpacity
                        key={r.id}
                        onPress={() => setSelectedRoleId(r.id)}
                        style={[
                          styles.rolePill,
                          {
                            backgroundColor: active ? r.color : colors.surface,
                            borderColor: active ? r.color : colors.border,
                          },
                        ]}
                      >
                        <View style={[styles.dot, { backgroundColor: active ? '#FFFFFF' : r.color }]} />
                        <Text style={{ fontSize: 12, fontWeight: '700', color: active ? '#FFFFFF' : colors.text }}>
                          {r.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {activeRole && (
                  <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <Text style={{ fontSize: 13.5, fontWeight: '800', color: activeRole.color }}>
                        {activeRole.name} Permissions
                      </Text>
                      <Badge label={`Priority ${activeRole.priority}`} variant="neutral" size="sm" />
                    </View>
                    {PERM_LABELS.map(({ key, label }) => (
                      <View
                        key={key}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingVertical: 6,
                          borderTopWidth: StyleSheet.hairlineWidth,
                          borderTopColor: colors.borderSubtle,
                        }}
                      >
                        <Text style={{ fontSize: 12, color: colors.text, flex: 1, paddingRight: 8 }}>{label}</Text>
                        <Switch
                          value={Boolean(activeRole.permissions[key])}
                          disabled={!canManageRoles}
                          onValueChange={(val) => handleToggleRolePerm(key, val)}
                          trackColor={{ false: colors.border, true: activeRole.color || colors.primary }}
                          thumbColor="#FFFFFF"
                          ios_backgroundColor={colors.border}
                          {...({ activeThumbColor: '#FFFFFF' } as object)}
                        />
                      </View>
                    ))}
                  </View>
                )}

                {canManageRoles && (
                  <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.secLbl, { color: colors.textSecondary }]}>CREATE CUSTOM COHORT ROLE</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TextInput
                        value={newRoleName}
                        onChangeText={setNewRoleName}
                        placeholder="e.g. Lab Coordinator or Batch Topper"
                        placeholderTextColor={colors.textSecondary}
                        style={[
                          styles.input,
                          { flex: 1, color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
                        ]}
                      />
                      <Button title="Add" size="sm" onPress={handleCreateCustomRole} icon={<Plus size={14} color="#FFF" />} />
                    </View>
                    <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                      {ROLE_COLOR_SWATCHES.map((hex) => (
                        <TouchableOpacity
                          key={hex}
                          onPress={() => setNewRoleColor(hex)}
                          style={[
                            styles.swatch,
                            { backgroundColor: hex, borderColor: newRoleColor === hex ? '#FFFFFF' : 'transparent' },
                          ]}
                        />
                      ))}
                    </View>
                    <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                      {ROLE_ICON_OPTIONS.map((opt) => (
                        <TouchableOpacity
                          key={opt.id}
                          onPress={() => setNewRoleIcon(opt.id)}
                          style={[
                            styles.chip,
                            {
                              backgroundColor: newRoleIcon === opt.id ? colors.primary : colors.card,
                              borderColor: newRoleIcon === opt.id ? colors.primary : colors.border,
                            },
                          ]}
                        >
                          <Text style={{ fontSize: 10.5, fontWeight: '700', color: newRoleIcon === opt.id ? '#FFF' : colors.textSecondary }}>
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* Member Role Assignments */}
                <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.secLbl, { color: colors.textSecondary }]}>
                    ASSIGN ROLES TO MEMBERS ({club.members.length})
                  </Text>
                  {club.members.map((m) => (
                    <View
                      key={m.userId}
                      style={{
                        paddingVertical: 8,
                        borderTopWidth: StyleSheet.hairlineWidth,
                        borderTopColor: colors.borderSubtle,
                        gap: 6,
                      }}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 12.5, fontWeight: '700', color: colors.text }}>
                          {m.name} ({m.ioId})
                        </Text>
                        <Text style={{ fontSize: 11, color: colors.textSecondary }}>{m.staffLabel}</Text>
                      </View>
                      <View style={styles.chipWrap}>
                        {club.roles
                          .filter((r) => !r.isDefault)
                          .map((r) => {
                            const hasRole = m.roleIds.includes(r.id);
                            return (
                              <TouchableOpacity
                                key={`${m.userId}_${r.id}`}
                                disabled={!canManageRoles}
                                onPress={() => onToggleMemberRole(m.userId, r.id)}
                                style={[
                                  styles.miniRoleChip,
                                  {
                                    backgroundColor: hasRole ? r.color : colors.card,
                                    borderColor: hasRole ? r.color : colors.border,
                                  },
                                ]}
                              >
                                <Text style={{ fontSize: 10, fontWeight: '700', color: hasRole ? '#FFFFFF' : colors.textSecondary }}>
                                  {r.name}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}

            {activeTab === 'delete' && channel && (
              <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.error }]}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: colors.error }}>
                  Delete #{channel.name}
                </Text>
                {channel.isSystem ? (
                  <Text style={{ fontSize: 12.5, color: colors.textSecondary, marginTop: 6, lineHeight: 18 }}>
                    System foundation channels (#rules and #announcements) are protected and cannot be deleted. You can edit their access locks in the Access & Lock tab.
                  </Text>
                ) : !canManageChannels ? (
                  <Text style={{ fontSize: 12.5, color: colors.textSecondary, marginTop: 6 }}>
                    Only Institute Owners, Principals, or Channel Managers can delete channels.
                  </Text>
                ) : (
                  <View style={{ gap: 10, marginTop: 8 }}>
                    <Text style={{ fontSize: 12.5, color: colors.textSecondary, lineHeight: 18 }}>
                      Deleting #{channel.name} permanently removes this channel and its posted messages from the local club workspace.
                    </Text>
                    {!confirmDelete ? (
                      <Button
                        title={`Prepare Deletion of #${channel.name}`}
                        variant="outline"
                        onPress={() => setConfirmDelete(true)}
                      />
                    ) : (
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <Button
                          title="Keep Channel"
                          variant="outline"
                          onPress={() => setConfirmDelete(false)}
                          style={{ flex: 1 }}
                        />
                        <Button
                          title="Confirm Delete"
                          onPress={() => {
                            onDeleteChannel(channel.id);
                            onClose();
                          }}
                          style={{ flex: 1, backgroundColor: colors.error }}
                        />
                      </View>
                    )}
                  </View>
                )}
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
    maxWidth: 620,
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
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  warnBox: { padding: 10, borderRadius: 10, borderWidth: 1 },
  infoCard: { padding: 12, borderRadius: 14, borderWidth: 1, gap: 4 },
  secLbl: { fontSize: 10, fontWeight: '800', letterSpacing: 0.6, marginBottom: 4 },
  copyBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
    borderWidth: 1,
  },
  accessCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 9,
    fontSize: 13,
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9, borderWidth: 1 },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  swatch: { width: 22, height: 22, borderRadius: 11, borderWidth: 2 },
  miniRoleChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 7, borderWidth: 1 },
});
