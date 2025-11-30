import { supabase } from '@/integrations/supabase/client';
import { generateDeviceFingerprint } from './deviceFingerprint';

// Maximum number of concurrent sessions allowed
export const MAX_CONCURRENT_SESSIONS = 3;

export interface ActiveSession {
  id: string;
  device_name: string;
  browser: string;
  os: string;
  last_used_at: string;
  is_active: boolean;
  device_fingerprint: string;
  session_id: string | null;
}

/**
 * Get all active sessions for a user
 */
export const getActiveSessions = async (userId: string): Promise<ActiveSession[]> => {
  const { data, error } = await supabase
    .from('authorized_devices')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('last_used_at', { ascending: false });

  if (error) {
    console.error('Error fetching active sessions:', error);
    return [];
  }

  return data || [];
};

/**
 * Get current device fingerprint
 */
export const getCurrentDeviceFingerprint = async (): Promise<string> => {
  return await generateDeviceFingerprint();
};

/**
 * Terminate a specific session by device ID
 */
export const terminateSession = async (deviceId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('authorized_devices')
      .update({
        is_active: false,
        session_id: null,
      })
      .eq('id', deviceId);

    if (error) {
      console.error('Error terminating session:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error terminating session:', error);
    return { success: false, error: 'Failed to terminate session' };
  }
};

/**
 * Check if user has reached the maximum number of concurrent sessions
 */
export const hasReachedSessionLimit = async (userId: string, currentDeviceFingerprint: string): Promise<{
  limitReached: boolean;
  activeSessions: ActiveSession[];
  isCurrentDevice: boolean;
}> => {
  const activeSessions = await getActiveSessions(userId);
  
  // Check if current device already has an active session
  const currentDeviceSession = activeSessions.find(
    session => session.device_fingerprint === currentDeviceFingerprint
  );

  // If current device already has a session, it's a re-login
  if (currentDeviceSession) {
    return {
      limitReached: false,
      activeSessions,
      isCurrentDevice: true,
    };
  }

  // Check if we've reached the limit with other devices
  const limitReached = activeSessions.length >= MAX_CONCURRENT_SESSIONS;

  return {
    limitReached,
    activeSessions,
    isCurrentDevice: false,
  };
};

/**
 * Update session activity timestamp
 */
export const updateSessionActivity = async (deviceFingerprint: string): Promise<void> => {
  try {
    await supabase
      .from('authorized_devices')
      .update({
        last_used_at: new Date().toISOString(),
      })
      .eq('device_fingerprint', deviceFingerprint)
      .eq('is_active', true);
  } catch (error) {
    console.error('Error updating session activity:', error);
  }
};
