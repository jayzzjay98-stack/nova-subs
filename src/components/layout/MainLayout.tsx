import { useState, useEffect } from 'react';
import { TopNavigation } from './TopNavigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/sidebar/AppSidebar';
import { safeStorage } from '@/lib/storage';
import { DarkVeil } from '@/components/ui/dark-veil';

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = safeStorage.getItem('theme') as 'light' | 'dark' | null;
    return savedTheme || 'dark';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    safeStorage.setItem('theme', newTheme);
  };

  return (
    <div className="min-h-screen w-full relative">
      <DarkVeil
        speed={0.5}
        hueShift={0}
        noiseIntensity={0.3}
        scanlineFrequency={100}
        scanlineIntensity={0.1}
        warpAmount={0.2}
      />
      <div className="relative z-10">
        <TopNavigation theme={theme} toggleTheme={toggleTheme} />
        <main className="container mx-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
