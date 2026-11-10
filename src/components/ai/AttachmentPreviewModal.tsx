import React, { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../../theme';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { RichMathText } from '../common/MathRenderer';
import { convertPlainTextToLatex } from '../../utils/noteLatexConverter';
import { formatAttachmentSize } from '../../utils/attachmentParser';
import type { AIUploadedAttachment, AttachmentFilterPreset } from '../../types';
import {
  Eye,
  FileText,
  Image as ImageIcon,
  Maximize2,
  Minimize2,
  Presentation,
  RotateCw,
  Send,
  Sparkles,
  X,
} from 'lucide-react-native';

interface AttachmentPreviewModalProps {
  visible: boolean;
  attachment: AIUploadedAttachment | null;
  isSentAttachment?: boolean;
  onClose: () => void;
  onSaveEdits: (updated: AIUploadedAttachment) => void;
  onReaskWithEdits?: (updated: AIUploadedAttachment) => void;
}

const FILTER_PRESETS: Array<{ id: AttachmentFilterPreset; label: string }> = [
  { id: 'none', label: 'Original' },
  { id: 'high_contrast', label: 'Sharp Ink' },
  { id: 'warm', label: 'Warm Paper' },
  { id: 'inverted', label: 'Blueprint' },
];

export const AttachmentPreviewModal: React.FC<AttachmentPreviewModalProps> = ({
  visible,
  attachment,
  isSentAttachment = false,
  onClose,
  onSaveEdits,
  onReaskWithEdits,
}) => {
  const { colors, mode } = useTheme();
  const [name, setName] = useState('');
  const [summaryHint, setSummaryHint] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [rotationDeg, setRotationDeg] = useState(0);
  const [filterPreset, setFilterPreset] = useState<AttachmentFilterPreset>('none');
  const [previewMath, setPreviewMath] = useState(false);
  const [expandedImage, setExpandedImage] = useState(false);

  useEffect(() => {
    if (!attachment || !visible) return;
    setName(attachment.name || '');
    setSummaryHint(attachment.summaryHint || '');
    setExtractedText(attachment.extractedText || '');
    setRotationDeg(attachment.rotationDeg || 0);
    setFilterPreset(attachment.filterPreset || 'none');
    setPreviewMath(false);
    setExpandedImage(false);
  }, [attachment, visible]);

  if (!attachment) return null;

  const imageUri =
    attachment.kind === 'image'
      ? attachment.uri ||
        (attachment.base64
          ? `data:${attachment.mimeType || 'image/jpeg'};base64,${attachment.base64}`
          : undefined)
      : undefined;

  const buildUpdatedAttachment = (): AIUploadedAttachment => ({
    ...attachment,
    name: name.trim() || attachment.name,
    summaryHint: summaryHint.trim() || undefined,
    extractedText: extractedText.trim() || undefined,
    rotationDeg,
    filterPreset,
    edited: true,
    editedAt: new Date().toISOString(),
  });

  const handleConvertTextToLatex = () => {
    if (!extractedText.trim()) return;
    setExtractedText((prev) => convertPlainTextToLatex(prev));
    setPreviewMath(true);
  };

  const renderFilterOverlay = () => {
    if (filterPreset === 'warm') {
      return (
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(249, 115, 22, 0.14)' }]}
        />
      );
    }
    if (filterPreset === 'high_contrast') {
      return (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              borderWidth: 2,
              borderColor: colors.primary,
              backgroundColor: 'rgba(15, 23, 42, 0.08)',
            },
          ]}
        />
      );
    }
    if (filterPreset === 'inverted') {
      return (
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(14, 165, 233, 0.2)' }]}
        />
      );
    }
    return null;
  };

  const sizeLabel = formatAttachmentSize(attachment.sizeBytes);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
              <View style={[styles.iconBox, { backgroundColor: colors.primaryLight }]}>
                {attachment.kind === 'image' ? (
                  <ImageIcon size={17} color={colors.primary} />
                ) : attachment.kind === 'ppt' ? (
                  <Presentation size={17} color={colors.warning} />
                ) : (
                  <FileText size={17} color={colors.primary} />
                )}
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
                  Attachment Preview & Editor
                </Text>
                <Text style={{ fontSize: 11, color: colors.textSecondary }} numberOfLines={1}>
                  {isSentAttachment
                    ? 'Inspect, edit & re-ask AI after upload'
                    : 'Preview & annotate before sending to AI'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={8} accessibilityLabel="Close attachment editor">
              <X size={19} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scrollBody}
            contentContainerStyle={{ gap: 12, paddingBottom: 10 }}
          >
            {/* Metadata Pills */}
            <View style={styles.metaPillsRow}>
              <Badge label={attachment.kind.toUpperCase()} variant="primary" size="sm" />
              {sizeLabel ? <Badge label={sizeLabel} variant="neutral" size="sm" /> : null}
              {attachment.edited ? <Badge label="EDITED" variant="success" size="sm" /> : null}
              {rotationDeg !== 0 ? (
                <Badge label={`ROT ${rotationDeg}°`} variant="info" size="sm" />
              ) : null}
            </View>

            {/* Visual Preview for Images */}
            {attachment.kind === 'image' && imageUri ? (
              <View
                style={[
                  styles.imagePreviewFrame,
                  {
                    backgroundColor: mode === 'dark' ? '#090D16' : '#F1F5F9',
                    borderColor: colors.border,
                    height: expandedImage ? 290 : 185,
                  },
                ]}
              >
                <Image
                  source={{ uri: imageUri }}
                  resizeMode="contain"
                  style={[
                    styles.previewImage,
                    {
                      transform: [{ rotate: `${rotationDeg}deg` }],
                    },
                  ]}
                />
                {renderFilterOverlay()}

                <TouchableOpacity
                  onPress={() => setExpandedImage((v) => !v)}
                  style={[
                    styles.expandBtn,
                    { backgroundColor: 'rgba(15, 23, 42, 0.78)', borderColor: colors.border },
                  ]}
                >
                  {expandedImage ? (
                    <Minimize2 size={14} color="#FFFFFF" />
                  ) : (
                    <Maximize2 size={14} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View
                style={[
                  styles.docCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  {attachment.kind === 'ppt' ? (
                    <Presentation size={26} color={colors.warning} />
                  ) : (
                    <FileText size={26} color={colors.primary} />
                  )}
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontSize: 13.5, fontWeight: '800', color: colors.text }} numberOfLines={1}>
                      {name || attachment.name}
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.textSecondary }} numberOfLines={1}>
                      {attachment.mimeType} {sizeLabel ? `· ${sizeLabel}` : ''}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Image Controls: Rotate + Filter Preset */}
            {attachment.kind === 'image' && (
              <View style={styles.controlsRow}>
                <TouchableOpacity
                  onPress={() => setRotationDeg((deg) => (deg + 90) % 360)}
                  style={[
                    styles.toolChip,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <RotateCw size={13} color={colors.primary} />
                  <Text style={{ fontSize: 11.5, fontWeight: '700', color: colors.text }}>
                    Rotate 90°
                  </Text>
                </TouchableOpacity>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 6 }}
                >
                  {FILTER_PRESETS.map((fp) => {
                    const active = filterPreset === fp.id;
                    return (
                      <TouchableOpacity
                        key={fp.id}
                        onPress={() => setFilterPreset(fp.id)}
                        style={[
                          styles.toolChip,
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
                          {fp.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Editable Title */}
            <View>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Document Title</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter attachment title..."
                placeholderTextColor={colors.textSecondary}
                style={[
                  styles.input,
                  { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
                ]}
              />
            </View>

            {/* Editable Caption / AI Instruction Hint */}
            <View>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                Study Note / AI Instruction Tag
              </Text>
              <TextInput
                value={summaryHint}
                onChangeText={setSummaryHint}
                placeholder="e.g. Solve Q3 only, focus on Free Body Diagram..."
                placeholderTextColor={colors.textSecondary}
                style={[
                  styles.input,
                  { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
                ]}
              />
            </View>

            {/* Editable Content / OCR Transcript + LaTeX Tools */}
            <View>
              <View style={styles.contentHeaderRow}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginBottom: 0 }]}>
                  {attachment.kind === 'image'
                    ? 'OCR / Problem Notes (Optional)'
                    : 'Extracted Document Content'}
                </Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <TouchableOpacity
                    onPress={handleConvertTextToLatex}
                    style={[
                      styles.miniToolBtn,
                      { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                    ]}
                  >
                    <Sparkles size={11.5} color={colors.primary} />
                    <Text style={{ fontSize: 10.5, fontWeight: '800', color: colors.primary }}>
                      Convert to LaTeX
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setPreviewMath((p) => !p)}
                    style={[
                      styles.miniToolBtn,
                      {
                        backgroundColor: previewMath ? colors.primary : colors.surface,
                        borderColor: previewMath ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Eye size={11.5} color={previewMath ? '#FFFFFF' : colors.textSecondary} />
                    <Text
                      style={{
                        fontSize: 10.5,
                        fontWeight: '800',
                        color: previewMath ? '#FFFFFF' : colors.textSecondary,
                      }}
                    >
                      {previewMath ? 'Edit Text' : 'LaTeX View'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {previewMath ? (
                <View
                  style={[
                    styles.mathPreviewBox,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <RichMathText
                    content={extractedText.trim() || '_No extracted text yet. Switch to Edit Text to add notes or formulas._'}
                    fontSize={13.5}
                    color={colors.text}
                    accentColor={colors.primary}
                    allowPanModal
                    panTitle={name || 'Document Content'}
                  />
                </View>
              ) : (
                <TextInput
                  multiline
                  value={extractedText}
                  onChangeText={setExtractedText}
                  placeholder="Edit extracted slide text, notes, or transcribe equations before sending to Gemini AI..."
                  placeholderTextColor={colors.textSecondary}
                  style={[
                    styles.textArea,
                    { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border },
                  ]}
                />
              )}
            </View>
          </ScrollView>

          {/* Actions Footer */}
          <View style={[styles.footerRow, { borderTopColor: colors.borderSubtle }]}>
            <Button title="Cancel" variant="outline" size="sm" onPress={onClose} />
            <Button
              title="Save Edits"
              variant={isSentAttachment ? 'secondary' : 'primary'}
              size="sm"
              onPress={() => {
                onSaveEdits(buildUpdatedAttachment());
                onClose();
              }}
            />
            {isSentAttachment && onReaskWithEdits && (
              <Button
                title="Re-Ask AI"
                size="sm"
                icon={<Send size={13} color="#FFFFFF" />}
                onPress={() => {
                  const updated = buildUpdatedAttachment();
                  onClose();
                  onReaskWithEdits(updated);
                }}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  sheet: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '90%',
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  iconBox: {
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
  scrollBody: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  metaPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  imagePreviewFrame: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  expandBtn: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toolChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  fieldLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'web' ? 9 : 8,
    fontSize: 13.5,
  },
  contentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  miniToolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 115,
    maxHeight: 190,
    textAlignVertical: 'top',
    fontSize: 13,
  },
  mathPreviewBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 115,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
});
