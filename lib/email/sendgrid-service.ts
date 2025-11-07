
import sgMail from '@sendgrid/mail'

// Inicializar SendGrid con la API key
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || ''
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@crtlpyme.com'
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'CRTLPyme'

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY)
}

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export class SendGridService {
  /**
   * Envía un email usando SendGrid
   */
  static async sendEmail({ to, subject, html, text }: EmailOptions): Promise<boolean> {
    if (!SENDGRID_API_KEY) {
      console.warn('SendGrid API Key no está configurada. Email no enviado.')
      return false
    }

    try {
      await sgMail.send({
        to,
        from: {
          email: FROM_EMAIL,
          name: FROM_NAME
        },
        subject,
        text: text || '',
        html
      })

      console.log(`Email enviado exitosamente a: ${to}`)
      return true
    } catch (error: any) {
      console.error('Error al enviar email con SendGrid:', error)
      if (error.response) {
        console.error('Detalles del error:', error.response.body)
      }
      return false
    }
  }

  /**
   * Envía email de bienvenida a un nuevo usuario
   */
  static async sendWelcomeEmail(
    userEmail: string,
    userName: string,
    tenantName: string
  ): Promise<boolean> {
    const subject = `¡Bienvenido a ${tenantName} en CRTLPyme!`
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #2563eb 0%, #10b981 100%);
              padding: 40px 20px;
              text-align: center;
              color: white;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 600;
            }
            .content {
              padding: 40px 30px;
            }
            .content h2 {
              color: #2563eb;
              font-size: 24px;
              margin-top: 0;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background-color: #2563eb;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
              font-weight: 600;
            }
            .footer {
              background-color: #f9fafb;
              padding: 20px;
              text-align: center;
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 ¡Bienvenido a CRTLPyme!</h1>
            </div>
            <div class="content">
              <h2>Hola ${userName},</h2>
              <p>
                ¡Bienvenido a <strong>${tenantName}</strong>! Estamos emocionados de tenerte como parte 
                de nuestro equipo en CRTLPyme, la plataforma POS-SaaS diseñada especialmente para pequeñas 
                y medianas empresas.
              </p>
              <p>
                Con CRTLPyme podrás:
              </p>
              <ul>
                <li>Gestionar tu inventario en tiempo real</li>
                <li>Realizar ventas de forma rápida y eficiente</li>
                <li>Controlar tu caja y flujo de efectivo</li>
                <li>Generar reportes y analíticas de tu negocio</li>
                <li>Y mucho más...</li>
              </ul>
              <p>
                Tu cuenta ya está lista para usar. Inicia sesión y comienza a descubrir todas las 
                herramientas que tenemos para ti.
              </p>
              <div style="text-align: center;">
                <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/login" class="button">
                  Iniciar Sesión
                </a>
              </div>
              <p>
                Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.
              </p>
              <p>
                ¡Saludos!<br>
                <strong>El equipo de CRTLPyme</strong>
              </p>
            </div>
            <div class="footer">
              <p>
                © ${new Date().getFullYear()} CRTLPyme. Todos los derechos reservados.<br>
                Este es un correo automático, por favor no responder.
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    const text = `
      ¡Bienvenido a CRTLPyme!
      
      Hola ${userName},
      
      Bienvenido a ${tenantName}. Tu cuenta ya está lista para usar.
      
      Inicia sesión en: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/login
      
      ¡Saludos!
      El equipo de CRTLPyme
    `

    return this.sendEmail({
      to: userEmail,
      subject,
      html,
      text
    })
  }

  /**
   * Envía confirmación de venta al cliente
   */
  static async sendSaleConfirmationEmail(
    customerEmail: string,
    customerName: string,
    saleNumber: string,
    total: number,
    items: any[]
  ): Promise<boolean> {
    const subject = `Confirmación de Compra #${saleNumber}`
    
    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${item.unitPrice.toLocaleString('es-CL')}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">$${item.subtotal.toLocaleString('es-CL')}</td>
      </tr>
    `).join('')

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .header {
              background-color: #10b981;
              padding: 30px 20px;
              text-align: center;
              color: white;
            }
            .content {
              padding: 30px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            .total {
              background-color: #f9fafb;
              padding: 15px;
              text-align: right;
              font-size: 18px;
              font-weight: 600;
              margin-top: 20px;
              border-radius: 6px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Compra Confirmada</h1>
              <p>Venta #${saleNumber}</p>
            </div>
            <div class="content">
              <p>Hola ${customerName},</p>
              <p>Gracias por tu compra. Aquí está el detalle de tu pedido:</p>
              
              <table>
                <thead>
                  <tr style="background-color: #f3f4f6;">
                    <th style="padding: 10px; text-align: left;">Producto</th>
                    <th style="padding: 10px; text-align: center;">Cantidad</th>
                    <th style="padding: 10px; text-align: right;">Precio Unit.</th>
                    <th style="padding: 10px; text-align: right;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              
              <div class="total">
                Total: $${total.toLocaleString('es-CL')}
              </div>
              
              <p style="margin-top: 30px;">
                Si tienes alguna pregunta sobre tu compra, no dudes en contactarnos.
              </p>
              <p>¡Gracias por tu preferencia!</p>
            </div>
          </div>
        </body>
      </html>
    `

    const text = `
      Confirmación de Compra #${saleNumber}
      
      Hola ${customerName},
      
      Gracias por tu compra. Total: $${total.toLocaleString('es-CL')}
      
      ¡Gracias por tu preferencia!
    `

    return this.sendEmail({
      to: customerEmail,
      subject,
      html,
      text
    })
  }

  /**
   * Envía notificación de stock bajo
   */
  static async sendLowStockAlert(
    adminEmail: string,
    adminName: string,
    lowStockProducts: any[]
  ): Promise<boolean> {
    const subject = '⚠️ Alerta: Productos con Stock Bajo'
    
    const productsHtml = lowStockProducts.map(product => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${product.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">
          <span style="color: ${product.stock === 0 ? '#dc2626' : '#f59e0b'}; font-weight: 600;">
            ${product.stock}
          </span>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${product.minStock}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">
          ${product.stock === 0 ? '🔴 Agotado' : '🟡 Stock Bajo'}
        </td>
      </tr>
    `).join('')

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .header {
              background-color: #f59e0b;
              padding: 30px 20px;
              text-align: center;
              color: white;
            }
            .content {
              padding: 30px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            .alert-box {
              background-color: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Alerta de Stock</h1>
            </div>
            <div class="content">
              <p>Hola ${adminName},</p>
              
              <div class="alert-box">
                <strong>Atención:</strong> Tienes ${lowStockProducts.length} producto(s) con stock bajo o agotado.
              </div>
              
              <p>Es importante que revises y repongas el inventario de los siguientes productos:</p>
              
              <table>
                <thead>
                  <tr style="background-color: #f3f4f6;">
                    <th style="padding: 10px; text-align: left;">Producto</th>
                    <th style="padding: 10px; text-align: center;">Stock Actual</th>
                    <th style="padding: 10px; text-align: center;">Stock Mínimo</th>
                    <th style="padding: 10px; text-align: center;">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  ${productsHtml}
                </tbody>
              </table>
              
              <p style="margin-top: 30px;">
                Te recomendamos realizar un pedido de reposición lo antes posible para evitar pérdida de ventas.
              </p>
              <p>
                Saludos,<br>
                Sistema CRTLPyme
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    const text = `
      Alerta de Stock Bajo
      
      Hola ${adminName},
      
      Tienes ${lowStockProducts.length} producto(s) con stock bajo o agotado.
      
      Revisa tu inventario en: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/inventory
      
      Sistema CRTLPyme
    `

    return this.sendEmail({
      to: adminEmail,
      subject,
      html,
      text
    })
  }
}

export default SendGridService
