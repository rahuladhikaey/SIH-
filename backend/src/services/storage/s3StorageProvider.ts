import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl as getS3PresignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';
import {
  StorageProvider,
  StoreFileOptions,
  StoredFileResult,
  RetrievedFileResult,
} from './storageProvider.interface';
import { config } from '../../config';
import { logger } from '../../utils/logger';

export class S3StorageProvider implements StorageProvider {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.bucketName = config.s3BucketName || 'medmitra-uploads';

    const clientConfig: any = {
      region: config.awsRegion || 'us-east-1',
    };

    if (config.awsAccessKeyId && config.awsSecretAccessKey) {
      clientConfig.credentials = {
        accessKeyId: config.awsAccessKeyId,
        secretAccessKey: config.awsSecretAccessKey,
      };
    }

    this.s3Client = new S3Client(clientConfig);
  }

  private async streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('error', (err) => reject(err));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  public async store(stream: Readable, options: StoreFileOptions): Promise<StoredFileResult> {
    try {
      const buffer = await this.streamToBuffer(stream);
      const fileKey = options.filename;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        Body: buffer,
        ContentType: options.mimeType,
        Metadata: options.metadata ? Object.fromEntries(
          Object.entries(options.metadata).map(([k, v]) => [k, String(v)])
        ) : undefined,
      });

      await this.s3Client.send(command);

      logger.info(`AWS S3 object stored successfully. Bucket: ${this.bucketName}, Key: ${fileKey}`);

      return {
        fileId: fileKey,
        filename: fileKey,
        length: buffer.length,
        mimeType: options.mimeType,
        uploadDate: new Date(),
      };
    } catch (err: any) {
      logger.error(`AWS S3 store error for file '${options.filename}': ${err.message}`);
      throw new Error(`S3 Storage Upload Failed: ${err.message}`);
    }
  }

  public async retrieve(fileKey: string): Promise<RetrievedFileResult> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      });

      const response = await this.s3Client.send(command);
      if (!response.Body) {
        throw new Error(`S3 object '${fileKey}' has no body content.`);
      }

      const stream = response.Body as Readable;

      return {
        stream,
        filename: fileKey.split('/').pop() || fileKey,
        mimeType: response.ContentType || 'application/octet-stream',
        length: response.ContentLength || 0,
      };
    } catch (err: any) {
      logger.error(`AWS S3 retrieve error for key '${fileKey}': ${err.message}`);
      throw new Error(`S3 Object Retrieval Failed: ${err.message}`);
    }
  }

  public async delete(fileKey: string): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      });

      await this.s3Client.send(command);
      logger.info(`AWS S3 object deleted successfully. Key: ${fileKey}`);
      return true;
    } catch (err: any) {
      logger.error(`AWS S3 delete failure for key '${fileKey}': ${err.message}`);
      return false;
    }
  }

  public async exists(fileKey: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      });
      await this.s3Client.send(command);
      return true;
    } catch (err) {
      return false;
    }
  }

  public async getSignedUrl(fileKey: string, expiresInSeconds = 300): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      });

      const url = await getS3PresignedUrl(this.s3Client, command, {
        expiresIn: expiresInSeconds,
      });

      return url;
    } catch (err: any) {
      logger.error(`AWS S3 pre-signed URL generation failed for key '${fileKey}': ${err.message}`);
      throw new Error(`Signed URL generation failed: ${err.message}`);
    }
  }
}
