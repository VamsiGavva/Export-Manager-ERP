"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Ship, Plus, Search, MapPin, Users, Filter, CheckCircle, Trash2, Calendar, TrendingUp } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { createShipment, deleteShipment, recordSale } from "@/app/actions/erp"

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
  } | null
}

interface ShipmentsViewProps {
  initialShipments: ShipmentData[]
  cities: { id: string; name: string }[]
  agents: any[]
}

export default function ShipmentsView({ initialShipments, cities, agents }: ShipmentsViewProps) {
  const router = useRouter()
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // FILTER STATES
  const [searchQuery, setSearchQuery] = useState("")
  const [cityFilter, setCityFilter] = useState("")
  const [agentFilter, setAgentFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  // MODALS STATE
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isSaleOpen, setIsSaleOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedShipment, setSelectedShipment] = useState<ShipmentData | null>(null)

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
  const [saleForm, setSaleForm] = useState({
    sellingPrice: 0,
    bagsSold: 0
  })

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Pre-fill agent selections when city changes in Add Form
  useEffect(() => {
    if (shipmentForm.cityId) {
      const filteredAgents = agents.filter((a) => a.cityId === shipmentForm.cityId)
      setShipmentForm((prev) => ({
        ...prev,
        agentId: filteredAgents[0]?.id || ""
      }))
    }
  }, [shipmentForm.cityId, agents])

  const openAddModal = () => {
    const nextNum = Math.floor(100 + Math.random() * 900)
    setShipmentForm({
      shipmentNo: `SHP${nextNum}`,
      cityId: cities[0]?.id || "",
      agentId: "",
      product: "",
      purchasePrice: 0,
      labourPrice: 0,
      bags: 0,
      lorryCharges: 0,
      otherCharges: 0
    })
    setIsAddOpen(true)
  }

  // Live Calculations for new shipment
  const purchaseCost = shipmentForm.purchasePrice * shipmentForm.bags
  const labourCost = shipmentForm.labourPrice * shipmentForm.bags
  const totalInvestmentCalc = purchaseCost + labourCost + Number(shipmentForm.lorryCharges) + Number(shipmentForm.otherCharges)
  const breakEvenPriceCalc = shipmentForm.bags > 0 ? totalInvestmentCalc / shipmentForm.bags : 0

  // Live Calculations for sale entry
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

  // SUBMIT NEW SHIPMENT
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shipmentForm.cityId || !shipmentForm.agentId || !shipmentForm.product || shipmentForm.bags <= 0) return

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
      setIsAddOpen(false)
      triggerToast("Shipment registered successfully!")
      router.refresh()
    } else {
      triggerToast(res.error || "Failed to create shipment")
    }
  }

  // SUBMIT SALE ENTRY
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
      triggerToast("Sale recorded & ledger entry created successfully!")
      router.refresh()
    } else {
      triggerToast(res.error || "Failed to save sale details")
    }
  }

  // CONFIRM DELETE
  const handleDeleteConfirm = async () => {
    if (!selectedShipment) return

    const res = await deleteShipment(selectedShipment.id)
    if (res.success) {
      setIsDeleteOpen(false)
      setSelectedShipment(null)
      triggerToast("Shipment deleted successfully")
      router.refresh()
    } else {
      triggerToast(res.error || "Failed to delete shipment")
    }
  }

  // Filtering Logic
  const filteredShipments = initialShipments.filter((shp) => {
    const matchesSearch =
      shp.shipmentNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shp.product.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCity = cityFilter ? shp.cityId === cityFilter : true
    const matchesAgent = agentFilter ? shp.agentId === agentFilter : true
    const matchesStatus = statusFilter ? shp.status === statusFilter : true

    return matchesSearch && matchesCity && matchesAgent && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-4 py-3 rounded-lg shadow-lg border animate-fade-in">
          <CheckCircle className="h-4 w-4 text-emerald-500 mr-2 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Shipments Logistics</h1>
          <p className="text-muted-foreground mt-1">Monitor transport investment, break-even targets, and sales completions.</p>
        </div>
        <Button onClick={openAddModal} className="flex items-center gap-1.5 shadow-md">
          <Plus className="h-4 w-4" /> Register Shipment
        </Button>
      </div>

      {/* Multi-Filter Card */}
      <Card>
        <CardContent className="p-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center border rounded-lg bg-background px-3 py-1.5">
            <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search shipment number or product..."
              className="w-full bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center border rounded-lg bg-background px-3 py-1.5">
            <MapPin className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
            <select
              className="w-full bg-transparent text-sm focus:outline-none dark:bg-zinc-950"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
            >
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center border rounded-lg bg-background px-3 py-1.5">
            <Users className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
            <select
              className="w-full bg-transparent text-sm focus:outline-none dark:bg-zinc-950"
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
            >
              <option value="">All Agents</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center border rounded-lg bg-background px-3 py-1.5">
            <Filter className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
            <select
              className="w-full bg-transparent text-sm focus:outline-none dark:bg-zinc-950"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Waiting for Sale">Waiting for Sale</option>
              <option value="Sold">Sold</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Shipments Log */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shipment No</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Bags</TableHead>
                <TableHead>Total Investment</TableHead>
                <TableHead>Break-even / Bag</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShipments.length > 0 ? (
                filteredShipments.map((shp) => (
                  <TableRow key={shp.id}>
                    <TableCell className="font-bold">{shp.shipmentNo}</TableCell>
                    <TableCell>{shp.product}</TableCell>
                    <TableCell>{shp.city.name}</TableCell>
                    <TableCell>
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">{shp.agent.name}</div>
                      {shp.sale && (
                        <div className="text-[10px] text-muted-foreground mt-0.5 whitespace-nowrap">
                          Sold @ {formatCurrency(shp.sale.sellingPrice)}/bag (Net: {formatCurrency(shp.sale.netSale)})
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{shp.bags}</TableCell>
                    <TableCell>{formatCurrency(shp.totalInvestment)}</TableCell>
                    <TableCell>{formatCurrency(shp.breakEvenPrice)}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          shp.status === "Sold"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                        }`}
                      >
                        {shp.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 shrink-0" />
                        {formatDate(shp.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {shp.status === "Waiting for Sale" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedShipment(shp)
                              setSaleForm({ sellingPrice: 0, bagsSold: shp.bags })
                              setIsSaleOpen(true)
                            }}
                            className="h-8 text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-950/30"
                          >
                            <TrendingUp className="h-3.5 w-3.5 mr-1" /> Sell
                          </Button>
                        ) : (
                          shp.sale && (
                            shp.sale.profit >= 0 ? (
                              <div className="text-xs text-emerald-600 dark:text-emerald-500 font-semibold px-2 py-1 select-none">
                                Profit: {formatCurrency(shp.sale.profit)}
                              </div>
                            ) : (
                              <div className="text-xs text-rose-600 dark:text-rose-500 font-semibold px-2 py-1 select-none">
                                Loss: {formatCurrency(Math.abs(shp.sale.profit))}
                              </div>
                            )
                          )
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedShipment(shp)
                            setIsDeleteOpen(true)
                          }}
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="h-32 text-center text-muted-foreground">
                    No shipments found. Click &apos;Register Shipment&apos; to add one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* -------------------------------------------------------------
          DIALOG: ADD SHIPMENT
          ------------------------------------------------------------- */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Register Outgoing Shipment</DialogTitle>
            <DialogDescription>
              Register outbound cargo list. Cost and break-even math update live.
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
                placeholder="e.g. Red Onions"
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
                {cities.map((city) => (
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
                {agents
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
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Purchase Price / Bag</label>
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
              <div>Bags: <span className="font-semibold text-zinc-850 dark:text-zinc-150">{shipmentForm.bags}</span></div>
              <div>Purchase Sum: <span className="font-semibold text-zinc-850 dark:text-zinc-150">{formatCurrency(purchaseCost)}</span></div>
              <div>Labour Sum: <span className="font-semibold text-zinc-850 dark:text-zinc-150">{formatCurrency(labourCost)}</span></div>
              <div>Other Sum: <span className="font-semibold text-zinc-850 dark:text-zinc-150">{formatCurrency(Number(shipmentForm.lorryCharges) + Number(shipmentForm.otherCharges))}</span></div>
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
            <DialogClose onClick={() => setIsAddOpen(false)}>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save Shipment</Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* -------------------------------------------------------------
          DIALOG: RECORD AGENT SALE
          ------------------------------------------------------------- */}
      <Dialog open={isSaleOpen} onOpenChange={setIsSaleOpen}>
        <form onSubmit={handleSaleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Enter Sale details for {selectedShipment?.shipmentNo}</DialogTitle>
            <DialogDescription>
              Record pricing and quantity. Commissions and ledger transactions will calculate live.
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
                  <div>Gross Sale: <span className="font-semibold text-zinc-805 dark:text-zinc-195">{formatCurrency(saleAmountCalc)}</span></div>
                  <div>Agent Commission: <span className="font-semibold text-zinc-805 dark:text-zinc-195">
                    {formatCurrency(commissionCalc)} ({targetAgent?.commissionType}: {targetAgent?.commissionValue}{targetAgent?.commissionType === "Percentage" ? "%" : ""})
                  </span></div>
                  <div>Total Investment: <span className="font-semibold text-zinc-805 dark:text-zinc-195">{formatCurrency(selectedShipment.totalInvestment)}</span></div>
                  <div>Break-even Price: <span className="font-semibold text-zinc-805 dark:text-zinc-195">{formatCurrency(selectedShipment.breakEvenPrice)} / Bag</span></div>
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

      {/* -------------------------------------------------------------
          DIALOG: DELETE CONFIRMATION
          ------------------------------------------------------------- */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <div className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-destructive">Remove Shipment Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete shipment <span className="font-bold text-zinc-900 dark:text-zinc-100">{selectedShipment?.shipmentNo}</span>?
              All associated sold data or ledger entries will be permanently removed.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose onClick={() => {
              setIsDeleteOpen(false)
              setSelectedShipment(null)
            }}>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleDeleteConfirm} variant="destructive">Confirm Delete</Button>
          </DialogFooter>
        </div>
      </Dialog>
    </div>
  )
}
