export const exportToCsv = (
  filename: string,
  columns: { key: string; label: string }[],
  data: any[]
) => {
  if (!data.length) return;

  // ❌ exclude image column
  const exportColumns = columns.filter(col => col.key !== "image");

  const headers = exportColumns.map(col => col.label);

  const rows = data.map(item =>
    exportColumns.map(col => {
      let value = item[col.key];

      if (Array.isArray(value)) value = value.join(", ");

      if (col.key === "status") {
        value = value === 1 ? "Active" : "Inactive";
      }

      if (value === null || value === undefined) value = "";

      return `"${String(value).replace(/"/g, '""')}"`;
    })
  );

  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
};
