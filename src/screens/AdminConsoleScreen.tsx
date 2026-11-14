/**
 * Study Labs — Dedicated Admin Console & Security Threat Center
 * Content moderation queue, disposable email & breach detection alerts,
 * role management, and multi-cloud storage telemetry dashboard.
 */

import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../theme';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { CommunityEngine } from '../utils/communityEngine';
import { CloudStorageService } from '../services/cloudStorage';
import { SoundManager } from '../services/soundManager';
import { HapticManager } from '../services/hapticManager';
import type {
  AdminSecurityAlert,
  CloudStorageStatus,
  CommunityResource,
  NavTab,
} from '../types';
import {
  AlertTriangle,
  Award,
  Check,
  CheckCircle2,
  Database,
  Eye,
  FileCheck,
  FileX,
  HardDrive,
  Lock,
  Mail,
  RefreshCw,
  Search,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
  X,
  Zap,
} from 'lucide-react-native';

interface AdminConsoleScreenProps {
  onNavigate: (tab: NavTab) => void;
}

type AdminTab = 'moderation' | 'security' | 'users' | 'storage';

export const AdminConsoleScreen: React.FC<AdminConsoleScreenProps> = () => {
  const { colors, mode } = useTheme();

  const [activeTab, setActiveTab] = useState<AdminTab>('moderation');
  const [resources, setResources] = useState<CommunityResource[]>([]);
  const [storageStatus, setStorageStatus] = useState<CloudStorageStatus[]>([]);
  const [rejectReasonModalId, setRejectReasonModalId] = useState<string | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Security Threat Center State
  const [securityAlerts, setSecurityAlerts] = useState<AdminSecurityAlert[]>([
    {
      id: 'alert_sec_01',
      type: 'temp_mail',
      severity: 'high',
      details: 'Signup blocked: email domain "@tempmail.com" detected on disposable blacklist.',
      userEmail: 'bot_student99@tempmail.com',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: 'active',
    },
    {
      id: 'alert_sec_02',
      type: 'breached_password',
      severity: 'medium',
      details: 'Weak password detected: "password123" flagged in public credential breach corpus.',
      userId: 'usr_test_demo',
      userEmail: 'student_practice@gmail.com',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      status: 'active',
    },
    {
      id: 'alert_sec_03',
      type: 'spam_flood',
      severity: 'low',
      details: 'External URL blocked in #announcements by Anti-Spam link security filter.',
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      status: 'resolved',
    },
  ]);

  // Demo user management
  const [usersList, setUsersList] = useState([
    { id: 'usr_local_01', name: 'Aarav Sharma', ioId: 'STUDY-7734-IO', role: 'Student', verified: false },
    { id: 'fac_dr_kapoor', name: 'Dr. R. Kapoor', ioId: 'FAC-1001-IO', role: 'Principal', verified: true },
    { id: 'fac_meera_chem', name: 'Prof. Meera Iyer', ioId: 'FAC-1042-IO', role: 'Teacher', verified: true },
    { id: 'peer_ananya', name: 'Ananya Verma', ioId: 'STUDY-4102-IO', role: 'Student', verified: false },
    { id: 'peer_rohan', name: 'Rohan Kulkarni', ioId: 'STUDY-9811-IO', role: 'Class Monitor', verified: false },
  ]);

  const loadData = async () => {
    const rList = await CommunityEngine.getResources();
    setResources(rList);
    setStorageStatus(CloudStorageService.getStorageTelemetry());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveResource = async (id: string) => {
    SoundManager.play('achievement');
    HapticManager.triggerSuccess();
    await CommunityEngine.moderateResource(id, 'approved');
    await loadData();
    setActionNotice('Resource approved & published to community library!');
  };

  const handleRejectResource = async () => {
    if (!rejectReasonModalId) return;
    SoundManager.play('click');
    HapticManager.triggerSelection();
    await CommunityEngine.moderateResource(
      rejectReasonModalId,
      'rejected',
      rejectionReasonText.trim() || 'Did not meet content quality guidelines.'
    );
    setRejectReasonModalId(null);
    setRejectionReasonText('');
    await loadData();
    setActionNotice('Resource rejected with feedback recorded.');
  };

  const handleResolveAlert = (alertId: string) => {
    SoundManager.play('click');
    HapticManager.triggerSelection();
    setSecurityAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'resolved' } : a))
    );
  };

  const handleToggleVerifiedBadge = (userId: string) => {
    SoundManager.play('achievement');
    HapticManager.triggerSelection();
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, verified: !u.verified } : u))
    );
  };

  const pendingModeration = resources.filter((r) => r.status === 'pending');

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
        {/* Admin Header Hero */}
        <Card style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View style={[styles.heroIconBox, { backgroundColor: mode === 'dark' ? '#7C2D12' : '#FFEDD5' }]}>
              <ShieldCheck size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.heroTitle, { color: colors.text }]}>
                  Platform Administration Console
                </Text>
                <Badge label="Super Admin" variant="primary" size="sm" />
              </View>
              <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
                Content moderation queue, security threat center, multi-cloud storage telemetry & staff RBAC
              </Text>
            </View>
          </View>

          {/* Tab Strip */}
          <View style={[styles.tabStrip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity
              onPress={() => setActiveTab('moderation')}
              style={[
                styles.tabBtn,
                activeTab === 'moderation' && { backgroundColor: colors.primary },
              ]}
            >
              <Text style={[styles.tabBtnText, { color: activeTab === 'moderation' ? '#FFFFFF' : colors.text }]}>
                Moderation ({pendingModeration.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('security')}
              style={[
                styles.tabBtn,
                activeTab === 'security' && { backgroundColor: colors.primary },
              ]}
            >
              <Text style={[styles.tabBtnText, { color: activeTab === 'security' ? '#FFFFFF' : colors.text }]}>
                Security ({securityAlerts.filter((a) => a.status === 'active').length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('users')}
              style={[
                styles.tabBtn,
                activeTab === 'users' && { backgroundColor: colors.primary },
              ]}
            >
              <Text style={[styles.tabBtnText, { color: activeTab === 'users' ? '#FFFFFF' : colors.text }]}>
                Staff & Roles ({usersList.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('storage')}
              style={[
                styles.tabBtn,
                activeTab === 'storage' && { backgroundColor: colors.primary },
              ]}
            >
              <Text style={[styles.tabBtnText, { color: activeTab === 'storage' ? '#FFFFFF' : colors.text }]}>
                Multi-Cloud
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {actionNotice && (
          <View style={[styles.toastNotice, { backgroundColor: mode === 'dark' ? '#064E3B' : '#DCFCE7', borderColor: colors.success }]}>
            <CheckCircle2 size={16} color={colors.success} />
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.success, flex: 1 }}>{actionNotice}</Text>
            <TouchableOpacity onPress={() => setActionNotice(null)}>
              <X size={14} color={colors.success} />
            </TouchableOpacity>
          </View>
        )}

        {/* TAB 1: CONTENT MODERATION QUEUE */}
        {activeTab === 'moderation' && (
          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Pending Community Submissions ({pendingModeration.length})
              </Text>
            </View>

            {pendingModeration.length === 0 ? (
              <Card style={styles.emptyCard}>
                <CheckCircle2 size={36} color={colors.success} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>Moderation Queue is Clear</Text>
                <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                  All community-uploaded notes, books, and question papers have been reviewed and published.
                </Text>
              </Card>
            ) : (
              pendingModeration.map((res) => (
                <Card key={res.id} style={styles.moderationCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Badge label={res.format.toUpperCase()} variant="warning" size="sm" />
                    <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                      Submitted {new Date(res.createdAt).toLocaleDateString()}
                    </Text>
                  </View>

                  <Text style={[styles.modItemTitle, { color: colors.text }]}>{res.title}</Text>
                  <Text style={{ fontSize: 11.5, color: colors.textSecondary }}>{res.description}</Text>

                  <View style={styles.modMetaRow}>
                    <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                      Author: <Text style={{ fontWeight: '700', color: colors.text }}>{res.authorName}</Text> ({res.authorRole})
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                      Subject: <Text style={{ fontWeight: '700', color: colors.primary }}>{res.subject.toUpperCase()}</Text>
                    </Text>
                  </View>

                  {/* Approve / Reject Actions */}
                  <View style={[styles.actionRow, { borderTopColor: colors.border }]}>
                    <Button
                      title="Reject with Reason"
                      variant="outline"
                      size="sm"
                      icon={<FileX size={14} color={colors.error} />}
                      onPress={() => setRejectReasonModalId(res.id)}
                      style={{ flex: 1 }}
                    />
                    <Button
                      title="Approve & Publish"
                      variant="primary"
                      size="sm"
                      icon={<FileCheck size={14} color="#FFFFFF" />}
                      onPress={() => handleApproveResource(res.id)}
                      style={{ flex: 1 }}
                    />
                  </View>
                </Card>
              ))
            )}
          </View>
        )}

        {/* TAB 2: SECURITY THREAT CENTER */}
        {activeTab === 'security' && (
          <View style={{ gap: 10 }}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Automated Bot & Security Alerts
            </Text>

            {securityAlerts.map((alert) => {
              const isResolved = alert.status === 'resolved';
              return (
                <Card
                  key={alert.id}
                  style={[
                    styles.alertCard,
                    {
                      borderColor:
                        alert.severity === 'high'
                          ? colors.error
                          : alert.severity === 'medium'
                          ? colors.warning
                          : colors.border,
                      opacity: isResolved ? 0.65 : 1,
                    },
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <ShieldAlert
                        size={16}
                        color={
                          alert.severity === 'high'
                            ? colors.error
                            : alert.severity === 'medium'
                            ? colors.warning
                            : colors.info
                        }
                      />
                      <Badge
                        label={alert.type.toUpperCase().replace('_', ' ')}
                        variant={alert.severity === 'high' ? 'error' : 'warning'}
                        size="sm"
                      />
                    </View>
                    <Badge
                      label={isResolved ? 'RESOLVED' : 'ACTIVE THREAT'}
                      variant={isResolved ? 'success' : 'error'}
                      size="sm"
                    />
                  </View>

                  <Text style={[styles.alertDetails, { color: colors.text }]}>{alert.details}</Text>

                  {alert.userEmail && (
                    <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                      Target Account: <Text style={{ fontWeight: '700', color: colors.text }}>{alert.userEmail}</Text>
                    </Text>
                  )}

                  {!isResolved && (
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                      <Button
                        title="Mark Threat Resolved"
                        variant="outline"
                        size="sm"
                        onPress={() => handleResolveAlert(alert.id)}
                      />
                    </View>
                  )}
                </Card>
              );
            })}
          </View>
        )}

        {/* TAB 3: STAFF & USER MANAGEMENT */}
        {activeTab === 'users' && (
          <View style={{ gap: 10 }}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              User Roles & Verified Staff
            </Text>

            {usersList.map((usr) => (
              <Card key={usr.id} style={styles.userCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={[styles.userAvatar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <Text style={{ fontSize: 12, fontWeight: '800', color: colors.primary }}>
                        {usr.name.charAt(0)}
                      </Text>
                    </View>
                    <View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Text style={[styles.userName, { color: colors.text }]}>{usr.name}</Text>
                        {usr.verified && <CheckCircle2 size={13} color={colors.primary} />}
                      </View>
                      <Text style={{ fontSize: 10.5, color: colors.textSecondary }}>{usr.ioId}</Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Badge label={usr.role} variant="primary" size="sm" />
                    <TouchableOpacity
                      onPress={() => handleToggleVerifiedBadge(usr.id)}
                      style={[
                        styles.verifyToggleBtn,
                        {
                          backgroundColor: usr.verified ? `${colors.primary}22` : colors.surface,
                          borderColor: usr.verified ? colors.primary : colors.border,
                        },
                      ]}
                      accessibilityLabel="Toggle verified badge"
                    >
                      <Award size={13} color={usr.verified ? colors.primary : colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* TAB 4: MULTI-CLOUD STORAGE TELEMETRY */}
        {activeTab === 'storage' && (
          <View style={{ gap: 10 }}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Multi-Cloud Storage & Distribution Status
            </Text>

            {storageStatus.map((st) => (
              <Card key={st.provider} style={styles.storageCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <HardDrive size={18} color={st.isConfigured ? colors.success : colors.textSecondary} />
                    <Text style={[styles.storageLabel, { color: colors.text }]}>{st.label}</Text>
                  </View>
                  <Badge
                    label={st.isConfigured ? 'CONNECTED' : 'STANDBY'}
                    variant={st.isConfigured ? 'success' : 'neutral'}
                    size="sm"
                  />
                </View>

                <Text style={{ fontSize: 11.5, color: colors.textSecondary }}>{st.statusText}</Text>

                <View style={[styles.quotaTrack, { backgroundColor: colors.surface }]}>
                  <View
                    style={[
                      styles.quotaFill,
                      {
                        width: `${Math.min(100, Math.round((st.usedBytes / st.maxBytes) * 100))}%`,
                        backgroundColor: colors.primary,
                      },
                    ]}
                  />
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 10.5, color: colors.textSecondary }}>
                    Used: {(st.usedBytes / (1024 * 1024)).toFixed(1)} MB
                  </Text>
                  <Text style={{ fontSize: 10.5, color: colors.textSecondary }}>
                    Capacity: {(st.maxBytes / (1024 * 1024 * 1024)).toFixed(0)} GB
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Reject Reason Modal */}
      {rejectReasonModalId && (
        <View style={styles.modalOverlay}>
          <Card style={styles.rejectModalCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Reject Submission</Text>
            <Text style={{ fontSize: 11.5, color: colors.textSecondary }}>
              Provide constructive feedback to the author on why this upload was rejected:
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, height: 70 }]}
              placeholder="e.g. Missing solutions to numerical questions, blurry scans..."
              placeholderTextColor={colors.textSecondary}
              multiline
              value={rejectionReasonText}
              onChangeText={setRejectionReasonText}
            />
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
              <Button
                title="Cancel"
                variant="outline"
                size="sm"
                onPress={() => setRejectReasonModalId(null)}
                style={{ flex: 1 }}
              />
              <Button
                title="Confirm Rejection"
                variant="primary"
                size="sm"
                onPress={handleRejectResource}
                style={{ flex: 1 }}
              />
            </View>
          </Card>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { padding: 14, gap: 12, paddingBottom: 30 },
  heroCard: { padding: 14, gap: 12 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heroIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: { fontSize: 15, fontWeight: '900' },
  heroSubtitle: { fontSize: 11.5, marginTop: 2, lineHeight: 16 },
  tabStrip: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnText: { fontSize: 11, fontWeight: '700' },
  toastNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 9,
    borderWidth: 1,
  },
  sectionTitle: { fontSize: 14, fontWeight: '800' },
  emptyCard: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: { fontSize: 15, fontWeight: '800' },
  emptySub: { fontSize: 11.5, textAlign: 'center', maxWidth: 300 },
  moderationCard: { padding: 12, gap: 8 },
  modItemTitle: { fontSize: 13.5, fontWeight: '800' },
  modMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  alertCard: { padding: 12, gap: 8, borderWidth: 1.25 },
  alertDetails: { fontSize: 12.5, fontWeight: '700', lineHeight: 17 },
  userCard: { padding: 10 },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: { fontSize: 13, fontWeight: '700' },
  verifyToggleBtn: {
    width: 28,
    height: 28,
    borderRadius: 7,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storageCard: { padding: 12, gap: 8 },
  storageLabel: { fontSize: 13, fontWeight: '800' },
  quotaTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 2,
  },
  quotaFill: { height: '100%', borderRadius: 3 },
  modalOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  rejectModalCard: { width: '100%', maxWidth: 420, padding: 16, gap: 10 },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12.5,
  },
});
