export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY' | 'SGD' | 'CAD'

export interface Employee {
  id: string
  name: string
  firstName?: string
  lastName?: string
  email: string
  department: string
  country: string
  jobTitle: string
  salary: number
  currency: CurrencyCode
}

export interface EmployeeFormData {
  firstName: string
  lastName: string
  email: string
  department: string
  country: string
  jobTitle: string
  baseSalary: number
}

export interface KpiMetrics {
  totalPayrollUSD: number
  totalEmployees: number
  averageSalaryUSD: number
  medianSalaryUSD: number
}

export interface DepartmentSummary {
  department: string
  headcount: number
  totalSpendUSD: number
  averageSalaryUSD: number
}

export interface CountrySummary {
  country: string
  currency: string
  headcount: number
  totalSpendUSD: number
}

export interface SummaryAnalytics extends KpiMetrics {
  departmentBreakdown: DepartmentSummary[]
  countryBreakdown: CountrySummary[]
}
