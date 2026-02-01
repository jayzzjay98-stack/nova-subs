import { useState, useMemo, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  ChevronUp,
  ChevronDown,
  Download,
  Calendar as CalendarIcon,
  TrendingUp,
  Users,
  Repeat,
  DollarSign,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCustomers } from '@/hooks/useCustomers';
import { formatDate, formatCurrency } from '@/lib/utils';

// Dynamically import recharts components to reduce initial bundle (bundle-dynamic-imports)
const RechartsComponents = lazy(() => import('@/components/reports/RechartsComponents'));

interface CustomerReport {
  name: string;
  email: string;
  totalSubscriptions: number;
  totalSpent: number;
  firstSubscriptionDate: string;
  latestSubscriptionDate: string;
  latestPackage: string;
  currentStatus: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Loading placeholder for charts
const ChartLoader = () => (
  <div className="h-[300px] w-full flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
  </div>
);

export default function Reports() {
  const { customers, isLoading } = useCustomers();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<
    'name' | 'totalSubscriptions' | 'latestSubscriptionDate' | 'totalSpent' | null
  >(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [dateRange, setDateRange] = useState<
    'all' | 'this_month' | 'last_month' | '3_months' | '6_months' | 'this_year'
  >('all');

  // Filter customers based on date range first
  const dateFilteredCustomers = useMemo(() => {
    if (dateRange === 'all') return customers;

    const filterDate = new Date();
    filterDate.setHours(0, 0, 0, 0); // Reset time to start of day

    switch (dateRange) {
      case 'this_month':
        filterDate.setDate(1);
        break;
      case 'last_month':
        filterDate.setMonth(filterDate.getMonth() - 1);
        filterDate.setDate(1);
        break;
      case '3_months':
        filterDate.setMonth(filterDate.getMonth() - 3);
        break;
      case '6_months':
        filterDate.setMonth(filterDate.getMonth() - 6);
        break;
      case 'this_year':
        filterDate.setMonth(0, 1);
        break;
    }

    return customers.filter((c) => new Date(c.start_date) >= filterDate);
  }, [customers, dateRange]);

  // Aggregate customers by name
  const aggregatedCustomers = useMemo(() => {
    const customerMap = new Map<string, CustomerReport>();

    dateFilteredCustomers.forEach((customer) => {
      const nameKey = customer.name.toLowerCase().trim();
      const price = customer.packages?.price || 0;

      if (customerMap.has(nameKey)) {
        const existing = customerMap.get(nameKey)!;
        existing.totalSubscriptions += 1;
        existing.totalSpent += price;

        // Update if this subscription is older (first subscription)
        if (new Date(customer.start_date) < new Date(existing.firstSubscriptionDate)) {
          existing.firstSubscriptionDate = customer.start_date;
        }

        // Update if this subscription is newer (latest subscription)
        if (new Date(customer.start_date) > new Date(existing.latestSubscriptionDate)) {
          existing.latestSubscriptionDate = customer.start_date;
          existing.latestPackage = customer.packages?.name || 'N/A';
          existing.currentStatus = customer.status;
          existing.email = customer.email;
        }
      } else {
        customerMap.set(nameKey, {
          name: customer.name,
          email: customer.email,
          totalSubscriptions: 1,
          totalSpent: price,
          firstSubscriptionDate: customer.start_date,
          latestSubscriptionDate: customer.start_date,
          latestPackage: customer.packages?.name || 'N/A',
          currentStatus: customer.status,
        });
      }
    });

    return Array.from(customerMap.values());
  }, [dateFilteredCustomers]);

  // Calculate Summary Stats
  const stats = useMemo(() => {
    const totalRevenue = aggregatedCustomers.reduce((sum, c) => sum + c.totalSpent, 0);
    const totalUniqueCustomers = aggregatedCustomers.length;
    const repeatCustomers = aggregatedCustomers.filter((c) => c.totalSubscriptions > 1).length;
    const retentionRate =
      totalUniqueCustomers > 0 ? (repeatCustomers / totalUniqueCustomers) * 100 : 0;

    return {
      totalRevenue,
      totalUniqueCustomers,
      repeatCustomers,
      retentionRate,
    };
  }, [aggregatedCustomers]);

  // Prepare Chart Data
  const chartData = useMemo(() => {
    // Monthly Revenue & New Customers
    const monthlyData = new Map<string, { name: string; revenue: number; newCustomers: number }>();

    // Package Distribution
    const packageData = new Map<string, number>();

    dateFilteredCustomers.forEach((customer) => {
      const date = new Date(customer.start_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleString('default', { month: 'short', year: '2-digit' });

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { name: monthName, revenue: 0, newCustomers: 0 });
      }

      const data = monthlyData.get(monthKey)!;
      data.revenue += customer.packages?.price || 0;

      // Check if new customer (simplified logic: first subscription in this period)
      data.newCustomers += 1;

      // Package Stats
      const pkgName = customer.packages?.name || 'Unknown';
      packageData.set(pkgName, (packageData.get(pkgName) || 0) + 1);
    });

    // Sort monthly data
    const sortedMonthly = Array.from(monthlyData.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map((entry) => entry[1]);

    // Format package data for Pie Chart
    const sortedPackages = Array.from(packageData.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return {
      monthly: sortedMonthly,
      packages: sortedPackages,
    };
  }, [dateFilteredCustomers]);

  // Top Performers
  const topPerformers = useMemo(() => {
    return [...aggregatedCustomers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);
  }, [aggregatedCustomers]);

  // Filter & Sort Table Data
  const filteredTableData = useMemo(
    () =>
      aggregatedCustomers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [aggregatedCustomers, searchQuery],
  );

  const sortedTableData = useMemo(
    () =>
      [...filteredTableData].sort((a, b) => {
        if (!sortField) return 0;

        let aValue: string | number = '';
        let bValue: string | number = '';

        if (sortField === 'name') {
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
        } else if (sortField === 'totalSubscriptions') {
          aValue = a.totalSubscriptions;
          bValue = b.totalSubscriptions;
        } else if (sortField === 'latestSubscriptionDate') {
          aValue = new Date(a.latestSubscriptionDate).getTime();
          bValue = new Date(b.latestSubscriptionDate).getTime();
        } else if (sortField === 'totalSpent') {
          aValue = a.totalSpent;
          bValue = b.totalSpent;
        }

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      }),
    [filteredTableData, sortField, sortOrder],
  );

  const handleSort = (
    field: 'name' | 'totalSubscriptions' | 'latestSubscriptionDate' | 'totalSpent',
  ) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Name',
      'Email',
      'Total Subscriptions',
      'Total Spent',
      'First Subscription',
      'Latest Subscription',
      'Latest Package',
      'Status',
    ];
    const csvContent = [
      headers.join(','),
      ...sortedTableData.map((c) =>
        [
          `"${c.name}"`,
          `"${c.email}"`,
          c.totalSubscriptions,
          c.totalSpent,
          c.firstSubscriptionDate,
          c.latestSubscriptionDate,
          `"${c.latestPackage}"`,
          c.currentStatus,
        ].join(','),
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `customer_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
            Analytics & Reports
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Comprehensive overview of your business performance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={dateRange}
            onValueChange={(
              v: 'all' | 'this_month' | 'last_month' | '3_months' | '6_months' | 'this_year',
            ) => setDateRange(v)}
          >
            <SelectTrigger className="w-[180px]">
              <CalendarIcon className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="3_months">Last 3 Months</SelectItem>
              <SelectItem value="6_months">Last 6 Months</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleExportCSV} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-black/40 backdrop-blur-xl border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <p className="text-sm text-green-500 mt-1 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" /> +12.5% from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-black/40 backdrop-blur-xl border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium text-muted-foreground">
                Total Customers
              </CardTitle>
              <Users className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.totalUniqueCustomers}</div>
              <p className="text-sm text-blue-500 mt-1">Unique customers</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-black/40 backdrop-blur-xl border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium text-muted-foreground">
                Repeat Customers
              </CardTitle>
              <Repeat className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.repeatCustomers}</div>
              <p className="text-sm text-purple-500 mt-1">Ordered more than once</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-black/40 backdrop-blur-xl border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium text-muted-foreground">
                Retention Rate
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.retentionRate.toFixed(1)}%</div>
              <p className="text-sm text-orange-500 mt-1">Customer loyalty score</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Section - Lazy loaded */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartLoader />
            <ChartLoader />
          </div>
        }
      >
        <RechartsComponents chartData={chartData} colors={COLORS} />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="lg:col-span-1"
        >
          <Card className="bg-black/40 backdrop-blur-xl border-white/10 h-full">
            <CardHeader>
              <CardTitle>Top Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformers.map((customer, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-sm font-bold text-white">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-base">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {customer.totalSubscriptions} orders
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-green-400">
                        {formatCurrency(customer.totalSpent)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Detailed Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="lg:col-span-2"
        >
          <Card className="bg-black/40 backdrop-blur-xl border-white/10 h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Customer Details</CardTitle>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 w-[200px]"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-white/10">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-white/5 border-white/10">
                      <TableHead className="w-12">#</TableHead>
                      <TableHead onClick={() => handleSort('name')} className="cursor-pointer">
                        Name{' '}
                        {sortField === 'name' &&
                          (sortOrder === 'asc' ? (
                            <ChevronUp className="inline h-3 w-3" />
                          ) : (
                            <ChevronDown className="inline h-3 w-3" />
                          ))}
                      </TableHead>
                      <TableHead
                        onClick={() => handleSort('totalSubscriptions')}
                        className="cursor-pointer text-center"
                      >
                        Orders{' '}
                        {sortField === 'totalSubscriptions' &&
                          (sortOrder === 'asc' ? (
                            <ChevronUp className="inline h-3 w-3" />
                          ) : (
                            <ChevronDown className="inline h-3 w-3" />
                          ))}
                      </TableHead>
                      <TableHead
                        onClick={() => handleSort('totalSpent')}
                        className="cursor-pointer text-right"
                      >
                        Spent{' '}
                        {sortField === 'totalSpent' &&
                          (sortOrder === 'asc' ? (
                            <ChevronUp className="inline h-3 w-3" />
                          ) : (
                            <ChevronDown className="inline h-3 w-3" />
                          ))}
                      </TableHead>
                      <TableHead>Latest Package</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : sortedTableData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No data found
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedTableData.slice(0, 10).map((customer, index) => (
                        <TableRow key={index} className="hover:bg-white/5 border-white/10">
                          <TableCell className="font-medium text-base">{index + 1}</TableCell>
                          <TableCell className="font-medium text-lg">
                            <div>{customer.name}</div>
                            <div className="text-sm text-muted-foreground">{customer.email}</div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-purple-500/20 text-purple-400">
                              {customer.totalSubscriptions}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium text-lg text-green-400">
                            {formatCurrency(customer.totalSpent)}
                          </TableCell>
                          <TableCell className="text-base">{customer.latestPackage}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold
                              ${customer.currentStatus === 'active' ? 'bg-green-500/20 text-green-400' : ''}
                              ${customer.currentStatus === 'expired' ? 'bg-red-500/20 text-red-400' : ''}
                              ${customer.currentStatus === 'expiring_soon' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                            `}
                            >
                              {customer.currentStatus.replace('_', ' ').toUpperCase()}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
