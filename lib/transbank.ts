/**
 * Servicio de integración con Transbank para procesar pagos
 * Utiliza Webpay Plus para pagos de suscripciones
 */

import { WebpayPlus, Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } from 'transbank-sdk';

// Configuración de Transbank
const TRANSBANK_ENVIRONMENT = process.env.TRANSBANK_ENVIRONMENT || 'integration';
const TRANSBANK_COMMERCE_CODE = process.env.TRANSBANK_COMMERCE_CODE || IntegrationCommerceCodes.WEBPAY_PLUS;
const TRANSBANK_API_KEY = process.env.TRANSBANK_API_KEY || IntegrationApiKeys.WEBPAY;

// Configurar ambiente de Transbank
const options = new Options(
  TRANSBANK_COMMERCE_CODE,
  TRANSBANK_API_KEY,
  TRANSBANK_ENVIRONMENT === 'production' ? Environment.Production : Environment.Integration
);

export interface TransbankPaymentRequest {
  buyOrder: string;
  sessionId: string;
  amount: number;
  returnUrl: string;
}

export interface TransbankPaymentResponse {
  token: string;
  url: string;
}

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
 * Crea una transacción de pago en Transbank
 * Retorna el token y URL para redirigir al usuario
 */
export async function createPayment(
  request: TransbankPaymentRequest
): Promise<TransbankPaymentResponse | null> {
  try {
    console.log('Creando transacción en Transbank:', {
      buyOrder: request.buyOrder,
      amount: request.amount,
      sessionId: request.sessionId,
    });

    const transaction = new WebpayPlus.Transaction(options);
    
    const response = await transaction.create(
      request.buyOrder,
      request.sessionId,
      request.amount,
      request.returnUrl
    );

    console.log('Transacción creada exitosamente:', response);

    return {
      token: response.token,
      url: response.url,
    };
  } catch (error: any) {
    console.error('Error al crear transacción en Transbank:', error);
    return null;
  }
}

/**
 * Confirma una transacción de pago después de que el usuario regrese de Transbank
 */
export async function commitPayment(
  token: string
): Promise<TransbankCommitResponse | null> {
  try {
    console.log('Confirmando transacción en Transbank:', token);

    const transaction = new WebpayPlus.Transaction(options);
    const response = await transaction.commit(token);

    console.log('Transacción confirmada exitosamente:', response);

    return response as TransbankCommitResponse;
  } catch (error: any) {
    console.error('Error al confirmar transacción en Transbank:', error);
    return null;
  }
}

/**
 * Verifica el estado de una transacción
 */
export async function getTransactionStatus(
  token: string
): Promise<TransbankCommitResponse | null> {
  try {
    console.log('Consultando estado de transacción:', token);

    const transaction = new WebpayPlus.Transaction(options);
    const response = await transaction.status(token);

    console.log('Estado de transacción obtenido:', response);

    return response as TransbankCommitResponse;
  } catch (error: any) {
    console.error('Error al consultar estado de transacción:', error);
    return null;
  }
}

/**
 * Valida si una transacción fue exitosa
 */
export function isPaymentSuccessful(response: TransbankCommitResponse): boolean {
  // Código de respuesta 0 indica transacción aprobada
  return response.response_code === 0 && response.status === 'AUTHORIZED';
}

/**
 * Formatea el monto para Transbank (sin decimales, en pesos chilenos)
 */
export function formatAmount(amount: number): number {
  // Transbank espera el monto en pesos chilenos sin decimales
  return Math.round(amount);
}

/**
 * Genera un número de orden único para Transbank
 */
export function generateBuyOrder(prefix: string = 'ORDER'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Obtiene los últimos 4 dígitos de la tarjeta
 */
export function getCardLast4(cardNumber: string): string {
  return cardNumber.slice(-4);
}

/**
 * Obtiene el tipo de tarjeta basado en el payment_type_code
 */
export function getCardType(paymentTypeCode: string): string {
  const cardTypes: Record<string, string> = {
    'VD': 'Visa Débito',
    'VN': 'Visa',
    'MC': 'Mastercard',
    'AX': 'American Express',
    'DC': 'Diners Club',
  };
  
  return cardTypes[paymentTypeCode] || 'Desconocida';
}

/**
 * Formatea la respuesta de Transbank para guardar en la base de datos
 */
export function formatTransbankResponse(response: TransbankCommitResponse) {
  return {
    vci: response.vci,
    amount: response.amount,
    status: response.status,
    buyOrder: response.buy_order,
    sessionId: response.session_id,
    cardNumber: response.card_detail.card_number,
    cardLast4: getCardLast4(response.card_detail.card_number),
    cardType: getCardType(response.payment_type_code),
    accountingDate: response.accounting_date,
    transactionDate: response.transaction_date,
    authorizationCode: response.authorization_code,
    paymentTypeCode: response.payment_type_code,
    responseCode: response.response_code,
    installmentsNumber: response.installments_number,
  };
}

/**
 * Procesa el pago de una suscripción
 * Esta es una función de alto nivel que combina todas las operaciones necesarias
 */
export async function processSubscriptionPayment(
  tenantId: string,
  subscriptionId: string,
  amount: number,
  returnUrl: string
): Promise<{ success: boolean; token?: string; url?: string; error?: string }> {
  try {
    // Generar orden de compra única
    const buyOrder = generateBuyOrder(`SUB-${tenantId.slice(0, 8)}`);
    
    // Formatear monto
    const formattedAmount = formatAmount(amount);
    
    // Crear transacción
    const payment = await createPayment({
      buyOrder,
      sessionId: subscriptionId,
      amount: formattedAmount,
      returnUrl,
    });

    if (!payment) {
      return {
        success: false,
        error: 'No se pudo crear la transacción en Transbank',
      };
    }

    return {
      success: true,
      token: payment.token,
      url: payment.url,
    };
  } catch (error: any) {
    console.error('Error al procesar pago de suscripción:', error);
    return {
      success: false,
      error: error.message || 'Error desconocido al procesar el pago',
    };
  }
}

/**
 * Confirma el pago de una suscripción después de que el usuario regrese
 */
export async function confirmSubscriptionPayment(
  token: string
): Promise<{ 
  success: boolean; 
  transactionData?: any; 
  error?: string;
}> {
  try {
    const response = await commitPayment(token);

    if (!response) {
      return {
        success: false,
        error: 'No se pudo confirmar la transacción',
      };
    }

    const isSuccess = isPaymentSuccessful(response);

    if (!isSuccess) {
      return {
        success: false,
        error: `Transacción rechazada (código: ${response.response_code})`,
        transactionData: formatTransbankResponse(response),
      };
    }

    return {
      success: true,
      transactionData: formatTransbankResponse(response),
    };
  } catch (error: any) {
    console.error('Error al confirmar pago de suscripción:', error);
    return {
      success: false,
      error: error.message || 'Error desconocido al confirmar el pago',
    };
  }
}
