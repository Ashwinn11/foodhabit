/**
 * Analytics Service
 * Centralized analytics tracking for GutBuddy
 *
 * Firebase Analytics is active. Ensure credentials are in place:
 * - ios/GoogleService-Info.plist
 * - android/app/google-services.json
 */

import { getAnalytics, logEvent, setUserId as fbSetUserId, setUserProperty as fbSetUserProperty, setAnalyticsCollectionEnabled } from '@react-native-firebase/analytics';

interface ScreenViewParams {
  screen_name: string;
  step_number?: number;
  total_steps?: number;
  [key: string]: any;
}

class AnalyticsServiceClass {
  private isOptedOut = false;
  private sessionStartTime = Date.now();
  private screenViewStartTime = Date.now();
  private firebaseReady = false;

  /**
   * Initialize analytics service
   */
  init() {
    try {
      this.firebaseReady = true;
      const analytics = getAnalytics();
      setAnalyticsCollectionEnabled(analytics, true);
      console.log('📊 Firebase Analytics Initialized');
    } catch (e) {
      console.warn('📊 Firebase Analytics not available, using console logging');
      this.firebaseReady = false;
    }
  }

  /**
   * Track screen view
   */
  trackScreenView(screenName: string, params?: Partial<ScreenViewParams>) {
    if (this.isOptedOut) return;

    this.screenViewStartTime = Date.now();

    if (this.firebaseReady) {
      const analytics = getAnalytics();
      logEvent(analytics, 'screen_view', {
        screen_name: screenName,
        screen_class: screenName,
      });
      if (params) {
        logEvent(analytics, 'screen_view_extended', {
          screen_name: screenName,
          ...params,
        });
      }
    }

    if (__DEV__) {
      console.log(`📱 [SCREEN VIEW] ${screenName}`, params);
    }
  }

  /**
   * Track custom event
   */
  trackEvent(eventName: string, params?: Record<string, any>) {
    if (this.isOptedOut) return;

    if (this.firebaseReady) {
      const analytics = getAnalytics();
      logEvent(analytics, eventName, params);
    }

    if (__DEV__) {
      console.log(`📊 [EVENT] ${eventName}`, params);
    }
  }

  /**
   * Track onboarding screen views
   */
  trackOnboardingScreenView(screenName: string, stepNumber: number, totalSteps: number) {
    this.trackScreenView(`onboarding_${screenName}`, {
      screen_name: screenName,
      step_number: stepNumber,
      total_steps: totalSteps,
      screen_type: 'onboarding',
    });
  }

  /**
   * Track quiz completion
   */
  trackQuizCompleted(gutScore: number, symptomsCount: number, timeSpentSeconds: number) {
    this.trackEvent('onboarding_quiz_completed', {
      gut_score: gutScore,
      symptoms_count: symptomsCount,
      time_spent_seconds: timeSpentSeconds,
    });
  }

  /**
   * Track results view
   */
  trackResultsViewed(gutScore: number, hasMedicalFlags: boolean) {
    this.trackEvent('onboarding_results_viewed', {
      gut_score: gutScore,
      has_medical_flags: hasMedicalFlags,
    });
  }

  /**
   * Track paywall view
   */
  trackPaywallViewed() {
    this.trackEvent('onboarding_paywall_viewed', {
      entry_point: 'quiz_completion',
    });
  }

  /**
   * Track conversion completion
   */
  trackConversionCompleted(planType: string, price: number, timeToConvertSeconds: number) {
    this.trackEvent('onboarding_conversion_completed', {
      plan_type: planType,
      price: price,
      time_to_convert: timeToConvertSeconds,
      conversion_source: 'onboarding',
    });
  }

  /**
   * Track screen exit/drop-off
   */
  trackScreenExited(screenName: string, reason?: string, timeSpentSeconds?: number) {
    if (this.isOptedOut) return;

    this.trackEvent('onboarding_screen_exited', {
      screen_name: screenName,
      reason: reason || 'user_navigation',
      time_spent_seconds: timeSpentSeconds,
    });
  }

  /**
   * Track home screen actions
   */
  trackHomeAction(actionType: 'scan_food' | 'log_poop' | 'task_completed', details?: Record<string, any>) {
    this.trackEvent(`home_action_${actionType}`, details);
  }

  /**
   * Track food scan
   */
  trackFoodScanned(method: 'barcode' | 'camera' | 'manual', result: 'success' | 'failed', details?: Record<string, any>) {
    this.trackEvent('food_scanned', {
      method,
      result,
      ...details,
    });
  }

  /**
   * Track entry creation
   */
  trackEntryCreated(bristolType: number, symptoms: string[], mood: string, details?: Record<string, any>) {
    this.trackEvent('entry_created', {
      bristol_type: bristolType,
      symptoms_count: symptoms.length,
      mood,
      ...details,
    });
  }

  /**
   * Track trigger detection
   */
  trackTriggerDetected(triggerType: string, confidence: number) {
    this.trackEvent('trigger_detected', {
      trigger_type: triggerType,
      confidence: confidence,
    });
  }

  /**
   * Set user ID for tracking
   */
  setUserId(userId: string) {
    if (this.firebaseReady) {
      const analytics = getAnalytics();
      fbSetUserId(analytics, userId);
    }

    if (__DEV__) {
      console.log(`👤 [USER ID SET] ${userId}`);
    }
  }

  /**
   * Set user property
   */
  setUserProperty(name: string, value: string | number | boolean) {
    if (this.firebaseReady) {
      const analytics = getAnalytics();
      fbSetUserProperty(analytics, name, String(value));
    }

    if (__DEV__) {
      console.log(`📝 [USER PROPERTY] ${name} = ${value}`);
    }
  }

  /**
   * Set opt-out status
   */
  setOptOut(optedOut: boolean) {
    this.isOptedOut = optedOut;

    if (this.firebaseReady) {
      const analytics = getAnalytics();
      setAnalyticsCollectionEnabled(analytics, !optedOut);
    }

    if (__DEV__) {
      console.log(`🔕 Analytics ${optedOut ? 'disabled' : 'enabled'}`);
    }
  }

  /**
   * Check if user has opted out
   */
  isUserOptedOut(): boolean {
    return this.isOptedOut;
  }

  /**
   * Get session duration in seconds
   */
  getSessionDurationSeconds(): number {
    return Math.floor((Date.now() - this.sessionStartTime) / 1000);
  }

  /**
   * Get screen view duration in seconds
   */
  getScreenDurationSeconds(): number {
    return Math.floor((Date.now() - this.screenViewStartTime) / 1000);
  }

  /**
   * Reset session
   */
  resetSession() {
    this.sessionStartTime = Date.now();
    this.screenViewStartTime = Date.now();
  }
}

// Singleton instance
export const analyticsService = new AnalyticsServiceClass();

// Initialize on module load
analyticsService.init();
