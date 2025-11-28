import { motion } from 'framer-motion';
import { Package as PackageIcon, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package } from '@/hooks/usePackages';

interface PackageCardProps {
  package: Package;
  onEdit: (pkg: Package) => void;
  onDelete: (pkg: Package) => void;
  index: number;
}

export const PackageCard = ({ package: pkg, onEdit, onDelete, index }: PackageCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="relative overflow-hidden hover:shadow-card transition-all duration-300 group">
        <div className="absolute inset-0 bg-gradient-card opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardHeader className="relative">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                <PackageIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">{pkg.name}</CardTitle>
                {pkg.is_default && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    Default
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(pkg)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(pkg)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="text-2xl font-bold text-foreground">{pkg.duration_days} days</p>
            </div>
            {pkg.price && (
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="text-2xl font-bold text-foreground">${pkg.price}</p>
              </div>
            )}
            {pkg.description && (
              <p className="text-sm text-muted-foreground mt-2">{pkg.description}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
