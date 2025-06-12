import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const ImageUploadSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string().refine(type => ACCEPTED_TYPES.includes(type), {
    message: `File must be one of: ${ACCEPTED_TYPES.join(', ')}`
  }),
  size: z.number().max(MAX_FILE_SIZE, 'File size must be under 5MB'),
  buffer: z.instanceof(Buffer)
});

export const validateImage = (file: unknown) => {
  try {
    return ImageUploadSchema.parse(file);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors };
    }
    throw error;
  }
};
