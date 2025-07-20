/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  SupabaseStorageService,
  LocalStorageService,
  StorageFile,
} from '../../../src/services/storage.service';
import { SupabaseConfigService } from '../../../src/config/supabase.config';

// Mock file system
jest.mock('fs');
import * as fs from 'fs';
const mockedFs = fs as jest.Mocked<typeof fs>;

// Mock path
jest.mock('path');
import * as path from 'path';
const mockedPath = path as jest.Mocked<typeof path>;

// Mock Supabase client
const mockSupabaseClient = {
  storage: {
    from: jest.fn().mockReturnThis(),
    upload: jest.fn(),
    remove: jest.fn(),
    getPublicUrl: jest.fn(),
    list: jest.fn(),
  },
};

const mockSupabaseConfigService = {
  getClient: jest.fn().mockReturnValue(mockSupabaseClient),
  getStorageConfig: jest.fn().mockReturnValue({
    buckets: {
      profiles: 'profiles',
      documents: 'documents',
    },
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
  }),
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    const config = {
      UPLOAD_DIR: '/tmp/uploads',
      NODE_ENV: 'test',
    };
    return config[key];
  }),
};

describe('StorageService', () => {
  let supabaseStorageService: SupabaseStorageService;
  let localStorageService: LocalStorageService;
  let module: TestingModule;

  const mockFile: StorageFile = {
    buffer: Buffer.from('test file content'),
    originalname: 'test.jpg',
    mimetype: 'image/jpeg',
    size: 1024,
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        SupabaseStorageService,
        LocalStorageService,
        {
          provide: SupabaseConfigService,
          useValue: mockSupabaseConfigService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    supabaseStorageService = module.get<SupabaseStorageService>(
      SupabaseStorageService,
    );
    localStorageService = module.get<LocalStorageService>(LocalStorageService);

    // Reset mocks
    jest.clearAllMocks();
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.mkdirSync.mockImplementation();
    mockedFs.writeFileSync.mockImplementation();
    mockedFs.unlinkSync.mockImplementation();
    mockedFs.readdirSync.mockReturnValue([]);
    mockedPath.join.mockImplementation((...paths) => paths.join('/'));
    mockedPath.dirname.mockReturnValue('/tmp/uploads/profiles');
    mockedPath.resolve.mockImplementation((p) => `/resolved/${p}`);
  });

  afterEach(async () => {
    await module.close();
  });

  describe('SupabaseStorageService', () => {
    describe('uploadFile', () => {
      it('should successfully upload a file to Supabase storage', async () => {
        const mockUploadResult = {
          data: { path: 'profiles/test.jpg' },
          error: null,
        };
        const mockPublicUrlResult = {
          data: {
            publicUrl:
              'https://supabase.co/storage/v1/object/public/profiles/test.jpg',
          },
        };

        mockSupabaseClient.storage.upload.mockResolvedValue(mockUploadResult);
        mockSupabaseClient.storage.getPublicUrl.mockReturnValue(
          mockPublicUrlResult,
        );

        const result = await supabaseStorageService.uploadFile(
          'profiles',
          mockFile,
          'test.jpg',
        );

        expect(result).toEqual({
          url: 'https://supabase.co/storage/v1/object/public/profiles/test.jpg',
          path: 'profiles/test.jpg',
          size: 1024,
        });

        expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith(
          'profiles',
        );
        expect(mockSupabaseClient.storage.upload).toHaveBeenCalledWith(
          'test.jpg',
          mockFile.buffer,
          {
            contentType: 'image/jpeg',
            upsert: true,
          },
        );
      });

      it('should handle upload errors', async () => {
        const mockUploadResult = {
          data: null,
          error: { message: 'Upload failed' },
        };

        mockSupabaseClient.storage.upload.mockResolvedValue(mockUploadResult);

        await expect(
          supabaseStorageService.uploadFile('profiles', mockFile, 'test.jpg'),
        ).rejects.toThrow('Failed to upload file: Upload failed');
      });

      it('should generate filename when not provided', async () => {
        const mockUploadResult = {
          data: { path: 'profiles/generated-filename.jpg' },
          error: null,
        };
        const mockPublicUrlResult = {
          data: {
            publicUrl:
              'https://supabase.co/storage/v1/object/public/profiles/generated-filename.jpg',
          },
        };

        mockSupabaseClient.storage.upload.mockResolvedValue(mockUploadResult);
        mockSupabaseClient.storage.getPublicUrl.mockReturnValue(
          mockPublicUrlResult,
        );

        const result = await supabaseStorageService.uploadFile(
          'profiles',
          mockFile,
        );

        expect(result.path).toMatch(/^profiles\/\d+_test\.jpg$/);
        expect(mockSupabaseClient.storage.upload).toHaveBeenCalledWith(
          expect.stringMatching(/^\d+_test\.jpg$/),
          mockFile.buffer,
          {
            contentType: 'image/jpeg',
            upsert: true,
          },
        );
      });
    });

    describe('deleteFile', () => {
      it('should successfully delete a file from Supabase storage', async () => {
        const mockDeleteResult = {
          data: null,
          error: null,
        };

        mockSupabaseClient.storage.remove.mockResolvedValue(mockDeleteResult);

        await supabaseStorageService.deleteFile('profiles', 'test.jpg');

        expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith(
          'profiles',
        );
        expect(mockSupabaseClient.storage.remove).toHaveBeenCalledWith([
          'test.jpg',
        ]);
      });

      it('should handle delete errors', async () => {
        const mockDeleteResult = {
          data: null,
          error: { message: 'Delete failed' },
        };

        mockSupabaseClient.storage.remove.mockResolvedValue(mockDeleteResult);

        await expect(
          supabaseStorageService.deleteFile('profiles', 'test.jpg'),
        ).rejects.toThrow('Failed to delete file: Delete failed');
      });
    });

    describe('getFileUrl', () => {
      it('should return the public URL for a file', () => {
        const mockPublicUrlResult = {
          data: {
            publicUrl:
              'https://supabase.co/storage/v1/object/public/profiles/test.jpg',
          },
        };

        mockSupabaseClient.storage.getPublicUrl.mockReturnValue(
          mockPublicUrlResult,
        );

        const url = supabaseStorageService.getFileUrl('profiles', 'test.jpg');

        expect(url).toBe(
          'https://supabase.co/storage/v1/object/public/profiles/test.jpg',
        );
        expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith(
          'profiles',
        );
        expect(mockSupabaseClient.storage.getPublicUrl).toHaveBeenCalledWith(
          'test.jpg',
        );
      });
    });

    describe('listFiles', () => {
      it('should list files in a bucket', async () => {
        const mockListResult = {
          data: [{ name: 'file1.jpg' }, { name: 'file2.png' }],
          error: null,
        };

        mockSupabaseClient.storage.list.mockResolvedValue(mockListResult);

        const files = await supabaseStorageService.listFiles('profiles');

        expect(files).toEqual(['file1.jpg', 'file2.png']);
        expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith(
          'profiles',
        );
        expect(mockSupabaseClient.storage.list).toHaveBeenCalledWith('', {
          limit: 100,
          offset: 0,
        });
      });

      it('should list files with prefix', async () => {
        const mockListResult = {
          data: [{ name: 'barber_1.jpg' }, { name: 'barber_2.png' }],
          error: null,
        };

        mockSupabaseClient.storage.list.mockResolvedValue(mockListResult);

        const files = await supabaseStorageService.listFiles(
          'profiles',
          'barber_',
        );

        expect(files).toEqual(['barber_1.jpg', 'barber_2.png']);
        expect(mockSupabaseClient.storage.list).toHaveBeenCalledWith(
          'barber_',
          {
            limit: 100,
            offset: 0,
          },
        );
      });

      it('should handle list errors', async () => {
        const mockListResult = {
          data: null,
          error: { message: 'List failed' },
        };

        mockSupabaseClient.storage.list.mockResolvedValue(mockListResult);

        await expect(
          supabaseStorageService.listFiles('profiles'),
        ).rejects.toThrow('Failed to list files: List failed');
      });
    });
  });

  describe('LocalStorageService', () => {
    describe('uploadFile', () => {
      it('should successfully upload a file to local storage', async () => {
        mockedFs.existsSync.mockReturnValue(false);

        const result = await localStorageService.uploadFile(
          'profiles',
          mockFile,
          'test.jpg',
        );

        expect(result).toEqual({
          url: '/resolved//tmp/uploads/profiles/test.jpg',
          path: 'profiles/test.jpg',
          size: 1024,
        });

        expect(mockedFs.mkdirSync).toHaveBeenCalledWith(
          '/tmp/uploads/profiles',
          { recursive: true },
        );
        expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
          '/tmp/uploads/profiles/test.jpg',
          mockFile.buffer,
        );
      });

      it('should generate filename when not provided', async () => {
        mockedFs.existsSync.mockReturnValue(true);

        const result = await localStorageService.uploadFile(
          'profiles',
          mockFile,
        );

        expect(result.path).toMatch(/^profiles\/\d+_test\.jpg$/);
        expect(mockedFs.writeFileSync).toHaveBeenCalled();
      });

      it('should handle write errors', async () => {
        mockedFs.writeFileSync.mockImplementation(() => {
          throw new Error('Write failed');
        });

        await expect(
          localStorageService.uploadFile('profiles', mockFile, 'test.jpg'),
        ).rejects.toThrow('Failed to upload file: Write failed');
      });
    });

    describe('deleteFile', () => {
      it('should successfully delete a file from local storage', async () => {
        mockedFs.existsSync.mockReturnValue(true);

        await localStorageService.deleteFile('profiles', 'test.jpg');

        expect(mockedFs.unlinkSync).toHaveBeenCalledWith(
          '/tmp/uploads/profiles/test.jpg',
        );
      });

      it('should handle non-existent files gracefully', async () => {
        mockedFs.existsSync.mockReturnValue(false);

        await expect(
          localStorageService.deleteFile('profiles', 'nonexistent.jpg'),
        ).rejects.toThrow('File not found: profiles/nonexistent.jpg');
      });

      it('should handle delete errors', async () => {
        mockedFs.existsSync.mockReturnValue(true);
        mockedFs.unlinkSync.mockImplementation(() => {
          throw new Error('Delete failed');
        });

        await expect(
          localStorageService.deleteFile('profiles', 'test.jpg'),
        ).rejects.toThrow('Failed to delete file: Delete failed');
      });
    });

    describe('getFileUrl', () => {
      it('should return the local file URL', () => {
        const url = localStorageService.getFileUrl('profiles', 'test.jpg');

        expect(url).toBe('/resolved//tmp/uploads/profiles/test.jpg');
        expect(mockedPath.resolve).toHaveBeenCalledWith(
          '/tmp/uploads/profiles/test.jpg',
        );
      });
    });

    describe('listFiles', () => {
      it('should list files in a local directory', async () => {
        mockedFs.existsSync.mockReturnValue(true);
        mockedFs.readdirSync.mockReturnValue(['file1.jpg', 'file2.png'] as any);

        const files = await localStorageService.listFiles('profiles');

        expect(files).toEqual(['file1.jpg', 'file2.png']);
        expect(mockedFs.readdirSync).toHaveBeenCalledWith(
          '/tmp/uploads/profiles',
        );
      });

      it('should list files with prefix filter', async () => {
        mockedFs.existsSync.mockReturnValue(true);
        mockedFs.readdirSync.mockReturnValue([
          'barber_1.jpg',
          'barber_2.png',
          'other.jpg',
        ] as any);

        const files = await localStorageService.listFiles(
          'profiles',
          'barber_',
        );

        expect(files).toEqual(['barber_1.jpg', 'barber_2.png']);
      });

      it('should return empty array for non-existent directory', async () => {
        mockedFs.existsSync.mockReturnValue(false);

        const files = await localStorageService.listFiles('profiles');

        expect(files).toEqual([]);
      });

      it('should handle read errors', async () => {
        mockedFs.existsSync.mockReturnValue(true);
        mockedFs.readdirSync.mockImplementation(() => {
          throw new Error('Read failed');
        });

        await expect(localStorageService.listFiles('profiles')).rejects.toThrow(
          'Failed to list files: Read failed',
        );
      });
    });
  });
});
