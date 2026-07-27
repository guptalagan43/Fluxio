// src/components/dashboard/SessionsTable.tsx
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Skeleton } from '../ui/Spinner';

interface SessionsTableProps {
  sessions?: Array<{
    sessionId: string;
    platform: string;
    model: string | null;
    tokens: number;
    costUsd: number;
    occurredAt: string;
  }>;
  loading?: boolean;
}

export function SessionsTable({ sessions, loading }: SessionsTableProps): JSX.Element {
  if (loading || !sessions) {
    return (
      <Card className="mb-8">
        <CardHeader><CardTitle>Recent Sessions</CardTitle></CardHeader>
        <Skeleton className="h-48 w-full" />
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Recent Sessions</CardTitle>
          <span className="text-xs text-stone-500 font-mono">last 20 activity sessions</span>
        </div>
      </CardHeader>

      {sessions.length === 0 ? (
        <div className="text-sm text-stone-400 py-8 text-center">No sessions synced yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-100 uppercase tracking-wider text-stone-500 border-b border-stone-200">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Date & Time</th>
                <th className="py-2.5 px-3 font-semibold">Platform</th>
                <th className="py-2.5 px-3 font-semibold">Model</th>
                <th className="py-2.5 px-3 font-semibold text-right">Tokens</th>
                <th className="py-2.5 px-3 font-semibold text-right">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 font-mono">
              {sessions.map((s) => (
                <tr key={s.sessionId} className="hover:bg-stone-100/50">
                  <td className="py-2.5 px-3 font-sans text-stone-600">
                    {new Date(s.occurredAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-stone-900 font-medium capitalize">{s.platform}</td>
                  <td className="py-2.5 px-3 font-sans text-stone-700">{s.model || 'Unknown'}</td>
                  <td className="py-2.5 px-3 text-right">{s.tokens.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right text-amber-900">${s.costUsd.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
