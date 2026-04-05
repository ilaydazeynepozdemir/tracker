import React from "react";
import { format, parseISO } from "date-fns";
import { useGetWaterHistory, getGetWaterHistoryQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplet, Trophy } from "lucide-react";

export default function HistoryPage() {
  const { data: history, isLoading } = useGetWaterHistory({
    query: { queryKey: getGetWaterHistoryQueryKey() }
  });

  if (isLoading || !history) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-[300px] w-full rounded-3xl" />
        <div className="space-y-4 pt-4">
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
        </div>
      </div>
    );
  }

  // Reverse history so oldest is first for chart
  const chartData = [...history].reverse().map(day => ({
    ...day,
    dayName: format(parseISO(day.date), 'EEE'), // Mon, Tue...
  }));

  const daysMetGoal = history.filter(d => d.goalMet).length;
  const currentGoal = history.length > 0 ? history[0].goalMl : 2000;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border shadow-xl rounded-xl p-3 text-sm">
          <p className="font-bold text-foreground mb-1">{format(parseISO(data.date), 'MMM d, yyyy')}</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-muted-foreground font-medium">Intake:</span>
            <span className="font-bold text-foreground">{data.totalMl} ml</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full bg-muted" />
            <span className="text-muted-foreground font-medium">Goal:</span>
            <span className="font-bold text-foreground">{data.goalMl} ml</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500 pb-32">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-foreground">History</h2>
          <p className="text-muted-foreground font-medium mt-1">Your last 7 days</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5 text-accent font-bold bg-accent/10 px-3 py-1.5 rounded-full">
            <Trophy className="w-4 h-4" />
            {daysMetGoal}/7
          </div>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-2 pr-1">Days Met</p>
        </div>
      </div>

      <Card className="border-none shadow-md overflow-hidden bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6 pt-8">
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="dayName" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }} />
                <ReferenceLine 
                  y={currentGoal} 
                  stroke="hsl(var(--secondary))" 
                  strokeDasharray="4 4" 
                  strokeWidth={2}
                  label={{ position: 'top', value: 'Goal', fill: 'hsl(var(--secondary))', fontSize: 10, fontWeight: 'bold' }} 
                />
                <Bar 
                  dataKey="totalMl" 
                  radius={[6, 6, 6, 6]} 
                  maxBarSize={40}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.goalMet ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.4)'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Daily Breakdown</h3>
        <div className="space-y-3">
          {history.map((day, i) => (
            <div 
              key={day.date}
              className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border shadow-sm animate-in slide-in-from-bottom-4 fade-in"
              style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${day.goalMet ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {day.goalMet ? <Trophy className="w-5 h-5" /> : <Droplet className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-bold text-foreground">{format(parseISO(day.date), 'EEEE')}</p>
                  <p className="text-xs font-medium text-muted-foreground">{format(parseISO(day.date), 'MMM d, yyyy')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold text-lg ${day.goalMet ? 'text-primary' : 'text-foreground'}`}>
                  {day.totalMl} <span className="text-sm text-muted-foreground">ml</span>
                </p>
                <p className="text-xs font-medium text-muted-foreground">
                  Goal: {day.goalMl}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
