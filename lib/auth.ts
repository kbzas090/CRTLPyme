
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
    async redirect({ url, baseUrl }) {
      // Check if we're coming from a successful sign-in
      // The URL might contain a callbackUrl parameter
      const callbackUrl = url.includes('callbackUrl=') 
        ? new URL(url).searchParams.get('callbackUrl')
        : null;

      // If there's a specific callback URL requested, use it
      if (callbackUrl) {
        // Make sure it's a relative URL or from our domain
        if (callbackUrl.startsWith('/')) return `${baseUrl}${callbackUrl}`;
        if (callbackUrl.startsWith(baseUrl)) return callbackUrl;
      }

      // Default redirect - role-based redirect is handled in the login page
      if (url === baseUrl || url.startsWith(baseUrl + '/auth')) {
        return baseUrl;
      }

      // For any other case, allow the redirect
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
}
