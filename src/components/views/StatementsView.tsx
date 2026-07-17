"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BookOpen, MapPin, Users, Plus, ArrowUpRight, DollarSign, Wallet, CheckCircle2, Calendar, CreditCard, ChevronRight } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { recordPayment } from "@/app/actions/erp"

interface StatementEntry {
  id: string
  agentId: string
  shipmentId: string | null
  shipment?: { shipmentNo: string } | null
  transactionType: string
  description: string
  debit: number
  credit: number
  runningBalance: number
  transactionDate: Date
}

interface AgentData {
  id: string
  name: string
  cityName: string
  outstanding: number
  advanceBalance: number
  totalSales: number
  totalReceived: number
}

interface StatementsViewProps {
  agents: AgentData[]
  initialStatements: StatementEntry[]
  initialAgentId: string
}

export default function StatementsView({ agents, initialStatements, initialAgentId }: StatementsViewProps) {
  const router = useRouter()
  const [selectedAgentId, setSelectedAgentId] = useState(initialAgentId)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // PAYMENT FORM STATE
  const [paymentForm, setPaymentForm] = useState({
    amountReceived: 0,
    date: new Date().toISOString().split("T")[0],
    paymentMode: "Bank Transfer",
    referenceNumber: "",
    remarks: ""
  })

  // Synchronize component state if URL changes
  useEffect(() => {
    setSelectedAgentId(initialAgentId)
  }, [initialAgentId])

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Handle Agent Change
  const handleAgentChange = (agentId: string) => {
    setSelectedAgentId(agentId)
    router.push(`/statements?agentId=${agentId}`)
  }

  // Get active agent details
  const activeAgent = agents.find((a) => a.id === selectedAgentId) || agents[0]

  // SUBMIT PAYMENT
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAgentId || paymentForm.amountReceived <= 0 || !paymentForm.date) {
      triggerToast("Please fill all required fields correctly")
      return
    }

    const res = await recordPayment({
      agentId: selectedAgentId,
      amountReceived: Number(paymentForm.amountReceived),
      date: paymentForm.date,
      paymentMode: paymentForm.paymentMode,
      referenceNumber: paymentForm.referenceNumber,
      remarks: paymentForm.remarks
    })

    if (res.success) {
      setPaymentForm({
        amountReceived: 0,
        date: new Date().toISOString().split("T")[0],
        paymentMode: "Bank Transfer",
        referenceNumber: "",
        remarks: ""
      })
      triggerToast("Credit payment logged and ledger balance updated!")
      router.refresh()
    } else {
      triggerToast(res.error || "Failed to record payment")
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-4 py-3 rounded-lg shadow-lg border">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Ledger Statements</h1>
          <p className="text-muted-foreground mt-1">Audit running accounts, debit invoice net sums, and credit incoming payments.</p>
        </div>
        
        {/* Agent Selector */}
        <div className="flex items-center border rounded-lg bg-background px-3 py-2 w-full md:w-72 shadow-sm">
          <Users className="h-4.5 w-4.5 text-muted-foreground mr-2 shrink-0" />
          <select
            className="w-full bg-transparent text-sm font-bold focus:outline-none dark:bg-zinc-950"
            value={selectedAgentId}
            onChange={(e) => handleAgentChange(e.target.value)}
          >
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name} ({agent.cityName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeAgent ? (
        <>
          {/* Top Ledger Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-sm hover:shadow transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Outstanding Balance</span>
                <div className="p-1.5 bg-rose-50 dark:bg-rose-950/30 rounded-lg text-rose-600">
                  <DollarSign className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-rose-600 dark:text-rose-500">
                  {activeAgent.outstanding > 0 ? formatCurrency(activeAgent.outstanding) : "₹0"}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">Receivable from agent</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Advance Balance</span>
                <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg text-emerald-500">
                  <Wallet className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">
                  {activeAgent.advanceBalance > 0 ? formatCurrency(activeAgent.advanceBalance) : "₹0"}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">Green ledger deposit balance</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Sales (Debits)</span>
                <div className="p-1.5 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-blue-600">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(activeAgent.totalSales)}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">Total sold cargo value</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Received (Credits)</span>
                <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(activeAgent.totalReceived)}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">Total processed payments</p>
              </CardContent>
            </Card>
          </div>

          {/* Dual Pane Ledger & Payment Form */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Ledger Ledger Table */}
            <Card className="lg:col-span-2 shadow-sm">
              <CardHeader className="border-b pb-4">
                <CardTitle className="text-lg flex items-center gap-1.5">
                  <BookOpen className="h-5 w-5 text-primary" /> Running Ledger Statement
                </CardTitle>
                <CardDescription>
                  Audit ledger transactions for <span className="font-bold text-zinc-900 dark:text-zinc-100">{activeAgent.name}</span>. Negative balance indicates advance funds.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Shipment ID</TableHead>
                      <TableHead className="text-right">Debit (+)</TableHead>
                      <TableHead className="text-right">Credit (-)</TableHead>
                      <TableHead className="text-right">Running Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {initialStatements.length > 0 ? (
                      initialStatements.map((entry) => {
                        const isAdvance = entry.runningBalance < 0
                        return (
                          <TableRow key={entry.id}>
                            <TableCell className="text-xs text-muted-foreground shrink-0">
                              {formatDate(entry.transactionDate)}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  entry.transactionType === "Shipment"
                                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                                    : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                                }`}
                              >
                                {entry.transactionType}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                              {entry.description}
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {entry.shipment?.shipmentNo || "—"}
                            </TableCell>
                            <TableCell className="text-right text-xs font-semibold">
                              {entry.debit > 0 ? formatCurrency(entry.debit) : "—"}
                            </TableCell>
                            <TableCell className="text-right text-xs font-semibold text-emerald-600 dark:text-emerald-500">
                              {entry.credit > 0 ? `-${formatCurrency(entry.credit)}` : "—"}
                            </TableCell>
                            <TableCell
                              className={`text-right font-bold text-xs ${
                                isAdvance
                                  ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20"
                                  : "text-zinc-900 dark:text-zinc-100"
                              }`}
                            >
                              {formatCurrency(entry.runningBalance)}
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                          No transactions recorded. Record a sale to create debits or log payments to create credits.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Right Pane Payment Receipt Panel */}
            <Card className="h-fit shadow-sm">
              <CardHeader className="border-b pb-4">
                <CardTitle className="text-lg flex items-center gap-1.5">
                  <CreditCard className="h-5 w-5 text-emerald-600" /> Enter Payment Received
                </CardTitle>
                <CardDescription>
                  Insert credit transaction directly to decrease agent outstanding ledger.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">
                      Amount Received (INR) *
                    </label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="₹0"
                      value={paymentForm.amountReceived || ""}
                      onChange={(e) =>
                        setPaymentForm({ ...paymentForm, amountReceived: Number(e.target.value) })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">
                      Payment Date *
                    </label>
                    <Input
                      type="date"
                      value={paymentForm.date}
                      onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">
                      Payment Mode
                    </label>
                    <select
                      className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring dark:bg-zinc-950"
                      value={paymentForm.paymentMode}
                      onChange={(e) =>
                        setPaymentForm({ ...paymentForm, paymentMode: e.target.value })
                      }
                    >
                      <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                      <option value="UPI">UPI (GPay/PhonePe/Paytm)</option>
                      <option value="Cheque">Cheque Payment</option>
                      <option value="Cash">Cash Ledger</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">
                      Reference Number (Optional)
                    </label>
                    <Input
                      placeholder="UTR number, Cheque No, etc."
                      value={paymentForm.referenceNumber}
                      onChange={(e) =>
                        setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">
                      Remarks / Notes
                    </label>
                    <textarea
                      placeholder="Enter remarks..."
                      rows={3}
                      className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-950"
                      value={paymentForm.remarks}
                      onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                    />
                  </div>

                  <Button type="submit" className="w-full flex items-center justify-center gap-1.5">
                    <Plus className="h-4 w-4" /> Save Credit Payment
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card className="h-48 flex items-center justify-center text-muted-foreground">
          No agent selected or registered. Create an agent first to view ledgers.
        </Card>
      )}
    </div>
  )
}
