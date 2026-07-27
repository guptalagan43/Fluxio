// src/components/dashboard/SyncBanner.tsx
import { Link } from 'react-router-dom';

interface SyncBannerProps {
  syncEnabled?: boolean;
}

export function SyncBanner({ syncEnabled }: SyncBannerProps): JSX.Element | null {
  if (syncEnabled !== false) return null;

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
