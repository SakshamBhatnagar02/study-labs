import { unzipSync, strFromU8 } from 'fflate';
import type { AIAttachmentKind, AIUploadedAttachment } from '../types';

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let result = '';
  const len = bytes.length;
  for (let i = 0; i < len; i += 3) {
    const b1 = bytes[i];
    const b2 = i + 1 < len ? bytes[i + 1] : 0;
    const b3 = i + 2 < len ? bytes[i + 2] : 0;

    const enc1 = b1 >> 2;
    const enc2 = ((b1 & 3) << 4) | (b2 >> 4);
    const enc3 = ((b2 & 15) << 2) | (b3 >> 6);
    const enc4 = b3 & 63;

    result +=
      BASE64_CHARS.charAt(enc1) +
      BASE64_CHARS.charAt(enc2) +
      (i + 1 < len ? BASE64_CHARS.charAt(enc3) : '=') +
      (i + 2 < len ? BASE64_CHARS.charAt(enc4) : '=');
  }
  return result;
}

export function base64ToUint8Array(base64Input: string): Uint8Array {
  const clean = base64Input.replace(/^data:[^;]+;base64,/, '').replace(/[^A-Za-z0-9+/=]/g, '');
  const len = clean.length;
  if (len === 0) return new Uint8Array(0);

  let padding = 0;
  if (clean.endsWith('==')) padding = 2;
  else if (clean.endsWith('=')) padding = 1;

  const byteLen = Math.floor((len * 3) / 4) - padding;
  const bytes = new Uint8Array(byteLen);
  let byteIdx = 0;

  for (let i = 0; i < len; i += 4) {
    const c1 = BASE64_CHARS.indexOf(clean.charAt(i));
    const c2 = BASE64_CHARS.indexOf(clean.charAt(i + 1));
    const c3 = BASE64_CHARS.indexOf(clean.charAt(i + 2));
    const c4 = BASE64_CHARS.indexOf(clean.charAt(i + 3));

    const n = (c1 << 18) | (c2 << 12) | ((Math.max(0, c3)) << 6) | Math.max(0, c4);
    if (byteIdx < byteLen) bytes[byteIdx++] = (n >> 16) & 255;
    if (byteIdx < byteLen && c3 !== -1) bytes[byteIdx++] = (n >> 8) & 255;
    if (byteIdx < byteLen && c4 !== -1) bytes[byteIdx++] = n & 255;
  }

  return bytes;
}

export function decodeUtf8Bytes(bytes: Uint8Array): string {
  try {
    return strFromU8(bytes);
  } catch {
    let out = '';
    for (let i = 0; i < bytes.length; i++) {
      out += String.fromCharCode(bytes[i]);
    }
    return out;
  }
}

export function formatAttachmentSize(sizeBytes?: number): string {
  if (!sizeBytes || sizeBytes <= 0) return '';
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  if (sizeBytes < 1024 * 1024) return `${(sizeBytes / 1024).toFixed(1)} KB`;
  return `${(sizeBytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function classifyAttachmentKind(fileName: string, mimeType?: string): AIAttachmentKind {
  const lowerName = (fileName || '').toLowerCase();
  const lowerMime = (mimeType || '').toLowerCase();

  if (lowerMime.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp|heic)$/i.test(lowerName)) {
    return 'image';
  }
  if (lowerMime === 'application/pdf' || lowerName.endsWith('.pdf')) {
    return 'pdf';
  }
  if (
    lowerMime.includes('presentation') ||
    lowerMime.includes('powerpoint') ||
    /\.(pptx|ppt|odp)$/i.test(lowerName)
  ) {
    return 'ppt';
  }
  if (
    lowerMime.startsWith('text/') ||
    /\.(txt|md|markdown|csv|json|tex|latex|py|js|ts|tsx|jsx|html|xml|yaml|yml|log)$/i.test(lowerName)
  ) {
    return 'text';
  }
  return 'document';
}

function decodeXmlEntities(raw: string): string {
  return raw
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10) || 32));
}

/**
 * Extracts slide-by-slide readable text from `.pptx` archives using `fflate`.
 */
export function extractTextFromPptxBytes(bytes: Uint8Array, maxChars = 18000): string {
  try {
    const entries = unzipSync(bytes);
    const slideNames = Object.keys(entries)
      .filter((k) => /^ppt\/slides\/slide\d+\.xml$/i.test(k))
      .sort((a, b) => {
        const na = parseInt(a.match(/(\d+)/)?.[1] || '0', 10);
        const nb = parseInt(b.match(/(\d+)/)?.[1] || '0', 10);
        return na - nb;
      });

    if (slideNames.length === 0) return '';

    const chunks: string[] = [];
    for (const slideKey of slideNames) {
      const slideNum = slideKey.match(/(\d+)/)?.[1] || '?';
      const xml = strFromU8(entries[slideKey]);
      const texts: string[] = [];
      const regex = /<a:t[^>]*>([\s\S]*?)<\/a:t>/gi;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(xml)) !== null) {
        const cleaned = decodeXmlEntities(match[1]).replace(/\s+/g, ' ').trim();
        if (cleaned) texts.push(cleaned);
      }

      // Check matching speaker notes if present
      const notesKey = `ppt/notesSlides/notesSlide${slideNum}.xml`;
      if (entries[notesKey]) {
        const notesXml = strFromU8(entries[notesKey]);
        const notesTexts: string[] = [];
        const notesRegex = /<a:t[^>]*>([\s\S]*?)<\/a:t>/gi;
        let nm: RegExpExecArray | null;
        while ((nm = notesRegex.exec(notesXml)) !== null) {
          const cleaned = decodeXmlEntities(nm[1]).replace(/\s+/g, ' ').trim();
          if (cleaned && cleaned !== slideNum) notesTexts.push(cleaned);
        }
        if (notesTexts.length > 0) {
          texts.push(`[Speaker Notes]: ${notesTexts.join(' ')}`);
        }
      }

      if (texts.length > 0) {
        chunks.push(`Slide ${slideNum}: ${texts.join(' · ')}`);
      }
      if (chunks.join('\n').length >= maxChars) break;
    }

    return chunks.join('\n\n').slice(0, maxChars);
  } catch {
    return '';
  }
}

/**
 * Extracts readable paragraph text from `.docx` archives using `fflate`.
 */
export function extractTextFromDocxBytes(bytes: Uint8Array, maxChars = 18000): string {
  try {
    const entries = unzipSync(bytes);
    const docEntry = entries['word/document.xml'];
    if (!docEntry) return '';
    const xml = strFromU8(docEntry);
    const paragraphs = xml.split(/<\/w:p>/i);
    const lines: string[] = [];

    for (const p of paragraphs) {
      const texts: string[] = [];
      const regex = /<w:t[^>]*>([\s\S]*?)<\/w:t>/gi;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(p)) !== null) {
        texts.push(decodeXmlEntities(match[1]));
      }
      const line = texts.join('').replace(/\s+/g, ' ').trim();
      if (line) lines.push(line);
      if (lines.join('\n').length >= maxChars) break;
    }
    return lines.join('\n').slice(0, maxChars);
  } catch {
    return '';
  }
}

function readWebBlobAsBytes(blob: Blob): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    if (typeof blob.arrayBuffer === 'function') {
      blob
        .arrayBuffer()
        .then((buf) => resolve(new Uint8Array(buf)))
        .catch(reject);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result;
      if (res instanceof ArrayBuffer) {
        resolve(new Uint8Array(res));
      } else {
        resolve(new Uint8Array(0));
      }
    };
    reader.onerror = () => reject(reader.error || new Error('Failed to read file'));
    reader.readAsArrayBuffer(blob);
  });
}

async function readAssetBytes(input: {
  uri?: string;
  base64?: string;
  webFile?: Blob;
}): Promise<Uint8Array | null> {
  if (input.base64) {
    return base64ToUint8Array(input.base64);
  }
  if (input.webFile) {
    try {
      return await readWebBlobAsBytes(input.webFile);
    } catch {
      return null;
    }
  }
  if (!input.uri) return null;

  if (input.uri.startsWith('data:')) {
    const commaIdx = input.uri.indexOf(',');
    if (commaIdx > -1) {
      return base64ToUint8Array(input.uri.slice(commaIdx + 1));
    }
  }

  // Try fetch() first (handles Web blob:/http:/data: URIs as well as many RN URIs)
  try {
    const res = await fetch(input.uri);
    if (res.ok) {
      const buf = await res.arrayBuffer();
      return new Uint8Array(buf);
    }
  } catch {
    // Fallback to native expo-file-system File reader
  }

  try {
    const fsMod = await import('expo-file-system');
    if (fsMod?.File) {
      const nativeFile = new fsMod.File(input.uri);
      const bytes = await nativeFile.bytes();
      return bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    }
  } catch {
    // Non-fatal fallback
  }

  return null;
}

export interface RawAttachmentInput {
  name: string;
  mimeType?: string;
  uri?: string;
  base64?: string;
  sizeBytes?: number;
  webFile?: Blob;
}

export async function prepareAIUploadedAttachment(
  raw: RawAttachmentInput
): Promise<AIUploadedAttachment> {
  const safeName = raw.name || `upload_${Date.now()}`;
  const kind = classifyAttachmentKind(safeName, raw.mimeType);
  const defaultMime =
    raw.mimeType ||
    (kind === 'image'
      ? 'image/jpeg'
      : kind === 'pdf'
      ? 'application/pdf'
      : kind === 'ppt'
      ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      : 'text/plain');

  const bytes = await readAssetBytes(raw);
  const sizeBytes = raw.sizeBytes ?? bytes?.length;

  let cleanBase64: string | undefined = raw.base64
    ? raw.base64.replace(/^data:[^;]+;base64,/, '')
    : undefined;
  let extractedText: string | undefined;
  let summaryHint = `${kind.toUpperCase()}${sizeBytes ? ` · ${formatAttachmentSize(sizeBytes)}` : ''}`;

  if (kind === 'image' || kind === 'pdf') {
    if (!cleanBase64 && bytes && bytes.length > 0) {
      cleanBase64 = uint8ArrayToBase64(bytes);
    }
    if (kind === 'pdf') {
      summaryHint = `PDF Document${sizeBytes ? ` · ${formatAttachmentSize(sizeBytes)}` : ''}`;
    } else {
      summaryHint = `Image${sizeBytes ? ` · ${formatAttachmentSize(sizeBytes)}` : ''}`;
    }
  } else if (kind === 'ppt') {
    if (bytes && bytes.length > 0) {
      extractedText = extractTextFromPptxBytes(bytes);
    }
    if (!extractedText) {
      extractedText =
        `Presentation file "${safeName}" attached. ` +
        (safeName.toLowerCase().endsWith('.ppt')
          ? 'Note: Legacy binary .ppt detected; key topics requested for outline & review.'
          : 'No selectable slide text found (slides may contain embedded images).');
    } else {
      const slideCount = (extractedText.match(/^Slide \d+:/gm) || []).length;
      summaryHint = `${slideCount || 1} Slides Extracted`;
    }
  } else if (safeName.toLowerCase().endsWith('.docx')) {
    if (bytes && bytes.length > 0) {
      extractedText = extractTextFromDocxBytes(bytes);
      summaryHint = 'DOCX Extracted';
    }
  } else {
    // Text, Markdown, CSV, JSON, Code, TeX, etc.
    if (bytes && bytes.length > 0) {
      extractedText = decodeUtf8Bytes(bytes).slice(0, 20000);
      const lineCount = extractedText.split(/\r?\n/).length;
      summaryHint = `${lineCount} lines`;
    } else if (raw.webFile && typeof raw.webFile.text === 'function') {
      extractedText = (await raw.webFile.text()).slice(0, 20000);
    }
  }

  return {
    id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: safeName,
    mimeType: defaultMime,
    kind,
    sizeBytes,
    base64: cleanBase64,
    extractedText,
    uri: raw.uri,
    summaryHint,
  };
}
