/**
 * Admin SaaS - Plans Management Page
 * Full CRUD functionality for subscription plans
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, Plus, Edit, Trash2, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  billingCycle: string;
  trialDays: number;
  isVisible: boolean;
  isActive: boolean;
  features: string[];
  maxUsers: number | null;
  maxProducts: number | null;
  maxSales: number | null;
  sortOrder: number;
  activeSubscriptions?: number;
}

interface PlanFormData {
  name: string;
  description: string;
  price: string;
  billingCycle: string;
  trialDays: string;
  isVisible: boolean;
  isActive: boolean;
  features: string;
  maxUsers: string;
  maxProducts: string;
  maxSales: string;
  sortOrder: string;
}

const initialFormData: PlanFormData = {
  name: '',
  description: '',
  price: '0',
  billingCycle: 'MONTHLY',
  trialDays: '14',
  isVisible: true,
  isActive: true,
  features: '',
  maxUsers: '',
  maxProducts: '',
  maxSales: '',
  sortOrder: '0',
};

export default function PlansManagementPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PlanFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/saas/plans');
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans);
      } else {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los planes',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error loading plans:', error);
      toast({
        title: 'Error',
        description: 'Error de conexión al cargar planes',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setIsEditing(false);
    setEditingPlanId(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const handleEdit = (plan: Plan) => {
    setIsEditing(true);
    setEditingPlanId(plan.id);
    setFormData({
      name: plan.name,
      description: plan.description || '',
      price: plan.price.toString(),
      billingCycle: plan.billingCycle,
      trialDays: plan.trialDays.toString(),
      isVisible: plan.isVisible,
      isActive: plan.isActive,
      features: Array.isArray(plan.features) ? plan.features.join('\n') : '',
      maxUsers: plan.maxUsers?.toString() || '',
      maxProducts: plan.maxProducts?.toString() || '',
      maxSales: plan.maxSales?.toString() || '',
      sortOrder: plan.sortOrder.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (planId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este plan? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const response = await fetch(`/api/saas/plans/${planId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: 'Plan eliminado correctamente',
        });
        loadPlans();
      } else {
        const data = await response.json();
        toast({
          title: 'Error',
          description: data.error || 'No se pudo eliminar el plan',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        title: 'Error',
        description: 'Error de conexión al eliminar el plan',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Parse features from textarea
      const featuresArray = formData.features
        .split('\n')
        .map(f => f.trim())
        .filter(f => f.length > 0);

      const payload = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        billingCycle: formData.billingCycle,
        trialDays: parseInt(formData.trialDays),
        isVisible: formData.isVisible,
        isActive: formData.isActive,
        features: featuresArray,
        maxUsers: formData.maxUsers ? parseInt(formData.maxUsers) : null,
        maxProducts: formData.maxProducts ? parseInt(formData.maxProducts) : null,
        maxSales: formData.maxSales ? parseInt(formData.maxSales) : null,
        sortOrder: parseInt(formData.sortOrder),
      };

      const url = isEditing ? `/api/saas/plans/${editingPlanId}` : '/api/saas/plans';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast({
          title: 'Éxito',
          description: isEditing ? 'Plan actualizado correctamente' : 'Plan creado correctamente',
        });
        setIsDialogOpen(false);
        loadPlans();
      } else {
        const data = await response.json();
        toast({
          title: 'Error',
          description: data.error || 'No se pudo guardar el plan',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error saving plan:', error);
      toast({
        title: 'Error',
        description: 'Error de conexión al guardar el plan',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
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
      MONTHLY: 'Mensual',
      YEARLY: 'Anual',
      QUARTERLY: 'Trimestral',
    };
    return labels[cycle] || cycle;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Planes
          </h1>
          <p className="mt-2 text-gray-600">
            Crea y administra los planes de suscripción disponibles
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Crear Plan
        </Button>
      </div>

      {/* Plans Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : plans.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 mb-4">No hay planes creados</p>
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Crear tu primer plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    {plan.description && (
                      <CardDescription className="mt-1">
                        {plan.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {plan.isVisible ? (
                      <Eye className="h-4 w-4 text-green-500" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                    {plan.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                  {!plan.isVisible && <Badge variant="outline">Oculto</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Price */}
                <div className="border-b pb-4">
                  <div className="text-3xl font-bold text-gray-900">
                    {formatCurrency(Number(plan.price))}
                  </div>
                  <p className="text-sm text-gray-500">
                    {getBillingCycleLabel(plan.billingCycle)}
                  </p>
                  {plan.trialDays > 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      {plan.trialDays} días de prueba
                    </p>
                  )}
                </div>

                {/* Stats */}
                {plan.activeSubscriptions !== undefined && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Suscripciones activas</p>
                    <p className="text-2xl font-bold text-blue-600">{plan.activeSubscriptions}</p>
                  </div>
                )}

                {/* Limits */}
                <div className="space-y-1 text-sm">
                  {plan.maxUsers && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{plan.maxUsers} usuarios</span>
                    </div>
                  )}
                  {plan.maxProducts && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{plan.maxProducts} productos</span>
                    </div>
                  )}
                  {plan.maxSales && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{plan.maxSales} ventas/mes</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(plan)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(plan.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar Plan' : 'Crear Nuevo Plan'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Modifica los detalles del plan de suscripción'
                : 'Completa los datos para crear un nuevo plan de suscripción'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Nombre del Plan *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Ej: Plan Básico"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción breve del plan"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="price">Precio (CLP) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  min="0"
                />
              </div>

              <div>
                <Label htmlFor="billingCycle">Ciclo de Facturación *</Label>
                <Select
                  value={formData.billingCycle}
                  onValueChange={(value) => setFormData({ ...formData, billingCycle: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Mensual</SelectItem>
                    <SelectItem value="QUARTERLY">Trimestral</SelectItem>
                    <SelectItem value="YEARLY">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="trialDays">Días de Prueba</Label>
                <Input
                  id="trialDays"
                  type="number"
                  value={formData.trialDays}
                  onChange={(e) => setFormData({ ...formData, trialDays: e.target.value })}
                  min="0"
                />
              </div>

              <div>
                <Label htmlFor="sortOrder">Orden de Visualización</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                  min="0"
                />
              </div>

              <div className="col-span-2">
                <Label>Límites del Plan (dejar vacío para ilimitado)</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div>
                    <Label htmlFor="maxUsers" className="text-sm">Usuarios</Label>
                    <Input
                      id="maxUsers"
                      type="number"
                      value={formData.maxUsers}
                      onChange={(e) => setFormData({ ...formData, maxUsers: e.target.value })}
                      placeholder="Ilimitado"
                      min="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxProducts" className="text-sm">Productos</Label>
                    <Input
                      id="maxProducts"
                      type="number"
                      value={formData.maxProducts}
                      onChange={(e) => setFormData({ ...formData, maxProducts: e.target.value })}
                      placeholder="Ilimitado"
                      min="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxSales" className="text-sm">Ventas/mes</Label>
                    <Input
                      id="maxSales"
                      type="number"
                      value={formData.maxSales}
                      onChange={(e) => setFormData({ ...formData, maxSales: e.target.value })}
                      placeholder="Ilimitado"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              <div className="col-span-2">
                <Label htmlFor="features">Características (una por línea)</Label>
                <Textarea
                  id="features"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Sistema POS completo&#10;Control de inventario&#10;Reportes en tiempo real"
                  rows={5}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive" className="cursor-pointer">Plan activo</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isVisible"
                  checked={formData.isVisible}
                  onCheckedChange={(checked) => setFormData({ ...formData, isVisible: checked })}
                />
                <Label htmlFor="isVisible" className="cursor-pointer">Visible en landing</Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isEditing ? 'Actualizar' : 'Crear'} Plan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
