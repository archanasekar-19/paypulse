# Evolved Product Requirements Document (PRD v2.0)
## PayPulse — Global Compensation & Payroll Hub

**Target Persona:** HR Manager (Global People Operations)  
**Organization:** ACME Corporation (10,000 employees across 7 operating countries)  
**Author:** Archana Sekar (Software Craftsperson Candidate)  
**Context:** Incubyte Technical Assessment  
**Evolution Status:** Version 2.0 (Evolved from Baseline Spreadsheet Replacement PRD)  

---

## 1. Executive Context & The Evolutionary Journey

The initial Product Requirements Document ([`docs/REQUIREMENTS.md`](./REQUIREMENTS.md)) targeted a pragmatic spreadsheet replacement for ACME Corp's 10,000 employees. It focused on core CRUD capabilities, basic pagination, and high-level macro averages.

However, as the system was built, tested, and deployed to production against the full 10,000-record dataset across 7 countries (United States, United Kingdom, Germany, India, Japan, Singapore, Canada), real-world enterprise payroll and compensation management demanded an **architectural and functional evolution**. Managing global compensation is not merely editing a flat base salary cell in a grid; it requires multi-factor welfare calculations, statutory deduction compliance, mathematical percentile benchmarking, auditability, and sub-second performance.

This document formalizes the **Evolved Requirements (v2.0)** that were designed, implemented, and verified in PayPulse.

---

## 2. Core Functional Requirement Evolutions

### Evolution 1: From Flat Base Salary to Multi-Factor Welfare & Compensation Mechanics
* **Initial Requirement:** Simple input and display of a single `baseSalary` number and currency.
* **Evolved Requirement:** Real-world enterprise compensation requires a comprehensive calculation engine that mirrors statutory payroll structures:
  1. **Welfare Allowances:**
     - **Performance Bonus:** Standard baseline bonus (8% of base salary).
     - **Travel & Housing Subsidy:** Cost-of-living stipend (3% of base salary).
     - **Health & Wellness Allowance:** Stipend for employee well-being (4% of base salary).
     - **Overtime Pay:** Direct input for non-exempt hourly overtime accruals.
     - **Gross Salary Calculation:** `Gross = Base + Bonus + Subsidy + Allowance + Overtime + Custom Additions`.
  2. **Statutory & Policy Deductions:**
     - **Healthcare & Social Insurance:** Standard deduction (6.5% of base salary).
     - **Unpaid Leave Deductions:** Dynamically calculated based on standard workdays (260 working days per year). Formula: `Daily Wage = Base / 260`. Unpaid days deducted: `max(0, Leave Days - Earned Leaves) * Daily Wage`.
  3. **Custom Contract Items:**
     - Dynamic JSON-persisted custom additions (e.g., Relocation Assistance, Retention Stipend).
     - Dynamic JSON-persisted custom deductions (e.g., Equipment Advances, Loan Repayments).
  4. **Net Take-Home Pay:**
     - Automatically computed in both local currency and normalized base USD:  
       `Net Salary = Gross Salary - (Insurance + Leave Deductions + Custom Deductions)`.

---

### Evolution 2: From Basic Pagination to High-Throughput Indexed Search & RFC-4180 CSV Export
* **Initial Requirement:** Server-side pagination with default page sizes.
* **Evolved Requirement:** High-throughput data navigation across 10,000 employee records without UI lag:
  1. **Compound B-Tree Database Indexing:** SQLite indexes on `(department, country, status, updatedAt)` ensuring response times under 30ms.
  2. **Multi-Field Substring Search:** Instant search across employee code (`ACM-XXXXX`), first name, last name, email, and job title with whitespace trimming.
  3. **Multi-Column Sorting:** Ascending/descending sorting by salary, employee name, department, country, hire date, net salary, and last updated timestamp.
  4. **RFC-4180 Streaming CSV Export:** HR can export filtered views to CSV at any time. Features comma-escaping, quote-wrapping, localized currency values, gross wages, statutory deductions, and USD normalized totals.

---

### Evolution 3: From Macro Averages to Deep-Dive SQL Window Analytics
* **Initial Requirement:** Four macro KPI cards (Total Spend, Headcount, Mean, Median).
* **Evolved Requirement:** Deep compensation intelligence answering complex HR benchmarking questions in sub-seconds using SQL Window functions:
  1. **Org Overview:** Headcount, total payroll commitment, min salary, max salary, mean salary, and exact median salary computed via SQL window functions (`ROW_NUMBER() OVER (ORDER BY baseSalaryUSD)`).
  2. **Pay by Country Breakdown:** Compares headcount, total spend in local currency and USD, minimums, maximums, and median local wages across all 7 operating nations.
  3. **Role Pay Bands (P25, Median, P75):** Answers critical benchmarking questions like:
     > *"What do Senior Engineers in India or Product Managers in Germany earn?"*  
     Directly partitions by `(country, department, jobTitle)` to yield P25, Median, and P75 benchmarks.
  4. **Salary Distribution Histograms:** Categorizes 10,000 employees into 9 standardized compensation tiers (Under $40k, $40k–$60k, ..., $200k+) with visual histogram counts and averages.
  5. **Extended Percentile Spectrum:** Exact database calculation of P10, P25, P50 (median), P75, P90, and P95 compensation curves.

---

### Evolution 4: Automated Pay Equity & Outlier Detection Engine
* **Initial Requirement:** Not present in baseline PRD.
* **Evolved Requirement:** Proactive HR disparity detection to eliminate pay gaps and flight risks:
  1. **Cohort-Relative Analysis:** Analyzes employees within the same job title and country cohort.
  2. **Configurable Thresholding:** Default ±20% deviation threshold against the cohort median benchmark.
  3. **Actionable Classification:** Flags outliers as:
     - `BELOW_BAND`: Employees earning less than `Benchmark Median * (1 - threshold)` (identifies retention risks and unfair compensation compression).
     - `ABOVE_BAND`: Employees earning more than `Benchmark Median * (1 + threshold)` (identifies budgetary anomalies or legacy overcompensation).
  4. **Direct Remediation:** Provides HR with direct links to the employee record and their percentage deviation.

---

### Evolution 5: Regulatory Compliance & Immutable Salary Audit Trail
* **Initial Requirement:** Direct in-place editing of employee fields; no historical logging specified.
* **Evolved Requirement:** Full compliance with legal payroll audit requirements:
  1. **Immutable `SalaryHistory` Ledger:** Every salary modification records an immutable transaction containing:
     - Old salary and new salary (local currency and USD).
     - Percentage delta.
     - Change reason (e.g., "Annual Merit & Performance Review", "Promotion").
     - Author attribution ("Archana Sekar, HR Manager").
     - Effective timestamp.
     - Contract notes.
  2. **Soft-Delete Safeguard (Offboarding Lifecycle):**
     - Traditional destructive SQL `DELETE` violates payroll accounting laws.
     - Deactivating an employee sets `status = 'INACTIVE'` and `deletedAt = timestamp`, writing an offboarding log to `SalaryHistory`.
     - Historical payslip, tax, and reporting data remains permanently intact.

---

### Evolution 6: Sub-Second Performance & Caching Requirements
* **Initial Requirement:** General response under 50ms.
* **Evolved Requirement:** Rigorous sub-second performance specifications across both tiers:
  1. **Backend In-Memory Analytics Caching:**
     - 60-second TTL cache map on expensive multi-query analytics endpoints.
     - Repeat requests serve in `<1ms` directly from Node process RAM.
     - **Mutation Invalidation:** Creating an employee, updating details, revising salary, or changing status immediately purges cached analytics.
  2. **Frontend Bundle Code Splitting:**
     - Recharts and heavy SVG graphing components split into asynchronous chunks (`React.lazy` + `Suspense`).
     - Initial landing page bundle reduced by 36.4% (from 1,183 kB to 753 kB).
  3. **Wave Skeleton Loading States:**
     - Prevents Cumulative Layout Shift (CLS) on KPI cards and deep analytics views while network requests resolve.

---

## 3. Requirements Evolution Matrix (v1.0 vs. v2.0)

| Requirement Domain | Baseline PRD (v1.0) | Evolved PRD (v2.0) | Justification |
| :--- | :--- | :--- | :--- |
| **Compensation Model** | Flat Base Salary | Multi-Factor: Base, Bonus, Subsidies, Allowances, Overtime, Insurance, Leave Deductions, Custom items | Accurately models real-world gross vs. net take-home pay |
| **Auditability** | None (in-place overwrites) | Immutable `SalaryHistory` audit trail table linked by foreign key | Legal compliance, salary review history, and accountability |
| **Offboarding** | Unspecified / hard delete | Soft-delete status lifecycle (`ACTIVE` / `INACTIVE`) with audit log | Prevents accidental loss of tax, payslip, and accounting history |
| **Analytics Scope** | High-level macro averages | Deep-dive window functions: P10..P95 percentiles, role pay bands, histograms, outlier engine | Answers strategic HR compensation equity questions |
| **Disparity Detection** | Manual inspection | Automated ±20% outlier identification partitioned by title & country | Proactively flags retention risks and pay compression |
| **Caching Layer** | Direct database queries | Typed In-Memory TTL Cache with atomic write-through invalidation | Delivers <1ms analytics response times under frequent navigation |
| **Frontend Delivery** | Single bundle | Route-level code splitting with React Suspense skeleton fallbacks | Accelerates First Contentful Paint (FCP) by 36.4% |
| **Data Export** | Basic table view | RFC-4180 streaming CSV export with complete wage breakdowns | Allows external auditing and executive reporting in Excel/Sheets |

---

## 4. Verification & Testing Criteria

The evolved requirements are backed by an automated **Vitest** test suite verifying:
1. **Mathematical Accuracy:** SQL window median calculations match exact sorted middle records.
2. **Percentile Monotonicity:** P10 $\le$ P25 $\le$ P50 $\le$ P75 $\le$ P90 $\le$ P95.
3. **Compound Filtering:** Multi-tenant isolation by department, country, and status across 10,000 records.
4. **Cache Invalidation:** Verifying cache hits resolve in <25ms and mutations immediately purge cache keys.
5. **Soft-Delete Headcount Integrity:** Verifying global headcount retains total staff records while active payroll spend recalculates accurately.
