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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={onSelect}
            className="cursor-pointer h-full"
        >
            <div className={cn(
                "package-card w-full min-h-[280px] bg-gray-900/50 backdrop-blur-sm rounded-xl overflow-hidden relative",
                isSelected ? "ring-2 ring-cyan-400" : ""
            )}>
                <div className="package-card-content px-3 py-4 flex flex-col h-full">
                    {/* Default Badge */}
                    {pkg.is_default && (
                        <div className="absolute top-0 left-0 z-20">
                            <span className="text-xs bg-cyan-500/90 text-white px-3 py-1 rounded-br-lg font-semibold shadow-sm backdrop-blur-md">
                                Default
                            </span>
                        </div>
                    )}

                    {/* Large Image/Icon Section */}
                    <div className="flex items-center justify-center mb-4 h-36 w-full shrink-0">
                        {pkg.image_url ? (
                            <img
                                src={pkg.image_url}
                                alt={pkg.name}
                                className="h-full w-full object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-110"
                                loading="lazy"
                                decoding="async"
                            />
                        ) : (
                            <div className="bg-white/5 backdrop-blur-md rounded-full p-6 ring-1 ring-white/10">
                                <PackageIcon className="h-12 w-12 text-cyan-400" />
                            </div>
                        )}
                    </div>

                    {/* Content Section */}
                    <div className="text-center space-y-3 flex-grow flex flex-col justify-center relative z-10">
                        <h3 className="text-xl font-bold text-white tracking-wide">
                            {pkg.name}
                        </h3>

                        {pkg.price !== undefined && (
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                                    {formatCurrency(pkg.price)}
                                </span>
                                <span className="text-sm text-gray-400 font-medium bg-white/5 px-2 py-0.5 rounded-full">
                                    {formatDuration(pkg.duration_days)}
                                </span>
                            </div>
                        )}

                        {pkg.description && (
                            <p className="text-xs text-gray-400 mt-2 line-clamp-2 px-2">
                                {pkg.description}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export const PackageCard = React.memo(PackageCardComponent);
