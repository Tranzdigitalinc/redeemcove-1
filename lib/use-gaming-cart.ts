"use client"

import { useCallback, useEffect, useState } from "react"

const CART_KEY = "ds:gaming-cart"
const CART_EVENT = "ds:gaming-cart-change"

export interface GamingCartItem {
  slug: string
  name: string
  price: number
  thumbnailUrl: string | null
  tebexPackageUrl: string | null
}

function readCart(): GamingCartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY)
    return raw ? (JSON.parse(raw) as GamingCartItem[]) : []
  } catch {
    return []
  }
}

function writeCart(items: GamingCartItem[]) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
    window.dispatchEvent(new Event(CART_EVENT))
  } catch {
    /* storage unavailable — the gaming cart is a save-list convenience only */
  }
}

/**
 * Client-only save-list for DistroSource Gaming, deliberately separate from
 * the DB-backed cart used by the main digital-goods catalog. Tebex packages
 * don't support a combined multi-item checkout via a simple URL, so this is
 * a wishlist-style holding area — each item checks out individually on
 * Tebex — not a real basket transaction.
 */
export function useGamingCart() {
  const [items, setItems] = useState<GamingCartItem[]>([])

  useEffect(() => {
    setItems(readCart())
    const onChange = () => setItems(readCart())
    window.addEventListener(CART_EVENT, onChange)
    window.addEventListener("storage", onChange)
    return () => {
      window.removeEventListener(CART_EVENT, onChange)
      window.removeEventListener("storage", onChange)
    }
  }, [])

  const add = useCallback((item: GamingCartItem) => {
    const current = readCart()
    if (current.some((i) => i.slug === item.slug)) return
    writeCart([...current, item])
  }, [])

  const remove = useCallback((slug: string) => {
    writeCart(readCart().filter((i) => i.slug !== slug))
  }, [])

  const has = useCallback((slug: string) => items.some((i) => i.slug === slug), [items])

  return { items, add, remove, has, count: items.length }
}
