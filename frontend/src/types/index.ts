export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY' | 'SGD' | 'CAD'

export interface Employee {
  id: string
  name: string
  email: string
  department: string
  country: string
  jobTitle: string
  salary: number
  currency: CurrencyCode
}

export interface KpiMetrics {
  totalPayrollUSD: number
  totalEmployees: number
  averageSalaryUSD: number
  medianSalaryUSD: number
}
