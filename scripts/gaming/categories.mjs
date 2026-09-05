// The 8 fixed DistroSource Gaming categories. "fivem" and "minecraft" are
// platform-hub cards only (mirrors the main catalog's department/subcategory
// split) — no product ever attaches to them directly, only to one of the
// six functional categories below. Products distinguish platform via their
// own `platform` column instead.
export const GAMING_CATEGORIES = [
  { slug: "fivem", name: "FiveM", description: "Everything for FiveM roleplay servers — maps, scripts, UI, and more.", icon: "Car", sortOrder: 1 },
  { slug: "minecraft", name: "Minecraft", description: "Maps, server packs, and resources for Minecraft servers.", icon: "Blocks", sortOrder: 2 },
  { slug: "game-server-resources", name: "Game Server Resources", description: "Starter frameworks, server packs, and configuration bundles.", icon: "Server", sortOrder: 3 },
  { slug: "maps-environments", name: "Maps & Environments", description: "MLOs, interiors, and custom maps for immersive worlds.", icon: "Map", sortOrder: 4 },
  { slug: "scripts-systems", name: "Scripts & Systems", description: "Gameplay scripts and systems — economy, jobs, housing, and more.", icon: "Code2", sortOrder: 5 },
  { slug: "ui-hud", name: "UI & HUD", description: "HUDs, menus, and interface overhauls for a polished player experience.", icon: "LayoutTemplate", sortOrder: 6 },
  { slug: "textures-graphics", name: "Textures & Graphics", description: "Texture packs, liveries, and visual overhauls.", icon: "Palette", sortOrder: 7 },
  { slug: "gaming-packs", name: "Gaming Packs", description: "Bundled launch kits combining maps, scripts, and resources.", icon: "Package", sortOrder: 8 },
]
