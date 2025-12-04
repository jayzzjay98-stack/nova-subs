import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  delay?: number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsCard({ title, value, icon: Icon, description, delay = 0, trend }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="h-full"
    >
      <Card className="h-full flex flex-col bg-gray-900/50 border-white/10 text-white shadow-lg backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-300">{description || title}</CardTitle>
          <Icon className="h-6 w-6 text-cyan-400" />
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-center items-center p-4">
          <div className="text-center space-y-2 flex-grow flex flex-col justify-center">
            <h3 className="text-xl font-bold text-white tracking-wide">
              {title}
            </h3>

            <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              {value}
            </p>

            {trend && (
              <p className={`text-lg font-bold ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                <span className="block text-sm opacity-70 font-normal text-gray-300">from last month</span>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Memoize to prevent unnecessary re-renders
export const StatsCardComponent = StatsCard;
export const MemoizedStatsCard = React.memo(StatsCardComponent);
