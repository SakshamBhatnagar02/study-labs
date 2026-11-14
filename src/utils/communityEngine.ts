/**
 * Study Labs — Community Engine
 * Manages Community Doubts, Q&A Voting, Verified Answers, and Resource Uploads with offline-first persistence.
 */

import { StorageService } from '../services/storage';
import { SEED_COMMUNITY_QUESTIONS, SEED_COMMUNITY_RESOURCES } from '../data/communitySeedData';
import type {
  CommunityAnswer,
  CommunityQuestion,
  CommunityResource,
  CommunityResourceStatus,
} from '../types';

const STORAGE_KEY_QUESTIONS = '@study_labs_community_questions_v1';
const STORAGE_KEY_RESOURCES = '@study_labs_community_resources_v1';

export class CommunityEngine {
  static async getQuestions(): Promise<CommunityQuestion[]> {
    try {
      const raw = await StorageService.getRawItem(STORAGE_KEY_QUESTIONS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return SEED_COMMUNITY_QUESTIONS;
  }

  static async saveQuestions(questions: CommunityQuestion[]): Promise<void> {
    await StorageService.setRawItem(STORAGE_KEY_QUESTIONS, JSON.stringify(questions));
  }

  static async getResources(): Promise<CommunityResource[]> {
    try {
      const raw = await StorageService.getRawItem(STORAGE_KEY_RESOURCES);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return SEED_COMMUNITY_RESOURCES;
  }

  static async saveResources(resources: CommunityResource[]): Promise<void> {
    await StorageService.setRawItem(STORAGE_KEY_RESOURCES, JSON.stringify(resources));
  }

  static async addQuestion(payload: {
    title: string;
    content: string;
    subject: CommunityQuestion['subject'];
    gradeLevel: string;
    tags: string[];
    bountyXp: number;
    authorId: string;
    authorName: string;
    authorAvatarColor?: string;
  }): Promise<CommunityQuestion> {
    const list = await this.getQuestions();
    const newQ: CommunityQuestion = {
      id: `cq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: payload.title.trim(),
      content: payload.content.trim(),
      subject: payload.subject,
      gradeLevel: payload.gradeLevel,
      tags: payload.tags,
      bountyXp: payload.bountyXp || 25,
      authorId: payload.authorId,
      authorName: payload.authorName,
      authorAvatarColor: payload.authorAvatarColor || '#F97316',
      createdAt: new Date().toISOString(),
      upvotesCount: 0,
      downvotesCount: 0,
      userVote: null,
      isResolved: false,
      answers: [],
    };

    const updated = [newQ, ...list];
    await this.saveQuestions(updated);
    return newQ;
  }

  static async addAnswer(
    questionId: string,
    payload: {
      content: string;
      authorId: string;
      authorName: string;
      authorRole: string;
      authorAvatarColor?: string;
    }
  ): Promise<CommunityAnswer | null> {
    const list = await this.getQuestions();
    const idx = list.findIndex((q) => q.id === questionId);
    if (idx === -1) return null;

    const newAns: CommunityAnswer = {
      id: `ans_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      questionId,
      content: payload.content.trim(),
      authorId: payload.authorId,
      authorName: payload.authorName,
      authorRole: payload.authorRole,
      authorAvatarColor: payload.authorAvatarColor || '#22D3EE',
      upvotesCount: 0,
      downvotesCount: 0,
      userVote: null,
      isVerified: false,
      createdAt: new Date().toISOString(),
    };

    list[idx].answers = [newAns, ...list[idx].answers];
    await this.saveQuestions(list);
    return newAns;
  }

  static async voteQuestion(
    questionId: string,
    type: 'up' | 'down'
  ): Promise<CommunityQuestion | null> {
    const list = await this.getQuestions();
    const q = list.find((item) => item.id === questionId);
    if (!q) return null;

    if (q.userVote === type) {
      // Toggle off
      if (type === 'up') q.upvotesCount = Math.max(0, q.upvotesCount - 1);
      if (type === 'down') q.downvotesCount = Math.max(0, q.downvotesCount - 1);
      q.userVote = null;
    } else {
      if (q.userVote === 'up') q.upvotesCount = Math.max(0, q.upvotesCount - 1);
      if (q.userVote === 'down') q.downvotesCount = Math.max(0, q.downvotesCount - 1);

      if (type === 'up') q.upvotesCount += 1;
      if (type === 'down') q.downvotesCount += 1;
      q.userVote = type;
    }

    await this.saveQuestions(list);
    return q;
  }

  static async voteAnswer(
    questionId: string,
    answerId: string,
    type: 'up' | 'down'
  ): Promise<CommunityAnswer | null> {
    const list = await this.getQuestions();
    const q = list.find((item) => item.id === questionId);
    if (!q) return null;

    const ans = q.answers.find((a) => a.id === answerId);
    if (!ans) return null;

    if (ans.userVote === type) {
      if (type === 'up') ans.upvotesCount = Math.max(0, ans.upvotesCount - 1);
      if (type === 'down') ans.downvotesCount = Math.max(0, ans.downvotesCount - 1);
      ans.userVote = null;
    } else {
      if (ans.userVote === 'up') ans.upvotesCount = Math.max(0, ans.upvotesCount - 1);
      if (ans.userVote === 'down') ans.downvotesCount = Math.max(0, ans.downvotesCount - 1);

      if (type === 'up') ans.upvotesCount += 1;
      if (type === 'down') ans.downvotesCount += 1;
      ans.userVote = type;
    }

    await this.saveQuestions(list);
    return ans;
  }

  static async toggleVerifyAnswer(questionId: string, answerId: string): Promise<boolean> {
    const list = await this.getQuestions();
    const q = list.find((item) => item.id === questionId);
    if (!q) return false;

    const ans = q.answers.find((a) => a.id === answerId);
    if (!ans) return false;

    const nextState = !ans.isVerified;
    ans.isVerified = nextState;
    if (nextState) {
      q.isResolved = true;
      q.verifiedAnswerId = answerId;
    } else if (q.verifiedAnswerId === answerId) {
      q.verifiedAnswerId = undefined;
      q.isResolved = q.answers.some((a) => a.isVerified);
    }

    await this.saveQuestions(list);
    return true;
  }

  static async uploadResource(payload: {
    title: string;
    description: string;
    subject: CommunityResource['subject'];
    gradeLevel: string;
    format: CommunityResource['format'];
    tags: string[];
    authorId: string;
    authorName: string;
    authorRole: string;
    fileSizeFormatted?: string;
  }): Promise<CommunityResource> {
    const list = await this.getResources();
    const newRes: CommunityResource = {
      id: `cres_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: payload.title.trim(),
      description: payload.description.trim(),
      subject: payload.subject,
      gradeLevel: payload.gradeLevel,
      format: payload.format,
      tags: payload.tags,
      authorId: payload.authorId,
      authorName: payload.authorName,
      authorRole: payload.authorRole,
      status: 'pending', // Submits to Admin Moderation queue
      upvotesCount: 0,
      downloadsCount: 0,
      fileSizeFormatted: payload.fileSizeFormatted || '1.8 MB',
      createdAt: new Date().toISOString(),
      userVote: null,
    };

    const updated = [newRes, ...list];
    await this.saveResources(updated);
    return newRes;
  }

  static async voteResource(
    resourceId: string,
    type: 'up' | 'down'
  ): Promise<CommunityResource | null> {
    const list = await this.getResources();
    const res = list.find((item) => item.id === resourceId);
    if (!res) return null;

    if (res.userVote === type) {
      res.upvotesCount = Math.max(0, res.upvotesCount - 1);
      res.userVote = null;
    } else {
      res.upvotesCount += 1;
      res.userVote = type;
    }

    await this.saveResources(list);
    return res;
  }

  static async moderateResource(
    resourceId: string,
    action: 'approved' | 'rejected',
    moderationNote?: string
  ): Promise<boolean> {
    const list = await this.getResources();
    const res = list.find((item) => item.id === resourceId);
    if (!res) return false;

    res.status = action;
    res.moderationNote = moderationNote;
    await this.saveResources(list);
    return true;
  }
}

