/**
 * Subscription Plans Component
 * 
 * Muestra los planes de suscripción disponibles con sus características
 * y permite al usuario seleccionar e iniciar el proceso de pago
 */

'use client';

import { useState, useEffect } from 'react';
import { Check, Loader2, CreditCard, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: 'MONTHLY' | 'YEARLY';
  trialDays: number;
  features: string[];
  maxUsers: number | null;
  maxProducts: number | null;
  maxSales: number | null;
  sortOrder: number;
  isActive: boolean;
  isVisible: boolean;
}

interface SubscriptionPlansProps {
  tenantId: string;
  onPaymentInit?: (planId: string) => void;
}

export default function SubscriptionPlans({ tenantId, onPaymentInit }: SubscriptionPlansProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const { toast } = useToast();

  // Cargar planes
  useEffect(() => {
    fetchPlans();
  }, [billingCycle]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/subscriptions/plans?billingCycle=${billingCycle}`);
      const data = await response.json();

      if (data.success) {
        setPlans(data.data);
      } else {
        throw new Error(data.error || 'Error al cargar planes');
      }
    } catch (error) {
      console.error('Error cargando planes:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los planes de suscripción',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (planId: string) => {
    try {
      setProcessingPlanId(planId);

      // Iniciar transacción de pago
      const response = await fetch('/api/subscriptions/payment/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          tenantId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Redirigiendo a pago...',
          description: 'Serás redirigido al portal de pago de Transbank',
        });

        // Callback opcional
        if (onPaymentInit) {
          onPaymentInit(planId);
        }

        // Redirigir a Transbank
        setTimeout(() => {
          window.location.href = `${data.data.transbankUrl}?token_ws=${data.data.transbankToken}`;
        }, 1000);
      } else {
        throw new Error(data.error || 'Error al iniciar pago');
      }
    } catch (error) {
      console.error('Error iniciando pago:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al iniciar el pago',
        variant: 'destructive',
      });
      setProcessingPlanId(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getPlanColor = (index: number) => {
    const colors = [
      'border-gray-200',
      'border-blue-200',
      'border-purple-200',
      'border-yellow-200',
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">
          Elige el plan perfecto para tu negocio
        </h2>
        <p className="text-muted-foreground text-lg">
          Comienza con una prueba gratuita. Sin tarjeta de crédito requerida.
        </p>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center">
        <Tabs value={billingCycle} onValueChange={(value) => setBillingCycle(value as 'MONTHLY' | 'YEARLY')}>
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="MONTHLY">
              Mensual
            </TabsTrigger>
            <TabsTrigger value="YEARLY">
              Anual
              <Badge variant="secondary" className="ml-2">
                Ahorra 20%
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-4">
        {plans.map((plan, index) => {
          const isFree = plan.price === 0;
          const isPopular = index === 2; // Plan Profesional
          const isProcessing = processingPlanId === plan.id;

          return (
            <Card
              key={plan.id}
              className={`relative flex flex-col ${getPlanColor(index)} ${
                isPopular ? 'border-2 border-primary shadow-lg scale-105' : ''
              }`}
            >
              {isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Zap className="h-3 w-3 mr-1" />
                    Más Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-4">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription className="text-sm">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    {formatPrice(plan.price)}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {isFree ? '' : billingCycle === 'MONTHLY' ? '/mes' : '/año'}
                  </span>
                </div>
                {plan.trialDays > 0 && (
                  <Badge variant="outline" className="w-fit mt-2">
                    {plan.trialDays} días de prueba gratis
                  </Badge>
                )}
              </CardHeader>

              <CardContent className="flex-grow space-y-3 pb-6">
                <ul className="space-y-2">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-4">
                <Button
                  className="w-full"
                  variant={isPopular ? 'default' : 'outline'}
                  disabled={isProcessing}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      {isFree ? 'Comenzar Gratis' : 'Seleccionar Plan'}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Trust Badges */}
      <div className="text-center pt-8 space-y-2">
        <p className="text-sm text-muted-foreground">
          ✓ Pago seguro con Transbank • ✓ Cancela cuando quieras • ✓ Soporte en español
        </p>
      </div>
    </div>
  );
}
