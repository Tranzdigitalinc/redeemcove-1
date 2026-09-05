import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { GamingHero } from "@/components/gaming/gaming-hero"
import { GamingProductRail } from "@/components/gaming/gaming-product-rail"
import { GamingTrustStrip } from "@/components/gaming/gaming-trust-strip"
import { getGamingProducts } from "@/lib/queries/gaming"

export const metadata = {
  title: "FiveM Resources — DistroSource Gaming",
  description: "MLOs, scripts, HUDs, and server frameworks for FiveM roleplay servers. Instant delivery, secure Tebex checkout.",
}

export default async function FiveMPage() {
  const [featured, maps, scripts, ui, serverEssentials, latest] = await Promise.all([
    getGamingProducts({ platform: "fivem", featured: true, limit: 6 }),
    getGamingProducts({ platform: "fivem", categorySlug: "maps-environments", limit: 6 }),
    getGamingProducts({ platform: "fivem", categorySlug: "scripts-systems", limit: 6 }),
    getGamingProducts({ platform: "fivem", categorySlug: "ui-hud", limit: 6 }),
    getGamingProducts({ platform: "fivem", categorySlug: "game-server-resources", limit: 6 }),
    getGamingProducts({ platform: "fivem", sort: "newest", limit: 6 }),
  ])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <GamingHero
          eyebrow="DISTROSOURCE GAMING — FIVEM"
          title="Build the roleplay server your players remember."
          description="MLO interiors, gameplay scripts, HUDs, and server frameworks — everything to launch or expand a FiveM roleplay server, ready to drop into your resources folder."
          primaryCta={{ label: "Browse all FiveM products", href: "/gaming/products?platform=fivem" }}
          secondaryCta={{ label: "Explore Minecraft", href: "/gaming/minecraft" }}
        />

        <GamingProductRail title="Featured FiveM Products" href="/gaming/products?platform=fivem&sort=featured" items={featured} />
        <GamingProductRail title="Maps & MLOs" href="/gaming/products?platform=fivem&category=maps-environments" items={maps} />
        <GamingProductRail title="Scripts & Systems" href="/gaming/products?platform=fivem&category=scripts-systems" items={scripts} />
        <GamingProductRail title="UI & HUD" href="/gaming/products?platform=fivem&category=ui-hud" items={ui} />
        <GamingProductRail title="Server Essentials" href="/gaming/products?platform=fivem&category=game-server-resources" items={serverEssentials} />
        <GamingProductRail title="Latest Releases" href="/gaming/products?platform=fivem&sort=newest" items={latest} />

        <GamingTrustStrip />
      </main>
      <SiteFooter />
    </div>
  )
}
