// src/pages/DashboardPage.tsx
// Dashboard page rendering summary cards, usage charts, platform share, model breakdown, and recent sessions.

import { DashboardProvider, useDashboard } from '../contexts/DashboardContext';
import { SyncBanner } from '../components/dashboard/SyncBanner';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { BudgetWidget } from '../components/dashboard/BudgetWidget';
import { UsageChart } from '../components/dashboard/UsageChart';
import { PlatformDonut } from '../components/dashboard/PlatformDonut';
import { ModelTable } from '../components/dashboard/ModelTable';
import { SessionsTable } from '../components/dashboard/SessionsTable';

function DashboardContent(): JSX.Element {
  const { usageData, settings, loading, range, setRange } = useDashboard();

  return (
    <div>
      {/* Filters & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Usage Analytics</h2>
          <p className="text-xs text-stone-500">Real-time aggregated token volume and cost statistics.</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500 uppercase tracking-wider font-medium">Time Horizon:</span>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium bg-white border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-800"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      <SyncBanner syncEnabled={settings?.syncEnabled} />

      <SummaryCards cards={usageData?.summaryCards} loading={loading} />

      <BudgetWidget settings={settings} totalCostUsd={usageData?.summaryCards.totalCostUsd || 0} />

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <UsageChart daily={usageData?.daily} loading={loading} />
        </div>
        <div>
          <PlatformDonut byPlatform={usageData?.byPlatform} loading={loading} />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <ModelTable byModel={usageData?.byModel} loading={loading} />
        <div className="overflow-hidden">
          <SessionsTable sessions={usageData?.recentSessions} loading={loading} />
        </div>
      </div>
    </div>
  );
}

export function DashboardPage(): JSX.Element {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
