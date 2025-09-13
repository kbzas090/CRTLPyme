
import { NextAuthOptions, DefaultSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './db'
import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'

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
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { tenant: true }
        })

        if (!user || !user.isActive || !user.tenant?.isActive) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        if (!isPasswordValid) {
          return null
        }

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
