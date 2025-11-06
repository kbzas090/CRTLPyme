/**
 * Payment Error Page
 * 
 * Página que se muestra cuando hay un error en el pago
 */

'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { XCircle, ArrowLeft, RefreshCw, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function PaymentErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reason = searchParams.get('reason');
  const message = searchParams.get('message');

  const handleRetry = () => {
    router.push('/subscriptions/plans');
  };

  const handleGoBack = () => {
    router.push('/dashboard');
  };

  const getErrorInfo = () => {
    switch (reason) {
      case 'payment_rejected':
        return {
          title: 'Pago Rechazado',
          description: message || 'La transacción fue rechazada por el banco emisor',
          icon: <XCircle className="h-16 w-16 text-red-600" />,
          suggestions: [
            'Verifica que tu tarjeta tenga fondos suficientes',
            'Asegúrate de que los datos de la tarjeta sean correctos',
            'Contacta a tu banco si el problema persiste',
            'Intenta con otra tarjeta de crédito o débito',
          ],
        };
      case 'no_token':
        return {
          title: 'Error de Verificación',
          description: 'No se pudo verificar la transacción con Transbank',
          icon: <XCircle className="h-16 w-16 text-orange-600" />,
          suggestions: [
            'Por favor intenta nuevamente',
            'Si el problema persiste, contacta a soporte',
          ],
        };
      case 'payment_not_found':
        return {
          title: 'Pago No Encontrado',
          description: 'No se pudo encontrar el registro de pago en nuestro sistema',
          icon: <XCircle className="h-16 w-16 text-orange-600" />,
          suggestions: [
            'Si tu banco ya realizó el cobro, contacta a soporte',
            'Intenta crear una nueva transacción',
          ],
        };
      case 'processing_error':
        return {
          title: 'Error de Procesamiento',
          description: 'Ocurrió un error al procesar tu pago',
          icon: <XCircle className="h-16 w-16 text-red-600" />,
          suggestions: [
            'Por favor intenta nuevamente en unos minutos',
            'Si el problema persiste, contacta a soporte',
          ],
        };
      default:
        return {
          title: 'Error en el Pago',
          description: 'Ocurrió un error inesperado durante el proceso de pago',
          icon: <XCircle className="h-16 w-16 text-red-600" />,
          suggestions: [
            'Por favor intenta nuevamente',
            'Si el problema persiste, contacta a soporte',
          ],
        };
    }
  };

  const errorInfo = getErrorInfo();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <Card className="w-full max-w-2xl border-red-200 shadow-xl">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex justify-center">
            <div className="rounded-full bg-red-100 p-4">
              {errorInfo.icon}
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-red-700">
            {errorInfo.title}
          </CardTitle>
          <CardDescription className="text-lg">
            {errorInfo.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Mensaje de error detallado si existe */}
          {message && reason === 'payment_rejected' && (
            <Alert variant="destructive">
              <AlertTitle>Detalles del Rechazo</AlertTitle>
              <AlertDescription>{decodeURIComponent(message)}</AlertDescription>
            </Alert>
          )}

          {/* Sugerencias */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-orange-600" />
              <h4 className="font-semibold">¿Qué puedes hacer?</h4>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {errorInfo.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Información de soporte */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>¿Necesitas ayuda?</strong> Nuestro equipo de soporte está disponible
              para ayudarte. Contacta a{' '}
              <a
                href="mailto:soporte@crtlpyme.cl"
                className="underline font-semibold"
              >
                soporte@crtlpyme.cl
              </a>
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3 pt-6">
          <Button
            variant="outline"
            className="w-full"
            size="lg"
            onClick={handleGoBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Dashboard
          </Button>
          <Button className="w-full" size="lg" onClick={handleRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Intentar Nuevamente
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
