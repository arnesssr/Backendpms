import { supabase } from '../config/supabaseClient';
import { io } from '../app';

export class RealtimeService {
  private static instance: RealtimeService;
  private channels: Map<string, any> = new Map();
  private status = {
    isConnected: false,
    lastError: null as Error | null,
    reconnectAttempts: 0,
    lastEventTime: null as Date | null
  };

  private constructor() {
    this.setupErrorHandlers();
  }

  static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService();
    }
    return RealtimeService.instance;
  }

  private setupErrorHandlers() {
    supabase.channel('system')
      .on('system', { event: '*' }, (status) => {
        console.log('Realtime System Status:', status);
        this.status.isConnected = status.online;
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          this.status.isConnected = true;
          console.log('✅ Realtime connected');
        } else {
          this.status.isConnected = false;
          console.error('❌ Realtime disconnected:', status);
        }
      });
  }

  async initialize() {
    try {
      const productChannel = supabase.channel('products')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, 
          this.handleDatabaseEvent.bind(this, 'product'))
        .subscribe();

      const inventoryChannel = supabase.channel('inventory')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' },
          this.handleDatabaseEvent.bind(this, 'inventory'))
        .subscribe();

      this.channels.set('products', productChannel);
      this.channels.set('inventory', inventoryChannel);

      return true;
    } catch (error) {
      this.status.lastError = error as Error;
      console.error('Realtime initialization failed:', error);
      return false;
    }
  }

  private handleDatabaseEvent(type: string, payload: any) {
    try {
      this.status.lastEventTime = new Date();
      io.emit(`${type}.${payload.eventType}`, payload.new);
      console.log(`✅ Realtime event emitted: ${type}.${payload.eventType}`);
    } catch (error) {
      this.status.lastError = error as Error;
      console.error(`❌ Realtime event error: ${type}.${payload.eventType}`, error);
    }
  }

  getStatus() {
    return {
      isConnected: this.status.isConnected,
      lastError: this.status.lastError?.message,
      lastEventTime: this.status.lastEventTime,
      activeChannels: Array.from(this.channels.keys()),
      channelCount: this.channels.size
    };
  }

  isHealthy(): boolean {
    return this.status.isConnected && !this.status.lastError;
  }
}
