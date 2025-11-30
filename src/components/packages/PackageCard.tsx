import React from 'react';
import { motion } from 'framer-motion';
import { cn, formatCurrency, formatDuration } from '@/lib/utils';
import { Package as PackageIcon, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import './PackageCard.css';
import { Package } from '@/hooks/usePackages';

interface PackageCardProps {
    package: Package;
    onEdit: (pkg: Package) => void;
    onDelete: (pkg: Package) => void;
    index: number;
    isSelected?: boolean;
    onSelect?: () => void;
}

const PackageCardComponent = ({ package: pkg, onEdit, onDelete, index, isSelected, onSelect }: PackageCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
                opacity: 1,
                scale: 1,
                transition: { delay: index * 0.1, duration: 0.3 }
            }}
            whileHover={{
                y: -12,
                scale: 1.05,
                transition: { type: "spring", stiffness: 400, damping: 15, delay: 0 }
            }}
            onClick={onSelect}
            className="cursor-pointer h-full"
        >
            <div className={cn(
                "package-card w-full min-h-[320px]", // Added min-height for consistent look
                isSelected ? "ring-4 ring-primary ring-offset-2" : ""
            )}>
                <div className="package-card-content p-4 flex flex-col">
                    {/* Default Badge */}
                    {pkg.is_default && (
                        <div className="absolute top-0 left-0 z-20">
                            <span className="text-xs bg-white/90 text-purple-600 px-3 py-1 rounded-br-lg font-semibold shadow-sm">
                                Default
                            </span>
                        </div>
                    )}

                    {/* Large Image/Icon Section */}
                    <div className="flex items-center justify-center mb-4 h-32 w-full shrink-0">
                        {pkg.image_url ? (
                            <img
                                src={pkg.image_url}
                                alt={pkg.name}
                                className="h-full w-full object-contain drop-shadow-2xl"
                                style={{ transform: 'perspective(1000px) rotateY(-10deg)' }}
                            />
                        ) : (
                            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6">
                                <PackageIcon className="h-12 w-12 text-white" />
                            </div>
                        )}
                    </div>

                    {/* Content Section */}
                    <div className="text-center space-y-2 flex-grow flex flex-col justify-center">
                        <h3 className="text-xl font-bold text-white tracking-wide">
                            {pkg.name}
                        </h3>

                        {pkg.price && (
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                                    {formatCurrency(pkg.price)}
                                </span>
                                <span className="text-lg text-gray-300 font-bold">
                                    ({formatDuration(pkg.duration_days)})
                                </span>
                            </div>
                        )}

                        {pkg.description && (
                            <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                                {pkg.description}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// Memoize to prevent unnecessary re-renders
export const PackageCard = React.memo(PackageCardComponent);
