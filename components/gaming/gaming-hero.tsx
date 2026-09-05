import Link from "next/link"
import { ArrowRight, ShieldCheck } from "@/lib/storefront-icons"
import { Button } from "@/components/ui/button"

export function GamingHero({
  eyebrow = "DISTROSOURCE GAMING",
  title,
  description,
  primaryCta,
  secondaryCta,
}: {
  eyebrow?: string
  title: string
  description: string
  primaryCta?: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
}) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-navy">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08] [mask-image:radial-gradient(120%_90%_at_50%_0%,black,transparent_72%)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--navy-foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--navy-foreground) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-primary">{eyebrow}</p>
        <h1 className="mt-3 max-w-2xl font-display text-4xl font-black leading-[1.05] tracking-tight text-navy-foreground text-balance sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-navy-foreground/70 text-pretty sm:text-lg">
          {description}
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          {primaryCta && (
            <Button size="lg" render={<Link href={primaryCta.href} />} nativeButton={false} className="h-11 font-semibold">
              {primaryCta.label}
              <ArrowRight size={16} aria-hidden="true" />
            </Button>
          )}
          {secondaryCta && (
            <Button
              size="lg"
              variant="outline"
              render={<Link href={secondaryCta.href} />}
              nativeButton={false}
              className="h-11 border-navy-foreground/20 bg-transparent font-semibold text-navy-foreground hover:bg-navy-foreground/10"
            >
              {secondaryCta.label}
            </Button>
          )}
        </div>

        <p className="mt-6 flex items-center gap-1.5 font-mono text-[11px] text-navy-foreground/50">
          <ShieldCheck size={13} aria-hidden="true" />
          Gaming payments powered by Tebex — secure, instant delivery
        </p>
      </div>
    </section>
  )
}
