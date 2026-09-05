"use server"

import { revalidatePath } from "next/cache"
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { gamingCategories, gamingProductImages, gamingProducts } from "@/lib/db/schema"
import { requireAdmin } from "@/lib/actions/operations"

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

function parseListField(value: string): string[] {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
}

async function ensureUniqueSlug(baseSlug: string, excludeId?: number): Promise<string> {
  const existing = await db
    .select({ slug: gamingProducts.slug })
    .from(gamingProducts)
    .where(
      excludeId !== undefined
        ? and(
            or(eq(gamingProducts.slug, baseSlug), ilike(gamingProducts.slug, `${baseSlug}-%`))!,
            sql`${gamingProducts.id} != ${excludeId}`,
          )
        : or(eq(gamingProducts.slug, baseSlug), ilike(gamingProducts.slug, `${baseSlug}-%`))!,
    )

  if (existing.length === 0) return baseSlug
  const taken = new Set(existing.map((row) => row.slug))
  if (!taken.has(baseSlug)) return baseSlug

  let n = 2
  while (taken.has(`${baseSlug}-${n}`)) n++
  return `${baseSlug}-${n}`
}

export async function getAdminGamingProducts(search?: string, statusFilter?: "draft" | "published") {
  await requireAdmin()

  const conditions = search
    ? [or(ilike(gamingProducts.name, `%${search}%`), ilike(gamingProducts.slug, `%${search}%`))!]
    : []
  if (statusFilter) conditions.push(eq(gamingProducts.status, statusFilter))

  return db
    .select({ product: gamingProducts, category: gamingCategories })
    .from(gamingProducts)
    .innerJoin(gamingCategories, eq(gamingProducts.categoryId, gamingCategories.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(gamingProducts.updatedAt))
}

export async function getAdminGamingProductById(id: number) {
  await requireAdmin()

  const [row] = await db
    .select({ product: gamingProducts, category: gamingCategories })
    .from(gamingProducts)
    .innerJoin(gamingCategories, eq(gamingProducts.categoryId, gamingCategories.id))
    .where(eq(gamingProducts.id, id))
    .limit(1)

  if (!row) return null

  const [images, allCategories] = await Promise.all([
    db
      .select()
      .from(gamingProductImages)
      .where(eq(gamingProductImages.gamingProductId, id))
      .orderBy(asc(gamingProductImages.sortOrder)),
    db.select().from(gamingCategories).orderBy(asc(gamingCategories.sortOrder)),
  ])

  return { ...row, images, allCategories }
}

export interface GamingFaqEntry {
  question: string
  answer: string
}

export interface GamingChangelogEntry {
  version: string
  date: string
  notes: string
}

export interface GamingProductFormInput {
  name: string
  slug?: string
  tagline: string
  description: string
  platform: "fivem" | "minecraft" | "other"
  categoryId: number
  status: "draft" | "published"
  price: string
  compareAtPrice: string
  thumbnailUrl: string
  coverImageUrl: string
  version: string
  compatibility: string
  features: string
  requirements: string
  tags: string
  installationGuide: string
  changelog: GamingChangelogEntry[]
  faq: GamingFaqEntry[]
  isFeatured: boolean
  isBestseller: boolean
  isNew: boolean
  isUpdated: boolean
  tebexPackageId: string
  tebexPackageUrl: string
  seoTitle: string
  seoDescription: string
}

function buildValues(input: GamingProductFormInput, slug: string) {
  return {
    slug,
    name: input.name.trim(),
    tagline: input.tagline.trim() || null,
    description: input.description.trim(),
    platform: input.platform,
    categoryId: input.categoryId,
    price: input.price || "0",
    compareAtPrice: input.compareAtPrice || null,
    thumbnailUrl: input.thumbnailUrl.trim() || null,
    coverImageUrl: input.coverImageUrl.trim() || input.thumbnailUrl.trim() || null,
    version: input.version.trim() || "1.0.0",
    compatibility: input.compatibility.trim() || null,
    features: parseListField(input.features),
    requirements: parseListField(input.requirements),
    tags: parseListField(input.tags),
    installationGuide: input.installationGuide.trim() || null,
    changelog: input.changelog.filter((c) => c.version.trim() || c.notes.trim()),
    faq: input.faq.filter((f) => f.question.trim() && f.answer.trim()),
    isFeatured: input.isFeatured,
    isBestseller: input.isBestseller,
    isNew: input.isNew,
    isUpdated: input.isUpdated,
    tebexPackageId: input.tebexPackageId.trim() || null,
    tebexPackageUrl: input.tebexPackageUrl.trim() || null,
    seoTitle: input.seoTitle.trim() || null,
    seoDescription: input.seoDescription.trim() || null,
    searchKeywords: Array.from(
      new Set([...parseListField(input.tags), ...input.name.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)]),
    ),
  }
}

export async function createGamingProduct(input: GamingProductFormInput) {
  await requireAdmin()

  const requestedSlug = input.slug?.trim() ? slugify(input.slug) : slugify(input.name)
  if (!requestedSlug) throw new Error("A product name or slug is required.")
  const slug = await ensureUniqueSlug(requestedSlug)

  const [created] = await db
    .insert(gamingProducts)
    .values({ ...buildValues(input, slug), status: "draft" })
    .returning({ id: gamingProducts.id })

  revalidatePath("/admin/gaming")
  return created.id
}

export async function updateGamingProduct(id: number, input: GamingProductFormInput) {
  await requireAdmin()

  const requestedSlug = input.slug?.trim() ? slugify(input.slug) : slugify(input.name)
  const slug = await ensureUniqueSlug(requestedSlug, id)

  await db
    .update(gamingProducts)
    .set({ ...buildValues(input, slug), status: input.status, updatedAt: new Date() })
    .where(eq(gamingProducts.id, id))

  revalidatePath("/admin/gaming")
  revalidatePath(`/admin/gaming/${id}`)
  revalidatePath(`/gaming/product/${slug}`)
}

export async function deleteGamingProduct(id: number) {
  await requireAdmin()
  await db.delete(gamingProducts).where(eq(gamingProducts.id, id))
  revalidatePath("/admin/gaming")
}

// --- Images ---

export async function addGamingProductImage(gamingProductId: number, url: string, alt: string) {
  await requireAdmin()
  const [{ maxSort }] = await db
    .select({ maxSort: sql<number>`coalesce(max(${gamingProductImages.sortOrder}), -1)::int` })
    .from(gamingProductImages)
    .where(eq(gamingProductImages.gamingProductId, gamingProductId))

  await db.insert(gamingProductImages).values({ gamingProductId, url, alt: alt || null, sortOrder: maxSort + 1 })
  revalidatePath(`/admin/gaming/${gamingProductId}`)
}

export async function deleteGamingProductImage(id: number, gamingProductId: number) {
  await requireAdmin()
  await db.delete(gamingProductImages).where(eq(gamingProductImages.id, id))
  revalidatePath(`/admin/gaming/${gamingProductId}`)
}
