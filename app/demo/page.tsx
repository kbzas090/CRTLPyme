
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default function DemoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    businessName: "",
    firstName: "",
    lastName: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/demo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Error al crear cuenta demo");
      }

      setSuccess(true);
      setCredentials({
        email: data.data.email,
        password: data.data.tempPassword,
      });

      // Redirect to login after 5 seconds
      setTimeout(() => {
        router.push("/auth/login");
      }, 5000);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  if (success && credentials) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-center">¡Cuenta Demo Creada!</CardTitle>
            <CardDescription className="text-center">
              Tu cuenta demo ha sido creada exitosamente. Tienes 14 días de prueba gratis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">Tus credenciales de acceso:</p>
                  <div className="bg-gray-50 p-4 rounded-md space-y-2">
                    <p><strong>Email:</strong> {credentials.email}</p>
                    <p><strong>Contraseña temporal:</strong> {credentials.password}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    ⚠️ Guarda esta información. También hemos enviado un email de bienvenida.
                  </p>
                </div>
              </AlertDescription>
            </Alert>

            <div className="flex flex-col space-y-2">
              <Link href="/auth/login">
                <Button className="w-full" size="lg">
                  Iniciar Sesión Ahora
                </Button>
              </Link>
              <Link href="/onboarding">
                <Button variant="outline" className="w-full" size="lg">
                  Completar Configuración
                </Button>
              </Link>
            </div>

            <p className="text-sm text-center text-muted-foreground">
              Serás redirigido automáticamente en 5 segundos...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Prueba Gratis 14 Días</CardTitle>
          <CardDescription>
            Crea tu cuenta demo y explora todas las funcionalidades de CRTLPyme sin compromiso.
            No se requiere tarjeta de crédito.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="Juan"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Pérez"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessName">Nombre de la Empresa *</Label>
              <Input
                id="businessName"
                name="businessName"
                type="text"
                placeholder="Mi Negocio SpA"
                value={formData.businessName}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="juan@ejemplo.cl"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono (Opcional)</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+56912345678"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-sm">✨ Incluido en tu cuenta demo:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>✓ 14 días de prueba gratis</li>
                <li>✓ Acceso completo a todas las funcionalidades</li>
                <li>✓ Productos precargados con códigos de barras</li>
                <li>✓ Reportes y análisis en tiempo real</li>
                <li>✓ Soporte técnico por email</li>
              </ul>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando cuenta demo...
                </>
              ) : (
                "Crear Cuenta Demo Gratis"
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Al crear una cuenta, aceptas nuestros{" "}
              <Link href="/terms" className="underline">
                Términos de Servicio
              </Link>{" "}
              y{" "}
              <Link href="/privacy" className="underline">
                Política de Privacidad
              </Link>
            </p>

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
                  Inicia Sesión
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

