import { describe, it, expect } from "vitest";
import {
  computeFabLayout,
  placeFabItems,
  adjacentSpacing,
  FAB_ICON_SIZE_MOBILE,
  FAB_ICON_SIZE_DESKTOP,
} from "@/lib/fabGeometry";

const FAB_ITEM_COUNT = 10;

// WCAG 2.5.5 (AAA) recommends 44x44 CSS pixels minimum tap target.
const MIN_TAP_TARGET = 44;
// Vertical clearance reserved for the label rendered above each icon.
const LABEL_HEIGHT = 18;

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

      it("every icon meets the 44x44 minimum tap target", () => {
        expect(iconSize, `icon size @ ${bp.name}`).toBeGreaterThanOrEqual(MIN_TAP_TARGET);
      });

      it("places every icon strictly inside the viewport", () => {
        for (const [i, p] of items.entries()) {
          const cx = layout.anchor.x + p.x;
          const cy = layout.anchor.y + p.y;
          const r = iconSize / 2;
          expect(cx - r, `item ${i} left edge @ ${bp.name}`).toBeGreaterThanOrEqual(0);
          expect(cx + r, `item ${i} right edge @ ${bp.name}`).toBeLessThanOrEqual(bp.vw);
          expect(cy - r - LABEL_HEIGHT, `item ${i} label top @ ${bp.name}`).toBeGreaterThanOrEqual(0);
          expect(cy + r, `item ${i} bottom edge @ ${bp.name}`).toBeLessThanOrEqual(bp.vh);
        }
      });

      it("keeps adjacent icons from overlapping", () => {
        const minGap = iconSize + 4;
        for (let i = 1; i < items.length; i++) {
          const d = adjacentSpacing(items[i - 1], items[i]);
          expect(d, `gap between items ${i - 1}-${i} @ ${bp.name}`).toBeGreaterThanOrEqual(minGap);
        }
      });

      it("keeps non-adjacent icons from overlapping", () => {
        for (let i = 0; i < items.length; i++) {
          for (let j = i + 2; j < items.length; j++) {
            const d = adjacentSpacing(items[i], items[j]);
            expect(d, `pair ${i}-${j} @ ${bp.name}`).toBeGreaterThanOrEqual(iconSize);
          }
        }
      });

      it("labels do not overlap neighbouring icons", () => {
        // Mobile: labels above icon. Desktop: labels offset radially inward.
        const labelHalfW = 45;
        const labelHalfH = LABEL_HEIGHT / 2;
        const labelOffset = iconSize / 2 + 16;
        const stepDeg = (layout.startDeg - layout.endDeg) / (FAB_ITEM_COUNT - 1);
        for (let i = 0; i < items.length; i++) {
          const deg = layout.startDeg - stepDeg * i;
          const rad = (deg * Math.PI) / 180;
          const lx = bp.originRight
            ? items[i].x - Math.cos(rad) * labelOffset
            : items[i].x;
          const ly = bp.originRight
            ? items[i].y + Math.sin(rad) * labelOffset
            : items[i].y - labelOffset;
          for (let j = 0; j < items.length; j++) {
            if (i === j) continue;
            const dx = Math.max(Math.abs(lx - items[j].x) - labelHalfW - iconSize / 2, 0);
            const dy = Math.max(Math.abs(ly - items[j].y) - labelHalfH - iconSize / 2, 0);
            const dist = Math.hypot(dx, dy);
            expect(dist, `label ${i} vs icon ${j} @ ${bp.name}`).toBeGreaterThanOrEqual(0);
          }
        }
      });
    });
  }
});
