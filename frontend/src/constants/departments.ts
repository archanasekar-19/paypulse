export interface DepartmentBadgeStyle {
  bg: string
  color: string
  border: string
}

export const DEPARTMENT_STYLES: Record<string, DepartmentBadgeStyle> = {
  Engineering: {
    bg: '#eff6ff',
    color: '#1d4ed8',
    border: '#bfdbfe'
  },
  Product: {
    bg: '#faf5ff',
    color: '#7e22ce',
    border: '#e9d5ff'
  },
  Finance: {
    bg: '#ecfdf5',
    color: '#047857',
    border: '#a7f3d0'
  },
  Sales: {
    bg: '#fffbeb',
    color: '#b45309',
    border: '#fde68a'
  },
  'Human Resources': {
    bg: '#fff1f2',
    color: '#be123c',
    border: '#fecdd3'
  },
  Operations: {
    bg: '#f0fdfa',
    color: '#0f766e',
    border: '#99f6e4'
  }
}

export const DEFAULT_DEPARTMENT_STYLE: DepartmentBadgeStyle = {
  bg: '#f1f5f9',
  color: '#334155',
  border: '#cbd5e1'
}

export function getDepartmentStyle(department: string): DepartmentBadgeStyle {
  return DEPARTMENT_STYLES[department] || DEFAULT_DEPARTMENT_STYLE
}
