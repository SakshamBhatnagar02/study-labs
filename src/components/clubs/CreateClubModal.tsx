import React, { useState } from 'react';
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
import {
  CLUB_CATEGORY_OPTIONS,
  ROLE_COLOR_SWATCHES,
  createNewStudyClubObject,
} from '../../utils/clubsEngine';
import { PREFERRED_LANGUAGES } from '../../data/curriculumData';
import type {
  ClubCategoryTag,
  ClubKind,
  PreferredLanguage,
  StudyClub,
} from '../../types';
import { Globe, Lock, ShieldCheck, Users, X } from 'lucide-react-native';

interface CreateClubModalProps {
  visible: boolean;
  onClose: () => void;
  owner: { userId: string; name: string; ioId: string };
  onCreateClub: (club: StudyClub) => void;
}

export const CreateClubModal: React.FC<CreateClubModalProps> = ({
  visible,
  onClose,
  owner,
  onCreateClub,
}) => {
  const { colors, mode } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const [kind, setKind] = useState<ClubKind>('study_club');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ClubCategoryTag>(CLUB_CATEGORY_OPTIONS[0]);
  const [description, setDescription] = useState('');
  const [tagsCsv, setTagsCsv] = useState('Physics, Doubt Solving, Weekly Tests');
  const [primaryLanguage, setPrimaryLanguage] = useState<PreferredLanguage>('English');
  const [country, setCountry] = useState('IN');
  const [isPrivate, setIsPrivate] = useState(false);
  const [bannerColor, setBannerColor] = useState(ROLE_COLOR_SWATCHES[0]);
  const [iconColor, setIconColor] = useState(ROLE_COLOR_SWATCHES[2]);
  const [aboutAdmin, setAboutAdmin] = useState('');
  const [rulesText, setRulesText] = useState(
    'Show your step-by-step working before asking for answers.\nNo external spam links or promotions.'
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = () => {
    const cleanName = name.trim();
    if (cleanName.length < 3) {
      setErrorMsg('Please enter a club or institute name (at least 3 characters).');
      return;
    }

    const parsedTags = tagsCsv
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const parsedRules = rulesText
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);

    const club = createNewStudyClubObject({
      name: cleanName,
      description:
        description.trim() ||
        'Collaborative Study Labs space for structured problem solving, resource sharing, and timed drills.',
      kind,
      category,
      tags: parsedTags.length > 0 ? parsedTags : ['Study Labs', 'STEM'],
      primaryLanguage,
      country,
      isPrivate,
      aboutAdmin: aboutAdmin.trim() || `${owner.name} — Organizer`,
      rules: parsedRules,
      bannerColor,
      iconColor,
      owner,
    });

    setErrorMsg(null);
    setName('');
    setDescription('');
    onCreateClub(club);
    onClose();
  };

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
                <Users size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                  Create Study Club or Institute
                </Text>
                <Text style={[styles.sub, { color: colors.textSecondary }]} numberOfLines={2}>
                  Launch custom roles, categorized channels, polls & assignment workflows
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={{ flexShrink: 0, padding: 4 }} accessibilityLabel="Close create club modal">
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={{ gap: 14, paddingVertical: 14 }}>
            {/* Live Preview Card */}
            <View style={[styles.previewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.previewBanner, { backgroundColor: bannerColor }]}>
                <Badge
                  label={kind === 'institute' ? 'INSTITUTE PLATFORM' : 'PEER STUDY CLUB'}
                  variant="neutral"
                  size="sm"
                />
                <Badge
                  label={isPrivate ? 'Private · Invite Only' : 'Public Discovery'}
                  variant={isPrivate ? 'warning' : 'success'}
                  size="sm"
                />
              </View>
              <View style={styles.previewBody}>
                <View style={[styles.previewAvatar, { backgroundColor: iconColor, borderColor: colors.surface }]}>
                  <Text style={styles.previewAvatarLetter}>
                    {(name.trim() || 'S').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }} numberOfLines={1}>
                      {name.trim() || 'Your Study Club Name'}
                    </Text>
                    {kind === 'institute' && <ShieldCheck size={14} color={colors.primary} />}
                  </View>
                  <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                    {category} · {primaryLanguage} · {country}
                  </Text>
                </View>
              </View>
            </View>

            {/* Kind Toggle */}
            <View>
              <Text style={[styles.label, { color: colors.textSecondary }]}>WORKSPACE TYPE</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {(
                  [
                    { id: 'study_club', title: 'Peer Study Club', desc: 'Group doubts, shared notes & polls' },
                    { id: 'institute', title: 'Teacher / Institute', desc: 'Batch attendance, assignments & faculty channels' },
                  ] as const
                ).map((item) => {
                  const active = kind === item.id;
                  return (
                    <Pressable
                      key={item.id}
                      focusable={false}
                      onPress={() => setKind(item.id)}
                      style={[
                        styles.kindCard,
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
                      <Text style={{ fontSize: 13, fontWeight: '800', color: active ? colors.primary : colors.text }}>
                        {item.title}
                      </Text>
                      <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>
                        {item.desc}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Club Name & Description */}
            <View>
              <Text style={[styles.label, { color: colors.textSecondary }]}>CLUB / INSTITUTE NAME</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={kind === 'institute' ? 'e.g. Apex Physics Academy Batch B2' : 'e.g. Calculus & Olympiad Night Circle'}
                placeholderTextColor={colors.textSecondary}
                style={[styles.input, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border }]}
              />
            </View>

            <View>
              <Text style={[styles.label, { color: colors.textSecondary }]}>CATEGORY</Text>
              <View style={styles.chipWrap}>
                {CLUB_CATEGORY_OPTIONS.map((cat) => {
                  const active = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setCategory(cat)}
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

            <View>
              <Text style={[styles.label, { color: colors.textSecondary }]}>DESCRIPTION & LEARNING FOCUS</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                multiline
                placeholder="Describe syllabus goals, test cadence, and collaboration rules..."
                placeholderTextColor={colors.textSecondary}
                style={[
                  styles.input,
                  { minHeight: 68, textAlignVertical: 'top', color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
                ]}
              />
            </View>

            {/* Primary Language & Country */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>PRIMARY LANGUAGE</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                  {PREFERRED_LANGUAGES.map((lang) => {
                    const active = primaryLanguage === lang;
                    return (
                      <TouchableOpacity
                        key={lang}
                        onPress={() => setPrimaryLanguage(lang)}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: active ? colors.secondary : colors.surface,
                            borderColor: active ? colors.secondary : colors.border,
                          },
                        ]}
                      >
                        <Text style={{ fontSize: 11, fontWeight: '700', color: active ? '#FFFFFF' : colors.textSecondary }}>
                          {lang}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>REGION CODE</Text>
                <View style={styles.chipWrap}>
                  {['IN', 'US', 'GB', 'SG', 'GLOBAL'].map((reg) => {
                    const active = country === reg;
                    return (
                      <TouchableOpacity
                        key={reg}
                        onPress={() => setCountry(reg)}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: active ? colors.primary : colors.surface,
                            borderColor: active ? colors.primary : colors.border,
                          },
                        ]}
                      >
                        <Text style={{ fontSize: 11, fontWeight: '700', color: active ? '#FFFFFF' : colors.textSecondary }}>
                          {reg}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* Tags & Banner/Icon Swatches */}
            <View>
              <Text style={[styles.label, { color: colors.textSecondary }]}>DISCOVERY TAGS (COMMA SEPARATED)</Text>
              <TextInput
                value={tagsCsv}
                onChangeText={setTagsCsv}
                placeholder="Physics, AP Calculus, JEE 2027"
                placeholderTextColor={colors.textSecondary}
                style={[styles.input, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border }]}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 14, flexWrap: 'wrap' }}>
              <View style={{ flex: 1, minWidth: 160 }}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>BANNER ACCENT</Text>
                <View style={{ flexDirection: 'row', gap: 7, flexWrap: 'wrap' }}>
                  {ROLE_COLOR_SWATCHES.map((hex) => (
                    <TouchableOpacity
                      key={`ban_${hex}`}
                      onPress={() => setBannerColor(hex)}
                      style={[
                        styles.swatch,
                        { backgroundColor: hex, borderColor: bannerColor === hex ? '#FFFFFF' : 'transparent' },
                      ]}
                    />
                  ))}
                </View>
              </View>

              <View style={{ flex: 1, minWidth: 160 }}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>AVATAR ICON COLOR</Text>
                <View style={{ flexDirection: 'row', gap: 7, flexWrap: 'wrap' }}>
                  {ROLE_COLOR_SWATCHES.map((hex) => (
                    <TouchableOpacity
                      key={`ico_${hex}`}
                      onPress={() => setIconColor(hex)}
                      style={[
                        styles.swatch,
                        { backgroundColor: hex, borderColor: iconColor === hex ? '#FFFFFF' : 'transparent' },
                      ]}
                    />
                  ))}
                </View>
              </View>
            </View>

            {/* Privacy Toggle */}
            <View style={[styles.switchRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                {isPrivate ? <Lock size={16} color={colors.warning} /> : <Globe size={16} color={colors.success} />}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>
                    {isPrivate ? 'Private Cohort (Approval Required)' : 'Public Discovery Club'}
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                    {isPrivate
                      ? 'Learners preview info and submit join request or enter invite code.'
                      : 'Listed publicly in Study Clubs directory for instant membership.'}
                  </Text>
                </View>
              </View>
              <Switch
                value={isPrivate}
                onValueChange={setIsPrivate}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={colors.border}
                {...({ activeThumbColor: '#FFFFFF' } as object)}
              />
            </View>

            <View>
              <Text style={[styles.label, { color: colors.textSecondary }]}>ADMIN / FACULTY BIO</Text>
              <TextInput
                value={aboutAdmin}
                onChangeText={setAboutAdmin}
                placeholder="Share your credentials or cohort goals..."
                placeholderTextColor={colors.textSecondary}
                style={[styles.input, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border }]}
              />
            </View>

            <View>
              <Text style={[styles.label, { color: colors.textSecondary }]}>CLUB GUIDELINES (ONE PER LINE)</Text>
              <TextInput
                value={rulesText}
                onChangeText={setRulesText}
                multiline
                style={[
                  styles.input,
                  { minHeight: 62, textAlignVertical: 'top', color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
                ]}
              />
            </View>

            {errorMsg && (
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.error }}>{errorMsg}</Text>
            )}
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <Button title="Cancel" variant="outline" onPress={onClose} style={{ flex: 1 }} />
            <Button title="Create Workspace" onPress={handleSubmit} style={{ flex: 1.5 }} />
          </View>
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
    maxHeight: '92%',
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
  title: { fontSize: 16, fontWeight: '800' },
  sub: { fontSize: 11.5, marginTop: 1 },
  body: { paddingHorizontal: 16 },
  previewCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  previewBanner: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  previewBody: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  previewAvatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewAvatarLetter: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  label: { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.5, marginBottom: 6 },
  kindCard: {
    flex: 1,
    padding: 11,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  input: {
    minWidth: 0,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 9,
    fontSize: 13,
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9, borderWidth: 1 },
  swatch: { width: 26, height: 26, borderRadius: 13, borderWidth: 2.5 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
});

