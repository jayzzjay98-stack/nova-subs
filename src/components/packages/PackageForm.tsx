import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Package } from '@/hooks/usePackages';

interface PackageFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  package?: Package;
  isEditing?: boolean;
}

export const PackageForm = ({ open, onClose, onSubmit, package: pkg, isEditing }: PackageFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    duration_days: 0,
    description: '',
    price: 0,
    is_default: false,
  });

  useEffect(() => {
    if (pkg) {
      setFormData({
        name: pkg.name,
        duration_days: pkg.duration_days,
        description: pkg.description || '',
        price: pkg.price || 0,
        is_default: pkg.is_default,
      });
    } else {
      setFormData({
        name: '',
        duration_days: 0,
        description: '',
        price: 0,
        is_default: false,
      });
    }
  }, [pkg]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Package' : 'Add New Package'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Package Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration_days">Duration (days) *</Label>
            <Input
              id="duration_days"
              type="number"
              min="1"
              value={formData.duration_days}
              onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="is_default"
              checked={formData.is_default}
              onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
            />
            <Label htmlFor="is_default">Mark as default package</Label>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-primary">
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
