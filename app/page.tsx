
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Package, BarChart3, Users, CreditCard, Smartphone, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">CRTLPyme</h1>
            <Badge variant="secondary">v1.0</Badge>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="outline">Iniciar Sesión</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Empezar Gratis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <Badge className="mb-6" variant="outline">
              🇨🇱 Especializado para PYMEs Chilenas
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Control Total de tu <span className="text-blue-600">Negocio</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Sistema POS-SaaS completo para tiendas de abarrotes, kioscos y pequeños comercios. 
              Con productos chilenos reales, códigos de barras y cálculo automático del punto de equilibrio.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/auth/signup">
                <Button size="lg" className="text-lg px-8">
                  Prueba Gratis 30 Días <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#demo">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Ver Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para tu negocio
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Una solución completa y especializada para el mercado chileno
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <ShoppingCart className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Sistema POS Completo</CardTitle>
                <CardDescription>
                  Punto de venta con escáner de códigos de barras, múltiples medios de pago y arqueo de caja
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Package className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Control de Inventario</CardTitle>
                <CardDescription>
                  Gestión de stock en tiempo real con alertas de reposición y productos chilenos pre-cargados
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Punto de Equilibrio</CardTitle>
                <CardDescription>
                  Cálculo automático del punto de equilibrio basado en gastos fijos y margen promedio
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-orange-600 mb-4" />
                <CardTitle>Multi-Usuario</CardTitle>
                <CardDescription>
                  5 roles diferenciados: Administrador, Cajero, Inventario, Admin SaaS y Soporte
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CreditCard className="h-12 w-12 text-red-600 mb-4" />
                <CardTitle>Integración Transbank</CardTitle>
                <CardDescription>
                  Pagos electrónicos con débito y crédito directamente integrado al sistema
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Smartphone className="h-12 w-12 text-indigo-600 mb-4" />
                <CardTitle>Dashboards Inteligentes</CardTitle>
                <CardDescription>
                  Métricas en tiempo real personalizadas para cada rol y tipo de negocio
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Chilean Market Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-6">
            Diseñado 100% para el Mercado Chileno
          </h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <CheckCircle className="h-16 w-16 mb-4" />
              <h4 className="text-xl font-semibold mb-2">Productos Reales</h4>
              <p className="text-blue-100">
                Base de datos con productos chilenos reales, códigos EAN-13 y precios actualizados
              </p>
            </div>
            <div className="flex flex-col items-center">
              <CheckCircle className="h-16 w-16 mb-4" />
              <h4 className="text-xl font-semibold mb-2">Validación RUT</h4>
              <p className="text-blue-100">
                Sistema completo de validación de RUT chileno integrado
              </p>
            </div>
            <div className="flex flex-col items-center">
              <CheckCircle className="h-16 w-16 mb-4" />
              <h4 className="text-xl font-semibold mb-2">Moneda Local</h4>
              <p className="text-blue-100">
                Precios en pesos chilenos con formateo local y cálculos precisos
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              ¿Listo para modernizar tu negocio?
            </h3>
            <p className="text-xl text-gray-600 mb-8">
              Únete a cientos de pequeños negocios chilenos que ya confían en CRTLPyme
            </p>
            <Link href="/auth/signup">
              <Button size="lg" className="text-lg px-12">
                Comenzar Ahora - Es Gratis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <ShoppingCart className="h-6 w-6" />
                <span className="text-lg font-semibold">CRTLPyme</span>
              </div>
              <p className="text-gray-400">
                Sistema POS-SaaS para PYMEs chilenas
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Características</li>
                <li>Precios</li>
                <li>Demo</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Ayuda</li>
                <li>Documentación</li>
                <li>Contacto</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Acerca de</li>
                <li>Blog</li>
                <li>Tesis</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CRTLPyme. Proyecto de Titulación - Ingeniería en Informática</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
