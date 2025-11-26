/**
 * Configuración de Transbank para pagos
 * Usa credenciales de sandbox para pruebas
 */

import { WebpayPlus, Options, IntegrationCommerceCodes, IntegrationApiKeys, Environment } from 'transbank-sdk';

// Usar credenciales de integración predefinidas del SDK
// En producción, usar las credenciales reales del comercio
export const webpayPlus = new WebpayPlus.Transaction(
  new Options(
    IntegrationCommerceCodes.WEBPAY_PLUS,
    IntegrationApiKeys.WEBPAY,
    Environment.Integration
  )
);

// URLs de retorno (deben ser públicas para que Transbank pueda llamarlas)
export const getReturnUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/admin-saas/payment-return`;
};

export const getSuccessUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/admin-saas/payment-return?payment=success`;
};

export const getFailureUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/admin-saas/payment-return?payment=failed`;
};

/**
 * Crear una nueva transacción de pago
 */
export const createTransaction = async (
  buyOrder: string,
  sessionId: string,
  amount: number,
  returnUrl: string
) => {
  try {
    const response = await webpayPlus.create(
      buyOrder,
      sessionId,
      amount,
      returnUrl
    );
    
    return {
      success: true,
      token: response.token,
      url: response.url,
    };
  } catch (error) {
    console.error('Error creating Transbank transaction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};

/**
 * Confirmar una transacción
 */
export const confirmTransaction = async (token: string) => {
  try {
    const response = await webpayPlus.commit(token);
    
    return {
      success: response.response_code === 0,
      response,
    };
  } catch (error) {
    console.error('Error confirming Transbank transaction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};

/**
 * Obtener el estado de una transacción
 */
export const getTransactionStatus = async (token: string) => {
  try {
    const response = await webpayPlus.status(token);
    return {
      success: true,
      response,
    };
  } catch (error) {
    console.error('Error getting Transbank transaction status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};

/**
 * Refundar una transacción
 */
export const refundTransaction = async (token: string, amount: number) => {
  try {
    const response = await webpayPlus.refund(token, amount);
    return {
      success: true,
      response,
    };
  } catch (error) {
    console.error('Error refunding Transbank transaction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};
