/**
 * Convert an array of objects to a CSV string and trigger download.
 */
export function downloadCsv(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);

  const escape = (val: unknown): string => {
    if (val == null) return "";
    const str = String(val);
    // Wrap in quotes if contains comma, quote, or newline
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = [
    headers.join(","),
    ...data.map((row) => headers.map((h) => escape(row[h])).join(",")),
  ];

  const csvContent = rows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
