import { supabase } from '@/integrations/supabase/client';

/** Helper to safely extract error message from unknown error */
const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    if (typeof error === 'object' && error !== null && 'message' in error) {
        return String((error as { message: unknown }).message);
    }
    return 'Unknown error';
};

/**
 * Start MFA enrollment process
 * Returns QR code and secret for user to scan
 */
export const enrollMFA = async () => {
    try {
        // 1. Check for existing unverified factors and remove them to prevent duplicates
        const { data: factors, error: listError } = await supabase.auth.mfa.listFactors();

        if (!listError && factors.totp) {
            const unverifiedFactors = factors.totp.filter(f => (f.status as string) === 'unverified');
            for (const factor of unverifiedFactors) {
                await supabase.auth.mfa.unenroll({ factorId: factor.id });
            }
        }

        // 2. Enroll new factor with a unique friendly name
        const { data, error } = await supabase.auth.mfa.enroll({
            factorType: 'totp',
            friendlyName: `Nova Subs (${new Date().toLocaleTimeString()})`,
        });

        if (error) throw error;

        return {
            success: true,
            qrCode: data.totp.qr_code,
            secret: data.totp.secret,
            factorId: data.id,
        };
    } catch (error: unknown) {
        console.error('MFA enrollment error:', error);
        return {
            success: false,
            error: getErrorMessage(error),
        };
    }
};

/**
 * Verify MFA enrollment with code from authenticator app
 */
export const verifyMFAEnrollment = async (factorId: string, code: string) => {
    try {
        const challenge = await supabase.auth.mfa.challenge({
            factorId,
        });

        if (challenge.error) throw challenge.error;

        const verify = await supabase.auth.mfa.verify({
            factorId,
            challengeId: challenge.data.id,
            code,
        });

        if (verify.error) throw verify.error;

        return {
            success: true,
            message: '2FA has been successfully enabled!',
        };
    } catch (error: unknown) {
        console.error('MFA verification error:', error);
        return {
            success: false,
            error: getErrorMessage(error) || 'Invalid code. Please try again.',
        };
    }
};

/**
 * Verify MFA code during login
 */
export const verifyMFAChallenge = async (factorId: string, code: string) => {
    try {
        const challenge = await supabase.auth.mfa.challenge({
            factorId,
        });

        if (challenge.error) throw challenge.error;

        const verify = await supabase.auth.mfa.verify({
            factorId,
            challengeId: challenge.data.id,
            code,
        });

        if (verify.error) throw verify.error;

        return {
            success: true,
        };
    } catch (error: unknown) {
        console.error('MFA challenge error:', error);
        return {
            success: false,
            error: getErrorMessage(error) || 'Invalid code. Please try again.',
        };
    }
};

/**
 * Disable MFA for current user
 */
export const unenrollMFA = async (factorId: string) => {
    try {
        const { error } = await supabase.auth.mfa.unenroll({
            factorId,
        });

        if (error) throw error;

        return {
            success: true,
            message: '2FA has been disabled.',
        };
    } catch (error: unknown) {
        console.error('MFA unenroll error:', error);
        return {
            success: false,
            error: getErrorMessage(error),
        };
    }
};

/**
 * Get MFA factors for current user
 */
export const getMFAFactors = async () => {
    try {
        const { data, error } = await supabase.auth.mfa.listFactors();

        if (error) throw error;

        return {
            success: true,
            factors: data.totp || [],
            hasEnabledMFA: data.totp && data.totp.length > 0,
        };
    } catch (error: unknown) {
        console.error('Get MFA factors error:', error);
        return {
            success: false,
            error: getErrorMessage(error),
            factors: [],
            hasEnabledMFA: false,
        };
    }
};

/**
 * Get the user's MFA status
 */
export const getMFAStatus = async () => {
    const result = await getMFAFactors();
    return result.hasEnabledMFA;
};
