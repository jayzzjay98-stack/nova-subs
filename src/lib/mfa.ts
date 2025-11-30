import { supabase } from '@/integrations/supabase/client';

/**
 * Start MFA enrollment process
 * Returns QR code and secret for user to scan
 */
export const enrollMFA = async () => {
    try {
        const { data, error } = await supabase.auth.mfa.enroll({
            factorType: 'totp',
        });

        if (error) throw error;

        return {
            success: true,
            qrCode: data.totp.qr_code,
            secret: data.totp.secret,
            factorId: data.id,
        };
    } catch (error: any) {
        console.error('MFA enrollment error:', error);
        return {
            success: false,
            error: error.message,
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
    } catch (error: any) {
        console.error('MFA verification error:', error);
        return {
            success: false,
            error: error.message || 'Invalid code. Please try again.',
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
    } catch (error: any) {
        console.error('MFA challenge error:', error);
        return {
            success: false,
            error: error.message || 'Invalid code. Please try again.',
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
    } catch (error: any) {
        console.error('MFA unenroll error:', error);
        return {
            success: false,
            error: error.message,
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
    } catch (error: any) {
        console.error('Get MFA factors error:', error);
        return {
            success: false,
            error: error.message,
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
