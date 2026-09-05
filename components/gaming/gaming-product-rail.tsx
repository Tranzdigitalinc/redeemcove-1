import Link from "next/link"
import { ArrowRight } from "@/lib/storefront-icons"
import { RevealGroup, RevealItem } from "@/components/motion/reveal"
import { GamingProductCard, type GamingProductCardData } from "@/components/gaming/gaming-product-card"

export function GamingProductRail({
  title,
  subtitle,
  href,
  items,
}: {
  title: string
  subtitle?: string
  href: string
  items: GamingProductCardData[]
}) {
  if (items.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-end justify-between border-b border-border pb-5">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <Link
          href={href}
          className="flex shrink-0 items-center gap-1 border border-border px-3.5 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.04em] text-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          View all
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
      <RevealGroup className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6" stagger={0.05}>
        {items.slice(0, 12).map((item) => (
          <RevealItem key={item.product.id} className="h-full">
            <GamingProductCard item={item} />
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  )
}
