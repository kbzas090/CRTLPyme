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

type BillingCycle = 'MONTHLY' | 'ANNUAL';

export default function PricingPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCycle, setActiveCycle] = useState<BillingCycle>('MONTHLY');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/subscription-plans');
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
      ANNUAL: 'año',
      QUARTERLY: 'trimestre',
    };
    return labels[cycle] || cycle.toLowerCase();
  };

  // Filter plans based on active billing cycle
  const getFilteredPlans = () => {
    return plans.filter((plan: Plan) => {
      if (activeCycle === 'MONTHLY') {
        return plan.billingCycle === 'MONTHLY';
      } else {
        return plan.billingCycle === 'ANNUAL';
      }
    });
  };

  // Get the most popular plan (typically the second one in each category)
  const getMostPopularIndex = (filteredPlans: Plan[]) => {
    return filteredPlans.length > 1 ? 1 : -1;
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

  const filteredPlans = getFilteredPlans();
  const mostPopularIndex = getMostPopularIndex(filteredPlans);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Elegant Billing Cycle Tabs */}
      <div className="flex flex-col items-center mb-12">
        {/* Tab Container */}
        <div className="relative flex bg-gray-50 rounded-2xl p-1.5 shadow-inner border border-gray-200">
          {/* Background highlight that moves */}
          <div 
            className={`absolute top-1.5 bottom-1.5 bg-white rounded-xl shadow-lg border-2 transition-all duration-300 ease-out ${
              activeCycle === 'MONTHLY' 
                ? 'left-1.5 right-1/2 mr-0.5 border-cyan-400' 
                : 'right-1.5 left-1/2 ml-0.5 border-cyan-400'
            }`}
          />
          
          {/* Monthly Tab */}
          <button
            onClick={() => setActiveCycle('MONTHLY')}
            className={`relative z-10 px-8 py-4 rounded-xl font-semibold transition-all duration-300 text-base min-w-[140px] ${
              activeCycle === 'MONTHLY'
                ? 'text-cyan-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Mensual
          </button>
          
          {/* Annual Tab */}
          <button
            onClick={() => setActiveCycle('ANNUAL')}
            className={`relative z-10 px-8 py-4 rounded-xl font-semibold transition-all duration-300 text-base min-w-[140px] flex items-center justify-center gap-2 ${
              activeCycle === 'ANNUAL'
                ? 'text-cyan-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>Anual</span>
            <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs px-2.5 py-0.5 rounded-full font-medium shadow-sm">
              -25%
            </Badge>
          </button>
        </div>
        
        {/* Informational Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 font-medium">
            {activeCycle === 'ANNUAL' 
              ? '✨ Los planes anuales incluyen 2 meses adicionales gratis'
              : 'Cambia a facturación anual y ahorra hasta un 25%'
            }
          </p>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 transition-all duration-500 ease-in-out">
        {filteredPlans.map((plan, index) => {
          const isPopular = index === mostPopularIndex;
          
          return (
            <Card 
              key={`${plan.id}-${activeCycle}`}
              className={`hover:shadow-xl transition-all duration-300 relative ${
                isPopular ? 'border-blue-500 border-2 sm:transform sm:scale-105' : 'border-gray-200'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-3 sm:px-4 py-1 text-xs sm:text-sm font-semibold">
                    MÁS POPULAR
                  </Badge>
                </div>
              )}
              
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                {plan.description && (
                  <CardDescription className="text-sm text-gray-600 mt-2">
                    {plan.description}
                  </CardDescription>
                )}
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Price Section */}
                <div className="border-b pb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">
                      {formatCurrency(Number(plan.price))}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">
                    por {getBillingCycleLabel(plan.billingCycle)}
                  </p>
                  {plan.trialDays > 0 && (
                    <Badge className="mt-3 bg-green-100 text-green-700 hover:bg-green-100 text-xs">
                      {plan.trialDays} días gratis
                    </Badge>
                  )}
                </div>

                {/* Features Section */}
                <div className="space-y-3 min-h-[200px]">
                  {/* User Limits */}
                  {plan.maxUsers !== null && (
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-gray-700">
                        Hasta {plan.maxUsers} usuarios
                      </span>
                    </div>
                  )}
                  
                  {/* Product Limits */}
                  {plan.maxProducts !== null && (
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-gray-700">
                        Hasta {plan.maxProducts} productos
                      </span>
                    </div>
                  )}
                  
                  {/* Sales Limits */}
                  {plan.maxSales !== null && (
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-gray-700">
                        Hasta {plan.maxSales} ventas/mes
                      </span>
                    </div>
                  )}

                  {/* Additional Features */}
                  {plan.features && (() => {
                    try {
                      const features = typeof plan.features === 'string' 
                        ? JSON.parse(plan.features) 
                        : plan.features;
                      
                      if (Array.isArray(features)) {
                        return features.map((feature: string, featureIndex: number) => (
                          <div key={featureIndex} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-gray-700">{feature}</span>
                          </div>
                        ));
                      }
                    } catch (error) {
                      console.error('Error parsing features:', error);
                      return null;
                    }
                    return null;
                  })()}

                  {/* Unlimited Features */}
                  {plan.maxUsers === null && plan.maxProducts === null && plan.maxSales === null && (
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-gray-700 font-semibold">
                        Todo ilimitado
                      </span>
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <div className="pt-4">
                  <Link href={`/onboarding?plan=${plan.id}`} className="block">
                    <Button 
                      className="w-full min-h-[48px] touch-manipulation text-sm sm:text-base" 
                      size="lg"
                      variant={isPopular ? 'default' : 'outline'}
                    >
                      {plan.price === 0 ? 'Comenzar Gratis' : 'Comenzar Ahora'}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Additional Info */}
      <div className="text-center mt-12 text-sm text-gray-500">
        <p>Todos los planes incluyen 14 días de prueba gratuita • Sin compromiso • Cancela cuando quieras</p>
      </div>
    </div>
  );
}
