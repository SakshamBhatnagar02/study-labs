/**
 * Study Labs — Disposable / Temporary Email Detection Engine
 * Integrates Abstract API Email Reputation (https://docs.abstractapi.com/api/email-reputation)
 * with popular domain whitelisting (Gmail, Outlook, Yahoo, iCloud, Proton) and
 * local blacklists for instantaneous zero-latency spam protection.
 */

import type { TempMailCheckResult } from '../types';

/**
 * Whitelist of popular legitimate providers and educational/academic domains.
 * Emails from these domains bypass external API calls entirely for instant response
 * and maximum quota conservation.
 */
export const WHITELISTED_POPULAR_DOMAINS: ReadonlySet<string> = new Set([
  'gmail.com',
  'googlemail.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'msn.com',
  'yahoo.com',
  'yahoo.co.in',
  'yahoo.co.uk',
  'ymail.com',
  'rocketmail.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'proton.me',
  'protonmail.com',
  'aol.com',
  'zoho.com',
  'zoho.in',
  'study.io',
  'studylabs.io',
]);

/**
 * High-frequency disposable / temporary burner email domains
 */
export const POPULAR_DISPOSABLE_DOMAINS: ReadonlySet<string> = new Set([
  '10minutemail.com',
  '10minutemail.net',
  '10minmail.com',
  '20minutemail.com',
  'tempmail.com',
  'tempmail.net',
  'temp-mail.org',
  'temp-mail.ru',
  'mailinator.com',
  'mailinator2.com',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamailblock.com',
  'sharklasers.com',
  'grr.la',
  'throwawaymail.com',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'trashmail.com',
  'trashmail.net',
  'trashmail.me',
  'dispostable.com',
  'getairmail.com',
  'fakemailgenerator.com',
  'inboxkitten.com',
  'burnermail.io',
  'mohmal.com',
  'crazymailing.com',
  'nada.ltd',
  'getnada.com',
  'abacusmail.net',
  'maildrop.cc',
  'harakirimail.com',
  'generator.email',
  'mytemp.email',
  'tempail.com',
  'tempinbox.com',
  'emailondeck.com',
  'fakemail.net',
  'fakeinbox.com',
  'dropmail.me',
  'binkmail.com',
  'safetymail.info',
  'meltmail.com',
  'spambog.com',
  'spam4.me',
  'disposablemail.com',
  'discard.email',
  'discardmail.com',
  'tempemail.co',
  'temporarymail.com',
  'trashymail.com',
  'jetable.org',
  'anonymbox.com',
  'byom.de',
  'trash-mail.com',
  'minuteinbox.com',
  'mytempemail.com',
  'mytrashmail.com',
  'nowmymail.com',
  'onewaymail.com',
  'owlpic.com',
  'quickinbox.com',
  'rcpt.at',
  'receivemail.net',
  'sogetthis.com',
  'spambox.us',
  'spamfree24.org',
  'spamgourmet.com',
  'suremail.info',
  'tafmail.com',
  'teleworm.us',
  'tempm.com',
  'trbvm.com',
  'wegwerfmail.de',
  'wegwerfmail.net',
  'whyspam.me',
  'yomail.info',
  'zoemail.org',
]);

/**
 * Validate RFC 5322 compatible email format
 */
export function validateEmailFormat(rawEmail: string): {
  isValid: boolean;
  normalizedEmail: string;
  domain: string;
  error?: string;
} {
  const trimmed = (rawEmail || '').trim().toLowerCase();
  if (!trimmed) {
    return { isValid: false, normalizedEmail: '', domain: '', error: 'Email cannot be empty.' };
  }

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, normalizedEmail: trimmed, domain: '', error: 'Please enter a valid email address.' };
  }

  const parts = trimmed.split('@');
  const domain = parts[1] || '';

  return { isValid: true, normalizedEmail: trimmed, domain };
}

export function getEmailDomain(email: string): string {
  const { domain } = validateEmailFormat(email);
  return domain || '';
}

/**
 * Check if a domain qualifies under educational / university TLDs
 */
export function isEducationalDomain(domain: string): boolean {
  if (!domain) return false;
  return (
    domain.endsWith('.edu') ||
    domain.endsWith('.ac.in') ||
    domain.endsWith('.edu.in') ||
    domain.endsWith('.ac.uk') ||
    domain.endsWith('.res.in') ||
    domain.endsWith('.gov.in')
  );
}

/**
 * Check if domain is in the popular trusted whitelist
 */
export function isWhitelistedDomain(domain: string): boolean {
  if (!domain) return false;
  return WHITELISTED_POPULAR_DOMAINS.has(domain) || isEducationalDomain(domain);
}

/**
 * Evaluate if an email belongs to a known temporary/disposable domain (Synchronous Local Check)
 */
export function isDisposableEmail(email: string): TempMailCheckResult {
  const { isValid, domain, error } = validateEmailFormat(email);
  if (!isValid || !domain) {
    return {
      isDisposable: false,
      domain: domain || 'unknown',
      reason: error || 'Invalid email syntax',
      providerType: 'custom',
    };
  }

  // 1. Whitelist fast-path
  if (isWhitelistedDomain(domain)) {
    return {
      isDisposable: false,
      domain,
      isWhitelisted: true,
      providerType: 'legitimate',
    };
  }

  // 2. Local blacklist check
  if (POPULAR_DISPOSABLE_DOMAINS.has(domain)) {
    return {
      isDisposable: true,
      domain,
      reason: `The domain "${domain}" is a known disposable/temporary email provider. Please use a permanent email.`,
      providerType: 'disposable',
    };
  }

  return {
    isDisposable: false,
    domain,
    providerType: 'custom',
  };
}

/**
 * Abstract API Email Reputation live verification hook
 * Queries https://emailreputation.abstractapi.com/v1/ with fallback
 */
export async function checkTempMailApi(
  email: string,
  customApiKey?: string
): Promise<TempMailCheckResult> {
  const localCheck = isDisposableEmail(email);

  // If already identified as disposable locally, return immediately
  if (localCheck.isDisposable) return localCheck;

  // If domain is whitelisted (Gmail, Outlook, Yahoo, iCloud, Edu, etc.), skip external API call
  if (localCheck.isWhitelisted) {
    return localCheck;
  }

  const apiKey =
    customApiKey ||
    process.env.EXPO_PUBLIC_ABSTRACT_EMAIL_API_KEY ||
    process.env.ABSTRACT_EMAIL_API_KEY ||
    '';

  if (!apiKey) {
    return localCheck;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const url = `https://emailreputation.abstractapi.com/v1/?api_key=${apiKey}&email=${encodeURIComponent(email)}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[AbstractAPI] Returned HTTP status ${res.status}`);
      return localCheck;
    }

    const data = await res.json();

    const isDisposable = Boolean(
      data?.email_quality?.is_disposable ||
      data?.is_disposable_email?.value ||
      data?.disposable ||
      data?.is_disposable
    );

    const isHighRisk = data?.email_risk?.domain_risk_status === 'high';
    const isUndeliverable = data?.email_deliverability?.status === 'undeliverable';
    const totalBreaches = data?.email_breaches?.total_breaches || 0;
    const qualityScore = typeof data?.email_quality?.score === 'number' ? data.email_quality.score : undefined;

    const flagged = isDisposable || isHighRisk || isUndeliverable;

    let reason: string | undefined;
    if (isDisposable) {
      reason = `Flagged as temporary/disposable email by Abstract Email Reputation API.`;
    } else if (isHighRisk) {
      reason = `The domain associated with this email has been rated high-risk.`;
    } else if (isUndeliverable) {
      reason = `Email deliverability check failed (inbox does not exist).`;
    }

    return {
      isDisposable: flagged,
      domain: localCheck.domain,
      reason,
      providerType: flagged ? 'disposable' : 'legitimate',
      qualityScore,
      breachCount: totalBreaches,
      deliverability: data?.email_deliverability?.status,
    };
  } catch (err: any) {
    console.warn('[AbstractAPI] Check failed or timed out, falling back to local verification:', err?.message);
    return localCheck;
  }
}
