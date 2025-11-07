
import { NextAuthOptions, DefaultSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './db'
import bcrypt from 'bcryptjs'
import type { UserRole } from '@prisma/client'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      firstName: string
      lastName: string
      role: UserRole
      tenantId: string
    } & DefaultSession['user']
  }

  interface User {
    id: string
    firstName: string
    lastName: string
    role: UserRole
    tenantId: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    firstName: string
    lastName: string
    role: UserRole
    tenantId: string
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🔐 [AUTH] Authorization attempt started')
        console.log('🔐 [AUTH] Email provided:', credentials?.email)
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ [AUTH] Missing credentials - email or password not provided')
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { tenant: true }
        })

        console.log('🔐 [AUTH] User found:', user ? 'YES' : 'NO')
        if (user) {
          console.log('🔐 [AUTH] User details:', {
            id: user.id,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            tenantId: user.tenantId,
            tenantIsActive: user.tenant?.isActive,
            hasPassword: !!user.password,
            passwordLength: user.password?.length || 0
          })
        }

        if (!user) {
          console.log('❌ [AUTH] User not found in database')
          return null
        }

        if (!user.isActive) {
          console.log('❌ [AUTH] User is not active')
          return null
        }

        if (!user.tenant?.isActive) {
          console.log('❌ [AUTH] Tenant is not active')
          return null
        }

        console.log('🔐 [AUTH] Attempting password comparison...')
        console.log('🔐 [AUTH] Stored hash starts with:', user.password.substring(0, 10))
        
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        
        console.log('🔐 [AUTH] Password valid:', isPasswordValid)
        
        if (!isPasswordValid) {
          console.log('❌ [AUTH] Password comparison failed')
          // Additional debugging: try comparing with a test hash
          const testHash = await bcrypt.hash(credentials.password, 10)
          console.log('🔐 [AUTH] Test hash of provided password:', testHash.substring(0, 10))
          return null
        }

        console.log('✅ [AUTH] Authentication successful for user:', user.email)
        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenantId: user.tenantId,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.role = user.role
        token.tenantId = user.tenantId
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      session.user.firstName = token.firstName
      session.user.lastName = token.lastName
      session.user.role = token.role
      session.user.tenantId = token.tenantId
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
}
