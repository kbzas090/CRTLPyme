'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { BackButton } from '@/components/layout'
import { toast } from '@/components/ui/use-toast'
import { Settings, Mail, Bell, Shield, User } from 'lucide-react'

export default function SettingsPage() {
  const [emailSettings, setEmailSettings] = useState({
    welcomeEmails: true,
    saleConfirmations: false,
    lowStockAlerts: true,
    weeklyReports: true,
    notificationEmail: ''
  })

  const handleToggle = (key: keyof typeof emailSettings) => {
    setEmailSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleSave = () => {
    // Aquí iría la lógica para guardar las configuraciones
    toast({
      title: 'Configuración guardada',
      description: 'Tus preferencias han sido actualizadas correctamente.'
    })
  }

  return (
    <div className="p-8 space-y-6">
      <BackButton href="/admin/dashboard" />
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Configuración
        </h1>
        <p className="text-muted-foreground mt-2">
          Gestiona las preferencias de tu cuenta y notificaciones
        </p>
      </div>

      {/* Configuración de Emails */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Configuración de Emails
          </CardTitle>
          <CardDescription>
            Personaliza qué notificaciones deseas recibir por correo electrónico
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="welcome-emails">Emails de Bienvenida</Label>
                <p className="text-sm text-muted-foreground">
                  Enviar email de bienvenida a nuevos usuarios
                </p>
              </div>
              <Switch
                id="welcome-emails"
                checked={emailSettings.welcomeEmails}
                onCheckedChange={() => handleToggle('welcomeEmails')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sale-confirmations">Confirmaciones de Venta</Label>
                <p className="text-sm text-muted-foreground">
                  Enviar confirmación por email al completar una venta
                </p>
              </div>
              <Switch
                id="sale-confirmations"
                checked={emailSettings.saleConfirmations}
                onCheckedChange={() => handleToggle('saleConfirmations')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="low-stock-alerts">Alertas de Stock Bajo</Label>
                <p className="text-sm text-muted-foreground">
                  Recibir notificaciones cuando el stock esté por debajo del mínimo
                </p>
              </div>
              <Switch
                id="low-stock-alerts"
                checked={emailSettings.lowStockAlerts}
                onCheckedChange={() => handleToggle('lowStockAlerts')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weekly-reports">Reportes Semanales</Label>
                <p className="text-sm text-muted-foreground">
                  Recibir resumen semanal de ventas y métricas
                </p>
              </div>
              <Switch
                id="weekly-reports"
                checked={emailSettings.weeklyReports}
                onCheckedChange={() => handleToggle('weeklyReports')}
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="notification-email">Email para Notificaciones</Label>
              <Input
                id="notification-email"
                type="email"
                placeholder="admin@tuempresa.com"
                value={emailSettings.notificationEmail}
                onChange={(e) => setEmailSettings(prev => ({
                  ...prev,
                  notificationEmail: e.target.value
                }))}
              />
              <p className="text-sm text-muted-foreground">
                Si lo dejas vacío, usaremos tu email de cuenta
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuración de Notificaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones
          </CardTitle>
          <CardDescription>
            Gestiona las notificaciones en la aplicación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Próximamente disponible...
          </p>
        </CardContent>
      </Card>

      {/* Seguridad */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Seguridad
          </CardTitle>
          <CardDescription>
            Administra la seguridad de tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Próximamente disponible...
          </p>
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <div className="flex justify-end gap-4">
        <Button variant="outline">Cancelar</Button>
        <Button onClick={handleSave}>Guardar Cambios</Button>
      </div>
    </div>
  )
}
