import jwt from 'jsonwebtoken';
import { GridFSStorageProvider } from './gridfsStorageProvider';
import { S3StorageProvider } from './s3StorageProvider';
import { LocalStorageProvider } from './localStorageProvider';
import { StorageProvider, StoreFileOptions, StoredFileResult, RetrievedFileResult } from './storageProvider.interface';
import { config } from '../../config';
import { Readable } from 'stream';
import crypto from 'crypto';
import path from 'path';

export interface FileDownloadTokenPayload {
  fileId: string;
  userId: string;
  role: string;
}

export class FileStorageService {
  private static activeProvider: StorageProvider | null = null;

  public static getProvider(): StorageProvider {
    if (!this.activeProvider) {
      this.activeProvider = this.createProviderInstance();
    }
    return this.activeProvider;
  }

  public static setProvider(provider: StorageProvider): void {
    this.activeProvider = provider;
  }

  public static resetProvider(): void {
    this.activeProvider = null;
  }

  private static createProviderInstance(): StorageProvider {
    const providerName = (config.storageProvider || 'gridfs').toLowerCase();

    if (providerName === 's3') {
      return new S3StorageProvider();
    } else if (providerName === 'local') {
      return new LocalStorageProvider();
    }
    return new GridFSStorageProvider();
  }

  /**
   * Generates unpredictable, unique storage object key: users/{userId}/documents/{uuid}.{ext}
   */
  public static generateObjectKey(userId: string, originalFilename: string): string {
    const ext = path.extname(originalFilename).toLowerCase() || '.bin';
    const uuid = crypto.randomUUID();
    const cleanUserId = userId ? userId.toString() : 'anonymous';
    return `users/${cleanUserId}/documents/${uuid}${ext}`;
  }

  /**
   * Generate short-lived signed download token valid for 15 minutes (or configurable)
   */
  public static generateDownloadToken(fileId: string, userId: string, role: string, expiresIn = '15m'): string {
    return jwt.sign(
      {
        fileId,
        userId,
        role,
        type: 'file_download',
      },
      config.jwtSecret,
      { expiresIn } as jwt.SignOptions
    );
  }

  /**
   * Verify signed download token
   */
  public static verifyDownloadToken(token: string): FileDownloadTokenPayload {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as any;
      if (decoded.type !== 'file_download' || !decoded.fileId) {
        throw new Error('Invalid download token structure.');
      }
      return {
        fileId: decoded.fileId,
        userId: decoded.userId,
        role: decoded.role,
      };
    } catch (err: any) {
      throw new Error(`Download token verification failed: ${err.message}`);
    }
  }

  /**
   * Generate pre-signed URL or download URL for storage key
   */
  public static async getSignedUrl(fileKey: string, expiresInSeconds = 300): Promise<string> {
    const provider = this.getProvider();
    return provider.getSignedUrl(fileKey, expiresInSeconds);
  }

  /**
   * Store readable stream
   */
  public static async storeStream(stream: Readable, options: StoreFileOptions): Promise<StoredFileResult> {
    return this.getProvider().store(stream, options);
  }

  /**
   * Store binary Buffer
   */
  public static async storeBuffer(buffer: Buffer, options: StoreFileOptions): Promise<StoredFileResult> {
    const provider = this.getProvider();
    if ('storeBuffer' in provider && typeof (provider as any).storeBuffer === 'function') {
      return (provider as any).storeBuffer(buffer, options);
    }
    return this.storeStream(Readable.from(buffer), options);
  }

  /**
   * Retrieve file stream
   */
  public static async getFileStream(fileId: string): Promise<RetrievedFileResult> {
    return this.getProvider().retrieve(fileId);
  }

  /**
   * Delete file from storage
   */
  public static async deleteFile(fileId: string): Promise<boolean> {
    return this.getProvider().delete(fileId);
  }

  /**
   * Check if file exists in storage
   */
  public static async fileExists(fileId: string): Promise<boolean> {
    return this.getProvider().exists(fileId);
  }
}
