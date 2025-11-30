import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import '@/components/packages/PackageCard.css';

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

const StatsCardComponent = ({ title, value, icon: Icon, trend, delay = 0 }: StatsCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="h-full"
    >
      <div className="package-card w-full min-h-[320px]">
        <div className="package-card-content p-4 flex flex-col">

          {/* Large Icon Section */}
          <div className="flex items-center justify-center mb-4 h-32 w-full shrink-0">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6">
              <Icon className="h-12 w-12 text-white" />
            </div>
          </div>

          {/* Content Section */}
          <div className="text-center space-y-2 flex-grow flex flex-col justify-center">
            <h3 className="text-xl font-bold text-white tracking-wide">
              {title}
            </h3>

            <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              {value}
            </p>

            {trend && (
              <p className={`text-lg font-bold ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                <span className="block text-sm opacity-70 font-normal text-gray-300">from last month</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Memoize to prevent unnecessary re-renders
export const StatsCard = React.memo(StatsCardComponent);
