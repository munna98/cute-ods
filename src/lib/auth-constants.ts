export enum Role {
  SALES = 'SALES',
  DESIGN = 'DESIGN',
  PRODUCTION = 'PRODUCTION',
  ADMIN = 'ADMIN',
}

export interface UserSession {
  id: string
  name: string
  role: Role
}

export const DEMO_USERS: UserSession[] = [
  { id: 'usr_sales_1', name: 'Sarah Salesperson', role: Role.SALES },
  { id: 'usr_design_1', name: 'Dan Designer', role: Role.DESIGN },
  { id: 'usr_prod_1', name: 'Pete Production', role: Role.PRODUCTION },
  { id: 'usr_admin_1', name: 'Alice Admin', role: Role.ADMIN },
]

export function getRoleDefaultPath(role: Role | string): string {
  switch (role) {
    case Role.SALES:
    case 'SALES':
      return '/sales/leads'
    case Role.DESIGN:
    case 'DESIGN':
      return '/design/queue'
    case Role.PRODUCTION:
    case 'PRODUCTION':
      return '/production/queue'
    case Role.ADMIN:
    case 'ADMIN':
      return '/admin/orders'
    default:
      return '/login'
  }
}
