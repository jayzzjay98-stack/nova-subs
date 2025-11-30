import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

  const handleCreate = (data: any) => {
    createCustomer.mutate(data);
  };

  const handleEdit = (data: any) => {
    if (editingCustomer) {
      updateCustomer.mutate({ id: editingCustomer.id, ...data });
      setEditingCustomer(undefined);
    }
  };

  const handleDelete = () => {
    if (deletingCustomer) {
      deleteCustomer.mutate(deletingCustomer.id);
      setDeletingCustomer(null);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground mt-2">Manage your customer subscriptions</p>
        </div>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="bg-gradient-primary shadow-elegant"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="shadow-card">
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
                        className="group hover:bg-muted/50"
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
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                            ${customer.status === 'active' ? 'bg-success/10 text-success' : ''}
                            ${customer.status === 'expired' ? 'bg-destructive/10 text-destructive' : ''}
                            ${customer.status === 'expiring_soon' ? 'bg-warning/10 text-warning' : ''}
                            `}
                          >
                            {customer.status.replace('_', ' ')}
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
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingCustomer(customer)}
                              className="text-destructive hover:text-destructive"
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
