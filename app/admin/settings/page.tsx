'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  CreditCard, 
  Store, 
  Users, 
  Bell,
  Save,
  AlertCircle,
  CheckCircle,
  Trash2,
  Edit,
  Plus,
  X,
  Loader2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('company')

  // Check if user is ADMIN
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
    if (session?.user?.role !== 'ADMIN') {
      toast({
        title: "Acceso Denegado",
        description: "Solo los administradores pueden acceder a la configuración.",
        variant: "destructive",
      })
      router.push('/admin/dashboard')
    }
  }, [session, status, router, toast])

  // Company Profile State
  const [companyData, setCompanyData] = useState({
    businessName: '',
    rut: '',
    email: '',
    phone: '',
    address: '',
  })

  // Subscription State
  const [subscriptionData, setSubscriptionData] = useState<any>(null)

  // POS Configuration State
  const [posConfig, setPosConfig] = useState({
    posEnabled: false,
    receiptHeader: '',
    receiptFooter: '',
    autoOpenDrawer: true,
    printReceipt: true,
  })

  // Users State
  const [users, setUsers] = useState<any[]>([])
  const [showAddUserDialog, setShowAddUserDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'CAJA',
  })

  // Notifications State
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailOnPaymentSuccess: true,
    emailOnPaymentFailure: true,
    emailOnSubscriptionExpiring: true,
    emailOnSubscriptionRenewed: true,
    emailOnLowStock: true,
    emailOnNewSale: false,
    emailOnAccountSuspended: true,
    notificationEmail: '',
  })

  // Change Plan Dialog State
  const [isChangePlanDialogOpen, setIsChangePlanDialogOpen] = useState(false)
  const [availablePlans, setAvailablePlans] = useState<any[]>([])
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)

  // Load data on mount
  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      loadCompanyData()
      loadSubscriptionData()
      loadPosConfig()
      loadUsers()
      loadNotificationPreferences()
    }
  }, [session])

  // API Functions
  const loadCompanyData = async () => {
    try {
      const response = await fetch('/api/settings/company')
      const data = await response.json()
      if (data.success) {
        setCompanyData(data.company)
      }
    } catch (error) {
      console.error('Error loading company data:', error)
    }
  }

  const loadSubscriptionData = async () => {
    try {
      const response = await fetch('/api/settings/subscription')
      const data = await response.json()
      if (data.success) {
        setSubscriptionData(data.subscription)
      }
    } catch (error) {
      console.error('Error loading subscription data:', error)
    }
  }

  const loadPosConfig = async () => {
    try {
      const response = await fetch('/api/settings/pos')
      const data = await response.json()
      if (data.success) {
        setPosConfig(data.config)
      }
    } catch (error) {
      console.error('Error loading POS config:', error)
    }
  }

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/settings/users')
      const data = await response.json()
      if (data.success) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const loadNotificationPreferences = async () => {
    try {
      const response = await fetch('/api/settings/notifications')
      const data = await response.json()
      if (data.success) {
        setNotificationPrefs(data.preferences)
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error)
    }
  }

  const loadAvailablePlans = async () => {
    try {
      const response = await fetch('/api/subscription-plans')
      const data = await response.json()
      if (Array.isArray(data)) {
        setAvailablePlans(data.filter((plan: any) => plan.isActive))
      }
    } catch (error) {
      console.error('Error loading available plans:', error)
      toast({
        title: "Error",
        description: "Error al cargar los planes disponibles.",
        variant: "destructive",
      })
    }
  }

  const saveCompanyData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyData),
      })
      const data = await response.json()
      if (data.success) {
        toast({
          title: "✓ Guardado",
          description: "Información de la empresa actualizada correctamente.",
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al guardar la información.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const savePosConfig = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings/pos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(posConfig),
      })
      const data = await response.json()
      if (data.success) {
        toast({
          title: "✓ Guardado",
          description: "Configuración POS actualizada correctamente.",
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al guardar la configuración.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const saveNotificationPrefs = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationPrefs),
      })
      const data = await response.json()
      if (data.success) {
        toast({
          title: "✓ Guardado",
          description: "Preferencias de notificación actualizadas.",
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al guardar las preferencias.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addUser = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      })
      const data = await response.json()
      if (data.success) {
        toast({
          title: "✓ Usuario Creado",
          description: "Usuario agregado correctamente.",
        })
        setShowAddUserDialog(false)
        setNewUser({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          role: 'CAJA',
        })
        loadUsers()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al crear el usuario.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateUser = async (userId: string, updates: any) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/settings/users`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...updates }),
      })
      const data = await response.json()
      if (data.success) {
        toast({
          title: "✓ Actualizado",
          description: "Usuario actualizado correctamente.",
        })
        loadUsers()
        setEditingUser(null)
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar el usuario.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const deactivateUser = async (userId: string) => {
    if (!confirm('¿Está seguro de desactivar este usuario?')) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/settings/users`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const data = await response.json()
      if (data.success) {
        toast({
          title: "✓ Desactivado",
          description: "Usuario desactivado correctamente.",
        })
        loadUsers()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al desactivar el usuario.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubscriptionAction = async (action: 'upgrade' | 'cancel') => {
    if (action === 'upgrade') {
      // Abrir modal de cambio de plan
      loadAvailablePlans()
      setIsChangePlanDialogOpen(true)
      return
    }

    if (action === 'cancel' && !confirm('¿Está seguro de cancelar su suscripción?')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/settings/subscription/${action}`, {
        method: 'POST',
      })
      const data = await response.json()
      if (data.success) {
        toast({
          title: "✓ Acción Completada",
          description: "Su suscripción ha sido cancelada.",
        })
        loadSubscriptionData()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al procesar la acción.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChangePlan = async (planId: string) => {
    if (!session?.user?.tenantId) return

    setIsProcessingPayment(true)
    setSelectedPlanId(planId)

    try {
      // Crear la transacción de pago con Transbank
      const response = await fetch('/api/payments/transbank/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantId: session.user.tenantId,
          planId: planId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear la transacción de pago')
      }

      const data = await response.json()

      // Redirigir a Transbank
      if (data.url && data.token) {
        // Crear un formulario para enviar el token a Transbank
        const form = document.createElement('form')
        form.method = 'POST'
        form.action = data.url

        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = 'token_ws'
        input.value = data.token

        form.appendChild(input)
        document.body.appendChild(form)
        form.submit()
      } else {
        throw new Error('No se recibió URL de pago de Transbank')
      }
    } catch (error: any) {
      console.error('Error al iniciar pago:', error)
      toast({
        title: "Error",
        description: error.message || "Error al procesar solicitud",
        variant: "destructive",
      })
      setIsProcessingPayment(false)
      setSelectedPlanId(null)
    }
  }

  if (status === 'loading' || session?.user?.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-gray-600 mt-2">
          Gestiona la configuración de tu cuenta y empresa
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Suscripción
          </TabsTrigger>
          <TabsTrigger value="pos" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            POS
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificaciones
          </TabsTrigger>
        </TabsList>

        {/* Company Profile Tab */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Perfil de la Empresa</CardTitle>
              <CardDescription>
                Información básica de tu empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Nombre de la Empresa</Label>
                  <Input
                    id="businessName"
                    value={companyData.businessName}
                    onChange={(e) => setCompanyData({ ...companyData, businessName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rut">RUT</Label>
                  <Input
                    id="rut"
                    value={companyData.rut}
                    onChange={(e) => setCompanyData({ ...companyData, rut: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={companyData.email}
                    onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={companyData.phone}
                    onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Textarea
                  id="address"
                  value={companyData.address}
                  onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={saveCompanyData} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Suscripción</CardTitle>
              <CardDescription>
                Información de tu plan y facturación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {subscriptionData ? (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm text-gray-500">Plan Actual</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xl font-bold">{subscriptionData.plan?.name}</p>
                          <Badge variant={subscriptionData.status === 'ACTIVE' ? 'default' : 'secondary'}>
                            {subscriptionData.status}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">Precio</Label>
                        <p className="text-lg font-semibold">
                          ${Number(subscriptionData.plan?.price).toLocaleString('es-CL')} CLP / 
                          {subscriptionData.billingCycle === 'MONTHLY' ? ' mes' : 
                           subscriptionData.billingCycle === 'QUARTERLY' ? ' trimestre' : ' año'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm text-gray-500">Próxima Facturación</Label>
                        <p className="text-lg font-semibold">
                          {subscriptionData.nextBillingDate 
                            ? new Date(subscriptionData.nextBillingDate).toLocaleDateString('es-CL')
                            : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-500">Renovación Automática</Label>
                        <p className="text-lg font-semibold">
                          {subscriptionData.autoRenew ? '✓ Activada' : '✗ Desactivada'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {subscriptionData.plan?.features && (
                    <div>
                      <Label className="text-sm text-gray-500 mb-2 block">Características del Plan</Label>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <ul className="space-y-2">
                          {JSON.parse(subscriptionData.plan.features).map((feature: string, idx: number) => (
                            <li key={idx} className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4 border-t">
                    <Button variant="outline" onClick={() => handleSubscriptionAction('upgrade')}>
                      Cambiar Plan
                    </Button>
                    {subscriptionData.status === 'ACTIVE' && (
                      <Button 
                        variant="destructive" 
                        onClick={() => handleSubscriptionAction('cancel')}
                        disabled={loading}
                      >
                        Cancelar Suscripción
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No hay información de suscripción disponible</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* POS Configuration Tab */}
        <TabsContent value="pos">
          <Card>
            <CardHeader>
              <CardTitle>Configuración POS</CardTitle>
              <CardDescription>
                Personaliza el comportamiento del punto de venta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="posEnabled">Habilitar Módulo POS</Label>
                  <p className="text-sm text-gray-500">
                    Activa o desactiva el sistema de punto de venta
                  </p>
                </div>
                <Switch
                  id="posEnabled"
                  checked={posConfig.posEnabled}
                  onCheckedChange={(checked) => setPosConfig({ ...posConfig, posEnabled: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="receiptHeader">Encabezado del Recibo</Label>
                <Textarea
                  id="receiptHeader"
                  value={posConfig.receiptHeader}
                  onChange={(e) => setPosConfig({ ...posConfig, receiptHeader: e.target.value })}
                  placeholder="Texto que aparecerá en la parte superior del recibo"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="receiptFooter">Pie de Página del Recibo</Label>
                <Textarea
                  id="receiptFooter"
                  value={posConfig.receiptFooter}
                  onChange={(e) => setPosConfig({ ...posConfig, receiptFooter: e.target.value })}
                  placeholder="Texto que aparecerá en la parte inferior del recibo"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoOpenDrawer">Abrir Cajón Automáticamente</Label>
                  <p className="text-sm text-gray-500">
                    Abre el cajón de efectivo al completar una venta
                  </p>
                </div>
                <Switch
                  id="autoOpenDrawer"
                  checked={posConfig.autoOpenDrawer}
                  onCheckedChange={(checked) => setPosConfig({ ...posConfig, autoOpenDrawer: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="printReceipt">Imprimir Recibo Automáticamente</Label>
                  <p className="text-sm text-gray-500">
                    Imprime el recibo al completar una venta
                  </p>
                </div>
                <Switch
                  id="printReceipt"
                  checked={posConfig.printReceipt}
                  onCheckedChange={(checked) => setPosConfig({ ...posConfig, printReceipt: checked })}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={savePosConfig} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Configuración
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Management Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Gestión de Usuarios</CardTitle>
                  <CardDescription>
                    Administra los usuarios de tu empresa
                  </CardDescription>
                </div>
                <Button onClick={() => setShowAddUserDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Usuario
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? 'default' : 'secondary'}>
                          {user.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {user.isActive && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deactivateUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de Notificación</CardTitle>
              <CardDescription>
                Configura qué notificaciones deseas recibir
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="notificationEmail">Email para Notificaciones</Label>
                <Input
                  id="notificationEmail"
                  type="email"
                  value={notificationPrefs.notificationEmail}
                  onChange={(e) => setNotificationPrefs({ ...notificationPrefs, notificationEmail: e.target.value })}
                  placeholder="email@ejemplo.com"
                />
                <p className="text-sm text-gray-500">
                  Si se deja vacío, se usará el email principal de la empresa
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold">Notificaciones de Pago</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Pago Exitoso</Label>
                    <p className="text-sm text-gray-500">
                      Notificar cuando un pago se procesa correctamente
                    </p>
                  </div>
                  <Switch
                    checked={notificationPrefs.emailOnPaymentSuccess}
                    onCheckedChange={(checked) => 
                      setNotificationPrefs({ ...notificationPrefs, emailOnPaymentSuccess: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Pago Fallido</Label>
                    <p className="text-sm text-gray-500">
                      Notificar cuando un pago falla
                    </p>
                  </div>
                  <Switch
                    checked={notificationPrefs.emailOnPaymentFailure}
                    onCheckedChange={(checked) => 
                      setNotificationPrefs({ ...notificationPrefs, emailOnPaymentFailure: checked })
                    }
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold">Notificaciones de Suscripción</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Suscripción por Vencer</Label>
                    <p className="text-sm text-gray-500">
                      Alertas antes de que expire tu suscripción
                    </p>
                  </div>
                  <Switch
                    checked={notificationPrefs.emailOnSubscriptionExpiring}
                    onCheckedChange={(checked) => 
                      setNotificationPrefs({ ...notificationPrefs, emailOnSubscriptionExpiring: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Suscripción Renovada</Label>
                    <p className="text-sm text-gray-500">
                      Confirmación de renovación de suscripción
                    </p>
                  </div>
                  <Switch
                    checked={notificationPrefs.emailOnSubscriptionRenewed}
                    onCheckedChange={(checked) => 
                      setNotificationPrefs({ ...notificationPrefs, emailOnSubscriptionRenewed: checked })
                    }
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold">Notificaciones Operacionales</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Stock Bajo</Label>
                    <p className="text-sm text-gray-500">
                      Alertas cuando el inventario está bajo
                    </p>
                  </div>
                  <Switch
                    checked={notificationPrefs.emailOnLowStock}
                    onCheckedChange={(checked) => 
                      setNotificationPrefs({ ...notificationPrefs, emailOnLowStock: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Nueva Venta</Label>
                    <p className="text-sm text-gray-500">
                      Notificar cada vez que se realiza una venta
                    </p>
                  </div>
                  <Switch
                    checked={notificationPrefs.emailOnNewSale}
                    onCheckedChange={(checked) => 
                      setNotificationPrefs({ ...notificationPrefs, emailOnNewSale: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Cuenta Suspendida</Label>
                    <p className="text-sm text-gray-500">
                      Alertas importantes sobre el estado de la cuenta
                    </p>
                  </div>
                  <Switch
                    checked={notificationPrefs.emailOnAccountSuspended}
                    onCheckedChange={(checked) => 
                      setNotificationPrefs({ ...notificationPrefs, emailOnAccountSuspended: checked })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={saveNotificationPrefs} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Preferencias
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add User Dialog */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Completa la información del nuevo usuario
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input
                  id="firstName"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input
                  id="lastName"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                  <SelectItem value="CAJA">Cajero</SelectItem>
                  <SelectItem value="INVENTARIO">Inventario</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddUserDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={addUser} disabled={loading}>
              Crear Usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Actualiza la información del usuario
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input
                    value={editingUser.firstName}
                    onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Apellido</Label>
                  <Input
                    value={editingUser.lastName}
                    onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Rol</Label>
                <Select 
                  value={editingUser.role} 
                  onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                    <SelectItem value="CAJA">Cajero</SelectItem>
                    <SelectItem value="INVENTARIO">Inventario</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => updateUser(editingUser.id, {
                firstName: editingUser.firstName,
                lastName: editingUser.lastName,
                role: editingUser.role,
              })} 
              disabled={loading}
            >
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Plan Dialog */}
      <Dialog open={isChangePlanDialogOpen} onOpenChange={setIsChangePlanDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cambiar Plan de Suscripción</DialogTitle>
            <DialogDescription>
              Selecciona un nuevo plan. Se iniciará el proceso de pago con Transbank.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {availablePlans.length === 0 ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Cargando planes disponibles...</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {availablePlans.map((plan) => (
                  <Card 
                    key={plan.id} 
                    className={`hover:shadow-lg transition-shadow ${
                      subscriptionData?.planId === plan.id ? 'border-blue-500 border-2' : ''
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{plan.name}</CardTitle>
                          {plan.description && (
                            <CardDescription className="mt-1">{plan.description}</CardDescription>
                          )}
                        </div>
                        {subscriptionData?.planId === plan.id && (
                          <Badge variant="default">Plan Actual</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Precio */}
                        <div>
                          <p className="text-3xl font-bold text-green-600">
                            ${Number(plan.price).toLocaleString('es-CL')} CLP
                          </p>
                          <p className="text-sm text-gray-600">
                            {plan.billingCycle === 'MONTHLY' && '/ mes'}
                            {plan.billingCycle === 'QUARTERLY' && '/ trimestre'}
                            {plan.billingCycle === 'ANNUAL' && '/ año'}
                          </p>
                        </div>

                        {/* Características */}
                        {plan.features && plan.features.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">Incluye:</p>
                            <ul className="space-y-2">
                              {plan.features.map((feature: string, index: number) => (
                                <li key={index} className="flex items-start gap-2 text-sm">
                                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Límites */}
                        {(plan.maxUsers || plan.maxProducts || plan.maxSales) && (
                          <div className="pt-2 border-t">
                            <p className="text-xs text-gray-600">
                              {plan.maxUsers && `• Hasta ${plan.maxUsers} usuarios`}
                              {plan.maxProducts && ` • ${plan.maxProducts} productos`}
                              {plan.maxSales && ` • ${plan.maxSales === -1 ? 'Ventas ilimitadas' : `${plan.maxSales} ventas/mes`}`}
                            </p>
                          </div>
                        )}

                        {/* Botón de acción */}
                        <Button
                          className="w-full"
                          onClick={() => handleChangePlan(plan.id)}
                          disabled={
                            isProcessingPayment || 
                            subscriptionData?.planId === plan.id
                          }
                        >
                          {isProcessingPayment && selectedPlanId === plan.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Procesando...
                            </>
                          ) : subscriptionData?.planId === plan.id ? (
                            'Plan Actual'
                          ) : (
                            <>
                              <CreditCard className="mr-2 h-4 w-4" />
                              Seleccionar Plan
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsChangePlanDialogOpen(false)}
              disabled={isProcessingPayment}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
