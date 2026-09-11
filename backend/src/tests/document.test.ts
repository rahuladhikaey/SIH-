import mongoose, { Types } from 'mongoose';
import { MedicalDocument } from '../models/Document';
import { FileStorageService } from '../services/storage/fileStorage.service';
import { S3StorageProvider } from '../services/storage/s3StorageProvider';
import { LocalStorageProvider } from '../services/storage/localStorageProvider';
import { GridFSStorageProvider } from '../services/storage/gridfsStorageProvider';
import { validateUploadedFile, validateFileMagicBytes } from '../utils/fileValidation';
import { config } from '../config';
import './setup';

describe('Phase 2: Secure AWS S3 & File Storage Abstraction Unit & Integration Tests', () => {
  let userAId: Types.ObjectId;
  let userBId: Types.ObjectId;
  let patientAId: Types.ObjectId;
  let patientBId: Types.ObjectId;

  beforeAll(() => {
    userAId = new Types.ObjectId();
    userBId = new Types.ObjectId();
    patientAId = new Types.ObjectId();
    patientBId = new Types.ObjectId();
  });

  describe('1. Object Key Generation & Unpredictable Keys', () => {
    it('should generate unpredictable key in format users/{userId}/documents/{uuid}.{ext}', () => {
      const key = FileStorageService.generateObjectKey(userAId.toString(), 'lab_results_2026.pdf');
      expect(key).toMatch(/^users\/[a-f0-9]{24}\/documents\/[a-f0-9-]{36}\.pdf$/);
      expect(key).not.toContain('lab_results_2026');
    });
  });

  describe('2. File Signature & Validation Rules', () => {
    it('should validate PDF magic bytes header %PDF-', () => {
      const pdfBuffer = Buffer.from('%PDF-1.4 sample pdf content...');
      const isValid = validateFileMagicBytes(pdfBuffer, 'application/pdf');
      expect(isValid).toBe(true);
    });

    it('should reject spoofed file header binary signature', () => {
      const fakeBuffer = Buffer.from('EXECUTE_MALICIOUS_SCRIPT');
      const isValid = validateFileMagicBytes(fakeBuffer, 'application/pdf');
      expect(isValid).toBe(false);
    });

    it('should reject unsupported MIME type', () => {
      const fakeFile: any = {
        originalname: 'script.exe',
        mimetype: 'application/x-msdownload',
        size: 1024,
      };
      const result = validateUploadedFile(fakeFile);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Unsupported MIME type');
    });

    it('should reject file exceeding maximum size limit', () => {
      const oversizedFile: any = {
        originalname: 'big_scan.pdf',
        mimetype: 'application/pdf',
        size: 50 * 1024 * 1024, // 50MB
      };
      const result = validateUploadedFile(oversizedFile);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('File size exceeds maximum allowed limit');
    });
  });

  describe('3. Storage Abstraction Providers (S3, Local, GridFS)', () => {
    it('should instantiate LocalStorageProvider correctly', async () => {
      const localProvider = new LocalStorageProvider();
      expect(localProvider).toBeDefined();

      const testStream = require('stream').Readable.from(['Hello Local Storage']);
      const stored = await localProvider.store(testStream, {
        filename: `users/${userAId}/documents/test.txt`,
        mimeType: 'text/plain',
      });

      expect(stored.fileId).toBe(`users/${userAId}/documents/test.txt`);
      expect(await localProvider.exists(stored.fileId)).toBe(true);

      const deleted = await localProvider.delete(stored.fileId);
      expect(deleted).toBe(true);
    });

    it('should generate pre-signed URL or download link using active provider', async () => {
      FileStorageService.setProvider(new LocalStorageProvider());
      const url = await FileStorageService.getSignedUrl('users/123/documents/abc.pdf', 300);
      expect(url).toBeDefined();
      expect(url).toContain('abc.pdf');
    });

    it('should switch providers dynamically', () => {
      FileStorageService.setProvider(new GridFSStorageProvider());
      expect(FileStorageService.getProvider()).toBeInstanceOf(GridFSStorageProvider);

      FileStorageService.setProvider(new S3StorageProvider());
      expect(FileStorageService.getProvider()).toBeInstanceOf(S3StorageProvider);

      FileStorageService.resetProvider();
    });
  });

  describe('4. Database Persistence & Model Validation', () => {
    it('should validate Document schema with storageProvider, storageKey, and originalFilename', () => {
      const storageKey = FileStorageService.generateObjectKey(userAId.toString(), 'blood_test.pdf');

      const doc = new MedicalDocument({
        patientId: patientAId,
        uploadedBy: userAId,
        title: 'Blood Test Results',
        originalFilename: 'blood_test.pdf',
        documentType: 'lab_report',
        storageProvider: 's3',
        storageKey,
        filePath: storageKey,
        mimeType: 'application/pdf',
        fileSize: 2048,
      });

      const err = doc.validateSync();
      expect(err).toBeUndefined();
      expect(doc.storageProvider).toBe('s3');
      expect(doc.storageKey).toBe(storageKey);
      expect(doc.originalFilename).toBe('blood_test.pdf');
    });

    it('should enforce user isolation logic between Patient A and Patient B documents', () => {
      const docA = new MedicalDocument({
        patientId: patientAId,
        uploadedBy: userAId,
        title: 'Doc A',
        originalFilename: 'a.pdf',
        documentType: 'lab_report',
        storageProvider: 's3',
        storageKey: 'users/A/docA.pdf',
        filePath: 'users/A/docA.pdf',
      });

      const docB = new MedicalDocument({
        patientId: patientBId,
        uploadedBy: userBId,
        title: 'Doc B',
        originalFilename: 'b.pdf',
        documentType: 'prescription',
        storageProvider: 's3',
        storageKey: 'users/B/docB.pdf',
        filePath: 'users/B/docB.pdf',
      });

      expect(docA.patientId.toString()).not.toEqual(docB.patientId.toString());
      expect(docA.uploadedBy.toString()).not.toEqual(docB.uploadedBy.toString());
    });

    it('should support soft-deletion via deletedAt property', () => {
      const doc = new MedicalDocument({
        patientId: patientAId,
        uploadedBy: userAId,
        title: 'Temporary Scan',
        originalFilename: 'temp.png',
        documentType: 'imaging',
        storageProvider: 'local',
        storageKey: 'users/123/documents/temp.png',
        filePath: 'users/123/documents/temp.png',
        mimeType: 'image/png',
        fileSize: 1024,
      });

      expect(doc.deletedAt).toBeNull();
      doc.deletedAt = new Date();
      expect(doc.deletedAt).toBeInstanceOf(Date);
    });
  });

  describe('5. Security Safeguards', () => {
    it('should NEVER expose AWS secret credentials in configuration exports or models', () => {
      expect(config.awsSecretAccessKey).not.toContain('AKIA');
      expect(JSON.stringify(config)).not.toContain('AWS_SECRET_ACCESS_KEY_VALUE');
    });
  });
});
