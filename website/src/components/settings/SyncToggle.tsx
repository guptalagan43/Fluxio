// src/components/settings/SyncToggle.tsx
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Toggle } from '../ui/Toggle';
import type { UserSettings } from '../../types/api';

interface SyncToggleProps {
  settings: UserSettings;
  onChange: (updated: Partial<UserSettings>) => void;
}

export function SyncToggle({ settings, onChange }: SyncToggleProps): JSX.Element {
  return (
    <Card className="mb-6">
      <CardHeader><CardTitle>Cloud Synchronization</CardTitle></CardHeader>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-medium text-stone-900">Sync Extension Data to Web Dashboard</h4>
          <p className="text-xs text-stone-500 mt-1 max-w-xl">
            When enabled, your extension background worker will securely push anonymized token & cost rollups to your cloud account every 10 minutes.
          </p>
        </div>

        <Toggle
          checked={settings.syncEnabled}
          onChange={(val) => onChange({ syncEnabled: val })}
          label={settings.syncEnabled ? 'Sync Enabled' : 'Sync Off'}
        />
      </div>
    </Card>
  );
}

// src/components/settings/ModelPrefs.tsx
interface ModelPrefsProps {
  settings: UserSettings;
  onChange: (updated: Partial<UserSettings>) => void;
}

export function ModelPrefs({ settings, onChange }: ModelPrefsProps): JSX.Element {
  const options = [
    { label: 'Quick Q&A Model', field: 'preferredQuick', value: settings.preferredQuick, choices: ['gpt-4o-mini', 'claude-3-haiku', 'gemini-1.5-flash'] },
    { label: 'Coding Model', field: 'preferredCode', value: settings.preferredCode, choices: ['claude-sonnet', 'gpt-4o', 'deepseek-coder'] },
    { label: 'Long-Context Model', field: 'preferredLong', value: settings.preferredLong, choices: ['gemini-1.5-pro', 'claude-sonnet', 'gpt-4o'] },
    { label: 'Creative Writing Model', field: 'preferredCreative', value: settings.preferredCreative, choices: ['claude-sonnet', 'gpt-4o', 'gemini-1.5-pro'] },
  ];

  return (
    <Card className="mb-6">
      <CardHeader><CardTitle>Preferred Models per Task Category</CardTitle></CardHeader>
      <p className="text-xs text-stone-500 mb-4">The recommendation engine in your extension popup will suggest these preferred models when prompt intent is classified.</p>

      <div className="grid sm:grid-cols-2 gap-4">
        {options.map((opt) => (
          <div key={opt.field} className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">{opt.label}</label>
            <select
              value={opt.value}
              onChange={(e) => onChange({ [opt.field]: e.target.value })}
              className="px-3 py-2 text-sm bg-stone-50 border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-800"
            >
              {opt.choices.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </Card>
  );
}
