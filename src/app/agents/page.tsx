import { getAgents, getCities } from "@/app/actions/erp"
import AgentsView from "@/components/views/AgentsView"

interface AgentsPageProps {
  searchParams: {
    cityId?: string
  }
}

export const revalidate = 0

export default async function AgentsPage({ searchParams }: AgentsPageProps) {
  const agentsRes = await getAgents(searchParams.cityId)
  const citiesRes = await getCities()

  if (!agentsRes.success || !agentsRes.data || !citiesRes.success || !citiesRes.data) {
    return (
      <div className="flex h-[50vh] items-center justify-center rounded-xl border border-dashed p-8 text-center animate-fade-in">
        <div>
          <h3 className="text-lg font-bold text-destructive">Failed to Load Agents</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {agentsRes.error || citiesRes.error || "Unknown error occurred"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <AgentsView
      initialAgents={agentsRes.data}
      cities={citiesRes.data}
      activeCityId={searchParams.cityId}
    />
  )
}
