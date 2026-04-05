import React, { useState } from "react";
import { format } from "date-fns";
import { 
  useGetWaterSummary, 
  getGetWaterSummaryQueryKey,
  useListWaterEntries,
  getListWaterEntriesQueryKey,
  useCreateWaterEntry,
  useDeleteWaterEntry
} from "@workspace/api-client-react";
import { WaterRing } from "@/components/water-ring";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { Droplet, Flame, Plus, Trash2, Coffee, GlassWater } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PRESETS = [
  { amount: 100, icon: GlassWater, label: "Sip" },
  { amount: 200, icon: GlassWater, label: "Glass" },
  { amount: 250, icon: GlassWater, label: "Mug" },
  { amount: 330, icon: Droplet, label: "Can" },
  { amount: 500, icon: Droplet, label: "Bottle" },
];

export default function Dashboard() {
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const { data: summary, isLoading: isLoadingSummary } = useGetWaterSummary({
    query: { queryKey: getGetWaterSummaryQueryKey() }
  });

  const { data: entries, isLoading: isLoadingEntries } = useListWaterEntries(
    { date: today },
    { query: { queryKey: getListWaterEntriesQueryKey({ date: today }) } }
  );

  const createEntry = useCreateWaterEntry({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetWaterSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListWaterEntriesQueryKey({ date: today }) });
        toast.success("Water added!");
        setCustomDialogOpen(false);
        setCustomAmount("");
      }
    }
  });

  const deleteEntry = useDeleteWaterEntry({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetWaterSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListWaterEntriesQueryKey({ date: today }) });
        toast.success("Entry deleted");
      }
    }
  });

  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [drinkType, setDrinkType] = useState("water");

  const handleAdd = (amountMl: number, type: string = "water") => {
    createEntry.mutate({ data: { amountMl, drinkType: type } });
  };

  const handleCustomAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(customAmount);
    if (amount > 0) {
      handleAdd(amount, drinkType);
    }
  };

  const getMotivationalMessage = (percentage: number) => {
    if (percentage === 0) return "Let's get started!";
    if (percentage < 30) return "A good start, keep drinking!";
    if (percentage < 70) return "You're halfway there!";
    if (percentage < 100) return "Almost done for the day!";
    return "Amazing! Goal reached!";
  };

  if (isLoadingSummary || !summary) {
    return (
      <div className="p-6 space-y-8 flex flex-col items-center">
        <Skeleton className="w-[240px] h-[240px] rounded-full" />
        <Skeleton className="h-8 w-3/4" />
        <div className="flex gap-4 overflow-hidden w-full">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 w-20 flex-shrink-0 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 pb-32 animate-in fade-in duration-500">
      
      {/* Motivational Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          {getMotivationalMessage(summary.percentage)}
        </h2>
        {summary.streak > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-semibold">
            <Flame className="w-4 h-4" />
            {summary.streak} Day Streak!
          </div>
        )}
      </div>

      {/* Progress Ring */}
      <div className="flex justify-center">
        <WaterRing 
          percentage={summary.percentage} 
          totalMl={summary.totalMl} 
          goalMl={summary.goalMl} 
        />
      </div>

      {/* Quick Add Grid */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Quick Add</h3>
        <div className="flex overflow-x-auto gap-3 pb-2 -mx-2 px-2 scrollbar-none snap-x">
          {PRESETS.map((preset) => (
            <button
              key={preset.amount}
              onClick={() => handleAdd(preset.amount)}
              disabled={createEntry.isPending}
              className="snap-start flex-shrink-0 flex flex-col items-center justify-center gap-2 p-4 w-[88px] rounded-2xl bg-card border border-border shadow-sm hover:border-primary/50 hover:bg-primary/5 hover-elevate transition-all active:scale-95 group"
            >
              <preset.icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
              <div className="flex flex-col items-center">
                <span className="font-bold text-foreground">{preset.amount}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{preset.label}</span>
              </div>
            </button>
          ))}
          
          <Dialog open={customDialogOpen} onOpenChange={setCustomDialogOpen}>
            <DialogTrigger asChild>
              <button className="snap-start flex-shrink-0 flex flex-col items-center justify-center gap-2 p-4 w-[88px] rounded-2xl border-2 border-dashed border-border bg-transparent text-muted-foreground hover:text-primary hover:border-primary/50 transition-all active:scale-95 group">
                <div className="bg-primary/10 p-2 rounded-full group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <span className="font-semibold text-sm mt-1">Custom</span>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-xs rounded-3xl">
              <DialogHeader>
                <DialogTitle>Add Custom Amount</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCustomAdd} className="space-y-6 pt-4">
                <div className="space-y-2">
                  <Label>Amount (ml)</Label>
                  <Input 
                    type="number" 
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="e.g. 400"
                    className="text-lg py-6"
                    min="1"
                    max="5000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Drink Type</Label>
                  <div className="flex gap-2">
                    {["water", "tea", "coffee", "juice"].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setDrinkType(type)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold capitalize transition-all ${
                          drinkType === type 
                            ? "bg-primary text-primary-foreground shadow-md scale-105" 
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <Button type="submit" className="w-full rounded-xl py-6 text-lg" disabled={createEntry.isPending || !customAmount}>
                  {createEntry.isPending ? "Adding..." : "Add Drink"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Today's Entries */}
      <div className="space-y-4 pt-4">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Today's Log</h3>
        
        {isLoadingEntries ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
          </div>
        ) : entries && entries.length > 0 ? (
          <div className="space-y-3">
            {entries.map((entry, index) => (
              <Card 
                key={entry.id} 
                className="overflow-hidden border-none shadow-sm bg-card animate-in slide-in-from-right-4 fade-in"
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${
                      entry.drinkType === 'coffee' ? 'bg-amber-100 text-amber-700' :
                      entry.drinkType === 'tea' ? 'bg-emerald-100 text-emerald-700' :
                      entry.drinkType === 'juice' ? 'bg-orange-100 text-orange-700' :
                      'bg-primary/10 text-primary'
                    }`}>
                      {entry.drinkType === 'coffee' || entry.drinkType === 'tea' ? <Coffee className="w-5 h-5" /> : <GlassWater className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-lg">{entry.amountMl} <span className="text-sm font-medium text-muted-foreground">ml</span></p>
                      <p className="text-xs font-medium text-muted-foreground capitalize flex items-center gap-1.5">
                        {format(new Date(entry.createdAt), 'HH:mm')} • {entry.drinkType}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                    onClick={() => deleteEntry.mutate({ id: entry.id })}
                    disabled={deleteEntry.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 px-4 bg-muted/30 rounded-3xl border border-dashed border-border">
            <Droplet className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No water logged yet today.</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Grab a glass and tap a button above!</p>
          </div>
        )}
      </div>
    </div>
  );
}
