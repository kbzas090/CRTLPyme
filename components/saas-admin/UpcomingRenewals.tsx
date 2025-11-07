
/**
 * Upcoming Renewals Component
 * Shows subscriptions that will renew soon
 */

'use client';

import { useEffect, useState } from 'react';
import { Loader2, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Renewal {
  id: string;
  nextBillingDate: string;
  status: string;
  tenant: {
    businessName: string;
    email: string;
    rut: string;
  };
  plan: {
    name: string;
    price: number;
    billingCycle: string;
  };
}

export function UpcomingRenewals() {
  const [renewals, setRenewals] = useState<Renewal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRenewals();
  }, []);

  const loadRenewals = async () => {
    try {
      const response = await fetch('/api/saas/subscriptions/renewals?days=30&limit=10');
      if (response.ok) {
        const data = await response.json();
        setRenewals(data.renewals);
      }
    } catch (error) {
      console.error('Error loading renewals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getDaysUntilRenewal = (dateString: string) => {
    const renewalDate = new Date(dateString);
    const today = new Date();
    const diffTime = renewalDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (renewals.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay renovaciones próximas
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cliente</TableHead>
          <TableHead>Plan</TableHead>
          <TableHead>Monto</TableHead>
          <TableHead>Fecha Renovación</TableHead>
          <TableHead>Días Restantes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {renewals.map((renewal) => {
          const daysLeft = getDaysUntilRenewal(renewal.nextBillingDate);
          return (
            <TableRow key={renewal.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{renewal.tenant.businessName}</div>
                  <div className="text-xs text-gray-500">{renewal.tenant.rut}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{renewal.plan.name}</Badge>
              </TableCell>
              <TableCell className="font-semibold">
                {formatCurrency(Number(renewal.plan.price))}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {formatDate(renewal.nextBillingDate)}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={daysLeft <= 7 ? 'destructive' : 'secondary'}
                  className={daysLeft <= 7 ? 'bg-orange-100 text-orange-800' : ''}
                >
                  {daysLeft} días
                </Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
