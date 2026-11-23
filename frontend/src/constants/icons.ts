/**
 * Application Icon Registry
 * Centralized icons object using Iconify identifier strings.
 * Ensures strict visual consistency, maintainability, and zero magic strings across the codebase.
 * Compatible with TypeScript erasableSyntaxOnly and modern bundlers.
 */
export const AppIcon = {
  // Primary Entity Actions
  EDIT: 'bx:edit', // Boxicons edit icon
  DELETE: 'fluent:delete-24-regular',
  DELETE_OUTLINE: 'fluent:delete-24-regular',
  ADD_USER: 'solar:user-plus-bold',
  ADD_USER_DUOTONE: 'solar:user-plus-bold-duotone',
  SEARCH: 'solar:magnifer-linear',
  RESET: 'solar:restart-linear',
  CLOSE: 'solar:close-circle-linear',
  SAVE: 'solar:diskette-bold',
  CHECK: 'solar:check-circle-bold',
  PLUS: 'solar:add-circle-bold',
  TRASH: 'solar:trash-bin-trash-bold-duotone',
  EXPORT: 'solar:download-minimalistic-bold-duotone',

  // Modules & KPIs
  PAYROLL: 'solar:wallet-money-bold-duotone',
  PAYROLL_BOLD: 'solar:wallet-money-bold',
  PAYSLIP: 'carbon:receipt',
  BUILDINGS: 'solar:buildings-2-linear',
  HEADCOUNT: 'solar:users-group-two-rounded-bold-duotone',
  CHART: 'solar:chart-2-bold-duotone',
  SCALE: 'solar:scale-bold-duotone',

  // Status, Mechanics & Warnings
  CALENDAR: 'solar:calendar-date-bold-duotone',
  DANGER: 'solar:danger-triangle-bold',
  SHIELD: 'solar:shield-warning-bold',
  INFO: 'solar:info-circle-linear'
} as const

export type AppIcon = (typeof AppIcon)[keyof typeof AppIcon]
