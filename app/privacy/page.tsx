import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ShoppingCart, Shield } from "lucide-react"
import Link from "next/link"

export default function PrivacyPage() {
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
            <div className="flex items-center space-x-3 mb-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <CardTitle className="text-3xl">Política de Privacidad</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Última actualización: 8 de noviembre de 2025
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Introducción</h2>
              <p className="mb-4">
                En CRTLPyme, nos comprometemos a proteger la privacidad y seguridad de sus datos personales. 
                Esta Política de Privacidad explica cómo recopilamos, usamos, almacenamos y protegemos su información 
                cuando utiliza nuestro servicio de gestión empresarial SaaS.
              </p>
              <p className="mb-4">
                Al utilizar CRTLPyme, usted acepta las prácticas descritas en esta política. 
                Si no está de acuerdo, por favor no utilice nuestros servicios.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Información que Recopilamos</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-4">1.1 Información de Registro</h3>
              <p className="mb-4">Cuando crea una cuenta, recopilamos:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Nombre y apellido</li>
                <li>Dirección de correo electrónico</li>
                <li>Número de teléfono</li>
                <li>RUT de la empresa</li>
                <li>Nombre y dirección de la empresa</li>
                <li>Contraseña (encriptada)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4">1.2 Datos de Uso del Sistema</h3>
              <p className="mb-4">Durante el uso del servicio, recopilamos:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Transacciones de ventas y sus detalles</li>
                <li>Información de inventario y productos</li>
                <li>Datos de clientes que registre en el sistema</li>
                <li>Información de empleados/usuarios que agregue</li>
                <li>Reportes y estadísticas generados</li>
                <li>Archivos y documentos que cargue</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4">1.3 Información Técnica</h3>
              <p className="mb-4">Automáticamente recopilamos:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Dirección IP</li>
                <li>Tipo de navegador y versión</li>
                <li>Sistema operativo</li>
                <li>Información del dispositivo</li>
                <li>Cookies y tecnologías similares</li>
                <li>Registros de acceso y uso del sistema</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4">1.4 Información de Pago</h3>
              <p className="mb-4">
                Los datos de pago son procesados por nuestro proveedor de pagos (Transbank). 
                No almacenamos información completa de tarjetas de crédito en nuestros servidores.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Cómo Utilizamos su Información</h2>
              <p className="mb-4">Utilizamos su información para:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Proveer el Servicio:</strong> Operar y mantener su cuenta y funcionalidades del sistema</li>
                <li><strong>Procesamiento de Transacciones:</strong> Gestionar ventas, inventario y reportes</li>
                <li><strong>Facturación:</strong> Procesar pagos de suscripción</li>
                <li><strong>Comunicación:</strong> Enviar notificaciones importantes, actualizaciones y soporte técnico</li>
                <li><strong>Mejoras del Servicio:</strong> Analizar el uso para mejorar funcionalidades</li>
                <li><strong>Seguridad:</strong> Detectar y prevenir fraude, abuso o actividad maliciosa</li>
                <li><strong>Cumplimiento Legal:</strong> Cumplir con obligaciones legales y fiscales en Chile</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Compartir Información</h2>
              <p className="mb-4">
                <strong>No vendemos</strong> sus datos personales a terceros. Podemos compartir información solo en estos casos:
              </p>
              
              <h3 className="text-xl font-semibold mb-3 mt-4">3.1 Proveedores de Servicios</h3>
              <p className="mb-4">Compartimos información con proveedores que nos ayudan a operar el servicio:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Google Cloud Platform:</strong> Hosting y almacenamiento</li>
                <li><strong>Transbank:</strong> Procesamiento de pagos</li>
                <li><strong>Servicios de Email:</strong> Para notificaciones y comunicaciones</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4">3.2 Requerimientos Legales</h3>
              <p className="mb-4">
                Podemos divulgar información si es requerido por ley, orden judicial, o autoridades gubernamentales chilenas.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-4">3.3 Transferencia de Negocio</h3>
              <p className="mb-4">
                En caso de fusión, adquisición o venta de activos, sus datos pueden ser transferidos. 
                Se le notificará de cualquier cambio.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Seguridad de los Datos</h2>
              <p className="mb-4">Implementamos medidas de seguridad robustas:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Encriptación:</strong> Datos sensibles encriptados en tránsito (HTTPS) y en reposo</li>
                <li><strong>Contraseñas:</strong> Almacenadas con hash seguro (bcrypt)</li>
                <li><strong>Acceso Restringido:</strong> Solo personal autorizado tiene acceso a los datos</li>
                <li><strong>Respaldos:</strong> Copias de seguridad regulares para prevenir pérdida de datos</li>
                <li><strong>Monitoreo:</strong> Sistemas de detección de intrusos y amenazas</li>
                <li><strong>Actualizaciones:</strong> Parches de seguridad aplicados regularmente</li>
                <li><strong>Aislamiento:</strong> Datos de cada tenant aislados mediante tenantId</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Sus Derechos</h2>
              <p className="mb-4">Usted tiene derecho a:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Acceso:</strong> Solicitar una copia de sus datos personales</li>
                <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
                <li><strong>Eliminación:</strong> Solicitar la eliminación de sus datos ("derecho al olvido")</li>
                <li><strong>Portabilidad:</strong> Recibir sus datos en formato estructurado</li>
                <li><strong>Oposición:</strong> Oponerse al procesamiento de sus datos</li>
                <li><strong>Restricción:</strong> Limitar cómo usamos sus datos</li>
                <li><strong>Retirar Consentimiento:</strong> Retirar permisos otorgados previamente</li>
              </ul>
              <p className="mb-4">
                Para ejercer estos derechos, contáctenos en: <strong>privacidad@crtlpyme.cl</strong>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Retención de Datos</h2>
              <p className="mb-4">
                Retenemos sus datos mientras:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Su cuenta esté activa</li>
                <li>Sea necesario para proporcionar el servicio</li>
                <li>Cumplir con obligaciones legales o fiscales (según leyes chilenas)</li>
                <li>Resolver disputas y hacer cumplir acuerdos</li>
              </ul>
              <p className="mb-4">
                Después de cancelar su cuenta:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Mantenemos respaldos por 90 días adicionales</li>
                <li>Datos fiscales retenidos según requerimientos del SII (7 años)</li>
                <li>Datos anonimizados pueden mantenerse para análisis estadísticos</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Cookies y Tecnologías de Seguimiento</h2>
              <p className="mb-4">Utilizamos cookies para:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Esenciales:</strong> Mantener su sesión activa</li>
                <li><strong>Funcionales:</strong> Recordar preferencias y configuraciones</li>
                <li><strong>Analíticas:</strong> Entender cómo usa el servicio (pueden deshabilitarse)</li>
              </ul>
              <p className="mb-4">
                Puede controlar cookies desde la configuración de su navegador.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Transferencias Internacionales</h2>
              <p className="mb-4">
                Sus datos pueden ser transferidos y procesados en servidores ubicados en:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Estados Unidos (Google Cloud Platform)</li>
                <li>Otros países donde nuestros proveedores operan</li>
              </ul>
              <p className="mb-4">
                Nos aseguramos de que se mantengan estándares adecuados de protección de datos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Privacidad de Menores</h2>
              <p className="mb-4">
                Nuestro servicio no está dirigido a menores de 18 años. No recopilamos 
                intencionalmente información de menores de edad.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Cambios a esta Política</h2>
              <p className="mb-4">
                Podemos actualizar esta política ocasionalmente. Los cambios significativos se notificarán mediante:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Email a su dirección registrada</li>
                <li>Aviso prominente en el sistema</li>
                <li>Actualización de la fecha "Última actualización"</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Cumplimiento con Leyes Chilenas</h2>
              <p className="mb-4">
                Cumplimos con:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Ley N° 19.628:</strong> Protección de Datos Personales en Chile</li>
                <li><strong>Ley N° 19.496:</strong> Protección de los Derechos de los Consumidores</li>
                <li><strong>Obligaciones del SII:</strong> Servicio de Impuestos Internos</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">12. Contacto</h2>
              <p className="mb-4">
                Para preguntas sobre esta Política de Privacidad o ejercer sus derechos:
              </p>
              <ul className="list-none mb-4 space-y-2">
                <li><strong>Email de Privacidad:</strong> privacidad@crtlpyme.cl</li>
                <li><strong>Soporte General:</strong> soporte@crtlpyme.cl</li>
                <li><strong>Sitio web:</strong> https://crtlpyme-app-399088129827.us-central1.run.app</li>
              </ul>
              <p className="mb-4">
                Responderemos a sus solicitudes dentro de 30 días.
              </p>
            </section>

            <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-3">
                <Shield className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900 mb-2">Compromiso con su Privacidad</p>
                  <p className="text-sm text-gray-700">
                    En CRTLPyme, la protección de sus datos es una prioridad. Implementamos las mejores 
                    prácticas de seguridad y cumplimos con todas las regulaciones aplicables en Chile. 
                    Su confianza es fundamental para nosotros.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700">
                <strong>Nota:</strong> Este es un proyecto de titulación para Ingeniería en Informática. 
                Esta política ha sido diseñada siguiendo estándares profesionales y está sujeta a revisión 
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
