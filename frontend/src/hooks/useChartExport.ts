import { useCallback, useRef } from "react";

/**
 * Export a chart container as a high-res PNG image.
 * Uses html2canvas-style approach via SVG serialization for Recharts.
 */
export function useChartExport() {
  const exportAsPng = useCallback(async (containerRef: React.RefObject<HTMLDivElement>, filename: string, scale = 3) => {
    const container = containerRef.current;
    if (!container) return;

    const svgEl = container.querySelector("svg");
    if (!svgEl) return;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}.png`;
        link.click();
        URL.revokeObjectURL(link.href);
      }, "image/png");

      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, []);

  const exportAsSvg = useCallback((containerRef: React.RefObject<HTMLDivElement>, filename: string) => {
    const container = containerRef.current;
    if (!container) return;

    const svgEl = container.querySelector("svg");
    if (!svgEl) return;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.svg`;
    link.click();
    URL.revokeObjectURL(link.href);
  }, []);

  return { exportAsPng, exportAsSvg };
}
