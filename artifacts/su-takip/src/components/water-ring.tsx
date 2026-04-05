import React from "react";
import { cn } from "@/lib/utils";

interface WaterRingProps {
  percentage: number;
  totalMl: number;
  goalMl: number;
  className?: string;
}

export function WaterRing({ percentage, totalMl, goalMl, className }: WaterRingProps) {
  const radius = 120;
  const strokeWidth = 24;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const safePercentage = Math.min(percentage, 100);
  const strokeDashoffset = circumference - (safePercentage / 100) * circumference;

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90 filter drop-shadow-xl"
      >
        {/* Background track */}
        <circle
          stroke="hsl(var(--muted))"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="opacity-50"
        />
        
        {/* Progress fill */}
        <circle
          stroke="url(#gradient)"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="transition-all duration-1000 ease-out"
        />
        
        {/* Gradient Definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--secondary))" />
          </linearGradient>
        </defs>
      </svg>
      
      <div className="absolute flex flex-col items-center justify-center text-center animate-in zoom-in duration-500">
        <span className="text-4xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-br from-primary to-secondary">
          {percentage}%
        </span>
        <div className="mt-1 text-sm font-medium text-muted-foreground flex items-baseline gap-1">
          <span className="text-foreground">{totalMl}</span>
          <span>/</span>
          <span>{goalMl} ml</span>
        </div>
      </div>
    </div>
  );
}
