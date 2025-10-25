'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  DollarSign,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// Schema de validación para abrir sesión
const openSessionSchema = z.object({
  initialAmount: z.string().min(1, 'El monto inicial es requerido'),
})

// Schema de validación para cerrar sesión
const closeSessionSchema = z.object({
  finalAmount: z.string().min(1, 'El monto final es requerido'),
})

type OpenSessionFormData = z.infer<typeof openSessionSchema>
type CloseSessionFormData = z.infer<typeof closeSessionSchema>

interface CashSession {
  id: string
  initialAmount: number
  finalAmount: number | null
  expectedAmount: number | null
  difference: number | null
  status: 'OPEN' | 'CLOSED'
  openedAt: string
  closedAt: string | null
  user: {
    id: string
    firstName: string
    lastName: string
  }
  _count: {
    sales: number
  }
  totalSales?: number
  totalCash?: number
}

export default function CashSessionPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [activeSession, setActiveSession] = useState<CashSession | null>(null)
  const [sessions, setSessions] = useState<CashSession[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [isOpenDialogOpen, setIsOpenDialogOpen] = useState(false)
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const openForm = useForm<OpenSessionFormData>({
    resolver: zodResolver(openSessionSchema),
    defaultValues: {
      initialAmount: '0',
    },
  })

  const closeForm = useForm<CloseSessionFormData>({
    resolver: zodResolver(closeSessionSchema),
    defaultValues: {
      finalAmount: '0',
    },
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (status === 'authenticated') {
      loadData()
    }
  }, [status, router])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Cargar sesión activa
      const activeRes = await fetch('/api/cash-sessions/active')
      if (activeRes.ok) {
        const data = await activeRes.json()
        setActiveSession(data)
      } else {
        setActiveSession(null)
      }

      // Cargar historial de sesiones
      const sessionsRes = await fetch('/api/cash-sessions?limit=20')
      if (sessionsRes.ok) {
        const data = await sessionsRes.json()
        setSessions(data)
      }
    } catch (error) {
      console.error('Error al cargar datos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const onOpenSession = async (data: OpenSessionFormData) => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/cash-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initialAmount: parseFloat(data.initialAmount),
        }),
      })

      if (response.ok) {
        toast.success('Sesión de caja abierta correctamente')
        setIsOpenDialogOpen(false)
        openForm.reset()
        loadData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al abrir sesión')
      }
    } catch (error) {
      console.error('Error al abrir sesión:', error)
      toast.error('Error al abrir sesión')
    } finally {
      setIsSaving(false)
    }
  }

  const onCloseSession = async (data: CloseSessionFormData) => {
    if (!activeSession) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/cash-sessions/${activeSession.id}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          finalAmount: parseFloat(data.finalAmount),
        }),
      })

      if (response.ok) {
        toast.success('Sesión de caja cerrada correctamente')
        setIsCloseDialogOpen(false)
        closeForm.reset()
        loadData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al cerrar sesión')
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      toast.error('Error al cerrar sesión')
    } finally {
      setIsSaving(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDateTime = (date: string) => {
    return format(new Date(date), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sesión de Caja</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona la apertura y cierre de caja
          </p>
        </div>
        {!activeSession && (
          <Button onClick={() => setIsOpenDialogOpen(true)}>
            <DollarSign className="mr-2 h-4 w-4" />
            Abrir Sesión
          </Button>
        )}
      </div>

      {/* Sesión Activa */}
      {activeSession ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-600" />
                Sesión Activa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">
                {formatCurrency(activeSession.initialAmount)}
              </div>
              <p className="text-xs text-green-600 mt-1">
                Monto inicial
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Abierta {format(new Date(activeSession.openedAt), 'HH:mm')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Ventas Realizadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeSession._count.sales}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total: {formatCurrency(activeSession.totalSales || 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Monto Esperado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(activeSession.expectedAmount || 0)}
              </div>
              <Button
                onClick={() => setIsCloseDialogOpen(true)}
                variant="destructive"
                className="mt-3 w-full"
              >
                Cerrar Sesión
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertCircle className="h-5 w-5" />
              No hay sesión activa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-orange-700 mb-4">
              Debes abrir una sesión de caja antes de poder realizar ventas.
            </p>
            <Button onClick={() => setIsOpenDialogOpen(true)}>
              Abrir Sesión de Caja
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Historial de Sesiones */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Sesiones</CardTitle>
          <CardDescription>
            Registro de todas las sesiones de caja
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha Apertura</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead className="text-right">Monto Inicial</TableHead>
                  <TableHead className="text-right">Monto Final</TableHead>
                  <TableHead className="text-right">Diferencia</TableHead>
                  <TableHead className="text-center">Ventas</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      <Calendar className="mx-auto h-12 w-12 mb-2 opacity-50" />
                      No hay sesiones registradas
                    </TableCell>
                  </TableRow>
                ) : (
                  sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div className="font-medium">
                          {format(new Date(session.openedAt), 'd MMM yyyy', { locale: es })}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(session.openedAt), 'HH:mm')}
                        </div>
                      </TableCell>
                      <TableCell>
                        {session.user.firstName} {session.user.lastName}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(session.initialAmount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {session.finalAmount !== null
                          ? formatCurrency(session.finalAmount)
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {session.difference !== null ? (
                          <span
                            className={
                              session.difference === 0
                                ? 'text-green-600'
                                : session.difference > 0
                                ? 'text-blue-600'
                                : 'text-red-600'
                            }
                          >
                            {formatCurrency(session.difference)}
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {session._count.sales}
                      </TableCell>
                      <TableCell className="text-center">
                        {session.status === 'OPEN' ? (
                          <Badge variant="outline" className="border-green-500 text-green-500">
                            <Clock className="mr-1 h-3 w-3" />
                            Abierta
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-gray-500 text-gray-500">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Cerrada
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Diálogo para abrir sesión */}
      <Dialog open={isOpenDialogOpen} onOpenChange={setIsOpenDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abrir Sesión de Caja</DialogTitle>
            <DialogDescription>
              Ingresa el monto inicial en caja para comenzar el turno
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={openForm.handleSubmit(onOpenSession)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="initialAmount">Monto Inicial</Label>
              <Input
                id="initialAmount"
                type="number"
                step="1"
                placeholder="0"
                {...openForm.register('initialAmount')}
              />
              {openForm.formState.errors.initialAmount && (
                <p className="text-sm text-red-500">
                  {openForm.formState.errors.initialAmount.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpenDialogOpen(false)}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Abriendo...' : 'Abrir Sesión'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo para cerrar sesión */}
      <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cerrar Sesión de Caja</DialogTitle>
            <DialogDescription>
              Realiza el arqueo de caja ingresando el monto final contado
            </DialogDescription>
          </DialogHeader>

          {activeSession && (
            <div className="rounded-lg border bg-muted p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monto Inicial:</span>
                <span className="font-medium">
                  {formatCurrency(activeSession.initialAmount)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Ventas:</span>
                <span className="font-medium">
                  {formatCurrency(activeSession.totalSales || 0)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t pt-2">
                <span>Monto Esperado:</span>
                <span>{formatCurrency(activeSession.expectedAmount || 0)}</span>
              </div>
            </div>
          )}

          <form onSubmit={closeForm.handleSubmit(onCloseSession)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="finalAmount">Monto Final (Contado)</Label>
              <Input
                id="finalAmount"
                type="number"
                step="1"
                placeholder="0"
                {...closeForm.register('finalAmount')}
              />
              {closeForm.formState.errors.finalAmount && (
                <p className="text-sm text-red-500">
                  {closeForm.formState.errors.finalAmount.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCloseDialogOpen(false)}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="destructive" disabled={isSaving}>
                {isSaving ? 'Cerrando...' : 'Cerrar Sesión'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
