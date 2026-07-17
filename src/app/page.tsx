import { getDashboardData } from "@/app/actions/erp"
import DashboardView from "@/components/views/DashboardView"

export const revalidate = 0 // Dynamic data loading

export default async function DashboardPage() {
  const result = await getDashboardData()
  
  if (!result.success || !result.data) {
    return (
      <div className="flex h-[50vh] items-center justify-center rounded-xl border border-dashed p-8 text-center">
        <div>
          <h3 className="text-lg font-bold text-destructive">Failed to Load Dashboard</h3>
          <p className="text-sm text-muted-foreground mt-1">{result.error || "Unknown error occurred"}</p>
        </div>
      </div>
    )
  }

  return <DashboardView initialData={result.data} />
}
