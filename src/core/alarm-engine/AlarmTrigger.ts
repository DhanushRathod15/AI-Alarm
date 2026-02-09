import { Alarm, AlarmSession, QuestionAttempt } from '../../data/models/types';

/**
 * ALARM TRIGGER
 * 
 * Handles alarm triggering, sound escalation, and session management
 */
export class AlarmTrigger {
  private audioContext: AudioContext | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private volumeInterval: NodeJS.Timeout | null = null;
  private currentVolume: number = 0.7;

  /**
   * Trigger an alarm (start ringing)
   */
  async triggerAlarm(alarm: Alarm): Promise<AlarmSession> {
    // Create session
    const session: AlarmSession = {
      id: this.generateSessionId(),
      alarmId: alarm.id,
      userId: alarm.userId,
      triggeredAt: new Date(),
      duration: 0,
      questions: [],
      currentQuestionIndex: 0,
      totalQuestionsRequired: alarm.questionsRequired,
      totalAttempts: 0,
      correctAnswers: 0,
      accuracy: 0,
      snoozeCount: 0,
      appCloseAttempts: 0,
      escapeAttempts: 0,
      hintsUsed: 0,
      status: 'active',
      dismissedBy: 'manual',
      xpEarned: 0,
      streakMaintained: false,
      achievementsUnlocked: [],
    };

    // Play alarm sound
    if (alarm.userId) { // Check if user has sound enabled
      await this.playAlarmSound();
    }

    // Start volume escalation if enabled
    if (alarm.escalateSoundVolume) {
      this.startVolumeEscalation();
    }

    // Trigger vibration
    this.triggerVibration();

    // Show notification
    this.showNotification(alarm);

    return session;
  }

  /**
   * Dismiss alarm (stop ringing)
   */
  dismissAlarm(session: AlarmSession): void {
    // Stop sound
    this.stopAlarmSound();

    // Stop volume escalation
    if (this.volumeInterval) {
      clearInterval(this.volumeInterval);
      this.volumeInterval = null;
    }

    // Stop vibration
    this.stopVibration();

    // Update session
    session.dismissedAt = new Date();
    session.duration = session.dismissedAt.getTime() - session.triggeredAt.getTime();
    session.status = 'completed';
  }

  /**
   * Snooze alarm
   */
  snoozeAlarm(session: AlarmSession, duration: number): Date {
    // Stop sound temporarily
    this.stopAlarmSound();

    // Calculate wake time
    const wakeTime = new Date();
    wakeTime.setMinutes(wakeTime.getMinutes() + duration);

    session.snoozeCount++;
    session.status = 'snoozed';

    return wakeTime;
  }

  /**
   * Play alarm sound
   */
  private async playAlarmSound(): Promise<void> {
    try {
      // Try to use Web Audio API for better control
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Fallback to HTML5 Audio
      this.currentAudio = new Audio('/sounds/alarm.mp3');
      this.currentAudio.loop = true;
      this.currentAudio.volume = this.currentVolume;

      // Play
      await this.currentAudio.play();
    } catch (error) {
      // Silent fail
    }
  }

  /**
   * Stop alarm sound
   */
  private stopAlarmSound(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  /**
   * Start volume escalation
   */
  private startVolumeEscalation(): void {
    this.volumeInterval = setInterval(() => {
      if (this.currentVolume < 1.0 && this.currentAudio) {
        this.currentVolume = Math.min(1.0, this.currentVolume + 0.1);
        this.currentAudio.volume = this.currentVolume;
      }
    }, 5000); // Every 5 seconds
  }

  /**
   * Trigger vibration
   */
  private triggerVibration(): void {
    if ('vibrate' in navigator) {
      // Vibration pattern: vibrate for 200ms, pause 100ms, repeat
      const pattern = [200, 100, 200, 100, 400];
      navigator.vibrate(pattern);
    }
  }

  /**
   * Stop vibration
   */
  private stopVibration(): void {
    if ('vibrate' in navigator) {
      navigator.vibrate(0);
    }
  }

  /**
   * Show notification
   */
  private async showNotification(alarm: Alarm): Promise<void> {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('⏰ Alarm Ringing!', {
        body: alarm.label || 'Time to solve a question!',
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        tag: `alarm-${alarm.id}`,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }

  /**
   * Play success sound
   */
  async playSuccessSound(): Promise<void> {
    const audio = new Audio('/sounds/success.mp3');
    audio.volume = 0.6;
    await audio.play();
  }

  /**
   * Play failure sound
   */
  async playFailureSound(): Promise<void> {
    const audio = new Audio('/sounds/failure.mp3');
    audio.volume = 0.6;
    await audio.play();
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if alarm is currently ringing
   */
  isRinging(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused;
  }

  /**
   * Get current volume
   */
  getCurrentVolume(): number {
    return this.currentVolume;
  }

  /**
   * Set volume manually
   */
  setVolume(volume: number): void {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    if (this.currentAudio) {
      this.currentAudio.volume = this.currentVolume;
    }
  }
}
