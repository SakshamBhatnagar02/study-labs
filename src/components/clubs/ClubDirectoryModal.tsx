import React, { useMemo, useState } from 'react';
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
import { useTheme } from '../../theme';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { EmptyResourceCard } from '../common/StateFeedbackCard';
import { filterDirectoryClubs } from '../../utils/clubsEngine';
import type { StudyClub } from '../../types';
import {
  CheckCircle2,
  Compass,
  Globe,
  Hash,
  KeyRound,
  Lock,
  Plus,
  Search,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react-native';

interface ClubDirectoryModalProps {
  visible: boolean;
  onClose: () => void;
  clubs: StudyClub[];
  joinedClubIds: string[];
  onPreviewClub: (club: StudyClub) => void;
  onOpenJoinedClub: (clubId: string) => void;
  onJoinByInviteCode: (code: string) => { ok: boolean; message: string; clubId?: string };
  onOpenCreateClub: () => void;
}

export const ClubDirectoryModal: React.FC<ClubDirectoryModalProps> = ({
  visible,
  onClose,
  clubs,
  joinedClubIds,
  onPreviewClub,
  onOpenJoinedClub,
  onJoinByInviteCode,
  onOpenCreateClub,
}) => {
  const { colors, mode } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const [query, setQuery] = useState('');
  const [accessFilter, setAccessFilter] = useState<'all' | 'public' | 'private' | 'joined'>('all');
  const [countryFilter, setCountryFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'members' | 'newest'>('members');
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [inviteFeedback, setInviteFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const filtered = useMemo(
    () =>
      filterDirectoryClubs(clubs, {
        query,
        access: accessFilter,
        country: countryFilter,
        sortBy,
        joinedIds: joinedClubIds,
      }),
    [clubs, query, accessFilter, countryFilter, sortBy, joinedClubIds]
  );

  const handleInviteSubmit = () => {
    const trimmed = inviteCodeInput.trim().toUpperCase();
    if (!trimmed) {
      setInviteFeedback({ ok: false, text: 'Enter an invite code (e.g. INST-VERT27 or CLUB-BIO42).' });
      return;
    }
    const res = onJoinByInviteCode(trimmed);
    setInviteFeedback({ ok: res.ok, text: res.message });
    if (res.ok) setInviteCodeInput('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.sheet,
            {
              width: Math.min(windowWidth, 640),
              maxWidth: '100%',
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 0, paddingRight: 8 }}>
              <View style={[styles.hdrIcon, { backgroundColor: mode === 'dark' ? '#431407' : '#FFEDD5' }]}>
                <Compass size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                  Explore Institutes & Study Clubs
                </Text>
                <Text style={[styles.sub, { color: colors.textSecondary }]} numberOfLines={2}>
                  Adapted Club Directory · Search cohorts, preview channels & join via invite code
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={{ flexShrink: 0, padding: 4 }} accessibilityLabel="Close clubs directory">
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={{ gap: 12, paddingVertical: 14 }}>
            {/* Direct Invite Code Join Box */}
            <View style={[styles.inviteBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <KeyRound size={14} color={colors.primary} />
                <Text style={{ fontSize: 12, fontWeight: '800', color: colors.text }}>
                  Join via Institute / Club Invite Code
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TextInput
                  value={inviteCodeInput}
                  onChangeText={setInviteCodeInput}
                  autoCapitalize="characters"
                  placeholder="e.g. CLUB-BIO42 or INST-VERT27"
                  placeholderTextColor={colors.textSecondary}
                  style={[
                    styles.input,
                    { flex: 1, color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
                  ]}
                />
                <Button title="Join Code" size="sm" onPress={handleInviteSubmit} />
              </View>
              {inviteFeedback && (
                <Text style={{ fontSize: 11.5, fontWeight: '700', color: inviteFeedback.ok ? colors.success : colors.error }}>
                  {inviteFeedback.text}
                </Text>
              )}
            </View>

            {/* Directory Search & Filter Bar */}
            <View style={[styles.searchRow, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
              <Search size={15} color={colors.textSecondary} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search JEE/NEET, AP Calculus, tags, or club names..."
                placeholderTextColor={colors.textSecondary}
                style={[styles.searchInput, { color: colors.text }]}
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')}>
                  <X size={14} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.filtersGroup}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                {(
                  [
                    { id: 'all', label: 'All Clubs' },
                    { id: 'joined', label: `Joined (${joinedClubIds.length})` },
                    { id: 'public', label: 'Public Discovery' },
                    { id: 'private', label: 'Private Institutes' },
                  ] as const
                ).map((f) => {
                  const active = accessFilter === f.id;
                  return (
                    <TouchableOpacity
                      key={f.id}
                      onPress={() => setAccessFilter(f.id)}
                      style={[
                        styles.filterChip,
                        {
                          backgroundColor: active ? colors.primary : colors.surface,
                          borderColor: active ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 11.5, fontWeight: '700', color: active ? '#FFFFFF' : colors.textSecondary }}>
                        {f.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {(['ALL', 'IN', 'GLOBAL'] as const).map((cnt) => {
                    const active = countryFilter === cnt;
                    return (
                      <TouchableOpacity
                        key={cnt}
                        onPress={() => setCountryFilter(cnt)}
                        style={[
                          styles.miniChip,
                          {
                            backgroundColor: active ? colors.secondary : colors.surface,
                            borderColor: active ? colors.secondary : colors.border,
                          },
                        ]}
                      >
                        <Text style={{ fontSize: 10.5, fontWeight: '700', color: active ? '#FFFFFF' : colors.textSecondary }}>
                          {cnt === 'ALL' ? 'All Regions' : cnt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity
                  onPress={() => setSortBy((s) => (s === 'members' ? 'newest' : 'members'))}
                  style={[styles.miniChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <Text style={{ fontSize: 10.5, fontWeight: '700', color: colors.primary }}>
                    Sort: {sortBy === 'members' ? 'Most Active' : 'Newest'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Directory Grid */}
            {filtered.length === 0 ? (
              <EmptyResourceCard
                title="No Matching Clubs Found"
                message="Try clearing filters or create your own Institute or Peer Study Club."
                actionLabel="Reset Filters"
                onAction={() => {
                  setQuery('');
                  setAccessFilter('all');
                  setCountryFilter('ALL');
                }}
              />
            ) : (
              filtered.map((club) => {
                const isJoined = joinedClubIds.includes(club.id);
                return (
                  <Pressable
                    key={club.id}
                    focusable={false}
                    onPress={() => (isJoined ? onOpenJoinedClub(club.id) : onPreviewClub(club))}
                    style={({ pressed }) => [
                      styles.clubCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: isJoined ? colors.primary : colors.border,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}
                  >
                    <View style={[styles.bannerStrip, { backgroundColor: club.bannerColor }]}>
                      <View style={styles.bannerOverlayRow}>
                        <Badge
                          label={club.kind === 'institute' ? 'INSTITUTE' : 'STUDY CLUB'}
                          variant="neutral"
                          size="sm"
                        />
                        {club.isVerified && (
                          <View style={styles.verifiedTag}>
                            <ShieldCheck size={11} color="#FFFFFF" />
                            <Text style={{ fontSize: 10, fontWeight: '800', color: '#FFFFFF' }}>VERIFIED</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <View style={styles.cardBody}>
                      <View style={styles.cardTopRow}>
                        <View style={[styles.clubIcon, { backgroundColor: club.iconColor }]}>
                          <Text style={styles.clubIconLetter}>{club.name.charAt(0).toUpperCase()}</Text>
                        </View>
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={[styles.clubName, { color: colors.text }]} numberOfLines={1}>
                              {club.name}
                            </Text>
                            {club.isPrivate ? (
                              <Lock size={12} color={colors.warning} />
                            ) : (
                              <Globe size={12} color={colors.success} />
                            )}
                          </View>
                          <Text style={{ fontSize: 11, color: colors.primary, fontWeight: '700' }}>
                            {club.category} · Code {club.inviteCode}
                          </Text>
                        </View>
                        {isJoined ? (
                          <Badge label="JOINED" variant="success" size="sm" />
                        ) : (
                          <Badge label={club.isPrivate ? 'PRIVATE' : 'OPEN'} variant="primary" size="sm" />
                        )}
                      </View>

                      <Text style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 17 }} numberOfLines={2}>
                        {club.description}
                      </Text>

                      <View style={styles.tagRow}>
                        {club.tags.slice(0, 4).map((t) => (
                          <View
                            key={t}
                            style={[styles.tagChip, { backgroundColor: colors.card, borderColor: colors.borderSubtle }]}
                          >
                            <Text style={{ fontSize: 10, fontWeight: '700', color: colors.textSecondary }}>
                              {t}
                            </Text>
                          </View>
                        ))}
                      </View>

                      <View style={styles.cardFooter}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                          <View style={styles.metaStat}>
                            <Users size={12} color={colors.textSecondary} />
                            <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textSecondary }}>
                              {club.members.length} members
                            </Text>
                          </View>
                          <View style={styles.metaStat}>
                            <Hash size={12} color={colors.textSecondary} />
                            <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textSecondary }}>
                              {club.channels.length} channels
                            </Text>
                          </View>
                        </View>

                        {isJoined ? (
                          <TouchableOpacity
                            onPress={() => onOpenJoinedClub(club.id)}
                            style={[styles.openBtn, { backgroundColor: colors.primary }]}
                          >
                            <CheckCircle2 size={12} color="#FFFFFF" />
                            <Text style={{ fontSize: 11.5, fontWeight: '800', color: '#FFFFFF' }}>Open Workspace</Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            onPress={() => onPreviewClub(club)}
                            style={[styles.openBtn, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.primary }]}
                          >
                            <Text style={{ fontSize: 11.5, fontWeight: '800', color: colors.primary }}>Preview & Join</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </Pressable>
                );
              })
            )}
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <Button
              title="Create Institute / Club"
              variant="primary"
              onPress={() => {
                onClose();
                onOpenCreateClub();
              }}
              icon={<Plus size={15} color="#FFFFFF" />}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.68)', justifyContent: 'flex-end', alignItems: 'center' },
  sheet: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    overflow: 'hidden',
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  hdrIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 15.5, fontWeight: '800' },
  sub: { fontSize: 11, marginTop: 1 },
  body: { paddingHorizontal: 16 },
  inviteBox: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  input: {
    minWidth: 0,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: { flex: 1, fontSize: 13, paddingVertical: 0 },
  filtersGroup: { gap: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  miniChip: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
  clubCard: {
    borderRadius: 16,
    borderWidth: 1.25,
    overflow: 'hidden',
  },
  bannerStrip: { height: 48, paddingHorizontal: 12, justifyContent: 'center' },
  bannerOverlayRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  cardBody: { padding: 12, gap: 8 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  clubIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clubIconLetter: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  clubName: { fontSize: 14.5, fontWeight: '800', flexShrink: 1 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  tagChip: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7, borderWidth: 1 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  metaStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 9,
  },
  footer: { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1 },
});
