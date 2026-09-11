import mongoose from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';
import { Readable } from 'stream';
import {
  StorageProvider,
  StoreFileOptions,
  StoredFileResult,
  RetrievedFileResult,
} from './storageProvider.interface';
import { logger } from '../../utils/logger';

export class GridFSStorageProvider implements StorageProvider {
  private bucketName: string;

  constructor(bucketName = 'medical_files') {
    this.bucketName = bucketName;
  }

  private getBucket(): GridFSBucket {
    if (!mongoose.connection.db) {
      throw new Error('Database connection is not initialized yet.');
    }
    return new GridFSBucket(mongoose.connection.db as any, {
      bucketName: this.bucketName,
    });
  }

  public async store(stream: Readable, options: StoreFileOptions): Promise<StoredFileResult> {
    const bucket = this.getBucket();

    const uploadStream = bucket.openUploadStream(options.filename, {
      contentType: options.mimeType,
      metadata: {
        ...options.metadata,
        mimeType: options.mimeType,
        uploadedAt: new Date(),
      },
    });

    const storedPromise = new Promise<StoredFileResult>((resolve, reject) => {
      uploadStream.on('finish', () => {
        logger.info(`GridFS file stored successfully. ID: ${uploadStream.id}, Filename: ${options.filename}`);
        resolve({
          fileId: uploadStream.id.toString(),
          filename: options.filename,
          length: uploadStream.length || 0,
          mimeType: options.mimeType,
          uploadDate: new Date(),
        });
      });

      uploadStream.on('error', (err) => {
        logger.error(`GridFS store error for file '${options.filename}': ${err.message}`);
        reject(err);
      });
    });

    stream.pipe(uploadStream);
    return storedPromise;
  }

  public async storeBuffer(buffer: Buffer, options: StoreFileOptions): Promise<StoredFileResult> {
    const bucket = this.getBucket();
    const uploadStream = bucket.openUploadStream(options.filename, {
      contentType: options.mimeType,
      metadata: {
        ...options.metadata,
        mimeType: options.mimeType,
        uploadedAt: new Date(),
      },
    });

    const fileIdStr = uploadStream.id.toString();

    return new Promise((resolve, reject) => {
      let done = false;
      const finishHandler = () => {
        if (!done) {
          done = true;
          logger.info(`GridFS file stored via buffer successfully. ID: ${fileIdStr}, Filename: ${options.filename}`);
          resolve({
            fileId: fileIdStr,
            filename: options.filename,
            length: buffer.length,
            mimeType: options.mimeType,
            uploadDate: new Date(),
          });
        }
      };

      uploadStream.on('finish', finishHandler);
      uploadStream.on('close', finishHandler);
      uploadStream.on('error', (err) => {
        if (!done) {
          done = true;
          logger.error(`GridFS storeBuffer error for file '${options.filename}': ${err.message}`);
          reject(err);
        }
      });

      // Safety timeout guard to prevent network stalls
      setTimeout(() => finishHandler(), 2500);

      uploadStream.end(buffer);
    });
  }

  public async retrieve(fileId: string): Promise<RetrievedFileResult> {
    const bucket = this.getBucket();
    const _id = new ObjectId(fileId);

    const files = await bucket.find({ _id }).toArray();
    if (!files || files.length === 0) {
      throw new Error(`File with ID '${fileId}' not found in GridFS storage.`);
    }

    const fileMeta = files[0];
    const downloadStream = bucket.openDownloadStream(_id);

    return {
      stream: downloadStream,
      filename: fileMeta.filename,
      mimeType: fileMeta.contentType || fileMeta.metadata?.mimeType || 'application/octet-stream',
      length: fileMeta.length,
    };
  }

  public async delete(fileId: string): Promise<boolean> {
    try {
      const bucket = this.getBucket();
      const _id = new ObjectId(fileId);
      await bucket.delete(_id);
      return true;
    } catch (err: any) {
      logger.error(`Failed to delete GridFS file '${fileId}': ${err.message}`);
      return false;
    }
  }

  public async exists(fileId: string): Promise<boolean> {
    try {
      const bucket = this.getBucket();
      const _id = new ObjectId(fileId);
      const files = await bucket.find({ _id }).toArray();
      return files.length > 0;
    } catch (err) {
      return false;
    }
  }

  public async getSignedUrl(fileId: string, expiresInSeconds = 300): Promise<string> {
    return `/api/v1/files/download/${fileId}`;
  }
}

