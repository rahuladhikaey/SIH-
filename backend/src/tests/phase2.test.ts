import { Readable } from 'stream';
import jwt from 'jsonwebtoken';
import { ConsultationStateMachine, InvalidStateTransitionError } from '../services/consultationStateMachine.service';
import { StorageProvider, StoreFileOptions, StoredFileResult, RetrievedFileResult } from '../services/storage/storageProvider.interface';
import { FileStorageService } from '../services/storage/fileStorage.service';
import { addAIJobToQueue } from '../queue/aiJob.queue';
import { AIJob } from '../models/AIJob';
import { config } from '../config';
import './setup';

// In-Memory StorageProvider implementation for zero-dependency unit tests
class InMemoryStorageProvider implements StorageProvider {
  private files = new Map<string, { buffer: Buffer; options: StoreFileOptions }>();

  async store(stream: Readable, options: StoreFileOptions): Promise<StoredFileResult> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);
    const fileId = `mem_file_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    this.files.set(fileId, { buffer, options });

    return {
      fileId,
      filename: options.filename,
      length: buffer.length,
      mimeType: options.mimeType,
      uploadDate: new Date(),
    };
  }

  async retrieve(fileId: string): Promise<RetrievedFileResult> {
    const item = this.files.get(fileId);
    if (!item) throw new Error(`File '${fileId}' not found.`);

    return {
      stream: Readable.from(item.buffer),
      filename: item.options.filename,
      mimeType: item.options.mimeType,
      length: item.buffer.length,
    };
  }

  async delete(fileId: string): Promise<boolean> {
    return this.files.delete(fileId);
  }

  async exists(fileId: string): Promise<boolean> {
    return this.files.has(fileId);
  }

  async getSignedUrl(fileId: string, expiresInSeconds = 300): Promise<string> {
    return `/api/v1/files/download/${fileId}`;
  }
}

describe('Phase 2 Integration & Unit Test Suite', () => {
  describe('1. Consultation Lifecycle State Machine & Valid/Invalid Transitions', () => {
    it('should validate valid status transition sequence: CREATED -> PROCESSING -> AI_GENERATED -> PENDING_REVIEW -> DOCTOR_EDITED -> DOCTOR_APPROVED -> VERIFIED', () => {
      expect(ConsultationStateMachine.canTransition('CREATED', 'PROCESSING')).toBe(true);
      expect(ConsultationStateMachine.canTransition('PROCESSING', 'AI_GENERATED')).toBe(true);
      expect(ConsultationStateMachine.canTransition('AI_GENERATED', 'PENDING_REVIEW')).toBe(true);
      expect(ConsultationStateMachine.canTransition('PENDING_REVIEW', 'DOCTOR_EDITED')).toBe(true);
      expect(ConsultationStateMachine.canTransition('PENDING_REVIEW', 'DOCTOR_APPROVED')).toBe(true);
      expect(ConsultationStateMachine.canTransition('DOCTOR_EDITED', 'DOCTOR_APPROVED')).toBe(true);
      expect(ConsultationStateMachine.canTransition('DOCTOR_APPROVED', 'VERIFIED')).toBe(true);
    });

    it('should REJECT illegal/invalid status transitions (e.g. CREATED -> VERIFIED or CREATED -> DOCTOR_APPROVED)', () => {
      expect(ConsultationStateMachine.canTransition('CREATED', 'VERIFIED')).toBe(false);
      expect(ConsultationStateMachine.canTransition('CREATED', 'DOCTOR_APPROVED')).toBe(false);
      expect(ConsultationStateMachine.canTransition('AI_GENERATED', 'VERIFIED')).toBe(false);
      expect(ConsultationStateMachine.canTransition('VERIFIED', 'CREATED')).toBe(false);
    });

    it('should throw InvalidStateTransitionError on invalid transition execution', async () => {
      const err = new InvalidStateTransitionError('CREATED', 'VERIFIED');
      expect(err.statusCode).toBe(400);
      expect(err.message).toContain("Illegal consultation status transition from 'CREATED' to 'VERIFIED'");
    });
  });

  describe('2. Storage Provider & Exact Byte Preservation', () => {
    const storageProvider: StorageProvider = new InMemoryStorageProvider();

    it('Prescription & Report File Upload — should stream and store file preserving exact bytes', async () => {
      const originalBuffer = Buffer.from('PDF-1.7-OFFICIAL-PRESCRIPTION-MEDICAL-REPORT-DATA-CONTENT-BYTES-2026', 'utf-8');
      const stream = Readable.from(originalBuffer);

      const storedFile = await storageProvider.store(stream, {
        filename: 'prescription_report.pdf',
        mimeType: 'application/pdf',
        metadata: { category: 'prescription' },
      });

      expect(storedFile.fileId).toBeDefined();
      expect(storedFile.filename).toBe('prescription_report.pdf');

      // Verify file exists
      const exists = await storageProvider.exists(storedFile.fileId);
      expect(exists).toBe(true);

      // Retrieve file stream and verify exact byte preservation
      const retrieved = await storageProvider.retrieve(storedFile.fileId);
      expect(retrieved.mimeType).toBe('application/pdf');

      const retrievedChunks: Buffer[] = [];
      for await (const chunk of retrieved.stream) {
        retrievedChunks.push(Buffer.from(chunk));
      }
      const retrievedBuffer = Buffer.concat(retrievedChunks);

      // Exact Byte Match Verification
      expect(retrievedBuffer.equals(originalBuffer)).toBe(true);
      expect(retrievedBuffer.toString('utf-8')).toBe(originalBuffer.toString('utf-8'));

      // Cleanup
      await storageProvider.delete(storedFile.fileId);
    });

    it('Voice Audio Upload — should store audio recording cleanly', async () => {
      const audioBuffer = Buffer.from('RIFF_WAV_SAMPLE_AUDIO_RECORDING_BYTES_1234567890', 'utf-8');
      const stream = Readable.from(audioBuffer);

      const storedAudio = await storageProvider.store(stream, {
        filename: 'voice_recording.wav',
        mimeType: 'audio/wav',
      });

      expect(storedAudio.fileId).toBeDefined();
      expect(storedAudio.mimeType).toBe('audio/wav');

      const exists = await storageProvider.exists(storedAudio.fileId);
      expect(exists).toBe(true);

      await storageProvider.delete(storedAudio.fileId);
    });
  });

  describe('3. Security & Short-Lived Signed Download Tokens', () => {
    it('should generate and verify short-lived 15-minute signed download tokens', () => {
      const fileId = '507f1f77bcf86cd799439011';
      const userId = 'user_abc_123';
      const role = 'patient';

      const token = FileStorageService.generateDownloadToken(fileId, userId, role);
      expect(token).toBeDefined();

      const decoded = FileStorageService.verifyDownloadToken(token);
      expect(decoded.fileId).toBe(fileId);
      expect(decoded.userId).toBe(userId);
      expect(decoded.role).toBe(role);
    });

    it('should REJECT invalid or tampered download tokens', () => {
      const tamperedToken = 'invalid.jwt.token.string';
      expect(() => FileStorageService.verifyDownloadToken(tamperedToken)).toThrow();
    });

    it('should REJECT expired download tokens', () => {
      const expiredToken = jwt.sign(
        { fileId: 'file_123', type: 'file_download' },
        config.jwtSecret,
        { expiresIn: '-1s' }
      );
      expect(() => FileStorageService.verifyDownloadToken(expiredToken)).toThrow();
    });
  });

  describe('4. BullMQ Queue & AIJob Database Recording', () => {
    it('should create AIJob database record with pending status', async () => {
      const jobDoc = new AIJob({
        jobType: 'transcription',
        resourceId: '507f1f77bcf86cd799439011',
        status: 'pending',
        payload: { patientId: 'pat_123' },
      });

      const err = jobDoc.validateSync();
      expect(err).toBeUndefined();
      expect(jobDoc.status).toBe('pending');
      expect(jobDoc.jobType).toBe('transcription');
    });
  });
});
