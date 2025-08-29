import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials')
          return null
        }

        try {
          console.log('Login attempt for:', credentials.email)

          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() }
          })

          if (!user) {
            console.log('User not found:', credentials.email)
            return null
          }

          console.log('User found:', { 
            id: user.id, 
            email: user.email, 
            emailVerified: user.emailVerified,
            hasPassword: !!user.password,
            passwordLength: user.password?.length
          })

          if (!user.emailVerified) {
            console.log('Email not verified for user:', user.email)
            return null
          }

          if (!user.password) {
            console.log('No password set for user:', user.email)
            return null
          }

          // Compare password using bcryptjs
          console.log('Comparing password...')
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          console.log('Password comparison result:', isPasswordValid)

          if (!isPasswordValid) {
            console.log('Invalid password for user:', user.email)
            return null
          }

          console.log('Login successful for:', user.email)

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
      }
      return session
    }
  },
  debug: true // Enable debug logging
})

export { handler as GET, handler as POST }
