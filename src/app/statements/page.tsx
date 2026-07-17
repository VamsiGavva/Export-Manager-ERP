import { getAgents, getStatements } from "@/app/actions/erp"
import StatementsView from "@/components/views/StatementsView"

interface StatementsPageProps {
  searchParams: {
    agentId?: string
  }
}

export const revalidate = 0

export default async function StatementsPage({ searchParams }: StatementsPageProps) {
  const agentsRes = await getAgents()
  
  let initialStatements: any[] = []
  let selectedAgentId = searchParams.agentId || ""

  if (agentsRes.success && agentsRes.data && agentsRes.data.length > 0) {
    if (!selectedAgentId) {
      selectedAgentId = agentsRes.data[0].id
    }
    const statementsRes = await getStatements(selectedAgentId)
    if (statementsRes.success && statementsRes.data) {
      initialStatements = statementsRes.data
    }
  }

  if (!agentsRes.success || !agentsRes.data) {
    return (
      <div className="flex h-[50vh] items-center justify-center rounded-xl border border-dashed p-8 text-center animate-fade-in">
        <div>
          <h3 className="text-lg font-bold text-destructive">Failed to Load Ledger</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {agentsRes.error || "Unknown error occurred"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <StatementsView
      agents={agentsRes.data}
      initialStatements={initialStatements}
      initialAgentId={selectedAgentId}
    />
  )
}
