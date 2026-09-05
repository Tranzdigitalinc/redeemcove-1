import Link from "next/link"
import { Package } from "@/lib/storefront-icons"
import { GamingProductCard, type GamingProductCardData } from "@/components/gaming/gaming-product-card"

export function GamingProductGrid({
  items,
  clearHref,
  emptyState,
}: {
  items: GamingProductCardData[]
  clearHref?: string
  emptyState?: { title: string; description: string }
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card/50 px-6 py-16 text-center">
        <Package size={32} className="text-muted-foreground/50" aria-hidden="true" />
        <p className="text-sm font-semibold text-foreground">{emptyState?.title ?? "No products match your filters"}</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          {emptyState?.description ?? "Try adjusting or clearing your filters to see more DistroSource Gaming products."}
        </p>
        {clearHref && (
          <Link href={clearHref} className="text-sm font-semibold text-primary hover:underline">
            Clear filters
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <GamingProductCard key={item.product.id} item={item} />
      ))}
    </div>
  )
}
