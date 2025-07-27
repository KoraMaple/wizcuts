import { Injectable, Logger } from '@nestjs/common';
import { SupabaseConfigService } from '../config/supabase.config';
import * as fs from 'fs';
import * as path from 'path';

export interface StorageFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

export interface UploadResult {
  url: string;
  path: string;
  size: number;
}

export abstract class StorageService {
  abstract uploadFile(
    bucket: string,
    file: StorageFile,
    fileName?: string
  ): Promise<UploadResult>;

  abstract deleteFile(bucket: string, filePath: string): Promise<void>;

  abstract getFileUrl(bucket: string, filePath: string): string;

  abstract listFiles(bucket: string, prefix?: string): Promise<string[]>;
}

@Injectable()
export class SupabaseStorageService extends StorageService {
  private readonly logger = new Logger(SupabaseStorageService.name);

  constructor(private readonly supabaseConfig: SupabaseConfigService) {
    super();
  }

  async uploadFile(
    bucket: string,
    file: StorageFile,
    fileName?: string
  ): Promise<UploadResult> {
    const client = this.supabaseConfig.getClient();
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const finalFileName = fileName || `${timestamp}${extension}`;

    const { data, error } = await client.storage
      .from(bucket)
      .upload(finalFileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      this.logger.error(`Upload failed: ${error.message}`, error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: publicUrlData } = client.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      url: publicUrlData.publicUrl,
      path: data.path,
      size: file.size,
    };
  }

  async deleteFile(bucket: string, filePath: string): Promise<void> {
    const client = this.supabaseConfig.getClient();

    const { error } = await client.storage.from(bucket).remove([filePath]);

    if (error) {
      this.logger.error(`Delete failed: ${error.message}`, error);
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  getFileUrl(bucket: string, filePath: string): string {
    const client = this.supabaseConfig.getClient();
    const { data } = client.storage.from(bucket).getPublicUrl(filePath);

    return data.publicUrl;
  }

  async listFiles(bucket: string, prefix?: string): Promise<string[]> {
    const client = this.supabaseConfig.getClient();

    const { data, error } = await client.storage
      .from(bucket)
      .list(prefix || '', {
        limit: 100,
        offset: 0,
      });

    if (error) {
      this.logger.error(`List files failed: ${error.message}`, error);
      throw new Error(`List files failed: ${error.message}`);
    }

    return data?.map(file => file.name) ?? [];
  }
}

@Injectable()
export class LocalStorageService extends StorageService {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    super();
    this.ensureUploadDirectory();
  }

  private ensureUploadDirectory(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(
    bucket: string,
    file: StorageFile,
    fileName?: string
  ): Promise<UploadResult> {
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const finalFileName = fileName || `${timestamp}${extension}`;

    const bucketDir = path.join(this.uploadDir, bucket);
    if (!fs.existsSync(bucketDir)) {
      fs.mkdirSync(bucketDir, { recursive: true });
    }

    const filePath = path.join(bucketDir, finalFileName);

    await fs.promises.writeFile(filePath, file.buffer);

    return {
      url: `/uploads/${bucket}/${finalFileName}`,
      path: `${bucket}/${finalFileName}`,
      size: file.size,
    };
  }

  async deleteFile(bucket: string, filePath: string): Promise<void> {
    const fullPath = path.join(this.uploadDir, filePath);

    try {
      await fs.promises.unlink(fullPath);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Delete failed: ${errorMessage}`, error);
      throw new Error(`Delete failed: ${errorMessage}`);
    }
  }

  getFileUrl(bucket: string, filePath: string): string {
    return `/uploads/${bucket}/${filePath}`;
  }

  async listFiles(bucket: string, prefix?: string): Promise<string[]> {
    const bucketDir = path.join(this.uploadDir, bucket);

    if (!fs.existsSync(bucketDir)) {
      return [];
    }

    const files = await fs.promises.readdir(bucketDir);

    if (prefix) {
      return files.filter(file => file.startsWith(prefix));
    }

    return files;
  }
}
