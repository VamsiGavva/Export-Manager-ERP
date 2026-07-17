"use client"

import React, { useState } from "react"
import { BarChart3, FileSpreadsheet, Printer, Search, Calendar, MapPin, Users, Filter, TrendingUp, DollarSign } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ReportsViewProps {
  shipments: any[]
  cities: { id: string; name: string }[]
  agents: any[]
}

export default function ReportsView({ shipments, cities, agents }: ReportsViewProps) {
  // FILTER STATES
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedAgent, setSelectedAgent] = useState("")
  const [selectedProduct, setSelectedProduct] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")

  // Filter shipments based on selection
  const filteredShipments = shipments.filter((shp) => {
    const shpDate = new Date(shp.createdAt).toISOString().split("T")[0]
    
    const matchesStartDate = startDate ? shpDate >= startDate : true
    const matchesEndDate = endDate ? shpDate <= endDate : true
    const matchesCity = selectedCity ? shpDate && shp.cityId === selectedCity : true
    const matchesAgent = selectedAgent ? shp.agentId === selectedAgent : true
    const matchesProduct = selectedProduct ? shp.product.toLowerCase() === selectedProduct.toLowerCase() : true
    const matchesStatus = selectedStatus ? shp.status === selectedStatus : true

    return matchesStartDate && matchesEndDate && matchesCity && matchesAgent && matchesProduct && matchesStatus
  })

  // Get unique products lists for filtering
  const uniqueProducts = Array.from(new Set(shipments.map((s) => s.product)))

  // Aggregates math
  let totalInvestment = 0
  let totalSales = 0
  let totalCommission = 0
  let totalProfit = 0

  filteredShipments.forEach((shp) => {
    totalInvestment += shp.totalInvestment
    if (shp.sale) {
      totalSales += shp.sale.netSale
      totalCommission += shp.sale.commission
      totalProfit += shp.sale.profit
    }
  })

  // Outstanding/Advance sum calculations (filtered by agent filter)
  let totalOutstanding = 0
  let totalAdvance = 0

  const activeAgentsForLedgerSum = selectedAgent
    ? agents.filter((a) => a.id === selectedAgent)
    : selectedCity
    ? agents.filter((a) => a.cityId === selectedCity)
    : agents

  activeAgentsForLedgerSum.forEach((agent) => {
    totalOutstanding += agent.outstanding
    totalAdvance += agent.advanceBalance
  })

  // EXPORT EXCEL (CSV Format)
  const handleExportCSV = () => {
    const headers = [
      "Shipment No",
      "Date",
      "City",
      "Agent",
      "Product",
      "Bags",
      "Total Investment",
      "Sale Amount",
      "Commission",
      "Net Sale",
      "Profit",
      "Status"
    ]

    const rows = filteredShipments.map((shp) => [
      shp.shipmentNo,
      new Date(shp.createdAt).toLocaleDateString(),
      shp.city.name,
      shp.agent.name,
      shp.product,
      shp.bags,
      shp.totalInvestment,
      shp.sale ? shp.sale.saleAmount : "—",
      shp.sale ? shp.sale.commission : "—",
      shp.sale ? shp.sale.netSale : "—",
      shp.sale ? shp.sale.profit : "—",
      shp.status
    ])

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `ERP_Financial_Report_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // PRINT / SAVE TO PDF
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          aside, nav, .no-print, button, header, .breadcrumbs {
            display: none !important;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 no-print">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Financial Reports</h1>
          <p className="text-muted-foreground mt-1">Export transaction statements, inspect transport profits, and filter registry data.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportCSV} variant="outline" className="flex items-center gap-1.5 border-zinc-200">
            <BarChart3 className="h-4 w-4" /> Excel (CSV)
          </Button>
          <Button onClick={handlePrint} className="flex items-center gap-1.5 shadow-md">
            <Printer className="h-4 w-4" /> Print / Save PDF
          </Button>
        </div>
      </div>

      {/* Report Filter Card */}
      <Card className="no-print">
        <CardContent className="p-5 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          <div>
            <label className="text-[10px] font-bold text-muted-foreground block mb-1 uppercase tracking-wider">Start Date</label>
            <div className="flex items-center border rounded px-2.5 py-1">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
              <input
                type="date"
                className="w-full bg-transparent text-xs focus:outline-none dark:bg-zinc-950"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-muted-foreground block mb-1 uppercase tracking-wider">End Date</label>
            <div className="flex items-center border rounded px-2.5 py-1">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
              <input
                type="date"
                className="w-full bg-transparent text-xs focus:outline-none dark:bg-zinc-950"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-muted-foreground block mb-1 uppercase tracking-wider">City</label>
            <div className="flex items-center border rounded px-2.5 py-1">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
              <select
                className="w-full bg-transparent text-xs focus:outline-none dark:bg-zinc-950"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-muted-foreground block mb-1 uppercase tracking-wider">Agent</label>
            <div className="flex items-center border rounded px-2.5 py-1">
              <Users className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
              <select
                className="w-full bg-transparent text-xs focus:outline-none dark:bg-zinc-950"
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
              >
                <option value="">All Agents</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-muted-foreground block mb-1 uppercase tracking-wider">Product</label>
            <div className="flex items-center border rounded px-2.5 py-1">
              <Filter className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
              <select
                className="w-full bg-transparent text-xs focus:outline-none dark:bg-zinc-950"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
              >
                <option value="">All Products</option>
                {uniqueProducts.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-muted-foreground block mb-1 uppercase tracking-wider">Status</label>
            <div className="flex items-center border rounded px-2.5 py-1">
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
              <select
                className="w-full bg-transparent text-xs focus:outline-none dark:bg-zinc-950"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Waiting for Sale">Waiting for Sale</option>
                <option value="Sold">Sold</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Printable Report Wrapper */}
      <div className="print-area space-y-6">
        {/* Print Header (Only visible on print stylesheet) */}
        <div className="hidden print:block border-b pb-4">
          <h1 className="text-2xl font-bold">ERP Financial Statement Report</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Export Manager ERP — Generated on {new Date().toLocaleString()}
          </p>
          <div className="mt-2 text-xs text-zinc-700 space-y-0.5">
            {startDate && <div>Start Date: {startDate}</div>}
            {endDate && <div>End Date: {endDate}</div>}
            {selectedCity && <div>Filtered City: {cities.find(c => c.id === selectedCity)?.name}</div>}
            {selectedAgent && <div>Filtered Agent: {agents.find(a => a.id === selectedAgent)?.name}</div>}
          </div>
        </div>

        {/* Aggregates Dashboard Grid */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-6">
          <Card className="p-4 shadow-sm">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Investment</span>
            <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1">
              {formatCurrency(totalInvestment)}
            </div>
          </Card>

          <Card className="p-4 shadow-sm">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Net Sales</span>
            <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1">
              {formatCurrency(totalSales)}
            </div>
          </Card>

          <Card className="p-4 shadow-sm">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Agent Comm.</span>
            <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1 text-rose-600 dark:text-rose-500">
              {formatCurrency(totalCommission)}
            </div>
          </Card>

          <Card className="p-4 shadow-sm">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Net Profits</span>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-500 mt-1">
              {formatCurrency(totalProfit)}
            </div>
          </Card>

          <Card className="p-4 shadow-sm">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Total Outstanding</span>
            <div className="text-lg font-bold text-rose-600 dark:text-rose-500 mt-1">
              {formatCurrency(totalOutstanding)}
            </div>
          </Card>

          <Card className="p-4 shadow-sm">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Total Advance</span>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-500 mt-1">
              {formatCurrency(totalAdvance)}
            </div>
          </Card>
        </div>

        {/* Detailed Table */}
        <Card className="shadow-sm">
          <CardHeader className="no-print">
            <CardTitle className="text-lg">Filtered Ledger Itemization</CardTitle>
            <CardDescription>Matching shipments details and profit metrics</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shipment</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Bags</TableHead>
                  <TableHead>Investment</TableHead>
                  <TableHead>Net Sale</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Profit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShipments.length > 0 ? (
                  filteredShipments.map((shp) => (
                    <TableRow key={shp.id} className="text-xs">
                      <TableCell className="font-bold">{shp.shipmentNo}</TableCell>
                      <TableCell className="text-muted-foreground">{shp.agent.name}</TableCell>
                      <TableCell>{shp.city.name}</TableCell>
                      <TableCell className="font-semibold">{shp.product}</TableCell>
                      <TableCell>{shp.bags}</TableCell>
                      <TableCell>{formatCurrency(shp.totalInvestment)}</TableCell>
                      <TableCell>{shp.sale ? formatCurrency(shp.sale.netSale) : "—"}</TableCell>
                      <TableCell className="text-rose-600 dark:text-rose-500">
                        {shp.sale ? formatCurrency(shp.sale.commission) : "—"}
                      </TableCell>
                      <TableCell
                        className={`font-semibold ${
                          shp.sale && shp.sale.profit < 0
                            ? "text-destructive"
                            : shp.sale
                            ? "text-emerald-600 dark:text-emerald-500"
                            : ""
                        }`}
                      >
                        {shp.sale ? formatCurrency(shp.sale.profit) : "—"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                            shp.status === "Sold"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                          }`}
                        >
                          {shp.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-[10px]">
                        {formatDate(shp.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={11} className="h-32 text-center text-muted-foreground">
                      No records match the current filter criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
