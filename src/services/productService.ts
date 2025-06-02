import { db } from '../config/database';
import { Product, ProductStatus, type ProductStatus as ProductStatusType } from '../models/Product';
import { ValidationError, NotFoundError } from '../utils/errors';
import postgres from 'postgres';

// Update ProductRow interface to exactly match database schema
interface ProductRow {
  id: string;
  name: string;
  description?: string;
  price: string; // PostgreSQL DECIMAL returns as string
  category: string;
  status: ProductStatusType;
  stock: number;
  image_urls: string[];
  created_at: Date;
  updated_at: Date;
}

function mapRowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price), // Explicit conversion to number
    category: row.category,
    status: row.status as ProductStatusType,
    stock: Number(row.stock),
    image_urls: Array.isArray(row.image_urls) ? row.image_urls : [],
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

export class ProductService {
  async validateProduct(data: Partial<Product>): Promise<void> {
    // Price validation
    if (data.price && data.price <= 0) {
      throw new ValidationError('Price must be positive');
    }

    // Stock validation
    if (data.stock && data.stock < 0) {
      throw new ValidationError('Stock cannot be negative');
    }

    // Image validation
    if (data.image_urls && data.image_urls.length === 0) {
      throw new ValidationError('At least one image is required');
    }

    // Category validation
    if (data.category) {
      const [category] = await db`
        SELECT id FROM categories WHERE name = ${data.category}
      `;
      if (!category) {
        throw new ValidationError('Invalid category');
      }
    }
  }

  async createProduct(data: Product): Promise<Product> {
    await this.validateProduct(data);
    
    const result = await db.begin(async (client: postgres.TransactionSql) => {
      const [row] = await client<ProductRow[]>`
        INSERT INTO products ${client({
          ...data,
          price: data.price.toString() // Convert number to string for DB
        })}
        RETURNING *
      `;

      await client`
        INSERT INTO audit_logs (
          action_type, entity_type, entity_id, changes
        ) VALUES (
          'create', 
          'product', 
          ${row.id}, 
          ${JSON.stringify(data)}::jsonb
        )
      `;

      return mapRowToProduct(row);
    });

    return result;
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    await this.validateProduct(data);

    const result = await db.begin(async (client: postgres.TransactionSql) => {
      const [row] = await client<ProductRow[]>`
        UPDATE products 
        SET ${client({
          ...data,
          price: data.price?.toString(), // Handle optional price
          updated_at: new Date()
        })}
        WHERE id = ${id}
        RETURNING *
      `;

      if (!row) {
        throw new NotFoundError('Product not found');
      }

      await client`
        INSERT INTO audit_logs (
          action_type, entity_type, entity_id, changes
        ) VALUES (
          'update', 
          'product', 
          ${id},
          ${JSON.stringify({
            before: row,
            after: row
          })}::jsonb
        )
      `;

      return mapRowToProduct(row);
    });

    return result;
  }

  async updateStatus(id: string, status: ProductStatusType): Promise<Product> {
    const [current] = await db<ProductRow[]>`
      SELECT * FROM products WHERE id = ${id}
    `;

    if (!current) {
      throw new NotFoundError('Product not found');
    }

    const allowedTransitions: Record<ProductStatusType, ProductStatusType[]> = {
      draft: ['published', 'archived'],
      published: ['archived'],
      archived: ['draft']
    };

    if (!allowedTransitions[current.status]?.includes(status)) {
      throw new ValidationError(
        `Cannot transition from ${current.status} to ${status}`
      );
    }

    const [row] = await db<ProductRow[]>`
      UPDATE products 
      SET status = ${status},
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    return mapRowToProduct(row);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return await db`
      SELECT * FROM products 
      WHERE category = ${category}
      ORDER BY created_at DESC
    `;
  }

  async getProductWithInventory(id: string) {
    const [product] = await db`
      SELECT p.*, 
        COALESCE(
          json_agg(
            json_build_object(
              'type', im.type,
              'quantity', im.quantity,
              'created_at', im.created_at
            )
          ) FILTER (WHERE im.id IS NOT NULL),
          '[]'
        ) as inventory_movements
      FROM products p
      LEFT JOIN inventory_movements im ON im.product_id = p.id
      WHERE p.id = ${id}
      GROUP BY p.id
    `;

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return product;
  }

  async searchProducts(query: string): Promise<Product[]> {
    return await db`
      SELECT * FROM products 
      WHERE 
        name ILIKE ${'%' + query + '%'} OR
        description ILIKE ${'%' + query + '%'
    } ORDER BY 
        CASE WHEN name ILIKE ${'%' + query + '%'} THEN 1
             WHEN description ILIKE ${'%' + query + '%'} THEN 2
        END
    `;
  }
}
