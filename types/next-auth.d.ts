
import { UserRole } from '@prisma/client'
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      firstName: string
      lastName: string
      role: UserRole
      tenantId: string
      tenantName?: string
    } & DefaultSession['user']
  }

  interface User {
    id: string
    firstName: string
    lastName: string
    role: UserRole
    tenantId: string
    tenantName?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    firstName: string
    lastName: string
    role: UserRole
    tenantId: string
    tenantName?: string
  }
}
