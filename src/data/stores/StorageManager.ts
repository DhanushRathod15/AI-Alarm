import { STORAGE_KEYS } from '../../constants/config';

/**
 * STORAGE MANAGER
 * 
 * Centralized storage management for localStorage and IndexedDB
 */
export class StorageManager {
  /**
   * Save data to localStorage
   */
  static save<T>(key: string, data: T): void {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(key, serialized);
    } catch (error) {
      throw new Error('Storage quota exceeded or data cannot be serialized');
    }
  }

  /**
   * Load data from localStorage
   */
  static load<T>(key: string): T | null {
    try {
      const serialized = localStorage.getItem(key);
      if (serialized === null) return null;
      return JSON.parse(serialized) as T;
    } catch (error) {
      return null;
    }
  }

  /**
   * Remove data from localStorage
   */
  static remove(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Clear all app data
   */
  static clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  /**
   * Check if key exists
   */
  static exists(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  /**
   * Get storage size (approximate)
   */
  static getStorageSize(): { used: number; available: number } {
    let used = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }

    // Most browsers allow ~5-10MB for localStorage
    const available = 10 * 1024 * 1024; // 10MB estimate

    return { used, available };
  }

  /**
   * Export all data as JSON
   */
  static exportData(): string {
    const data: Record<string, any> = {};
    
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      const value = localStorage.getItem(key);
      if (value) {
        data[name] = JSON.parse(value);
      }
    });

    return JSON.stringify(data, null, 2);
  }

  /**
   * Import data from JSON
   */
  static importData(jsonString: string): void {
    try {
      const data = JSON.parse(jsonString);
      
      Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
        if (data[name]) {
          localStorage.setItem(key, JSON.stringify(data[name]));
        }
      });
    } catch (error) {
      throw new Error('Invalid data format');
    }
  }

  /**
   * Backup data to download
   */
  static downloadBackup(): void {
    const data = this.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-alarm-backup-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Migrate old data format to new format
   */
  static migrate(): void {
    // Add migration logic here when schema changes
    // Example: Migrate from v1 to v2
    // const version = localStorage.getItem('version');
    // if (version === '1.0') {
    //   // Perform migration
    //   localStorage.setItem('version', '2.0');
    // }
  }
}

/**
 * Specific storage managers for different data types
 */

export class UserStorage {
  static save(profile: any): void {
    StorageManager.save(STORAGE_KEYS.USER_PROFILE, profile);
  }

  static load(): any | null {
    return StorageManager.load(STORAGE_KEYS.USER_PROFILE);
  }

  static clear(): void {
    StorageManager.remove(STORAGE_KEYS.USER_PROFILE);
  }
}

export class AlarmStorage {
  static save(alarms: any[]): void {
    StorageManager.save(STORAGE_KEYS.ALARMS, alarms);
  }

  static load(): any[] {
    return StorageManager.load(STORAGE_KEYS.ALARMS) || [];
  }

  static clear(): void {
    StorageManager.remove(STORAGE_KEYS.ALARMS);
  }
}

export class SessionStorage {
  static save(sessions: any[]): void {
    StorageManager.save(STORAGE_KEYS.SESSIONS, sessions);
  }

  static load(): any[] {
    return StorageManager.load(STORAGE_KEYS.SESSIONS) || [];
  }

  static clear(): void {
    StorageManager.remove(STORAGE_KEYS.SESSIONS);
  }

  static savePendingAlarm(alarmId: string): void {
    StorageManager.save(STORAGE_KEYS.PENDING_ALARM, alarmId);
  }

  static loadPendingAlarm(): string | null {
    return StorageManager.load(STORAGE_KEYS.PENDING_ALARM);
  }

  static clearPendingAlarm(): void {
    StorageManager.remove(STORAGE_KEYS.PENDING_ALARM);
  }
}

export class AnalyticsStorage {
  static save(analytics: any): void {
    StorageManager.save(STORAGE_KEYS.ANALYTICS, analytics);
  }

  static load(): any | null {
    return StorageManager.load(STORAGE_KEYS.ANALYTICS);
  }

  static clear(): void {
    StorageManager.remove(STORAGE_KEYS.ANALYTICS);
  }
}
