import { Alarm, DayOfWeek } from '../../data/models/types';

/**
 * ALARM SCHEDULER
 * 
 * Handles alarm scheduling and timing calculations
 */
export class AlarmScheduler {
  /**
   * Calculate next trigger time for an alarm
   */
  calculateNextTrigger(alarm: Alarm): Date | null {
    if (!alarm.enabled || alarm.days.length === 0) {
      return null;
    }

    const now = new Date();
    const [hours, minutes] = alarm.time.split(':').map(Number);

    // Find the next occurrence
    for (let daysAhead = 0; daysAhead < 7; daysAhead++) {
      const candidate = new Date(now);
      candidate.setDate(now.getDate() + daysAhead);
      candidate.setHours(hours, minutes, 0, 0);

      // Skip if this time has already passed today
      if (daysAhead === 0 && candidate <= now) {
        continue;
      }

      // Check if this day is in the alarm's schedule
      const dayName = this.getDayName(candidate.getDay());
      if (alarm.days.includes(dayName)) {
        return candidate;
      }
    }

    return null;
  }

  /**
   * Check if alarm should trigger now
   */
  shouldTriggerNow(alarm: Alarm): boolean {
    if (!alarm.enabled) return false;

    const now = new Date();
    const [hours, minutes] = alarm.time.split(':').map(Number);
    
    // Check if current time matches alarm time (within 1 minute)
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const alarmMinutes = hours * 60 + minutes;
    
    if (Math.abs(currentMinutes - alarmMinutes) > 1) {
      return false;
    }

    // Check if today is in the schedule
    const dayName = this.getDayName(now.getDay());
    if (!alarm.days.includes(dayName)) {
      return false;
    }

    // Check if already triggered today
    if (alarm.lastTriggered) {
      const lastTrigger = new Date(alarm.lastTriggered);
      if (this.isSameDay(lastTrigger, now)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get all alarms that should trigger within the next N minutes
   */
  getUpcomingAlarms(alarms: Alarm[], withinMinutes: number): Alarm[] {
    const now = new Date();
    const cutoff = new Date(now.getTime() + withinMinutes * 60 * 1000);

    return alarms.filter(alarm => {
      if (!alarm.enabled) return false;
      
      const next = alarm.nextTrigger ? new Date(alarm.nextTrigger) : null;
      return next && next >= now && next <= cutoff;
    });
  }

  /**
   * Sort alarms by next trigger time
   */
  sortByNextTrigger(alarms: Alarm[]): Alarm[] {
    return [...alarms].sort((a, b) => {
      if (!a.nextTrigger) return 1;
      if (!b.nextTrigger) return -1;
      return new Date(a.nextTrigger).getTime() - new Date(b.nextTrigger).getTime();
    });
  }

  /**
   * Get time until next alarm
   */
  getTimeUntilNext(alarm: Alarm): number | null {
    if (!alarm.nextTrigger) return null;
    
    const now = new Date();
    const next = new Date(alarm.nextTrigger);
    const diff = next.getTime() - now.getTime();
    
    return Math.max(0, diff);
  }

  /**
   * Format time until alarm (human readable)
   */
  formatTimeUntil(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
      return `${minutes}m`;
    }
    return `${seconds}s`;
  }

  /**
   * Get day name from day index (0 = Sunday)
   */
  private getDayName(dayIndex: number): DayOfWeek {
    const days: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayIndex];
  }

  /**
   * Check if two dates are on the same day
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  /**
   * Validate alarm time format
   */
  validateTime(time: string): boolean {
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(time);
  }

  /**
   * Get next N occurrences of an alarm
   */
  getNextOccurrences(alarm: Alarm, count: number): Date[] {
    const occurrences: Date[] = [];
    let currentAlarm = { ...alarm };

    for (let i = 0; i < count; i++) {
      const next = this.calculateNextTrigger(currentAlarm);
      if (!next) break;

      occurrences.push(next);

      // Update for next calculation
      currentAlarm = {
        ...currentAlarm,
        lastTriggered: next,
      };
    }

    return occurrences;
  }

  /**
   * Check if alarm time conflicts with another alarm
   */
  hasConflict(alarm1: Alarm, alarm2: Alarm, withinMinutes: number = 5): boolean {
    // Check if they share any days
    const sharedDays = alarm1.days.filter(day => alarm2.days.includes(day));
    if (sharedDays.length === 0) return false;

    // Check if times are close
    const [h1, m1] = alarm1.time.split(':').map(Number);
    const [h2, m2] = alarm2.time.split(':').map(Number);

    const minutes1 = h1 * 60 + m1;
    const minutes2 = h2 * 60 + m2;

    return Math.abs(minutes1 - minutes2) <= withinMinutes;
  }
}
