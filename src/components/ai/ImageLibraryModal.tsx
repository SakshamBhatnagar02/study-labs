import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useTheme } from '../../theme';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { EmptyResourceCard, copyTextSafely } from '../common/StateFeedbackCard';
import {
  PLAN_CONFIGS,
  computeStorageQuotaUsage,
  formatByteSize,
  rebuildEditableSvgItem,
} from '../../utils/aiImageLibrary';
import { base64ToUint8Array } from '../../utils/attachmentParser';
import type {
  GeneratedStemImage,
  StemVisualAnnotation,
  StemVisualBgTheme,
  StemVisualSubject,
  UserPlanTier,
} from '../../types';
import {
  ArrowLeft,
  Check,
  Crown,
  Download,
  Edit3,
  Eye,
  EyeOff,
  FlipHorizontal,
  Grid,
  Image as ImageIcon,
  Plus,
  RotateCw,
  Search,
  Share2,
  Trash2,
  X,
} from 'lucide-react-native';

interface StemVisualPreviewProps {
  item: GeneratedStemImage;
  height?: number;
}

export const StemVisualPreview: React.FC<StemVisualPreviewProps> = ({
  item,
  height = 175,
}) => {
  const { colors } = useTheme();
  const frameBg =
    item.bgTheme === 'light'
      ? '#F8FAFC'
      : item.bgTheme === 'blueprint'
      ? '#08203E'
      : '#090E1A';

  const rot = item.format === 'png' ? item.rotationDeg || 0 : 0;
  const flip = item.format === 'png' && item.flipX ? -1 : 1;

  const webSvgSrc = useMemo(() => {
    if (Platform.OS !== 'web' || item.format !== 'svg' || !item.svgMarkup) {
      return item.dataUri;
    }
    try {
      const utf8Bytes = encodeURIComponent(item.svgMarkup).replace(
        /%([0-9A-F]{2})/g,
        (_, hex: string) => String.fromCharCode(parseInt(hex, 16))
      );
      if (typeof btoa === 'function') {
        return `data:image/svg+xml;base64,${btoa(utf8Bytes)}`;
      }
    } catch {
      // Fallback below to percent-encoded UTF-8 SVG URI
    }
    const safeEncoded = encodeURIComponent(item.svgMarkup).replace(
      /[!'()*]/g,
      (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
    );
    return `data:image/svg+xml;charset=utf-8,${safeEncoded}`;
  }, [item.dataUri, item.format, item.svgMarkup]);

  return (
    <View
      testID="stem-visual-frame"
      style={[
        styles.visualFrame,
        {
          height,
          backgroundColor: frameBg,
          borderColor: colors.border,
        },
      ]}
    >
      {item.format === 'svg' && item.svgMarkup ? (
        Platform.OS === 'web' ? (
          React.createElement('img', {
            src: webSvgSrc,
            alt: item.title || 'Generated STEM Diagram',
            style: {
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
            },
          })
        ) : (
          <SvgXml xml={item.svgMarkup} width="100%" height="100%" />
        )
      ) : (
        <Image
          source={{ uri: item.dataUri }}
          resizeMode="contain"
          style={[
            styles.visualMedia,
            (rot !== 0 || flip !== 1) && {
              transform: [{ rotate: `${rot}deg` }, { scaleX: flip }],
            },
          ]}
        />
      )}
    </View>
  );
};

interface ImageLibraryModalProps {
  visible: boolean;
  images: GeneratedStemImage[];
  planTier: UserPlanTier;
  initialEditImageId?: string | null;
  onClose: () => void;
  onUpdateImage: (updated: GeneratedStemImage) => Promise<void> | void;
  onDeleteImage: (imageId: string) => Promise<void> | void;
  onInsertToPrompt?: (prompt: string) => void;
}

const SUBJECT_FILTERS: Array<{ id: 'all' | StemVisualSubject; label: string }> = [
  { id: 'all', label: 'All Visuals' },
  { id: 'math', label: 'Math Graphs' },
  { id: 'physics', label: 'Physics Diagrams' },
  { id: 'chemistry', label: 'Chemistry' },
];

const ANNOTATION_POSITIONS = [
  { id: 'tl', label: 'Top Left', xPct: 16, yPct: 26 },
  { id: 'mid', label: 'Center', xPct: 48, yPct: 52 },
  { id: 'br', label: 'Bottom Right', xPct: 68, yPct: 78 },
];

export const ImageLibraryModal: React.FC<ImageLibraryModalProps> = ({
  visible,
  images,
  planTier,
  initialEditImageId = null,
  onClose,
  onUpdateImage,
  onDeleteImage,
}) => {
  const { colors, mode } = useTheme();
  const [subjectFilter, setSubjectFilter] = useState<'all' | StemVisualSubject>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPlansSheet, setShowPlansSheet] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Editor state
  const [editingDraft, setEditingDraft] = useState<GeneratedStemImage | null>(null);
  const [newAnnotationText, setNewAnnotationText] = useState('');
  const [annotPosId, setAnnotPosId] = useState('tl');

  const quota = useMemo(() => computeStorageQuotaUsage(images, planTier), [images, planTier]);

  useEffect(() => {
    if (!visible) {
      setEditingDraft(null);
      setShowPlansSheet(false);
      setStatusMessage(null);
      return;
    }
    if (initialEditImageId) {
      const target = images.find((img) => img.id === initialEditImageId);
      if (target) {
        setEditingDraft(target);
      }
    }
  }, [visible, initialEditImageId, images]);

  const filteredImages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return images.filter((img) => {
      if (subjectFilter !== 'all' && img.subjectCategory !== subjectFilter) return false;
      if (!q) return true;
      return (
        img.title.toLowerCase().includes(q) ||
        img.prompt.toLowerCase().includes(q) ||
        (img.caption || '').toLowerCase().includes(q)
      );
    });
  }, [images, subjectFilter, searchQuery]);

  const flashStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => {
      setStatusMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const sanitizeFilename = (raw: string, ext: string) => {
    const clean = (raw || 'study_labs_visual')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 40);
    return `${clean || 'study_labs_visual'}.${ext}`;
  };

  const handleDownloadVisual = async (item: GeneratedStemImage) => {
    const ext = item.format === 'svg' ? 'svg' : 'png';
    const filename = sanitizeFilename(item.title, ext);

    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      try {
        const a = document.createElement('a');
        if (item.format === 'svg' && item.svgMarkup) {
          const blob = new Blob([item.svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        } else {
          a.href = item.dataUri;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
        flashStatus(`Downloaded ${filename}`);
        return;
      } catch {
        flashStatus('Browser blocked direct download — try Share instead.');
        return;
      }
    }

    // Native Android / iOS export using Expo FileSystem
    try {
      const { File, Paths } = await import('expo-file-system');
      const file = new File(Paths.document, filename);
      if (file.exists) {
        file.delete();
      }
      file.create();
      if (item.format === 'svg' && item.svgMarkup) {
        await file.write(item.svgMarkup);
      } else {
        const bytes = base64ToUint8Array(item.dataUri);
        await file.write(bytes);
      }
      flashStatus(`Saved to app storage: ${filename}`);
    } catch {
      flashStatus('Could not save file locally. Use Share to export.');
    }
  };

  const handleShareVisual = async (item: GeneratedStemImage) => {
    const shareText = `${item.title}\n${item.caption || item.prompt}\n— Generated with Study Labs AI`;
    if (Platform.OS === 'web') {
      try {
        const nav: any = typeof navigator !== 'undefined' ? navigator : undefined;
        if (nav?.share) {
          await nav.share({ title: item.title, text: shareText });
          flashStatus('Shared visual summary.');
          return;
        }
      } catch {
        // Fallback to clipboard copy
      }
      const copied = await copyTextSafely(`${shareText}\n\n${item.dataUri}`);
      flashStatus(
        copied
          ? 'Share link & visual data copied to clipboard.'
          : 'Ready to copy from Download button.'
      );
      return;
    }

    try {
      const { File, Paths } = await import('expo-file-system');
      const ext = item.format === 'svg' ? 'svg' : 'png';
      const filename = sanitizeFilename(item.title, ext);
      const cacheFile = new File(Paths.cache, filename);
      if (cacheFile.exists) {
        cacheFile.delete();
      }
      cacheFile.create();
      if (item.format === 'svg' && item.svgMarkup) {
        await cacheFile.write(item.svgMarkup);
      } else {
        await cacheFile.write(base64ToUint8Array(item.dataUri));
      }
      await Share.share({
        title: item.title,
        message: shareText,
        url: cacheFile.uri,
      });
    } catch {
      try {
        await Share.share({ title: item.title, message: shareText });
      } catch {
        // User dismissed share sheet
      }
    }
  };

  const applyDraftMutation = (patch: Partial<GeneratedStemImage>) => {
    if (!editingDraft) return;
    const next: GeneratedStemImage = {
      ...editingDraft,
      ...patch,
      editedAt: new Date().toISOString(),
    };
    const rebuilt = next.format === 'svg' ? rebuildEditableSvgItem(next) : next;
    setEditingDraft(rebuilt);
  };

  const handleAddAnnotation = () => {
    if (!editingDraft || !newAnnotationText.trim()) return;
    const pos =
      ANNOTATION_POSITIONS.find((p) => p.id === annotPosId) || ANNOTATION_POSITIONS[0];
    const nextAnnot: StemVisualAnnotation = {
      id: `ann_${Date.now()}`,
      text: newAnnotationText.trim().slice(0, 32),
      xPct: pos.xPct,
      yPct: pos.yPct,
    };
    applyDraftMutation({
      annotations: [...(editingDraft.annotations || []), nextAnnot],
    });
    setNewAnnotationText('');
  };

  const quotaBarColor =
    quota.effectivePct >= 90
      ? colors.error
      : quota.effectivePct >= 70
      ? colors.warning
      : colors.primary;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, flex: 1, minWidth: 0 }}>
              <View style={[styles.headerIcon, { backgroundColor: colors.primaryLight }]}>
                <ImageIcon size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
                  {editingDraft ? 'Edit STEM Visual' : 'AI STEM Image Library'}
                </Text>
                <Text style={{ fontSize: 11, color: colors.textSecondary }} numberOfLines={1}>
                  {quota.plan.label} · {quota.imageCount}/{quota.maxImages} visuals ({quota.effectivePct}%)
                </Text>
              </View>
            </View>

            <TouchableOpacity
              accessibilityLabel="View storage plan tiers"
              onPress={() => setShowPlansSheet((s) => !s)}
              style={[
                styles.planBtn,
                {
                  backgroundColor: showPlansSheet ? colors.primary : colors.surface,
                  borderColor: showPlansSheet ? colors.primary : colors.border,
                },
              ]}
            >
              <Crown size={13} color={showPlansSheet ? '#FFFFFF' : colors.warning} />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '800',
                  color: showPlansSheet ? '#FFFFFF' : colors.text,
                }}
              >
                {quota.plan.label}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} hitSlop={8} accessibilityLabel="Close image library">
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Storage Quota Progress Strip */}
          <View
            style={[
              styles.quotaStrip,
              {
                backgroundColor: colors.surface,
                borderBottomColor: colors.borderSubtle,
              },
            ]}
          >
            <View style={styles.quotaLabelsRow}>
              <Text style={{ fontSize: 11.5, fontWeight: '700', color: colors.text }}>
                Allocated Storage: {formatByteSize(quota.usedBytes)} / {formatByteSize(quota.maxBytes)}
              </Text>
              <Text style={{ fontSize: 11, fontWeight: '700', color: quotaBarColor }}>
                {quota.remainingImages} slots left
              </Text>
            </View>
            <View style={[styles.quotaTrack, { backgroundColor: colors.borderSubtle }]}>
              <View
                style={[
                  styles.quotaFill,
                  {
                    width: `${Math.max(4, quota.effectivePct)}%`,
                    backgroundColor: quotaBarColor,
                  },
                ]}
              />
            </View>
          </View>

          {statusMessage && (
            <View
              style={[
                styles.statusToast,
                { backgroundColor: colors.successBg, borderColor: colors.success },
              ]}
            >
              <Check size={14} color={colors.success} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.success, flex: 1 }}>
                {statusMessage}
              </Text>
            </View>
          )}

          {/* Optional Storage Plan Comparison Drawer */}
          {showPlansSheet && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
              contentContainerStyle={styles.scrollContent}
            >
              <Text style={[styles.sectionHeading, { color: colors.text }]}>
                Allocated Storage Tiers
              </Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 10 }}>
                All Study Labs users start on the Free Plan (10 MB / 15 saved STEM visuals). Cloud upgrade tiers unlock in the next phase.
              </Text>
              {(['free', 'pro', 'ultra'] as UserPlanTier[]).map((tier) => {
                const cfg = PLAN_CONFIGS[tier];
                const isActive = planTier === tier;
                return (
                  <Card
                    key={tier}
                    style={[
                      styles.planCard,
                      {
                        borderColor: isActive ? colors.primary : colors.border,
                        backgroundColor: isActive
                          ? mode === 'dark'
                            ? '#1E293B'
                            : '#FFF7ED'
                          : colors.surface,
                      },
                    ]}
                  >
                    <View style={styles.planCardTop}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={{ fontSize: 14, fontWeight: '800', color: colors.text }}>
                          {cfg.label}
                        </Text>
                        {isActive && <Badge label="CURRENT PLAN" variant="primary" size="sm" />}
                      </View>
                      <Text style={{ fontSize: 12, fontWeight: '800', color: colors.primary }}>
                        {cfg.priceLabel}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginVertical: 4 }}>
                      {formatByteSize(cfg.maxStorageBytes)} · {cfg.maxImages} Visuals
                    </Text>
                    {cfg.features.map((feat) => (
                      <Text key={feat} style={{ fontSize: 11.5, color: colors.textSecondary }}>
                        • {feat}
                      </Text>
                    ))}
                  </Card>
                );
              })}
              <Button
                title="Back to Image Library"
                variant="outline"
                onPress={() => setShowPlansSheet(false)}
                style={{ marginTop: 8 }}
              />
            </ScrollView>
          )}

          {/* Mode A: Visual Editor */}
          {!showPlansSheet && editingDraft && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
              contentContainerStyle={styles.scrollContent}
            >
              <TouchableOpacity
                onPress={() => setEditingDraft(null)}
                style={styles.backToLibBtn}
              >
                <ArrowLeft size={15} color={colors.primary} />
                <Text style={{ fontSize: 12.5, fontWeight: '800', color: colors.primary }}>
                  Back to Library Grid
                </Text>
              </TouchableOpacity>

              <StemVisualPreview item={editingDraft} height={225} />

              <View style={styles.editMetaRow}>
                <Badge label={editingDraft.subjectCategory.toUpperCase()} variant="primary" size="sm" />
                <Badge label={editingDraft.format.toUpperCase()} variant="info" size="sm" />
                <Badge label={formatByteSize(editingDraft.byteSize)} variant="neutral" size="sm" />
              </View>

              {/* Title & Caption */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Visual Title</Text>
              <TextInput
                value={editingDraft.title}
                onChangeText={(txt) => applyDraftMutation({ title: txt })}
                placeholder="Enter diagram title..."
                placeholderTextColor={colors.textSecondary}
                style={[
                  styles.input,
                  { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
                ]}
              />

              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Study Caption</Text>
              <TextInput
                value={editingDraft.caption || ''}
                onChangeText={(txt) =>
                  setEditingDraft((prev) => (prev ? { ...prev, caption: txt } : prev))
                }
                placeholder="Key formula or observation for this visual..."
                placeholderTextColor={colors.textSecondary}
                style={[
                  styles.input,
                  { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
                ]}
              />

              {/* Theme Picker */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Canvas Theme</Text>
              <View style={styles.chipRow}>
                {(['dark', 'light', 'blueprint'] as StemVisualBgTheme[]).map((th) => {
                  const active = editingDraft.bgTheme === th;
                  return (
                    <TouchableOpacity
                      key={th}
                      onPress={() => applyDraftMutation({ bgTheme: th })}
                      style={[
                        styles.editorChip,
                        {
                          backgroundColor: active ? colors.primary : colors.surface,
                          borderColor: active ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: 11.5,
                          fontWeight: '700',
                          color: active ? '#FFFFFF' : colors.text,
                        }}
                      >
                        {th === 'dark' ? 'Cyber Dark' : th === 'light' ? 'Paper Light' : 'Blueprint'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Transform & Grid Controls */}
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                Transform & Diagram Layers
              </Text>
              <View style={styles.chipRow}>
                <TouchableOpacity
                  onPress={() =>
                    applyDraftMutation({ rotationDeg: ((editingDraft.rotationDeg || 0) + 90) % 360 })
                  }
                  style={[styles.editorChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <RotateCw size={13} color={colors.primary} />
                  <Text style={{ fontSize: 11.5, fontWeight: '700', color: colors.text }}>
                    Rotate ({editingDraft.rotationDeg}°)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => applyDraftMutation({ flipX: !editingDraft.flipX })}
                  style={[
                    styles.editorChip,
                    {
                      backgroundColor: editingDraft.flipX ? colors.primary : colors.surface,
                      borderColor: editingDraft.flipX ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <FlipHorizontal size={13} color={editingDraft.flipX ? '#FFFFFF' : colors.primary} />
                  <Text
                    style={{
                      fontSize: 11.5,
                      fontWeight: '700',
                      color: editingDraft.flipX ? '#FFFFFF' : colors.text,
                    }}
                  >
                    Flip X
                  </Text>
                </TouchableOpacity>

                {editingDraft.format === 'svg' && (
                  <>
                    <TouchableOpacity
                      onPress={() => applyDraftMutation({ showGrid: !editingDraft.showGrid })}
                      style={[
                        styles.editorChip,
                        {
                          backgroundColor: editingDraft.showGrid ? colors.primaryLight : colors.surface,
                          borderColor: editingDraft.showGrid ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Grid size={13} color={colors.primary} />
                      <Text style={{ fontSize: 11.5, fontWeight: '700', color: colors.text }}>
                        Grid {editingDraft.showGrid ? 'On' : 'Off'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => applyDraftMutation({ showLabels: !editingDraft.showLabels })}
                      style={[
                        styles.editorChip,
                        {
                          backgroundColor: editingDraft.showLabels ? colors.primaryLight : colors.surface,
                          borderColor: editingDraft.showLabels ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      {editingDraft.showLabels ? (
                        <Eye size={13} color={colors.primary} />
                      ) : (
                        <EyeOff size={13} color={colors.textSecondary} />
                      )}
                      <Text style={{ fontSize: 11.5, fontWeight: '700', color: colors.text }}>
                        Labels {editingDraft.showLabels ? 'On' : 'Off'}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>

              {/* SVG Diagram Annotation Callouts */}
              {editingDraft.format === 'svg' && (
                <View style={{ gap: 6 }}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                    Add Diagram Annotation Callout
                  </Text>
                  <View style={styles.annotInputRow}>
                    <TextInput
                      value={newAnnotationText}
                      onChangeText={setNewAnnotationText}
                      placeholder="e.g. Max Peak / Transition State"
                      placeholderTextColor={colors.textSecondary}
                      style={[
                        styles.input,
                        {
                          flex: 1,
                          color: colors.text,
                          backgroundColor: colors.inputBg,
                          borderColor: colors.border,
                        },
                      ]}
                    />
                    <TouchableOpacity
                      onPress={handleAddAnnotation}
                      style={[styles.addAnnotBtn, { backgroundColor: colors.primary }]}
                    >
                      <Plus size={15} color="#FFFFFF" />
                      <Text style={{ fontSize: 11.5, fontWeight: '800', color: '#FFFFFF' }}>Add</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.chipRow}>
                    {ANNOTATION_POSITIONS.map((pos) => {
                      const active = annotPosId === pos.id;
                      return (
                        <TouchableOpacity
                          key={pos.id}
                          onPress={() => setAnnotPosId(pos.id)}
                          style={[
                            styles.posMiniChip,
                            {
                              backgroundColor: active ? colors.primaryLight : colors.surface,
                              borderColor: active ? colors.primary : colors.border,
                            },
                          ]}
                        >
                          <Text
                            style={{
                              fontSize: 10.5,
                              fontWeight: '700',
                              color: active ? colors.primary : colors.textSecondary,
                            }}
                          >
                            {pos.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {editingDraft.annotations && editingDraft.annotations.length > 0 && (
                    <View style={styles.chipRow}>
                      {editingDraft.annotations.map((ann) => (
                        <TouchableOpacity
                          key={ann.id}
                          onPress={() =>
                            applyDraftMutation({
                              annotations: editingDraft.annotations.filter((a) => a.id !== ann.id),
                            })
                          }
                          style={[
                            styles.posMiniChip,
                            { backgroundColor: colors.errorBg, borderColor: colors.error },
                          ]}
                        >
                          <Text style={{ fontSize: 10.5, fontWeight: '700', color: colors.error }}>
                            {ann.text} ×
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}

              <View style={styles.editorActionsFooter}>
                <Button
                  title="Download"
                  variant="outline"
                  size="sm"
                  icon={<Download size={14} color={colors.primary} />}
                  onPress={() => void handleDownloadVisual(editingDraft)}
                />
                <Button
                  title="Share"
                  variant="secondary"
                  size="sm"
                  icon={<Share2 size={14} color={colors.text} />}
                  onPress={() => void handleShareVisual(editingDraft)}
                />
                <Button
                  title="Save Visual"
                  size="sm"
                  icon={<Check size={14} color="#FFFFFF" />}
                  onPress={async () => {
                    await onUpdateImage(editingDraft);
                    flashStatus('Visual changes saved to Image Library.');
                    setEditingDraft(null);
                  }}
                />
              </View>
            </ScrollView>
          )}

          {/* Mode B: Browse Image Library */}
          {!showPlansSheet && !editingDraft && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Search & Subject Filters */}
              <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Search size={14} color={colors.textSecondary} />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search saved math graphs, circuits, or reactions..."
                  placeholderTextColor={colors.textSecondary}
                  style={[styles.searchInput, { color: colors.text }]}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <X size={14} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 6, paddingVertical: 2 }}
              >
                {SUBJECT_FILTERS.map((sf) => {
                  const active = subjectFilter === sf.id;
                  return (
                    <TouchableOpacity
                      key={sf.id}
                      onPress={() => setSubjectFilter(sf.id)}
                      style={[
                        styles.filterChip,
                        {
                          backgroundColor: active ? colors.primary : colors.surface,
                          borderColor: active ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: 11.5,
                          fontWeight: '700',
                          color: active ? '#FFFFFF' : colors.textSecondary,
                        }}
                      >
                        {sf.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {filteredImages.length === 0 ? (
                <EmptyResourceCard
                  title={
                    images.length === 0
                      ? 'Image Library Is Empty'
                      : 'Generated Visual Not Found'
                  }
                  message={
                    images.length === 0
                      ? 'Use the "Gen Visual" mode in AI Tutor to generate Physics diagrams, Mathematical curves, and Chemistry schematics into your Free Plan library.'
                      : 'No saved visuals matched your current filter or search text.'
                  }
                  actionLabel={images.length === 0 ? 'Create First Visual in Chat' : 'Clear Filter'}
                  onAction={() => {
                    if (images.length === 0) {
                      onClose();
                    } else {
                      setSubjectFilter('all');
                      setSearchQuery('');
                    }
                  }}
                />
              ) : (
                filteredImages.map((img) => (
                  <Card key={img.id} style={[styles.libCard, { borderColor: colors.border }]}>
                    <StemVisualPreview item={img} height={170} />

                    <View style={styles.libMetaRow}>
                      <View style={{ flexDirection: 'row', gap: 5, flexWrap: 'wrap' }}>
                        <Badge label={img.subjectCategory.toUpperCase()} variant="primary" size="sm" />
                        <Badge label={img.format.toUpperCase()} variant="info" size="sm" />
                        <Badge label={formatByteSize(img.byteSize)} variant="neutral" size="sm" />
                      </View>
                      <Text style={{ fontSize: 10, color: colors.textSecondary }}>
                        {img.source === 'gemini' ? 'Gemini Image' : 'STEM Engine'}
                      </Text>
                    </View>

                    <Text style={[styles.libTitle, { color: colors.text }]} numberOfLines={2}>
                      {img.title}
                    </Text>
                    {img.caption ? (
                      <Text style={[styles.libCaption, { color: colors.textSecondary }]} numberOfLines={2}>
                        {img.caption}
                      </Text>
                    ) : null}

                    <View style={[styles.libActionsRow, { borderTopColor: colors.borderSubtle }]}>
                      <TouchableOpacity
                        onPress={() => setEditingDraft(img)}
                        style={[styles.libBtn, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
                      >
                        <Edit3 size={13} color={colors.primary} />
                        <Text style={{ fontSize: 11, fontWeight: '800', color: colors.primary }}>Edit</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => void handleDownloadVisual(img)}
                        style={[styles.libBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      >
                        <Download size={13} color={colors.text} />
                        <Text style={{ fontSize: 11, fontWeight: '700', color: colors.text }}>Download</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => void handleShareVisual(img)}
                        style={[styles.libBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      >
                        <Share2 size={13} color={colors.text} />
                        <Text style={{ fontSize: 11, fontWeight: '700', color: colors.text }}>Share</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={async () => {
                          await onDeleteImage(img.id);
                          flashStatus('Visual deleted & storage freed.');
                        }}
                        style={[styles.libDeleteBtn, { borderColor: colors.error }]}
                      >
                        <Trash2 size={13} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  </Card>
                ))
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  container: {
    width: '100%',
    maxWidth: 620,
    height: '90%',
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
  },
  headerIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  planBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  quotaStrip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 5,
  },
  quotaLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quotaTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  quotaFill: {
    height: '100%',
    borderRadius: 3,
  },
  statusToast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 14,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  scrollContent: {
    padding: 14,
    gap: 10,
    paddingBottom: 24,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
  },
  planCard: {
    padding: 12,
    gap: 3,
  },
  planCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  libCard: {
    padding: 12,
    gap: 8,
  },
  visualFrame: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  visualMedia: {
    width: '100%',
    height: '100%',
  },
  libMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  libTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  libCaption: {
    fontSize: 12,
    lineHeight: 16,
  },
  libActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingTop: 8,
    borderTopWidth: 1,
    flexWrap: 'wrap',
  },
  libBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
    borderWidth: 1,
    overflow: 'hidden',
  },
  libDeleteBtn: {
    marginLeft: 'auto',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 9,
    borderWidth: 1,
    overflow: 'hidden',
  },
  backToLibBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
  },
  editMetaRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  fieldLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    marginTop: 2,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 8,
    fontSize: 13.5,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  editorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  annotInputRow: {
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
  },
  addAnnotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    overflow: 'hidden',
  },
  posMiniChip: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  editorActionsFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
});
