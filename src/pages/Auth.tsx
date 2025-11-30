import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { MFAVerification } from '@/components/auth/MFAVerification';
import { toast } from 'sonner';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showMFAVerification, setShowMFAVerification] = useState(false);
    const [mfaFactorId, setMfaFactorId] = useState('');
    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLogin) {
            const result = await signIn(email, password);

            // Check if MFA is required
            if (result.mfaRequired) {
                setMfaFactorId(result.factorId!);
                setShowMFAVerification(true);
            } else if (result.error) {
                toast.error(result.error.message);
            }
        } else {
            const result = await signUp(email, password);
            if (result.error) {
                toast.error(result.error.message);
            }
        }
    };

    const handleMFASuccess = () => {
        setShowMFAVerification(false);
        navigate('/');
    };

    const handleMFACancel = () => {
        setShowMFAVerification(false);
        toast.info('Login cancelled');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>{isLogin ? 'Login' : 'Sign Up'}</CardTitle>
                    <CardDescription>
                        {isLogin ? 'Welcome back!' : 'Create an account to get started.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            {isLogin ? 'Login' : 'Sign Up'}
                        </Button>
                        <div className="text-center text-sm">
                            <button
                                type="button"
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-primary hover:underline"
                            >
                                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <MFAVerification
                open={showMFAVerification}
                factorId={mfaFactorId}
                onSuccess={handleMFASuccess}
                onCancel={handleMFACancel}
            />
        </div>
    );
}
