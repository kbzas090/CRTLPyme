/**
 * Transbank Integration Helper
 * 
 * Este módulo maneja la integración con la API de Transbank Webpay Plus
 * para procesamiento de pagos de suscripciones.
 * 
 * Documentación: https://www.transbankdevelopers.cl/
 */

import { WebpayPlus, Options, IntegrationApiKeys, IntegrationCommerceCodes, Environment } from 'transbank-sdk';

/**
 * Configuración de Transbank según variables de entorno
 */
const TRANSBANK_CONFIG = {
  apiKey: process.env.TRANSBANK_API_KEY || IntegrationApiKeys.WEBPAY_PLUS,
  commerceCode: process.env.TRANSBANK_COMMERCE_CODE || IntegrationCommerceCodes.WEBPAY_PLUS,
  environment: process.env.TRANSBANK_ENVIRONMENT === 'production' 
    ? Environment.Production 
    : Environment.Integration,
};

/**
 * Inicializa y retorna una instancia configurada de Webpay Plus
 */
export function getWebpayPlus() {
  try {
    // Configurar las opciones
    const options = new Options(
      TRANSBANK_CONFIG.commerceCode,
      TRANSBANK_CONFIG.apiKey,
      TRANSBANK_CONFIG.environment
    );

    // Retornar instancia de Webpay Plus con las opciones configuradas
    return new WebpayPlus.Transaction(options);
  } catch (error) {
    console.error('❌ Error inicializando Webpay Plus:', error);
    throw new Error('No se pudo inicializar Transbank Webpay Plus');
  }
}

/**
 * Interface para la respuesta de creación de transacción
 */
export interface TransbankCreateResponse {
  token: string;
  url: string;
}

/**
 * Interface para la respuesta de confirmación de transacción
 */
export interface TransbankCommitResponse {
  vci: string;
  amount: number;
  status: string;
  buy_order: string;
  session_id: string;
  card_detail: {
    card_number: string;
  };
  accounting_date: string;
  transaction_date: string;
  authorization_code: string;
  payment_type_code: string;
  response_code: number;
  installments_number: number;
}

/**
 * Crea una nueva transacción en Transbank
 * 
 * @param buyOrder - Número de orden único (máximo 26 caracteres)
 * @param sessionId - Identificador de sesión (puede ser ID de usuario/suscripción)
 * @param amount - Monto en pesos chilenos (sin decimales)
 * @param returnUrl - URL de retorno después del pago
 * @returns Token y URL para redirección al formulario de pago
 */
export async function createTransaction(
  buyOrder: string,
  sessionId: string,
  amount: number,
  returnUrl: string
): Promise<TransbankCreateResponse> {
  try {
    console.log('🚀 Creando transacción en Transbank:', {
      buyOrder,
      sessionId,
      amount,
      returnUrl,
      environment: TRANSBANK_CONFIG.environment
    });

    const transaction = getWebpayPlus();
    
    const response = await transaction.create(
      buyOrder,
      sessionId,
      amount,
      returnUrl
    );

    console.log('✅ Transacción creada exitosamente:', {
      token: response.token?.substring(0, 20) + '...',
      url: response.url
    });

    return {
      token: response.token,
      url: response.url
    };
  } catch (error) {
    console.error('❌ Error creando transacción en Transbank:', error);
    throw new Error('Error al crear transacción de pago');
  }
}

/**
 * Confirma una transacción después del retorno desde Transbank
 * 
 * @param token - Token de la transacción retornado por Transbank
 * @returns Detalles de la transacción confirmada
 */
export async function commitTransaction(
  token: string
): Promise<TransbankCommitResponse> {
  try {
    console.log('🔍 Confirmando transacción en Transbank:', {
      token: token.substring(0, 20) + '...'
    });

    const transaction = getWebpayPlus();
    const response = await transaction.commit(token);

    console.log('✅ Transacción confirmada:', {
      buyOrder: response.buy_order,
      status: response.status,
      responseCode: response.response_code,
      amount: response.amount
    });

    return response as TransbankCommitResponse;
  } catch (error) {
    console.error('❌ Error confirmando transacción en Transbank:', error);
    throw new Error('Error al confirmar transacción de pago');
  }
}

/**
 * Obtiene el estado de una transacción
 * 
 * @param token - Token de la transacción
 * @returns Estado de la transacción
 */
export async function getTransactionStatus(token: string) {
  try {
    const transaction = getWebpayPlus();
    const response = await transaction.status(token);
    return response;
  } catch (error) {
    console.error('❌ Error obteniendo estado de transacción:', error);
    throw new Error('Error al obtener estado de transacción');
  }
}

/**
 * Verifica si una transacción fue aprobada
 * 
 * @param responseCode - Código de respuesta de Transbank
 * @returns true si fue aprobada, false en caso contrario
 */
export function isTransactionApproved(responseCode: number): boolean {
  // Código 0 = transacción aprobada
  return responseCode === 0;
}

/**
 * Obtiene descripción del código de respuesta
 */
export function getResponseCodeDescription(responseCode: number): string {
  const codes: Record<string, string> = {
    '0': 'Transacción aprobada',
    '-1': 'Rechazo de transacción',
    '-2': 'Transacción debe reintentarse',
    '-3': 'Error en transacción',
    '-4': 'Rechazo de transacción',
    '-5': 'Rechazo por error de tasa',
    '-6': 'Excede cupo máximo mensual',
    '-7': 'Excede límite diario por transacción',
    '-8': 'Rubro no autorizado',
  };

  return codes[responseCode.toString()] || 'Código de respuesta desconocido';
}

/**
 * Genera un número de orden único
 * 
 * @param prefix - Prefijo para la orden (ej: "SUB" para suscripción)
 * @returns Número de orden único (máximo 26 caracteres)
 */
export function generateBuyOrder(prefix: string = 'ORD'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`.substring(0, 26);
}

/**
 * Formatea el monto para Transbank (sin decimales, entero)
 * 
 * @param amount - Monto en pesos chilenos
 * @returns Monto formateado como entero
 */
export function formatAmount(amount: number): number {
  return Math.round(amount);
}

/**
 * Alias para compatibilidad con funciones de suscripción
 */
export const processSubscriptionPayment = createTransaction;
export const confirmSubscriptionPayment = commitTransaction;

export default {
  getWebpayPlus,
  createTransaction,
  commitTransaction,
  getTransactionStatus,
  isTransactionApproved,
  getResponseCodeDescription,
  generateBuyOrder,
  formatAmount,
  processSubscriptionPayment,
  confirmSubscriptionPayment,
};
