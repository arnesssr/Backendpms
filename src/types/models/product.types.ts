export interface ProductImage {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  status: 'draft' | 'published' | 'archived';
  stock: number;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  archivedAt?: string;
  sku?: string;
}
