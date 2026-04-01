"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, X, Bell } from "lucide-react";

interface ComplianceAlert {
  id: string;
  participant_id: string;
  alert_type: string;
  alert_date: string;
  message: string;
  is_dismissed: boolean;
  created_at: string;
}

export const ComplianceAlerts = () => {
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    const data = await apiClient.get("/api/compliance-alerts/mine").catch(() => []);

    setAlerts((data as ComplianceAlert[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const dismissAlert = async (alertId: string) => {
    try {
      await apiClient.put(`/api/compliance-alerts/${alertId}`, { is_dismissed: true });
    } catch {
      // ignore
    }
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  const dismissAll = async () => {
    const ids = alerts.map((a) => a.id);
    if (ids.length === 0) return;

    try {
      await apiClient.put("/api/compliance-alerts/dismiss-all", { ids });
    } catch {
      // ignore
    }
    setAlerts([]);
  };

  if (loading) return null;
  if (alerts.length === 0) return null;

  return (
    <Card className="mb-6 border-destructive/30 bg-destructive/5 shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-destructive">
            <Bell className="w-5 h-5" />
            Compliance Alerts
            <Badge variant="destructive" className="ml-1">{alerts.length}</Badge>
          </div>
          {alerts.length > 1 && (
            <Button variant="ghost" size="sm" onClick={dismissAll} className="text-xs text-muted-foreground">
              Dismiss All
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-64 overflow-y-auto">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-center justify-between p-3 bg-card rounded-lg border border-border"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-foreground">{alert.message}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(alert.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 flex-shrink-0"
              onClick={() => dismissAlert(alert.id)}
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
