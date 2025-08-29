import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST() {
  try {
    console.log('Starting venue enhancement migration...')

    // Add new columns to Venue table
    await prisma.$executeRaw`
      ALTER TABLE "Venue" 
      ADD COLUMN IF NOT EXISTS "venuePhoto" TEXT,
      ADD COLUMN IF NOT EXISTS "instrumentsProvided" TEXT[],
      ADD COLUMN IF NOT EXISTS "hasPASystem" BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS "jamNightDetails" TEXT,
      ADD COLUMN IF NOT EXISTS "organizerId" TEXT`

    console.log('Venue enhancement columns added')

    return Response.json({ 
      success: true, 
      message: 'Venue enhancement migration completed successfully',
      columnsAdded: [
        'venuePhoto - for venue images',
        'instrumentsProvided - array of available instruments',
        'hasPASystem - boolean for PA availability',
        'jamNightDetails - detailed jam night information',
        'organizerId - primary organizer for the venue'
      ]
    })
  } catch (error) {
    console.error('Venue enhancement migration error:', error)
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Migration failed'
    }, { status: 500 })
  }
}

export async function GET() {
  return POST()
}
