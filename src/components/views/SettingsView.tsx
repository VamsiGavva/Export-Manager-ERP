"use client"

import React, { useState, useEffect } from "react"
import { Info, User, Shield, Key } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { getCurrentUser } from "@/app/actions/auth"

interface UserDetails {
  name: string
  email: string
}

export default function SettingsView() {
  const [user, setUser] = useState<UserDetails | null>(null)

  useEffect(() => {
    getCurrentUser().then((res) => {
      if (res) {
        setUser({ name: res.name, email: res.email })
      }
    })
  }, [])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">ERP Settings</h1>
          <p className="text-muted-foreground mt-1">Manage user account profile details and review financial calculation parameters.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Account Info Card */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-1.5">
              <User className="h-5 w-5 text-primary" /> Account Profile
            </CardTitle>
            <CardDescription>
              Details of the active business operator account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Company / User Name</label>
                <div className="p-2 border rounded bg-zinc-50 dark:bg-zinc-950/20 text-sm font-medium">
                  {user ? user.name : "Loading..."}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Email Address</label>
                <div className="p-2 border rounded bg-zinc-50 dark:bg-zinc-950/20 text-sm font-medium">
                  {user ? user.email : "Loading..."}
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-xs text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-blue-900/30">
                <Shield className="h-4 w-4 shrink-0" />
                <span>Multi-tenant data isolation is active. Your data is isolated to this user ID.</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Rules Reference */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-1.5">
              <Info className="h-5 w-5 text-indigo-500" /> ERP Business Rules
            </CardTitle>
            <CardDescription>
              Automatic financial calculation specifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3 text-xs text-muted-foreground list-disc pl-4">
              <li>
                <strong className="text-zinc-800 dark:text-zinc-200">Shipment Lifecycle:</strong> Every shipment starts in a <span className="underline">Waiting for Sale</span> status with initial transportation costs.
              </li>
              <li>
                <strong className="text-zinc-800 dark:text-zinc-200">Investment Formulas:</strong> Total investment is dynamically computed as: <br />
                <code className="bg-muted px-1 py-0.5 rounded text-[10px] text-zinc-900 dark:text-zinc-100 block mt-1 select-all w-fit">
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
    </div>
  )
}
