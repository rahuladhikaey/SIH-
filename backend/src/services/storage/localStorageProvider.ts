import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import {
  StorageProvider,
  StoreFileOptions,
  StoredFileResult,
  RetrievedFileResult,
} from './storageProvider.interface';
import { logger } from '../../utils/logger';

export class LocalStorageProvider implements StorageProvider {
  private uploadsDir: string;

  constructor(uploadsDir = path.resolve(process.cwd(), 'uploads')) {
    this.uploadsDir = uploadsDir;
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  private getFilePath(fileKey: string): string {
    return path.resolve(this.uploadsDir, fileKey.replace(/\//g, '_'));
  }

  public async store(stream: Readable, options: StoreFileOptions): Promise<StoredFileResult> {
    const fileKey = options.filename;
    const destPath = this.getFilePath(fileKey);

    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const writeStream = fs.createWriteStream(destPath);
    let bytesWritten = 0;

    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => {
        bytesWritten += chunk.length;
      });

      stream
        .pipe(writeStream)
        .on('error', (err) => {
          logger.error(`Local storage store error for file '${options.filename}': ${err.message}`);
          reject(err);
        })
        .on('finish', () => {
          logger.info(`Local file stored successfully. Path: ${destPath}`);
          resolve({
            fileId: fileKey,
            filename: fileKey,
            length: bytesWritten,
            mimeType: options.mimeType,
            uploadDate: new Date(),
          });
        });
    });
  }

  public async retrieve(fileKey: string): Promise<RetrievedFileResult> {
    const filePath = this.getFilePath(fileKey);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File '${fileKey}' not found in local storage.`);
    }

    const stats = fs.statSync(filePath);
    const readStream = fs.createReadStream(filePath);

    return {
      stream: readStream,
      filename: fileKey.split('/').pop() || fileKey,
      mimeType: 'application/octet-stream',
      length: stats.size,
    };
  }

  public async delete(fileKey: string): Promise<boolean> {
    try {
      const filePath = this.getFilePath(fileKey);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (err: any) {
      logger.error(`Local storage delete error for file '${fileKey}': ${err.message}`);
      return false;
    }
  }

  public async exists(fileKey: string): Promise<boolean> {
    const filePath = this.getFilePath(fileKey);
    return fs.existsSync(filePath);
  }

  public async getSignedUrl(fileKey: string, expiresInSeconds = 300): Promise<string> {
    return `/api/v1/files/download/${encodeURIComponent(fileKey)}`;
  }
}
