import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const checkCloudinary = async () => {
  try {
    const result = await cloudinary.api.ping();
    return { healthy: true, status: result.status };
  } catch (error) {
    return { healthy: false, error: error instanceof Error ? error.message : 'Cloudinary connection failed' };
  }
};

export { cloudinary };
