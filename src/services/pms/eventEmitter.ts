import { EventEmitter } from 'events';
import { supabase } from '../../config/database';
import type { PMSEvent } from '../../models/pms/Event';

class PMSEventEmitter extends EventEmitter {
  // Keep original sync emit from EventEmitter
  emit(eventName: string | symbol, ...args: any[]): boolean {
    return super.emit(eventName, ...args);
  }

  // Add new async method for PMS events
  async emitPMSEvent(event: string, data: any): Promise<void> {
    try {
      // Log event using Supabase
      const { error } = await supabase
        .from('pms_events')
        .insert([{
          type: event,
          action: data.action,
          data: data,
          processed: false,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;
      
      // Emit event synchronously
      this.emit(event, data);
    } catch (error) {
      console.error('PMS Event Error:', error);
      throw error;
    }
  }
}

export const pmsEvents = new PMSEventEmitter();
