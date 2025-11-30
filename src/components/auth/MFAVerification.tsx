import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { verifyMFAChallenge } from '@/lib/mfa';
import { Shield, Clock } from 'lucide-react';

interface MFAVerificationProps {
    open: boolean;
    factorId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export const MFAVerification = ({ open, factorId, onSuccess, onCancel }: MFAVerificationProps) => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(30);

    useEffect(() => {
        if (!open) return;

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [open]);

    const handleVerify = async () => {
        if (code.length !== 6) {
            setError('Please enter a 6-digit code');
            return;
        }

        setLoading(true);
        setError('');

        const result = await verifyMFAChallenge(factorId, code);

        if (result.success) {
            onSuccess();
        } else {
            setError(result.error!);
        }

        setLoading(false);
    };

    const handleClose = () => {
        setCode('');
        setError('');
        setCountdown(30);
        onCancel();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-500" />
                        Two-Factor Authentication
                    </DialogTitle>
                    <DialogDescription>
                        Enter the 6-digit code from your authenticator app
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="mfa-code">Authentication Code</Label>
                        <Input
                            id="mfa-code"
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                            placeholder="000000"
                            className="text-center text-2xl tracking-widest font-mono"
                            autoFocus
                        />
                    </div>

                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Code expires in {countdown}s</span>
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleVerify}
                            disabled={loading || code.length !== 6 || countdown === 0}
                            className="flex-1 bg-gradient-primary"
                        >
                            {loading ? 'Verifying...' : 'Verify'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
