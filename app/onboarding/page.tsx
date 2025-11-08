"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, ArrowRight, ArrowLeft, Building2, CreditCard, CheckSquare } from "lucide-react";
import Link from "next/link";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: string;
  features: string[];
  isVisible: boolean;
  sortOrder: number;
}

interface OnboardingData {
  // Step 1: Company Information
  businessName: string;
  rut: string;
  email: string;
  phone: string;
  address: string;
  
  // Step 2: Plan Selection
  selectedPlanId: string;
  
  // Step 3: Payment (handled by Transbank)
  paymentCompleted: boolean;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  const [formData, setFormData] = useState<OnboardingData>({
    businessName: "",
    rut: "",
    email: "",
    phone: "",
    address: "",
    selectedPlanId: "",
    paymentCompleted: false,
  });

  // Load available plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch("/api/subscription-plans");
        if (!response.ok) throw new Error("Error al cargar planes");
        
        const data = await response.json();
        if (data.success) {
          // Sort plans by sortOrder
          const sortedPlans = data.data.sort((a: Plan, b: Plan) => a.sortOrder - b.sortOrder);
          setPlans(sortedPlans);
        }
      } catch (err) {
        console.error("Error loading plans:", err);
        setError("Error al cargar los planes disponibles");
      } finally {
        setLoadingPlans(false);
      }
    };

    if (currentStep === 2) {
      fetchPlans();
    }
  }, [currentStep]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const handlePlanSelect = (planId: string) => {
    setFormData({
      ...formData,
      selectedPlanId: planId,
    });
    setError(null);
  };

  const validateStep1 = () => {
    const { businessName, rut, email, phone, address } = formData;
    
    if (!businessName || !rut || !email || !phone || !address) {
      setError("Por favor completa todos los campos");
      return false;
    }

    // Validate RUT format (basic validation)
    const rutRegex = /^[0-9]{7,8}-[0-9Kk]$/;
    if (!rutRegex.test(rut)) {
      setError("Formato de RUT inválido (ejemplo: 12345678-9)");
      return false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Email inválido");
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    if (!formData.selectedPlanId) {
      setError("Por favor selecciona un plan");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError(null);

    if (currentStep === 1) {
      if (!validateStep1()) return;
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!validateStep2()) return;
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep(currentStep - 1);
  };

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // First, create the tenant and user
      const tenantResponse = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessName: formData.businessName,
          rut: formData.rut,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          planId: formData.selectedPlanId,
        }),
      });

      const tenantData = await tenantResponse.json();

      if (!tenantResponse.ok) {
        throw new Error(tenantData.error || tenantData.message || "Error al crear cuenta");
      }

      // Now initiate payment with Transbank
      const paymentResponse = await fetch("/api/subscriptions/payment/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: formData.selectedPlanId,
          tenantId: tenantData.data.tenantId,
          returnUrl: `${window.location.origin}/api/subscriptions/payment/callback`,
        }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok) {
        throw new Error(paymentData.error || paymentData.message || "Error al iniciar pago");
      }

      // Redirect to Transbank payment page
      window.location.href = `${paymentData.data.transbankUrl}?token_ws=${paymentData.data.transbankToken}`;

    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Building2 className="h-5 w-5 mr-2" />
          Información de la Empresa
        </h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="businessName">Nombre de la Empresa *</Label>
          <Input
            id="businessName"
            name="businessName"
            type="text"
            placeholder="Mi Empresa SpA"
            value={formData.businessName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rut">RUT de la Empresa *</Label>
          <Input
            id="rut"
            name="rut"
            type="text"
            placeholder="12345678-9"
            value={formData.rut}
            onChange={handleChange}
            required
          />
          <p className="text-xs text-muted-foreground">Formato: 12345678-9</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email de Contacto *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="contacto@empresa.cl"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono *</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+56912345678"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Dirección *</Label>
          <Input
            id="address"
            name="address"
            type="text"
            placeholder="Av. Providencia 1234, Santiago"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Selecciona tu Plan</h3>
        <p className="text-sm text-muted-foreground">
          Elige el plan que mejor se adapte a las necesidades de tu negocio
        </p>
      </div>

      {loadingPlans ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`cursor-pointer transition-all ${
                formData.selectedPlanId === plan.id
                  ? "border-blue-600 border-2 shadow-lg"
                  : "hover:border-gray-400"
              }`}
              onClick={() => handlePlanSelect(plan.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {plan.name}
                  {formData.selectedPlanId === plan.id && (
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  )}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-3xl font-bold">
                    ${new Intl.NumberFormat("es-CL").format(Number(plan.price))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    /{plan.billingCycle === "MONTHLY" ? "mes" : plan.billingCycle === "QUARTERLY" ? "trimestre" : "año"}
                  </p>
                </div>

                <div className="space-y-2">
                  {plan.features && Array.isArray(plan.features) && plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderStep3 = () => {
    const selectedPlan = plans.find((p) => p.id === formData.selectedPlanId);

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Confirmar y Pagar
          </h3>
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-base">Resumen de tu Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Empresa:</span>
              <span>{formData.businessName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">RUT:</span>
              <span>{formData.rut}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Email:</span>
              <span>{formData.email}</span>
            </div>
            <div className="border-t border-blue-300 pt-3 mt-3">
              <div className="flex justify-between">
                <span className="font-medium">Plan:</span>
                <span>{selectedPlan?.name}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="font-medium">Ciclo de Facturación:</span>
                <span>
                  {selectedPlan?.billingCycle === "MONTHLY"
                    ? "Mensual"
                    : selectedPlan?.billingCycle === "QUARTERLY"
                    ? "Trimestral"
                    : "Anual"}
                </span>
              </div>
              <div className="flex justify-between mt-3 pt-3 border-t border-blue-300">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-lg font-bold">
                  ${new Intl.NumberFormat("es-CL").format(Number(selectedPlan?.price || 0))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Alert>
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-semibold">💳 Pago Seguro con Transbank</p>
              <p className="text-sm">
                Serás redirigido a la plataforma de pago segura de Transbank para completar tu compra.
                Aceptamos todas las tarjetas de débito y crédito.
              </p>
            </div>
          </AlertDescription>
        </Alert>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-sm mb-2">✨ ¿Qué pasa después del pago?</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>✓ Tu cuenta será activada inmediatamente</li>
            <li>✓ Recibirás un email de confirmación</li>
            <li>✓ Podrás acceder a todas las funcionalidades</li>
            <li>✓ Tu primer cargo será en 30 días</li>
          </ul>
        </div>
      </div>
    );
  };

  const renderStep4 = () => (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <CheckCircle className="h-24 w-24 text-green-500" />
      </div>
      <div>
        <h3 className="text-2xl font-bold mb-2">¡Cuenta Activada!</h3>
        <p className="text-muted-foreground">
          Tu cuenta ha sido creada y tu pago ha sido procesado exitosamente.
        </p>
      </div>
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <p className="text-sm mb-4">
            Hemos enviado un email de confirmación con todos los detalles de tu cuenta.
          </p>
          <Link href="/auth/login">
            <Button size="lg" className="w-full">
              Ir al Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl">Configuración de Cuenta</CardTitle>
          <CardDescription>
            Completa el proceso de registro en {currentStep === 4 ? "3" : "3"} simples pasos
          </CardDescription>

          {/* Progress bar */}
          <div className="flex items-center justify-between mt-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-gray-300 text-gray-400"
                  }`}
                >
                  {currentStep > step ? (
                    <CheckSquare className="h-5 w-5" />
                  ) : (
                    step
                  )}
                </div>
                {step < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      currentStep > step ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Información</span>
            <span>Plan</span>
            <span>Pago</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          {currentStep < 4 && (
            <div className="flex justify-between pt-6">
              {currentStep > 1 ? (
                <Button variant="outline" onClick={handleBack} disabled={loading}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Atrás
                </Button>
              ) : (
                <Link href="/">
                  <Button variant="ghost">Cancelar</Button>
                </Link>
              )}

              {currentStep < 3 ? (
                <Button onClick={handleNext}>
                  Siguiente
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handlePayment} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      Pagar con Transbank
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          )}

          {currentStep < 4 && (
            <div className="text-center pt-4">
              <p className="text-xs text-muted-foreground">
                ¿Necesitas ayuda?{" "}
                <a href="mailto:support@crtlpyme.cl" className="text-blue-600 hover:underline">
                  Contáctanos
                </a>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
