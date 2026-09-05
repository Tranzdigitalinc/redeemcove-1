"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Filter, X, ICON_SIZE } from "@/lib/storefront-icons"
import { cn } from "@/lib/utils"

const priceOptions = [
  { label: "Under $10", value: "10" },
  { label: "Under $25", value: "25" },
  { label: "Under $50", value: "50" },
]

const platformOptions = [
  { label: "FiveM", value: "fivem" },
  { label: "Minecraft", value: "minecraft" },
  { label: "Cross-Platform", value: "other" },
]

const sortOptions = [
  { label: "Featured", value: "featured" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
]

export interface GamingCategoryOption {
  slug: string
  name: string
}

export function GamingFilters({ categories = [] }: { categories?: GamingCategoryOption[] }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [mobileOpen, setMobileOpen] = useState(false)

  function buildHref(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete("page")
    return `${pathname}?${params.toString()}`
  }

  const get = (k: string) => searchParams.get(k)
  const activePlatform = get("platform")
  const activeCategory = get("category")
  const activeMaxPrice = get("maxPrice")
  const activeSort = get("sort")
  const hasActiveFilters = Boolean(activePlatform || activeCategory || activeMaxPrice)

  return (
    <aside className="flex w-full flex-col gap-3 lg:w-60">
      <button
        type="button"
        onClick={() => setMobileOpen((v) => !v)}
        aria-expanded={mobileOpen}
        aria-controls="gaming-filter-panel"
        className="flex h-11 items-center justify-between rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary lg:hidden"
      >
        <span className="flex items-center gap-2">
          <Filter size={ICON_SIZE.base} aria-hidden="true" />
          Filters
          {hasActiveFilters && <span className="rounded-full bg-foreground px-1.5 py-0.5 text-[10px] font-bold text-background">On</span>}
        </span>
        <span className="text-xs font-medium text-muted-foreground">{mobileOpen ? "Hide" : "Show"}</span>
      </button>

      <div id="gaming-filter-panel" className={cn("rounded-lg border border-border bg-card lg:sticky lg:top-24 lg:block", mobileOpen ? "block" : "hidden")}>
        <div className="flex h-11 items-center justify-between border-b border-border px-4">
          <h2 className="text-sm font-semibold">Filters</h2>
          {hasActiveFilters && (
            <Link href={pathname} className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
              <X size={12} aria-hidden="true" />
              Clear all
            </Link>
          )}
        </div>

        <div className="flex flex-col gap-5 p-4">
          <FilterGroup title="Sort by">
            {sortOptions.map((opt) => (
              <FilterLink key={opt.value} href={buildHref("sort", opt.value)} active={(activeSort ?? "featured") === opt.value} label={opt.label} />
            ))}
          </FilterGroup>

          <FilterGroup title="Platform">
            <FilterLink href={buildHref("platform", null)} active={!activePlatform} label="All platforms" />
            {platformOptions.map((opt) => (
              <FilterLink key={opt.value} href={buildHref("platform", opt.value)} active={activePlatform === opt.value} label={opt.label} />
            ))}
          </FilterGroup>

          {categories.length > 0 && (
            <FilterGroup title="Category">
              <FilterLink href={buildHref("category", null)} active={!activeCategory} label="All categories" />
              {categories.map((cat) => (
                <FilterLink key={cat.slug} href={buildHref("category", cat.slug)} active={activeCategory === cat.slug} label={cat.name} />
              ))}
            </FilterGroup>
          )}

          <FilterGroup title="Price">
            <FilterLink href={buildHref("maxPrice", null)} active={!activeMaxPrice} label="Any price" />
            {priceOptions.map((opt) => (
              <FilterLink key={opt.value} href={buildHref("maxPrice", opt.value)} active={activeMaxPrice === opt.value} label={opt.label} />
            ))}
          </FilterGroup>
        </div>
      </div>
    </aside>
  )
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <h3 className="mb-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{title}</h3>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  )
}

function FilterLink({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={cn(
        "group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active ? "bg-secondary font-medium text-foreground" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
      )}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full transition-colors", active ? "bg-primary" : "bg-transparent group-hover:bg-border-strong")} aria-hidden="true" />
      <span className="truncate">{label}</span>
    </Link>
  )
}
