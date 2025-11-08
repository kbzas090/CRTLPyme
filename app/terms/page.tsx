import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ShoppingCart } from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <ShoppingCart className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">CRTLPyme</h1>
          </Link>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Inicio
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl mb-2">Términos y Condiciones de Servicio</CardTitle>
            <p className="text-sm text-muted-foreground">
              Última actualización: 8 de noviembre de 2025
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Aceptación de los Términos</h2>
              <p className="mb-4">
                Al acceder y utilizar CRTLPyme ("el Servicio"), usted acepta estar sujeto a estos Términos y Condiciones. 
                Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestro servicio.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Descripción del Servicio</h2>
              <p className="mb-4">
                CRTLPyme es una plataforma SaaS (Software as a Service) que proporciona:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Sistema de Punto de Venta (POS) completo</li>
                <li>Gestión de inventario en tiempo real</li>
                <li>Control de ventas y reportería</li>
                <li>Gestión de usuarios multi-rol</li>
                <li>Cálculo automático de punto de equilibrio</li>
                <li>Integración con sistemas de pago</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Registro y Cuenta de Usuario</h2>
              <p className="mb-4">
                Para utilizar el Servicio, debe:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Proporcionar información precisa y completa durante el registro</li>
                <li>Mantener la seguridad de su cuenta y contraseña</li>
                <li>Notificarnos inmediatamente sobre cualquier uso no autorizado de su cuenta</li>
                <li>Ser responsable de todas las actividades que ocurran bajo su cuenta</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Planes y Pagos</h2>
              <p className="mb-4">
                <strong>4.1 Periodo de Prueba:</strong> Ofrecemos un período de prueba gratuito de 14 días para nuevos usuarios.
              </p>
              <p className="mb-4">
                <strong>4.2 Suscripciones:</strong> Después del período de prueba, debe seleccionar un plan de suscripción para continuar usando el servicio.
              </p>
              <p className="mb-4">
                <strong>4.3 Facturación:</strong> La facturación se realiza según el ciclo seleccionado (mensual, trimestral o anual).
              </p>
              <p className="mb-4">
                <strong>4.4 Cancelación:</strong> Puede cancelar su suscripción en cualquier momento. El acceso continuará hasta el final del período pagado.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Uso Aceptable</h2>
              <p className="mb-4">
                Usted se compromete a NO:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Utilizar el Servicio para fines ilegales o no autorizados</li>
                <li>Intentar obtener acceso no autorizado a otros sistemas o datos</li>
                <li>Interferir con el funcionamiento del Servicio</li>
                <li>Reproducir, duplicar o copiar el Servicio sin autorización</li>
                <li>Realizar ingeniería inversa del software</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Propiedad Intelectual</h2>
              <p className="mb-4">
                El Servicio y todo su contenido, características y funcionalidades son propiedad de CRTLPyme 
                y están protegidos por leyes de propiedad intelectual de Chile e internacionales.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Protección de Datos</h2>
              <p className="mb-4">
                Sus datos están protegidos de acuerdo con nuestra{" "}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  Política de Privacidad
                </Link>
                . Nos comprometemos a:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Mantener la confidencialidad de sus datos comerciales</li>
                <li>Implementar medidas de seguridad adecuadas</li>
                <li>Cumplir con las leyes de protección de datos aplicables en Chile</li>
                <li>No vender ni compartir sus datos con terceros sin consentimiento</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Limitación de Responsabilidad</h2>
              <p className="mb-4">
                CRTLPyme no será responsable por:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Pérdidas de datos debido a fallos técnicos (mantenemos respaldos regulares)</li>
                <li>Interrupciones del servicio por mantenimiento programado</li>
                <li>Daños indirectos o consecuentes derivados del uso del Servicio</li>
                <li>Problemas causados por conexiones a Internet de terceros</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Garantías y Disponibilidad</h2>
              <p className="mb-4">
                Nos esforzamos por mantener el Servicio disponible 24/7, pero no garantizamos que:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>El Servicio esté libre de errores o interrupciones</li>
                <li>Los defectos serán corregidos inmediatamente</li>
                <li>El Servicio cumplirá con todos sus requisitos específicos</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Modificaciones al Servicio</h2>
              <p className="mb-4">
                Nos reservamos el derecho de:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Modificar o descontinuar el Servicio con previo aviso</li>
                <li>Actualizar estos términos ocasionalmente</li>
                <li>Cambiar los precios de los planes con 30 días de anticipación</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Terminación</h2>
              <p className="mb-4">
                Podemos terminar o suspender su acceso inmediatamente, sin previo aviso, por cualquier motivo, 
                incluyendo violación de estos Términos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">12. Ley Aplicable</h2>
              <p className="mb-4">
                Estos términos se regirán e interpretarán de acuerdo con las leyes de Chile. 
                Cualquier disputa se resolverá en los tribunales competentes de Chile.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">13. Contacto</h2>
              <p className="mb-4">
                Para preguntas sobre estos Términos, contáctenos en:
              </p>
              <ul className="list-none mb-4 space-y-2">
                <li><strong>Email:</strong> soporte@crtlpyme.cl</li>
                <li><strong>Sitio web:</strong> https://crtlpyme-app-399088129827.us-central1.run.app</li>
              </ul>
            </section>

            <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-700">
                <strong>Nota Importante:</strong> Este es un proyecto de titulación para Ingeniería en Informática. 
                Los términos están diseñados para un entorno de producción real pero pueden estar sujetos a cambios 
                según evolucione el proyecto.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link href="/">
            <Button size="lg">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Inicio
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 CRTLPyme. Proyecto de Titulación - Ingeniería en Informática</p>
          <div className="mt-4 space-x-4">
            <Link href="/terms" className="text-gray-400 hover:text-white text-sm">
              Términos de Servicio
            </Link>
            <Link href="/privacy" className="text-gray-400 hover:text-white text-sm">
              Política de Privacidad
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
