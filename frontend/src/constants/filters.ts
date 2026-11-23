// Standard organization-wide departments and operating countries
// Reusable across Employee Roster and Executive Analytics

export const DEPARTMENTS = [
  'Engineering',
  'Finance',
  'Human Resources',
  'Marketing',
  'Operations',
  'Product',
  'Sales'
] as const

export const COUNTRIES = [
  'Canada',
  'Germany',
  'India',
  'Japan',
  'Singapore',
  'United Kingdom',
  'United States'
] as const

export type DepartmentName = (typeof DEPARTMENTS)[number]
export type CountryName = (typeof COUNTRIES)[number]
