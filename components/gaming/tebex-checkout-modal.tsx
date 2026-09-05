"use client"

import { useState } from "react"
import { ArrowUpRight, ShieldCheck } from "@/lib/storefront-icons"
import { PriceDisplay } from "@/components/price-display"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function TebexCheckoutModal({
  productName,
  price,
  tebexPackageUrl,
  trigger,
}: {
  productName: string
  price: number
  tebexPackageUrl: string | null
  trigger: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <span className="mx-auto mb-2 flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck size={22} aria-hidden="true" />
          </span>
          <DialogTitle className="text-center">Secure Checkout</DialogTitle>
          <DialogDescription className="text-center">
            You&apos;re about to purchase <span className="font-semibold text-foreground">{productName}</span> through
            Tebex, DistroSource Gaming&apos;s secure payment partner. You&apos;ll be redirected to complete payment,
            then your package is delivered instantly.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-4 py-3">
          <span className="text-sm font-medium text-muted-foreground">Total</span>
          <span className="font-display text-lg font-bold text-foreground">
            <PriceDisplay usdAmount={price} />
          </span>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            size="lg"
            className="h-11 w-full font-semibold"
            disabled={!tebexPackageUrl}
            onClick={() => {
              if (!tebexPackageUrl) return
              window.open(tebexPackageUrl, "_blank", "noopener,noreferrer")
              setOpen(false)
            }}
          >
            Continue to Checkout
            <ArrowUpRight size={16} aria-hidden="true" />
          </Button>
          <p className="text-center text-xs text-muted-foreground">Opens Tebex checkout in a new tab.</p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
