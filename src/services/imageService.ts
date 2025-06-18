import { v2 as cloudinary } from 'cloudinary';
import { supabase } from '../config/supabaseClient';
import sharp, { Sharp, ResizeOptions, format } from 'sharp';
import { resolve } from 'dns';
import { number, any, string } from 'zod/dist/types';
import { Buffer } from 'buffer';

// Define our own file interface
interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
  data: Buffer;
}

interface ImageMetadata {
  format: string;
  width: number;
  height: number;
  size: number;
  publicId: string;
  version: string;
}
interface ImageOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'jpeg' | 'webp' | 'png';
}

export class ImageService {
  private static instance: ImageService;

  private readonly defaultOptions: ImageOptions = {
    quality: 80,
    maxWidth: 1200,
    maxHeight: 1200,
    format: 'webp'
  };
  static defaultOptions: any;

  private constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
  }

  public static getInstance(): ImageService {
    if (!ImageService.instance) {
      ImageService.instance = new ImageService();
    }
    return ImageService.instance;
  }

  public static async uploadImage(file: UploadedFile | Buffer, options: ImageOptions = {}): Promise<ImageMetadata> {
    const instance = ImageService.getInstance();
    return instance.uploadImageInternal(file, options);
  }

  private async uploadImageInternal(file: UploadedFile | Buffer, options: ImageOptions = {}): Promise<ImageMetadata> {
    try {
      const buffer = file instanceof Buffer ? file : file.buffer;
      const opts = { ...this.defaultOptions, ...options };
      // Optimize image before upload
      const optimized = await this.optimizeImage(Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer), opts);

      // Upload to Cloudinary
      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: 'products',
            format: opts.format
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(optimized);
      });

      // Extract and store metadata
      const metadata: ImageMetadata = {
        format: result.format,
        width: result.width,
        height: result.height,
        size: result.bytes,
        publicId: result.public_id,
        version: result.version
      };
      await this.storeImageMetadata(result.public_id, metadata);
      return metadata;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw new Error('Failed to upload image');
    }
  }
  static optimizeImage(buffer: ArrayBufferLike, opts: any) {
    throw new Error('Method not implemented.');
  }
  static storeImageMetadata(public_id: any, metadata: ImageMetadata) {
    throw new Error('Method not implemented.');
  }

  private static async processImage(buffer: Buffer): Promise<any> {
    // Image processing logic here
    return {
      url: 'processed-image-url',
      publicId: 'generated-public-id',
      width: 0,
      height: 0
    };
  }

  private async optimizeImage(
    buffer: Buffer,
    options: ImageOptions
  ): Promise<Buffer> {
    return sharp(buffer)
      .resize(options.maxWidth, options.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .toFormat(options.format || 'webp', {
        quality: options.quality
      })
      .toBuffer();
  }

  async storeImageMetadata(publicId: string, metadata: any): Promise<void> {
    await supabase.from('image_metadata').insert({
      public_id: publicId,
      ...metadata
    });
  }

  getCdnUrl(publicId: string, transformations: Record<string, any> = {}): string {
    return cloudinary.url(publicId, {
      ...transformations,
      secure: true,
    });
  }
}

export const imageService = ImageService.getInstance();