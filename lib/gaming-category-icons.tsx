import type { ComponentProps, ReactNode } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  BlockGameIcon,
  Car01Icon,
  CodeIcon,
  Layout01Icon,
  MapIcon,
  PackageIcon,
  PaletteIcon,
  ServerIcon,
} from "@hugeicons/core-free-icons"

type IconProps = Omit<ComponentProps<typeof HugeiconsIcon>, "icon">
export type IconComponent = (props: IconProps) => ReactNode

function createIcon(icon: Parameters<typeof HugeiconsIcon>[0]["icon"]): IconComponent {
  const Icon: IconComponent & { displayName?: string } = (props) => <HugeiconsIcon icon={icon} {...props} />
  Icon.displayName = "GamingCategoryIcon"
  return Icon
}

const gamingCategoryIconMap: Record<string, IconComponent> = {
  fivem: createIcon(Car01Icon),
  minecraft: createIcon(BlockGameIcon),
  "game-server-resources": createIcon(ServerIcon),
  "maps-environments": createIcon(MapIcon),
  "scripts-systems": createIcon(CodeIcon),
  "ui-hud": createIcon(Layout01Icon),
  "textures-graphics": createIcon(PaletteIcon),
  "gaming-packs": createIcon(PackageIcon),
}

const fallbackIcon = createIcon(PackageIcon)

export function getGamingCategoryIcon(slug: string | null | undefined): IconComponent {
  if (!slug) return fallbackIcon
  return gamingCategoryIconMap[slug.toLowerCase()] ?? fallbackIcon
}
