// src/components/dashboard/ModelTable.tsx
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Skeleton } from '../ui/Spinner';

interface ModelTableProps {
  byModel?: Array<{ model: string; platform: string; tokens: number; costUsd: number; sessionCount: number }>;
  loading?: boolean;
}

export function ModelTable({ byModel, loading }: ModelTableProps): JSX.Element {
  if (loading || !byModel) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle>Model Breakdown</CardTitle></CardHeader>
        <Skeleton className="h-48 w-full" />
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader><CardTitle>Model Usage Breakdown</CardTitle></CardHeader>

      {byModel.length === 0 ? (
        <div className="text-sm text-stone-400 py-8 text-center">No model usage recorded.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-100 uppercase tracking-wider text-stone-500 border-b border-stone-200">
              <tr>
                <th className="py-2 px-3 font-semibold">Model</th>
                <th className="py-2 px-3 font-semibold">Platform</th>
                <th className="py-2 px-3 font-semibold text-right">Tokens</th>
                <th className="py-2 px-3 font-semibold text-right">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 font-mono">
              {byModel.map((item, idx) => (
                <tr key={idx} className="hover:bg-stone-100/50">
                  <td className="py-2.5 px-3 font-semibold text-stone-900">{item.model}</td>
                  <td className="py-2.5 px-3 font-sans text-stone-600 capitalize">{item.platform}</td>
                  <td className="py-2.5 px-3 text-right">{item.tokens.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right text-amber-900">${item.costUsd.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
