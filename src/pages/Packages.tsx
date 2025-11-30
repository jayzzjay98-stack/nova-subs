import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePackages, Package } from '@/hooks/usePackages';
import { PackageCard } from '@/components/packages/PackageCard';
import { PackageForm } from '@/components/packages/PackageForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function Packages() {
  const { packages, isLoading, createPackage, updatePackage, deletePackage } = usePackages();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | undefined>();
  const [deletingPackage, setDeletingPackage] = useState<Package | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Packages</h1>
          <p className="text-muted-foreground mt-2">Manage subscription packages</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              const pkg = packages?.find(p => p.id === selectedPackageId);
              if (pkg) {
                setEditingPackage(pkg);
                setIsFormOpen(true);
              }
            }}
            disabled={!selectedPackageId}
            className="bg-gradient-primary shadow-elegant"
          >
            <Pencil className="h-4 w-4 mr-2" />Edit Package
          </Button>
          <Button onClick={() => setIsFormOpen(true)} className="bg-gradient-primary shadow-elegant">
            <Plus className="h-4 w-4 mr-2" />Add Package
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading ? <p>Loading...</p> : packages?.slice().sort((a, b) => a.name.localeCompare(b.name)).map((pkg, index) => (
          <PackageCard
            key={pkg.id}
            package={pkg}
            onEdit={(p) => { setEditingPackage(p); setIsFormOpen(true); }}
            onDelete={setDeletingPackage}
            index={index}
            isSelected={selectedPackageId === pkg.id}
            onSelect={() => setSelectedPackageId(pkg.id === selectedPackageId ? null : pkg.id)}
          />
        ))}
      </div>

      <PackageForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingPackage(undefined);
        }}
        onSubmit={(data) => {
          if (editingPackage) {
            updatePackage.mutate({ id: editingPackage.id, ...data });
          } else {
            createPackage.mutate(data);
          }
        }}
        onDelete={(pkg) => {
          setDeletingPackage(pkg);
        }}
        package={editingPackage}
        isEditing={!!editingPackage}
      />

      <AlertDialog open={!!deletingPackage} onOpenChange={() => setDeletingPackage(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Package?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete "{deletingPackage?.name}".</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deletingPackage) { deletePackage.mutate(deletingPackage.id); setDeletingPackage(null); } }} className="bg-destructive">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
