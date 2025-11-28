import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export default function Settings() {
  const { user, isAdmin } = useAuth();

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account settings</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="shadow-card">
          <CardHeader><CardTitle>Account Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><p className="text-sm text-muted-foreground">Email</p><p className="font-medium">{user?.email}</p></div>
            <div><p className="text-sm text-muted-foreground">Role</p><p className="font-medium">{isAdmin ? 'Administrator' : 'User'}</p></div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
