import { Router, Request, Response } from 'express';
import { db } from '../config/database';
import { handleImageUpload, validateImages } from '../middleware/imageUploadMiddleware';
import { productController } from '../controllers/productController';
import { ProductPublishService } from '../services/productPublishService';

const router = Router();
const publishService = ProductPublishService.getInstance();

// Get all published products
router.get('/', async (req: Request, res: Response) => {
  try {
    const products = await db`
      SELECT * FROM products 
      WHERE status = 'published'
    `;
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Create new product (draft)
router.post('/', 
  handleImageUpload('images'), 
  validateImages, 
  async (req: Request, res: Response) => {
    try {
      const { name, description, price, category, status, stock } = req.body;

      // Basic validation - removed image requirement
      if (!name || !price || !category) {
        return res.status(400).json({ error: 'Required fields: name, price, category' });
      }

      // Create product with default empty image array
      const [product] = await db`
        INSERT INTO products ${db({
          name,
          description,
          price,
          category,
          status: status || 'draft',
          stock: stock || 0,
          image_urls: []  // Default empty array
        })}
        RETURNING *
      `;
      
      res.status(201).json(product);
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({ error: 'Failed to create product' });
    }
  }
);

// Update existing product
router.put('/:id',
  handleImageUpload('images'),
  productController.updateProduct
);

// Publish product
router.post('/:id/publish', async (req, res) => {
  try {
    const { id } = req.params;
    const publishedProduct = await publishService.publishProduct(id);
    res.json({
      success: true,
      data: publishedProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to publish product'
    });
  }
});

// Handle image uploads separately
router.post('/images',
  handleImageUpload('images'),
  validateImages,
  productController.uploadImages
);

// Get product by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await db`
      SELECT * FROM products 
      WHERE id = ${id}
    `;
    if (product.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product[0]);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Delete product
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await db`
      DELETE FROM products 
      WHERE id = ${id}
      RETURNING *
    `;
    if (result.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result[0]);
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
