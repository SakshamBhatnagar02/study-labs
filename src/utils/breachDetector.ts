/**
 * Study Labs — Data Breach & Compromised Password Detector
 * Evaluates password entropy, detects common dictionary leaks & breached sequences,
 * and provides extensible HIBP (HaveIBeenPwned) k-anonymity API hook.
 */

import type { PasswordBreachResult } from '../types';

export const COMMON_BREACHED_PASSWORDS: ReadonlySet<string> = new Set([
  '123456',
  'password',
  '12345678',
  'qwerty',
  '123456789',
  '12345',
  '1234',
  '111111',
  '1234567',
  'dragon',
  'welcome',
  'ninja',
  'admin',
  'admin123',
  'root',
  'toor',
  'studylabs',
  'student',
  'student123',
  'school123',
  'college',
  'pass1234',
  'iloveyou',
  'monkey',
  'football',
  'letmein',
  'trustno1',
  'sunshine',
  'master',
  'charlie',
  'computer',
  'baseball',
  'superman',
  'qwertyuiop',
  '000000',
  '123123',
  '654321',
  'password123',
  'welcome123',
]);

/**
 * Local heuristic breach risk assessment
 */
export function evaluatePasswordBreachRisk(password: string): PasswordBreachResult {
  const clean = password || '';

  if (!clean) {
    return {
      isCompromised: false,
      riskLevel: 'safe',
      feedback: 'Enter a strong, unique password.',
    };
  }

  const lower = clean.toLowerCase();

  // 1. Direct match with top leaked passwords
  if (COMMON_BREACHED_PASSWORDS.has(lower)) {
    return {
      isCompromised: true,
      riskLevel: 'critical',
      compromisedCount: 2500000,
      feedback: 'This password appears in prominent public breach datasets. Attackers will crack this instantly. Please choose a unique passphrase.',
    };
  }

  // 2. Length check
  if (clean.length < 6) {
    return {
      isCompromised: true,
      riskLevel: 'critical',
      feedback: 'Password is too short (min 8 characters recommended). Easily vulnerable to brute-force attacks.',
    };
  }

  // 3. Repeated character heuristic (e.g. 'aaaaaa', '111111')
  if (/^(.)\1+$/.test(clean)) {
    return {
      isCompromised: true,
      riskLevel: 'critical',
      feedback: 'Password consists of a single repeating character. Vulnerable to dictionary attacks.',
    };
  }

  // 4. Sequential numbers or letters
  if (/(12345|23456|34567|45678|56789|abcde|bcdef|cdefg)/i.test(clean)) {
    return {
      isCompromised: false,
      riskLevel: 'medium',
      feedback: 'Contains easily predictable sequential characters. Add symbols or numbers.',
    };
  }

  // 5. Complexity check
  const hasUpper = /[A-Z]/.test(clean);
  const hasLower = /[a-z]/.test(clean);
  const hasDigit = /[0-9]/.test(clean);
  const hasSpecial = /[^A-Za-z0-9]/.test(clean);

  const diversityScore = [hasUpper, hasLower, hasDigit, hasSpecial].filter(Boolean).length;

  if (clean.length >= 10 && diversityScore >= 3) {
    return {
      isCompromised: false,
      riskLevel: 'safe',
      feedback: 'Strong password! Mix of letters, numbers, and symbols.',
    };
  }

  if (clean.length >= 8 && diversityScore >= 2) {
    return {
      isCompromised: false,
      riskLevel: 'low',
      feedback: 'Moderate strength. Consider adding symbols or capital letters.',
    };
  }

  return {
    isCompromised: false,
    riskLevel: 'medium',
    feedback: 'Weak password. Use at least 8 characters with letters, numbers and symbols.',
  };
}

/**
 * Extensible API hook for HaveIBeenPwned k-anonymity breach check (SHA-1 prefix)
 */
export async function checkPasswordBreachApi(
  password: string,
  apiUrl = 'https://api.pwnedpasswords.com/range/'
): Promise<PasswordBreachResult> {
  const local = evaluatePasswordBreachRisk(password);
  if (local.riskLevel === 'critical') return local;

  // Modern browsers / Web crypto SHA-1 k-anonymity check
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const enc = new TextEncoder().encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-1', enc);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();

      const prefix = hashHex.substring(0, 5);
      const suffix = hashHex.substring(5);

      const res = await fetch(`${apiUrl}${prefix}`, {
        headers: { 'Add-Padding': 'true' },
      });
      if (res.ok) {
        const text = await res.text();
        const lines = text.split('\n');
        for (const line of lines) {
          const [hashPart, countStr] = line.trim().split(':');
          if (hashPart === suffix) {
            const count = parseInt(countStr || '0', 10);
            return {
              isCompromised: true,
              riskLevel: 'critical',
              compromisedCount: count,
              feedback: `Warning: This exact password has been observed ${count.toLocaleString()} times in global data breaches. Choose a different password.`,
            };
          }
        }
      }
    } catch {
      // Fallback to local heuristic if network or crypto is unavailable
      return local;
    }
  }

  return local;
}

