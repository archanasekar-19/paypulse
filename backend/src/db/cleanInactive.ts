import { prisma } from './prisma'

async function cleanInactiveEmployees() {
  console.log('🔍 Checking for inactive employee records in database...')

  const inactiveCount = await prisma.employee.count({
    where: {
      OR: [
        { status: 'INACTIVE' },
        { status: { not: 'ACTIVE' } },
        { deletedAt: { not: null } }
      ]
    }
  })

  console.log(`Found ${inactiveCount} inactive / soft-deleted records.`)

  if (inactiveCount === 0) {
    console.log('✅ No inactive employee records found. Database is 100% active and clean!')
    return
  }

  // Delete all inactive records (cascades to salary history)
  const result = await prisma.employee.deleteMany({
    where: {
      OR: [
        { status: 'INACTIVE' },
        { status: { not: 'ACTIVE' } },
        { deletedAt: { not: null } }
      ]
    }
  })

  console.log(`🗑️ Successfully deleted ${result.count} inactive employee records.`)

  const remainingActive = await prisma.employee.count()
  console.log(`✨ Total active employee records in database: ${remainingActive.toLocaleString()}`)
}

cleanInactiveEmployees()
  .catch((err) => {
    console.error('❌ Error cleaning inactive employees:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
