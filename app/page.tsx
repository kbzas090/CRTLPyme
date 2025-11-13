
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Package, BarChart3, Users, CreditCard, Smartphone, CheckCircle, ArrowRight, Menu } from "lucide-react"
import Link from "next/link"
import PricingPlans from "@/components/landing/PricingPlans"
import { MobileNav } from "@/components/mobile/MobileNav"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 overflow-x-hidden">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 w-full">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Mobile Navigation & Logo */}
          <div className="flex items-center space-x-3 md:space-x-4">
            <MobileNav showAuth={true} />
            <Link href="/" className="flex items-center space-x-2">
              <ShoppingCart className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
              <div className="flex items-center space-x-2">
                <h1 className="text-lg md:text-2xl font-bold text-gray-900">CRTLPyme</h1>
                <Badge variant="secondary" className="hidden sm:inline-flex">v1.0</Badge>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex items-center space-x-6">
              <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Características
              </Link>
              <Link href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                Precios
              </Link>
              <Link href="/demo" className="text-gray-600 hover:text-gray-900 transition-colors">
                Demo
              </Link>
            </nav>
            <div className="flex items-center space-x-3">
              <Link href="/auth/login">
                <Button variant="outline" size="sm">Iniciar Sesión</Button>
              </Link>
              <Link href="/demo">
                <Button size="sm">Prueba Gratis 14 Días</Button>
              </Link>
            </div>
          </div>

          {/* Mobile Auth Buttons */}
          <div className="flex md:hidden items-center space-x-2 max-w-[150px] overflow-hidden">
            <Link href="/auth/login" className="flex-1 min-w-0">
              <Button variant="outline" size="sm" className="w-full text-xs px-2 min-h-[36px] touch-manipulation">
                Login
              </Button>
            </Link>
            <Link href="/demo" className="hidden xs:block flex-1 min-w-0">
              <Button size="sm" className="w-full text-xs px-2 min-h-[36px] touch-manipulation">
                Demo
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-4 sm:mb-6 text-xs sm:text-sm" variant="outline">
              Diseñado 100% para Pymes y pequeñas-medianas empresas
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
              Control Total de tu <span className="text-blue-600">Negocio</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed px-4 sm:px-0">
              Un sistema de ventas ágil y fácil de usar, diseñado para tiendas de abarrotes, kioscos y pequeños comercios. Viene con productos precargados con código de barras y herramientas inteligentes que calculan automáticamente tu punto de equilibrio.
            </p>
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-center sm:space-y-0 sm:space-x-4 px-4 sm:px-0">
              <Link href="/demo" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 min-h-[48px] touch-manipulation"
                >
                  Prueba Gratis 14 Días <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <Link href="/onboarding" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 min-h-[48px] touch-manipulation"
                >
                  Contratar Ahora
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-16">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              Todo lo que necesitas para tu negocio
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base px-4 sm:px-0">
              Una solución completa y especializada para pequeñas y medianas empresas
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
              <CardHeader className="text-center sm:text-left pb-4">
                <ShoppingCart className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 mb-3 sm:mb-4 mx-auto sm:mx-0" />
                <CardTitle className="text-lg sm:text-xl">Sistema POS Completo</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Punto de venta con escáner de códigos de barras, múltiples medios de pago y arqueo de caja
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
              <CardHeader className="text-center sm:text-left pb-4">
                <Package className="h-10 w-10 sm:h-12 sm:w-12 text-green-600 mb-3 sm:mb-4 mx-auto sm:mx-0" />
                <CardTitle className="text-lg sm:text-xl">Control de Inventario</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Gestión de stock en tiempo real con alertas de reposición y productos pre-cargados
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
              <CardHeader className="text-center sm:text-left pb-4">
                <BarChart3 className="h-10 w-10 sm:h-12 sm:w-12 text-purple-600 mb-3 sm:mb-4 mx-auto sm:mx-0" />
                <CardTitle className="text-lg sm:text-xl">Punto de Equilibrio</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Cálculo automático del punto de equilibrio basado en gastos fijos y margen promedio
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
              <CardHeader className="text-center sm:text-left pb-4">
                <Users className="h-10 w-10 sm:h-12 sm:w-12 text-orange-600 mb-3 sm:mb-4 mx-auto sm:mx-0" />
                <CardTitle className="text-lg sm:text-xl">Multi-Usuario</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  5 roles diferenciados: Administrador, Cajero, Inventario, Admin SaaS y Soporte
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
              <CardHeader className="text-center sm:text-left pb-4">
                <CreditCard className="h-10 w-10 sm:h-12 sm:w-12 text-red-600 mb-3 sm:mb-4 mx-auto sm:mx-0" />
                <CardTitle className="text-lg sm:text-xl">Pago por suscripción</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Accede a distintos tipos de planes para el control de tu negocio
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
              <CardHeader className="text-center sm:text-left pb-4">
                <Smartphone className="h-10 w-10 sm:h-12 sm:w-12 text-indigo-600 mb-3 sm:mb-4 mx-auto sm:mx-0" />
                <CardTitle className="text-lg sm:text-xl">Dashboards Inteligentes</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Métricas en tiempo real personalizadas para cada rol y tipo de negocio
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* SME Market Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-6">
            Diseñado 100% para Pymes y pequeñas-medianas empresas
          </h3>
          <div className="grid md:grid-cols-1 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <CheckCircle className="h-16 w-16 mb-4" />
              <h4 className="text-xl font-semibold mb-2">Productos Reales</h4>
              <p className="text-blue-100">
                Base de datos con productos reales, códigos EAN-13 y precios actualizados
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 sm:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-16">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              Planes diseñados para tu negocio
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base px-4 sm:px-0">
              Elige el plan que mejor se adapte a las necesidades de tu empresa
            </p>
          </div>
          <PricingPlans />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
              ¿Listo para modernizar tu negocio?
            </h3>
            <p className="text-base sm:text-xl text-gray-600 mb-6 sm:mb-8 px-4 sm:px-0">
              Únete a cientos de pequeños negocios que ya confían en CRTLPyme
            </p>
            <Link href="/auth/register" className="inline-block w-full sm:w-auto">
              <Button 
                size="lg" 
                className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-12 py-3 sm:py-4 min-h-[48px] touch-manipulation"
              >
                Comenzar Ahora - Es Gratis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start space-x-2 mb-3 sm:mb-4">
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-base sm:text-lg font-semibold">CRTLPyme</span>
              </div>
              <p className="text-gray-400 text-sm sm:text-base">
                Sistema POS-SaaS para PYMEs
              </p>
            </div>
            <div className="text-center sm:text-left">
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Producto</h4>
              <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
                <li><Link href="#features" className="hover:text-gray-300 transition-colors">Características</Link></li>
                <li><Link href="#pricing" className="hover:text-gray-300 transition-colors">Precios</Link></li>
                <li><Link href="/demo" className="hover:text-gray-300 transition-colors">Demo</Link></li>
              </ul>
            </div>
            <div className="text-center sm:text-left">
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Soporte</h4>
              <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
                <li><span className="cursor-default">Ayuda</span></li>
                <li><span className="cursor-default">Documentación</span></li>
                <li><span className="cursor-default">Contacto</span></li>
              </ul>
            </div>
            <div className="text-center sm:text-left">
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
                <li><span className="cursor-default">Acerca de</span></li>
                <li><span className="cursor-default">Blog</span></li>
                <li><span className="cursor-default">Tesis</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400">
            <p className="text-xs sm:text-sm">&copy; 2025 CRTLPyme. Proyecto de Titulación - Ingeniería en Informática</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
