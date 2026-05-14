// Pure geometry helpers for the radial FAB menu.
// Extracted so they can be audited at multiple viewport sizes without rendering React.

export const FAB_ICON_SIZE_MOBILE = 44; // w-11
export const FAB_ICON_SIZE_DESKTOP = 48; // md:w-12
export const FAB_LABEL_MAX_WIDTH = 90;   // generous estimate for label text

export interface FabPlacement {
  /** Offset in px from the FAB anchor (right = +x, down = +y). */
  x: number;
  y: number;
  /** Bounding box of icon+label centered at (anchorX+x, anchorY+y). */
  width: number;
  height: number;
}

export interface FabAnchor {
  /** Anchor position of the FAB in viewport coordinates (px from top-left). */
  x: number;
  y: number;
}

export interface FabLayout {
  startDeg: number;
  endDeg: number;
  radius: number;
  anchor: FabAnchor;
  iconSize: number;
}

/** Mirrors the radius/arc logic in BottomNav.RadialMenu. */
export function computeFabLayout(opts: {
  vw: number;
  vh: number;
  originRight: boolean;
  isMobile: boolean;
}): FabLayout {
  const { vw, vh, originRight, isMobile } = opts;
  let startDeg: number, endDeg: number, radius: number;

  if (originRight) {
    startDeg = 60;
    endDeg = 180;
    const maxR = Math.min(vw - 160, vh - 200, 320);
    radius = Math.max(240, maxR);
  } else {
    startDeg = 180;
    endDeg = 0;
    const safeR = Math.min((vw - 90) / 2, vh - 220, isMobile ? 145 : 200);
    radius = Math.max(140, safeR);
  }

  const anchor: FabAnchor = originRight
    ? { x: vw - 48, y: vh - 48 }    // bottom-12 right-12 → ~48px from edges
    : { x: vw / 2, y: vh - 112 };  // bottom-28 center (clears 64px bottom nav)

  return {
    startDeg,
    endDeg,
    radius,
    anchor,
    iconSize: isMobile ? FAB_ICON_SIZE_MOBILE : FAB_ICON_SIZE_DESKTOP,
  };
}

export function placeFabItems(layout: FabLayout, count: number): FabPlacement[] {
  const { startDeg, endDeg, radius, iconSize } = layout;
  const stepDeg = count > 1 ? (startDeg - endDeg) / (count - 1) : 0;
  const placements: FabPlacement[] = [];
  for (let i = 0; i < count; i++) {
    const deg = startDeg - stepDeg * i;
    const rad = (deg * Math.PI) / 180;
    const x = Math.cos(rad) * radius;
    const y = -Math.sin(rad) * radius;
    placements.push({
      x,
      y,
      width: Math.max(iconSize, FAB_LABEL_MAX_WIDTH),
      height: iconSize + 18, // icon + label line
    });
  }
  return placements;
}

/** Distance between centers of two adjacent items along the arc. */
export function adjacentSpacing(a: FabPlacement, b: FabPlacement): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
