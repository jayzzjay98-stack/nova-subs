import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Smartphone, Laptop, Trash2, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getMFAStatus, unenrollMFA, getMFAFactors, verifyMFAChallenge } from '@/lib/mfa';
import { MFAEnrollment } from '@/components/auth/MFAEnrollment';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from 'date-fns';

interface Device {
  id: string;
  device_name: string;
  browser: string;
  os: string;
  last_used_at: string;
  is_active: boolean;
  device_fingerprint: string;
}

export default function Settings() {
  const { user } = useAuth();
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [showEnrollment, setShowEnrollment] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [disableCode, setDisableCode] = useState('');

  const [loading, setLoading] = useState(true);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // Check MFA status
      const mfaStatus = await getMFAFactors();
      setMfaEnabled(mfaStatus.hasEnabledMFA);
      if (mfaStatus.factors.length > 0) {
        setMfaFactorId(mfaStatus.factors[0].id);
      }

      // Fetch devices
      const { data: devicesData, error } = await supabase
        .from('authorized_devices')
        .select('*')
        .order('last_used_at', { ascending: false });

      if (error) throw error;
      setDevices(devicesData || []);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableMFA = async () => {
    if (!mfaFactorId || disableCode.length !== 6) return;

    try {
      // Verify the code first
      const verifyResult = await verifyMFAChallenge(mfaFactorId, disableCode);

      if (!verifyResult.success) {
        toast.error('Invalid code. Please try again.');
        return;
      }

      // If verified, proceed to unenroll
      const result = await unenrollMFA(mfaFactorId);
      if (result.success) {
        toast.success('Two-factor authentication disabled');
        setMfaEnabled(false);
        setMfaFactorId(null);
        setDisableCode('');
      } else {
        toast.error(result.error || 'Failed to disable 2FA');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleRemoveDevice = async (deviceId: string) => {
    try {
      const { error } = await supabase
        .from('authorized_devices')
        .delete()
        .eq('id', deviceId);

      if (error) throw error;

      setDevices(devices.filter(d => d.id !== deviceId));
      toast.success('Device removed successfully');
    } catch (error) {
      toast.error('Failed to remove device');
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading settings...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-4xl">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
        Security Settings
      </h1>

      {/* Two-Factor Authentication Section */}
      <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account using an authenticator app.
              </CardDescription>
            </div>
            <Badge variant={mfaEnabled ? "default" : "secondary"} className={mfaEnabled ? "bg-green-500/20 text-green-500" : ""}>
              {mfaEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {mfaEnabled ? (
            <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-white/5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-full">
                  <Shield className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">2FA is active</p>
                  <p className="text-sm text-muted-foreground">Your account is protected.</p>
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">Disable 2FA</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Disable Two-Factor Authentication?</AlertDialogTitle>
                    <AlertDialogDescription>
                      To disable 2FA, please enter the 6-digit code from your authenticator app to confirm it's you.
                    </AlertDialogDescription>
                    <div className="py-4">
                      <Input
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        className="text-center text-lg tracking-widest"
                        value={disableCode}
                        onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDisableCode('')}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e) => {
                        e.preventDefault();
                        handleDisableMFA();
                      }}
                      className="bg-red-500 hover:bg-red-600"
                      disabled={disableCode.length !== 6}
                    >
                      Disable
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-white/5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500/20 rounded-full">
                  <Shield className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="font-medium">2FA is not enabled</p>
                  <p className="text-sm text-muted-foreground">Protect your account with Google Authenticator or Authy.</p>
                </div>
              </div>
              <Button onClick={() => setShowEnrollment(true)} className="bg-gradient-primary">
                Enable 2FA
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Authorized Devices Section */}
      <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Laptop className="h-5 w-5 text-purple-500" />
            Authorized Devices
          </CardTitle>
          <CardDescription>
            Manage devices that are allowed to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {devices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-white/5">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${device.is_active ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
                    {device.os.toLowerCase().includes('ios') || device.os.toLowerCase().includes('android') ? (
                      <Smartphone className={`h-6 w-6 ${device.is_active ? 'text-green-500' : 'text-gray-400'}`} />
                    ) : (
                      <Laptop className={`h-6 w-6 ${device.is_active ? 'text-green-500' : 'text-gray-400'}`} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{device.device_name || 'Unknown Device'}</p>
                      {device.is_active && (
                        <Badge variant="outline" className="text-green-500 border-green-500/50 text-[10px] px-1 py-0 h-4">
                          Current Session
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {device.browser} on {device.os} • Last active {formatDistanceToNow(new Date(device.last_used_at))} ago
                    </p>
                  </div>
                </div>

                {!device.is_active && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-950/30">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Device?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This device will no longer be able to access your account. You will need to re-authorize it to use it again.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRemoveDevice(device.id)} className="bg-red-500 hover:bg-red-600">
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <MFAEnrollment
        open={showEnrollment}
        onClose={() => setShowEnrollment(false)}
        onSuccess={() => {
          setShowEnrollment(false);
          fetchSettings();
        }}
      />
    </div>
  );
}
