// src/components/dashboard/SyncBanner.tsx
import { Link } from 'react-router-dom';

interface SyncBannerProps {
  syncEnabled?: boolean;
  hasData?: boolean;
}

export function SyncBanner({ syncEnabled, hasData }: SyncBannerProps): JSX.Element | null {
  // Hide banner if sync is enabled or if user already has synced data
  if (syncEnabled !== false || hasData) return null;

  return (
    <div className="mb-6 p-4 bg-amber-50 border border-amber-300 flex items-center justify-between text-xs text-amber-900">
      <div className="flex items-center gap-2">
        <span className="font-bold">⚠ Cloud Sync Disabled:</span>
        <span>Enable sync in Settings to automatically push extension tracking data to this dashboard.</span>
      </div>

      <Link to="/settings" className="font-semibold underline hover:text-amber-950">
        Go to Settings →
      </Link>
    </div>
  );
}
