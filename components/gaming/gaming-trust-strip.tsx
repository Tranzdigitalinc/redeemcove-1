import { Download, Refresh, ShieldCheck, Support } from "@/lib/storefront-icons"

const items = [
  { icon: ShieldCheck, label: "Secure Checkout", description: "Every purchase runs through Tebex's encrypted checkout." },
  { icon: Download, label: "Instant Digital Access", description: "Packages and files are delivered immediately after payment." },
  { icon: Refresh, label: "Regular Updates", description: "Products are maintained and updated for the latest server builds." },
  { icon: Support, label: "DistroSource Support", description: "Our team is here if you need help with installation." },
]

export function GamingTrustStrip() {
  return (
    <section className="border-t border-border bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {items.map((item) => (
            <div key={item.label} className="flex flex-col items-start gap-2">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <item.icon size={18} aria-hidden="true" />
              </span>
              <p className="text-sm font-semibold text-foreground">{item.label}</p>
              <p className="text-xs leading-relaxed text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center font-mono text-[11px] text-muted-foreground">
          Gaming payments powered by Tebex.
        </p>
      </div>
    </section>
  )
}
