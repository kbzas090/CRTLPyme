/**
 * Servicio de integración con SendGrid para envío de emails
 * Gestiona todas las notificaciones por correo electrónico del sistema
 */

import sgMail from '@sendgrid/mail';

// Configurar API Key de SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@crtlpyme.cl';
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'CRTLPyme';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, any>;
}

/**
 * Envía un email usando SendGrid
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!SENDGRID_API_KEY) {
    console.error('SENDGRID_API_KEY no está configurado');
    return false;
  }

  try {
    const msg = {
      to: options.to,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      subject: options.subject,
      text: options.text || '',
      html: options.html,
      ...(options.templateId && {
        templateId: options.templateId,
        dynamicTemplateData: options.dynamicTemplateData || {},
      }),
    };

    await sgMail.send(msg);
    console.log(`Email enviado exitosamente a ${options.to}`);
    return true;
  } catch (error: any) {
    console.error('Error al enviar email:', error);
    if (error.response) {
      console.error('SendGrid error response:', error.response.body);
    }
    return false;
  }
}

/**
 * Envía email de bienvenida a nuevo tenant
 */
export async function sendWelcomeEmail(
  email: string,
  businessName: string,
  planName: string
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9fafb; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
        .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>¡Bienvenido a CRTLPyme!</h1>
        </div>
        <div class="content">
          <h2>Hola ${businessName},</h2>
          <p>¡Gracias por unirte a CRTLPyme! Tu cuenta ha sido creada exitosamente.</p>
          <p><strong>Plan contratado:</strong> ${planName}</p>
          <p>Ya puedes comenzar a usar nuestra plataforma de punto de venta e inventario.</p>
          <a href="${process.env.NEXTAUTH_URL}/login" class="button">Acceder a mi cuenta</a>
          <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
        </div>
        <div class="footer">
          <p>© 2024 CRTLPyme - Sistema de Gestión para Pequeñas Empresas</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject: `¡Bienvenido a CRTLPyme!`,
    html,
  });
}

/**
 * Envía confirmación de pago exitoso
 */
export async function sendPaymentSuccessEmail(
  email: string,
  businessName: string,
  amount: number,
  planName: string,
  nextBillingDate: Date
): Promise<boolean> {
  const formattedAmount = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(amount);

  const formattedDate = new Intl.DateTimeFormat('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(nextBillingDate);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #10b981; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9fafb; }
        .invoice-box { background: white; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ Pago Recibido</h1>
        </div>
        <div class="content">
          <h2>Hola ${businessName},</h2>
          <p>Tu pago ha sido procesado exitosamente. ¡Gracias por tu confianza!</p>
          
          <div class="invoice-box">
            <h3>Detalle del Pago</h3>
            <p><strong>Plan:</strong> ${planName}</p>
            <p><strong>Monto:</strong> ${formattedAmount}</p>
            <p><strong>Fecha de pago:</strong> ${new Intl.DateTimeFormat('es-CL').format(new Date())}</p>
            <p><strong>Próxima facturación:</strong> ${formattedDate}</p>
          </div>
          
          <p>Tu suscripción está activa y puedes seguir usando todos los servicios de CRTLPyme.</p>
        </div>
        <div class="footer">
          <p>© 2024 CRTLPyme - Sistema de Gestión para Pequeñas Empresas</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject: `Confirmación de Pago - ${planName}`,
    html,
  });
}

/**
 * Envía notificación de pago fallido
 */
export async function sendPaymentFailedEmail(
  email: string,
  businessName: string,
  amount: number,
  reason: string
): Promise<boolean> {
  const formattedAmount = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(amount);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #ef4444; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9fafb; }
        .alert-box { background: #fef2f2; padding: 15px; margin: 20px 0; border-left: 4px solid #ef4444; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
        .button { display: inline-block; padding: 12px 24px; background-color: #ef4444; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠ Problema con el Pago</h1>
        </div>
        <div class="content">
          <h2>Hola ${businessName},</h2>
          <p>No pudimos procesar tu pago de suscripción.</p>
          
          <div class="alert-box">
            <p><strong>Monto:</strong> ${formattedAmount}</p>
            <p><strong>Motivo:</strong> ${reason}</p>
          </div>
          
          <p>Por favor, actualiza tu método de pago para continuar usando los servicios de CRTLPyme.</p>
          
          <a href="${process.env.NEXTAUTH_URL}/subscription" class="button">Actualizar Método de Pago</a>
          
          <p>Si tienes alguna pregunta, contáctanos lo antes posible.</p>
        </div>
        <div class="footer">
          <p>© 2024 CRTLPyme - Sistema de Gestión para Pequeñas Empresas</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject: `⚠ Problema con tu Pago - CRTLPyme`,
    html,
  });
}

/**
 * Envía recordatorio de renovación de suscripción
 */
export async function sendSubscriptionRenewalReminder(
  email: string,
  businessName: string,
  planName: string,
  renewalDate: Date,
  amount: number
): Promise<boolean> {
  const formattedAmount = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(amount);

  const formattedDate = new Intl.DateTimeFormat('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(renewalDate);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f59e0b; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9fafb; }
        .info-box { background: #fffbeb; padding: 15px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 Próxima Renovación</h1>
        </div>
        <div class="content">
          <h2>Hola ${businessName},</h2>
          <p>Te recordamos que tu suscripción se renovará próximamente.</p>
          
          <div class="info-box">
            <p><strong>Plan:</strong> ${planName}</p>
            <p><strong>Fecha de renovación:</strong> ${formattedDate}</p>
            <p><strong>Monto:</strong> ${formattedAmount}</p>
          </div>
          
          <p>El cargo se procesará automáticamente en la fecha indicada.</p>
          <p>Si deseas realizar algún cambio en tu suscripción, puedes hacerlo desde tu panel de control.</p>
        </div>
        <div class="footer">
          <p>© 2024 CRTLPyme - Sistema de Gestión para Pequeñas Empresas</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject: `Recordatorio: Renovación de Suscripción - ${planName}`,
    html,
  });
}

/**
 * Envía notificación de cambio de plan
 */
export async function sendPlanChangeEmail(
  email: string,
  businessName: string,
  oldPlan: string,
  newPlan: string,
  effectiveDate: Date
): Promise<boolean> {
  const formattedDate = new Intl.DateTimeFormat('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(effectiveDate);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #8b5cf6; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9fafb; }
        .change-box { background: white; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔄 Cambio de Plan</h1>
        </div>
        <div class="content">
          <h2>Hola ${businessName},</h2>
          <p>Tu plan de suscripción ha sido actualizado exitosamente.</p>
          
          <div class="change-box">
            <p><strong>Plan anterior:</strong> ${oldPlan}</p>
            <p><strong>Nuevo plan:</strong> ${newPlan}</p>
            <p><strong>Fecha efectiva:</strong> ${formattedDate}</p>
          </div>
          
          <p>Los cambios serán efectivos a partir de la fecha indicada.</p>
          <p>¡Gracias por confiar en CRTLPyme!</p>
        </div>
        <div class="footer">
          <p>© 2024 CRTLPyme - Sistema de Gestión para Pequeñas Empresas</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject: `Cambio de Plan Confirmado - CRTLPyme`,
    html,
  });
}

/**
 * Envía notificación de cuenta suspendida
 */
export async function sendAccountSuspendedEmail(
  email: string,
  businessName: string,
  reason: string
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9fafb; }
        .alert-box { background: #fef2f2; padding: 15px; margin: 20px 0; border-left: 4px solid #dc2626; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠ Cuenta Suspendida</h1>
        </div>
        <div class="content">
          <h2>Hola ${businessName},</h2>
          <p>Tu cuenta de CRTLPyme ha sido suspendida.</p>
          
          <div class="alert-box">
            <p><strong>Motivo:</strong> ${reason}</p>
          </div>
          
          <p>Para reactivar tu cuenta, por favor contacta con nuestro equipo de soporte.</p>
          <p><strong>Email de soporte:</strong> support@crtlpyme.cl</p>
        </div>
        <div class="footer">
          <p>© 2024 CRTLPyme - Sistema de Gestión para Pequeñas Empresas</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject: `Cuenta Suspendida - CRTLPyme`,
    html,
  });
}

/**
 * Envía notificación de cuenta reactivada
 */
export async function sendAccountReactivatedEmail(
  email: string,
  businessName: string
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #10b981; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9fafb; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
        .button { display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ Cuenta Reactivada</h1>
        </div>
        <div class="content">
          <h2>Hola ${businessName},</h2>
          <p>¡Buenas noticias! Tu cuenta de CRTLPyme ha sido reactivada.</p>
          <p>Ya puedes volver a acceder a todos los servicios de la plataforma.</p>
          
          <a href="${process.env.NEXTAUTH_URL}/login" class="button">Acceder a mi cuenta</a>
          
          <p>¡Bienvenido de nuevo!</p>
        </div>
        <div class="footer">
          <p>© 2024 CRTLPyme - Sistema de Gestión para Pequeñas Empresas</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject: `Cuenta Reactivada - CRTLPyme`,
    html,
  });
}
