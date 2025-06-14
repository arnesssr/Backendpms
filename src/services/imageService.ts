import { v2 as cloudinary } from 'cloudinary';
import { supabase } from '../config/supabaseClient';
import sharp, { Sharp, ResizeOptions } from 'sharp';

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

  private constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
  }

  static getInstance(): ImageService {
    if (!ImageService.instance) {
      ImageService.instance = new ImageService();
    }
    return ImageService.instance;
  }

  async uploadImage(
    file: Buffer,
    options: ImageOptions = {}
  ): Promise<ImageMetadata> {
    const opts = { ...this.defaultOptions, ...options };
    
    // Optimize image before upload
    const optimized = await this.optimizeImage(file, opts);
    
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

  private async storeImageMetadata(
    publicId: string,
    metadata: ImageMetadata
  ): Promise<void> {
    await supabase.from('image_metadata').insert({
      public_id: publicId,
      metadata,
      version: metadata.version
    });
  }

  getCdnUrl(publicId: string, transformations: Record<string, any> = {}): string {
    return cloudinary.url(publicId, {
      secure: true,
      ...transformations
    });
  }
}
