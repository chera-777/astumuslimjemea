import test from "node:test";
import assert from "node:assert/strict";
import {
  buildSidebarConfig,
  filterSidebarSections,
  isSidebarItemActive,
} from "./sidebarNavigation";

test("buildSidebarConfig groups student navigation into curated sections with all routes preserved", () => {
  const config = buildSidebarConfig(["student"]);
  assert.equal(config.portalLabel, "Student Portal");
  assert.equal(config.studentSwitchItem, null);

  const flatUrls = config.sections.flatMap((s) => s.items.map((i) => i.url));
  assert.deepEqual(flatUrls, [
    "/dashboard",
    "/resources",
    "/academic",
    "/challenges",
    "/community",
    "/groups",
    "/news",
    "/verification",
    "/governance",
    "/donations",
    "/services",
  ]);
  assert.deepEqual(
    config.sections.map((s) => s.key),
    ["overview", "worship", "community", "campus"]
  );
});

test("buildSidebarConfig exposes Student Portal switch only for staff roles", () => {
  const admin = buildSidebarConfig(["admin"]);
  assert.equal(admin.portalLabel, "Admin Portal");
  assert.equal(admin.sections[0].items[0].url, "/admin");
  assert.equal(admin.studentSwitchItem?.url, "/dashboard");

  const amir = buildSidebarConfig(["amir"]);
  assert.equal(amir.portalLabel, "Amirs' Portal");
  assert.equal(amir.studentSwitchItem?.url, "/dashboard");

  const guest = buildSidebarConfig(["guest"]);
  assert.equal(guest.portalLabel, "Guest Portal");
  assert.equal(guest.studentSwitchItem, null);
});

test("filterSidebarSections filters across titles, subtitles, and keywords", () => {
  const { sections } = buildSidebarConfig(["student"]);

  const byKeyword = filterSidebarSections(sections, "quran");
  assert.equal(byKeyword.length, 1);
  assert.equal(byKeyword[0].items[0].title, "Resources");

  const byTitle = filterSidebarSections(sections, "verif");
  assert.equal(byTitle.length, 1);
  assert.equal(byTitle[0].items[0].url, "/verification");

  const empty = filterSidebarSections(sections, "nonexistent-route-xyz");
  assert.equal(empty.length, 0);
});

test("isSidebarItemActive matches exact routes and nested subroutes without false positives", () => {
  assert.equal(isSidebarItemActive("/community", "/community"), true);
  assert.equal(isSidebarItemActive("/verification", "/verification"), true);
  assert.equal(isSidebarItemActive("/portal/amirs/daewa", "/portal/amirs"), false);
  assert.equal(isSidebarItemActive("/portal/amirs", "/portal/amirs"), true);
  assert.equal(isSidebarItemActive("/dashboard", "/resources"), false);
});
