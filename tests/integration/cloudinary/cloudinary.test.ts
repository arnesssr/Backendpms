import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { cloudinary } from '../../../src/config/cloudinary';
import { v2 as cloudinaryV2 } from 'cloudinary';

describe('Cloudinary Integration', () => {
  // Increase timeout for API calls
  beforeAll(() => {
    jest.setTimeout(10000);
  });

  // Handle cleanup without using non-existent close method
  afterAll(async () => {
    // Destroy the cloudinary instance
    cloudinaryV2.config({});
    // Allow time for connections to close
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  it('should connect to Cloudinary successfully', async () => {
    expect.assertions(1);
    const result = await cloudinary.api.ping();
    expect(result).toBeDefined();
  });

  it('should have proper configuration', () => {
    expect.assertions(3);
    const config = cloudinary.config();
    expect(config.cloud_name).toBe(process.env.CLOUDINARY_CLOUD_NAME);
    expect(config.api_key).toBe(process.env.CLOUDINARY_API_KEY);
    expect(config.api_secret).toBe(process.env.CLOUDINARY_API_SECRET);
  });
});
