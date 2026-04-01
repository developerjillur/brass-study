"use client";

import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Image } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { useChartExport } from "@/hooks/useChartExport";

interface RenalDataPoint {
  participant_label: string;
  lab_date: string;
  egfr: number | null;
  creatinine: number | null;
  bun: number | null;
}

interface RenalTrendChartsProps {
  data: RenalDataPoint[];
  participantLabels: string[];
}

const COLORS = [
  "hsl(185, 55%, 35%)", "hsl(35, 90%, 50%)", "hsl(145, 60%, 40%)",
  "hsl(0, 72%, 51%)", "hsl(205, 75%, 50%)", "hsl(280, 60%, 50%)",
  "hsl(320, 60%, 50%)", "hsl(60, 80%, 40%)", "hsl(170, 60%, 35%)",
  "hsl(20, 80%, 50%)", "hsl(240, 50%, 55%)", "hsl(100, 50%, 40%)",
];

const RenalTrendCharts = ({ data, participantLabels }: RenalTrendChartsProps) => {
  const { exportAsPng, exportAsSvg } = useChartExport();
  const egfrRef = useRef<HTMLDivElement>(null);
  const creatinineRef = useRef<HTMLDivElement>(null);
  const bunRef = useRef<HTMLDivElement>(null);

  // Pivot data: group by lab_date, with one series per participant
  const pivotData = (metric: "egfr" | "creatinine" | "bun") => {
    const dateMap = new Map<string, Record<string, number | null>>();
    for (const d of data) {
      if (!dateMap.has(d.lab_date)) {
        dateMap.set(d.lab_date, { date: null as any });
      }
      const row = dateMap.get(d.lab_date)!;
      (row as any).date = d.lab_date;
      row[d.participant_label] = d[metric];
    }
    return Array.from(dateMap.values()).sort((a, b) =>
      String((a as any).date).localeCompare(String((b as any).date))
    );
  };

  const renderChart = (
    title: string,
    description: string,
    metric: "egfr" | "creatinine" | "bun",
    unit: string,
    ref: React.RefObject<HTMLDivElement>,
    filename: string
  ) => {
    const chartData = pivotData(metric);

    return (
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => exportAsPng(ref, filename)}>
                <Image className="w-4 h-4 mr-1" /> PNG
              </Button>
              <Button variant="ghost" size="sm" onClick={() => exportAsSvg(ref, filename)}>
                <Download className="w-4 h-4 mr-1" /> SVG
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div ref={ref}>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(200, 15%, 85%)" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis unit={` ${unit}`} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                {participantLabels.map((label, i) => (
                  <Line
                    key={label}
                    type="monotone"
                    dataKey={label}
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {renderChart(
        "eGFR Over Time",
        "Estimated Glomerular Filtration Rate (mL/min) per participant",
        "egfr", "mL/min", egfrRef, "egfr-trend"
      )}
      {renderChart(
        "Creatinine Over Time",
        "Serum Creatinine (mg/dL) per participant",
        "creatinine", "mg/dL", creatinineRef, "creatinine-trend"
      )}
      {renderChart(
        "BUN Over Time",
        "Blood Urea Nitrogen (mg/dL) per participant",
        "bun", "mg/dL", bunRef, "bun-trend"
      )}
    </div>
  );
};

export default RenalTrendCharts;
