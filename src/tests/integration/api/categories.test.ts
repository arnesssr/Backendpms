import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { testClient } from '../../helpers/testClient';
import { db } from '../../../config/database';

describe('Category API Endpoints', () => {
  let categoryId: string;

  beforeAll(async () => {
    await db`DELETE FROM categories`;
  });

  afterAll(async () => {
    await db`DELETE FROM categories`;
  });

  const testCategory = {
    name: 'Test Category',
    description: 'Test Description'
  };

  it('should create a new category', async () => {
    const response = await testClient.categories.create(testCategory);
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(typeof response.body.id).toBe('string');
    // UUID format validation
    expect(response.body.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    expect(response.body.name).toBe(testCategory.name);
    categoryId = response.body.id;
  });

  it('should get all categories', async () => {
    const response = await testClient.categories.getAll();
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].name).toBe(testCategory.name);
  });

  it('should update a category', async () => {
    const update = { name: 'Updated Category' };
    const response = await testClient.categories.update(categoryId, update);
    
    expect(response.status).toBe(200);
    expect(response.body.name).toBe(update.name);
  });

  it('should delete a category', async () => {
    const response = await testClient.categories.delete(categoryId);
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(categoryId);
  });
});
