import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { usePackages } from '@/hooks/usePackages';
import { Customer } from '@/hooks/useCustomers';
import { formatDuration } from '@/lib/utils';

export interface CustomerFormData {
  name: string;
  email: string;
  service_type: 'basic' | 'premium' | 'enterprise' | 'custom';
  package_id: string;
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  notes: string;
}

interface CustomerFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerFormData) => void;
  customer?: Customer;
  isEditing?: boolean;
}

export const CustomerForm = ({ open, onClose, onSubmit, customer, isEditing }: CustomerFormProps) => {
  const { packages } = usePackages();

  // Get current date in Bangkok timezone (UTC+7)
  const getBangkokDate = () => {
    const now = new Date();
    // Add 7 hours to UTC to get Bangkok time
    const bangkokTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    const year = bangkokTime.getUTCFullYear();
    const month = String(bangkokTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(bangkokTime.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getInitialFormData = (): CustomerFormData => ({
    name: '',
    email: '',
    service_type: 'basic',
    package_id: '',
    start_date: getBangkokDate(),
    end_date: '',
    auto_renew: false,
    notes: '',
  });

  const [formData, setFormData] = useState<CustomerFormData>(getInitialFormData());

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      if (customer) {
        // If editing, populate with customer data
        setFormData({
          name: customer.name,
          email: customer.email,
          service_type: customer.service_type,
          package_id: customer.package_id || '',
          start_date: customer.start_date,
          end_date: customer.end_date,
          auto_renew: customer.auto_renew,
          notes: customer.notes || '',
        });
      } else {
        // If adding new, reset to initial state
        setFormData(getInitialFormData());
      }
    }
  }, [open, customer]);

  useEffect(() => {
    if (formData.package_id && formData.start_date) {
      const selectedPackage = packages.find(p => p.id === formData.package_id);
      if (selectedPackage) {
        // Parse date in Bangkok timezone
        const startDate = new Date(formData.start_date + 'T00:00:00+07:00');
        const endDate = new Date(startDate);

        // Add duration_days directly to get the end date
        endDate.setDate(endDate.getDate() + selectedPackage.duration_days);

        // Format back to YYYY-MM-DD
        const year = endDate.getFullYear();
        const month = String(endDate.getMonth() + 1).padStart(2, '0');
        const day = String(endDate.getDate()).padStart(2, '0');

        setFormData(prev => ({
          ...prev,
          end_date: `${year}-${month}-${day}`
        }));
      }
    }
  }, [formData.package_id, formData.start_date, packages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="package">Package</Label>
              <Select
                value={formData.package_id}
                onValueChange={(value) => setFormData({ ...formData, package_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select package" />
                </SelectTrigger>
                <SelectContent>
                  {packages.map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      {pkg.name} ({formatDuration(pkg.duration_days)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="end_date">End Date *</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2 md:col-span-2">
              <Switch
                id="auto_renew"
                checked={formData.auto_renew}
                onCheckedChange={(checked) => setFormData({ ...formData, auto_renew: checked })}
              />
              <Label htmlFor="auto_renew">Auto Renew</Label>
            </div>
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
