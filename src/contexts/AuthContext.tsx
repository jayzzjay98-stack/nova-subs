import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { generateDeviceFingerprint, getDeviceId, getDeviceInfo } from '@/lib/deviceFingerprint';
import { getMFAFactors } from '@/lib/mfa';
import { hasReachedSessionLimit, MAX_CONCURRENT_SESSIONS } from '@/lib/sessionManager';

interface CustomAuthError {
  message: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{
    error?: AuthError | CustomAuthError | null;
    mfaRequired?: boolean;
    factorId?: string;
  }>;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ error: AuthError | CustomAuthError | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

// Allowed email address for login
const ALLOWED_EMAIL = 'darkside404404@gmail.com';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setTimeout(() => {
          checkAdminStatus(session.user.id);
        }, 0);
      } else {
        setIsAdmin(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) throw error;
      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    // Check if email is allowed
    if (email.toLowerCase() !== ALLOWED_EMAIL.toLowerCase()) {
      return {
        error: {
          message: 'Access denied. This email is not authorized to access this system.',
        },
      };
    }

    // Start device fingerprint generation early (async-defer-await)
    // These run in parallel with the sign-in API call
    const fingerprintPromise = generateDeviceFingerprint();
    const deviceId = getDeviceId();
    const deviceInfo = getDeviceInfo();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error };
    }

    // Await fingerprint now that we need it
    const deviceFingerprint = await fingerprintPromise;

    // Check session limits
    const { limitReached, activeSessions } = await hasReachedSessionLimit(
      data.user.id,
      deviceFingerprint,
    );

    if (limitReached) {
      await supabase.auth.signOut();
      const deviceNames = activeSessions.map((s) => s.device_name || 'Unknown Device').join(', ');
      return {
        error: {
          message: `You have reached the maximum limit of ${MAX_CONCURRENT_SESSIONS} active devices. Please logout from one of your other devices: ${deviceNames}`,
        },
      };
    }

    // Check if this device is authorized
    const { data: authorizedDevice, error: deviceError } = await supabase
      .from('authorized_devices')
      .select('*')
      .eq('user_id', data.user.id)
      .eq('device_fingerprint', deviceFingerprint)
      .maybeSingle();

    if (deviceError && deviceError.code !== 'PGRST116') {
      console.error('Device check error:', deviceError);
    }

    if (!authorizedDevice) {
      // First time login - authorize this device
      // We removed the strict whitelist check to allow adding new devices up to the session limit
      const { error: insertError } = await supabase.from('authorized_devices').insert({
        user_id: data.user.id,
        device_id: deviceId,
        device_fingerprint: deviceFingerprint,
        device_name: `${deviceInfo.browser} on ${deviceInfo.os}`,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        platform: deviceInfo.platform,
        is_active: true,
        session_id: data.session.access_token,
      });

      if (insertError) {
        console.error('Failed to register device:', insertError);
        await supabase.auth.signOut();
        return {
          error: {
            message: 'Failed to register device. Please try again.',
          },
        };
      }
    } else {
      // Update last used timestamp and mark as active
      await supabase
        .from('authorized_devices')
        .update({
          last_used_at: new Date().toISOString(),
          is_active: true,
          session_id: data.session.access_token,
        })
        .eq('id', authorizedDevice.id);
    }

    // Check if user has MFA enabled
    const mfaFactors = await getMFAFactors();

    if (mfaFactors.hasEnabledMFA && mfaFactors.factors.length > 0) {
      // MFA is enabled - return mfaRequired flag
      // Don't navigate yet, wait for MFA verification
      return {
        mfaRequired: true,
        factorId: mfaFactors.factors[0].id,
      };
    }

    navigate('/');
    return { error: null };
  };

  const signUp = async (email: string, password: string) => {
    // Check if email is allowed
    if (email.toLowerCase() !== ALLOWED_EMAIL.toLowerCase()) {
      return {
        error: {
          message: 'Registration is restricted. Only authorized emails can create an account.',
        },
      };
    }

    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (!error) {
      navigate('/');
    }

    return { error };
  };

  const signOut = async () => {
    const session = await supabase.auth.getSession();

    // Mark all devices as inactive for this user
    if (session.data.session) {
      await supabase
        .from('authorized_devices')
        .update({
          is_active: false,
          session_id: null,
        })
        .eq('session_id', session.data.session.access_token);
    }

    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
