// src/components/settings/BudgetSettings.tsx
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Toggle } from '../ui/Toggle';
import type { UserSettings } from '../../types/api';

interface BudgetSettingsProps {
  settings: UserSettings;
  onChange: (updated: Partial<UserSettings>) => void;
}

export function BudgetSettings({ settings, onChange }: BudgetSettingsProps): JSX.Element {
  return (
    <Card className="mb-6">
      <CardHeader><CardTitle>Weekly Budget & Threshold Alerts</CardTitle></CardHeader>

      <div className="space-y-6">
        <div>
          <Input
            label="Weekly Budget Limit (USD)"
            type="number"
            min="0"
            step="0.50"
            value={settings.weeklyLimitUsd}
            onChange={(e) => onChange({ weeklyLimitUsd: parseFloat(e.target.value) || 0 })}
          />
          <span className="text-xs text-stone-500 mt-1 block">
            Set your target weekly spending cap. Notifications will trigger as you approach this limit.
          </span>
        </div>

        <div className="space-y-3 pt-4 border-t border-stone-200">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">Browser Notification Flags</div>
          <Toggle
            checked={settings.notify50}
            onChange={(val) => onChange({ notify50: val })}
            label="Notify at 50% of budget limit"
          />
          <Toggle
            checked={settings.notify80}
            onChange={(val) => onChange({ notify80: val })}
            label="Notify at 80% of budget limit"
          />
          <Toggle
            checked={settings.notify100}
            onChange={(val) => onChange({ notify100: val })}
            label="Notify at 100% of budget limit"
          />
        </div>
      </div>
    </Card>
  );
}
