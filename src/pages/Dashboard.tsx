import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Package, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { useCustomers } from '@/hooks/useCustomers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { formatDate, formatCurrency } from '@/lib/utils';

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

  const totalRevenue = customers.reduce((sum, customer) => {
    return sum + (customer.packages?.price || 0);
  }, 0);

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
        <StatsCard
          title="Total Revenue"
          value={isLoading ? '...' : formatCurrency(totalRevenue)}
          icon={DollarSign}
          delay={0.4}
        />
      </div>


    </div>
  );
}
