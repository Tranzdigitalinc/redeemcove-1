import Link from "next/link"
import Image from "next/image"
import { ImageOff } from "@/lib/storefront-icons"
import { PriceDisplay } from "@/components/price-display"
import { Badge } from "@/components/ui/badge"
import type { getGamingProducts } from "@/lib/queries/gaming"

export type GamingProductCardData = Awaited<ReturnType<typeof getGamingProducts>>[number]

const PLATFORM_LABEL: Record<string, string> = {
  fivem: "FiveM",
  minecraft: "Minecraft",
  other: "Cross-Platform",
}

/** The one product card used across DistroSource Gaming (hub, platform pages, catalog). */
export function GamingProductCard({ item, className }: { item: GamingProductCardData; className?: string }) {
  const href = `/gaming/product/${item.product.slug}`
  const image = item.product.coverImageUrl ?? item.images[0]?.url ?? item.product.thumbnailUrl ?? null
  const price = Number.parseFloat(item.product.price)
  const compareAt = item.product.compareAtPrice ? Number.parseFloat(item.product.compareAtPrice) : null
  const isOnSale = compareAt !== null && compareAt > price
  const savingsPercent = isOnSale && compareAt ? Math.round(((compareAt - price) / compareAt) * 100) : 0

  return (
    <article className={`group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-[border-color,box-shadow] duration-200 hover:border-border-strong hover:shadow-[var(--shadow-e2)] ${className ?? ""}`}>
      <Link href={href} className="relative block aspect-[4/3] w-full overflow-hidden bg-secondary/60" tabIndex={-1} aria-hidden="true">
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-muted-foreground/40">
            <ImageOff size={32} aria-hidden="true" />
          </span>
        )}

        <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
          <span className="rounded bg-navy px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-navy-foreground">
            {PLATFORM_LABEL[item.product.platform] ?? item.product.platform}
          </span>
          {item.product.isNew && (
            <span className="rounded bg-success px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-success-foreground">New</span>
          )}
          {isOnSale && savingsPercent > 0 && (
            <span className="rounded bg-primary px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-primary-foreground">−{savingsPercent}%</span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <p className="truncate font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
          {item.category.name}
        </p>

        <h3 className="line-clamp-2 text-[13.5px] font-semibold leading-snug text-foreground">
          <Link href={href} className="transition-colors after:absolute after:inset-0 hover:text-primary focus-visible:outline-none">
            {item.product.name}
          </Link>
        </h3>

        <p className="mt-auto truncate pt-1 text-xs text-muted-foreground">{item.product.tagline}</p>

        {(item.product.isBestseller || item.product.isUpdated) && (
          <div className="flex gap-1.5">
            {item.product.isBestseller && <Badge variant="secondary" className="text-[10px]">Bestseller</Badge>}
            {item.product.isUpdated && <Badge variant="outline" className="text-[10px]">Updated</Badge>}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-1.5 border-t border-border px-3.5 py-2.5">
        <div className="flex min-w-0 items-baseline gap-1.5 overflow-hidden">
          <span className="truncate font-display text-base font-bold tabular-nums text-foreground">
            <PriceDisplay usdAmount={price} />
          </span>
          {isOnSale && compareAt && (
            <span className="hidden shrink-0 text-xs text-muted-foreground line-through sm:inline">
              <PriceDisplay usdAmount={compareAt} />
            </span>
          )}
        </div>
        <Link
          href={href}
          className="relative z-10 flex h-8 shrink-0 items-center justify-center rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        >
          View
        </Link>
      </div>
    </article>
  )
}
