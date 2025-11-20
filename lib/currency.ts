/**
 * Utilidades para formateo de moneda y números
 * Centraliza el formateo para mantener consistencia en toda la aplicación
 */

/**
 * Formatea un número como moneda chilena (CLP)
 * @param amount - Cantidad a formatear (puede ser número o string de Prisma Decimal)
 * @returns String formateado como $X.XXX
 */
export function formatCurrency(amount: number | string): string {
  // Convertir a número para manejar Decimals serializados como strings
  const numAmount = typeof amount === 'string' ? Number(amount) : amount
  
  // Validar que sea un número válido
  if (isNaN(numAmount)) {
    console.warn('formatCurrency: valor inválido recibido:', amount)
    return '$0'
  }
  
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount)
}

/**
 * Formatea un número sin símbolo de moneda
 * @param amount - Cantidad a formatear
 * @returns String formateado con separadores de miles
 */
export function formatNumber(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? Number(amount) : amount
  
  if (isNaN(numAmount)) {
    console.warn('formatNumber: valor inválido recibido:', amount)
    return '0'
  }
  
  return new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount)
}

/**
 * Convierte un string de input a número decimal
 * @param value - String del input
 * @returns Número parseado o null si es inválido
 */
export function parseDecimal(value: string): number | null {
  const cleaned = value.replace(/[^\d.-]/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? null : parsed
}

/**
 * Valida que un número sea positivo
 * @param value - Número a validar
 * @returns true si es positivo, false en caso contrario
 */
export function isPositive(value: number | string): boolean {
  const numValue = typeof value === 'string' ? Number(value) : value
  return !isNaN(numValue) && numValue > 0
}

/**
 * Valida que un número no sea negativo
 * @param value - Número a validar
 * @returns true si es >= 0, false en caso contrario
 */
export function isNonNegative(value: number | string): boolean {
  const numValue = typeof value === 'string' ? Number(value) : value
  return !isNaN(numValue) && numValue >= 0
}

/**
 * Redondea un número a N decimales
 * @param value - Número a redondear
 * @param decimals - Cantidad de decimales (default: 2)
 * @returns Número redondeado
 */
export function roundTo(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}
