import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModernNavButton } from '@/components/ui/ModernNavButton';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCustomers, Customer } from '@/hooks/useCustomers';
import { CustomerForm } from '@/components/customers/CustomerForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatDate, formatDuration } from '@/lib/utils';

export default function Customers() {
  const { customers, isLoading, createCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>();
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [sortField, setSortField] = useState<'name' | 'package' | 'end_date' | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const [selectedPackage, setSelectedPackage] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Get unique package combinations (name + duration) used by customers - memoized
  const usedPackagesData = useMemo(() =>
    Array.from(
      new Map(
        customers
          .filter(c => c.packages?.name)
          .map(c => [`${c.packages!.name}-${c.packages!.duration_days}`, c.packages!])
      ).values()
    ),
    [customers]
  );

  const filteredCustomers = useMemo(() =>
    customers.filter(
      (customer) => {
        const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (customer.packages?.name || '').toLowerCase().includes(searchQuery.toLowerCase());

        // Match exact package name + duration combination
        let matchesPackage = selectedPackage === 'all';
        if (!matchesPackage && customer.packages) {
          const packageKey = `${customer.packages.name}|${customer.packages.duration_days}`;
          matchesPackage = packageKey === selectedPackage;
        }

        const matchesStatus = selectedStatus === 'all' || customer.status === selectedStatus;

        return matchesSearch && matchesPackage && matchesStatus;
      }
    ),
    [customers, searchQuery, selectedPackage, selectedStatus]
  );

  const handleSort = (field: 'name' | 'package' | 'end_date') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedCustomers = useMemo(() =>
    [...filteredCustomers].sort((a, b) => {
      if (!sortField) return 0;

      let aValue: string | number = '';
      let bValue: string | number = '';

      if (sortField === 'name') {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      } else if (sortField === 'package') {
        aValue = (a.packages?.name || '').toLowerCase();
        bValue = (b.packages?.name || '').toLowerCase();
      } else if (sortField === 'end_date') {
        aValue = new Date(a.end_date).getTime();
        bValue = new Date(b.end_date).getTime();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    }),
    [filteredCustomers, sortField, sortOrder]
  );

  const totalPages = Math.ceil(sortedCustomers.length / itemsPerPage);
  const paginatedCustomers = sortedCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreate = useCallback((data: any) => {
    createCustomer.mutate(data);
  }, [createCustomer]);

  const handleEdit = useCallback((data: any) => {
    if (editingCustomer) {
      updateCustomer.mutate({ id: editingCustomer.id, ...data });
      setEditingCustomer(undefined);
    }
  }, [editingCustomer, updateCustomer]);

  const handleDelete = useCallback(() => {
    if (deletingCustomer) {
      deleteCustomer.mutate(deletingCustomer.id);
      setDeletingCustomer(null);
    }
  }, [deletingCustomer, deleteCustomer]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end items-center gap-4"
      >
        <ModernNavButton
          title="Add Customer"
          icon={Plus}
          onClick={() => setIsFormOpen(true)}
          size="small"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative group rounded-xl p-[2px] bg-gradient-to-r from-cyan-400 to-blue-600 shadow-[0_0_25px_rgba(6,182,212,0.6)]">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-xl blur opacity-40 group-hover:opacity-80 transition duration-500"></div>
          <Card className="relative shadow-2xl border-0 bg-black/90 backdrop-blur-xl overflow-hidden rounded-xl h-full">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search customers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                  />
                </div>

                <Select value={selectedPackage} onValueChange={setSelectedPackage}>
                  <SelectTrigger className="w-[240px]">
                    <SelectValue placeholder="All Packages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Packages</SelectItem>
                    {usedPackagesData.map((pkg) => (
                      <SelectItem key={`${pkg.name}-${pkg.duration_days}`} value={`${pkg.name}|${pkg.duration_days}`}>
                        {pkg.name} ({formatDuration(pkg.duration_days)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center gap-1">
                          Name
                          {sortField === 'name' && (
                            sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('package')}
                      >
                        <div className="flex items-center gap-1">
                          Package
                          {sortField === 'package' && (
                            sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('end_date')}
                      >
                        <div className="flex items-center gap-1">
                          End Date
                          {sortField === 'end_date' && (
                            sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead>Remaining</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : paginatedCustomers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground">
                          No customers found
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedCustomers.map((customer, index) => (
                        <motion.tr
                          key={customer.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="group hover:bg-white/5 transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] border-b border-white/5"
                        >
                          <TableCell className="font-medium">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                          <TableCell className="font-medium text-lg">{customer.name}</TableCell>
                          <TableCell>{customer.email}</TableCell>
                          <TableCell className="text-lg font-medium">
                            {customer.packages?.name ?
                              `${customer.packages.name} (${formatDuration(customer.packages.duration_days)})` :
                              'N/A'
                            }
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-lg
                            ${customer.status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30 shadow-green-500/20' : ''}
                            ${customer.status === 'expired' ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-red-500/20' : ''}
                            ${customer.status === 'expiring_soon' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 shadow-yellow-500/20' : ''}
                            `}
                            >
                              {customer.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </TableCell>
                          <TableCell className="text-lg">{formatDate(customer.end_date)}</TableCell>
                          <TableCell>
                            {(() => {
                              const end = new Date(customer.end_date + 'T00:00:00+07:00');
                              const now = new Date();
                              const diffTime = end.getTime() - now.getTime();
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                              let colorClass = "text-green-500"; // Default > 7 days
                              if (diffDays <= 0) colorClass = "text-red-500";
                              else if (diffDays <= 7) colorClass = "text-yellow-500";

                              return (
                                <span className={`text-lg font-bold ${colorClass}`}>
                                  {diffDays > 0 ? `${diffDays} Days` : 'Expired'}
                                </span>
                              );
                            })()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingCustomer(customer);
                                  setIsFormOpen(true);
                                }}
                                className="h-8 w-8 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.5)] hover:shadow-[0_0_15px_rgba(6,182,212,0.8)] hover:scale-105 transition-all duration-300 border-0"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeletingCustomer(customer)}
                                className="h-8 w-8 rounded-lg bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)] hover:shadow-[0_0_15px_rgba(239,68,68,0.8)] hover:scale-105 transition-all duration-300 border-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedCustomers.length)} of {sortedCustomers.length} customers
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={currentPage === page ? "bg-gradient-primary" : ""}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>

      <CustomerForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCustomer(undefined);
        }}
        onSubmit={editingCustomer ? handleEdit : handleCreate}
        customer={editingCustomer}
        isEditing={!!editingCustomer}
      />

      <AlertDialog open={!!deletingCustomer} onOpenChange={() => setDeletingCustomer(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the customer "{deletingCustomer?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
