# Product Requirements Document (PRD)
## PayPulse — Global Salary Management System

**Target Persona:** HR Manager (Global People Operations)  
**Organization:** ACME Corporation (10,000 employees across 7 countries)  
**Author:** Archana Sekar (Software Craftsperson Candidate)  
**Focus:** Pragmatic, Clean Design — Replacing Spreadsheets with Real-Time Salary Management  

---

### 1. Goal & Problem Statement
ACME Corp's HR team currently manages salary records for 10,000 global employees across disparate Excel spreadsheets. This leads to slow manual lookups, error-prone salary edits, lack of validation, and zero instant visibility into company-wide payroll distribution.

**The Goal:** Build a clean, web-based salary management software that enables the HR Manager to:
1. Seamlessly manage salary records for 10,000 employees without lag.
2. Directly answer fundamental questions about how the organization pays its people.

---

### 2. Core Doables (Primary Capabilities)

#### Pillar A: View & Explore Salaries (The Excel Replacement)
1. **High-Performance 10,000-Record Browser:** Fast, server-paginated table (25 / 50 records per page) with zero browser lag or memory bloat.
2. **Instant Search:** Sub-string search by employee name, email, or job title.
3. **Multi-Facet Filters:** Filter employees by Department (Engineering, Product, Sales, Marketing, HR, Finance, Operations) and Country (USA, UK, Germany, India, Japan, Singapore, Canada).
4. **Salary & Seniority Sorting:** Sort ascending or descending by salary amount or hire date.

#### Pillar B: Manage Employee Salaries (The Action Items)
1. **Update / Edit Salary:** Click an employee to update base salary or job title with instant validation (prevents negative values, empty fields, or invalid currencies).
2. **Add New Employee:** Straightforward form to onboard a new employee with name, email, department, country, job title, and starting salary.
3. **Multi-Currency Support:** Displays salary in the employee's local contract currency (USD, GBP, EUR, INR, JPY, SGD, CAD) alongside an automatic conversion to USD for company-wide comparison.

#### Pillar C: Answering "How the Org Pays People" (Compensation Insights)
1. **Macro KPI Cards:**
   - **Total Payroll Spend:** Global annual compensation commitment.
   - **Total Staff:** Verified 10,000 active employee headcount.
   - **Average Salary:** Mean compensation across the organization.
   - **Median Salary:** Middle earner's compensation (reflecting typical pay without executive outlier distortion).
2. **Departmental Breakdown:** Total spend, headcount, and average salary per department to compare budget allocations.
3. **Geographic Breakdown:** Total spend and employee headcount across each operating country.
4. **Currency Toggle:** Instant view toggle between Normalized Base Currency (USD) and Local Contract Currencies.

---

### 3. What Is Deliberately Left Out (Pragmatic Trade-Offs)

| Deliberately Excluded | Engineering & Product Reasoning |
| :--- | :--- |
| **Complex OAuth / SSO Portals** | *Focus on the Persona:* The target user is the HR Manager. Adding third-party SSO flows adds setup ceremony without improving core salary workflows. App uses a clean authenticated HR session. |
| **Multi-Tier Approval State Machines** | *Focus on Execution:* Multi-step managerial signoffs (Manager &rarr; Director &rarr; Finance) detract from the primary goal of replacing the spreadsheet and managing records cleanly. |
| **Tax Deductions & Direct Bank Payouts** | *Boundary Definition:* Gross salary management and compensation analysis are distinct from localized payroll tax disbursement (PF, TDS, 401k, FICA), which belongs in localized banking engines. |
| **Complex Stock / Equity Vesting** | *Clarity of Pay:* Standardizing on Base Salary + Bonus provides a clean, equitable benchmark for global compensation analysis. |

---

### 4. Non-Functional & Performance Criteria
- **Sub-50ms Response Time:** Direct database indexing on `department`, `country`, and `salary` ensures instant filtering and pagination across 10,000 rows.
- **Data Integrity:** Strict relational schema with validation on all inputs.
- **Test-Driven Reliability:** Unit tests covering salary calculations, medians, averages, and currency conversions.
