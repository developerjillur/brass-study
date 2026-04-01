"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HeatmapDay {
  participantName: string;
  participantId: string;
  day: number;
  status: "logged" | "skipped" | "missed" | "upcoming";
}

interface ComplianceHeatmapProps {
  data: HeatmapDay[];
  participantNames: { id: string; name: string }[];
  maxDay: number;
}

const statusColors: Record<string, string> = {
  logged: "bg-primary/70",
  skipped: "bg-muted-foreground/30",
  missed: "bg-destructive/50",
  upcoming: "bg-muted/20",
};

const ComplianceHeatmap = ({ data, participantNames, maxDay }: ComplianceHeatmapProps) => {
  // Build a lookup: participantId -> day -> status
  const lookup = new Map<string, Map<number, string>>();
  data.forEach((d) => {
    if (!lookup.has(d.participantId)) lookup.set(d.participantId, new Map());
    lookup.get(d.participantId)!.set(d.day, d.status);
  });

  // Show weeks (columns) up to maxDay, capped at 12
  const weeks = Math.min(12, Math.ceil(maxDay / 7));
  const weekLabels = Array.from({ length: weeks }, (_, i) => `W${i + 1}`);

  return (
    <div className="space-y-3">
      {/* Legend */}
      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-primary/70" />
          <span className="text-muted-foreground">Logged</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-muted-foreground/30" />
          <span className="text-muted-foreground">Skipped</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-destructive/50" />
          <span className="text-muted-foreground">Missed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-muted/30 border border-border" />
          <span className="text-muted-foreground">Upcoming</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="text-xs">
          <thead>
            <tr>
              <th className="text-left pr-3 py-1 text-muted-foreground font-medium min-w-[120px]">Participant</th>
              {weekLabels.map((w) => (
                <th key={w} className="px-0.5 py-1 text-muted-foreground font-medium text-center w-8">{w}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {participantNames.map((p) => {
              const dayMap = lookup.get(p.id) || new Map();
              return (
                <tr key={p.id}>
                  <td className="pr-3 py-0.5 text-foreground truncate max-w-[120px]">{p.name}</td>
                  <TooltipProvider delayDuration={150}>
                    {weekLabels.map((_, wi) => {
                      // Aggregate week: count logged/skipped/missed for days in this week
                      const weekDays = Array.from({ length: 7 }, (__, di) => wi * 7 + di + 1);
                      const statuses = weekDays.map((d) => dayMap.get(d) || "upcoming");
                      const logged = statuses.filter((s) => s === "logged").length;
                      const missed = statuses.filter((s) => s === "missed").length;
                      const skipped = statuses.filter((s) => s === "skipped").length;

                      // Determine dominant color
                      let color = "bg-muted/20 border border-border";
                      if (logged + missed + skipped > 0) {
                        const total = logged + missed + skipped;
                        const rate = logged / total;
                        if (rate >= 0.8) color = "bg-primary/70";
                        else if (rate >= 0.5) color = "bg-primary/30";
                        else if (missed > skipped) color = "bg-destructive/50";
                        else color = "bg-muted-foreground/30";
                      }

                      return (
                        <td key={wi} className="px-0.5 py-0.5">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className={`w-7 h-5 rounded-sm ${color} cursor-default`} />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              <div>{p.name} — Week {wi + 1}</div>
                              <div>{logged}/7 logged, {skipped} skipped, {missed} missed</div>
                            </TooltipContent>
                          </Tooltip>
                        </td>
                      );
                    })}
                  </TooltipProvider>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export type { HeatmapDay };
export default ComplianceHeatmap;
