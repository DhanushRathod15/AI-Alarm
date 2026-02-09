import { useState, useEffect, useCallback } from 'react';
import { Alarm, AlarmSession, Question } from '../data/models/types';
import { AlarmScheduler } from '../core/alarm-engine/AlarmScheduler';
import { AlarmTrigger } from '../core/alarm-engine/AlarmTrigger';
import { AlarmStorage, SessionStorage } from '../data/stores/StorageManager';

/**
 * Hook for managing alarms
 */
export function useAlarmEngine() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [activeSession, setActiveSession] = useState<AlarmSession | null>(null);
  const [scheduler] = useState(() => new AlarmScheduler());
  const [trigger] = useState(() => new AlarmTrigger());

  // Load alarms from storage
  useEffect(() => {
    const stored = AlarmStorage.load();
    if (stored && stored.length > 0) {
      setAlarms(stored);
    }
  }, []);

  // Save alarms to storage whenever they change
  useEffect(() => {
    if (alarms.length > 0) {
      AlarmStorage.save(alarms);
    }
  }, [alarms]);

  // Check for pending alarm on mount
  useEffect(() => {
    const pendingAlarmId = SessionStorage.loadPendingAlarm();
    if (pendingAlarmId) {
      const alarm = alarms.find(a => a.id === pendingAlarmId);
      if (alarm) {
        triggerAlarm(alarm);
      }
      SessionStorage.clearPendingAlarm();
    }
  }, []);

  /**
   * Create a new alarm
   */
  const createAlarm = useCallback((alarmData: Omit<Alarm, 'id' | 'createdAt' | 'updatedAt' | 'totalRings' | 'successfulDismisses' | 'failedDismisses' | 'snoozeCount' | 'averageTimeToSolve'>): Alarm => {
    const newAlarm: Alarm = {
      ...alarmData,
      id: `alarm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      totalRings: 0,
      successfulDismisses: 0,
      failedDismisses: 0,
      snoozeCount: 0,
      averageTimeToSolve: 0,
    };

    // Calculate next trigger
    newAlarm.nextTrigger = scheduler.calculateNextTrigger(newAlarm) || undefined;

    setAlarms(prev => [...prev, newAlarm]);
    return newAlarm;
  }, [scheduler]);

  /**
   * Update an existing alarm
   */
  const updateAlarm = useCallback((id: string, updates: Partial<Alarm>): void => {
    setAlarms(prev => prev.map(alarm => {
      if (alarm.id === id) {
        const updated = { ...alarm, ...updates, updatedAt: new Date() };
        updated.nextTrigger = scheduler.calculateNextTrigger(updated) || undefined;
        return updated;
      }
      return alarm;
    }));
  }, [scheduler]);

  /**
   * Delete an alarm
   */
  const deleteAlarm = useCallback((id: string): void => {
    setAlarms(prev => prev.filter(alarm => alarm.id !== id));
  }, []);

  /**
   * Toggle alarm enabled/disabled
   */
  const toggleAlarm = useCallback((id: string): void => {
    setAlarms(prev => prev.map(alarm => {
      if (alarm.id === id) {
        const updated = { ...alarm, enabled: !alarm.enabled, updatedAt: new Date() };
        updated.nextTrigger = scheduler.calculateNextTrigger(updated) || undefined;
        return updated;
      }
      return alarm;
    }));
  }, [scheduler]);

  /**
   * Trigger an alarm (start ringing)
   */
  const triggerAlarm = useCallback(async (alarm: Alarm): Promise<AlarmSession> => {
    const session = await trigger.triggerAlarm(alarm);
    setActiveSession(session);

    // Update alarm stats
    updateAlarm(alarm.id, {
      totalRings: alarm.totalRings + 1,
      lastTriggered: new Date(),
    });

    return session;
  }, [trigger, updateAlarm]);

  /**
   * Dismiss active alarm
   */
  const dismissAlarm = useCallback((correct: boolean): void => {
    if (!activeSession) return;

    trigger.dismissAlarm(activeSession);

    // Update alarm stats
    const alarm = alarms.find(a => a.id === activeSession.alarmId);
    if (alarm) {
      updateAlarm(alarm.id, {
        successfulDismisses: alarm.successfulDismisses + (correct ? 1 : 0),
        failedDismisses: alarm.failedDismisses + (correct ? 0 : 1),
      });
    }

    setActiveSession(null);
  }, [activeSession, trigger, alarms, updateAlarm]);

  /**
   * Snooze active alarm
   */
  const snoozeAlarm = useCallback((duration: number): Date | null => {
    if (!activeSession) return null;

    const alarm = alarms.find(a => a.id === activeSession.alarmId);
    if (!alarm) return null;

    // Check snooze limit
    if (activeSession.snoozeCount >= alarm.maxSnoozeCount) {
      return null;
    }

    const wakeTime = trigger.snoozeAlarm(activeSession, duration);

    // Update alarm stats
    updateAlarm(alarm.id, {
      snoozeCount: alarm.snoozeCount + 1,
    });

    // Schedule to re-trigger
    setTimeout(() => {
      if (alarm) {
        triggerAlarm(alarm);
      }
    }, duration * 60 * 1000);

    setActiveSession(null);
    return wakeTime;
  }, [activeSession, trigger, alarms, updateAlarm, triggerAlarm]);

  /**
   * Get next alarm
   */
  const getNextAlarm = useCallback((): Alarm | null => {
    const enabled = alarms.filter(a => a.enabled && a.nextTrigger);
    if (enabled.length === 0) return null;

    return scheduler.sortByNextTrigger(enabled)[0];
  }, [alarms, scheduler]);

  /**
   * Get upcoming alarms
   */
  const getUpcomingAlarms = useCallback((minutes: number = 60): Alarm[] => {
    return scheduler.getUpcomingAlarms(alarms, minutes);
  }, [alarms, scheduler]);

  return {
    alarms,
    activeSession,
    createAlarm,
    updateAlarm,
    deleteAlarm,
    toggleAlarm,
    triggerAlarm,
    dismissAlarm,
    snoozeAlarm,
    getNextAlarm,
    getUpcomingAlarms,
    scheduler,
    trigger,
  };
}
