import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Package {
  id: string;
  name: string;
  duration_days: number;
  description?: string;
  price?: number;
  image_url?: string;
  is_default: boolean;
  created_at: string;
}

export const usePackages = () => {
  const queryClient = useQueryClient();

  const { data: packages = [], isLoading } = useQuery({
    queryKey: ['packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('duration_days', { ascending: true });

      if (error) throw error;
      return data as Package[];
    },
  });

  const createPackage = useMutation({
    mutationFn: async (pkg: Omit<Package, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('packages')
        .insert([pkg])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast.success('Package created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create package: ${error.message}`);
    },
  });

  const updatePackage = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Package> & { id: string }) => {
      const { data, error } = await supabase
        .from('packages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast.success('Package updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update package: ${error.message}`);
    },
  });

  const deletePackage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast.success('Package deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete package: ${error.message}`);
    },
  });

  return {
    packages,
    isLoading,
    createPackage,
    updatePackage,
    deletePackage,
  };
};
