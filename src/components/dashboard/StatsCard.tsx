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
      <Card className="relative overflow-hidden hover:shadow-2xl transition-all duration-300 group border-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-400" />
        <CardContent className="p-6 relative">
          <div className="relative p-4">
            {/* Large Icon Section */}
            <div className="flex items-center justify-center mb-3 h-40 w-full">
              <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-8">
                <Icon className="h-16 w-16 text-white" />
              </div>
            </div>

            {/* Content Section */}
            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold text-white">
                {value}
              </h3>

              <p className="text-lg font-bold text-white/90">
                {title}
              </p>

              {trend && (
                <p className={`text-sm mt-1 ${trend.isPositive ? 'text-white' : 'text-white/90'}`}>
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
