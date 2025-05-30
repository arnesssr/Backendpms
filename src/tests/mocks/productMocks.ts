export const mockProduct = {
  name: 'Test Product',
  description: 'Test Description',
  price: 99.99,
  category: 'test-category',
  status: 'draft',
  stock: 10,
  image_urls: ['https://example.com/image.jpg']
}

export const mockProducts = [
  mockProduct,
  {
    ...mockProduct,
    name: 'Test Product 2',
    price: 149.99
  },
  {
    ...mockProduct,
    name: 'Test Product 3',
    price: 199.99
  }
]
