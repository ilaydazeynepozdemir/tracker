import React, { useEffect, useState } from "react";
import { useGetGoal, getGetGoalQueryKey, useUpdateGoal } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Settings2, Target, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { data: goalData, isLoading } = useGetGoal({
    query: { queryKey: getGetGoalQueryKey() }
  });

  const [goalValue, setGoalValue] = useState("");

  useEffect(() => {
    if (goalData) {
      setGoalValue(goalData.goalMl.toString());
    }
  }, [goalData]);

  const updateGoal = useUpdateGoal({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetGoalQueryKey() });
        toast.success("Daily goal updated successfully!");
      },
      onError: () => {
        toast.error("Failed to update goal. Please try again.");
      }
    }
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(goalValue, 10);
    if (isNaN(parsed) || parsed < 500 || parsed > 10000) {
      toast.error("Goal must be between 500ml and 10000ml");
      return;
    }
    
    updateGoal.mutate({ data: { goalMl: parsed } });
  };

  if (isLoading || !goalData) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-[200px] w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 text-primary p-2.5 rounded-2xl">
          <Settings2 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Settings</h2>
          <p className="text-muted-foreground font-medium">Manage your preferences</p>
        </div>
      </div>

      <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm rounded-3xl overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-border/50 pb-6">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-5 h-5 text-primary" />
            <CardTitle className="text-xl">Daily Goal</CardTitle>
          </div>
          <CardDescription className="text-sm font-medium text-muted-foreground">
            Set your target daily water intake. The recommended amount is generally around 2000-3000ml depending on your weight and activity level.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-bold text-foreground ml-1">Target Amount (ml)</Label>
              <div className="relative">
                <Input 
                  type="number" 
                  value={goalValue}
                  onChange={(e) => setGoalValue(e.target.value)}
                  className="text-xl font-bold py-7 pl-6 pr-16 rounded-2xl bg-background border-border focus-visible:ring-primary shadow-sm"
                  min="500"
                  max="10000"
                  step="100"
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
                  ml
                </div>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full py-7 rounded-2xl text-lg font-bold shadow-md hover:shadow-lg transition-all"
              disabled={updateGoal.isPending || goalValue === goalData.goalMl.toString()}
            >
              {updateGoal.isPending ? (
                "Saving..."
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" /> Save Goal
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <div className="px-4 text-center mt-12 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Su Takip • v1.0.0</p>
        <p className="text-[10px] text-muted-foreground/70 font-medium max-w-[250px] mx-auto">
          Remember that this app is for tracking purposes only and does not provide medical advice.
        </p>
      </div>
    </div>
  );
}
