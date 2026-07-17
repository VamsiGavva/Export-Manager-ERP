import { getCities } from "@/app/actions/erp"
import CitiesView from "@/components/views/CitiesView"

export const revalidate = 0

export default async function CitiesPage() {
  const result = await getCities()

  if (!result.success || !result.data) {
    return (
      <div className="flex h-[50vh] items-center justify-center rounded-xl border border-dashed p-8 text-center animate-fade-in">
        <div>
          <h3 className="text-lg font-bold text-destructive">Failed to Load Cities</h3>
          <p className="text-sm text-muted-foreground mt-1">{result.error || "Unknown error occurred"}</p>
        </div>
      </div>
    )
  }

  return <CitiesView initialCities={result.data} />
}
