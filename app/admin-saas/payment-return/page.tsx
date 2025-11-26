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
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface PaymentResult {
  success: boolean;
  message: string;
}

function PaymentReturnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);
  const [result, setResult] = useState<PaymentResult | null>(null);

  useEffect(() => {
    // Leer el resultado del pago desde los parámetros de URL
    const paymentStatus = searchParams.get('payment');
    
    if (paymentStatus === 'success') {
      setResult({
        success: true,
        message: '¡Tu cambio de plan fue exitoso!',
      });
      
      // Mostrar toast de éxito
      toast({
        title: '✅ ¡Cambio de plan exitoso!',
        description: 'El plan del tenant ha sido actualizado correctamente.',
        variant: 'default',
      });
    } else if (paymentStatus === 'failed') {
      setResult({
        success: false,
        message: 'El pago no pudo ser procesado.',
      });
      
      // Mostrar toast de error
      toast({
        title: '❌ Pago rechazado',
        description: 'No se pudo procesar el pago. Intenta nuevamente.',
        variant: 'destructive',
      });
    } else {
      setResult({
        success: false,
        message: 'No se pudo determinar el estado del pago.',
      });
    }
    
    setIsProcessing(false);
  }, [searchParams, toast]);

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
          {/* Mensaje de éxito */}
          {result?.success && (
            <div className="bg-green-50 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-900">Plan Actualizado</h3>
                  <p className="text-sm text-green-700">
                    El cambio de plan se ha completado exitosamente. El tenant ha sido actualizado con el nuevo plan.
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
                    <li>Puedes intentar el proceso nuevamente desde la página del cliente</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/admin-saas/tenants">
              <Button size="lg">
                Volver a Clientes
              </Button>
            </Link>
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
