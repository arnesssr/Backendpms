import { supabase } from '../config/database';
import { redis } from '../config/redis';

interface AuditEvent {
  action: string;
  userId?: string;
  resourceType: string;
  resourceId: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
  timestamp: string;
}

export class AuditService {
  private static instance: AuditService;
  private readonly CACHE_PREFIX = 'audit:';
  private readonly CACHE_TTL = 3600; // 1 hour

  private constructor() {}

  public static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  async logEvent(event: Omit<AuditEvent, 'timestamp'>) {
    const auditEvent: AuditEvent = {
      ...event,
      timestamp: new Date().toISOString()
    };

    // Store in database
    const { error } = await supabase
      .from('audit_logs')
      .insert(auditEvent);

    if (error) throw new Error(`Audit log failed: ${error.message}`);

    // Cache recent events
    await this.cacheEvent(auditEvent);

    return auditEvent;
  }

  private async cacheEvent(event: AuditEvent) {
    const key = `${this.CACHE_PREFIX}${event.resourceType}:${event.resourceId}`;
    await redis.setex(key, this.CACHE_TTL, JSON.stringify(event));
  }

  async getResourceHistory(resourceType: string, resourceId: string) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .match({ resourceType, resourceId })
      .order('timestamp', { ascending: false });

    if (error) throw new Error(`Failed to fetch audit logs: ${error.message}`);
    return data;
  }
}
