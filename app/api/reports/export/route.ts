
/**
 * API para exportar reportes en diferentes formatos
 * GET /api/reports/export?type=sales&format=excel
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateExcel, generateCSV, formatCurrency, formatDate } from '@/lib/report-generator';
import { generateSalesReportPDF, generateProductsReportPDF, generateCustomersReportPDF, generateInventoryMovementsReportPDF } from '@/lib/pdf-generator';
import { requirePermissions } from '@/lib/api-auth';
import { MODULES, ACTIONS } from '@/lib/permissions';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const reportType = searchParams.get('type') || 'sales'; // sales, products, customers, inventory-movements
  const format = searchParams.get('format') || 'excel'; // excel, csv, pdf
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const movementType = searchParams.get('movementType'); // Para filtrar tipo de movimiento

  // Mapear tipo de reporte a módulo de permisos
  const moduleMap: Record<string, any> = {
    sales: MODULES.REPORTS_SALES,
    products: MODULES.REPORTS_PRODUCTS,
    customers: MODULES.REPORTS_CUSTOMERS,
    'inventory-movements': MODULES.REPORTS_INVENTORY_MOVEMENTS,
  };

  const requiredModule = moduleMap[reportType] || MODULES.REPORTS;

  // Verificar permisos de exportación para el tipo de reporte específico
  const authResult = await requirePermissions({
    module: requiredModule,
    action: ACTIONS.EXPORT,
  });

  if (!authResult.success) {
    return authResult.response;
  }

  const { user } = authResult;
  const tenantId = searchParams.get('tenantId') || user.tenantId;

  // Verificar acceso al tenant
  const tenantCheckResult = await requirePermissions({ tenantId });
  if (!tenantCheckResult.success) {
    return tenantCheckResult.response;
  }

  try {
    let reportData;
    let filename;

    switch (reportType) {
      case 'sales':
        reportData = await generateSalesReport(tenantId, startDate, endDate);
        filename = `reporte-ventas-${Date.now()}`;
        break;
      case 'products':
        reportData = await generateProductsReport(tenantId, startDate, endDate);
        filename = `reporte-productos-${Date.now()}`;
        break;
      case 'customers':
        reportData = await generateCustomersReport(tenantId, startDate, endDate);
        filename = `reporte-clientes-${Date.now()}`;
        break;
      case 'inventory-movements':
        reportData = await generateInventoryMovementsReport(tenantId, startDate, endDate, movementType);
        filename = `reporte-movimientos-inventario-${Date.now()}`;
        break;
      default:
        return NextResponse.json(
          { error: 'Tipo de reporte inválido' },
          { status: 400 }
        );
    }

    let fileBuffer: Buffer | string;
    let contentType: string;

    if (format === 'excel') {
      fileBuffer = generateExcel(reportData);
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      filename += '.xlsx';
    } else if (format === 'csv') {
      fileBuffer = generateCSV(reportData);
      contentType = 'text/csv';
      filename += '.csv';
    } else if (format === 'pdf') {
      // Generar PDF según el tipo de reporte
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { businessName: true },
      });
      const businessName = tenant?.businessName || 'CRTLPyme';
      const filters = { startDate, endDate };
      
      let pdfBase64: string;
      
      if (reportType === 'sales') {
        // Construir filtros para ventas
        const salesFilter: any = {
          tenantId,
          status: 'COMPLETED',
        };

        // Aplicar filtros de fecha si se proporcionan
        if (startDate || endDate) {
          salesFilter.createdAt = {};
          
          if (startDate) {
            salesFilter.createdAt.gte = new Date(startDate);
          }
          
          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            salesFilter.createdAt.lte = end;
          }
        }

        // Obtener los datos originales de ventas sin formatear
        const salesRaw = await prisma.sale.findMany({
          where: salesFilter,
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });
        
        const salesData = salesRaw.map((sale) => ({
          id: sale.id,
          saleNumber: sale.saleNumber,
          total: Number(sale.total),
          paymentMethod: sale.paymentMethod,
          createdAt: sale.createdAt.toISOString(),
          userName: `${sale.user.firstName} ${sale.user.lastName}`,
        }));
        pdfBase64 = generateSalesReportPDF(salesData, filters, businessName);
      } else if (reportType === 'products') {
        // Construir filtros para productos
        const productsFilter: any = {
          tenantId,
          isActive: true,
        };

        // Aplicar filtros de fecha si se proporcionan
        if (startDate || endDate) {
          productsFilter.createdAt = {};
          
          if (startDate) {
            productsFilter.createdAt.gte = new Date(startDate);
          }
          
          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            productsFilter.createdAt.lte = end;
          }
        }

        // Obtener los datos originales de productos sin formatear
        const productsRaw = await prisma.tenantInventory.findMany({
          where: productsFilter,
          include: {
            masterProduct: true,
          },
        });
        
        const productsData = productsRaw.map((item) => ({
          id: item.id,
          sku: item.customSku || item.masterProduct.sku,
          name: item.masterProduct.name,
          category: item.masterProduct.category,
          stock: item.stock,
          salePrice: Number(item.salePrice),
          costPrice: Number(item.costPrice),
        }));
        pdfBase64 = generateProductsReportPDF(productsData, filters, businessName);
      } else if (reportType === 'customers') {
        // Construir filtros para clientes
        const customersFilter: any = {
          tenantId,
        };

        // Aplicar filtros de fecha si se proporcionan
        if (startDate || endDate) {
          customersFilter.createdAt = {};
          
          if (startDate) {
            customersFilter.createdAt.gte = new Date(startDate);
          }
          
          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            customersFilter.createdAt.lte = end;
          }
        }

        // Obtener los datos originales de clientes sin formatear
        const customersRaw = await prisma.customer.findMany({
          where: customersFilter,
          orderBy: {
            createdAt: 'desc',
          },
        });
        
        const customersData = customersRaw.map((customer) => ({
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          createdAt: customer.createdAt.toISOString(),
        }));
        pdfBase64 = generateCustomersReportPDF(customersData, filters, businessName);
      } else if (reportType === 'inventory-movements') {
        const movementsData = reportData.rows.map((row: any[], index: number) => ({
          id: index.toString(),
          createdAt: row[0],
          productName: row[1],
          productSku: row[2],
          type: row[3],
          quantity: parseInt(row[4]),
          userName: row[5],
          reason: row[6] || null,
        }));
        pdfBase64 = generateInventoryMovementsReportPDF(movementsData, filters, businessName);
      } else {
        return NextResponse.json(
          { error: 'Tipo de reporte no soportado para PDF' },
          { status: 400 }
        );
      }
      
      // Convertir base64 a buffer
      const base64Data = pdfBase64.split(',')[1];
      fileBuffer = Buffer.from(base64Data, 'base64');
      contentType = 'application/pdf';
      filename += '.pdf';
    } else {
      return NextResponse.json(
        { error: 'Formato inválido' },
        { status: 400 }
      );
    }

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exportando reporte:', error);
    return NextResponse.json(
      { error: 'Error al exportar reporte' },
      { status: 500 }
    );
  }
}

async function generateSalesReport(tenantId: string, startDate: string | null, endDate: string | null) {
  const dateFilter: any = {
    tenantId,
    status: 'COMPLETED',
  };

  if (startDate) {
    dateFilter.createdAt = {
      ...dateFilter.createdAt,
      gte: new Date(startDate),
    };
  }

  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    dateFilter.createdAt = {
      ...dateFilter.createdAt,
      lte: end,
    };
  }

  const sales = await prisma.sale.findMany({
    where: dateFilter,
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      items: {
        include: {
          tenantInventory: {
            include: {
              masterProduct: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const headers = [
    'Número de Venta',
    'Fecha',
    'Cajero',
    'Método de Pago',
    'Subtotal',
    'Total',
    'Productos',
  ];

  const rows = sales.map((sale) => [
    sale.saleNumber,
    formatDate(sale.createdAt),
    `${sale.user.firstName} ${sale.user.lastName}`,
    sale.paymentMethod,
    formatCurrency(Number(sale.subtotal)),
    formatCurrency(Number(sale.total)),
    sale.items.length.toString(),
  ]);

  const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total), 0);

  return {
    title: 'Reporte de Ventas',
    headers,
    rows,
    summary: {
      'Total de Ventas': sales.length,
      'Ingresos Totales': formatCurrency(totalRevenue),
      'Ticket Promedio': formatCurrency(sales.length > 0 ? totalRevenue / sales.length : 0),
    },
  };
}

async function generateProductsReport(tenantId: string, startDate: string | null, endDate: string | null) {
  // Construir filtros
  const filter: any = {
    tenantId,
    isActive: true,
  };

  // Aplicar filtros de fecha si se proporcionan
  if (startDate || endDate) {
    filter.createdAt = {};
    
    if (startDate) {
      filter.createdAt.gte = new Date(startDate);
    }
    
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.lte = end;
    }
  }

  const inventory = await prisma.tenantInventory.findMany({
    where: filter,
    include: {
      masterProduct: true,
    },
  });

  const headers = [
    'SKU',
    'Nombre',
    'Categoría',
    'Marca',
    'Stock Actual',
    'Stock Mínimo',
    'Precio Costo',
    'Precio Venta',
    'Margen (%)',
    'Valor Inventario',
  ];

  const rows = inventory.map((item) => {
    const margin =
      Number(item.salePrice) > 0
        ? ((Number(item.salePrice) - Number(item.costPrice)) / Number(item.salePrice)) * 100
        : 0;
    const inventoryValue = Number(item.costPrice) * item.stock;

    return [
      item.customSku || item.masterProduct.sku,
      item.masterProduct.name,
      item.masterProduct.category,
      item.masterProduct.brand || 'N/A',
      item.stock.toString(),
      item.minStock.toString(),
      formatCurrency(Number(item.costPrice)),
      formatCurrency(Number(item.salePrice)),
      margin.toFixed(2) + '%',
      formatCurrency(inventoryValue),
    ];
  });

  const totalValue = inventory.reduce(
    (sum, item) => sum + Number(item.costPrice) * item.stock,
    0
  );

  return {
    title: 'Reporte de Productos',
    headers,
    rows,
    summary: {
      'Total de Productos': inventory.length,
      'Valor Total del Inventario': formatCurrency(totalValue),
    },
  };
}

async function generateCustomersReport(tenantId: string, startDate: string | null, endDate: string | null) {
  // Construir filtros
  const filter: any = {
    tenantId,
  };

  // Aplicar filtros de fecha si se proporcionan
  if (startDate || endDate) {
    filter.createdAt = {};
    
    if (startDate) {
      filter.createdAt.gte = new Date(startDate);
    }
    
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.lte = end;
    }
  }

  const customers = await prisma.customer.findMany({
    where: filter,
    orderBy: {
      createdAt: 'desc',
    },
  });

  const headers = [
    'Nombre',
    'Email',
    'Teléfono',
    'Dirección',
    'Fecha de Registro',
  ];

  const rows = customers.map((customer) => [
    customer.name,
    customer.email || 'N/A',
    customer.phone || 'N/A',
    customer.address || 'N/A',
    formatDate(customer.createdAt),
  ]);

  return {
    title: 'Reporte de Clientes',
    headers,
    rows,
    summary: {
      'Total de Clientes': customers.length,
    },
  };
}

async function generateInventoryMovementsReport(
  tenantId: string,
  startDate: string | null,
  endDate: string | null,
  movementType: string | null
) {
  const dateFilter: any = {
    tenantId,
  };

  if (movementType) {
    dateFilter.type = movementType;
  }

  if (startDate) {
    dateFilter.createdAt = {
      ...dateFilter.createdAt,
      gte: new Date(startDate),
    };
  }

  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    dateFilter.createdAt = {
      ...dateFilter.createdAt,
      lte: end,
    };
  }

  const movements = await prisma.inventoryMovement.findMany({
    where: dateFilter,
    include: {
      tenantInventory: {
        include: {
          masterProduct: true,
        },
      },
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const headers = [
    'Fecha',
    'Producto',
    'SKU',
    'Tipo',
    'Cantidad',
    'Usuario',
    'Motivo',
  ];

  const MOVEMENT_TYPE_LABELS: Record<string, string> = {
    ENTRY: 'Entrada',
    EXIT: 'Salida',
    ADJUSTMENT: 'Ajuste',
  };

  const rows = movements.map((movement) => [
    formatDate(movement.createdAt),
    movement.tenantInventory.masterProduct.name,
    movement.tenantInventory.customSku || movement.tenantInventory.masterProduct.sku,
    MOVEMENT_TYPE_LABELS[movement.type] || movement.type,
    movement.quantity.toString(),
    `${movement.user.firstName} ${movement.user.lastName}`,
    movement.reason || movement.notes || 'N/A',
  ]);

  const totalMovements = movements.length;
  const entriesCount = movements.filter(m => m.type === 'ENTRY').length;
  const exitsCount = movements.filter(m => m.type === 'EXIT').length;
  const adjustmentsCount = movements.filter(m => m.type === 'ADJUSTMENT').length;

  const totalEntryQuantity = movements
    .filter(m => m.type === 'ENTRY')
    .reduce((sum, m) => sum + Math.abs(m.quantity), 0);
  
  const totalExitQuantity = movements
    .filter(m => m.type === 'EXIT')
    .reduce((sum, m) => sum + Math.abs(m.quantity), 0);

  return {
    title: 'Reporte de Movimientos de Inventario',
    headers,
    rows,
    summary: {
      'Total de Movimientos': totalMovements,
      'Entradas': entriesCount,
      'Salidas': exitsCount,
      'Ajustes': adjustmentsCount,
      'Total Entradas (unidades)': totalEntryQuantity,
      'Total Salidas (unidades)': totalExitQuantity,
      'Cambio Neto': totalEntryQuantity - totalExitQuantity,
    },
  };
}
