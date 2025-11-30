import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { enrollMFA, verifyMFAEnrollment } from '@/lib/mfa';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface MFAEnrollmentProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const MFAEnrollment = ({ open, onClose, onSuccess }: MFAEnrollmentProps) => {
    const [step, setStep] = useState<'qr' | 'verify'>('qr');
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [factorId, setFactorId] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const handleStartEnrollment = async () => {
        setLoading(true);
        setError('');

        const result = await enrollMFA();

        if (result.success) {
            setQrCode(result.qrCode!);
            setSecret(result.secret!);
            setFactorId(result.factorId!);
            setStep('verify');
        } else {
            setError(result.error!);
        }

        setLoading(false);
    };

    const handleVerify = async () => {
        if (code.length !== 6) {
            setError('Please enter a 6-digit code');
            return;
        }

        setLoading(true);
        setError('');

        const result = await verifyMFAEnrollment(factorId, code);

        if (result.success) {
            toast.success('2FA enabled successfully!');
            onSuccess();
            handleClose();
        } else {
            setError(result.error!);
        }

        setLoading(false);
    };

    const handleCopySecret = () => {
        navigator.clipboard.writeText(secret);
        setCopied(true);
        toast.success('Secret copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClose = () => {
        setStep('qr');
        setQrCode('');
        setSecret('');
        setFactorId('');
        setCode('');
        setError('');
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-500" />
                        Enable Two-Factor Authentication
                    </DialogTitle>
                    <DialogDescription>
                        Add an extra layer of security to your account
                    </DialogDescription>
                </DialogHeader>

                {step === 'qr' && (
                    <div className="space-y-4">
                        <Alert>
                            <AlertDescription>
                                You'll need an authenticator app like <strong>Google Authenticator</strong> or <strong>Authy</strong> on your phone.
                            </AlertDescription>
                        </Alert>

                        <Button
                            onClick={handleStartEnrollment}
                            disabled={loading}
                            className="w-full bg-gradient-primary"
                        >
                            {loading ? 'Setting up...' : 'Continue'}
                        </Button>
                    </div>
                )}

                {step === 'verify' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Step 1: Scan QR Code</Label>
                            <div className="flex justify-center p-4 bg-white rounded-lg">
                                <QRCodeSVG value={qrCode} size={200} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Or enter this secret manually:</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={secret}
                                    readOnly
                                    className="font-mono text-sm"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleCopySecret}
                                >
                                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="code">Step 2: Enter 6-digit code</Label>
                            <Input
                                id="code"
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                placeholder="000000"
                                className="text-center text-2xl tracking-widest font-mono"
                            />
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
                                disabled={loading || code.length !== 6}
                                className="flex-1 bg-gradient-primary"
                            >
                                {loading ? 'Verifying...' : 'Verify & Enable'}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
