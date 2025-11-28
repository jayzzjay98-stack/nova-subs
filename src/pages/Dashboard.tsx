import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Package, TrendingUp, Clock } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { useCustomers } from '@/hooks/useCustomers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { formatDate } from '@/lib/utils';

export default function Dashboard() {
  const { customers, isLoading } = useCustomers();
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('customers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['customers'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const expiredCustomers = customers.filter(c => c.status === 'expired').length;
  const expiringSoon = customers.filter(c => c.status === 'expiring_soon').length;

  const recentCustomers = customers.slice(0, 5);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Overview of your subscription management</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Customers"
          value={isLoading ? '...' : customers.length}
          icon={Users}
          delay={0}
        />
        <StatsCard
          title="Active Subscriptions"
          value={isLoading ? '...' : activeCustomers}
          icon={Package}
          delay={0.1}
        />
        <StatsCard
          title="Expiring Soon"
          value={isLoading ? '...' : expiringSoon}
          icon={Clock}
          delay={0.2}
        />
        <StatsCard
          title="Expired"
          value={isLoading ? '...' : expiredCustomers}
          icon={TrendingUp}
          delay={0.3}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Recent Customers</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : recentCustomers.length === 0 ? (
              <p className="text-muted-foreground">No customers yet</p>
            ) : (
              <div className="space-y-4">
                {recentCustomers.map((customer, index) => (
                  <motion.div
                    key={customer.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors duration-200"
                  >
                    <div>
                      <p className="font-medium text-foreground">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">{customer.email}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                        ${customer.status === 'active' ? 'bg-success/10 text-success' : ''}
                        ${customer.status === 'expired' ? 'bg-destructive/10 text-destructive' : ''}
                        ${customer.status === 'expiring_soon' ? 'bg-warning/10 text-warning' : ''}
                        `}
                      >
                        {customer.status.replace('_', ' ')}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        Expires: {formatDate(customer.end_date)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
