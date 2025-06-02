import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import postgres from 'postgres'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.test' })

const DATABASE_URL = process.env.DATABASE_POOL_URL
if (!DATABASE_URL) {
  throw new Error('DATABASE_POOL_URL not configured')
}

describe('Settings Database Tests', () => {
  let sql: postgres.Sql
  
  beforeAll(async () => {
    sql = postgres(DATABASE_URL, {
      ssl: { rejectUnauthorized: false },
      idle_timeout: 20,
      max: 1
    })

    try {
      await sql`DROP TABLE IF EXISTS settings CASCADE`
      await sql`
        CREATE TABLE settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          key TEXT UNIQUE NOT NULL,
          value JSONB NOT NULL,
          category TEXT NOT NULL,
          description TEXT,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        )
      `
      console.log('✅ Settings table initialized')
    } catch (error) {
      console.error('Setup failed:', error)
      throw error
    }
  })

  it('should store application settings', async () => {
    const setting = {
      key: 'app.theme',
      value: { mode: 'dark', primary_color: '#000000' },
      category: 'appearance',
      description: 'Application theme settings'
    }

    const [result] = await sql`
      INSERT INTO settings ${sql(setting)}
      RETURNING *
    `
    expect(result.key).toBe(setting.key)
    expect(result.value).toEqual(setting.value)
  })

  it('should enforce unique setting keys', async () => {
    const key = 'test.unique'
    await sql`
      INSERT INTO settings (key, value, category)
      VALUES (${key}, '{"value": true}'::jsonb, 'test')
    `

    try {
      await sql`
        INSERT INTO settings (key, value, category)
        VALUES (${key}, '{"value": false}'::jsonb, 'test')
      `
      fail('Should not allow duplicate keys')
    } catch (error: any) {
      expect(error.code).toBe('23505') // Unique violation
    }
  })

  it('should update setting values', async () => {
    // Create setting
    const [setting] = await sql`
      INSERT INTO settings (key, value, category)
      VALUES ('email.notifications', '{"enabled": false}'::jsonb, 'notifications')
      RETURNING *
    `

    // Update setting
    const newValue = { enabled: true, frequency: 'daily' }
    const [updated] = await sql`
      UPDATE settings 
      SET value = ${JSON.stringify(newValue)}::jsonb,
          updated_at = NOW()
      WHERE id = ${setting.id}
      RETURNING *
    `

    // Parse JSON if returned as string
    const parsedValue = typeof updated.value === 'string' 
      ? JSON.parse(updated.value) 
      : updated.value

    expect(parsedValue).toEqual(newValue)
    expect(new Date(updated.updated_at).getTime())
      .toBeGreaterThan(new Date(updated.created_at).getTime())
  })

  afterAll(async () => {
    await sql`DROP TABLE IF EXISTS settings CASCADE`
    await sql.end()
  })
})
