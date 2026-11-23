import type { CurrencyCode } from '../types'

/**
 * Formats a monetary amount into standard localized currency string
 * e.g. 145000 -> "$145,000" or "₹3,400,000"
 */
export function formatCurrency(amount: number, currency: CurrencyCode = 'USD'): string {
  const currencySymbols: Record<CurrencyCode, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    JPY: '¥',
    SGD: 'S$',
    CAD: 'C$'
  }

  const symbol = currencySymbols[currency] || `${currency} `
  return `${symbol}${amount.toLocaleString()}`
}

/**
 * Formats large amounts into compact notation for KPI cards
 * e.g. 842150000 -> "$842.15M"
 */
export function formatCompactCurrency(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(2)}B`
  }
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(2)}M`
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(1)}k`
  }
  return `$${amount.toLocaleString()}`
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
