import { PrismaClient, MovementType, PaymentMethod, SaleStatus } from '@prisma/client'

const prisma = new PrismaClient()

// Definición de tipos de negocio y sus productos
const BUSINESS_CATALOG = {
  minimarket: {
    name: 'Minimarket',
    products: [
      { name: 'Coca Cola 500ml', category: 'Bebidas', brand: 'Coca Cola', costPrice: 600, salePrice: 900, stock: 50 },
      { name: 'Pan de molde', category: 'Panadería', brand: 'Ideal', costPrice: 800, salePrice: 1200, stock: 30 },
      { name: 'Leche 1L', category: 'Lácteos', brand: 'Colun', costPrice: 700, salePrice: 1100, stock: 40 },
      { name: 'Arroz 1kg', category: 'Abarrotes', brand: 'Tucapel', costPrice: 900, salePrice: 1400, stock: 25 },
      { name: 'Aceite 1L', category: 'Abarrotes', brand: 'Chef', costPrice: 1500, salePrice: 2300, stock: 20 },
      { name: 'Huevos docena', category: 'Lácteos', brand: 'Los Colonos', costPrice: 2000, salePrice: 2800, stock: 35 },
      { name: 'Jabón en barra', category: 'Aseo', brand: 'Noble', costPrice: 500, salePrice: 800, stock: 45 },
      { name: 'Papel higiénico 4 rollos', category: 'Aseo', brand: 'Elite', costPrice: 1200, salePrice: 1800, stock: 40 },
      { name: 'Fideos 400g', category: 'Abarrotes', brand: 'Carozzi', costPrice: 600, salePrice: 1000, stock: 50 },
      { name: 'Café instantáneo 170g', category: 'Bebidas', brand: 'Nescafé', costPrice: 3500, salePrice: 4800, stock: 15 },
      { name: 'Azúcar 1kg', category: 'Abarrotes', brand: 'Iansa', costPrice: 800, salePrice: 1300, stock: 30 },
      { name: 'Sal 1kg', category: 'Abarrotes', brand: 'Lobos', costPrice: 300, salePrice: 600, stock: 25 },
      { name: 'Mantequilla 250g', category: 'Lácteos', brand: 'Soprole', costPrice: 1800, salePrice: 2500, stock: 20 },
      { name: 'Galletas surtidas', category: 'Snacks', brand: 'McKay', costPrice: 800, salePrice: 1300, stock: 40 },
      { name: 'Jugo en polvo', category: 'Bebidas', brand: 'Zuko', costPrice: 400, salePrice: 700, stock: 50 },
      { name: 'Atún en lata', category: 'Conservas', brand: 'San José', costPrice: 1200, salePrice: 1800, stock: 35 },
      { name: 'Mayonesa 500g', category: 'Salsas', brand: 'Hellmanns', costPrice: 1600, salePrice: 2400, stock: 20 },
      { name: 'Ketchup 400g', category: 'Salsas', brand: 'Maggi', costPrice: 1200, salePrice: 1900, stock: 25 },
      { name: 'Cerveza lata', category: 'Bebidas', brand: 'Cristal', costPrice: 700, salePrice: 1100, stock: 60 },
      { name: 'Pañales pack 30', category: 'Bebé', brand: 'Huggies', costPrice: 8000, salePrice: 11000, stock: 15 },
    ]
  },
  ferreteria: {
    name: 'Ferretería',
    products: [
      { name: 'Martillo', category: 'Herramientas', brand: 'Truper', costPrice: 5000, salePrice: 7500, stock: 15 },
      { name: 'Destornillador plano', category: 'Herramientas', brand: 'Stanley', costPrice: 3000, salePrice: 4500, stock: 20 },
      { name: 'Destornillador Phillips', category: 'Herramientas', brand: 'Stanley', costPrice: 3000, salePrice: 4500, stock: 20 },
      { name: 'Alicate', category: 'Herramientas', brand: 'Tramontina', costPrice: 4000, salePrice: 6000, stock: 12 },
      { name: 'Llave inglesa', category: 'Herramientas', brand: 'Bahco', costPrice: 8000, salePrice: 12000, stock: 10 },
      { name: 'Cinta métrica 5m', category: 'Medición', brand: 'Stanley', costPrice: 3500, salePrice: 5500, stock: 18 },
      { name: 'Taladro eléctrico', category: 'Herramientas eléctricas', brand: 'Bosch', costPrice: 35000, salePrice: 48000, stock: 5 },
      { name: 'Juego de brocas', category: 'Accesorios', brand: 'Dewalt', costPrice: 8000, salePrice: 12000, stock: 15 },
      { name: 'Tornillos pack 100', category: 'Ferretería', brand: 'Genérico', costPrice: 1500, salePrice: 2500, stock: 40 },
      { name: 'Clavos pack 500g', category: 'Ferretería', brand: 'Genérico', costPrice: 2000, salePrice: 3200, stock: 30 },
      { name: 'Candado mediano', category: 'Seguridad', brand: 'Yale', costPrice: 4000, salePrice: 6500, stock: 20 },
      { name: 'Cadena 2m', category: 'Seguridad', brand: 'Genérico', costPrice: 5000, salePrice: 7500, stock: 12 },
      { name: 'Pintura blanca 1L', category: 'Pinturas', brand: 'Ceresita', costPrice: 8000, salePrice: 12000, stock: 15 },
      { name: 'Brocha 2 pulgadas', category: 'Pinturas', brand: 'Condor', costPrice: 2000, salePrice: 3500, stock: 25 },
      { name: 'Rodillo para pintar', category: 'Pinturas', brand: 'Condor', costPrice: 2500, salePrice: 4000, stock: 20 },
      { name: 'Lija pack 5', category: 'Abrasivos', brand: '3M', costPrice: 1500, salePrice: 2500, stock: 35 },
      { name: 'Sierra para madera', category: 'Herramientas', brand: 'Stanley', costPrice: 6000, salePrice: 9000, stock: 10 },
      { name: 'Pegamento universal', category: 'Adhesivos', brand: 'Agorex', costPrice: 2500, salePrice: 4000, stock: 25 },
      { name: 'Cinta aislante', category: 'Eléctricos', brand: '3M', costPrice: 1000, salePrice: 1800, stock: 40 },
      { name: 'Cable eléctrico 10m', category: 'Eléctricos', brand: 'Indeco', costPrice: 5000, salePrice: 8000, stock: 20 },
    ]
  },
  restaurante: {
    name: 'Restaurante',
    products: [
      { name: 'Completo italiano', category: 'Comida', brand: 'Casa', costPrice: 1200, salePrice: 2500, stock: 0 },
      { name: 'Hamburguesa clásica', category: 'Comida', brand: 'Casa', costPrice: 1500, salePrice: 3500, stock: 0 },
      { name: 'Papas fritas', category: 'Acompañamientos', brand: 'Casa', costPrice: 500, salePrice: 1500, stock: 0 },
      { name: 'Ensalada mixta', category: 'Acompañamientos', brand: 'Casa', costPrice: 800, salePrice: 2000, stock: 0 },
      { name: 'Coca Cola 350ml', category: 'Bebidas', brand: 'Coca Cola', costPrice: 500, salePrice: 1200, stock: 100 },
      { name: 'Fanta 350ml', category: 'Bebidas', brand: 'Coca Cola', costPrice: 500, salePrice: 1200, stock: 80 },
      { name: 'Sprite 350ml', category: 'Bebidas', brand: 'Coca Cola', costPrice: 500, salePrice: 1200, stock: 80 },
      { name: 'Agua mineral', category: 'Bebidas', brand: 'Cachantun', costPrice: 400, salePrice: 1000, stock: 120 },
      { name: 'Café expreso', category: 'Bebidas calientes', brand: 'Casa', costPrice: 300, salePrice: 1000, stock: 0 },
      { name: 'Café cortado', category: 'Bebidas calientes', brand: 'Casa', costPrice: 400, salePrice: 1200, stock: 0 },
      { name: 'Pizza mediana', category: 'Comida', brand: 'Casa', costPrice: 2500, salePrice: 6000, stock: 0 },
      { name: 'Empanada de pino', category: 'Comida', brand: 'Casa', costPrice: 600, salePrice: 1500, stock: 0 },
      { name: 'Empanada de queso', category: 'Comida', brand: 'Casa', costPrice: 500, salePrice: 1400, stock: 0 },
      { name: 'Sándwich ave-palta', category: 'Comida', brand: 'Casa', costPrice: 1800, salePrice: 4000, stock: 0 },
      { name: 'Jugo natural naranja', category: 'Bebidas', brand: 'Casa', costPrice: 600, salePrice: 1800, stock: 0 },
      { name: 'Helado artesanal', category: 'Postres', brand: 'Casa', costPrice: 800, salePrice: 2500, stock: 0 },
      { name: 'Brownie', category: 'Postres', brand: 'Casa', costPrice: 700, salePrice: 2000, stock: 0 },
      { name: 'Cerveza artesanal', category: 'Bebidas', brand: 'Kross', costPrice: 1500, salePrice: 3500, stock: 40 },
      { name: 'Vino copa', category: 'Bebidas', brand: 'Casillero del Diablo', costPrice: 1200, salePrice: 3000, stock: 30 },
      { name: 'Menu del día', category: 'Comida', brand: 'Casa', costPrice: 2000, salePrice: 4500, stock: 0 },
    ]
  },
  farmacia: {
    name: 'Farmacia',
    products: [
      { name: 'Paracetamol 500mg', category: 'Analgésicos', brand: 'Genérico', costPrice: 1500, salePrice: 2500, stock: 100 },
      { name: 'Ibuprofeno 400mg', category: 'Analgésicos', brand: 'Genérico', costPrice: 2000, salePrice: 3500, stock: 80 },
      { name: 'Aspirina 100mg', category: 'Analgésicos', brand: 'Bayer', costPrice: 2500, salePrice: 4000, stock: 60 },
      { name: 'Amoxicilina 500mg', category: 'Antibióticos', brand: 'Genérico', costPrice: 3500, salePrice: 6000, stock: 50 },
      { name: 'Loratadina 10mg', category: 'Antialérgicos', brand: 'Genérico', costPrice: 2000, salePrice: 3500, stock: 70 },
      { name: 'Omeprazol 20mg', category: 'Gastrointestinales', brand: 'Genérico', costPrice: 2500, salePrice: 4500, stock: 60 },
      { name: 'Vitamina C 1000mg', category: 'Vitaminas', brand: 'Redoxon', costPrice: 4000, salePrice: 6500, stock: 40 },
      { name: 'Complejo B', category: 'Vitaminas', brand: 'Genérico', costPrice: 3000, salePrice: 5000, stock: 35 },
      { name: 'Alcohol gel 250ml', category: 'Higiene', brand: 'Genérico', costPrice: 1500, salePrice: 2500, stock: 80 },
      { name: 'Mascarillas pack 50', category: 'Protección', brand: 'Genérico', costPrice: 5000, salePrice: 8000, stock: 30 },
      { name: 'Termómetro digital', category: 'Instrumentos', brand: 'Omron', costPrice: 8000, salePrice: 12000, stock: 15 },
      { name: 'Tensiómetro digital', category: 'Instrumentos', brand: 'Omron', costPrice: 20000, salePrice: 28000, stock: 10 },
      { name: 'Jarabe tos seca', category: 'Respiratorios', brand: 'Bisolvon', costPrice: 4500, salePrice: 7000, stock: 25 },
      { name: 'Crema hidratante', category: 'Dermatología', brand: 'Nivea', costPrice: 3500, salePrice: 5500, stock: 40 },
      { name: 'Protector solar SPF50', category: 'Dermatología', brand: 'Eucerin', costPrice: 8000, salePrice: 12000, stock: 30 },
      { name: 'Shampoo anticaspa', category: 'Cuidado capilar', brand: 'Head & Shoulders', costPrice: 4000, salePrice: 6500, stock: 35 },
      { name: 'Pasta dental', category: 'Higiene bucal', brand: 'Colgate', costPrice: 1500, salePrice: 2500, stock: 60 },
      { name: 'Enjuague bucal', category: 'Higiene bucal', brand: 'Listerine', costPrice: 3000, salePrice: 5000, stock: 40 },
      { name: 'Gotas para ojos', category: 'Oftalmología', brand: 'Systane', costPrice: 5000, salePrice: 8000, stock: 25 },
      { name: 'Test de embarazo', category: 'Diagnóstico', brand: 'Clearblue', costPrice: 4000, salePrice: 6500, stock: 20 },
    ]
  },
  libreria: {
    name: 'Librería',
    products: [
      { name: 'Cuaderno universitario', category: 'Cuadernos', brand: 'Torre', costPrice: 1200, salePrice: 2000, stock: 50 },
      { name: 'Lápiz grafito HB', category: 'Escritura', brand: 'Faber Castell', costPrice: 300, salePrice: 600, stock: 100 },
      { name: 'Bolígrafo azul', category: 'Escritura', brand: 'Bic', costPrice: 250, salePrice: 500, stock: 120 },
      { name: 'Goma de borrar', category: 'Corrección', brand: 'Pelikan', costPrice: 200, salePrice: 400, stock: 80 },
      { name: 'Sacapuntas metálico', category: 'Accesorios', brand: 'Maped', costPrice: 400, salePrice: 800, stock: 60 },
      { name: 'Regla 30cm', category: 'Medición', brand: 'Artesco', costPrice: 500, salePrice: 900, stock: 40 },
      { name: 'Tijeras escolares', category: 'Corte', brand: 'Maped', costPrice: 1500, salePrice: 2500, stock: 35 },
      { name: 'Pegamento en barra', category: 'Adhesivos', brand: 'UHU', costPrice: 800, salePrice: 1400, stock: 50 },
      { name: 'Lápices de colores x12', category: 'Arte', brand: 'Faber Castell', costPrice: 2500, salePrice: 4000, stock: 30 },
      { name: 'Temperas x6', category: 'Arte', brand: 'Giotto', costPrice: 3000, salePrice: 5000, stock: 25 },
      { name: 'Pinceles set x3', category: 'Arte', brand: 'Artesco', costPrice: 2000, salePrice: 3500, stock: 20 },
      { name: 'Cartulina española', category: 'Papelería', brand: 'Torre', costPrice: 300, salePrice: 600, stock: 100 },
      { name: 'Papel lustre x10', category: 'Papelería', brand: 'Torre', costPrice: 800, salePrice: 1400, stock: 60 },
      { name: 'Block dibujo', category: 'Papelería', brand: 'Rivadavia', costPrice: 1800, salePrice: 3000, stock: 40 },
      { name: 'Carpeta 3 anillos', category: 'Archivo', brand: 'Rhein', costPrice: 2500, salePrice: 4000, stock: 30 },
      { name: 'Archivador', category: 'Archivo', brand: 'Rhein', costPrice: 3000, salePrice: 5000, stock: 25 },
      { name: 'Destacador amarillo', category: 'Escritura', brand: 'Stabilo', costPrice: 800, salePrice: 1400, stock: 50 },
      { name: 'Corrector líquido', category: 'Corrección', brand: 'Liquid Paper', costPrice: 1200, salePrice: 2000, stock: 40 },
      { name: 'Calculadora científica', category: 'Electrónica', brand: 'Casio', costPrice: 12000, salePrice: 18000, stock: 15 },
      { name: 'Mochila escolar', category: 'Accesorios', brand: 'Totto', costPrice: 15000, salePrice: 25000, stock: 20 },
    ]
  },
  panaderia: {
    name: 'Panadería',
    products: [
      { name: 'Pan amasado', category: 'Panadería', brand: 'Casa', costPrice: 200, salePrice: 500, stock: 0 },
      { name: 'Hallulla', category: 'Panadería', brand: 'Casa', costPrice: 150, salePrice: 400, stock: 0 },
      { name: 'Marraqueta', category: 'Panadería', brand: 'Casa', costPrice: 150, salePrice: 350, stock: 0 },
      { name: 'Coliza', category: 'Panadería', brand: 'Casa', costPrice: 200, salePrice: 500, stock: 0 },
      { name: 'Dobladita', category: 'Panadería', brand: 'Casa', costPrice: 250, salePrice: 600, stock: 0 },
      { name: 'Empanada de pino', category: 'Salados', brand: 'Casa', costPrice: 800, salePrice: 1800, stock: 0 },
      { name: 'Empanada de queso', category: 'Salados', brand: 'Casa', costPrice: 700, salePrice: 1600, stock: 0 },
      { name: 'Sopaipilla', category: 'Salados', brand: 'Casa', costPrice: 100, salePrice: 300, stock: 0 },
      { name: 'Torta de mil hojas', category: 'Pasteles', brand: 'Casa', costPrice: 3000, salePrice: 7000, stock: 0 },
      { name: 'Torta selva negra', category: 'Pasteles', brand: 'Casa', costPrice: 3500, salePrice: 8000, stock: 0 },
      { name: 'Kuchen de manzana', category: 'Pasteles', brand: 'Casa', costPrice: 2500, salePrice: 6000, stock: 0 },
      { name: 'Brazo de reina', category: 'Pasteles', brand: 'Casa', costPrice: 2000, salePrice: 5000, stock: 0 },
      { name: 'Berlín', category: 'Dulces', brand: 'Casa', costPrice: 300, salePrice: 800, stock: 0 },
      { name: 'Caluga', category: 'Dulces', brand: 'Casa', costPrice: 250, salePrice: 700, stock: 0 },
      { name: 'Churros', category: 'Dulces', brand: 'Casa', costPrice: 200, salePrice: 600, stock: 0 },
      { name: 'Alfajor', category: 'Dulces', brand: 'Casa', costPrice: 400, salePrice: 1000, stock: 0 },
      { name: 'Pan de pascua', category: 'Especiales', brand: 'Casa', costPrice: 4000, salePrice: 9000, stock: 0 },
      { name: 'Galletas surtidas kg', category: 'Galletas', brand: 'Casa', costPrice: 3000, salePrice: 6500, stock: 0 },
      { name: 'Queque casero', category: 'Pasteles', brand: 'Casa', costPrice: 2000, salePrice: 5000, stock: 0 },
      { name: 'Café', category: 'Bebidas', brand: 'Casa', costPrice: 200, salePrice: 800, stock: 0 },
    ]
  },
  veterinaria: {
    name: 'Veterinaria',
    products: [
      { name: 'Alimento perro adulto 15kg', category: 'Alimentos', brand: 'Champion Dog', costPrice: 18000, salePrice: 25000, stock: 20 },
      { name: 'Alimento gato adulto 10kg', category: 'Alimentos', brand: 'Whiskas', costPrice: 15000, salePrice: 22000, stock: 15 },
      { name: 'Snacks perro', category: 'Premios', brand: 'Pedigree', costPrice: 2000, salePrice: 3500, stock: 40 },
      { name: 'Arena sanitaria gatos 10kg', category: 'Higiene', brand: 'Catsan', costPrice: 5000, salePrice: 8000, stock: 25 },
      { name: 'Shampoo antipulgas', category: 'Higiene', brand: 'Nextgard', costPrice: 4000, salePrice: 6500, stock: 30 },
      { name: 'Collar antipulgas', category: 'Accesorios', brand: 'Seresto', costPrice: 12000, salePrice: 18000, stock: 15 },
      { name: 'Correa para perro', category: 'Accesorios', brand: 'Kong', costPrice: 5000, salePrice: 8000, stock: 20 },
      { name: 'Plato comedero', category: 'Accesorios', brand: 'Genérico', costPrice: 2000, salePrice: 3500, stock: 35 },
      { name: 'Juguete perro', category: 'Juguetes', brand: 'Kong', costPrice: 4000, salePrice: 6500, stock: 25 },
      { name: 'Rascador gatos', category: 'Accesorios', brand: 'Genérico', costPrice: 8000, salePrice: 12000, stock: 12 },
      { name: 'Cama para mascotas', category: 'Accesorios', brand: 'Genérico', costPrice: 10000, salePrice: 15000, stock: 10 },
      { name: 'Jaula para conejos', category: 'Jaulas', brand: 'Genérico', costPrice: 15000, salePrice: 22000, stock: 8 },
      { name: 'Vitaminas perro', category: 'Suplementos', brand: 'Cosequin', costPrice: 8000, salePrice: 12000, stock: 20 },
      { name: 'Desparasitante perro', category: 'Medicamentos', brand: 'Drontal', costPrice: 5000, salePrice: 8000, stock: 25 },
      { name: 'Desparasitante gato', category: 'Medicamentos', brand: 'Drontal', costPrice: 4500, salePrice: 7000, stock: 20 },
      { name: 'Pipeta antipulgas perro', category: 'Medicamentos', brand: 'Frontline', costPrice: 6000, salePrice: 9500, stock: 30 },
      { name: 'Pipeta antipulgas gato', category: 'Medicamentos', brand: 'Frontline', costPrice: 5500, salePrice: 8500, stock: 25 },
      { name: 'Alimento cachorros 15kg', category: 'Alimentos', brand: 'Champion Dog', costPrice: 20000, salePrice: 28000, stock: 15 },
      { name: 'Alimento gatitos 5kg', category: 'Alimentos', brand: 'Whiskas', costPrice: 10000, salePrice: 15000, stock: 18 },
      { name: 'Transportadora mascotas', category: 'Accesorios', brand: 'Genérico', costPrice: 12000, salePrice: 18000, stock: 10 },
    ]
  },
  tiendaropa: {
    name: 'Tienda de Ropa',
    products: [
      { name: 'Polera básica mujer', category: 'Poleras', brand: 'H&M', costPrice: 5000, salePrice: 9990, stock: 30 },
      { name: 'Polera básica hombre', category: 'Poleras', brand: 'H&M', costPrice: 5000, salePrice: 9990, stock: 35 },
      { name: 'Jeans mujer', category: 'Pantalones', brand: 'Levi\'s', costPrice: 15000, salePrice: 29990, stock: 20 },
      { name: 'Jeans hombre', category: 'Pantalones', brand: 'Levi\'s', costPrice: 15000, salePrice: 29990, stock: 25 },
      { name: 'Vestido casual', category: 'Vestidos', brand: 'Zara', costPrice: 12000, salePrice: 24990, stock: 15 },
      { name: 'Camisa formal hombre', category: 'Camisas', brand: 'Arrow', costPrice: 10000, salePrice: 19990, stock: 20 },
      { name: 'Blusa mujer', category: 'Blusas', brand: 'Mango', costPrice: 8000, salePrice: 16990, stock: 25 },
      { name: 'Chaqueta jeans', category: 'Chaquetas', brand: 'Gap', costPrice: 18000, salePrice: 34990, stock: 12 },
      { name: 'Sweater hombre', category: 'Sweaters', brand: 'Tommy Hilfiger', costPrice: 15000, salePrice: 29990, stock: 18 },
      { name: 'Sweater mujer', category: 'Sweaters', brand: 'Tommy Hilfiger', costPrice: 15000, salePrice: 29990, stock: 20 },
      { name: 'Zapatillas deportivas', category: 'Calzado', brand: 'Nike', costPrice: 25000, salePrice: 45990, stock: 15 },
      { name: 'Zapatos formales hombre', category: 'Calzado', brand: 'Clarks', costPrice: 20000, salePrice: 39990, stock: 12 },
      { name: 'Sandalias mujer', category: 'Calzado', brand: 'Crocs', costPrice: 10000, salePrice: 19990, stock: 20 },
      { name: 'Cinturón de cuero', category: 'Accesorios', brand: 'Guess', costPrice: 5000, salePrice: 12990, stock: 25 },
      { name: 'Gorro de lana', category: 'Accesorios', brand: 'Genérico', costPrice: 3000, salePrice: 7990, stock: 30 },
      { name: 'Bufanda', category: 'Accesorios', brand: 'Genérico', costPrice: 4000, salePrice: 9990, stock: 25 },
      { name: 'Guantes invierno', category: 'Accesorios', brand: 'Genérico', costPrice: 3500, salePrice: 7990, stock: 20 },
      { name: 'Pijama mujer', category: 'Ropa interior', brand: 'Kayser', costPrice: 8000, salePrice: 16990, stock: 18 },
      { name: 'Calcetines pack x3', category: 'Ropa interior', brand: 'Monarch', costPrice: 2000, salePrice: 4990, stock: 40 },
      { name: 'Pantalón deportivo', category: 'Deportiva', brand: 'Adidas', costPrice: 12000, salePrice: 24990, stock: 22 },
    ]
  },
  taller: {
    name: 'Taller Mecánico',
    products: [
      { name: 'Cambio de aceite', category: 'Servicios', brand: 'Casa', costPrice: 8000, salePrice: 15000, stock: 0 },
      { name: 'Alineación y balanceo', category: 'Servicios', brand: 'Casa', costPrice: 10000, salePrice: 20000, stock: 0 },
      { name: 'Cambio pastillas freno', category: 'Servicios', brand: 'Casa', costPrice: 15000, salePrice: 35000, stock: 0 },
      { name: 'Diagnóstico computarizado', category: 'Servicios', brand: 'Casa', costPrice: 5000, salePrice: 12000, stock: 0 },
      { name: 'Aceite motor 5W30 4L', category: 'Lubricantes', brand: 'Shell', costPrice: 15000, salePrice: 25000, stock: 20 },
      { name: 'Aceite motor 10W40 4L', category: 'Lubricantes', brand: 'Mobil', costPrice: 12000, salePrice: 20000, stock: 25 },
      { name: 'Filtro aceite', category: 'Repuestos', brand: 'Mann', costPrice: 4000, salePrice: 8000, stock: 30 },
      { name: 'Filtro aire', category: 'Repuestos', brand: 'Mann', costPrice: 5000, salePrice: 10000, stock: 25 },
      { name: 'Filtro combustible', category: 'Repuestos', brand: 'Bosch', costPrice: 6000, salePrice: 12000, stock: 20 },
      { name: 'Bujías juego x4', category: 'Repuestos', brand: 'NGK', costPrice: 12000, salePrice: 20000, stock: 15 },
      { name: 'Batería auto 12V', category: 'Repuestos', brand: 'Bosch', costPrice: 50000, salePrice: 80000, stock: 8 },
      { name: 'Pastillas freno delanteras', category: 'Repuestos', brand: 'Ferodo', costPrice: 20000, salePrice: 35000, stock: 12 },
      { name: 'Pastillas freno traseras', category: 'Repuestos', brand: 'Ferodo', costPrice: 18000, salePrice: 32000, stock: 12 },
      { name: 'Líquido frenos DOT4', category: 'Lubricantes', brand: 'Castrol', costPrice: 4000, salePrice: 8000, stock: 20 },
      { name: 'Líquido refrigerante', category: 'Lubricantes', brand: 'Prestone', costPrice: 5000, salePrice: 10000, stock: 18 },
      { name: 'Escobillas limpiaparabrisas par', category: 'Repuestos', brand: 'Bosch', costPrice: 8000, salePrice: 15000, stock: 15 },
      { name: 'Ampolleta H7', category: 'Repuestos', brand: 'Philips', costPrice: 3000, salePrice: 6000, stock: 25 },
      { name: 'Neumático 185/65R15', category: 'Neumáticos', brand: 'Michelin', costPrice: 35000, salePrice: 60000, stock: 16 },
      { name: 'Correa de distribución', category: 'Repuestos', brand: 'Gates', costPrice: 25000, salePrice: 45000, stock: 10 },
      { name: 'Kit de embrague', category: 'Repuestos', brand: 'Valeo', costPrice: 80000, salePrice: 140000, stock: 5 },
    ]
  },
  peluqueria: {
    name: 'Peluquería',
    products: [
      { name: 'Corte de pelo hombre', category: 'Servicios', brand: 'Casa', costPrice: 2000, salePrice: 7000, stock: 0 },
      { name: 'Corte de pelo mujer', category: 'Servicios', brand: 'Casa', costPrice: 3000, salePrice: 10000, stock: 0 },
      { name: 'Tinte completo', category: 'Servicios', brand: 'Casa', costPrice: 8000, salePrice: 20000, stock: 0 },
      { name: 'Mechas', category: 'Servicios', brand: 'Casa', costPrice: 10000, salePrice: 25000, stock: 0 },
      { name: 'Brushing', category: 'Servicios', brand: 'Casa', costPrice: 3000, salePrice: 8000, stock: 0 },
      { name: 'Alisado brasileño', category: 'Servicios', brand: 'Casa', costPrice: 15000, salePrice: 40000, stock: 0 },
      { name: 'Tratamiento capilar', category: 'Servicios', brand: 'Casa', costPrice: 5000, salePrice: 12000, stock: 0 },
      { name: 'Peinado para evento', category: 'Servicios', brand: 'Casa', costPrice: 4000, salePrice: 15000, stock: 0 },
      { name: 'Shampoo profesional 1L', category: 'Productos', brand: 'Loreal', costPrice: 8000, salePrice: 15000, stock: 15 },
      { name: 'Acondicionador 1L', category: 'Productos', brand: 'Loreal', costPrice: 8000, salePrice: 15000, stock: 15 },
      { name: 'Mascarilla capilar', category: 'Productos', brand: 'Kerastase', costPrice: 12000, salePrice: 22000, stock: 10 },
      { name: 'Tinte permanente', category: 'Productos', brand: 'Koleston', costPrice: 5000, salePrice: 10000, stock: 25 },
      { name: 'Decolorante', category: 'Productos', brand: 'Wella', costPrice: 4000, salePrice: 8000, stock: 20 },
      { name: 'Oxidante 30 vol', category: 'Productos', brand: 'Wella', costPrice: 3000, salePrice: 6000, stock: 20 },
      { name: 'Spray fijador', category: 'Productos', brand: 'Schwarzkopf', costPrice: 4000, salePrice: 8000, stock: 18 },
      { name: 'Gel para peinar', category: 'Productos', brand: 'Tresemmé', costPrice: 3000, salePrice: 6000, stock: 20 },
      { name: 'Cera modeladora', category: 'Productos', brand: 'Gatsby', costPrice: 4000, salePrice: 8000, stock: 15 },
      { name: 'Plancha de pelo', category: 'Equipos', brand: 'Remington', costPrice: 25000, salePrice: 45000, stock: 5 },
      { name: 'Secador profesional', category: 'Equipos', brand: 'Babyliss', costPrice: 30000, salePrice: 55000, stock: 4 },
      { name: 'Tijeras profesionales', category: 'Equipos', brand: 'Jaguar', costPrice: 15000, salePrice: 28000, stock: 8 },
    ]
  },
  gimnasio: {
    name: 'Gimnasio',
    products: [
      { name: 'Mensualidad básica', category: 'Membresías', brand: 'Casa', costPrice: 5000, salePrice: 20000, stock: 0 },
      { name: 'Mensualidad premium', category: 'Membresías', brand: 'Casa', costPrice: 8000, salePrice: 35000, stock: 0 },
      { name: 'Clase personalizada', category: 'Servicios', brand: 'Casa', costPrice: 5000, salePrice: 15000, stock: 0 },
      { name: 'Clase grupal', category: 'Servicios', brand: 'Casa', costPrice: 2000, salePrice: 8000, stock: 0 },
      { name: 'Evaluación física', category: 'Servicios', brand: 'Casa', costPrice: 3000, salePrice: 10000, stock: 0 },
      { name: 'Plan nutricional', category: 'Servicios', brand: 'Casa', costPrice: 8000, salePrice: 25000, stock: 0 },
      { name: 'Proteína whey 1kg', category: 'Suplementos', brand: 'Optimum Nutrition', costPrice: 18000, salePrice: 30000, stock: 20 },
      { name: 'Creatina monohidratada', category: 'Suplementos', brand: 'MuscleTech', costPrice: 12000, salePrice: 20000, stock: 15 },
      { name: 'BCAA', category: 'Suplementos', brand: 'Scivation', costPrice: 15000, salePrice: 25000, stock: 12 },
      { name: 'Pre-entreno', category: 'Suplementos', brand: 'Cellucor', costPrice: 15000, salePrice: 25000, stock: 15 },
      { name: 'Quemador de grasa', category: 'Suplementos', brand: 'Hydroxycut', costPrice: 18000, salePrice: 30000, stock: 10 },
      { name: 'Barra proteica', category: 'Snacks', brand: 'Quest', costPrice: 1500, salePrice: 3000, stock: 50 },
      { name: 'Shaker', category: 'Accesorios', brand: 'Blender Bottle', costPrice: 3000, salePrice: 6000, stock: 25 },
      { name: 'Guantes gimnasio', category: 'Accesorios', brand: 'Under Armour', costPrice: 5000, salePrice: 10000, stock: 20 },
      { name: 'Toalla deportiva', category: 'Accesorios', brand: 'Genérico', costPrice: 3000, salePrice: 7000, stock: 30 },
      { name: 'Botella agua 1L', category: 'Accesorios', brand: 'Tupperware', costPrice: 4000, salePrice: 8000, stock: 25 },
      { name: 'Camiseta deportiva', category: 'Ropa', brand: 'Nike', costPrice: 8000, salePrice: 15000, stock: 30 },
      { name: 'Short deportivo', category: 'Ropa', brand: 'Adidas', costPrice: 10000, salePrice: 18000, stock: 25 },
      { name: 'Zapatillas running', category: 'Calzado', brand: 'Reebok', costPrice: 25000, salePrice: 45000, stock: 15 },
      { name: 'Colchoneta yoga', category: 'Equipos', brand: 'Genérico', costPrice: 8000, salePrice: 15000, stock: 20 },
    ]
  },
  cafe: {
    name: 'Café',
    products: [
      { name: 'Café expreso', category: 'Bebidas calientes', brand: 'Casa', costPrice: 300, salePrice: 1500, stock: 0 },
      { name: 'Café americano', category: 'Bebidas calientes', brand: 'Casa', costPrice: 350, salePrice: 1800, stock: 0 },
      { name: 'Cappuccino', category: 'Bebidas calientes', brand: 'Casa', costPrice: 500, salePrice: 2500, stock: 0 },
      { name: 'Latte', category: 'Bebidas calientes', brand: 'Casa', costPrice: 500, salePrice: 2500, stock: 0 },
      { name: 'Moccaccino', category: 'Bebidas calientes', brand: 'Casa', costPrice: 600, salePrice: 2800, stock: 0 },
      { name: 'Té verde', category: 'Bebidas calientes', brand: 'Casa', costPrice: 200, salePrice: 1200, stock: 0 },
      { name: 'Té negro', category: 'Bebidas calientes', brand: 'Casa', costPrice: 200, salePrice: 1200, stock: 0 },
      { name: 'Chocolate caliente', category: 'Bebidas calientes', brand: 'Casa', costPrice: 400, salePrice: 2000, stock: 0 },
      { name: 'Jugo natural naranja', category: 'Bebidas frías', brand: 'Casa', costPrice: 600, salePrice: 2500, stock: 0 },
      { name: 'Smoothie frutilla', category: 'Bebidas frías', brand: 'Casa', costPrice: 800, salePrice: 3500, stock: 0 },
      { name: 'Frappé café', category: 'Bebidas frías', brand: 'Casa', costPrice: 700, salePrice: 3200, stock: 0 },
      { name: 'Croissant', category: 'Pastelería', brand: 'Casa', costPrice: 600, salePrice: 2000, stock: 0 },
      { name: 'Pan de chocolate', category: 'Pastelería', brand: 'Casa', costPrice: 700, salePrice: 2200, stock: 0 },
      { name: 'Muffin', category: 'Pastelería', brand: 'Casa', costPrice: 800, salePrice: 2500, stock: 0 },
      { name: 'Brownie', category: 'Pastelería', brand: 'Casa', costPrice: 900, salePrice: 2800, stock: 0 },
      { name: 'Cheesecake porción', category: 'Postres', brand: 'Casa', costPrice: 1200, salePrice: 3500, stock: 0 },
      { name: 'Torta porción', category: 'Postres', brand: 'Casa', costPrice: 1000, salePrice: 3000, stock: 0 },
      { name: 'Sándwich pollo-palta', category: 'Comida', brand: 'Casa', costPrice: 1500, salePrice: 4000, stock: 0 },
      { name: 'Sándwich vegetariano', category: 'Comida', brand: 'Casa', costPrice: 1200, salePrice: 3500, stock: 0 },
      { name: 'Ensalada césar', category: 'Comida', brand: 'Casa', costPrice: 1800, salePrice: 4500, stock: 0 },
    ]
  },
  jugueteria: {
    name: 'Juguetería',
    products: [
      { name: 'Muñeca Barbie', category: 'Muñecas', brand: 'Mattel', costPrice: 8000, salePrice: 15000, stock: 20 },
      { name: 'Auto a control remoto', category: 'Vehículos', brand: 'Hot Wheels', costPrice: 12000, salePrice: 22000, stock: 15 },
      { name: 'Lego Classic 500 piezas', category: 'Construcción', brand: 'Lego', costPrice: 18000, salePrice: 30000, stock: 12 },
      { name: 'Puzzle 1000 piezas', category: 'Rompecabezas', brand: 'Ravensburger', costPrice: 8000, salePrice: 15000, stock: 18 },
      { name: 'Peluche oso', category: 'Peluches', brand: 'Genérico', costPrice: 5000, salePrice: 10000, stock: 25 },
      { name: 'Pelota de fútbol', category: 'Deportes', brand: 'Adidas', costPrice: 8000, salePrice: 15000, stock: 20 },
      { name: 'Bicicleta infantil', category: 'Vehículos', brand: 'Oxford', costPrice: 50000, salePrice: 85000, stock: 8 },
      { name: 'Patines', category: 'Deportes', brand: 'Rollerblade', costPrice: 25000, salePrice: 45000, stock: 10 },
      { name: 'Triciclo', category: 'Vehículos', brand: 'Fisher Price', costPrice: 30000, salePrice: 55000, stock: 8 },
      { name: 'Carro de muñecas', category: 'Muñecas', brand: 'Baby Alive', costPrice: 15000, salePrice: 28000, stock: 10 },
      { name: 'Casa de muñecas', category: 'Muñecas', brand: 'Barbie', costPrice: 35000, salePrice: 60000, stock: 6 },
      { name: 'Set de cocina', category: 'Juegos de rol', brand: 'Genérico', costPrice: 12000, salePrice: 22000, stock: 12 },
      { name: 'Set de doctor', category: 'Juegos de rol', brand: 'Genérico', costPrice: 8000, salePrice: 15000, stock: 15 },
      { name: 'Monopoly', category: 'Juegos de mesa', brand: 'Hasbro', costPrice: 15000, salePrice: 25000, stock: 12 },
      { name: 'Jenga', category: 'Juegos de mesa', brand: 'Hasbro', costPrice: 8000, salePrice: 15000, stock: 18 },
      { name: 'UNO', category: 'Juegos de mesa', brand: 'Mattel', costPrice: 5000, salePrice: 10000, stock: 25 },
      { name: 'Slime', category: 'Manualidades', brand: 'Genérico', costPrice: 2000, salePrice: 5000, stock: 40 },
      { name: 'Plastilina set', category: 'Manualidades', brand: 'Play-Doh', costPrice: 5000, salePrice: 10000, stock: 30 },
      { name: 'Dron infantil', category: 'Electrónica', brand: 'Genérico', costPrice: 20000, salePrice: 35000, stock: 8 },
      { name: 'Tableta de dibujo', category: 'Electrónica', brand: 'Wacom', costPrice: 15000, salePrice: 28000, stock: 10 },
    ]
  }
}

// Mapeo de tenants a catálogo de productos
const TENANT_TYPE_MAP: Record<string, keyof typeof BUSINESS_CATALOG> = {
  'MinimarketDonLuis': 'minimarket',
  'FerreteriaSanJose': 'ferreteria',
  'RestauranteLaMesa': 'restaurante',
  'FarmaciaVidaSana': 'farmacia',
  'LibreriaElSaber': 'libreria',
  'PanaderiaElTrigo': 'panaderia',
  'VeterinariaPatitas': 'veterinaria',
  'TiendaRopaModerna': 'tiendaropa',
  'TallerMecanicoRapido': 'taller',
  'PeluqueriaEstilo': 'peluqueria',
  'GimnasioFitness': 'gimnasio',
  'CafeDelCentro': 'cafe',
  'JugueteriaAlegria': 'jugueteria'
}

// Utilidades de fechas
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Función principal de población
async function populateRealisticData() {
  console.log('🚀 Iniciando población de datos realistas...\n')

  try {
    // 1. Obtener todos los tenants activos
    const tenants = await prisma.tenant.findMany({
      where: { isActive: true },
      include: { users: { where: { role: 'ADMIN', isActive: true }, take: 1 } }
    })

    console.log(`✅ Encontrados ${tenants.length} tenants activos\n`)

    const stats = {
      totalProducts: 0,
      totalMovements: 0,
      totalSales: 0,
      totalRevenue: 0,
      tenantStats: [] as any[]
    }

    for (const tenant of tenants) {
      console.log(`\n📦 Procesando: ${tenant.businessName}`)
      console.log(`   Tipo de negocio: ${TENANT_TYPE_MAP[tenant.businessName] || 'desconocido'}`)

      const tenantType = TENANT_TYPE_MAP[tenant.businessName]
      if (!tenantType) {
        console.log(`   ⚠️  Tipo de negocio no encontrado, saltando...`)
        continue
      }

      const businessType = BUSINESS_CATALOG[tenantType]
      const adminUser = tenant.users[0]

      if (!adminUser) {
        console.log(`   ⚠️  No se encontró usuario admin, saltando...`)
        continue
      }

      // 2. Crear productos para el tenant
      console.log(`   📝 Creando productos...`)
      const createdProducts = []

      for (const product of businessType.products) {
        // Crear o buscar MasterProduct
        let masterProduct = await prisma.masterProduct.findFirst({
          where: {
            name: product.name,
            category: product.category
          }
        })

        if (!masterProduct) {
          masterProduct = await prisma.masterProduct.create({
            data: {
              sku: `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: product.name,
              description: `${product.name} - ${product.category}`,
              category: product.category,
              brand: product.brand,
              suggestedPrice: product.salePrice,
              unit: 'unidad',
              isActive: true
            }
          })
        }

        // Crear TenantInventory
        const tenantInventory = await prisma.tenantInventory.create({
          data: {
            tenantId: tenant.id,
            masterProductId: masterProduct.id,
            costPrice: product.costPrice,
            salePrice: product.salePrice,
            stock: product.stock,
            minStock: 5,
            isActive: true
          }
        })

        createdProducts.push({ inventory: tenantInventory, product: masterProduct })
      }

      console.log(`   ✅ ${createdProducts.length} productos creados`)
      stats.totalProducts += createdProducts.length

      // 3. Crear movimientos de inventario (solo para productos con stock > 0)
      console.log(`   📋 Creando movimientos de inventario...`)
      let movementsCount = 0

      const productsWithStock = createdProducts.filter(p => p.inventory.stock > 0)

      for (const { inventory } of productsWithStock) {
        // Crear entrada inicial (compra)
        const entryDate = randomDate(new Date('2025-06-01'), new Date('2025-06-15'))
        await prisma.inventoryMovement.create({
          data: {
            tenantInventoryId: inventory.id,
            type: 'ENTRY',
            quantity: inventory.stock,
            reason: 'Compra inicial de inventario',
            notes: 'Stock inicial del sistema',
            createdBy: adminUser.id,
            tenantId: tenant.id,
            createdAt: entryDate
          }
        })
        movementsCount++

        // Algunas entradas adicionales aleatorias
        const additionalEntries = getRandomInt(2, 5)
        for (let i = 0; i < additionalEntries; i++) {
          const entryAmount = getRandomInt(10, 50)
          const entryDate = randomDate(new Date('2025-06-16'), new Date('2025-11-10'))
          
          await prisma.inventoryMovement.create({
            data: {
              tenantInventoryId: inventory.id,
              type: 'ENTRY',
              quantity: entryAmount,
              reason: 'Reposición de stock',
              notes: `Compra a proveedor`,
              createdBy: adminUser.id,
              tenantId: tenant.id,
              createdAt: entryDate
            }
          })
          movementsCount++
        }
      }

      console.log(`   ✅ ${movementsCount} movimientos de inventario creados`)
      stats.totalMovements += movementsCount

      // 4. Crear ventas (junio 2025 - noviembre 2025)
      console.log(`   💰 Creando ventas...`)
      let salesCount = 0
      let tenantRevenue = 0

      const months = [
        { start: new Date('2025-06-01'), end: new Date('2025-06-30'), sales: getRandomInt(20, 40) },
        { start: new Date('2025-07-01'), end: new Date('2025-07-31'), sales: getRandomInt(25, 45) },
        { start: new Date('2025-08-01'), end: new Date('2025-08-31'), sales: getRandomInt(25, 45) },
        { start: new Date('2025-09-01'), end: new Date('2025-09-30'), sales: getRandomInt(30, 50) },
        { start: new Date('2025-10-01'), end: new Date('2025-10-31'), sales: getRandomInt(30, 50) },
        { start: new Date('2025-11-01'), end: new Date('2025-11-13'), sales: getRandomInt(15, 25) }
      ]

      let saleNumber = 1

      for (const month of months) {
        for (let i = 0; i < month.sales; i++) {
          const saleDate = randomDate(month.start, month.end)
          const itemsCount = getRandomInt(1, 5)
          const paymentMethod = getRandomElement(['CASH', 'DEBIT', 'CREDIT', 'TRANSFER']) as PaymentMethod
          const saleStatus = Math.random() < 0.95 ? 'COMPLETED' : (Math.random() < 0.5 ? 'PENDING' : 'CANCELLED') as SaleStatus

          // Seleccionar productos aleatorios
          const selectedProducts = []
          for (let j = 0; j < itemsCount; j++) {
            selectedProducts.push(getRandomElement(createdProducts))
          }

          // Calcular totales
          let subtotal = 0
          const saleItems = selectedProducts.map(({ inventory, product }) => {
            const quantity = getRandomInt(1, 3)
            const unitPrice = Number(inventory.salePrice)
            const unitCost = Number(inventory.costPrice)
            const itemSubtotal = unitPrice * quantity

            subtotal += itemSubtotal

            return {
              quantity,
              unitPrice,
              unitCost,
              subtotal: itemSubtotal,
              tenantInventoryId: inventory.id,
              tenantId: tenant.id
            }
          })

          const tax = 0 // Sin IVA por ahora
          const total = subtotal + tax

          // Crear venta
          const sale = await prisma.sale.create({
            data: {
              saleNumber: `${tenant.businessName.substring(0, 3).toUpperCase()}-${saleNumber.toString().padStart(6, '0')}`,
              subtotal,
              tax,
              total,
              paymentMethod,
              status: saleStatus,
              userId: adminUser.id,
              tenantId: tenant.id,
              createdAt: saleDate,
              updatedAt: saleDate,
              items: {
                create: saleItems
              }
            }
          })

          // Actualizar stock si la venta está completada
          if (saleStatus === 'COMPLETED') {
            for (const item of saleItems) {
              // Registrar salida de inventario
              await prisma.inventoryMovement.create({
                data: {
                  tenantInventoryId: item.tenantInventoryId,
                  type: 'EXIT',
                  quantity: -item.quantity,
                  reason: 'Venta',
                  notes: `Venta ${sale.saleNumber}`,
                  createdBy: adminUser.id,
                  tenantId: tenant.id,
                  createdAt: saleDate
                }
              })

              // Actualizar stock en TenantInventory
              await prisma.tenantInventory.update({
                where: { id: item.tenantInventoryId },
                data: { stock: { decrement: item.quantity } }
              })
            }

            tenantRevenue += Number(total)
          }

          salesCount++
          saleNumber++
        }
      }

      console.log(`   ✅ ${salesCount} ventas creadas`)
      console.log(`   💵 Ingresos totales: CLP $${tenantRevenue.toLocaleString('es-CL')}`)

      stats.totalSales += salesCount
      stats.totalRevenue += tenantRevenue
      stats.tenantStats.push({
        name: tenant.businessName,
        type: businessType.name,
        products: createdProducts.length,
        movements: movementsCount,
        sales: salesCount,
        revenue: tenantRevenue
      })
    }

    console.log('\n\n✨ ¡Población de datos completada!\n')
    console.log('📊 RESUMEN GLOBAL:')
    console.log(`   Total de productos: ${stats.totalProducts}`)
    console.log(`   Total de movimientos: ${stats.totalMovements}`)
    console.log(`   Total de ventas: ${stats.totalSales}`)
    console.log(`   Ingresos totales: CLP $${stats.totalRevenue.toLocaleString('es-CL')}`)

    return stats
  } catch (error) {
    console.error('❌ Error durante la población:', error)
    throw error
  }
}

// Ejecutar
populateRealisticData()
  .then((stats) => {
    console.log('\n✅ Proceso completado exitosamente')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
