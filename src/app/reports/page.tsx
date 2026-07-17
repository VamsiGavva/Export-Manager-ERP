import { getShipments, getCities, getAgents } from "@/app/actions/erp"
import ReportsView from "@/components/views/ReportsView"

export const revalidate = 0

export default async function ReportsPage() {
  const shipmentsRes = await getShipments()
  const citiesRes = await getCities()
  const agentsRes = await getAgents()

  if (!shipmentsRes.success || !shipmentsRes.data || !citiesRes.success || !citiesRes.data || !agentsRes.success || !agentsRes.data) {
    return (
      <div className="flex h-[50vh] items-center justify-center rounded-xl border border-dashed p-8 text-center animate-fade-in">
        <div>
          <h3 className="text-lg font-bold text-destructive">Failed to Load Reports</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {shipmentsRes.error || citiesRes.error || agentsRes.error || "Unknown error occurred"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <ReportsView
      shipments={shipmentsRes.data}
      cities={citiesRes.data}
      agents={agentsRes.data}
    />
  )
}
