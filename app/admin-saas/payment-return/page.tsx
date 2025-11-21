/**
 * Página de retorno de pago de Transbank
 * Maneja la respuesta del pago y actualiza el plan del tenant
 */

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface PaymentResult {
  success: boolean;
  message: string;
  transaction?: {
    id: string;
    amount: number;
    status: string;
    authorizationCode?: string;
    paymentTypeCode?: string;
    responseCode?: number;
  };
  subscription?: {
    id: string;
    planName: string;
    tenantId: string;
  };
}

function PaymentReturnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);
  const [result, setResult] = useState<PaymentResult | null>(null);

  useEffect(() => {
    const token = searchParams.get('token_ws');
    
    if (!token) {
      setResult({
        success: false,
        message: 'No se recibió el token de pago',
      });
      setIsProcessing(false);
      return;
    }

    confirmPayment(token);
  }, [searchParams]);

  const confirmPayment = async (token: string) => {
    try {
      const response = await fetch('/api/payments/transbank/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult({
          success: true,
          message: data.message || '¡Cambio de plan realizado con éxito!',
          transaction: data.transaction,
          subscription: data.subscription,
        });
      } else {
        setResult({
          success: false,
          message: data.message || 'Pago fallido. No se pudo procesar la compra del nuevo plan.',
          transaction: data.transaction,
        });
      }
    } catch (error) {
      console.error('Error al confirmar pago:', error);
      setResult({
        success: false,
        message: 'Error de conexión al confirmar el pago. Por favor, contacte con soporte.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isProcessing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="mx-auto h-16 w-16 animate-spin text-blue-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Procesando pago...</h2>
              <p className="text-gray-600">
                Por favor espera mientras confirmamos tu pago con Transbank
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            {result?.success ? (
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            ) : (
              <div className="rounded-full bg-red-100 p-3">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
            )}
          </div>
          <CardTitle className="text-center text-2xl">
            {result?.success ? '¡Pago Exitoso!' : 'Pago No Procesado'}
          </CardTitle>
          <CardDescription className="text-center text-lg">
            {result?.message}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Información de la transacción */}
          {result?.transaction && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-gray-900">Detalles de la Transacción</h3>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID de Transacción:</span>
                  <span className="font-mono font-medium">{result.transaction.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monto:</span>
                  <span className="font-semibold">{formatCurrency(result.transaction.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado:</span>
                  <span className={`font-medium ${
                    result.success ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {result.transaction.status}
                  </span>
                </div>
                {result.transaction.authorizationCode && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Código de Autorización:</span>
                    <span className="font-mono">{result.transaction.authorizationCode}</span>
                  </div>
                )}
                {result.transaction.paymentTypeCode && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipo de Pago:</span>
                    <span>{result.transaction.paymentTypeCode}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Información de la suscripción */}
          {result?.success && result?.subscription && (
            <div className="bg-green-50 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-900">Plan Actualizado</h3>
                  <p className="text-sm text-green-700">
                    El tenant ha sido actualizado al plan <strong>{result.subscription.planName}</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mensaje de error adicional */}
          {!result?.success && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-orange-900 mb-1">¿Qué hacer ahora?</p>
                  <ul className="list-disc list-inside text-orange-700 space-y-1">
                    <li>Verifica que tu tarjeta tenga fondos suficientes</li>
                    <li>Asegúrate de que tu tarjeta esté habilitada para compras en línea</li>
                    <li>Si el problema persiste, contacta con tu banco</li>
                    <li>Puedes intentar el proceso nuevamente</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-4 justify-center pt-4">
            {result?.subscription?.tenantId ? (
              <Link href={`/admin-saas/tenants/${result.subscription.tenantId}`}>
                <Button size="lg">
                  Ver Detalles del Cliente
                </Button>
              </Link>
            ) : (
              <Link href="/admin-saas/tenants">
                <Button size="lg">
                  Volver a Clientes
                </Button>
              </Link>
            )}
            
            {!result?.success && result?.subscription?.tenantId && (
              <Link href={`/admin-saas/tenants/${result.subscription.tenantId}`}>
                <Button variant="outline" size="lg">
                  Intentar Nuevamente
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="mx-auto h-16 w-16 animate-spin text-blue-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Cargando...</h2>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <PaymentReturnContent />
    </Suspense>
  );
}
