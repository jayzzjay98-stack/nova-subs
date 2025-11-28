import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  delay?: number;
}

export const StatsCard = ({ title, value, icon: Icon, trend, delay = 0 }: StatsCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="relative overflow-hidden hover:shadow-card transition-all duration-300 group">
        <div className="absolute inset-0 bg-gradient-card opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardContent className="p-6 relative">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
              <h3 className="text-3xl font-bold text-foreground">{value}</h3>
              {trend && (
                <p className={`text-sm mt-2 ${trend.isPositive ? 'text-success' : 'text-destructive'}`}>
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </p>
              )}
            </div>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow"
            >
              <Icon className="h-6 w-6 text-white" />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
