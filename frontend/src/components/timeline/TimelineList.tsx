"use client";

import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  FlaskConical,
  ClipboardList,
  Flag,
  Milestone,
} from "lucide-react";

export interface TimelineEvent {
  day: number;
  label: string;
  type: "assessment" | "lab" | "milestone";
  status: "completed" | "due" | "upcoming" | "overdue";
  detail?: string;
}

interface TimelineListProps {
  events: TimelineEvent[];
  studyDay: number;
}

const statusColors: Record<string, string> = {
  completed: "bg-primary/10 border-primary/30 text-primary",
  due: "bg-accent/10 border-accent/30 text-accent-foreground",
  overdue: "bg-destructive/10 border-destructive/30 text-destructive",
  upcoming: "bg-muted/30 border-border text-muted-foreground",
};

const dotColors: Record<string, string> = {
  completed: "bg-primary",
  due: "bg-accent",
  overdue: "bg-destructive",
  upcoming: "bg-muted-foreground/30",
};

const getIcon = (type: string, day: number) => {
  if (type === "assessment") return ClipboardList;
  if (type === "lab") return FlaskConical;
  return day === 90 ? Flag : Milestone;
};

const TimelineList = ({ events, studyDay }: TimelineListProps) => {
  return (
    <div className="relative">
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
      <div className="space-y-4">
        {events.map((event, i) => {
          const Icon = getIcon(event.type, event.day);
          const isCurrentArea = studyDay >= event.day - 3 && studyDay <= event.day + 3;

          return (
            <div key={`${event.type}-${event.day}-${i}`} className="relative flex items-start gap-4 pl-3">
              <div
                className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-full ${dotColors[event.status]} ${
                  isCurrentArea ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                }`}
              >
                {event.status === "completed" ? (
                  <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                ) : event.status === "due" ? (
                  <Clock className="w-4 h-4 text-accent-foreground" />
                ) : (
                  <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </div>

              <div className={`flex-1 p-3 rounded-lg border ${statusColors[event.status]} transition-colors`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="font-medium text-foreground text-sm">{event.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Day {event.day}</span>
                    <Badge
                      variant={
                        event.status === "completed"
                          ? "default"
                          : event.status === "due"
                          ? "secondary"
                          : event.status === "overdue"
                          ? "destructive"
                          : "outline"
                      }
                      className="text-[10px]"
                    >
                      {event.status === "completed"
                        ? "Done"
                        : event.status === "due"
                        ? "Due Now"
                        : event.status === "overdue"
                        ? "Overdue"
                        : "Upcoming"}
                    </Badge>
                  </div>
                </div>
                {event.detail && (
                  <p className="text-xs text-muted-foreground mt-1">{event.detail}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineList;
