// src/components/dashboard/UsageChart.tsx
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Skeleton } from '../ui/Spinner';

interface UsageChartProps {
  daily?: Array<{ date: string; tokens: number; costUsd: number }>;
  loading?: boolean;
}

export function UsageChart({ daily, loading }: UsageChartProps): JSX.Element {
  if (loading || !daily) {
    return (
      <Card className="mb-8">
        <CardHeader><CardTitle>Daily Token Volume</CardTitle></CardHeader>
        <Skeleton className="h-64 w-full" />
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Daily Token Volume</CardTitle>
          <span className="text-xs text-stone-500 font-mono">tokens per day</span>
        </div>
      </CardHeader>

      {daily.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-sm text-stone-400">
          No usage data recorded for this period yet.
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={daily} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" stroke="#78716c" fontSize={11} tickLine={false} />
              <YAxis stroke="#78716c" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1c1917', borderColor: '#292524', color: '#f5f5f4', borderRadius: 0, fontSize: 12 }}
                formatter={(value: any) => [Number(value).toLocaleString() + ' tokens', 'Volume']}
              />
              <Bar dataKey="tokens" fill="#78350f" radius={[0, 0, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
