import { LayoutDashboard, Users, Package as PackageIcon, Settings, LogOut, MoonIcon, SunIcon } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const menuItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Customers', url: '/customers', icon: Users },
  { title: 'Packages', url: '/packages', icon: PackageIcon },
  { title: 'Settings', url: '/settings', icon: Settings },
];

interface TopNavigationProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export function TopNavigation({ theme, toggleTheme }: TopNavigationProps) {
  const { signOut, user } = useAuth();

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-gradient-to-r from-background via-card to-background backdrop-blur-xl shadow-elegant"
    >
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3"
        >
          <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow animate-pulse">
            <PackageIcon className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              SubManager
            </h1>
            <p className="text-xs text-muted-foreground">Subscription Management</p>
          </div>
        </motion.div>

        {/* Navigation Menu */}
        <nav className="flex items-center gap-2">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <NavLink
                to={item.url}
                end
                className="group relative px-6 py-3 rounded-lg transition-all duration-300 flex items-center gap-2 hover:bg-gradient-primary/10 hover:shadow-elegant hover:scale-105"
                activeClassName="bg-gradient-primary text-white shadow-glow font-semibold scale-105"
              >
                <item.icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
                <span className="text-sm font-medium">{item.title}</span>
                <motion.div
                  className="absolute inset-0 rounded-lg bg-gradient-primary opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-20 -z-10"
                  initial={false}
                />
              </NavLink>
            </motion.div>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="relative h-11 w-11 rounded-lg hover:bg-gradient-primary/10 hover:shadow-elegant transition-all duration-300 hover:scale-110 group"
            >
              {theme === 'light' ? (
                <MoonIcon className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
              ) : (
                <SunIcon className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
              )}
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={signOut}
              variant="ghost"
              className="relative h-11 px-4 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all duration-300 hover:scale-105 hover:shadow-elegant group"
            >
              <LogOut className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
              <span className="font-medium">Sign Out</span>
            </Button>
          </motion.div>

          {user && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-primary/10 border border-primary/20"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                <span className="text-white text-sm font-bold">
                  {user.email?.[0].toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium text-foreground hidden lg:block">
                {user.email}
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.header>
  );
}
