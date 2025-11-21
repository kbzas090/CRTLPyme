
/**
 * API para exportar reportes en diferentes formatos
 * GET /api/reports/export?type=sales&format=excel
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateExcel, generateCSV, formatCurrency, formatDate } from '@/lib/report-generator';
import { generateSalesReportPDF, generateProductsReportPDF, generateCustomersReportPDF } from '@/lib/pdf-generator';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(
      { error: 'No autenticado' },
      { status: 401 }
    );
  }

  // Solo ADMIN y PROVEEDOR pueden exportar reportes
  if (!['ADMIN', 'PROVEEDOR'].includes(session.user.role)) {
    return NextResponse.json(
      { error: 'No tiene permisos para exportar reportes' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId') || session.user.tenantId;
  const reportType = searchParams.get('type') || 'sales'; // sales, products, customers
  const format = searchParams.get('format') || 'excel'; // excel, csv, pdf
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  // Verify access to tenant
  if (tenantId !== session.user.tenantId && session.user.role !== 'PROVEEDOR') {
    return NextResponse.json(
      { error: 'No tiene permisos para exportar reportes de este tenant' },
      { status: 403 }
    );
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
        // Obtener los datos originales de ventas sin formatear
        const salesRaw = await prisma.sale.findMany({
          where: {
            tenantId,
            status: 'COMPLETED',
            ...(startDate && { createdAt: { gte: new Date(startDate) } }),
            ...(endDate && { createdAt: { lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)) } }),
          },
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
