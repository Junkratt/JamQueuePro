import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        name: { label: 'Name', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email) return null
        
        try {
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
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
