import { v2 as cloudinary } from 'cloudinary';
import type { ProductImage } from '../types/models/product.types';
import { Readable } from 'stream';

// Configure cloudinary directly in the service
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const imageService = {
  async uploadImage(file: Express.Multer.File): Promise<ProductImage> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'products',
          transformation: [
            { width: 800, height: 800, crop: 'limit' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) return reject(error)
          if (!result) return reject(new Error('Upload failed'))

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format
          })
        }
      )

      const readableStream = new Readable()
      readableStream.push(file.buffer)
      readableStream.push(null)
      readableStream.pipe(uploadStream)
    })
  },

  async deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId)
  },

  async generateVariants(publicId: string) {
    const variants = await Promise.all([
      // Thumbnail
      cloudinary.uploader.explicit(publicId, {
        transformation: [
          { width: 200, height: 200, crop: 'fill' }
        ]
      }),
      // Medium
      cloudinary.uploader.explicit(publicId, {
        transformation: [
          { width: 400, height: 400, crop: 'limit' }
        ]
      })
    ])
    return variants
  }
}
