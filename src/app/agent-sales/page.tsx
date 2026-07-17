import { getShipments } from "@/app/actions/erp"
import AgentSalesView from "@/components/views/AgentSalesView"

export const revalidate = 0

export default async function AgentSalesPage() {
  const shipmentsRes = await getShipments()

  if (!shipmentsRes.success || !shipmentsRes.data) {
    return (
      <div className="flex h-[50vh] items-center justify-center rounded-xl border border-dashed p-8 text-center animate-fade-in">
        <div>
          <h3 className="text-lg font-bold text-destructive">Failed to Load Sales</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {shipmentsRes.error || "Unknown error occurred"}
          </p>
        </div>
      </div>
    )
  }

  return <AgentSalesView initialShipments={shipmentsRes.data} />
}
