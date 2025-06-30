import { UserRole } from './user'
import 'next-auth'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface User {
    id: string
    role: UserRole
    city: string
    phone?: string
    description?: string
    avatar?: string
    banner?: string
    services?: any[]
    serviceArea?: string
    readyToTravel?: boolean
  }

  interface Session {
    user: User & {
      id: string
      role: UserRole
      city: string
      phone?: string
      description?: string
      avatar?: string
      banner?: string
      services?: any[]
      serviceArea?: string
      readyToTravel?: boolean
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    role?: UserRole
    city?: string
  }
} 