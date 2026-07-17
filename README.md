# Export Manager ERP Dashboard

A production-ready Enterprise Resource Planning (ERP) web application for export businesses. Built using Next.js (App Router), TypeScript, Prisma ORM, and Tailwind CSS. The system tracks transport logistics investments, manages agent commission types, compiles ledger statement balances (with negative balances flagged as advances), and formats real-time profit and sales charts.

---

## 🛠️ Technology Stack

- **Core Framework:** Next.js 14 (App Router)
- **Programming Language:** TypeScript
- **Database ORM:** Prisma ORM
- **Database Engine:** SQLite (configured out-of-the-box for instant local execution, fully compatible with PostgreSQL or Cloudflare D1)
- **Styling:** Tailwind CSS + custom HSL design system (supporting Dark Mode)
- **Component Design:** Modular components (simulating shadcn/ui architectures with micro-animations)
- **Data Visualizations:** Recharts (responsive profit areas)
- **Icons:** Lucide Icons

---

## 🚀 Quick Start Instructions

Follow these steps to initialize and launch the application on your local machine:

### 1. Install Dependencies
Navigate to the root directory and install npm packages:
```bash
npm install
```

### 2. Configure and Push Database Schema
Initialize your local SQLite database file and generate the Prisma Client using:
```bash
npx prisma db push
```
*This command creates the database file `prisma/dev.db` and compiles the Prisma TypeScript models automatically.*

### 3. Start the Development Server
Launch the local Next.js dev server:
```bash
npm run dev
```

### 4. Load the Application
Open your browser and navigate to:
```url
http://localhost:3000
```
On first load, **the system automatically seeds the database with realistic sample records** (geographic cities, agents, pending shipments, completed sales invoices, and ledger payment history). This allows you to explore the dashboard and reports with full data immediately.

---

## 📐 Database Schema & Models

The database is built on a relational SQLite structure (`prisma/schema.prisma`):

- **City:** Geographic target regions with country descriptors.
- **Agent:** Contains brokers contact details, and custom commission structures (`Percentage`, `Fixed`, or `PerBag`).
- **Shipment:** Outgoing transport records, automatically calculating total investment sums and bag break-even targets.
- **Sale:** Complete sale details, agent commission deductions, net sale values, and realized profits.
- **Statement:** The core transaction journal ledger mapping debits (sold shipments) and credits (payments received) to calculate running agent balances chronologically.

---

## 💼 Core Business Logic

1. **New Shipment Registration:**
   - Outbound shipments default to `Waiting for Sale` status.
   - Total Investment is calculated live: `(Purchase Price * Bags) + (Labour Charges * Bags) + Lorry Charges + Other Charges`.
   - Break-even price per bag is computed live: `Total Investment / Total Bags`.
2. **Recording Agent Sale:**
   - Completed sales update shipment statuses to `Sold`.
   - Agent commissions are calculated dynamically based on agent commission schemas:
     - *Percentage:* `Sale Amount * (Commission Rate / 100)`
     - *Fixed:* Absolute commission value
     - *Per Bag:* `Commission Value * Bags Sold`
   - Net sales (`Gross Sale - Agent Commission`) are billed as **Debit** items inside the agent's ledger.
3. **Running Ledgers (Statements):**
   - Statements act like a bank statement ledger.
   - **Debits (Net Sales)** increase the running balance.
   - **Credits (Payments Received)** decrease the running balance.
   - **Negative balances represent Agent Advance Deposits** and are flagged in **Green** throughout the interface.

---

## 🎛️ Settings & Database Maintenance
Navigate to the **Settings** menu page in the sidebar:
- **Database Reset:** Safely wipe all records across all tables to start fresh.
- **Seed Demo Data:** Instantly repopulate the ERP database with realistic business scenarios and metrics for evaluation.
