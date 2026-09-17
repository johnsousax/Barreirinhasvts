'use client';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const esc = (v: unknown) => { const s = v == null ? '' : String(v); return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  return [headers.join(';'), ...rows.map((r) => headers.map((h) => esc(r[h])).join(';'))].join('\n');
}

export function ExportCsv({ rows, filename, label = 'Exportar CSV' }: { rows: Record<string, unknown>[]; filename: string; label?: string }) {
  const download = () => {
    const blob = new Blob(['\ufeff' + toCsv(rows)], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return <Button variant="secondary" disabled={!rows.length} onClick={download}><Download className="size-4" />{label}</Button>;
}
