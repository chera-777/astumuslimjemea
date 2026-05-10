import { describe, it, expect } from "vitest";
import {
  computeFabLayout,
  placeFabItems,
  adjacentSpacing,
  FAB_ICON_SIZE_MOBILE,
  FAB_ICON_SIZE_DESKTOP,
} from "@/lib/fabGeometry";

const FAB_ITEM_COUNT = 10;

const breakpoints = [
  { name: "mobile portrait",  vw: 375,  vh: 812,  isMobile: true,  originRight: false },
  { name: "mobile landscape", vw: 812,  vh: 375,  isMobile: true,  originRight: false },
  { name: "tablet",           vw: 768,  vh: 1024, isMobile: false, originRight: true  },
  { name: "desktop",          vw: 1440, vh: 900,  isMobile: false, originRight: true  },
  { name: "desktop wide",     vw: 1920, vh: 1080, isMobile: false, originRight: true  },
];

describe("Radial FAB responsive audit", () => {
  for (const bp of breakpoints) {
    describe(bp.name, () => {
      const layout = computeFabLayout(bp);
      const items = placeFabItems(layout, FAB_ITEM_COUNT);
      const iconSize = bp.isMobile ? FAB_ICON_SIZE_MOBILE : FAB_ICON_SIZE_DESKTOP;

      it("places every icon strictly inside the viewport", () => {
        for (const [i, p] of items.entries()) {
          const cx = layout.anchor.x + p.x;
          const cy = layout.anchor.y + p.y;
          const r = iconSize / 2;
          expect(cx - r, `item ${i} left edge @ ${bp.name}`).toBeGreaterThanOrEqual(0);
          expect(cx + r, `item ${i} right edge @ ${bp.name}`).toBeLessThanOrEqual(bp.vw);
          expect(cy - r, `item ${i} top edge @ ${bp.name}`).toBeGreaterThanOrEqual(0);
          expect(cy + r, `item ${i} bottom edge @ ${bp.name}`).toBeLessThanOrEqual(bp.vh);
        }
      });

      it("keeps adjacent icons from overlapping", () => {
        const minGap = iconSize + 4; // icon diameter + breathing room
        for (let i = 1; i < items.length; i++) {
          const d = adjacentSpacing(items[i - 1], items[i]);
          expect(d, `gap between items ${i - 1}-${i} @ ${bp.name}`).toBeGreaterThanOrEqual(minGap);
        }
      });

      it("keeps non-adjacent icons from overlapping (icon bodies only)", () => {
        for (let i = 0; i < items.length; i++) {
          for (let j = i + 2; j < items.length; j++) {
            const d = adjacentSpacing(items[i], items[j]);
            expect(d, `pair ${i}-${j} @ ${bp.name}`).toBeGreaterThanOrEqual(iconSize);
          }
        }
      });
    });
  }
});
