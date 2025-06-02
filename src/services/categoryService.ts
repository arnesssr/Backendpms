import { db } from '../config/database';
import { Category, CategoryStatus } from '../models/Category';
import { NotFoundError, ValidationError } from '../utils/errors';
import { z } from 'zod';

interface CategoryWithCount extends Category {
  product_count: number;
}

export class CategoryService {
  async formatCategoryData(data: Partial<Category>): Promise<Partial<Category>> {
    return {
      ...data,
      updated_at: new Date()
    };
  }

  async validateCategoryRelations(categoryId: string): Promise<CategoryWithCount> {
    const [category] = await db`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      WHERE c.id = ${categoryId}
      GROUP BY c.id
    `;
    
    if (!category) {
      throw new NotFoundError('Category not found');
    }
    
    return category as CategoryWithCount;
  }

  async preventDuplicateNames(name: string, excludeId?: string): Promise<void> {
    const query = excludeId 
      ? db`SELECT id FROM categories WHERE name = ${name} AND id != ${excludeId}`
      : db`SELECT id FROM categories WHERE name = ${name}`;
    
    const existing = await query;
    if (existing.length > 0) {
      throw new ValidationError('Category name already exists');
    }
  }

  async handleProductAssociations(categoryId: string): Promise<number> {
    const [result] = await db`
      SELECT COUNT(*) as count 
      FROM products 
      WHERE category_id = ${categoryId}
    `;
    return result.count;
  }

  async handleStatusChanges(
    categoryId: string, 
    newStatus: z.infer<typeof CategoryStatus>
  ): Promise<void> {
    const category = await this.validateCategoryRelations(categoryId);
    
    if (newStatus === 'archived' && category.product_count > 0) {
      throw new ValidationError(
        'Cannot archive category with associated products'
      );
    }

    await db`
      UPDATE categories 
      SET status = ${newStatus}, 
          updated_at = NOW() 
      WHERE id = ${categoryId}
    `;
  }

  async validateStatusUpdates(
    currentStatus: z.infer<typeof CategoryStatus>,
    newStatus: z.infer<typeof CategoryStatus>
  ): Promise<boolean> {
    const allowedTransitions: Record<z.infer<typeof CategoryStatus>, z.infer<typeof CategoryStatus>[]> = {
      active: ['inactive', 'archived'],
      inactive: ['active', 'archived'],
      archived: ['inactive']
    };

    return allowedTransitions[currentStatus]?.includes(newStatus) ?? false;
  }
}
