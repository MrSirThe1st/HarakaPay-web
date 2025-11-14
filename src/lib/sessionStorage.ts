/**
 * Session storage utilities for persistent sessions
 * Handles "Remember Me" functionality and session preferences
 */

const REMEMBER_ME_KEY = 'harakapay_remember_me';
const SESSION_PREFERENCE_KEY = 'harakapay_session_preference';

export type SessionPreference = 'standard' | 'persistent';

/**
 * Save "Remember Me" preference
 */
export function setRememberMePreference(remember: boolean): void {
  if (typeof window === 'undefined') return;
  
  try {
    if (remember) {
      localStorage.setItem(REMEMBER_ME_KEY, 'true');
      localStorage.setItem(SESSION_PREFERENCE_KEY, 'persistent');
    } else {
      localStorage.removeItem(REMEMBER_ME_KEY);
      localStorage.setItem(SESSION_PREFERENCE_KEY, 'standard');
    }
  } catch (error) {
    console.error('Error saving remember me preference:', error);
  }
}

/**
 * Get "Remember Me" preference
 */
export function getRememberMePreference(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    return localStorage.getItem(REMEMBER_ME_KEY) === 'true';
  } catch (error) {
    console.error('Error reading remember me preference:', error);
    return false;
  }
}

/**
 * Get session preference
 */
export function getSessionPreference(): SessionPreference {
  if (typeof window === 'undefined') return 'standard';
  
  try {
    const preference = localStorage.getItem(SESSION_PREFERENCE_KEY);
    return (preference === 'persistent' ? 'persistent' : 'standard') as SessionPreference;
  } catch (error) {
    console.error('Error reading session preference:', error);
    return 'standard';
  }
}

/**
 * Clear all session preferences
 */
export function clearSessionPreferences(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(REMEMBER_ME_KEY);
    localStorage.removeItem(SESSION_PREFERENCE_KEY);
  } catch (error) {
    console.error('Error clearing session preferences:', error);
  }
}

/**
 * Get session duration in seconds based on preference
 */
export function getSessionDuration(): number {
  const preference = getSessionPreference();
  
  if (preference === 'persistent') {
    // 30 days for persistent sessions
    return 60 * 60 * 24 * 30;
  }
  
  // 1 hour for standard sessions (default Supabase behavior)
  return 60 * 60;
}

