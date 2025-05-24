import { db } from '../config/database';

export const productService = {
  async getProducts() {
    return await db`
      SELECT * FROM products 
      WHERE status = 'published'
    `;
  },

  async getProductById(id: string) {
    const [product] = await db`
      SELECT * FROM products 
      WHERE id = ${id}
    `;
    return product;
  },

  async createProduct(productData: any) {
    const [product] = await db`
      INSERT INTO products ${db(productData)}
      RETURNING *
    `;
    return product;
  },

  async updateProduct(id: string, updates: any) {
    const [updated] = await db`
      UPDATE products 
      SET ${db(updates)}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    return updated;
  }
};
