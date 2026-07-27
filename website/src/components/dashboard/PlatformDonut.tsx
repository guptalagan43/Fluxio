// src/components/dashboard/PlatformDonut.tsx
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Skeleton } from '../ui/Spinner';

interface PlatformDonutProps {
  byPlatform?: Array<{ platform: string; tokens: number; costUsd: number }>;
  loading?: boolean;
}

const COLORS = ['#78350f', '#92400e', '#b45309', '#d97706', '#f59e0b', '#78716c', '#57534e'];

export function PlatformDonut({ byPlatform, loading }: PlatformDonutProps): JSX.Element {
  if (loading || !byPlatform) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle>Platform Distribution</CardTitle></CardHeader>
        <Skeleton className="h-48 w-full" />
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader><CardTitle>Platform Share</CardTitle></CardHeader>

      {byPlatform.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-sm text-stone-400 min-h-[200px]">
          No platform data yet.
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-center items-center min-h-[200px]">
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byPlatform} dataKey="tokens" nameKey="platform" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2}>
                  {byPlatform.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1c1917', borderColor: '#292524', color: '#f5f5f4', borderRadius: 0, fontSize: 12 }}
                  formatter={(value: any) => [Number(value).toLocaleString() + ' tokens', 'Tokens']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-4 text-xs">
            {byPlatform.map((item, idx) => (
              <div key={item.platform} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 inline-block" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="font-medium text-stone-700 capitalize">{item.platform}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
