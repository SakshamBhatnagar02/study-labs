import type { AppErrorInfo, AppErrorSource } from '../types';

function redactSensitiveTokens(raw: string): string {
  return (raw || '')
    .replace(/AIza[0-9A-Za-z_-]{20,}/g, '[REDACTED_KEY]')
    .replace(/AQ\.[0-9A-Za-z._-]{12,}/g, '[REDACTED_KEY]')
    .replace(/eyJ[0-9A-Za-z_-]+\.[0-9A-Za-z_-]+\.[0-9A-Za-z_-]*/g, '[REDACTED_JWT]')
    .replace(/(x-goog-api-key|apikey|authorization|\bkey)\s*[:=]\s*[^\s&,;]+/gi, '$1: [REDACTED]')
    .trim();
}

export function extractHttpCode(message: string): string | number | undefined {
  const httpMatch = message.match(/\b(?:HTTP|status)\s*[:=]?\s*(\d{3})\b/i);
  if (httpMatch) return Number(httpMatch[1]);
  const pgrstMatch = message.match(/\b(PGRST\d{3,4})\b/i);
  if (pgrstMatch) return pgrstMatch[1].toUpperCase();
  return undefined;
}

export interface BuildApiErrorOptions {
  code?: string | number;
  canRetry?: boolean;
  canUseOffline?: boolean;
  contextLabel?: string;
}

export function buildApiErrorInfo(
  source: AppErrorSource,
  err: unknown,
  optionsOrLabel?: string | BuildApiErrorOptions
): AppErrorInfo {
  const opts: BuildApiErrorOptions =
    typeof optionsOrLabel === 'string'
      ? { contextLabel: optionsOrLabel }
      : optionsOrLabel || {};
  const contextLabel = opts.contextLabel;

  const rawMessage =
    typeof err === 'string'
      ? err
      : err && typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string'
      ? (err as any).message
      : String(err || 'Unknown error');

  const safeRaw = redactSensitiveTokens(rawMessage).slice(0, 600);
  const lower = safeRaw.toLowerCase();
  const explicitCode =
    opts.code !== undefined
      ? opts.code
      : err && typeof err === 'object' && 'code' in err && (err as any).code
      ? String((err as any).code)
      : extractHttpCode(safeRaw);

  const stamp = new Date().toISOString();
  const id = `err_${source}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

  const finalize = (info: AppErrorInfo): AppErrorInfo => ({
    ...info,
    code: opts.code !== undefined ? opts.code : info.code,
    canRetry: opts.canRetry !== undefined ? opts.canRetry : info.canRetry,
    canUseOffline:
      opts.canUseOffline !== undefined ? opts.canUseOffline : info.canUseOffline,
  });

  if (source === 'quota') {
    return finalize({
      id,
      source,
      code: explicitCode || 'QUOTA_LIMIT',
      title: 'Storage Quota Reached',
      message: safeRaw || 'Your Free Plan image storage limit has been reached.',
      suggestion: 'Delete older visuals from your Image Library or inspect your storage plan to free space.',
      rawError: safeRaw,
      timestamp: stamp,
      canRetry: false,
      canUseOffline: false,
    });
  }

  if (lower.includes('api key') || lower.includes('not configured') || lower.includes('missing key')) {
    return finalize({
      id,
      source,
      code: explicitCode || 'NO_API_KEY',
      title: source === 'supabase' ? 'Cloud Database Not Configured' : 'AI API Key Missing',
      message:
        source === 'supabase'
          ? 'Supabase URL or anonymous key is not configured in environment variables.'
          : 'Gemini API key is missing or placeholder-configured.',
      suggestion:
        source === 'supabase'
          ? 'Using local persistent storage safely. Configure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to enable cloud sync.'
          : 'Using Study Labs offline solver & diagram engine. Configure EXPO_PUBLIC_GEMINI_API_KEY in .env for live cloud AI.',
      rawError: safeRaw,
      timestamp: stamp,
      canRetry: true,
      canUseOffline: true,
    });
  }

  if (explicitCode === 429 || lower.includes('429') || lower.includes('quota') || lower.includes('rate limit')) {
    return finalize({
      id,
      source,
      code: 429,
      title: 'Rate Limit Reached (HTTP 429)',
      message: `${contextLabel ? `${contextLabel}: ` : ''}The live AI service is temporarily throttled due to request rate limits.`,
      suggestion: 'Wait a few seconds and tap Try Again, switch to Flash Lite, or continue with the Offline STEM Engine.',
      rawError: safeRaw,
      timestamp: stamp,
      canRetry: true,
      canUseOffline: true,
    });
  }

  if (
    explicitCode === 404 ||
    explicitCode === 'PGRST205' ||
    lower.includes('404') ||
    lower.includes('not found') ||
    lower.includes('does not exist') ||
    lower.includes('could not find the table')
  ) {
    return finalize({
      id,
      source,
      code: explicitCode || 404,
      title:
        source === 'supabase'
          ? 'Cloud Resource / Table Not Found (404)'
          : source === 'gemini_image'
          ? 'Image Model Endpoint Unavailable (404)'
          : 'Requested Resource Not Found (404)',
      message:
        source === 'supabase'
          ? 'The Supabase table (e.g. questions) does not exist yet or was not exposed to the REST API.'
          : `${contextLabel ? `${contextLabel}: ` : ''}The remote API endpoint or model identifier returned 404 Not Found.`,
      suggestion:
        source === 'supabase'
          ? 'Run supabase/schema.sql in your Supabase SQL Editor, or continue seamlessly using the built-in offline bank.'
          : 'Retry with Flash/Standard model or use the offline STEM solver & vector diagram engine.',
      rawError: safeRaw,
      timestamp: stamp,
      canRetry: true,
      canUseOffline: true,
    });
  }

  if (explicitCode === 401 || explicitCode === 403 || lower.includes('401') || lower.includes('403') || lower.includes('permission')) {
    return finalize({
      id,
      source,
      code: explicitCode || 403,
      title: 'Authentication or Permission Rejected',
      message: `${contextLabel ? `${contextLabel}: ` : ''}The API rejected the request due to invalid credentials or billing/project restrictions.`,
      suggestion: 'Verify your API key permissions in Google AI Studio / Supabase dashboard, or continue in Offline Mode.',
      rawError: safeRaw,
      timestamp: stamp,
      canRetry: true,
      canUseOffline: true,
    });
  }

  if (
    lower.includes('failed to fetch') ||
    lower.includes('network') ||
    lower.includes('abort') ||
    lower.includes('timeout') ||
    lower.includes('offline') ||
    lower.includes('enotfound')
  ) {
    return finalize({
      id,
      source,
      code: explicitCode || 'NETWORK_OFFLINE',
      title: 'Network Connection Unavailable',
      message: `${contextLabel ? `${contextLabel}: ` : ''}Could not reach the remote server. Check internet connectivity or firewall rules.`,
      suggestion: 'Tap Try Again once online, or keep working smoothly in Study Labs Offline Mode.',
      rawError: safeRaw,
      timestamp: stamp,
      canRetry: true,
      canUseOffline: true,
    });
  }

  return finalize({
    id,
    source,
    code: explicitCode || 'API_ERROR',
    title: `${contextLabel || 'Service'} Request Failed`,
    message: safeRaw || 'The upstream request returned an unexpected response.',
    suggestion: 'Review the diagnostic details, clone the error to inspect/report, or retry now.',
    rawError: safeRaw,
    timestamp: stamp,
    canRetry: true,
    canUseOffline: source !== 'attachment',
  });
}

export function formatErrorCloneText(err: AppErrorInfo): string {
  return [
    '=== Study Labs Diagnostic Error Clone ===',
    `Error ID: ${err.id}`,
    `Source: ${err.source.toUpperCase()}`,
    `Code: ${err.code ?? 'N/A'}`,
    `Timestamp: ${err.timestamp}`,
    `Title: ${err.title}`,
    `Details: ${err.message}`,
    `Suggested Fix: ${err.suggestion}`,
    `Raw Trace: ${err.rawError || '(none)'}`,
    '=======================================',
  ].join('\n');
}
