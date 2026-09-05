import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { GamingHero } from "@/components/gaming/gaming-hero"
import { GamingCategoryGrid } from "@/components/gaming/gaming-category-grid"
import { GamingProductRail } from "@/components/gaming/gaming-product-rail"
import { GamingTrustStrip } from "@/components/gaming/gaming-trust-strip"
import { getFeaturedGamingProducts, getGamingCategories, getGamingProducts, getGamingProductsCount } from "@/lib/queries/gaming"

export const metadata = {
  title: "DistroSource Gaming — FiveM & Minecraft Resources",
  description:
    "Shop MLOs, scripts, HUDs, maps, and server packs for FiveM and Minecraft. Instant delivery, secure Tebex checkout.",
}

export default async function GamingHubPage() {
  const [categories, featured, fivemCount, minecraftCount, newest] = await Promise.all([
    getGamingCategories(),
    getFeaturedGamingProducts(6),
    getGamingProductsCount({ platform: "fivem" }),
    getGamingProductsCount({ platform: "minecraft" }),
    getGamingProducts({ sort: "newest", limit: 6 }),
  ])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <GamingHero
          title="Everything your server needs, all in one place."
          description="MLOs, scripts, HUDs, maps, and server packs for FiveM and Minecraft — built by DistroSource, delivered instantly through secure Tebex checkout."
          primaryCta={{ label: "Browse all products", href: "/gaming/products" }}
          secondaryCta={{ label: "Explore FiveM", href: "/gaming/fivem" }}
        />

        <GamingCategoryGrid categories={categories} platformCounts={{ fivem: fivemCount, minecraft: minecraftCount }} />

        <GamingProductRail title="Featured this week" href="/gaming/products?sort=featured" items={featured} />
        <GamingProductRail title="Latest releases" href="/gaming/products?sort=newest" items={newest} />

        <GamingTrustStrip />
      </main>
      <SiteFooter />
    </div>
  )
}
