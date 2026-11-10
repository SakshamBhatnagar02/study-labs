import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../../theme';
import { Card } from './Card';
import { Button } from './Button';
import type { AppErrorInfo } from '../../types';
import { formatErrorCloneText } from '../../utils/errorHandling';
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  RotateCcw,
  SearchX,
  WifiOff,
  X,
} from 'lucide-react-native';

export async function copyTextSafely(text: string): Promise<boolean> {
  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below
    }
  }
  return false;
}

interface ApiErrorCardProps {
  error: AppErrorInfo;
  onRetry?: () => void;
  onUseOffline?: () => void;
  onDismiss?: () => void;
  compact?: boolean;
}

export const ApiErrorCard: React.FC<ApiErrorCardProps> = ({
  error,
  onRetry,
  onUseOffline,
  onDismiss,
  compact = false,
}) => {
  const { colors, mode } = useTheme();
  const [showDetails, setShowDetails] = useState(false);
  const [copiedClone, setCopiedClone] = useState(false);
  const [cloneModalOpen, setCloneModalOpen] = useState(false);

  const clonedDiagnostic = formatErrorCloneText(error);

  const handleCloneError = async () => {
    const copied = await copyTextSafely(clonedDiagnostic);
    if (copied) {
      setCopiedClone(true);
      setTimeout(() => setCopiedClone(false), 2200);
    } else {
      setCloneModalOpen(true);
    }
  };

  const handleShareError = async () => {
    try {
      await Share.share({
        title: `Study Labs Error (${error.code || error.source})`,
        message: clonedDiagnostic,
      });
    } catch {
      // Non-fatal if user cancels share dialog
    }
  };

  return (
    <>
      <Card
        style={[
          styles.errorCard,
          compact && styles.errorCardCompact,
          {
            backgroundColor: mode === 'dark' ? '#1E1116' : '#FEF2F2',
            borderColor: colors.error,
          },
        ]}
      >
        <View style={styles.errorHeader}>
          <View style={styles.errorHeaderLeft}>
            <View
              style={[
                styles.errorIconWrap,
                { backgroundColor: mode === 'dark' ? '#450A0A' : '#FEE2E2' },
              ]}
            >
              <AlertTriangle size={15} color={colors.error} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={styles.errorTitleRow}>
                <Text
                  style={[
                    styles.errorTitle,
                    { color: mode === 'dark' ? '#FCA5A5' : colors.error },
                  ]}
                  numberOfLines={2}
                >
                  {error.title}
                </Text>
                {error.code !== undefined && (
                  <View
                    style={[
                      styles.codePill,
                      {
                        backgroundColor: mode === 'dark' ? '#7F1D1D' : '#FEE2E2',
                        borderColor: colors.error,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.codePillText,
                        { color: mode === 'dark' ? '#FECACA' : colors.error },
                      ]}
                    >
                      {String(error.code)}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={[styles.errorMessage, { color: colors.text }]}>{error.message}</Text>
            </View>
          </View>

          {onDismiss && (
            <TouchableOpacity onPress={onDismiss} hitSlop={8} accessibilityLabel="Dismiss error">
              <X size={15} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <Text style={[styles.errorSuggestion, { color: colors.textSecondary }]}>
          <Text style={{ fontWeight: '700', color: colors.text }}>Fix / Next step: </Text>
          {error.suggestion}
        </Text>

        {showDetails && (
          <View
            style={[
              styles.rawBox,
              {
                backgroundColor: mode === 'dark' ? '#0B1220' : '#FFFFFF',
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.rawText, { color: colors.textSecondary }]} selectable>
              {clonedDiagnostic}
            </Text>
          </View>
        )}

        <View style={styles.errorActionsRow}>
          {error.canRetry && onRetry && (
            <TouchableOpacity
              onPress={onRetry}
              activeOpacity={0.75}
              style={[
                styles.errActionBtn,
                { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
            >
              <RotateCcw size={13} color="#FFFFFF" />
              <Text style={[styles.errActionBtnText, { color: '#FFFFFF' }]}>Try Again</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleCloneError}
            activeOpacity={0.75}
            style={[
              styles.errActionBtn,
              {
                backgroundColor: colors.card,
                borderColor: copiedClone ? colors.success : colors.border,
              },
            ]}
          >
            {copiedClone ? (
              <Check size={13} color={colors.success} />
            ) : (
              <Copy size={13} color={colors.text} />
            )}
            <Text
              style={[
                styles.errActionBtnText,
                { color: copiedClone ? colors.success : colors.text },
              ]}
            >
              {copiedClone ? 'Error Cloned' : 'Clone Error'}
            </Text>
          </TouchableOpacity>

          {error.canUseOffline && onUseOffline && (
            <TouchableOpacity
              onPress={onUseOffline}
              activeOpacity={0.75}
              style={[
                styles.errActionBtn,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <WifiOff size={13} color={colors.textSecondary} />
              <Text style={[styles.errActionBtnText, { color: colors.textSecondary }]}>
                Use Offline
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => setShowDetails((s) => !s)}
            activeOpacity={0.75}
            style={[
              styles.errDetailsToggle,
              { borderColor: colors.borderSubtle, backgroundColor: colors.surface },
            ]}
          >
            {showDetails ? (
              <ChevronUp size={13} color={colors.textSecondary} />
            ) : (
              <ChevronDown size={13} color={colors.textSecondary} />
            )}
            <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textSecondary }}>
              {showDetails ? 'Hide Log' : 'Details'}
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Cross-platform Diagnostic Clone Modal (especially useful on Android/iOS) */}
      <Modal
        visible={cloneModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCloneModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Cloned Error Report</Text>
              <TouchableOpacity onPress={() => setCloneModalOpen(false)}>
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 8 }}>
              Select and copy this sanitized diagnostic report, or share it directly:
            </Text>
            <TextInput
              multiline
              editable={false}
              selectTextOnFocus
              value={clonedDiagnostic}
              style={[
                styles.cloneTextInput,
                {
                  color: colors.text,
                  backgroundColor: colors.inputBg,
                  borderColor: colors.border,
                },
              ]}
            />
            <View style={styles.modalFooter}>
              <Button title="Share Error" variant="outline" size="sm" onPress={handleShareError} style={{ flex: 1 }} />
              <Button title="Done" size="sm" onPress={() => setCloneModalOpen(false)} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

interface EmptyResourceCardProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyResourceCard: React.FC<EmptyResourceCardProps> = ({
  title,
  message,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondaryAction,
  icon,
}) => {
  const { colors, mode } = useTheme();
  return (
    <Card
      style={[
        styles.emptyCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View
        style={[
          styles.emptyIconCircle,
          { backgroundColor: mode === 'dark' ? '#1E293B' : '#FFF7ED', borderColor: colors.border },
        ]}
      >
        {icon || <SearchX size={24} color={colors.primary} />}
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>{message}</Text>
      {(actionLabel || secondaryLabel) && (
        <View style={styles.emptyActions}>
          {actionLabel && onAction && (
            <Button title={actionLabel} size="sm" onPress={onAction} />
          )}
          {secondaryLabel && onSecondaryAction && (
            <Button title={secondaryLabel} size="sm" variant="outline" onPress={onSecondaryAction} />
          )}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  errorCard: {
    borderWidth: 1.25,
    padding: 13,
    gap: 8,
    overflow: 'hidden',
  },
  errorCardCompact: {
    padding: 10,
    gap: 6,
  },
  errorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  errorHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    minWidth: 0,
  },
  errorIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  errorTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 2,
  },
  errorTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  codePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  codePillText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  errorMessage: {
    fontSize: 12,
    lineHeight: 17,
  },
  errorSuggestion: {
    fontSize: 11.5,
    lineHeight: 16,
  },
  rawBox: {
    borderRadius: 9,
    borderWidth: 1,
    padding: 8,
  },
  rawText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 10.5,
    lineHeight: 15,
  },
  errorActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    alignItems: 'center',
    marginTop: 2,
  },
  errActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
    borderWidth: 1,
    overflow: 'hidden',
  },
  errActionBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  errDetailsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 9,
    borderWidth: 1,
    marginLeft: 'auto',
    overflow: 'hidden',
  },
  emptyCard: {
    width: '100%',
    padding: 22,
    alignItems: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12.5,
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: 320,
  },
  emptyActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  cloneTextInput: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    minHeight: 140,
    maxHeight: 220,
    textAlignVertical: 'top',
    fontSize: 11.5,
    marginBottom: 12,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 8,
  },
});

