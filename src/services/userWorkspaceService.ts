/**
 * Study Labs — Per-User Cloud Workspace Folders & Code-Verified Account Deletion Service
 *
 * 1. On user registration / onboarding completion:
 *    Automatically creates a dedicated per-user folder hierarchy in BOTH Backblaze B2
 *    and Supabase DB (`user_storage_folders` + `user_uploaded_files`):
 *      users/{userId}/profile/
 *      users/{userId}/notebooks/
 *      users/{userId}/books/
 *      users/{userId}/notes/
 *      users/{userId}/solutions/
 *      users/{userId}/visuals/
 *
 * 2. On permanent account deletion:
 *    - Strictly requires a time-limited 6-digit verification code sent via email / security challenge.
 *    - Gives the user an explicit choice:
 *      (A) Preserve uploaded public Books, Solutions & Notes for other Study Labs members
 *          (anonymized & moved to `community/preserved/{category}/`), OR
 *      (B) Wipe ALL uploaded content alongside personal data.
 *    - Permanently wipes the user's profile, personal folders, notebooks, logs, and auth session.
 */

import { CloudStorageService } from './cloudStorage';
import { ResendEmailService } from './resendService';
import { StorageService } from './storage';
import { SupabaseService } from './supabase';
import type { UserProfile } from '../types';

export type UserFolderCategory =
  | 'profile'
  | 'notebooks'
  | 'books'
  | 'notes'
  | 'solutions'
  | 'visuals';

export const USER_FOLDER_CATEGORIES: readonly UserFolderCategory[] = [
  'notebooks',
  'books',
  'notes',
  'solutions',
  'visuals',
  'profile',
] as const;

export const PRESERVABLE_COMMUNITY_CATEGORIES: readonly UserFolderCategory[] = [
  'books',
  'solutions',
  'notes',
] as const;

export interface UserFolderDescriptor {
  id: string;
  userId: string;
  category: UserFolderCategory;
  label: string;
  b2FolderPath: string;
  supabaseFolderPath: string;
  createdAt: string;
}

export interface UserUploadedFileRecord {
  id: string;
  userId: string | null;
  originalAuthorLabel: string;
  folderCategory: UserFolderCategory;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  b2Path: string;
  supabasePath: string;
  publicUrl: string;
  isPublicShared: boolean;
  isPreservedAfterDeletion: boolean;
  status: 'active' | 'preserved_community' | 'deleted';
  createdAt: string;
}

export interface UserWorkspaceManifest {
  userId: string;
  ioId: string;
  rootB2Path: string;
  rootSupabasePath: string;
  folders: UserFolderDescriptor[];
  files: UserUploadedFileRecord[];
  provisionedAt: string;
  syncedToSupabase: boolean;
  syncedToB2: boolean;
}

export interface PendingDeletionCode {
  requestId: string;
  userId: string;
  code: string;
  expiresAt: string;
  email: string;
  deliveryStatus: 'sent' | 'simulated' | 'local_fallback';
}

export interface AccountDeletionOutcome {
  success: boolean;
  error?: string;
  wipedPersonalFilesCount: number;
  preservedCommunityFilesCount: number;
  purgedB2Prefix?: string;
  supabaseDeleted: boolean;
}

const FOLDER_LABELS: Record<UserFolderCategory, string> = {
  notebooks: 'Notebooks & Bookmarks',
  books: 'Uploaded Books & Textbooks',
  notes: 'Study Notes & PDFs',
  solutions: 'Solutions & Answer Keys',
  visuals: 'AI STEM Visuals',
  profile: 'Profile & Avatars',
};

const WORKSPACE_STORAGE_KEY_PREFIX = '@study_labs_user_workspace_v1_';
const PRESERVED_COMMUNITY_KEY = '@study_labs_preserved_community_files_v1';
const PENDING_DELETION_KEY_PREFIX = '@study_labs_pending_deletion_v1_';

function sanitizeId(raw: string): string {
  return (raw || 'usr_local').replace(/[^a-zA-Z0-9_-]/g, '_');
}

export function buildUserFolderPaths(userId: string): {
  rootB2Path: string;
  rootSupabasePath: string;
  folders: UserFolderDescriptor[];
} {
  const safeUid = sanitizeId(userId);
  const now = new Date().toISOString();
  const rootPath = `users/${safeUid}/`;

  const folders: UserFolderDescriptor[] = USER_FOLDER_CATEGORIES.map((category) => ({
    id: `fld_${safeUid}_${category}`,
    userId: safeUid,
    category,
    label: FOLDER_LABELS[category],
    b2FolderPath: `${rootPath}${category}/`,
    supabaseFolderPath: `${rootPath}${category}/`,
    createdAt: now,
  }));

  return {
    rootB2Path: rootPath,
    rootSupabasePath: rootPath,
    folders,
  };
}

export class UserWorkspaceService {
  /**
   * Automatically provision per-user folders in Backblaze B2, Supabase DB, and local manifest on registration
   */
  static async provisionUserFolders(
    userId: string,
    ioId: string = ''
  ): Promise<UserWorkspaceManifest> {
    const safeUid = sanitizeId(userId);
    const existing = await this.getUserWorkspace(safeUid);
    const { rootB2Path, rootSupabasePath, folders } = buildUserFolderPaths(safeUid);

    let syncedToB2 = false;
    let syncedToSupabase = false;

    // 1. Provision Backblaze B2 folder structure
    try {
      await CloudStorageService.provisionUserFolderMarkers(safeUid, USER_FOLDER_CATEGORIES);
      syncedToB2 = true;
    } catch {
      syncedToB2 = false;
    }

    // 2. Provision Supabase DB folder rows (`user_storage_folders`)
    if (SupabaseService.client) {
      try {
        const rows = folders.map((f) => ({
          id: f.id,
          user_id: safeUid,
          category: f.category,
          b2_folder_path: f.b2FolderPath,
          supabase_folder_path: f.supabaseFolderPath,
        }));
        const { error } = await SupabaseService.client
          .from('user_storage_folders')
          .upsert(rows, { onConflict: 'user_id,category' });
        if (!error) {
          syncedToSupabase = true;
        }
      } catch {
        syncedToSupabase = false;
      }
    }

    const manifest: UserWorkspaceManifest = {
      userId: safeUid,
      ioId: ioId || existing?.ioId || '',
      rootB2Path,
      rootSupabasePath,
      folders,
      files: existing?.files || [],
      provisionedAt: existing?.provisionedAt || new Date().toISOString(),
      syncedToSupabase,
      syncedToB2,
    };

    await StorageService.setRawItem(
      `${WORKSPACE_STORAGE_KEY_PREFIX}${safeUid}`,
      JSON.stringify(manifest)
    );

    return manifest;
  }

  /**
   * Retrieve the user's provisioned workspace folder manifest (auto-provisions if missing)
   */
  static async getUserWorkspace(userId: string): Promise<UserWorkspaceManifest | null> {
    const safeUid = sanitizeId(userId);
    try {
      const raw = await StorageService.getRawItem(`${WORKSPACE_STORAGE_KEY_PREFIX}${safeUid}`);
      if (!raw) return null;
      return JSON.parse(raw) as UserWorkspaceManifest;
    } catch {
      return null;
    }
  }

  /**
   * Upload a file (notebook, book, note, solution, visual) into the user's dedicated folder
   * in BOTH Backblaze B2 and Supabase DB
   */
  static async uploadUserFile(params: {
    userId: string;
    authorName: string;
    category: UserFolderCategory;
    fileName: string;
    mimeType?: string;
    sizeBytes: number;
    base64OrUri: string;
    isPublicShared?: boolean;
  }): Promise<UserUploadedFileRecord> {
    const safeUid = sanitizeId(params.userId);
    const workspace =
      (await this.getUserWorkspace(safeUid)) || (await this.provisionUserFolders(safeUid));

    const uploadRes = await CloudStorageService.uploadResource(
      {
        fileName: params.fileName,
        mimeType: params.mimeType || 'application/pdf',
        sizeBytes: params.sizeBytes,
        base64OrUri: params.base64OrUri,
        bucket: params.category,
        userId: safeUid,
        isPublicShared: Boolean(params.isPublicShared),
      },
      'b2'
    );

    const record: UserUploadedFileRecord = {
      id: uploadRes.fileId,
      userId: safeUid,
      originalAuthorLabel: params.authorName || 'Study Labs Member',
      folderCategory: params.category,
      fileName: params.fileName,
      mimeType: params.mimeType || 'application/pdf',
      sizeBytes: params.sizeBytes,
      b2Path: uploadRes.b2Path,
      supabasePath: uploadRes.supabasePath,
      publicUrl: uploadRes.publicUrl,
      isPublicShared: Boolean(params.isPublicShared),
      isPreservedAfterDeletion: false,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    // Sync metadata row to Supabase DB (`user_uploaded_files`)
    if (SupabaseService.client) {
      try {
        await SupabaseService.client.from('user_uploaded_files').upsert({
          id: record.id,
          user_id: safeUid,
          original_author_label: record.originalAuthorLabel,
          folder_category: record.folderCategory,
          file_name: record.fileName,
          mime_type: record.mimeType,
          size_bytes: record.sizeBytes,
          b2_path: record.b2Path,
          supabase_path: record.supabasePath,
          public_url: record.publicUrl,
          is_public_shared: record.isPublicShared,
          is_preserved_after_deletion: false,
          status: 'active',
        });
      } catch {
        // Offline-first fallback: already persisted locally
      }
    }

    const updatedManifest: UserWorkspaceManifest = {
      ...workspace,
      files: [record, ...workspace.files],
    };

    await StorageService.setRawItem(
      `${WORKSPACE_STORAGE_KEY_PREFIX}${safeUid}`,
      JSON.stringify(updatedManifest)
    );

    return record;
  }

  /**
   * Read preserved community books, solutions & notes left behind by deleted accounts
   */
  static async getPreservedCommunityFiles(): Promise<UserUploadedFileRecord[]> {
    try {
      const raw = await StorageService.getRawItem(PRESERVED_COMMUNITY_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  /**
   * Step 1 of Permanent Account Deletion:
   * Generate and dispatch a mandatory 6-digit verification code (valid for 15 minutes).
   */
  static async requestAccountDeletionCode(
    profile: UserProfile,
    preservePublicContributions: boolean = true
  ): Promise<PendingDeletionCode> {
    const safeUid = sanitizeId(profile.id);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const requestId = `delreq_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    let deliveryStatus: PendingDeletionCode['deliveryStatus'] = 'local_fallback';

    // Store deletion verification code in Supabase DB
    if (SupabaseService.client) {
      try {
        await SupabaseService.client.from('account_deletion_requests').insert({
          id: requestId,
          user_id: safeUid,
          verification_code: code,
          preserve_public_contributions: preservePublicContributions,
          expires_at: expiresAt,
        });
      } catch {
        // Offline-first fallback
      }
    }

    // Dispatch verification code email via Resend when user has an email
    if (profile.email && profile.email.includes('@')) {
      try {
        const res = await ResendEmailService.sendAccountDeletionCode(
          profile.email,
          code,
          profile.name || 'Scholar',
          preservePublicContributions
        );
        if (res.success && res.status === 'sent') {
          deliveryStatus = 'sent';
        } else if (res.status === 'simulated') {
          deliveryStatus = 'simulated';
        }
      } catch {
        deliveryStatus = 'local_fallback';
      }
    }

    const pending: PendingDeletionCode = {
      requestId,
      userId: safeUid,
      code,
      expiresAt,
      email: profile.email || '',
      deliveryStatus,
    };

    await StorageService.setRawItem(
      `${PENDING_DELETION_KEY_PREFIX}${safeUid}`,
      JSON.stringify(pending)
    );

    return pending;
  }

  /**
   * Step 2 of Permanent Account Deletion:
   * Strictly verifies the entered 6-digit code, optionally preserves uploaded Books/Solutions/Notes
   * for other Study Labs members, and permanently wipes ALL personal account data from B2, Supabase & Local Storage.
   */
  static async confirmPermanentAccountDeletion(params: {
    userId: string;
    enteredCode: string;
    preservePublicContributions: boolean;
  }): Promise<AccountDeletionOutcome> {
    const safeUid = sanitizeId(params.userId);
    const trimmedCode = params.enteredCode.trim();

    if (!trimmedCode || trimmedCode.length !== 6) {
      return {
        success: false,
        error: 'Please enter the exact 6-digit verification code to permanently delete your account.',
        wipedPersonalFilesCount: 0,
        preservedCommunityFilesCount: 0,
        supabaseDeleted: false,
      };
    }

    // 1. Validate stored deletion code & expiration
    const pendingRaw = await StorageService.getRawItem(`${PENDING_DELETION_KEY_PREFIX}${safeUid}`);
    if (!pendingRaw) {
      return {
        success: false,
        error: 'No active deletion code found. Please request a fresh verification code first.',
        wipedPersonalFilesCount: 0,
        preservedCommunityFilesCount: 0,
        supabaseDeleted: false,
      };
    }

    const pending = JSON.parse(pendingRaw) as PendingDeletionCode;
    if (new Date(pending.expiresAt).getTime() < Date.now()) {
      return {
        success: false,
        error: 'Verification code has expired. Please request a new deletion code.',
        wipedPersonalFilesCount: 0,
        preservedCommunityFilesCount: 0,
        supabaseDeleted: false,
      };
    }

    if (pending.code !== trimmedCode) {
      return {
        success: false,
        error: 'Incorrect verification code. Account deletion aborted for your safety.',
        wipedPersonalFilesCount: 0,
        preservedCommunityFilesCount: 0,
        supabaseDeleted: false,
      };
    }

    // 2. Partition user's uploaded files: preserve community books/solutions/notes vs wipe personal data
    const workspace = await this.getUserWorkspace(safeUid);
    const allFiles = workspace?.files || [];

    const toPreserve: UserUploadedFileRecord[] = params.preservePublicContributions
      ? allFiles
          .filter(
            (f) =>
              f.isPublicShared &&
              PRESERVABLE_COMMUNITY_CATEGORIES.includes(f.folderCategory)
          )
          .map((f) => ({
            ...f,
            userId: null,
            originalAuthorLabel: 'Study Labs Community Alumni',
            isPublicShared: true,
            isPreservedAfterDeletion: true,
            status: 'preserved_community',
            b2Path: `community/preserved/${f.folderCategory}/${f.fileName}`,
            supabasePath: `community/preserved/${f.folderCategory}/${f.fileName}`,
          }))
      : [];

    const preservedIds = new Set(toPreserve.map((f) => f.id));
    const wipedPersonalFilesCount = allFiles.filter((f) => !preservedIds.has(f.id)).length;

    // 3. Persist preserved contributions so other members can still access uploaded Books, Solutions & Notes
    if (toPreserve.length > 0) {
      const existingPreserved = await this.getPreservedCommunityFiles();
      const mergedPreserved = [...toPreserve, ...existingPreserved];
      await StorageService.setRawItem(PRESERVED_COMMUNITY_KEY, JSON.stringify(mergedPreserved));
    }

    // 4. Execute verified deletion on Supabase DB (RPC + session sign-out)
    let supabaseDeleted = false;
    if (SupabaseService.client) {
      try {
        const { error: rpcErr } = await SupabaseService.client.rpc(
          'execute_verified_account_deletion',
          {
            p_user_id: safeUid,
            p_verification_code: trimmedCode,
            p_preserve_contributions: params.preservePublicContributions,
          }
        );
        if (!rpcErr) {
          supabaseDeleted = true;
        }
        await SupabaseService.signOut();
      } catch {
        // Proceed with local wipe so the device is never left holding deleted user data
      }
    }

    // 5. Purge user's personal Backblaze B2 folder prefix
    const b2Purge = await CloudStorageService.purgeUserStorageFolder(
      safeUid,
      Array.from(preservedIds)
    );

    // 6. Permanently wipe ALL personal local data (keeping preserved community archive intact!)
    await StorageService.setRawItem(`${WORKSPACE_STORAGE_KEY_PREFIX}${safeUid}`, '');
    await StorageService.setRawItem(`${PENDING_DELETION_KEY_PREFIX}${safeUid}`, '');
    await StorageService.resetToCleanStart();

    return {
      success: true,
      wipedPersonalFilesCount,
      preservedCommunityFilesCount: toPreserve.length,
      purgedB2Prefix: b2Purge.purgedFolderPrefix,
      supabaseDeleted,
    };
  }
}
