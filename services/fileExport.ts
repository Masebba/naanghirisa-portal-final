type ExportValue = string | number | boolean | null | undefined;

const safeName = (name: string) => name.replace(/[^a-z0-9-_]+/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase();

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const downloadJson = (name: string, data: unknown) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  downloadBlob(blob, `${safeName(name)}.json`);
};

export const downloadCsv = (name: string, rows: Record<string, ExportValue>[]) => {
  if (!rows.length) {
    downloadBlob(new Blob([''], { type: 'text/csv;charset=utf-8' }), `${safeName(name)}.csv`);
    return;
  }

  const headers = Array.from(new Set(rows.flatMap(row => Object.keys(row))));
  const escape = (value: ExportValue) => {
    const text = value === null || value === undefined ? '' : String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };

  const csv = [headers.join(','), ...rows.map(row => headers.map(header => escape(row[header])).join(','))].join('\n');
  downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `${safeName(name)}.csv`);
};
