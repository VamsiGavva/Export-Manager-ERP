"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { TrendingUp, AlertCircle, Search, Calendar, DollarSign, Percent, CheckCircle, Ship, Plus } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { recordSale } from "@/app/actions/erp"

interface ShipmentData {
  id: string
  shipmentNo: string
  cityId: string
  city: { name: string }
  agentId: string
  agent: { name: string; commissionType: string; commissionValue: number }
  product: string
  purchasePrice: number
  labourPrice: number
  bags: number
  lorryCharges: number
  otherCharges: number
  totalInvestment: number
  breakEvenPrice: number
  status: string
  createdAt: Date
  sale?: {
    id: string
    sellingPrice: number
    bagsSold: number
    saleAmount: number
    commission: number
    netSale: number
    profit: number
    soldAt: Date
  } | null
}

interface AgentSalesViewProps {
  initialShipments: ShipmentData[]
}

export default function AgentSalesView({ initialShipments }: AgentSalesViewProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"completed" | "pending">("completed")
  const [searchQuery, setSearchQuery] = useState("")
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  
  // MODALS STATE
  const [isSaleOpen, setIsSaleOpen] = useState(false)
  const [selectedShipment, setSelectedShipment] = useState<ShipmentData | null>(null)

  // SALE FORM STATE
  const [saleForm, setSaleForm] = useState({
    sellingPrice: 0,
    bagsSold: 0
  })

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Live Calculations
  const targetAgent = selectedShipment?.agent
  const saleAmountCalc = saleForm.sellingPrice * saleForm.bagsSold
  let commissionCalc = 0
  if (targetAgent) {
    if (targetAgent.commissionType === "Percentage") {
      commissionCalc = saleAmountCalc * (targetAgent.commissionValue / 100)
    } else if (targetAgent.commissionType === "Fixed") {
      commissionCalc = targetAgent.commissionValue
    } else if (targetAgent.commissionType === "PerBag") {
      commissionCalc = targetAgent.commissionValue * saleForm.bagsSold
    }
  }
  const netSaleCalc = saleAmountCalc - commissionCalc
  const profitCalc = selectedShipment ? netSaleCalc - selectedShipment.totalInvestment : 0

  const handleSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedShipment || saleForm.sellingPrice <= 0 || saleForm.bagsSold <= 0) return

    const res = await recordSale({
      shipmentId: selectedShipment.id,
      sellingPrice: Number(saleForm.sellingPrice),
      bagsSold: Number(saleForm.bagsSold)
    })

    if (res.success) {
      setIsSaleOpen(false)
      setSelectedShipment(null)
      triggerToast("Sale entry recorded & Statement Debit created!")
      router.refresh()
    } else {
      triggerToast(res.error || "Failed to record sale")
    }
  }

  // Filter lists based on tab and query
  const completedSalesList = initialShipments.filter(
    (s) => s.status === "Sold" && s.sale
  )
  const pendingSalesList = initialShipments.filter(
    (s) => s.status === "Waiting for Sale"
  )

  const activeList = activeTab === "completed" ? completedSalesList : pendingSalesList

  const filteredList = activeList.filter((item) =>
    item.shipmentNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.agent.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-4 py-3 rounded-lg shadow-lg border animate-fade-in">
          <CheckCircle className="h-4 w-4 text-emerald-500 mr-2 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Agent Sales Entries</h1>
          <p className="text-muted-foreground mt-1">Record sale figures, deduct agent commission rates, and track net profits.</p>
        </div>
      </div>

      {/* Tabs and search bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Visual Tabs */}
        <div className="flex bg-muted/60 p-1.5 rounded-lg border">
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${
              activeTab === "completed"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Completed Sales ({completedSalesList.length})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${
              activeTab === "pending"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Pending Sales ({pendingSalesList.length})
          </button>
        </div>

        {/* Search */}
        <div className="w-full md:w-80 flex items-center border rounded-lg bg-background px-3 py-1.5">
          <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search by shipment, agent or product..."
            className="w-full bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Sales List Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shipment No</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Product</TableHead>
                {activeTab === "completed" ? (
                  <>
                    <TableHead>Bags Sold</TableHead>
                    <TableHead>Selling Price</TableHead>
                    <TableHead>Gross Amount</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Net Amount</TableHead>
                    <TableHead>Realized Profit</TableHead>
                    <TableHead>Sold Date</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead>Total Bags</TableHead>
                    <TableHead>Total Investment</TableHead>
                    <TableHead>Break-even Price</TableHead>
                    <TableHead>Registered Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredList.length > 0 ? (
                filteredList.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-bold">{item.shipmentNo}</TableCell>
                    <TableCell>{item.agent.name}</TableCell>
                    <TableCell className="font-semibold text-zinc-900 dark:text-zinc-100">{item.product}</TableCell>
                    
                    {activeTab === "completed" && item.sale ? (
                      <>
                        <TableCell>{item.sale.bagsSold}</TableCell>
                        <TableCell>{formatCurrency(item.sale.sellingPrice)}</TableCell>
                        <TableCell>{formatCurrency(item.sale.saleAmount)}</TableCell>
                        <TableCell>
                          <span className="text-xs text-rose-600 dark:text-rose-500 font-medium">
                            -{formatCurrency(item.sale.commission)}
                          </span>
                        </TableCell>
                        <TableCell className="font-bold text-zinc-900 dark:text-zinc-100">
                          {formatCurrency(item.sale.netSale)}
                        </TableCell>
                        <TableCell
                          className={`font-semibold ${
                            item.sale.profit < 0
                              ? "text-destructive"
                              : "text-emerald-600 dark:text-emerald-500"
                          }`}
                        >
                          {formatCurrency(item.sale.profit)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(item.sale.soldAt)}
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{item.bags}</TableCell>
                        <TableCell>{formatCurrency(item.totalInvestment)}</TableCell>
                        <TableCell>{formatCurrency(item.breakEvenPrice)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(item.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedShipment(item)
                              setSaleForm({ sellingPrice: 0, bagsSold: item.bags })
                              setIsSaleOpen(true)
                            }}
                            className="h-8 text-xs flex items-center gap-1 shadow-sm"
                          >
                            <TrendingUp className="h-3.5 w-3.5" /> Record Sale
                          </Button>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={activeTab === "completed" ? 10 : 8}
                    className="h-32 text-center text-muted-foreground"
                  >
                    No shipments found matching the filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* -------------------------------------------------------------
          DIALOG: RECORD SALE ENTRY
          ------------------------------------------------------------- */}
      <Dialog open={isSaleOpen} onOpenChange={setIsSaleOpen}>
        <form onSubmit={handleSaleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Enter Sale Details for {selectedShipment?.shipmentNo}</DialogTitle>
            <DialogDescription>
              Record bags sold and pricing. Commission and ledger debit details will compute live.
            </DialogDescription>
          </DialogHeader>

          {selectedShipment && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Bags Sold</label>
                  <Input
                    type="number"
                    max={selectedShipment.bags}
                    min="1"
                    value={saleForm.bagsSold || ""}
                    onChange={(e) => setSaleForm({ ...saleForm, bagsSold: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Selling Price / Bag</label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="₹0"
                    value={saleForm.sellingPrice || ""}
                    onChange={(e) => setSaleForm({ ...saleForm, sellingPrice: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              {/* Calculations preview */}
              <div className="bg-muted/40 border rounded-lg p-3 space-y-1.5 text-xs">
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> Sales Ledger Preview
                </h4>
                <div className="grid grid-cols-2 gap-2 text-muted-foreground pt-1 border-t">
                  <div>Gross Sale: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{formatCurrency(saleAmountCalc)}</span></div>
                  <div>Agent Commission: <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {formatCurrency(commissionCalc)} ({targetAgent?.commissionType}: {targetAgent?.commissionValue}{targetAgent?.commissionType === "Percentage" ? "%" : ""})
                  </span></div>
                  <div>Total Investment: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{formatCurrency(selectedShipment.totalInvestment)}</span></div>
                  <div>Break-even Price: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{formatCurrency(selectedShipment.breakEvenPrice)} / Bag</span></div>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-sm mt-1">
                  <span className="text-zinc-900 dark:text-zinc-100">Debit (Net Sale to Agent):</span>
                  <span className="text-primary">{formatCurrency(netSaleCalc)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-emerald-600 dark:text-emerald-500">
                  <span>Expected Profit:</span>
                  <span className={profitCalc < 0 ? "text-destructive" : ""}>
                    {formatCurrency(profitCalc)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <DialogClose onClick={() => {
              setIsSaleOpen(false)
              setSelectedShipment(null)
            }}>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Record Sale & Debit Ledger</Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  )
}
