"use client";

import { useMemo } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle2, X, AlertTriangle, Clock, FlaskConical, ClipboardList } from "lucide-react";
import type { TimelineEvent } from "./TimelineList";

export interface DaySession {
  day: number;
  logged: boolean;
  skipped: boolean;
}

interface CalendarGridProps {
  totalDays: number;
  studyDay: number;
  sessions: DaySession[];
  events: TimelineEvent[];
}

type DayStatus = "logged" | "skipped" | "missed" | "today" | "upcoming" | "not_started";

const CalendarGrid = ({ totalDays, studyDay, sessions, events }: CalendarGridProps) => {
  const sessionMap = useMemo(() => {
    const map = new Map<number, DaySession>();
    sessions.forEach((s) => map.set(s.day, s));
    return map;
  }, [sessions]);

  const eventMap = useMemo(() => {
    const map = new Map<number, TimelineEvent[]>();
    events.forEach((e) => {
      const existing = map.get(e.day) || [];
      existing.push(e);
      map.set(e.day, existing);
    });
    return map;
  }, [events]);

  const getDayStatus = (day: number): DayStatus => {
    if (day > studyDay) return "upcoming";
    if (day === studyDay) return "today";
    const session = sessionMap.get(day);
    if (session?.logged && !session.skipped) return "logged";
    if (session?.skipped) return "skipped";
    if (day < studyDay) return "missed";
    return "not_started";
  };

  const statusStyles: Record<DayStatus, string> = {
    logged: "bg-primary/20 border-primary/40 text-primary-foreground",
    skipped: "bg-muted/60 border-muted-foreground/30 text-muted-foreground",
    missed: "bg-destructive/15 border-destructive/30 text-destructive",
    today: "bg-accent border-accent-foreground/40 text-accent-foreground ring-2 ring-primary ring-offset-1 ring-offset-background",
    upcoming: "bg-muted/20 border-border text-muted-foreground/50",
    not_started: "bg-muted/20 border-border text-muted-foreground/50",
  };

  const weeks = Math.ceil(totalDays / 7);

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-primary/20 border border-primary/40" />
          <span className="text-muted-foreground">Logged</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-muted/60 border border-muted-foreground/30" />
          <span className="text-muted-foreground">Skipped</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-destructive/15 border border-destructive/30" />
          <span className="text-muted-foreground">Missed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-accent border border-accent-foreground/40 ring-2 ring-primary ring-offset-1" />
          <span className="text-muted-foreground">Today</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-muted/20 border border-border" />
          <span className="text-muted-foreground">Upcoming</span>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={i} className="text-[10px] font-medium text-muted-foreground py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <TooltipProvider delayDuration={200}>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: weeks * 7 }, (_, i) => {
            const day = i + 1;
            if (day > totalDays) {
              return <div key={i} className="aspect-square" />;
            }

            const status = getDayStatus(day);
            const dayEvents = eventMap.get(day) || [];
            const session = sessionMap.get(day);
            const hasEvent = dayEvents.length > 0;
            const weekNum = Math.ceil(day / 7);

            const tooltipLines: string[] = [`Day ${day} (Week ${weekNum})`];
            if (status === "logged") tooltipLines.push("✅ Session logged");
            if (status === "skipped") tooltipLines.push("⏭️ Session skipped");
            if (status === "missed") tooltipLines.push("❌ No session logged");
            if (status === "today") tooltipLines.push("📍 Today");
            dayEvents.forEach((e) => {
              const icon = e.type === "assessment" ? "📋" : e.type === "lab" ? "🧪" : "🏁";
              tooltipLines.push(`${icon} ${e.label} — ${e.status}`);
            });

            return (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <div
                    className={`aspect-square rounded-md border flex flex-col items-center justify-center text-[11px] font-medium cursor-default transition-colors ${statusStyles[status]} ${
                      hasEvent ? "ring-1 ring-inset ring-foreground/10" : ""
                    }`}
                  >
                    <span>{day}</span>
                    {hasEvent && (
                      <div className="flex gap-0.5 mt-0.5">
                        {dayEvents.some((e) => e.type === "assessment") && (
                          <ClipboardList className="w-2.5 h-2.5" />
                        )}
                        {dayEvents.some((e) => e.type === "lab") && (
                          <FlaskConical className="w-2.5 h-2.5" />
                        )}
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs max-w-[200px]">
                  {tooltipLines.map((line, idx) => (
                    <div key={idx}>{line}</div>
                  ))}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        {[
          { label: "Logged", count: sessions.filter((s) => s.logged && !s.skipped).length, color: "text-primary" },
          { label: "Skipped", count: sessions.filter((s) => s.skipped).length, color: "text-muted-foreground" },
          {
            label: "Missed",
            count: Math.max(0, studyDay - sessions.length),
            color: "text-destructive",
          },
        ].map((stat) => (
          <div key={stat.label} className="text-center p-2 rounded-lg bg-muted/30 border border-border">
            <div className={`text-lg font-bold ${stat.color}`}>{stat.count}</div>
            <div className="text-[10px] text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarGrid;
