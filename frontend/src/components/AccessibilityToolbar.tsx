"use client";

import { useAccessibility } from "@/hooks/useAccessibility";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings2 } from "lucide-react";

const FONT_OPTIONS = [
  { value: "normal" as const, label: "Normal" },
  { value: "large" as const, label: "Large" },
  { value: "extra-large" as const, label: "Extra Large" },
];

const AccessibilityToolbar = () => {
  const { fontSize, setFontSize, highContrast, setHighContrast } = useAccessibility();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="flex items-center justify-center w-9 h-9 rounded-lg text-foreground hover:bg-secondary transition-colors"
          aria-label="Accessibility settings"
        >
          <Settings2 className="w-4 h-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 z-[60]" align="end" sideOffset={8}>
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-foreground">Accessibility</h4>

          {/* Font Size */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Font Size
            </Label>
            <div className="flex gap-1">
              {FONT_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  variant={fontSize === opt.value ? "default" : "outline"}
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => setFontSize(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          {/* High Contrast */}
          <div className="flex items-center justify-between">
            <Label htmlFor="high-contrast" className="text-sm font-medium">
              High Contrast
            </Label>
            <Switch
              id="high-contrast"
              checked={highContrast}
              onCheckedChange={setHighContrast}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AccessibilityToolbar;
