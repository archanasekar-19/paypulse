import { prisma } from './prisma'

async function backfillSalaryHistory() {
  console.log('🔄 Checking for employees without salary history...')
  const totalEmployees = await prisma.employee.count()
  console.log(`Found ${totalEmployees.toLocaleString()} total employees in database.`)

  // Find employees that already have history
  const existingHistoryCount = await prisma.salaryHistory.count()
  console.log(`Current salary history records: ${existingHistoryCount}`)

  if (existingHistoryCount >= totalEmployees) {
    console.log('✅ Salary history already fully populated!')
    return
  }

  console.log('🌱 Generating salary history timeline records...')
  const BATCH_SIZE = 2000
  let processed = 0

  while (processed < totalEmployees) {
    const employees = await prisma.employee.findMany({
      skip: processed,
      take: BATCH_SIZE,
      select: {
        id: true,
        baseSalary: true,
        baseSalaryUSD: true,
        currency: true,
        hireDate: true,
        jobTitle: true
      }
    })

    if (employees.length === 0) break

    const historyRecords: any[] = []

    for (const emp of employees) {
      // 1. Initial Offer record at hire date
      // If hired > 1 year ago, initial salary was ~8-12% lower
      const hireTime = emp.hireDate.getTime()
      const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000

      if (hireTime < oneYearAgo) {
        // Has had an annual raise
        const initialSalary = Math.round(emp.baseSalary * 0.9)
        const initialSalaryUSD = Math.round((emp.baseSalaryUSD || 0) * 0.9)
        const changePercent = Number((((emp.baseSalary - initialSalary) / initialSalary) * 100).toFixed(1))

        // Initial contract
        historyRecords.push({
          employeeId: emp.id,
          oldAmount: 0,
          newAmount: initialSalary,
          currency: emp.currency,
          oldAmountUSD: 0,
          newAmountUSD: initialSalaryUSD,
          changePercent: 0,
          reason: 'Initial Contract Offer',
          changedBy: 'People Operations',
          effectiveDate: emp.hireDate,
          notes: 'Standard onboarding compensation package.'
        })

        // Annual Performance Review raise
        const reviewDate = new Date(hireTime + 365 * 24 * 60 * 60 * 1000)
        historyRecords.push({
          employeeId: emp.id,
          oldAmount: initialSalary,
          newAmount: emp.baseSalary,
          currency: emp.currency,
          oldAmountUSD: initialSalaryUSD,
          newAmountUSD: emp.baseSalaryUSD || 0,
          changePercent,
          reason: 'Annual Merit & Performance Review',
          changedBy: 'Elena Vance (HR Manager)',
          effectiveDate: reviewDate,
          notes: 'Exceeds expectations. Adjusted to reflect annual merit band.'
        })
      } else {
        // Recent hire - single initial contract record
        historyRecords.push({
          employeeId: emp.id,
          oldAmount: 0,
          newAmount: emp.baseSalary,
          currency: emp.currency,
          oldAmountUSD: 0,
          newAmountUSD: emp.baseSalaryUSD || 0,
          changePercent: 0,
          reason: 'Initial Contract Offer',
          changedBy: 'People Operations',
          effectiveDate: emp.hireDate,
          notes: 'Initial compensation package upon joining ACME Corp.'
        })
      }
    }

    await prisma.salaryHistory.createMany({
      data: historyRecords
    })

    processed += employees.length
    console.log(`📦 Populated history for ${processed.toLocaleString()} / ${totalEmployees.toLocaleString()} employees...`)
  }

  const finalCount = await prisma.salaryHistory.count()
  console.log(`✨ Successfully backfilled ${finalCount.toLocaleString()} salary history timeline records!`)
}

backfillSalaryHistory()
  .catch((e) => {
    console.error('❌ Backfill failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
