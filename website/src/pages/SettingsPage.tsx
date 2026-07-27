// src/pages/SettingsPage.tsx
// Settings page allowing users to configure budgets, notification flags, model choices, and delete data.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSettings, updateSettings, deleteData } from '../api/usage';
import { useAuth } from '../contexts/AuthContext';
import type { UserSettings } from '../types/api';
import { BudgetSettings } from '../components/settings/BudgetSettings';
import { SyncToggle, ModelPrefs } from '../components/settings/SyncToggle';
import { DeleteDataModal } from '../components/settings/DeleteDataModal';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';

export function SettingsPage(): JSX.Element {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const data = await getSettings();
        setSettings(data);
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleSettingsChange(updatedFields: Partial<UserSettings>) {
    if (!settings) return;
    setSettings({ ...settings, ...updatedFields });
  }

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    setMessage('');
    try {
      const updated = await updateSettings(settings);
      setSettings(updated);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    try {
      await deleteData();
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Failed to delete account:', err);
    }
  }

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Account & Preference Settings</h2>
          <p className="text-xs text-stone-500">Configure budgets, notifications, sync, and preferred models.</p>
        </div>

        <Button variant="primary" size="md" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {message && (
        <div className={`mb-6 p-3 text-xs font-semibold ${message.includes('success') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message}
        </div>
      )}

      <BudgetSettings settings={settings} onChange={handleSettingsChange} />
      <SyncToggle settings={settings} onChange={handleSettingsChange} />
      <ModelPrefs settings={settings} onChange={handleSettingsChange} />

      {/* Danger Zone */}
      <div className="bg-red-50 border border-red-200 p-6 mt-8">
        <h3 className="text-sm font-bold text-red-900 mb-1">Danger Zone</h3>
        <p className="text-xs text-red-700 mb-4">
          Permanently delete your account, synchronized usage history, and user settings from our servers.
        </p>
        <Button variant="danger" size="sm" onClick={() => setIsDeleteModalOpen(true)}>
          Delete Account & Usage Data
        </Button>
      </div>

      <DeleteDataModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
      />
    </div>
  );
}
