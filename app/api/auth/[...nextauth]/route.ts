import NextAuth from 'next-auth'
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from '@prisma/client'
import CredentialsProvider from 'next-auth/providers/credentials'

const prisma = new PrismaClient()

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        name: { label: 'Name', type: 'text' },
        role: { label: 'Role', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email) return null
        
        // Find or create user
        let user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })
        
        if (!user) {
          user = await prisma.user.create({
            data: {
              email: credentials.email,
              name: credentials.name || '',
              role: credentials.role || 'musician'
            }
          })
        }
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.sub as string
        session.user.role = token.role as string
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
      }
      return token
    }
  },
})

export { handler as GET, handler as POST }
