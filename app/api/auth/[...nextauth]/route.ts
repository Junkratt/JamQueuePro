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
        name: { label: 'Name', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email) return null
        
        let user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })
        
        if (!user) {
          user = await prisma.user.create({
            data: {
              email: credentials.email,
              name: credentials.name || ''
            }
          })
        }
        
        return {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async session({ session, token, user }) {
      // Add user id to session - handle different session sources
      if (session.user) {
        if (user?.id) {
          (session.user as any).id = user.id
        } else if (token?.sub) {
          (session.user as any).id = token.sub
        }
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    }
  },
})

export { handler as GET, handler as POST }
