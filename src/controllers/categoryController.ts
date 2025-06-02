import { Request, Response } from 'express';
import { CategoryService } from '../services/categoryService';
import { db } from '../config/database';
import { CategorySchema, CategoryStatus } from '../models/Category';
import { ValidationError, NotFoundError } from '../utils/errors';

export class CategoryController {
  private categoryService: CategoryService;

  constructor() {
    this.categoryService = new CategoryService();
  }

  async getCategories(req: Request, res: Response) {
    try {
      const categories = await db`
        SELECT * FROM categories 
        ORDER BY name ASC
      `;
      res.json(categories);
    } catch (error: unknown) {
      console.error('Failed to fetch categories:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  }

  async createCategory(req: Request, res: Response) {
    const { name, description } = req.body;
    try {
      const [category] = await db`
        INSERT INTO categories (name, description) 
        VALUES (${name}, ${description}) 
        RETURNING *
      `;
      res.status(201).json(category);
    } catch (error: unknown) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
      } else {
        console.error('Category creation error:', error);
        res.status(500).json({ error: 'Failed to create category' });
      }
    }
  }

  async updateCategoryStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      await this.categoryService.handleStatusChanges(id, status);
      res.json({ message: 'Status updated successfully' });
    } catch (error: unknown) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else {
        console.error('Status update failed:', error);
        res.status(500).json({ error: 'Failed to update status' });
      }
    }
  }

  async validateStatusTransitions(req: Request, res: Response) {
    try {
      const { currentStatus, newStatus } = req.body;
      const isValid = await this.categoryService.validateStatusUpdates(
        currentStatus,
        newStatus
      );

      res.json({ valid: isValid });
    } catch (error: unknown) {
      console.error('Status validation error:', error);
      res.status(500).json({ error: 'Failed to validate status' });
    }
  }

  async getProductsInCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const products = await db`
        SELECT p.* 
        FROM products p
        WHERE p.category_id = ${id}
        ORDER BY p.created_at DESC
      `;

      res.json(products);
    } catch (error: unknown) {
      console.error('Failed to fetch products:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  }

  async validateCategoryDeletion(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const count = await this.categoryService.handleProductAssociations(id);

      res.json({
        canDelete: count === 0,
        productCount: count,
      });
    } catch (error: unknown) {
      console.error('Deletion validation error:', error);
      res.status(500).json({ error: 'Failed to validate deletion' });
    }
  }

  async getSubcategories(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const subcategories = await db`
        SELECT * FROM categories
        WHERE parent_id = ${id}
        ORDER BY name
      `;

      res.json(subcategories);
    } catch (error: unknown) {
      console.error('Failed to fetch subcategories:', error);
      res.status(500).json({ error: 'Failed to fetch subcategories' });
    }
  }

  async getParentCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const [category] = await db`
        SELECT p.*
        FROM categories c
        JOIN categories p ON c.parent_id = p.id
        WHERE c.id = ${id}
      `;

      res.json(category || null);
    } catch (error: unknown) {
      console.error('Failed to fetch parent category:', error);
      res.status(500).json({ error: 'Failed to fetch parent category' });
    }
  }

  async validateHierarchyLevel(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const [result] = await db`
        WITH RECURSIVE hierarchy AS (
          SELECT id, parent_id, 0 as level
          FROM categories
          WHERE id = ${id}
          UNION ALL
          SELECT c.id, c.parent_id, h.level + 1
          FROM categories c
          JOIN hierarchy h ON h.parent_id = c.id
        )
        SELECT MAX(level) as depth FROM hierarchy
      `;

      res.json({
        valid: (result?.depth || 0) < 3,
        currentDepth: result?.depth || 0,
      });
    } catch (error: unknown) {
      console.error('Hierarchy level validation error:', error);
      res.status(500).json({ error: 'Failed to validate hierarchy level' });
    }
  }
}
