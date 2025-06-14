import { z } from 'zod';

const BaseWebhookSchema = z.object({
  type: z.enum(['product', 'inventory', 'order']),
  timestamp: z.string().datetime(),
  signature: z.string()
});

export const ProductWebhookSchema = BaseWebhookSchema.extend({
  type: z.literal('product'),
  data: z.object({
    id: z.string().uuid(),
    action: z.enum(['created', 'updated', 'deleted', 'published']),
    product: z.object({
      id: z.string().uuid(),
      status: z.enum(['draft', 'published', 'archived'])
    })
  })
});

export const validateWebhook = (data: unknown) => {
  try {
    const base = BaseWebhookSchema.parse(data);
    switch (base.type) {
      case 'product':
        return ProductWebhookSchema.parse(data);
      // Add other webhook types as needed
      default:
        throw new Error(`Unsupported webhook type: ${base.type}`);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors };
    }
    throw error;
  }
};
