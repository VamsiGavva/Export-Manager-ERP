"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Settings, ShieldAlert, Database, RotateCcw, CheckCircle, Info, Sparkles } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog"
import { seedMockData, resetDatabase } from "@/app/actions/erp"

export default function SettingsView() {
  const router = useRouter()
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  
  // MODAL STATES
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false)
  const [isSeedConfirmOpen, setIsSeedConfirmOpen] = useState(false)

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // EXECUTE DATARESET
  const handleReset = async () => {
    const res = await resetDatabase()
    if (res.success) {
      setIsResetConfirmOpen(false)
      triggerToast("All database records cleared.")
      router.refresh()
    } else {
      triggerToast(res.error || "Failed to clear database")
    }
  }

  // EXECUTE DATA SEEDING
  const handleSeed = async () => {
    const res = await seedMockData()
    if (res.success) {
      setIsSeedConfirmOpen(false)
      triggerToast("Database seeded with realistic sample data!")
      router.refresh()
    } else {
      triggerToast(res.error || "Failed to seed data. Clear database first.")
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-4 py-3 rounded-lg shadow-lg border">
          <CheckCircle className="h-4 w-4 text-emerald-500 mr-2 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">ERP Settings</h1>
          <p className="text-muted-foreground mt-1">Configure business rules, reset ledger database, or seed demo data.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Maintenance Controls */}
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-1.5 text-destructive">
              <ShieldAlert className="h-5 w-5" /> Database Maintenance
            </CardTitle>
            <CardDescription>
              Perform operations like wiping database tables or repopulating mockup data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-lg bg-zinc-50 dark:bg-zinc-950/20">
              <div>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                  <Database className="h-4 w-4 text-zinc-500" /> Database Reset
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Deletes all cities, agents, shipments, sales, and ledger transactions.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setIsResetConfirmOpen(true)}
                className="shrink-0"
              >
                Reset Database
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-lg bg-zinc-50 dark:bg-zinc-950/20">
              <div>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                  <Sparkles className="h-4 w-4 text-indigo-500 animate-pulse" /> Seed Demo Data
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Populate database with cities, agents, waiting shipments, sold invoices, and credit payments.
                </p>
              </div>
              <Button
                onClick={() => setIsSeedConfirmOpen(true)}
                className="shrink-0 shadow-sm"
              >
                Seed Mock Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Business Rules Reference */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-1.5">
              <Info className="h-5 w-5 text-blue-600" /> ERP Business Rules
            </CardTitle>
            <CardDescription>
              Automatic financial calculation specifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-xs text-muted-foreground list-disc pl-4">
              <li>
                <strong className="text-zinc-800 dark:text-zinc-200">Shipment Lifecycle:</strong> Every shipment starts in a <span className="underline">Waiting for Sale</span> status with initial transportation costs.
              </li>
              <li>
                <strong className="text-zinc-800 dark:text-zinc-200">Investment Formulas:</strong> Total investment is dynamically computed as: <br />
                <code className="bg-muted px-1 py-0.5 rounded text-[10px] text-zinc-900 dark:text-zinc-100">
                  (PurchasePrice × Bags) + (LabourCharges × Bags) + LorryCharges + OtherCharges
                </code>
              </li>
              <li>
                <strong className="text-zinc-800 dark:text-zinc-200">Commission Deductions:</strong> Agent commission is subtracted during sale logging according to type (Percentage, Fixed, or Per-Bag).
              </li>
              <li>
                <strong className="text-zinc-800 dark:text-zinc-200">Automatic Ledgers:</strong> Logging a sold cargo registers a <span className="font-semibold text-rose-600">Debit (Net Sale)</span> transaction inside the Agent Statement ledger automatically.
              </li>
              <li>
                <strong className="text-zinc-800 dark:text-zinc-200">Credits & Balance:</strong> Logged payments generate a <span className="font-semibold text-emerald-600">Credit</span> transaction. Running balances update chronologically.
              </li>
              <li>
                <strong className="text-zinc-800 dark:text-zinc-200">Advance Green Flags:</strong> A negative ledger balance represents an agent advance deposit, displayed in <span className="text-emerald-600 dark:text-emerald-500 font-semibold bg-emerald-50/50 dark:bg-emerald-950/20 px-1 rounded">green</span>.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* -------------------------------------------------------------
          DIALOG: CONFIRM RESET
          ------------------------------------------------------------- */}
      <Dialog open={isResetConfirmOpen} onOpenChange={setIsResetConfirmOpen}>
        <div className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-1.5">
              Confirm Complete Database Wipe
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to clear the entire ERP database? This will permanently delete all cities, agents, shipments, completed sales, and ledger statements.
              <br />
              <strong>This action cannot be undone.</strong>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose onClick={() => setIsResetConfirmOpen(false)}>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleReset} variant="destructive">Wipe Database</Button>
          </DialogFooter>
        </div>
      </Dialog>

      {/* -------------------------------------------------------------
          DIALOG: CONFIRM SEED
          ------------------------------------------------------------- */}
      <Dialog open={isSeedConfirmOpen} onOpenChange={setIsSeedConfirmOpen}>
        <div className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              Seed Sample Data
            </DialogTitle>
            <DialogDescription>
              Do you want to seed the database with realistic sample entries? This is useful for testing graphs and running balances.
              <br />
              <span className="text-xs text-amber-600 font-semibold">Note: Seeding works only when the database is empty. Please wipe the database first if you have existing records.</span>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose onClick={() => setIsSeedConfirmOpen(false)}>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSeed}>Confirm Seed</Button>
          </DialogFooter>
        </div>
      </Dialog>
    </div>
  )
}
