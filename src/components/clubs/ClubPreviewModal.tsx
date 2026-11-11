import React, { useState } from 'react';
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
import type { StudyClub } from '../../types';
import { Globe, Hash, Lock, ShieldCheck, Users, X } from 'lucide-react-native';

interface ClubPreviewModalProps {
  club: StudyClub | null;
  visible: boolean;
  onClose: () => void;
  isJoined: boolean;
  onJoinPublic: (clubId: string) => void;
  onRequestPrivateJoin: (clubId: string, note: string) => void;
  onOpenClub: (clubId: string) => void;
}

export const ClubPreviewModal: React.FC<ClubPreviewModalProps> = ({
  club,
  visible,
  onClose,
  isJoined,
  onJoinPublic,
  onRequestPrivateJoin,
  onOpenClub,
}) => {
  const { colors } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const [introNote, setIntroNote] = useState('');
  const [requested, setRequested] = useState(false);

  if (!club) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.overlay, { alignItems: 'center' }]}>
        <View
          style={[
            styles.card,
            {
              width: Math.min(windowWidth - 24, 500),
              maxWidth: '100%',
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={[styles.banner, { backgroundColor: club.bannerColor }]}>
            <TouchableOpacity onPress={onClose} style={styles.closeFloat}>
              <X size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={{ gap: 12, paddingBottom: 16 }}>
            <View style={styles.avatarAnchorRow}>
              <View style={[styles.clubAvatar, { backgroundColor: club.iconColor, borderColor: colors.card }]}>
                <Text style={styles.avatarLetter}>{club.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <Text style={[styles.clubName, { color: colors.text }]}>{club.name}</Text>
                  {club.isVerified && <ShieldCheck size={16} color={colors.primary} />}
                </View>
                <Text style={{ fontSize: 11.5, color: colors.textSecondary, marginTop: 2 }}>
                  {club.category} · {club.primaryLanguage} · {club.country}
                </Text>
              </View>
            </View>

            <View style={styles.kpiRow}>
              <View style={[styles.kpiBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Users size={14} color={colors.primary} />
                <Text style={[styles.kpiVal, { color: colors.text }]}>{club.members.length}</Text>
                <Text style={[styles.kpiLbl, { color: colors.textSecondary }]}>Members</Text>
              </View>
              <View style={[styles.kpiBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Hash size={14} color={colors.cyan} />
                <Text style={[styles.kpiVal, { color: colors.text }]}>{club.channels.length}</Text>
                <Text style={[styles.kpiLbl, { color: colors.textSecondary }]}>Channels</Text>
              </View>
              <View style={[styles.kpiBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {club.isPrivate ? <Lock size={14} color={colors.warning} /> : <Globe size={14} color={colors.success} />}
                <Text style={[styles.kpiVal, { color: colors.text }]}>
                  {club.isPrivate ? 'Private' : 'Public'}
                </Text>
                <Text style={[styles.kpiLbl, { color: colors.textSecondary }]}>Access</Text>
              </View>
            </View>

            <Text style={{ fontSize: 13, color: colors.text, lineHeight: 19 }}>
              {club.description}
            </Text>

            <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.secHeading, { color: colors.textSecondary }]}>ADMIN & FACULTY BIO</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>{club.ownerName}</Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2, lineHeight: 17 }}>
                {club.aboutAdmin}
              </Text>
            </View>

            <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.secHeading, { color: colors.textSecondary }]}>CLUB GUIDELINES & RULES</Text>
              {club.rules.map((r, idx) => (
                <Text key={idx} style={{ fontSize: 12, color: colors.text, lineHeight: 17 }}>
                  {idx + 1}. {r}
                </Text>
              ))}
            </View>

            <View style={styles.tagWrap}>
              {club.tags.map((t) => (
                <Badge key={t} label={`#${t}`} variant="neutral" size="sm" />
              ))}
            </View>

            {!isJoined && club.isPrivate && (
              <View style={{ gap: 6 }}>
                <Text style={{ fontSize: 11.5, fontWeight: '700', color: colors.textSecondary }}>
                  Introduction Message for {club.ownerName}
                </Text>
                <TextInput
                  value={introNote}
                  onChangeText={setIntroNote}
                  placeholder="Share your grade, batch, or study goals..."
                  placeholderTextColor={colors.textSecondary}
                  style={[
                    styles.input,
                    { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
                  ]}
                />
              </View>
            )}
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <Button title="Close" variant="outline" onPress={onClose} style={{ flex: 1 }} />
            {isJoined ? (
              <Button
                title="Open Club Chat"
                onPress={() => {
                  onOpenClub(club.id);
                  onClose();
                }}
                style={{ flex: 1.5 }}
              />
            ) : club.isPrivate ? (
              <Button
                title={requested ? 'Request Sent' : 'Request Membership'}
                disabled={requested}
                onPress={() => {
                  onRequestPrivateJoin(
                    club.id,
                    introNote.trim() || 'Interested in joining this cohort on Study Labs.'
                  );
                  setRequested(true);
                }}
                style={{ flex: 1.6 }}
              />
            ) : (
              <Button
                title="Join Public Club Now"
                onPress={() => {
                  onJoinPublic(club.id);
                  onClose();
                }}
                style={{ flex: 1.6 }}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.68)', justifyContent: 'center', padding: 16 },
  card: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    alignSelf: 'center',
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
  },
  banner: { height: 76, justifyContent: 'flex-start', alignItems: 'flex-end', padding: 12 },
  closeFloat: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { paddingHorizontal: 16 },
  avatarAnchorRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  clubAvatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
  clubName: { fontSize: 17, fontWeight: '800' },
  kpiRow: { flexDirection: 'row', gap: 8 },
  kpiBox: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 3,
  },
  kpiVal: { fontSize: 14, fontWeight: '800' },
  kpiLbl: { fontSize: 10.5 },
  sectionCard: { padding: 12, borderRadius: 12, borderWidth: 1, gap: 4 },
  secHeading: { fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 8,
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
});

