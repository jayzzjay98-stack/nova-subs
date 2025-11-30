import Bowser from 'bowser';

/**
 * Generate a unique device fingerprint based on browser and system information
 */
export const generateDeviceFingerprint = async (): Promise<string> => {
    const parser = Bowser.getParser(window.navigator.userAgent);
    const browserInfo = parser.getBrowser();
    const osInfo = parser.getOS();
    const platformInfo = parser.getPlatform();

    // Collect device information
    const deviceData = {
        browser: browserInfo.name,
        browserVersion: browserInfo.version,
        os: osInfo.name,
        osVersion: osInfo.version,
        platform: platformInfo.type,
        userAgent: navigator.userAgent,
        language: navigator.language,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        cookieEnabled: navigator.cookieEnabled,
        // Use more stable identifiers
        hardwareConcurrency: navigator.hardwareConcurrency || 0,
    };

    // Create a stable hash from device data
    const fingerprint = await hashDeviceData(JSON.stringify(deviceData));
    return fingerprint;
};

/**
 * Hash device data using SubtleCrypto API
 */
const hashDeviceData = async (data: string): Promise<string> => {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
};

/**
 * Get or create device ID stored in localStorage
 */
export const getDeviceId = (): string => {
    let deviceId = localStorage.getItem('device_id');

    if (!deviceId) {
        // Generate a random device ID
        deviceId = crypto.randomUUID();
        localStorage.setItem('device_id', deviceId);
    }

    return deviceId;
};

/**
 * Get device information for logging
 */
export const getDeviceInfo = () => {
    const parser = Bowser.getParser(window.navigator.userAgent);
    return {
        browser: parser.getBrowserName(),
        os: parser.getOSName(),
        platform: parser.getPlatformType(),
    };
};
