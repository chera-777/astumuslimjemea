import { describe, it, expect } from "vitest";
import { computeFabLayout, placeFabItems } from "@/lib/fabGeometry";

/**
 * Visual snapshot tests for the radial FAB geometry at the four target
 * viewport sizes. Pure-numeric snapshots make any future change to
 * radius / arc / spacing immediately visible in the test diff.
 */

const FAB_ITEM_COUNT = 10;

const targets = [
  { name: "mobile-portrait",  vw: 375,  vh: 812,  isMobile: true,  originRight: false },
  { name: "mobile-landscape", vw: 812,  vh: 375,  isMobile: true,  originRight: false },
  { name: "tablet",           vw: 768,  vh: 1024, isMobile: false, originRight: true  },
  { name: "desktop",          vw: 1440, vh: 900,  isMobile: false, originRight: true  },
];

const round = (n: number) => Math.round(n * 100) / 100;

describe("FAB layout snapshots", () => {
  for (const t of targets) {
    it(`matches snapshot @ ${t.name}`, () => {
      const layout = computeFabLayout(t);
      const items = placeFabItems(layout, FAB_ITEM_COUNT).map((p) => ({
        x: round(p.x),
        y: round(p.y),
        w: p.width,
        h: p.height,
      }));
      expect({
        viewport: { vw: t.vw, vh: t.vh },
        layout: {
          startDeg: layout.startDeg,
          endDeg: layout.endDeg,
          radius: round(layout.radius),
          anchor: { x: round(layout.anchor.x), y: round(layout.anchor.y) },
          iconSize: layout.iconSize,
        },
        items,
      }).toMatchSnapshot();
    });
  }
});
