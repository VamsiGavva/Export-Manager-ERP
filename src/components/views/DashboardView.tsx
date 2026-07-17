"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Ship,
  TrendingUp,
  DollarSign,
  Briefcase,
  AlertCircle,
  Plus,
  ArrowUpRight,
  ChevronRight,
  UserCheck,
  CheckCircle2,
  Calendar,
  X
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { createShipment, recordSale } from "@/app/actions/erp"

interface DashboardViewProps {
  initialData: {
    summary: {
      totalShipments: number
      totalInvestment: number
      totalSales: number
      totalProfit: number
      pendingAmount: number
      advanceAmount: number
    }
    recentShipments: any[]
    profitGraphData: any[]
    cityPerformance: any[]
    agentPerformance: any[]
  }
}

export default function DashboardView({ initialData }: DashboardViewProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  
  // MODALS STATE
  const [isShipmentModalOpen, setIsShipmentModalOpen] = useState(false)
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false)

  // NEW SHIPMENT FORM STATE
  const [shipmentForm, setShipmentForm] = useState({
    shipmentNo: "",
    cityId: "",
    agentId: "",
    product: "",
    purchasePrice: 0,
    labourPrice: 0,
    bags: 0,
    lorryCharges: 0,
    otherCharges: 0
  })

  // SALE FORM STATE
  const [selectedShipmentId, setSelectedShipmentId] = useState("")
  const [saleForm, setSaleForm] = useState({
    sellingPrice: 0,
    bagsSold: 0
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-generate Shipment Number on open
  const openNewShipmentModal = () => {
    const nextNum = Math.floor(100 + Math.random() * 900)
    setShipmentForm({
      shipmentNo: `SHP${nextNum}`,
      cityId: initialData.cityPerformance[0]?.id || "",
      agentId: "",
      product: "",
      purchasePrice: 0,
      labourPrice: 0,
      bags: 0,
      lorryCharges: 0,
      otherCharges: 0
    })
    setIsShipmentModalOpen(true)
  }

  // Pre-fill agentId when city changes
  useEffect(() => {
    if (shipmentForm.cityId) {
      const filteredAgents = initialData.agentPerformance.filter(
        (a) => a.cityId === shipmentForm.cityId
      )
      setShipmentForm((prev) => ({
        ...prev,
        agentId: filteredAgents[0]?.id || ""
      }))
    }
  }, [shipmentForm.cityId, initialData.agentPerformance])

  // New Shipment Calculations
  const purchaseCost = shipmentForm.purchasePrice * shipmentForm.bags
  const labourCost = shipmentForm.labourPrice * shipmentForm.bags
  const totalInvestmentCalc = purchaseCost + labourCost + Number(shipmentForm.lorryCharges) + Number(shipmentForm.otherCharges)
  const breakEvenPriceCalc = shipmentForm.bags > 0 ? totalInvestmentCalc / shipmentForm.bags : 0

  // Sale Calculations
  const targetShipment = initialData.recentShipments.find(s => s.id === selectedShipmentId)
  const targetAgent = targetShipment?.agent
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
  const profitCalc = targetShipment ? netSaleCalc - targetShipment.totalInvestment : 0

  // Toast Helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  // SUBMIT SHIPMENT
  const handleShipmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shipmentForm.cityId || !shipmentForm.agentId || !shipmentForm.product || shipmentForm.bags <= 0) {
      triggerToast("Please fill all required fields correctly")
      return
    }

    const res = await createShipment({
      shipmentNo: shipmentForm.shipmentNo,
      cityId: shipmentForm.cityId,
      agentId: shipmentForm.agentId,
      product: shipmentForm.product,
      purchasePrice: Number(shipmentForm.purchasePrice),
      labourPrice: Number(shipmentForm.labourPrice),
      bags: Number(shipmentForm.bags),
      lorryCharges: Number(shipmentForm.lorryCharges),
      otherCharges: Number(shipmentForm.otherCharges)
    })

    if (res.success) {
      setIsShipmentModalOpen(false)
      triggerToast("Shipment registered successfully!")
      router.refresh()
    } else {
      triggerToast(res.error || "Failed to create shipment")
    }
  }

  // SUBMIT SALE
  const handleSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedShipmentId || saleForm.sellingPrice <= 0 || saleForm.bagsSold <= 0) {
      triggerToast("Please fill all required fields correctly")
      return
    }

    const res = await recordSale({
      shipmentId: selectedShipmentId,
      sellingPrice: Number(saleForm.sellingPrice),
      bagsSold: Number(saleForm.bagsSold)
    })

    if (res.success) {
      setIsSaleModalOpen(false)
      triggerToast("Sale recorded and statement entry created!")
      router.refresh()
    } else {
      triggerToast(res.error || "Failed to record sale")
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-4 py-3 rounded-lg shadow-lg border animate-bounce">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Greeting and Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Enterprise ERP Dashboard</h1>
          <p className="text-muted-foreground mt-1">Real-time financial status, shipment logs, and metrics.</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button onClick={openNewShipmentModal} className="flex items-center gap-1.5 shadow-md">
            <Plus className="h-4 w-4" /> New Shipment
          </Button>
          <Button
            onClick={() => {
              const waiting = initialData.recentShipments.find(s => s.status === "Waiting for Sale")
              if (waiting) {
                setSelectedShipmentId(waiting.id)
                setSaleForm({ sellingPrice: 0, bagsSold: waiting.bags })
                setIsSaleModalOpen(true)
              } else {
                triggerToast("No shipments waiting for sale right now!")
              }
            }}
            variant="outline"
            className="flex items-center gap-1.5 border-blue-200 text-blue-700 dark:border-blue-900 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950"
          >
            <TrendingUp className="h-4 w-4" /> Enter Agent Sale
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Shipments</span>
            <div className="p-1.5 bg-blue-50 dark:bg-blue-950/50 rounded-lg text-blue-600">
              <Ship className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{initialData.summary.totalShipments}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Total registered trips</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Investment</span>
            <div className="p-1.5 bg-blue-50 dark:bg-blue-950/50 rounded-lg text-blue-600">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(initialData.summary.totalInvestment)}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Total procurement cost</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Total Sales</span>
            <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg text-indigo-600">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(initialData.summary.totalSales)}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Net shipment revenues</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Total Profit</span>
            <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">
              {formatCurrency(initialData.summary.totalProfit)}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Profits realized from sales</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Outstanding</span>
            <div className="p-1.5 bg-amber-50 dark:bg-amber-950/50 rounded-lg text-amber-600">
              <AlertCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-500">
              {formatCurrency(initialData.summary.pendingAmount)}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Due from agents</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Advance Bal.</span>
            <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg text-emerald-500">
              <UserCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(initialData.summary.advanceAmount)}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Negative running balance</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts & Sidebars */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profit Curve */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Realized Profit & Sales Trend</CardTitle>
            <CardDescription>Daily profit timeline derived from ledger sales entries</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {mounted && initialData.profitGraphData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={initialData.profitGraphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="date" tickLine={false} style={{ fontSize: 11, fill: "gray" }} />
                  <YAxis tickLine={false} style={{ fontSize: 11, fill: "gray" }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8 }}
                    formatter={(val: number) => [formatCurrency(val), ""]}
                  />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    stroke="#2563eb"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#profitGrad)"
                    name="Profit realized"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No graphic data points available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Panel */}
        <Card className="flex flex-col justify-between">
          <div>
            <CardHeader>
              <CardTitle className="text-lg">ERP Quick Actions</CardTitle>
              <CardDescription>Navigate and execute transactions quickly</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button onClick={openNewShipmentModal} className="w-full justify-start text-left flex items-center gap-3 h-11">
                <div className="p-1 bg-white/20 rounded">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold text-xs leading-none">New Shipment</div>
                  <span className="text-[10px] text-primary-foreground/70">Register outgoing load</span>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  const waiting = initialData.recentShipments.find(s => s.status === "Waiting for Sale")
                  if (waiting) {
                    setSelectedShipmentId(waiting.id)
                    setSaleForm({ sellingPrice: 0, bagsSold: waiting.bags })
                    setIsSaleModalOpen(true)
                  } else {
                    triggerToast("No shipments waiting for sale right now!")
                  }
                }}
                className="w-full justify-start text-left flex items-center gap-3 h-11 border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800"
              >
                <div className="p-1 bg-blue-100 text-blue-700 rounded dark:bg-blue-950 dark:text-blue-400">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold text-xs leading-none text-zinc-900 dark:text-zinc-100">Enter Agent Sale</div>
                  <span className="text-[10px] text-muted-foreground">Log bags sold & calculate commission</span>
                </div>
              </Button>

              <Link href="/statements" className="w-full">
                <Button
                  variant="outline"
                  className="w-full justify-start text-left flex items-center gap-3 h-11 border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800"
                >
                  <div className="p-1 bg-emerald-100 text-emerald-700 rounded dark:bg-emerald-950 dark:text-emerald-400">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs leading-none text-zinc-900 dark:text-zinc-100">Statements Ledger</div>
                    <span className="text-[10px] text-muted-foreground">Access running ledger list</span>
                  </div>
                </Button>
              </Link>

              <Link href="/reports" className="w-full">
                <Button
                  variant="outline"
                  className="w-full justify-start text-left flex items-center gap-3 h-11 border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800"
                >
                  <div className="p-1 bg-purple-100 text-purple-700 rounded dark:bg-purple-950 dark:text-purple-400">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs leading-none text-zinc-900 dark:text-zinc-100">Financial Reports</div>
                    <span className="text-[10px] text-muted-foreground">Export Excel or PDF tables</span>
                  </div>
                </Button>
              </Link>
            </CardContent>
          </div>

          <div className="border-t p-6 bg-zinc-50 dark:bg-zinc-950/20 rounded-b-xl flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Database status:</span>
            <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span> Live & Connected
            </span>
          </div>
        </Card>
      </div>

      {/* Recent Shipments Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Recent Shipments Table */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Shipments Log</CardTitle>
              <CardDescription>Status, load size, and profitability metrics</CardDescription>
            </div>
            <Link href="/shipments">
              <Button size="sm" variant="ghost" className="text-xs text-blue-600 hover:text-blue-800">
                View All <ChevronRight className="h-3 w-3 ml-0.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shipment No</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Bags</TableHead>
                  <TableHead>Investment</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialData.recentShipments.slice(0, 5).map((shp) => (
                  <TableRow key={shp.id}>
                    <TableCell className="font-bold">{shp.shipmentNo}</TableCell>
                    <TableCell>{shp.product}</TableCell>
                    <TableCell className="text-muted-foreground">{shp.agent.name}</TableCell>
                    <TableCell>{shp.bags}</TableCell>
                    <TableCell>{formatCurrency(shp.totalInvestment)}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                          shp.status === "Sold"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                        }`}
                      >
                        {shp.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* City and Agent summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Cities</CardTitle>
            <CardDescription>Summary of profits city-wise</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {initialData.cityPerformance.slice(0, 4).map((city) => (
              <div key={city.id} className="flex justify-between items-center border-b pb-2 last:border-b-0 last:pb-0">
                <div>
                  <div className="font-semibold text-sm">{city.name}</div>
                  <span className="text-[10px] text-muted-foreground">{city.agentsCount} agents | {city.shipmentsCount} shipments</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm text-emerald-600 dark:text-emerald-500">
                    {formatCurrency(city.totalProfit)}
                  </div>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Profit realized</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* -------------------------------------------------------------
          MODAL: REGISTER NEW SHIPMENT
          ------------------------------------------------------------- */}
      <Dialog open={isShipmentModalOpen} onOpenChange={setIsShipmentModalOpen}>
        <form onSubmit={handleShipmentSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Register New Shipment</DialogTitle>
            <DialogDescription>
              Create outbound cargo list. Investment calculations are live.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Shipment No</label>
              <Input
                value={shipmentForm.shipmentNo}
                onChange={(e) => setShipmentForm({ ...shipmentForm, shipmentNo: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Product Name</label>
              <Input
                placeholder="e.g. Potatoes"
                value={shipmentForm.product}
                onChange={(e) => setShipmentForm({ ...shipmentForm, product: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Target City</label>
              <select
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring dark:bg-zinc-950"
                value={shipmentForm.cityId}
                onChange={(e) => setShipmentForm({ ...shipmentForm, cityId: e.target.value })}
              >
                {initialData.cityPerformance.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Target Agent</label>
              <select
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring dark:bg-zinc-950"
                value={shipmentForm.agentId}
                onChange={(e) => setShipmentForm({ ...shipmentForm, agentId: e.target.value })}
                required
              >
                <option value="">Select Agent...</option>
                {initialData.agentPerformance
                  .filter((a) => a.cityId === shipmentForm.cityId)
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.commissionType})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Total Bags</label>
              <Input
                type="number"
                min="1"
                placeholder="0"
                value={shipmentForm.bags || ""}
                onChange={(e) => setShipmentForm({ ...shipmentForm, bags: Number(e.target.value) })}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Purchase Cost / Bag</label>
              <Input
                type="number"
                min="0"
                placeholder="₹0"
                value={shipmentForm.purchasePrice || ""}
                onChange={(e) => setShipmentForm({ ...shipmentForm, purchasePrice: Number(e.target.value) })}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Labour Charges / Bag</label>
              <Input
                type="number"
                min="0"
                placeholder="₹0"
                value={shipmentForm.labourPrice || ""}
                onChange={(e) => setShipmentForm({ ...shipmentForm, labourPrice: Number(e.target.value) })}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Lorry Charges</label>
              <Input
                type="number"
                min="0"
                placeholder="₹0"
                value={shipmentForm.lorryCharges || ""}
                onChange={(e) => setShipmentForm({ ...shipmentForm, lorryCharges: Number(e.target.value) })}
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Other Charges</label>
              <Input
                type="number"
                min="0"
                placeholder="₹0"
                value={shipmentForm.otherCharges || ""}
                onChange={(e) => setShipmentForm({ ...shipmentForm, otherCharges: Number(e.target.value) })}
              />
            </div>
          </div>

          {/* Real-time Calculation Panel */}
          <div className="bg-muted/40 border rounded-lg p-3 space-y-1.5 text-xs">
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-primary" /> Live Calculation Summary
            </h4>
            <div className="grid grid-cols-2 gap-2 text-muted-foreground pt-1 border-t">
              <div>Bags Count: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{shipmentForm.bags}</span></div>
              <div>Purchase Sum: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{formatCurrency(purchaseCost)}</span></div>
              <div>Labour Sum: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{formatCurrency(labourCost)}</span></div>
              <div>Other Fees: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{formatCurrency(Number(shipmentForm.lorryCharges) + Number(shipmentForm.otherCharges))}</span></div>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-sm mt-1">
              <span className="text-zinc-900 dark:text-zinc-100">Total Investment:</span>
              <span className="text-primary">{formatCurrency(totalInvestmentCalc)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Break-even Price Per Bag:</span>
              <span className="font-semibold">{formatCurrency(breakEvenPriceCalc)} / Bag</span>
            </div>
          </div>

          <DialogFooter>
            <DialogClose onClick={() => setIsShipmentModalOpen(false)}>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save Shipment</Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* -------------------------------------------------------------
          MODAL: RECORD AGENT SALE
          ------------------------------------------------------------- */}
      <Dialog open={isSaleModalOpen} onOpenChange={setIsSaleModalOpen}>
        <form onSubmit={handleSaleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Enter Agent Sale Entry</DialogTitle>
            <DialogDescription>
              Process sale for shipments waiting to be sold. Ledger debit automatically calculates.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Select Shipment</label>
              <select
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring dark:bg-zinc-950"
                value={selectedShipmentId}
                onChange={(e) => {
                  const val = e.target.value
                  setSelectedShipmentId(val)
                  const target = initialData.recentShipments.find(s => s.id === val)
                  if (target) {
                    setSaleForm({ sellingPrice: 0, bagsSold: target.bags })
                  }
                }}
                required
              >
                <option value="">Choose Shipment...</option>
                {initialData.recentShipments
                  .filter((s) => s.status === "Waiting for Sale")
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.shipmentNo} - {s.product} ({s.bags} bags, Agent: {s.agent.name})
                    </option>
                  ))}
              </select>
            </div>

            {targetShipment && (
              <>
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Bags Sold</label>
                    <Input
                      type="number"
                      max={targetShipment.bags}
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

                {/* Calculation breakdown */}
                <div className="bg-muted/40 border rounded-lg p-3 space-y-1.5 text-xs">
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> Sales Ledger Preview
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-muted-foreground pt-1 border-t">
                    <div>Gross Sale: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{formatCurrency(saleAmountCalc)}</span></div>
                    <div>Agent Commission: <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {formatCurrency(commissionCalc)} ({targetAgent?.commissionType}: {targetAgent?.commissionValue}{targetAgent?.commissionType === "Percentage" ? "%" : ""})
                    </span></div>
                    <div>Total Investment: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{formatCurrency(targetShipment.totalInvestment)}</span></div>
                    <div>Break-even Price: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{formatCurrency(targetShipment.breakEvenPrice)} / Bag</span></div>
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
              </>
            )}
          </div>

          <DialogFooter>
            <DialogClose onClick={() => setIsSaleModalOpen(false)}>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={!selectedShipmentId}>Record Sale & Debit Ledger</Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  )
}
