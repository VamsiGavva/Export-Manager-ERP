"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Users, Plus, Edit2, Trash2, Mail, Phone, MapPin, Percent, DollarSign, BookOpen, CheckCircle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { createAgent, updateAgent, deleteAgent } from "@/app/actions/erp"

interface AgentData {
  id: string
  name: string
  cityId: string
  cityName: string
  phone: string | null
  email: string | null
  address: string | null
  commissionType: string
  commissionValue: number
  outstanding: number
  advanceBalance: number
  totalProfit: number
}

interface AgentsViewProps {
  initialAgents: AgentData[]
  cities: { id: string; name: string }[]
  activeCityId?: string
}

export default function AgentsView({ initialAgents, cities, activeCityId }: AgentsViewProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCityFilter, setSelectedCityFilter] = useState(activeCityId || "")
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // DIALOGS STATE
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  // SELECTED AGENT / FORM STATE
  const [selectedAgent, setSelectedAgent] = useState<AgentData | null>(null)
  const [form, setForm] = useState({
    name: "",
    cityId: "",
    phone: "",
    email: "",
    address: "",
    commissionType: "Percentage",
    commissionValue: 0
  })

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // CREATE AGENT
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.cityId || form.commissionValue < 0) return

    const res = await createAgent(
      form.name,
      form.cityId,
      form.phone,
      form.email,
      form.address,
      form.commissionType,
      Number(form.commissionValue)
    )

    if (res.success) {
      setIsAddOpen(false)
      triggerToast("Agent registered successfully!")
      router.refresh()
    } else {
      triggerToast(res.error || "Failed to create agent")
    }
  }

  // UPDATE AGENT
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAgent || !form.name || !form.cityId || form.commissionValue < 0) return

    const res = await updateAgent(
      selectedAgent.id,
      form.name,
      form.cityId,
      form.phone,
      form.email,
      form.address,
      form.commissionType,
      Number(form.commissionValue)
    )

    if (res.success) {
      setIsEditOpen(false)
      setSelectedAgent(null)
      triggerToast("Agent details updated!")
      router.refresh()
    } else {
      triggerToast(res.error || "Failed to update agent")
    }
  }

  // DELETE AGENT
  const handleDeleteConfirm = async () => {
    if (!selectedAgent) return

    const res = await deleteAgent(selectedAgent.id)
    if (res.success) {
      setIsDeleteOpen(false)
      setSelectedAgent(null)
      triggerToast("Agent removed from database")
      router.refresh()
    } else {
      triggerToast(res.error || "Failed to delete agent")
    }
  }

  // Filtering Logic
  const filteredAgents = initialAgents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (agent.email && agent.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (agent.phone && agent.phone.includes(searchQuery))
    
    const matchesCity = selectedCityFilter ? agent.cityId === selectedCityFilter : true
    
    return matchesSearch && matchesCity
  })

  const openAddModal = () => {
    setForm({
      name: "",
      cityId: cities[0]?.id || "",
      phone: "",
      email: "",
      address: "",
      commissionType: "Percentage",
      commissionValue: 0
    })
    setIsAddOpen(true)
  }

  const openEditModal = (agent: AgentData) => {
    setSelectedAgent(agent)
    setForm({
      name: agent.name,
      cityId: agent.cityId,
      phone: agent.phone || "",
      email: agent.email || "",
      address: agent.address || "",
      commissionType: agent.commissionType,
      commissionValue: agent.commissionValue
    })
    setIsEditOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-4 py-3 rounded-lg shadow-lg border animate-fade-in">
          <CheckCircle className="h-4 w-4 text-emerald-500 mr-2 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Agents Registry</h1>
          <p className="text-muted-foreground mt-1">Manage broker information, commission structures, and outstanding statement balances.</p>
        </div>
        <Button onClick={openAddModal} className="flex items-center gap-1.5 shadow-md">
          <Plus className="h-4 w-4" /> Add New Agent
        </Button>
      </div>

      {/* Filters Card */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center border rounded-lg bg-background px-3 py-1.5 max-w-sm">
            <Users className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search agents by name or phone..."
              className="w-full bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="w-full md:w-56 flex items-center border rounded-lg bg-background px-3 py-1.5">
            <MapPin className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
            <select
              className="w-full bg-transparent text-sm focus:outline-none dark:bg-zinc-950"
              value={selectedCityFilter}
              onChange={(e) => {
                setSelectedCityFilter(e.target.value)
                if (e.target.value) {
                  router.push(`/agents?cityId=${e.target.value}`)
                } else {
                  router.push("/agents")
                }
              }}
            >
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Agents Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent Name</TableHead>
                <TableHead>City / Region</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Commission Rate</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
                <TableHead className="text-right">Advance Bal.</TableHead>
                <TableHead className="text-right">Profit Contrib.</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgents.length > 0 ? (
                filteredAgents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell className="font-bold">{agent.name}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-muted-foreground text-xs">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                        {agent.cityName}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs space-y-0.5">
                      {agent.phone && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="h-3 w-3 shrink-0" /> {agent.phone}
                        </div>
                      )}
                      {agent.email && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Mail className="h-3 w-3 shrink-0" /> {agent.email}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className="inline-flex items-center gap-1 rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 font-medium">
                        {agent.commissionType === "Percentage" && <Percent className="h-3 w-3" />}
                        {agent.commissionType !== "Percentage" && <DollarSign className="h-3 w-3" />}
                        {agent.commissionValue}
                        {agent.commissionType === "Percentage" && "%"}
                        {agent.commissionType === "PerBag" && "/bag"}
                        {agent.commissionType === "Fixed" && " Fixed"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-rose-600 dark:text-rose-500">
                      {agent.outstanding > 0 ? formatCurrency(agent.outstanding) : "—"}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-emerald-600 dark:text-emerald-500">
                      {agent.advanceBalance > 0 ? formatCurrency(agent.advanceBalance) : "—"}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-zinc-700 dark:text-zinc-300">
                      {formatCurrency(agent.totalProfit)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/statements?agentId=${agent.id}`)}
                          title="Ledger Statement"
                          className="h-8 w-8 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                        >
                          <BookOpen className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(agent)}
                          className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedAgent(agent)
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
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    No agents matching the filters were found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* -------------------------------------------------------------
          DIALOG: ADD AGENT
          ------------------------------------------------------------- */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Register New Agent</DialogTitle>
            <DialogDescription>Create an agent profile and assign their commission schema.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Agent Name</label>
              <Input
                placeholder="e.g. ABC Traders"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Target City</label>
              <select
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring dark:bg-zinc-950"
                value={form.cityId}
                onChange={(e) => setForm({ ...form, cityId: e.target.value })}
                required
              >
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Phone Number</label>
              <Input
                placeholder="e.g. 9876543210"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Email Address</label>
              <Input
                type="email"
                placeholder="e.g. agent@domain.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Office Address</label>
              <Input
                placeholder="e.g. APMC Mandi, Vashi"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Commission Type</label>
              <select
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring dark:bg-zinc-950"
                value={form.commissionType}
                onChange={(e) => setForm({ ...form, commissionType: e.target.value })}
              >
                <option value="Percentage">Percentage (%)</option>
                <option value="Fixed">Fixed Amount (INR)</option>
                <option value="PerBag">Per Bag (INR/Bag)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Commission Value
                {form.commissionType === "Percentage" && " (%)"}
                {form.commissionType === "Fixed" && " (₹)"}
                {form.commissionType === "PerBag" && " (₹/Bag)"}
              </label>
              <Input
                type="number"
                min="0"
                step="any"
                placeholder="0"
                value={form.commissionValue || ""}
                onChange={(e) => setForm({ ...form, commissionValue: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose onClick={() => setIsAddOpen(false)}>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Register Agent</Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* -------------------------------------------------------------
          DIALOG: EDIT AGENT
          ------------------------------------------------------------- */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Modify Agent Details</DialogTitle>
            <DialogDescription>Modify agent phone, address, or commission structure variables.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Agent Name</label>
              <Input
                placeholder="e.g. ABC Traders"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Target City</label>
              <select
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring dark:bg-zinc-950"
                value={form.cityId}
                onChange={(e) => setForm({ ...form, cityId: e.target.value })}
                required
              >
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Phone Number</label>
              <Input
                placeholder="e.g. 9876543210"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Email Address</label>
              <Input
                type="email"
                placeholder="e.g. agent@domain.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Office Address</label>
              <Input
                placeholder="e.g. APMC Mandi, Vashi"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Commission Type</label>
              <select
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring dark:bg-zinc-950"
                value={form.commissionType}
                onChange={(e) => setForm({ ...form, commissionType: e.target.value })}
              >
                <option value="Percentage">Percentage (%)</option>
                <option value="Fixed">Fixed Amount (INR)</option>
                <option value="PerBag">Per Bag (INR/Bag)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Commission Value
                {form.commissionType === "Percentage" && " (%)"}
                {form.commissionType === "Fixed" && " (₹)"}
                {form.commissionType === "PerBag" && " (₹/Bag)"}
              </label>
              <Input
                type="number"
                min="0"
                step="any"
                placeholder="0"
                value={form.commissionValue || ""}
                onChange={(e) => setForm({ ...form, commissionValue: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose onClick={() => {
              setIsEditOpen(false)
              setSelectedAgent(null)
            }}>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* -------------------------------------------------------------
          DIALOG: DELETE CONFIRMATION
          ------------------------------------------------------------- */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <div className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-destructive">Remove Agent Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-bold text-zinc-900 dark:text-zinc-100">{selectedAgent?.name}</span>?
              All statements ledger history and sold items links will be wiped out from the system. This cannot be reversed.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose onClick={() => {
              setIsDeleteOpen(false)
              setSelectedAgent(null)
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
