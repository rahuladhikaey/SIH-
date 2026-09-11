import { Readable } from 'stream';

export interface StoreFileOptions {
  filename: string;
  mimeType: string;
  metadata?: Record<string, any>;
}

export interface StoredFileResult {
  fileId: string;
  filename: string;
  length: number;
  mimeType: string;
  uploadDate: Date;
}

export interface RetrievedFileResult {
  stream: Readable;
  filename: string;
  mimeType: string;
  length: number;
}

export interface StorageProvider {
  store(stream: Readable, options: StoreFileOptions): Promise<StoredFileResult>;
  retrieve(fileId: string): Promise<RetrievedFileResult>;
  delete(fileId: string): Promise<boolean>;
  exists(fileId: string): Promise<boolean>;
  getSignedUrl(fileId: string, expiresInSeconds?: number): Promise<string>;
}

