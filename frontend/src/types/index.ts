export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY' | 'SGD' | 'CAD'

export interface CustomSalaryItem {
  id: string
  name: string
  amount: number
}

export interface Employee {
  id: string
  employeeCode?: string
  name: string
  firstName?: string
  lastName?: string
  email: string
  department: string
  country: string
  jobTitle: string
  salary: number
  baseSalary?: number
  bonus?: number
  subsidy?: number
  allowance?: number
  overtimePay?: number
  grossSalary?: number
  earnedLeaves?: number
  leaveDays?: number
  insurance?: number
  leaveDeduction?: number
  customAdditions?: CustomSalaryItem[]
  customDeductions?: CustomSalaryItem[]
  netSalary?: number
  netSalaryUSD?: number
  currency: CurrencyCode
  status?: 'ACTIVE' | 'INACTIVE'
  deletedAt?: string | null
  updatedAt?: string
  createdAt?: string
}

export interface EmployeeFormData {
  employeeCode?: string
  firstName: string
  lastName: string
  email: string
  department: string
  country: string
  jobTitle: string
  baseSalary: number
}

export interface CompensationUpdateData {
  baseSalary?: number
  bonus?: number
  subsidy?: number
  allowance?: number
  overtimePay?: number
  earnedLeaves?: number
  leaveDays?: number
  insurance?: number
  leaveDeduction?: number
  customAdditions?: CustomSalaryItem[]
  customDeductions?: CustomSalaryItem[]
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

export interface SalaryHistoryEntry {
  id: string
  employeeId: string
  oldAmount: number
  newAmount: number
  currency: string
  oldAmountUSD?: number
  newAmountUSD?: number
  changePercent?: number
  reason: string
  changedBy: string
  effectiveDate: string
  notes?: string
  createdAt: string
}

export interface SalaryHistoryResponse {
  employee: {
    id: string
    employeeCode: string
    name: string
    firstName: string
    lastName: string
    department: string
    country: string
    currency: string
    baseSalary: number
    baseSalaryUSD: number
    hireDate: string
  }
  history: SalaryHistoryEntry[]
}

export interface NewSalaryRevisionInput {
  newSalary: number
  reason: string
  effectiveDate?: string
  changedBy?: string
  notes?: string
}

export interface AuthUser {
  name: string
  email: string
  role: string
  organization?: string
}

export interface PayInsightsOverview {
  headcount: number
  totalPayrollUSD: number
  avgSalaryUSD: number
  medianSalaryUSD: number
  minSalaryUSD: number
  maxSalaryUSD: number
}

export interface PayInsightsCountry {
  country: string
  currency: string
  headcount: number
  totalCostLocal: number
  totalCostUSD: number
  minSalaryLocal: number
  maxSalaryLocal: number
  avgSalaryLocal: number
  medianSalaryLocal: number
  minSalaryUSD: number
  maxSalaryUSD: number
  avgSalaryUSD: number
  medianSalaryUSD: number
}

export interface PayInsightsRoleCohort {
  department: string
  jobTitle: string
  country: string
  currency: string
  headcount: number
  minSalary: number
  maxSalary: number
  avgSalary: number
  medianSalary: number
  p25Salary: number
  p75Salary: number
  minSalaryUSD: number
  maxSalaryUSD: number
  avgSalaryUSD: number
  medianSalaryUSD: number
}

export interface SalaryHistogramBin {
  bandLabel: string
  count: number
  avgSalaryUSD: number
  minSalaryUSD: number
  maxSalaryUSD: number
}

export interface SalaryPercentiles {
  p10: number
  p25: number
  p50: number
  p75: number
  p90: number
  p95: number
}

export interface SalaryDistributionData {
  histogram: SalaryHistogramBin[]
  percentiles: SalaryPercentiles
}

export interface PayOutlierItem {
  id: string
  employeeCode: string
  name: string
  email: string
  department: string
  jobTitle: string
  country: string
  currency: string
  baseSalary: number
  baseSalaryUSD: number
  benchmarkMedian: number
  deviationPercent: number
  outlierStatus: 'BELOW_BAND' | 'ABOVE_BAND'
}

export interface PayOutliersData {
  thresholdPercent: number
  summary: {
    totalOutliers: number
    belowBandCount: number
    aboveBandCount: number
  }
  items: PayOutlierItem[]
}

export interface DeepDivePayInsights {
  overview: PayInsightsOverview
  byCountry: PayInsightsCountry[]
  byDepartmentTitle: PayInsightsRoleCohort[]
  distribution: SalaryDistributionData
  outliers: PayOutliersData
}
