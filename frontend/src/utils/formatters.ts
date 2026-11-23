import type { CurrencyCode } from '../types'

/**
 * Formats a monetary amount into standard currency string using 3-letter currency code
 * e.g. 145000, 'USD' -> "USD 145,000"
 * e.g. 10791365, 'INR' -> "INR 10,791,365"
 * e.g. -57038765, 'INR' -> "-INR 57,038,765"
 */
export function formatCurrency(amount: number, currency: CurrencyCode | string = 'USD'): string {
  const isNegative = amount < 0
  const absFormatted = Math.abs(Math.round(amount)).toLocaleString()
  const code = (currency || 'USD').toUpperCase()
  return isNegative ? `-${code} ${absFormatted}` : `${code} ${absFormatted}`
}

export const formatCurrencyCode = formatCurrency

/**
 * Formats large amounts into compact notation for KPI cards using currency code
 * e.g. 842150000 -> "USD 842.15M"
 */
export function formatCompactCurrency(amount: number, currency: CurrencyCode | string = 'USD'): string {
  const code = (currency || 'USD').toUpperCase()
  if (amount >= 1_000_000_000) {
    return `${code} ${(amount / 1_000_000_000).toFixed(2)}B`
  }
  if (amount >= 1_000_000) {
    return `${code} ${(amount / 1_000_000).toFixed(2)}M`
  }
  if (amount >= 1_000) {
    return `${code} ${(amount / 1_000).toFixed(1)}k`
  }
  return `${code} ${Math.round(amount).toLocaleString()}`
}

/**
 * Extracts 2-letter uppercase initials from full name
 * e.g. "Sarah Connor" -> "SC"
 */
export function getInitials(name: string): string {
  if (!name) return '??'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}
