
/**
 * Utilidades para generar reportes en diferentes formatos
 */

import * as XLSX from 'xlsx';

export interface ReportData {
  title: string;
  headers: string[];
  rows: any[][];
  summary?: { [key: string]: any };
}

/**
 * Generate Excel file from report data
 */
export function generateExcel(data: ReportData): Buffer {
  const wb = XLSX.utils.book_new();

  // Create main data sheet
  const ws = XLSX.utils.aoa_to_sheet([
    [data.title],
    [],
    data.headers,
    ...data.rows,
  ]);

  // Add summary sheet if provided
  if (data.summary) {
    const summaryData = [
      ['Resumen del Reporte'],
      [],
      ...Object.entries(data.summary).map(([key, value]) => [key, value]),
    ];
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Resumen');
  }

  XLSX.utils.book_append_sheet(wb, ws, 'Datos');

  // Generate buffer
  const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return excelBuffer;
}

/**
 * Generate CSV file from report data
 */
export function generateCSV(data: ReportData): string {
  const rows = [data.headers, ...data.rows];
  return rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
}

/**
 * Format currency for reports
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date for reports
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

/**
 * Format percentage for reports
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}
