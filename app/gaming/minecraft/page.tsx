import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { GamingHero } from "@/components/gaming/gaming-hero"
import { GamingProductRail } from "@/components/gaming/gaming-product-rail"
import { GamingTrustStrip } from "@/components/gaming/gaming-trust-strip"
import { getGamingProducts } from "@/lib/queries/gaming"

export const metadata = {
  title: "Minecraft Resources — DistroSource Gaming",
  description: "Maps, server packs, resource packs, and server configurations for Minecraft servers. Instant delivery, secure Tebex checkout.",
}

export default async function MinecraftPage() {
  const [maps, serverPacks, resourcePacks, serverConfigs, interfaces, bundles, latest] = await Promise.all([
    getGamingProducts({ platform: "minecraft", categorySlug: "maps-environments", limit: 6 }),
    getGamingProducts({ platform: "minecraft", categorySlug: "game-server-resources", featured: true, limit: 6 }),
    getGamingProducts({ platform: "minecraft", categorySlug: "textures-graphics", limit: 6 }),
    getGamingProducts({ platform: "minecraft", categorySlug: "game-server-resources", limit: 6 }),
    getGamingProducts({ platform: "minecraft", categorySlug: "ui-hud", limit: 6 }),
    getGamingProducts({ platform: "minecraft", categorySlug: "gaming-packs", limit: 6 }),
    getGamingProducts({ platform: "minecraft", sort: "newest", limit: 6 }),
  ])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <GamingHero
          eyebrow="DISTROSOURCE GAMING — MINECRAFT"
          title="Launch a Minecraft server players actually stay on."
          description="Custom maps, server packs, resource packs, and branded interfaces — everything to launch or grow a Minecraft server, ready to drop onto your server."
          primaryCta={{ label: "Browse all Minecraft products", href: "/gaming/products?platform=minecraft" }}
          secondaryCta={{ label: "Explore FiveM", href: "/gaming/fivem" }}
        />

        <GamingProductRail title="Maps" href="/gaming/products?platform=minecraft&category=maps-environments" items={maps} />
        <GamingProductRail title="Server Packs" href="/gaming/products?platform=minecraft&category=game-server-resources&sort=featured" items={serverPacks} />
        <GamingProductRail title="Resource Packs" href="/gaming/products?platform=minecraft&category=textures-graphics" items={resourcePacks} />
        <GamingProductRail title="Server Configurations" href="/gaming/products?platform=minecraft&category=game-server-resources" items={serverConfigs} />
        <GamingProductRail title="Interfaces" href="/gaming/products?platform=minecraft&category=ui-hud" items={interfaces} />
        <GamingProductRail title="Starter Bundles" href="/gaming/products?platform=minecraft&category=gaming-packs" items={bundles} />
        <GamingProductRail title="Latest Releases" href="/gaming/products?platform=minecraft&sort=newest" items={latest} />

        <GamingTrustStrip />
      </main>
      <SiteFooter />
    </div>
  )
}
