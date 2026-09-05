import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { GamingFilters } from "@/components/gaming/gaming-filters"
import { GamingProductGrid } from "@/components/gaming/gaming-product-grid"
import { getGamingCategories, getGamingProducts, getGamingProductsCount, parseGamingProductSort, type GamingPlatform } from "@/lib/queries/gaming"

export const metadata = {
  title: "All Gaming Products — DistroSource Gaming",
  description: "Browse every MLO, script, HUD, map, and server pack for FiveM and Minecraft, all in one catalog.",
}

const FILTER_KEYS = ["q", "platform", "category", "maxPrice"] as const

function parsePlatform(value: string | undefined): GamingPlatform | undefined {
  return value === "fivem" || value === "minecraft" || value === "other" ? value : undefined
}

export default async function GamingProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams
  const filtered = FILTER_KEYS.some((k) => !!params[k])

  const queryOptions = {
    platform: parsePlatform(params.platform),
    categorySlug: params.category,
    search: params.q,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    sort: parseGamingProductSort(params.sort),
  }

  const [categories, totalCount, products] = await Promise.all([
    getGamingCategories(),
    getGamingProductsCount(queryOptions),
    getGamingProducts({ ...queryOptions, limit: 60 }),
  ])

  // FiveM/Minecraft are platform hubs, not filterable product categories.
  const filterableCategories = categories.filter((c) => c.slug !== "fivem" && c.slug !== "minecraft")

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-10">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">DistroSource Gaming</p>
              <h1 className="mt-1 font-display text-3xl font-bold tracking-tight md:text-4xl">
                {params.q ? `Results for "${params.q}"` : "All gaming products"}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                MLOs, scripts, HUDs, maps, and server packs for FiveM and Minecraft — instant delivery via Tebex.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold tabular-nums text-foreground">{totalCount.toLocaleString()}</span> {totalCount === 1 ? "product" : "products"}
            </p>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row">
            <GamingFilters categories={filterableCategories.map((c) => ({ slug: c.slug, name: c.name }))} />
            <div className="min-w-0 flex-1">
              <GamingProductGrid items={products} clearHref={filtered ? "/gaming/products" : undefined} />
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
