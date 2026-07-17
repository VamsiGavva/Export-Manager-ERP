"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Plus, Edit2, Trash2, Globe, Users, Ship, ExternalLink, CheckCircle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { createCity, updateCity, deleteCity } from "@/app/actions/erp"

interface CityData {
  id: string
  name: string
  country: string
  agentsCount: number
  shipmentsCount: number
  totalProfit: number
}

interface CitiesViewProps {
  initialCities: CityData[]
}

export default function CitiesView({ initialCities }: CitiesViewProps) {
  const router = useRouter()
  const [cities, setCities] = useState<CityData[]>(initialCities)
  const [searchQuery, setSearchQuery] = useState("")
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // DIALOG STATES
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  // ACTIVE CITY SELECTIONS
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null)
  const [formName, setFormName] = useState("")
  const [formCountry, setFormCountry] = useState("")

  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // CREATE CITY
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName || !formCountry) return

    const res = await createCity(formName, formCountry)
    if (res.success) {
      setIsAddOpen(false)
      setFormName("")
      setFormCountry("")
      triggerToast("City added successfully!")
      router.refresh()
    } else {
      triggerToast(res.error || "Failed to create city")
    }
  }

  // UPDATE CITY
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCity || !formName || !formCountry) return

    const res = await updateCity(selectedCity.id, formName, formCountry)
    if (res.success) {
      setIsEditOpen(false)
      setSelectedCity(null)
      triggerToast("City details updated!")
      router.refresh()
    } else {
      triggerToast(res.error || "Failed to update city")
    }
  }

  // DELETE CITY
  const handleDeleteConfirm = async () => {
    if (!selectedCity) return

    const res = await deleteCity(selectedCity.id)
    if (res.success) {
      setIsDeleteOpen(false)
      setSelectedCity(null)
      triggerToast("City deleted successfully")
      router.refresh()
    } else {
      triggerToast(res.error || "Failed to delete city")
    }
  }

  // Filter cities by search query
  const filteredCities = initialCities.filter((city) =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    city.country.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
          <h1 className="text-3xl font-extrabold tracking-tight">Cities & Territories</h1>
          <p className="text-muted-foreground mt-1">Manage global export destinations, agents count, and region profit status.</p>
        </div>
        <Button onClick={() => {
          setFormName("")
          setFormCountry("")
          setIsAddOpen(true)
        }} className="flex items-center gap-1.5 shadow-md">
          <Plus className="h-4 w-4" /> Add New City
        </Button>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center max-w-sm border rounded-lg bg-background px-3 py-1.5">
            <MapPin className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search by city or country..."
              className="w-full bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Cities Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>City Name</TableHead>
                <TableHead>Country</TableHead>
                <TableHead className="text-center">Active Agents</TableHead>
                <TableHead className="text-center">Total Shipments</TableHead>
                <TableHead className="text-right">Region Profit</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCities.length > 0 ? (
                filteredCities.map((city) => (
                  <TableRow key={city.id} className="group">
                    <TableCell className="font-bold">
                      <span className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary shrink-0" />
                        {city.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Globe className="h-3.5 w-3.5 shrink-0" />
                        {city.country}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
                        <Users className="h-3 w-3" /> {city.agentsCount} Agents
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center gap-1 rounded bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        <Ship className="h-3 w-3" /> {city.shipmentsCount} Shipments
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-emerald-600 dark:text-emerald-500">
                      {formatCurrency(city.totalProfit)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            router.push(`/agents?cityId=${city.id}`)
                          }}
                          title="Open Agents List"
                          className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedCity(city)
                            setFormName(city.name)
                            setFormCountry(city.country)
                            setIsEditOpen(true)
                          }}
                          className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedCity(city)
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
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No cities found. Click &apos;Add New City&apos; to register one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* -------------------------------------------------------------
          DIALOG: ADD CITY
          ------------------------------------------------------------- */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Add New City</DialogTitle>
            <DialogDescription>Create a geographic target region for shipments.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">City Name</label>
              <Input
                placeholder="e.g. Vashi, Mumbai"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Country</label>
              <Input
                placeholder="e.g. India"
                value={formCountry}
                onChange={(e) => setFormCountry(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose onClick={() => setIsAddOpen(false)}>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Create City</Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* -------------------------------------------------------------
          DIALOG: EDIT CITY
          ------------------------------------------------------------- */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Modify City details</DialogTitle>
            <DialogDescription>Update city name or country parameters.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">City Name</label>
              <Input
                placeholder="e.g. Mumbai"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Country</label>
              <Input
                placeholder="e.g. India"
                value={formCountry}
                onChange={(e) => setFormCountry(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose onClick={() => {
              setIsEditOpen(false)
              setSelectedCity(null)
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
            <DialogTitle className="text-destructive flex items-center gap-1.5">
              Confirm Delete Action
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-bold text-zinc-900 dark:text-zinc-100">{selectedCity?.name}</span>?
              All associated agents, statements, and shipments records will be deleted permanently. This cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose onClick={() => {
              setIsDeleteOpen(false)
              setSelectedCity(null)
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
