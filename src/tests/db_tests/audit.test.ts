import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import postgres from 'postgres'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.test' })

const DATABASE_URL = process.env.DATABASE_POOL_URL
if (!DATABASE_URL) {
  throw new Error('DATABASE_POOL_URL not configured')
}

describe('Audit Trail Tests', () => {
  let sql: postgres.Sql
  
  beforeAll(async () => {
    sql = postgres(DATABASE_URL, {
      ssl: { rejectUnauthorized: false },
      idle_timeout: 20,
      max: 1
    })

    try {
      // First drop the table to ensure clean state
      await sql`DROP TABLE IF EXISTS audit_logs CASCADE`

      // Then create fresh table
      await sql`
        CREATE TABLE audit_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          action_type TEXT NOT NULL,
          entity_type TEXT NOT NULL,
          entity_id UUID NOT NULL,
          changes JSONB,
          performed_by TEXT,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        )
      `
      console.log('✅ Audit table initialized')
    } catch (error) {
      console.error('Setup failed:', error)
      throw error
    }
  })

  it('should log product creation', async () => {
    const productId = 'c8e7d462-3e3a-4a98-a547-6cb6f68f0e1f'
    const auditEntry = {
      action_type: 'create',
      entity_type: 'product',
      entity_id: productId,
      changes: { name: 'New Product', price: '99.99' },
      performed_by: 'test-user'
    }

    const [result] = await sql`
      INSERT INTO audit_logs ${sql(auditEntry)}
      RETURNING *
    `
    expect(result.action_type).toBe('create')
    expect(result.entity_type).toBe('product')
  })

  it('should track entity changes', async () => {
    const entityId = crypto.randomUUID()
    const changes = {
      before: { status: 'draft', price: '99.99' },
      after: { status: 'published', price: '149.99' }
    }

    const [log] = await sql`
      INSERT INTO audit_logs 
      (action_type, entity_type, entity_id, changes, performed_by)
      VALUES 
      ('update', 'product', ${entityId}, ${JSON.stringify(changes)}::jsonb, 'test-user')
      RETURNING *
    `

    // Parse the JSON string back to object for comparison
    const parsedChanges = typeof log.changes === 'string' 
      ? JSON.parse(log.changes) 
      : log.changes;

    expect(parsedChanges).toEqual(changes)
  })

  it('should query audit history by date range', async () => {
    const entityId = crypto.randomUUID()
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    await sql`
      INSERT INTO audit_logs 
      (action_type, entity_type, entity_id, changes, performed_by, created_at)
      VALUES 
      ('create', 'product', ${entityId}, '{"status":"draft"}', 'user1', ${yesterday}),
      ('update', 'product', ${entityId}, '{"status":"published"}', 'user2', NOW())
    `

    const logs = await sql`
      SELECT * FROM audit_logs 
      WHERE entity_id = ${entityId}
      AND created_at > ${yesterday}
      ORDER BY created_at DESC
    `
    expect(logs.length).toBe(1)
    expect(logs[0].action_type).toBe('update')
  })

  it('should track user actions', async () => {
    const users = ['admin1', 'editor1', 'viewer1']
    const entityId = crypto.randomUUID()

    for (const user of users) {
      await sql`
        INSERT INTO audit_logs 
        (action_type, entity_type, entity_id, performed_by)
        VALUES ('view', 'product', ${entityId}, ${user})
      `
    }

    const logs = await sql`
      SELECT performed_by, COUNT(*) as action_count
      FROM audit_logs 
      WHERE entity_id = ${entityId}
      GROUP BY performed_by
    `
    expect(logs.length).toBe(users.length)
  })

  it('should maintain data integrity', async () => {
    const entityId = crypto.randomUUID()
    const originalData = { price: '99.99', stock: 100 }
    const updatedData = { price: '149.99', stock: 75 }

    await sql`
      INSERT INTO audit_logs 
      (action_type, entity_type, entity_id, changes, performed_by)
      VALUES (
        'update', 
        'product', 
        ${entityId}, 
        ${JSON.stringify({
          before: originalData,
          after: updatedData
        })}::jsonb,
        'system'
      )
    `

    const [log] = await sql`
      SELECT * FROM audit_logs 
      WHERE entity_id = ${entityId}
    `
    
    const changes = typeof log.changes === 'string' 
      ? JSON.parse(log.changes) 
      : log.changes

    expect(changes.before.price).toBe(originalData.price)
    expect(changes.after.price).toBe(updatedData.price)
  })

  afterAll(async () => {
    try {
      await sql`DROP TABLE IF EXISTS audit_logs CASCADE`
      await sql.end()
    } catch (error) {
      console.error('Cleanup failed:', error)
    }
  })
})
