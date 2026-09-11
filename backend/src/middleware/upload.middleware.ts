import multer from 'multer';
import path from 'path';
import { Request, Response, NextFunction } from 'express';

const ALLOWED_DOCUMENT_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

const ALLOWED_VOICE_MIMES = [
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
  'audio/mpeg',
  'audio/mp3',
  'audio/webm',
  'audio/ogg',
  'audio/m4a',
  'audio/mp4',
  'application/octet-stream', // Webm/wav audio recorded in browsers
];

const ALLOWED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.pdf',
  '.wav',
  '.mp3',
  '.webm',
  '.ogg',
  '.m4a',
];

const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const rawMime = file.mimetype.toLowerCase();
  const cleanMime = rawMime.split(';')[0].trim();

  const isAllowedExt = !ext || ALLOWED_EXTENSIONS.includes(ext);
  const isAllowedMime =
    ALLOWED_DOCUMENT_MIMES.includes(cleanMime) ||
    ALLOWED_VOICE_MIMES.includes(cleanMime) ||
    cleanMime.startsWith('audio/');

  if (!isAllowedExt && !isAllowedMime) {
    return cb(
      new Error(
        `Invalid file type '${file.mimetype}' (${ext}). Only prescription/report images (JPG, PNG, WEBP), PDFs, and voice recordings (WAV, MP3, WEBM, OGG, M4A) are allowed.`
      )
    );
  }

  cb(null, true);
};

export const uploadSingleFile = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB max limit
  },
}).single('file');

export const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      error: { message: `File upload error: ${err.message}` },
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      error: { message: err.message },
    });
  }
  next();
};
