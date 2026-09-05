"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, ImageOff, ShoppingCart, Trash, ICON_SIZE } from "@/lib/storefront-icons"
import { PriceDisplay } from "@/components/price-display"
import { Button } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useGamingCart } from "@/lib/use-gaming-cart"

export function GamingCartTrigger() {
  const { items, remove, count } = useGamingCart()

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" aria-label={`Gaming cart, ${count} saved item${count === 1 ? "" : "s"}`} className="relative" />
        }
      >
        <ShoppingCart size={ICON_SIZE.nav} aria-hidden="true" />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {count}
          </span>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="flex w-[88vw] max-w-sm flex-col gap-0 border-l border-border bg-background p-0">
        <SheetHeader className="border-b border-border px-5 pb-4 pt-6 text-left">
          <SheetTitle>Gaming Cart</SheetTitle>
          <p className="text-xs text-muted-foreground">
            Save items here, then checkout separately for each one on Tebex.
          </p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Your gaming cart is empty.</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((item) => (
                <li key={item.slug} className="flex gap-3 rounded-lg border border-border p-3">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-secondary/60">
                    {item.thumbnailUrl ? (
                      <Image src={item.thumbnailUrl} alt="" fill className="object-cover" sizes="64px" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                        <ImageOff size={20} aria-hidden="true" />
                      </span>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <Link href={`/gaming/product/${item.slug}`} className="line-clamp-2 text-sm font-semibold text-foreground hover:text-primary">
                      {item.name}
                    </Link>
                    <span className="font-display text-sm font-bold text-foreground">
                      <PriceDisplay usdAmount={item.price} />
                    </span>
                    <div className="mt-1 flex items-center gap-2">
                      <Button
                        size="sm"
                        className="h-7 flex-1 text-xs font-semibold"
                        disabled={!item.tebexPackageUrl}
                        onClick={() => {
                          if (item.tebexPackageUrl) window.open(item.tebexPackageUrl, "_blank", "noopener,noreferrer")
                        }}
                      >
                        Checkout on Tebex
                        <ArrowUpRight size={12} aria-hidden="true" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        aria-label={`Remove ${item.name} from gaming cart`}
                        onClick={() => remove(item.slug)}
                      >
                        <Trash size={14} aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border px-5 py-4">
            <p className="text-center text-xs text-muted-foreground">
              Tebex packages checkout individually — there&apos;s no combined cart checkout.
            </p>
            <SheetClose render={<Button variant="outline" className="mt-3 w-full" />}>Continue browsing</SheetClose>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
