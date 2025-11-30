import { motion } from 'framer-motion';
import { cn, formatCurrency, formatDuration } from '@/lib/utils';
import { Package as PackageIcon, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package } from '@/hooks/usePackages';

interface PackageCardProps {
    package: Package;
    onEdit: (pkg: Package) => void;
    onDelete: (pkg: Package) => void;
    index: number;
    isSelected?: boolean;
    onSelect?: () => void;
}

export const PackageCard = ({ package: pkg, onEdit, onDelete, index, isSelected, onSelect }: PackageCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -10, scale: 1.02 }}
            transition={{ delay: index * 0.1 }}
            onClick={onSelect}
            className="cursor-pointer"
        >
            <Card className={cn(
                "relative overflow-hidden hover:shadow-2xl transition-all duration-300 group border-0",
                isSelected ? "ring-4 ring-primary ring-offset-2 scale-105" : ""
            )}>
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-400" />

                {/* Edit/Delete buttons */}
                <div className="absolute top-3 right-3 flex gap-2 z-10">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(pkg)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(pkg)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white text-destructive hover:text-destructive"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>

                {/* Default Badge */}
                {pkg.is_default && (
                    <div className="absolute top-3 left-3 z-10">
                        <span className="text-xs bg-white/90 text-purple-600 px-3 py-1 rounded-full font-semibold">
                            Default
                        </span>
                    </div>
                )}

                <div className="relative p-4">
                    {/* Large Image/Icon Section - Fixed Height */}
                    <div className="flex items-center justify-center mb-3 h-40 w-full">
                        {pkg.image_url ? (
                            <img
                                src={pkg.image_url}
                                alt={pkg.name}
                                className="h-full w-full object-contain drop-shadow-2xl"
                                style={{ transform: 'perspective(1000px) rotateY(-10deg)' }}
                            />
                        ) : (
                            <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-8">
                                <PackageIcon className="h-16 w-16 text-white" />
                            </div>
                        )}
                    </div>

                    {/* Content Section */}
                    <div className="text-center space-y-1">
                        <h3 className="text-xl font-bold text-white">
                            {pkg.name}
                        </h3>

                        {pkg.price && (
                            <p className="text-lg font-black text-white">
                                {formatCurrency(pkg.price)}
                            </p>
                        )}

                        <p className="text-lg font-bold text-white/90">
                            {pkg.duration_days === 1 ? '1 Day' : `${pkg.duration_days} Days`} ({formatDuration(pkg.duration_days)})
                        </p>

                        {pkg.description && (
                            <p className="text-xs text-white/80 mt-1 max-w-xs mx-auto line-clamp-2">
                                {pkg.description}
                            </p>
                        )}
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};
