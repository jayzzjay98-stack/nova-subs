/**
 * Safe storage wrapper that falls back to in-memory storage
 * when localStorage is not available (e.g., file:// protocol)
 */

class SafeStorage {
    private memoryStorage: Map<string, string> = new Map();
    private isLocalStorageAvailable: boolean;

    constructor() {
        this.isLocalStorageAvailable = this.checkLocalStorage();
    }

    private checkLocalStorage(): boolean {
        try {
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            console.warn('localStorage not available, using in-memory storage');
            return false;
        }
    }

    getItem(key: string): string | null {
        if (this.isLocalStorageAvailable) {
            return localStorage.getItem(key);
        }
        return this.memoryStorage.get(key) || null;
    }

    setItem(key: string, value: string): void {
        if (this.isLocalStorageAvailable) {
            localStorage.setItem(key, value);
        } else {
            this.memoryStorage.set(key, value);
        }
    }

    removeItem(key: string): void {
        if (this.isLocalStorageAvailable) {
            localStorage.removeItem(key);
        } else {
            this.memoryStorage.delete(key);
        }
    }

    clear(): void {
        if (this.isLocalStorageAvailable) {
            localStorage.clear();
        } else {
            this.memoryStorage.clear();
        }
    }
}

export const safeStorage = new SafeStorage();
