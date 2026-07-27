// src/contexts/DashboardContext.tsx
// DashboardContext providing usage data, loading state, date range filter, and refetch method.

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { UsageData, UserSettings } from '../types/api';
import { getUsage, getSettings } from '../api/usage';

interface DashboardContextType {
  usageData: UsageData | null;
  settings: UserSettings | null;
  loading: boolean;
  error: string;
  range: string;
  setRange: (range: string) => void;
  refetch: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }): JSX.Element {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [range, setRange] = useState<string>('7d');

  async function fetchData() {
    setLoading(true);
    setError('');
    try {
      const [uData, sData] = await Promise.all([getUsage(range), getSettings()]);
      setUsageData(uData);
      setSettings(sData);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load dashboard analytics');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [range]);

  return (
    <DashboardContext.Provider
      value={{
        usageData,
        settings,
        loading,
        error,
        range,
        setRange,
        refetch: fetchData,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard(): DashboardContextType {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
