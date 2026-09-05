import Link from "next/link"
import { getGamingCategoryIcon } from "@/lib/gaming-category-icons"
import type { getGamingCategories } from "@/lib/queries/gaming"

type GamingCategory = Awaited<ReturnType<typeof getGamingCategories>>[number]

/** slug -> route override. FiveM and Minecraft are platform hubs, not filtered category pages. */
function hrefFor(category: GamingCategory) {
  if (category.slug === "fivem") return "/gaming/fivem"
  if (category.slug === "minecraft") return "/gaming/minecraft"
  return `/gaming/products?category=${category.slug}`
}

export function GamingCategoryGrid({
  categories,
  platformCounts,
}: {
  categories: GamingCategory[]
  /** FiveM/Minecraft are platform hubs with no products attached directly — pass real per-platform counts instead. */
  platformCounts?: { fivem: number; minecraft: number }
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Shop by category</h2>
      <p className="mt-1 text-sm text-muted-foreground">Everything for FiveM and Minecraft servers, organized.</p>

      <div className="mt-6 flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-4 sm:gap-4 sm:overflow-visible sm:pb-0 lg:grid-cols-8">
        {categories.map((category) => {
          const Icon = getGamingCategoryIcon(category.slug)
          const count =
            category.slug === "fivem"
              ? platformCounts?.fivem
              : category.slug === "minecraft"
                ? platformCounts?.minecraft
                : category.productCount
          return (
            <Link
              key={category.id}
              href={hrefFor(category)}
              className="flex w-32 shrink-0 flex-col items-center gap-2.5 rounded-lg border border-border bg-card p-4 text-center transition-[border-color,box-shadow] duration-200 hover:border-border-strong hover:shadow-[var(--shadow-e2)] sm:w-full"
            >
              <span className="flex size-11 items-center justify-center rounded-lg bg-secondary text-foreground">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="text-xs font-semibold leading-snug text-foreground">{category.name}</span>
              {count !== undefined && <span className="font-mono text-[10px] text-muted-foreground">{count} products</span>}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
