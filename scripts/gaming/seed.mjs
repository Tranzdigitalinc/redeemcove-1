// Idempotent seed runner for the DistroSource Gaming demo catalog. Upserts
// by slug (categories + products) so reruns never duplicate data. All
// products are inserted as "published" — this is demo/showcase data for a
// brand-new department, not user-generated content awaiting review.
import fs from "node:fs"
import path from "node:path"
import { Pool } from "pg"
import { GAMING_CATEGORIES } from "./categories.mjs"
import { PRODUCTS } from "./products.mjs"

const MANIFEST_PATH = path.resolve(".v0/gaming-seed-manifest.json")
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"))
  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    // 1. Upsert categories by slug.
    const categoryIdBySlug = {}
    for (const cat of GAMING_CATEGORIES) {
      const res = await client.query(
        `INSERT INTO gaming_categories (slug, name, description, icon, "sortOrder")
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
           icon = EXCLUDED.icon, "sortOrder" = EXCLUDED."sortOrder"
         RETURNING id`,
        [cat.slug, cat.name, cat.description, cat.icon, cat.sortOrder],
      )
      categoryIdBySlug[cat.slug] = res.rows[0].id
    }
    console.log(`Upserted ${GAMING_CATEGORIES.length} gaming categories.`)

    // 2. Upsert products by slug, then replace child image rows.
    let created = 0
    let updated = 0
    for (const product of PRODUCTS) {
      const entry = manifest[product.slug]
      if (!entry) throw new Error(`No manifest entry for ${product.slug} — run upload.mjs first.`)

      const categoryId = categoryIdBySlug[product.category]
      if (!categoryId) throw new Error(`Unknown gaming category slug ${product.category} for ${product.slug}`)

      const existing = await client.query(`SELECT id FROM gaming_products WHERE slug = $1`, [product.slug])
      const isNew = existing.rows.length === 0

      const seoTitle = `${product.name} | DistroSource Gaming`
      const seoDescription = product.tagline
      const searchKeywords = Array.from(
        new Set([...product.tags, ...product.name.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)]),
      )

      const res = await client.query(
        `INSERT INTO gaming_products (
           slug, name, tagline, description, platform, "categoryId", status, price, "compareAtPrice",
           "thumbnailUrl", "coverImageUrl", version, compatibility, features, requirements, tags,
           "installationGuide", changelog, faq, "isFeatured", "isBestseller", "isNew", "isUpdated",
           "tebexPackageId", "tebexPackageUrl", "seoTitle", "seoDescription", "searchKeywords", "updatedAt"
         ) VALUES (
           $1, $2, $3, $4, $5, $6, 'published', $7, $8, $9, $9, $10, $11, $12, $13, $14,
           $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, now()
         )
         ON CONFLICT (slug) DO UPDATE SET
           name = EXCLUDED.name, tagline = EXCLUDED.tagline, description = EXCLUDED.description,
           platform = EXCLUDED.platform, "categoryId" = EXCLUDED."categoryId", status = 'published',
           price = EXCLUDED.price, "compareAtPrice" = EXCLUDED."compareAtPrice",
           "thumbnailUrl" = EXCLUDED."thumbnailUrl", "coverImageUrl" = EXCLUDED."coverImageUrl",
           version = EXCLUDED.version, compatibility = EXCLUDED.compatibility, features = EXCLUDED.features,
           requirements = EXCLUDED.requirements, tags = EXCLUDED.tags,
           "installationGuide" = EXCLUDED."installationGuide", changelog = EXCLUDED.changelog, faq = EXCLUDED.faq,
           "isFeatured" = EXCLUDED."isFeatured", "isBestseller" = EXCLUDED."isBestseller",
           "isNew" = EXCLUDED."isNew", "isUpdated" = EXCLUDED."isUpdated",
           "tebexPackageId" = EXCLUDED."tebexPackageId", "tebexPackageUrl" = EXCLUDED."tebexPackageUrl",
           "seoTitle" = EXCLUDED."seoTitle", "seoDescription" = EXCLUDED."seoDescription",
           "searchKeywords" = EXCLUDED."searchKeywords", "updatedAt" = now()
         RETURNING id`,
        [
          product.slug,
          product.name,
          product.tagline,
          product.description,
          product.platform,
          categoryId,
          product.price,
          product.compareAtPrice ?? null,
          entry.imageUrl,
          product.version,
          product.compatibility,
          product.features,
          product.requirements,
          product.tags,
          product.installationGuide,
          JSON.stringify(product.changelog ?? []),
          JSON.stringify(product.faq ?? []),
          Boolean(product.isFeatured),
          Boolean(product.isBestseller),
          Boolean(product.isNew),
          Boolean(product.isUpdated),
          product.tebexPackageId,
          product.tebexPackageUrl,
          seoTitle,
          seoDescription,
          searchKeywords,
        ],
      )
      const productId = res.rows[0].id

      // Replace gallery images deterministically (single hero image for now).
      await client.query(`DELETE FROM gaming_product_images WHERE "gamingProductId" = $1`, [productId])
      await client.query(
        `INSERT INTO gaming_product_images ("gamingProductId", url, alt, "sortOrder") VALUES ($1, $2, $3, 0)`,
        [productId, entry.imageUrl, product.name],
      )

      if (isNew) created++
      else updated++
    }

    await client.query("COMMIT")
    console.log(`Seed complete: ${created} created, ${updated} updated.`)
  } catch (err) {
    await client.query("ROLLBACK")
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
