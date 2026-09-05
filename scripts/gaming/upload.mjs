// Uploads the generated preview images for the DistroSource Gaming demo
// catalog to Vercel Blob, writing a manifest that seed.mjs reads. Mirrors
// scripts/catalog/upload.mjs. Safe to re-run: images have deterministic
// pathnames, so re-running just overwrites them in place.
import fs from "node:fs"
import path from "node:path"
import { put } from "@vercel/blob"
import { PRODUCTS } from "./products.mjs"

const IMAGES_DIR = path.resolve("public/seed/gaming")
const MANIFEST_PATH = path.resolve(".v0/gaming-seed-manifest.json")

async function main() {
  const manifest = {}
  let i = 0
  for (const product of PRODUCTS) {
    i++
    const imagePath = path.join(IMAGES_DIR, `${product.slug}.png`)
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Missing generated image for ${product.slug} at ${imagePath}`)
    }
    const imageBuffer = fs.readFileSync(imagePath)
    const imageBlob = await put(`gaming/images/${product.slug}.png`, imageBuffer, {
      access: "private",
      contentType: "image/png",
      allowOverwrite: true,
    })
    const imageUrl = `/api/blob-image?pathname=${encodeURIComponent(imageBlob.pathname)}`

    manifest[product.slug] = { imageUrl }
    console.log(`[${i}/${PRODUCTS.length}] uploaded ${product.slug}`)
  }

  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true })
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2))
  console.log(`Manifest written to ${MANIFEST_PATH} (${Object.keys(manifest).length} products)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
