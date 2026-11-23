import type { Employee, KpiMetrics } from '../../types'

export const MOCK_METRICS: KpiMetrics = {
  totalPayrollUSD: 842150000,
  totalEmployees: 10000,
  averageSalaryUSD: 84215,
  medianSalaryUSD: 78500
}

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 'emp-001',
    name: 'Sarah Connor',
    email: 'sarah.connor@acme.com',
    department: 'Engineering',
    country: 'United States',
    jobTitle: 'Principal Systems Architect',
    salary: 175000,
    currency: 'USD'
  },
  {
    id: 'emp-002',
    name: 'Rajesh Sharma',
    email: 'rajesh.sharma@acme.com',
    department: 'Engineering',
    country: 'India',
    jobTitle: 'Senior Staff Engineer',
    salary: 3800000,
    currency: 'INR'
  },
  {
    id: 'emp-003',
    name: 'Emma Watson',
    email: 'emma.watson@acme.com',
    department: 'Product',
    country: 'United Kingdom',
    jobTitle: 'Director of Product',
    salary: 110000,
    currency: 'GBP'
  },
  {
    id: 'emp-004',
    name: 'Hans Gruber',
    email: 'hans.gruber@acme.com',
    department: 'Finance',
    country: 'Germany',
    jobTitle: 'VP of Financial Planning',
    salary: 135000,
    currency: 'EUR'
  },
  {
    id: 'emp-005',
    name: 'Kenji Sato',
    email: 'kenji.sato@acme.com',
    department: 'Sales',
    country: 'Japan',
    jobTitle: 'Regional Sales VP (APAC)',
    salary: 18500000,
    currency: 'JPY'
  },
  {
    id: 'emp-006',
    name: 'Elena Rostova',
    email: 'elena.rostova@acme.com',
    department: 'Human Resources',
    country: 'Canada',
    jobTitle: 'VP of Global People Ops',
    salary: 145000,
    currency: 'CAD'
  },
  {
    id: 'emp-007',
    name: 'Marcus Brody',
    email: 'marcus.brody@acme.com',
    department: 'Operations',
    country: 'United States',
    jobTitle: 'Global Operations Director',
    salary: 160000,
    currency: 'USD'
  },
  {
    id: 'emp-008',
    name: 'Priya Patel',
    email: 'priya.patel@acme.com',
    department: 'Engineering',
    country: 'India',
    jobTitle: 'Lead Cloud Infrastructure Eng',
    salary: 3100000,
    currency: 'INR'
  },
  {
    id: 'emp-009',
    name: 'Chloe Dubois',
    email: 'chloe.dubois@acme.com',
    department: 'Product',
    country: 'Germany',
    jobTitle: 'Senior UX Research Lead',
    salary: 86000,
    currency: 'EUR'
  },
  {
    id: 'emp-010',
    name: 'Liam Gallagher',
    email: 'liam.gallagher@acme.com',
    department: 'Sales',
    country: 'United Kingdom',
    jobTitle: 'Enterprise Account Executive',
    salary: 95000,
    currency: 'GBP'
  },
  {
    id: 'emp-011',
    name: 'Wei Zhang',
    email: 'wei.zhang@acme.com',
    department: 'Engineering',
    country: 'Singapore',
    jobTitle: 'Senior Security Engineer',
    salary: 138000,
    currency: 'SGD'
  },
  {
    id: 'emp-012',
    name: 'Alexandria Ocasio',
    email: 'alexandria.o@acme.com',
    department: 'Human Resources',
    country: 'United States',
    jobTitle: 'Senior Compensation Specialist',
    salary: 98000,
    currency: 'USD'
  }
]
