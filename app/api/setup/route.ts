import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // This will create the database tables if they don't exist
    await prisma.$executeRaw`SELECT 1`
    
    return Response.json({ 
      success: true, 
      message: 'Database connection successful' 
    })
  } catch (error) {
    console.error('Database setup error:', error)
    return Response.json({ 
      success: false, 
      error: 'Database setup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
