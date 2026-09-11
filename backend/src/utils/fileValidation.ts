import { config } from '../config';

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'audio/wav',
  'audio/mp3',
  'audio/mpeg',
  'audio/x-wav',
  'audio/webm',
];

/**
 * Inspect file header magic bytes for strict format validation
 */
export function validateFileMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (!buffer || buffer.length < 4) return false;

  const hex = buffer.subarray(0, 12).toString('hex').toUpperCase();

  switch (mimeType.toLowerCase()) {
    case 'application/pdf':
      // PDF header %PDF- -> 25 50 44 46
      return hex.startsWith('25504446');

    case 'image/jpeg':
      // JPEG header -> FF D8 FF
      return hex.startsWith('FFD8FF');

    case 'image/png':
      // PNG header -> 89 50 4E 47 0D 0A 1A 0A
      return hex.startsWith('89504E47');

    case 'image/webp':
      // WEBP header -> RIFF....WEBP -> 52 49 46 46
      return hex.startsWith('52494646');

    case 'audio/wav':
    case 'audio/x-wav':
      // WAV header -> RIFF....WAVE -> 52 49 46 46
      return hex.startsWith('52494646');

    case 'audio/mp3':
    case 'audio/mpeg':
      // MP3 ID3 header or sync word -> 49 44 33 or FF FB / FF FA / FF F3
      return hex.startsWith('494433') || hex.startsWith('FFF') || hex.startsWith('FFE');

    case 'audio/webm':
      // WebM / EBML header -> 1A 45 DF A3
      return hex.startsWith('1A45DFA3');

    default:
      // Allow fallback if MIME type is recognized in allowed list
      return true;
  }
}

/**
 * Validates uploaded file against size, MIME type, and magic bytes
 */
export function validateUploadedFile(file: Express.Multer.File): FileValidationResult {
  if (!file) {
    return { isValid: false, error: 'No file uploaded.' };
  }

  // 1. Check File Size Limit
  const maxSize = config.maxSizeBytes || 10485760; // 10MB
  if (file.size > maxSize) {
    const sizeInMB = (maxSize / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `File size exceeds maximum allowed limit of ${sizeInMB} MB.`,
    };
  }

  // 2. Check Allowed MIME Type
  const cleanMime = file.mimetype.split(';')[0].trim().toLowerCase();
  const isAllowedMime = ALLOWED_MIME_TYPES.includes(cleanMime) || cleanMime.startsWith('audio/');
  if (!isAllowedMime) {
    return {
      isValid: false,
      error: `Unsupported MIME type '${file.mimetype}'. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
    };
  }

  // 3. Inspect File Signature (Magic Bytes)
  if (file.buffer && file.buffer.length >= 4) {
    const isValidBytes = validateFileMagicBytes(file.buffer, cleanMime);
    if (!isValidBytes) {
      return {
        isValid: false,
        error: `File header binary signature does not match claimed MIME type '${file.mimetype}'. Upload rejected.`,
      };
    }
  }

  return { isValid: true };
}
