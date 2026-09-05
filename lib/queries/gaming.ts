import { db } from "@/lib/db"
import { gamingCategories, gamingProductImages, gamingProducts } from "@/lib/db/schema"
import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm"

export type GamingPlatform = "fivem" | "minecraft" | "other"

const publiclyVisible = () => eq(gamingProducts.status, "published")

export async function getGamingCategories() {
  return db
    .select({
      id: gamingCategories.id,
      slug: gamingCategories.slug,
      name: gamingCategories.name,
      description: gamingCategories.description,
      icon: gamingCategories.icon,
      sortOrder: gamingCategories.sortOrder,
      productCount: sql<number>`cast(count(${gamingProducts.id}) as int)`,
    })
    .from(gamingCategories)
    .leftJoin(gamingProducts, and(eq(gamingProducts.categoryId, gamingCategories.id), publiclyVisible()))
    .groupBy(gamingCategories.id)
    .orderBy(asc(gamingCategories.sortOrder))
}

export async function getGamingCategoryBySlug(slug: string) {
  const rows = await db.select().from(gamingCategories).where(eq(gamingCategories.slug, slug)).limit(1)
  return rows[0] ?? null
}

async function attachImages(productRows: (typeof gamingProducts.$inferSelect)[]) {
  if (productRows.length === 0) return []
  const ids = productRows.map((p) => p.id)
  const images = await db
    .select()
    .from(gamingProductImages)
    .where(inArray(gamingProductImages.gamingProductId, ids))
    .orderBy(asc(gamingProductImages.sortOrder))

  const imagesByProduct = new Map<number, typeof images>()
  for (const img of images) {
    const list = imagesByProduct.get(img.gamingProductId) ?? []
    list.push(img)
    imagesByProduct.set(img.gamingProductId, list)
  }

  return productRows.map((product) => ({ product, images: imagesByProduct.get(product.id) ?? [] }))
}

export type GamingProductWithRelations = NonNullable<Awaited<ReturnType<typeof getGamingProductBySlug>>>

export async function getGamingProductBySlug(slug: string) {
  const rows = await db
    .select({ product: gamingProducts, category: gamingCategories })
    .from(gamingProducts)
    .innerJoin(gamingCategories, eq(gamingProducts.categoryId, gamingCategories.id))
    .where(and(eq(gamingProducts.slug, slug), publiclyVisible()))
    .limit(1)

  if (!rows[0]) return null
  const { product, category } = rows[0]

  const images = await db
    .select()
    .from(gamingProductImages)
    .where(eq(gamingProductImages.gamingProductId, product.id))
    .orderBy(asc(gamingProductImages.sortOrder))

  return { product, category, images }
}

export type GamingProductSort = "featured" | "price-asc" | "price-desc" | "newest"
const GAMING_PRODUCT_SORTS: readonly GamingProductSort[] = ["featured", "price-asc", "price-desc", "newest"]

export function parseGamingProductSort(value: string | undefined): GamingProductSort {
  return (GAMING_PRODUCT_SORTS as readonly string[]).includes(value ?? "") ? (value as GamingProductSort) : "featured"
}

interface GamingProductQueryOptions {
  platform?: GamingPlatform
  categorySlug?: string
  search?: string
  featured?: boolean
  maxPrice?: number
  minPrice?: number
  sort?: GamingProductSort
  limit?: number
  offset?: number
  statusFilter?: "published" | "all"
}

function buildGamingConditions(options: GamingProductQueryOptions) {
  const conditions = options.statusFilter === "all" ? [] : [publiclyVisible()]

  if (options.platform) conditions.push(eq(gamingProducts.platform, options.platform))
  if (options.featured) conditions.push(eq(gamingProducts.isFeatured, true))
  if (options.minPrice !== undefined) conditions.push(sql`${gamingProducts.price} >= ${options.minPrice}`)
  if (options.maxPrice !== undefined) conditions.push(sql`${gamingProducts.price} <= ${options.maxPrice}`)
  if (options.search) {
    const raw = options.search.trim()
    const term = `%${raw}%`
    conditions.push(
      or(
        ilike(gamingProducts.name, term),
        ilike(gamingProducts.tagline, term),
        ilike(gamingProducts.description, term),
        sql`exists (select 1 from unnest(${gamingProducts.tags}) as tag where tag ilike ${term})`,
        sql`exists (select 1 from unnest(${gamingProducts.searchKeywords}) as kw where kw ilike ${term})`,
      )!,
    )
  }

  return conditions
}

export async function getGamingProductsCount(options: GamingProductQueryOptions = {}) {
  const conditions = buildGamingConditions(options)
  if (options.categorySlug) {
    const category = await getGamingCategoryBySlug(options.categorySlug)
    conditions.push(category ? eq(gamingProducts.categoryId, category.id) : sql`false`)
  }

  const rows = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(gamingProducts)
    .where(conditions.length ? and(...conditions) : undefined)

  return rows[0]?.count ?? 0
}

export async function getGamingProducts(options: GamingProductQueryOptions = {}) {
  const conditions = buildGamingConditions(options)

  if (options.categorySlug) {
    const category = await getGamingCategoryBySlug(options.categorySlug)
    conditions.push(category ? eq(gamingProducts.categoryId, category.id) : sql`false`)
  }

  const orderBy =
    options.sort === "newest"
      ? [desc(gamingProducts.createdAt)]
      : options.sort === "price-asc"
        ? [asc(gamingProducts.price)]
        : options.sort === "price-desc"
          ? [desc(gamingProducts.price)]
          : [desc(gamingProducts.isFeatured), desc(gamingProducts.createdAt)]

  const rows = await db
    .select({ product: gamingProducts, category: gamingCategories })
    .from(gamingProducts)
    .innerJoin(gamingCategories, eq(gamingProducts.categoryId, gamingCategories.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(...orderBy)
    .limit(options.limit ?? 200)
    .offset(options.offset ?? 0)

  const withImages = await attachImages(rows.map((r) => r.product))
  const categoryById = new Map(rows.map((r) => [r.product.id, r.category]))

  return withImages.map((item) => ({ ...item, category: categoryById.get(item.product.id)! }))
}

export async function getFeaturedGamingProducts(limit = 4) {
  return getGamingProducts({ featured: true, limit })
}

/** Published gaming products matching a search term, for the header's predictive search. */
export async function getGamingSearchSuggestions(query: string, limit = 4) {
  const raw = query.trim()
  if (!raw) return []
  const term = `%${raw}%`
  return db
    .select({
      id: gamingProducts.id,
      slug: gamingProducts.slug,
      name: gamingProducts.name,
      tagline: gamingProducts.tagline,
      thumbnailUrl: gamingProducts.thumbnailUrl,
      price: gamingProducts.price,
    })
    .from(gamingProducts)
    .where(
      and(
        publiclyVisible(),
        or(
          ilike(gamingProducts.name, term),
          ilike(gamingProducts.tagline, term),
          sql`word_similarity(${raw}, ${gamingProducts.name}) > 0.4`,
        )!,
      ),
    )
    .orderBy(desc(gamingProducts.isFeatured))
    .limit(limit)
}
