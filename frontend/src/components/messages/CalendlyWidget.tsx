"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ExternalLink } from "lucide-react";

interface CalendlyWidgetProps {
  calendlyUrl?: string;
}

const CalendlyWidget = ({ calendlyUrl }: CalendlyWidgetProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Default placeholder URL — researcher can set their own via study_settings
  const url = calendlyUrl || "";

  if (!url) {
    return (
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Schedule a Meeting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The researcher has not yet configured a scheduling link. Please use the messaging system to coordinate meeting times.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Schedule a Meeting
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!isExpanded ? (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={() => setIsExpanded(true)} variant="outline" className="gap-2">
              <Calendar className="w-4 h-4" />
              Open Scheduler
            </Button>
            <Button asChild variant="ghost" size="sm" className="gap-2">
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
                Open in new tab
              </a>
            </Button>
          </div>
        ) : (
          <div ref={containerRef}>
            <iframe
              src={url}
              width="100%"
              height="630"
              frameBorder="0"
              className="rounded-md border border-border"
              title="Schedule a meeting"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="mt-2"
            >
              Collapse
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CalendlyWidget;
