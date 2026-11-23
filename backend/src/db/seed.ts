import { prisma } from './prisma'

// Exchange rates normalized to base USD
const FX_RATES_TO_USD: Record<string, number> = {
  USD: 1.0,
  EUR: 1.08,
  GBP: 1.28,
  INR: 0.012,
  JPY: 0.0067,
  SGD: 0.75,
  CAD: 0.74
}

interface CountryConfig {
  name: string
  currency: string
  salaryRange: { min: number; max: number }
}

const COUNTRIES: CountryConfig[] = [
  { name: 'United States', currency: 'USD', salaryRange: { min: 70000, max: 210000 } },
  { name: 'United Kingdom', currency: 'GBP', salaryRange: { min: 45000, max: 130000 } },
  { name: 'Germany', currency: 'EUR', salaryRange: { min: 50000, max: 140000 } },
  { name: 'India', currency: 'INR', salaryRange: { min: 800000, max: 4200000 } },
  { name: 'Japan', currency: 'JPY', salaryRange: { min: 5500000, max: 18000000 } },
  { name: 'Singapore', currency: 'SGD', salaryRange: { min: 60000, max: 175000 } },
  { name: 'Canada', currency: 'CAD', salaryRange: { min: 65000, max: 165000 } }
]

const DEPARTMENTS = [
  { name: 'Engineering', weight: 35, roles: ['Software Engineer', 'Senior Engineer', 'Tech Lead', 'Staff Architect', 'QA Engineer', 'DevOps Specialist'] },
  { name: 'Sales', weight: 20, roles: ['Account Executive', 'Sales Development Rep', 'Enterprise Sales Director', 'Account Manager'] },
  { name: 'Product', weight: 12, roles: ['Product Manager', 'Senior PM', 'Product Designer', 'UX Researcher'] },
  { name: 'Operations', weight: 12, roles: ['Operations Specialist', 'Logistics Coordinator', 'Program Manager', 'Operations Lead'] },
  { name: 'Finance', weight: 8, roles: ['Financial Analyst', 'Senior Accountant', 'Finance Director', 'Payroll Specialist'] },
  { name: 'Human Resources', weight: 8, roles: ['HR Generalist', 'Recruiter', 'People Operations Lead', 'Compensation Analyst'] },
  { name: 'Marketing', weight: 5, roles: ['Content Strategist', 'Growth Marketer', 'Brand Manager', 'SEO Specialist'] }
]

const FIRST_NAMES = [
  'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth',
  'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen',
  'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra',
  'Aarav', 'Priya', 'Aditya', 'Ananya', 'Rohan', 'Sneha', 'Vikram', 'Pooja', 'Rahul', 'Deepika',
  'Kenji', 'Yuki', 'Hiroshi', 'Sakura', 'Daiki', 'Aoi', 'Ren', 'Hina', 'Takumi', 'Yui',
  'Lukas', 'Emma', 'Leon', 'Mia', 'Felix', 'Hannah', 'Jonas', 'Sophia', 'Maximilian', 'Anna',
  'Liam', 'Olivia', 'Noah', 'Charlotte', 'Oliver', 'Amelia', 'Jack', 'Ava', 'Leo', 'Freya'
]

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Sharma', 'Patel', 'Verma', 'Gupta', 'Singh', 'Rao', 'Iyer', 'Nair', 'Reddy', 'Mehta',
  'Sato', 'Suzuki', 'Takahashi', 'Tanaka', 'Watanabe', 'Ito', 'Yamamoto', 'Nakamura', 'Kobayashi', 'Kato',
  'Muller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann',
  'O\'Connor', 'Murphy', 'Walsh', 'Davies', 'Evans', 'Taylor', 'Campbell', 'Stewart', 'Clark', 'Ross'
]

// Weighted department picker
const weightedDepartmentList: { name: string; roles: string[] }[] = []
for (const dept of DEPARTMENTS) {
  for (let i = 0; i < dept.weight; i++) {
    weightedDepartmentList.push({ name: dept.name, roles: dept.roles })
  }
}

export async function seed() {
  console.log('🌱 Checking ACME Org employee database seed status...')
  const startTime = Date.now()

  // 1. Check existing count to avoid unnecessary reseeding on production restarts
  const existingCount = await prisma.employee.count()
  if (existingCount >= 10000) {
    console.log(`✅ Database already has ${existingCount.toLocaleString()} employees. Skipping initial seed.`)
    return
  }

  // Clear any partial records if count is less than target
  if (existingCount > 0) {
    await prisma.employee.deleteMany({})
    console.log('🧹 Cleaned partial employee records.')
  }

  const TOTAL_RECORDS = 10000
  const BATCH_SIZE = 1000
  let recordsCreated = 0

  // 2. Generate records in batches of 1,000 for maximum performance
  for (let batch = 0; batch < TOTAL_RECORDS / BATCH_SIZE; batch++) {
    const batchEmployees = []

    for (let i = 0; i < BATCH_SIZE; i++) {
      const globalIndex = batch * BATCH_SIZE + i + 1
      const empCode = `ACM-${String(globalIndex).padStart(5, '0')}`

      const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)] || 'Alex'
      const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)] || 'Taylor'
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${globalIndex}@acme.com`

      const country = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)] || COUNTRIES[0]!
      const dept = weightedDepartmentList[Math.floor(Math.random() * weightedDepartmentList.length)] || weightedDepartmentList[0]!
      const role = dept.roles[Math.floor(Math.random() * dept.roles.length)] || 'Specialist'

      // Generate realistic salary within country range, rounded to nearest 500
      const rawSalary =
        country.salaryRange.min +
        Math.random() * (country.salaryRange.max - country.salaryRange.min)
      const baseSalary = Math.round(rawSalary / 500) * 500

      // Pre-compute normalized baseSalaryUSD
      const fxRate = FX_RATES_TO_USD[country.currency] || 1.0
      const baseSalaryUSD = Math.round(baseSalary * fxRate)

      // Welfare Salary Components (Additions)
      const bonus = Math.round((baseSalary * (0.05 + Math.random() * 0.1)) / 100) * 100 // 5-15% performance bonus
      const subsidy = Math.round((baseSalary * 0.03) / 100) * 100 // 3% commute/meal subsidy
      const allowance = Math.round((baseSalary * 0.04) / 100) * 100 // 4% role allowance
      const hasOvertime = dept.name === 'Operations' || dept.name === 'Engineering'
      const overtimePay = hasOvertime ? Math.round((baseSalary * (Math.random() * 0.03)) / 100) * 100 : 0
      const grossSalary = baseSalary + bonus + subsidy + allowance + overtimePay

      // Deductions of Wages (Subtractions with Leave & Attendance Tracking)
      const insurance = Math.round((baseSalary * 0.065) / 100) * 100 // 6.5% statutory insurance
      const earnedLeaves = 18 // Standard 18 days annual earned/paid leaves quota
      const leaveDays = Math.floor(Math.random() * 22) // 0 to 21 leaves taken
      const unpaidDays = Math.max(0, leaveDays - earnedLeaves)
      const dailyWage = Math.round(baseSalary / 260)
      const leaveDeduction = unpaidDays * dailyWage

      // Net Take-Home Salary
      const netSalary = grossSalary - (insurance + leaveDeduction)
      const netSalaryUSD = Math.round(netSalary * fxRate)

      // Random hire date within last 6 years
      const daysAgo = Math.floor(Math.random() * (6 * 365))
      const hireDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)

      batchEmployees.push({
        employeeCode: empCode,
        firstName,
        lastName,
        email,
        department: dept.name,
        country: country.name,
        jobTitle: role,
        baseSalary,
        currency: country.currency,
        baseSalaryUSD,
        bonus,
        subsidy,
        allowance,
        overtimePay,
        grossSalary,
        earnedLeaves,
        leaveDays,
        insurance,
        leaveDeduction,
        netSalary,
        netSalaryUSD,
        hireDate
      })
    }

    await prisma.employee.createMany({
      data: batchEmployees
    })

    recordsCreated += BATCH_SIZE
    console.log(`📦 Seeded ${recordsCreated.toLocaleString()} / ${TOTAL_RECORDS.toLocaleString()} employees...`)
  }

  const durationMs = Date.now() - startTime
  console.log(`✨ Successfully seeded 10,000 employees in ${(durationMs / 1000).toFixed(2)}s!`)
}

// Execute if run directly
seed()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
