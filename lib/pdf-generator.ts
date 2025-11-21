import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Tipos para los datos de reportes
interface SaleReportData {
  id: string;
  saleNumber: string;
  total: number;
  paymentMethod: string;
  createdAt: string;
  userName: string;
}

interface ProductReportData {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  salePrice: number;
  costPrice: number;
}

interface CustomerReportData {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  createdAt: string;
}

interface InventoryMovementReportData {
  id: string;
  createdAt: string;
  productName: string;
  productSku: string;
  type: string;
  quantity: number;
  userName: string;
  reason: string | null;
}

interface ReportFilters {
  startDate?: string;
  endDate?: string;
  category?: string;
  [key: string]: any;
}

// Función auxiliar para formatear fecha
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

// Función auxiliar para formatear moneda chilena
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(amount);
}

// Función auxiliar para añadir encabezado del PDF
function addPDFHeader(doc: jsPDF, title: string, businessName: string = 'CRTLPyme') {
  // Logo o título principal
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text(businessName, 14, 20);

  // Título del reporte
  doc.setFontSize(16);
  doc.setTextColor(60, 60, 60);
  doc.text(title, 14, 30);

  // Línea separadora
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 35, 196, 35);
}

// Función auxiliar para añadir filtros aplicados
function addFilters(doc: jsPDF, filters: ReportFilters, startY: number): number {
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  
  let currentY = startY;
  
  if (filters.startDate || filters.endDate) {
    const dateRange = `Período: ${filters.startDate || 'Inicio'} - ${filters.endDate || 'Presente'}`;
    doc.text(dateRange, 14, currentY);
    currentY += 6;
  }
  
  if (filters.category) {
    doc.text(`Categoría: ${filters.category}`, 14, currentY);
    currentY += 6;
  }
  
  return currentY + 5; // Retorna la posición Y para continuar
}

// Función auxiliar para añadir pie de página
function addPDFFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  const pageHeight = doc.internal.pageSize.height;
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Generado el ${formatDate(new Date())} - Página ${i} de ${pageCount}`,
      14,
      pageHeight - 10
    );
  }
}

/**
 * Genera un PDF del reporte de ventas
 */
export function generateSalesReportPDF(
  data: SaleReportData[],
  filters: ReportFilters,
  businessName: string = 'CRTLPyme'
): string {
  const doc = new jsPDF();
  
  // Añadir encabezado
  addPDFHeader(doc, 'Reporte de Ventas', businessName);
  
  // Añadir filtros
  let startY = addFilters(doc, filters, 42);
  
  // Calcular totales
  const totalSales = data.length;
  const totalAmount = data.reduce((sum, sale) => sum + sale.total, 0);
  
  // Añadir resumen
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.text(`Total de ventas: ${totalSales}`, 14, startY);
  doc.text(`Monto total: ${formatCurrency(totalAmount)}`, 14, startY + 6);
  startY += 16;
  
  // Preparar datos para la tabla
  const tableData = data.map(sale => [
    sale.saleNumber,
    formatDate(new Date(sale.createdAt)),
    formatCurrency(sale.total),
    sale.paymentMethod,
    sale.userName,
  ]);
  
  // Crear tabla con autoTable
  autoTable(doc, {
    startY: startY,
    head: [['N° Venta', 'Fecha', 'Total', 'Método de Pago', 'Vendedor']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontSize: 10,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { left: 14, right: 14 },
  });
  
  // Añadir pie de página
  addPDFFooter(doc);
  
  // Retornar como base64
  return doc.output('dataurlstring');
}

/**
 * Genera un PDF del reporte de productos
 */
export function generateProductsReportPDF(
  data: ProductReportData[],
  filters: ReportFilters,
  businessName: string = 'CRTLPyme'
): string {
  const doc = new jsPDF();
  
  // Añadir encabezado
  addPDFHeader(doc, 'Reporte de Productos', businessName);
  
  // Añadir filtros
  let startY = addFilters(doc, filters, 42);
  
  // Calcular totales
  const totalProducts = data.length;
  const totalStock = data.reduce((sum, product) => sum + product.stock, 0);
  const totalValue = data.reduce((sum, product) => sum + (product.salePrice * product.stock), 0);
  
  // Añadir resumen
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.text(`Total de productos: ${totalProducts}`, 14, startY);
  doc.text(`Stock total: ${totalStock} unidades`, 14, startY + 6);
  doc.text(`Valor total inventario: ${formatCurrency(totalValue)}`, 14, startY + 12);
  startY += 22;
  
  // Preparar datos para la tabla
  const tableData = data.map(product => [
    product.sku,
    product.name,
    product.category,
    product.stock.toString(),
    formatCurrency(product.costPrice),
    formatCurrency(product.salePrice),
  ]);
  
  // Crear tabla con autoTable
  autoTable(doc, {
    startY: startY,
    head: [['SKU', 'Producto', 'Categoría', 'Stock', 'Costo', 'Precio Venta']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [39, 174, 96],
      textColor: 255,
      fontSize: 9,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { left: 14, right: 14 },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 50 },
      2: { cellWidth: 30 },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 25, halign: 'right' },
      5: { cellWidth: 25, halign: 'right' },
    },
  });
  
  // Añadir pie de página
  addPDFFooter(doc);
  
  // Retornar como base64
  return doc.output('dataurlstring');
}

/**
 * Genera un PDF del reporte de clientes
 */
export function generateCustomersReportPDF(
  data: CustomerReportData[],
  filters: ReportFilters,
  businessName: string = 'CRTLPyme'
): string {
  const doc = new jsPDF();
  
  // Añadir encabezado
  addPDFHeader(doc, 'Reporte de Clientes', businessName);
  
  // Añadir filtros
  let startY = addFilters(doc, filters, 42);
  
  // Calcular totales
  const totalCustomers = data.length;
  
  // Añadir resumen
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.text(`Total de clientes: ${totalCustomers}`, 14, startY);
  startY += 12;
  
  // Preparar datos para la tabla
  const tableData = data.map(customer => [
    customer.name,
    customer.email || 'N/A',
    customer.phone || 'N/A',
    customer.address || 'N/A',
    formatDate(new Date(customer.createdAt)),
  ]);
  
  // Crear tabla con autoTable
  autoTable(doc, {
    startY: startY,
    head: [['Nombre', 'Email', 'Teléfono', 'Dirección', 'Fecha Registro']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [142, 68, 173],
      textColor: 255,
      fontSize: 9,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { left: 14, right: 14 },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 45 },
      2: { cellWidth: 30 },
      3: { cellWidth: 45 },
      4: { cellWidth: 28 },
    },
  });
  
  // Añadir pie de página
  addPDFFooter(doc);
  
  // Retornar como base64
  return doc.output('dataurlstring');
}

/**
 * Genera un PDF del reporte de movimientos de inventario
 */
export function generateInventoryMovementsReportPDF(
  data: InventoryMovementReportData[],
  filters: ReportFilters,
  businessName: string = 'CRTLPyme'
): string {
  const doc = new jsPDF();
  
  // Añadir encabezado
  addPDFHeader(doc, 'Reporte de Movimientos de Inventario', businessName);
  
  // Añadir filtros
  let startY = addFilters(doc, filters, 42);
  
  // Calcular totales
  const totalMovements = data.length;
  const entriesCount = data.filter(m => m.type === 'Entrada').length;
  const exitsCount = data.filter(m => m.type === 'Salida').length;
  const adjustmentsCount = data.filter(m => m.type === 'Ajuste').length;
  
  const totalEntryQuantity = data
    .filter(m => m.type === 'Entrada')
    .reduce((sum, m) => sum + Math.abs(m.quantity), 0);
  
  const totalExitQuantity = data
    .filter(m => m.type === 'Salida')
    .reduce((sum, m) => sum + Math.abs(m.quantity), 0);
  
  const netChange = totalEntryQuantity - totalExitQuantity;
  
  // Añadir resumen
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.text(`Total de movimientos: ${totalMovements}`, 14, startY);
  doc.text(`Entradas: ${entriesCount} (${totalEntryQuantity} unidades)`, 14, startY + 6);
  doc.text(`Salidas: ${exitsCount} (${totalExitQuantity} unidades)`, 14, startY + 12);
  doc.text(`Ajustes: ${adjustmentsCount}`, 14, startY + 18);
  doc.text(`Cambio neto: ${netChange >= 0 ? '+' : ''}${netChange} unidades`, 14, startY + 24);
  startY += 34;
  
  // Preparar datos para la tabla
  const tableData = data.map(movement => {
    const movementTypeMap: Record<string, string> = {
      'Entrada': 'ENT',
      'Salida': 'SAL',
      'Ajuste': 'AJU',
      'ENTRY': 'ENT',
      'EXIT': 'SAL',
      'ADJUSTMENT': 'AJU',
    };
    
    const typeShort = movementTypeMap[movement.type] || movement.type;
    const quantityStr = movement.type === 'Entrada' || movement.type === 'ENTRY' 
      ? `+${Math.abs(movement.quantity)}`
      : movement.type === 'Salida' || movement.type === 'EXIT'
      ? `-${Math.abs(movement.quantity)}`
      : `±${Math.abs(movement.quantity)}`;
    
    return [
      formatDate(new Date(movement.createdAt)),
      movement.productName.length > 25 ? movement.productName.substring(0, 22) + '...' : movement.productName,
      movement.productSku,
      typeShort,
      quantityStr,
      movement.userName,
    ];
  });
  
  // Crear tabla con autoTable
  autoTable(doc, {
    startY: startY,
    head: [['Fecha', 'Producto', 'SKU', 'Tipo', 'Cant.', 'Usuario']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [52, 152, 219],
      textColor: 255,
      fontSize: 8,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 7,
      cellPadding: 2,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { left: 14, right: 14 },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 50 },
      2: { cellWidth: 25 },
      3: { cellWidth: 18, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 35 },
    },
  });
  
  // Añadir pie de página
  addPDFFooter(doc);
  
  // Retornar como base64
  return doc.output('dataurlstring');
}