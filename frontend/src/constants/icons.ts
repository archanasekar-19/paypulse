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
  HISTORY: 'solar:history-bold-duotone',
  TIMELINE: 'solar:clock-circle-bold-duotone',
  TRENDING_UP: 'solar:graph-up-bold-duotone',

  // Modules & KPIs
  PAYROLL: 'solar:wallet-money-bold-duotone',
  PAYROLL_BOLD: 'solar:wallet-money-bold',
  PAYSLIP: 'carbon:receipt',
  BUILDINGS: 'solar:buildings-2-linear',
  HEADCOUNT: 'solar:users-group-two-rounded-bold-duotone',
  CHART: 'solar:chart-2-bold-duotone',
  SCALE: 'solar:scale-bold-duotone',
  MAP_PIN: 'solar:map-point-bold-duotone',
  TARGET: 'solar:target-bold-duotone',
  ARROW_UP: 'solar:arrow-up-bold',
  ARROW_DOWN: 'solar:arrow-down-bold',

  // Status, Mechanics & Warnings
  CALENDAR: 'solar:calendar-date-bold-duotone',
  DANGER: 'solar:danger-triangle-bold',
  SHIELD: 'solar:shield-warning-bold',
  INFO: 'solar:info-circle-linear',

  // Inactive & Deactivation Actions
  USER_INACTIVE: 'solar:user-cross-rounded-bold-duotone',
  USER_BLOCK: 'solar:user-block-rounded-bold-duotone',
  DEACTIVATE: 'solar:user-cross-rounded-bold',

  // Auth & Session
  LOCK: 'solar:lock-keyhole-bold-duotone',
  LOGOUT: 'solar:logout-2-bold-duotone',
  EYE: 'solar:eye-linear',
  EYE_CLOSED: 'solar:eye-closed-linear',
  USER: 'solar:user-bold-duotone'
} as const

export type AppIcon = (typeof AppIcon)[keyof typeof AppIcon]
