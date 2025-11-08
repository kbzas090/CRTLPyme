'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  billingCycle: string;
  trialDays: number;
  isVisible: boolean;
  isActive: boolean;
  features: string[] | null;
  maxUsers: number | null;
  maxProducts: number | null;
  maxSales: number | null;
  sortOrder: number;
}

export default function PricingPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/public/plans');
      if (response.ok) {
        const data = await response.json();
        // Only show visible and active plans, sorted by order
        const visiblePlans = data.plans
          .filter((plan: Plan) => plan.isVisible && plan.isActive)
          .sort((a: Plan, b: Plan) => a.sortOrder - b.sortOrder);
        setPlans(visiblePlans);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getBillingCycleLabel = (cycle: string) => {
    const labels: { [key: string]: string } = {
      MONTHLY: 'mes',
      YEARLY: 'año',
      QUARTERLY: 'trimestre',
    };
    return labels[cycle] || cycle.toLowerCase();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No hay planes disponibles en este momento</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
      {plans.map((plan, index) => (
        <Card 
          key={plan.id} 
          className={`hover:shadow-xl transition-all duration-300 ${
            index === 1 ? 'border-blue-500 border-2 scale-105' : ''
          }`}
        >
          {index === 1 && (
            <div className="bg-blue-500 text-white text-center py-2 rounded-t-lg">
              <span className="text-sm font-semibold">MÁS POPULAR</span>
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-2xl">{plan.name}</CardTitle>
            {plan.description && (
              <CardDescription className="mt-2 text-base">
                {plan.description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Price */}
            <div className="border-b pb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold text-gray-900">
                  {formatCurrency(Number(plan.price))}
                </span>
              </div>
              <p className="text-gray-500 mt-1">
                por {getBillingCycleLabel(plan.billingCycle)}
              </p>
              {plan.trialDays > 0 && (
                <Badge className="mt-3 bg-green-100 text-green-700 hover:bg-green-100">
                  {plan.trialDays} días de prueba gratis
                </Badge>
              )}
            </div>

            {/* Features */}
            <div className="space-y-3">
              {/* Limits */}
              {plan.maxUsers !== null && (
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    Hasta {plan.maxUsers} usuarios
                  </span>
                </div>
              )}
              {plan.maxProducts !== null && (
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    Hasta {plan.maxProducts} productos
                  </span>
                </div>
              )}
              {plan.maxSales !== null && (
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    Hasta {plan.maxSales} ventas/mes
                  </span>
                </div>
              )}

              {/* Additional Features */}
              {plan.features && Array.isArray(plan.features) && plan.features.length > 0 && (
                <>
                  {plan.features.map((feature: string, featureIndex: number) => (
                    <div key={featureIndex} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </>
              )}

              {/* Unlimited badge if no limits */}
              {plan.maxUsers === null && plan.maxProducts === null && plan.maxSales === null && (
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-semibold">
                    Todo ilimitado
                  </span>
                </div>
              )}
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <Link href="/onboarding" className="block">
                <Button 
                  className="w-full" 
                  size="lg"
                  variant={index === 1 ? 'default' : 'outline'}
                >
                  Comenzar ahora
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
