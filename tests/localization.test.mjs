import assert from "node:assert/strict";
import { createServer } from "node:http";
import { access, mkdtemp, readFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { after, before, test } from "node:test";
import { load } from "cheerio";
import parseSrcset from "parse-srcset";
import { chromium } from "playwright-core";
import translations from "../translations.js";
import { generatePages, pageFile, pageUrl, rootDirectory } from "../scripts/generate-pages.mjs";
import { pages, person, siteOrigin } from "../scripts/site.config.mjs";

const languages = ["en", "zh-CN"];
const variants = pages.flatMap((page) => languages.map((language) => ({ page, language, file: pageFile(page.path, language) })));
const readHtml = async (file) => load(await readFile(path.join(rootDirectory, file), "utf8"));

test("generated pages are repeatable and up to date", async () => {
  assert.deepEqual(await generatePages({ check: true }), []);
  assert.deepEqual(Object.keys(translations.en).sort(), Object.keys(translations["zh-CN"]).sort());
});

test("all 18 HTML files contain translated content, metadata, and valid local links", async () => {
  for (const { page, language, file } of variants) {
    const $ = await readHtml(file);
    assert.equal($("html").attr("lang"), language, file);
    assert.equal($("h1").length, 1, file);
    assert.equal($('link[rel="canonical"]').length, 1, file);
    assert.equal($('link[rel="canonical"]').attr("href"), pageUrl(page.path, language), file);
    assert.equal($('link[rel="alternate"][hreflang]').length, 3, file);
    for (const alternate of [...languages, "x-default"]) {
      assert.equal($(`link[hreflang="${alternate}"]`).attr("href"), pageUrl(page.path, alternate === "zh-CN" ? alternate : "en"), file);
    }
    assert.equal($(".language-option[aria-current=true]").length, 2, file);
    assert.equal($(".language-option:not(a)").length, 0, file);
    assert.equal($('script[src$="translations.js"]').length, 1, file);
    for (const [attribute, target] of [["data-i18n", null], ["data-i18n-alt", "alt"], ["data-i18n-aria-label", "aria-label"]]) {
      $(`[${attribute}]`).each((_, node) => {
        const expected = translations[language][$(node).attr(attribute)];
        assert.equal(target ? $(node).attr(target) : $(node).text(), expected, `${file}: ${$(node).attr(attribute)}`);
      });
    }
    if (language === "zh-CN") {
      assert.equal($("title").text(), page.zhTitle, file);
      assert.equal($('meta[name="description"]').attr("content"), page.zhDescription, file);
    }
    const ids = $("[id]").toArray().map((node) => $(node).attr("id"));
    assert.equal(new Set(ids).size, ids.length, file);
    const resources = [];
    $("[href], [src]").each((_, node) => {
      for (const attribute of ["href", "src"]) {
        const value = $(node).attr(attribute);
        if (value) resources.push(value);
      }
    });
    $("[srcset]").each((_, node) => {
      resources.push(...parseSrcset($(node).attr("srcset")).map(({ url }) => url));
    });
    for (const value of resources) {
      const url = new URL(value, new URL(file, siteOrigin));
      if (url.origin !== new URL(siteOrigin).origin) continue;
      let target = decodeURIComponent(url.pathname.slice(1));
      if (!target || target.endsWith("/")) target += "index.html";
      await access(path.join(rootDirectory, target));
      assert.equal(url.searchParams.has("lang"), false, `${file}: ${value}`);
      if (url.hash && target.endsWith(".html")) {
        const destination = await readHtml(target);
        const id = decodeURIComponent(url.hash.slice(1));
        assert.ok(destination("[id]").toArray().some((node) => destination(node).attr("id") === id), `${file}: ${value}`);
      }
    }
  }
});

test("sitemap and profile data describe the same bilingual pages and identity", async () => {
  const $ = load(await readFile(path.join(rootDirectory, "sitemap.xml"), "utf8"), { xml: true });
  assert.equal($("urlset").attr("xmlns"), "http://www.sitemaps.org/schemas/sitemap/0.9");
  assert.equal($("urlset").attr("xmlns:xhtml"), "http://www.w3.org/1999/xhtml");
  const locations = $("loc").toArray().map((node) => $(node).text());
  assert.deepEqual(locations, variants.map(({ page, language }) => pageUrl(page.path, language)));
  assert.equal(new Set(locations).size, 18);
  $("url").each((index, node) => {
    const links = $(node).children("xhtml\\:link");
    assert.equal(links.length, 3);
    links.each((_, link) => {
      const language = $(link).attr("hreflang") === "zh-CN" ? "zh-CN" : "en";
      assert.equal($(link).attr("href"), pageUrl(variants[index].page.path, language));
    });
  });
  for (const language of languages) {
    const html = await readHtml(pageFile("index.html", language));
    const profile = JSON.parse(html("#profile-data").text());
    assert.equal(profile["@type"], "ProfilePage");
    assert.equal(profile.url, pageUrl("index.html", language));
    assert.deepEqual(profile.mainEntity.alternateName, person.alternateName);
    assert.equal(profile.mainEntity["@id"], `${siteOrigin}#person`);
    for (const url of profile.mainEntity.sameAs) assert.ok(html(`a[href="${url}"]`).length);
    assert.ok(html('meta[name="msvalidate.01"]').attr("content"));
    assert.ok(html('meta[name="google-site-verification"]').attr("content"));
  }
});

test("SmartSens retains both assignments with a shared overview and technology stack", async () => {
  const expected = {
    en: { departments: ["AI Department", "Applications Department"], periods: ["Sep 2026 \u2013 Present", "Jul 2026 \u2013 Sep 2026"] },
    "zh-CN": { departments: ["AI \u90e8", "\u5e94\u7528\u90e8"], periods: ["2026.09 \u2013 \u81f3\u4eca", "2026.07 \u2013 2026.09"] }
  };
  for (const language of languages) {
    const home = await readHtml(pageFile("index.html", language));
    const entry = home('[data-i18n="smartSensCompany"]').closest("article");
    assert.equal(entry.find(".work-experience-company").length, 1);
    assert.equal(entry.find(".work-experience-role").length, 2);
    assert.deepEqual(entry.find(".work-experience-department").toArray().map((node) => home(node).text()), expected[language].departments);
    assert.deepEqual(entry.find(".work-experience-period").toArray().map((node) => home(node).text()), expected[language].periods);
    assert.deepEqual(entry.find('[data-i18n="smartSensPosition"]').toArray().map((node) => home(node).text()), Array(2).fill(translations[language].smartSensPosition));

    const detail = await readHtml(pageFile("work/smartsens/index.html", language));
    const roles = detail(".work-period-assignment");
    assert.equal(roles.length, 2);
    assert.deepEqual(roles.find(".work-period-department").toArray().map((node) => detail(node).text()), expected[language].departments);
    assert.deepEqual(roles.find('[data-i18n="smartSensAiPeriod"], [data-i18n="smartSensApplicationsPeriod"]').toArray().map((node) => detail(node).text()), expected[language].periods);
    assert.equal(detail(".work-detail-position").length, 1);
    assert.equal(detail(".work-detail-position").text(), translations[language].smartSensDetailPosition);
    assert.equal(detail('[data-i18n="smartSensDetailLocation"]').length, 1);
    assert.equal(detail(".work-role").length, 0);
    assert.equal(detail(".work-detail > .work-detail-section").length, 2);
    assert.equal(detail(".work-overview").length, 1);
    assert.equal(detail(".work-overview").text(), translations[language].smartSensWorkOverview);
    assert.equal(detail(".work-technologies").length, 1);
    assert.equal(detail(".work-detail-section > h2").length, 2);
    assert.equal(detail(".work-actions-footer").length, 1);
    assert.equal(detail(".work-detail").children().last().hasClass("work-actions-footer"), true);
  }
});

test("homepage internships share the same company and assignment structure", async () => {
  for (const language of languages) {
    const home = await readHtml(pageFile("index.html", language));
    const entries = home(".work-experience-entry");
    assert.equal(entries.length, 3);
    for (const [index, node] of entries.toArray().entries()) {
      const entry = home(node);
      const header = entry.children(".work-experience-entry-header");
      assert.equal(header.children(".work-experience-company").length, 1);
      assert.equal(header.find(".work-experience-meta").length, 1);
      assert.equal(header.find(".work-experience-period, .work-experience-position").length, 0);
      const roles = entry.children(".work-experience-roles").children(".work-experience-role");
      assert.equal(roles.length, index === 0 ? 2 : 1);
      roles.each((_, role) => {
        assert.equal(home(role).children(".work-experience-position").length, 1);
        assert.equal(home(role).find(".work-experience-period").length, 1);
      });
    }
  }
});

let browser;
let server;
let baseUrl;
let screenshots;

before(async () => {
  const mimeTypes = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif", ".xml": "application/xml" };
  server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url, "http://localhost");
      let file = path.resolve(rootDirectory, "." + decodeURIComponent(url.pathname));
      if (file !== path.resolve(rootDirectory) && !file.startsWith(path.resolve(rootDirectory) + path.sep)) {
        response.writeHead(403).end();
        return;
      }
      if ((await stat(file)).isDirectory()) file = path.join(file, "index.html");
      const content = await readFile(file);
      response.writeHead(200, { "Content-Type": mimeTypes[path.extname(file)] || "application/octet-stream" }).end(content);
    } catch {
      response.writeHead(404).end("Not found");
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}/`;
  browser = await chromium.launch(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : { channel: "chrome" });
  screenshots = await mkdtemp(path.join(tmpdir(), "website-localization-check-"));
});

after(async () => {
  await browser?.close();
  if (server) await new Promise((resolve) => server.close(resolve));
  if (screenshots) console.log(`Screenshots: ${screenshots}`);
});

async function contextFor(options = {}) {
  const context = await browser.newContext(options);
  // Layout and navigation tests should not depend on external font servers.
  await context.route("https://fonts.googleapis.com/**", (route) => route.abort());
  await context.route("https://fonts.gstatic.com/**", (route) => route.abort());
  return context;
}

test("both languages are readable and linked without JavaScript", async () => {
  const context = await contextFor({ javaScriptEnabled: false });
  try {
    const tab = await context.newPage();
    for (const { language, file } of variants) {
      await tab.goto(new URL(file, baseUrl).href);
      assert.equal(await tab.locator(".profile-name").textContent(), translations[language].profileName, file);
      assert.equal(await tab.locator(".profile-summary").textContent(), translations[language].profileSummary, file);
    }
    await tab.goto(baseUrl);
    await tab.locator('.language-option[data-language="zh-CN"]:visible').click();
    await tab.waitForURL("**/zh/index.html");
    assert.equal(await tab.locator("h1").textContent(), translations["zh-CN"].profileName);
  } finally {
    await context.close();
  }
});

test("desktop, tablet, mobile and landscape layouts retain working navigation", async () => {
  const context = await contextFor();
  try {
    const tab = await context.newPage();
    const errors = [];
    tab.on("pageerror", (error) => errors.push(error.message));
    for (const viewport of [{ width: 1440, height: 900 }, { width: 820, height: 900 }, { width: 390, height: 844 }, { width: 844, height: 390 }]) {
      await tab.setViewportSize(viewport);
      for (const { page, language, file } of variants) {
        await tab.goto(new URL(file, baseUrl).href);
        const state = await tab.evaluate(() => ({
          width: window.innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          canonical: document.querySelector('link[rel="canonical"]').href,
          activeDetails: document.querySelectorAll('.navigation-submenu a[aria-current="page"]').length,
          name: document.querySelector(".profile-name").textContent,
          language: document.documentElement.lang,
          contentHeight: document.querySelector(".page-content").getBoundingClientRect().height
        }));
        assert.ok(state.scrollWidth <= state.width + 1, `${file} overflows at ${viewport.width}px`);
        assert.ok(state.contentHeight > 100, file);
        assert.equal(state.name, translations[language].profileName, file);
        assert.equal(state.language, language, file);
        assert.equal(state.canonical, pageUrl(page.path, language), file);
        assert.equal(state.activeDetails, page.path === "index.html" ? 0 : 1, file);
      }
    }
    assert.deepEqual(errors, []);
    await tab.setViewportSize({ width: 844, height: 390 });
    await tab.goto(new URL("zh/projects/repopilot-agent/", baseUrl).href);
    await tab.locator(".menu-toggle").click();
    const navigation = tab.locator(".site-navigation");
    assert.equal(await navigation.evaluate((node) => getComputedStyle(node).overflowY), "auto");
    await navigation.locator("a").last().scrollIntoViewIfNeeded();
    assert.ok(await navigation.locator("a").last().evaluate((node) => {
      const bounds = node.getBoundingClientRect();
      const menu = node.closest("nav").getBoundingClientRect();
      return bounds.top >= Math.max(0, menu.top) && bounds.bottom <= Math.min(window.innerHeight, menu.bottom);
    }));
  } finally {
    await context.close();
  }
});

test("internship rows align consistently and SmartSens details fit all layouts", async () => {
  const context = await contextFor();
  try {
    const tab = await context.newPage();
    await tab.emulateMedia({ reducedMotion: "reduce" });
    for (const width of [320, 390, 768, 820, 1024, 1440]) {
      await tab.setViewportSize({ width, height: 900 });
      for (const language of languages) {
        await tab.goto(new URL(pageFile("index.html", language) + "#work-experience", baseUrl).href);
        const rows = await tab.locator(".work-experience-role").evaluateAll((nodes) => nodes.map((node) => ({
          company: node.closest("article").querySelector(".work-experience-company").getBoundingClientRect().toJSON(),
          location: node.closest("article").querySelector(".work-experience-meta").getBoundingClientRect().toJSON(),
          position: node.querySelector(".work-experience-position").getBoundingClientRect().toJSON(),
          timing: node.querySelector(".work-experience-entry-timing").getBoundingClientRect().toJSON()
        })));
        assert.equal(rows.length, 4);
        for (const row of rows) {
          assert.ok(width <= 768 ? row.timing.top >= row.position.bottom - 1 : row.timing.left >= row.position.right - 1,
            `${language} role and date overlap or are reordered at ${width}px`);
          assert.ok(row.position.left >= 0 && row.position.right <= width + 1);
          assert.ok(row.timing.left >= 0 && row.timing.right <= width + 1);
          assert.ok(row.position.top >= Math.max(row.company.bottom, row.location.bottom) - 1);
          assert.ok(Math.abs(row.company.left - row.position.left) <= 1);
          if (width <= 768) {
            assert.ok(row.location.top >= row.company.bottom - 1);
            assert.ok(Math.abs(row.location.left - row.timing.left) <= 1);
          } else {
            assert.ok(row.location.left >= row.company.right - 1);
            assert.ok(Math.abs(row.location.right - row.timing.right) <= 1);
            assert.ok(Math.abs(row.location.top - row.company.top) < 10);
            assert.ok(Math.abs(row.timing.top - row.position.top) < 10);
          }
        }
        for (let index = 1; index < rows.length; index++) {
          assert.ok(rows[index].position.top >= Math.max(rows[index - 1].position.bottom, rows[index - 1].timing.bottom));
        }
        if (width === 390 || width === 1440) {
          await tab.locator("#work-experience").screenshot({ path: path.join(screenshots, `internships-home-${language}-${width}.png`) });
        }

        await tab.goto(new URL(pageFile("work/smartsens/index.html", language), baseUrl).href);
        assert.ok(await tab.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
        const assignments = await tab.locator(".work-period-assignment").evaluateAll((nodes) => nodes.map((node) => ({
          row: node.getBoundingClientRect().toJSON(),
          period: node.children[0].getBoundingClientRect().toJSON(),
          department: node.children[1].getBoundingClientRect().toJSON()
        })));
        assert.equal(assignments.length, 2);
        assert.ok(assignments[1].row.top >= assignments[0].row.bottom);
        for (const { row, period, department } of assignments) {
          assert.ok(row.left >= 0 && row.right <= width + 1);
          assert.ok(department.left >= period.right - 1 || department.top >= period.bottom - 1,
            `${language} department overlaps its period at ${width}px`);
        }
        const meta = await tab.locator(".work-detail-meta").boundingBox();
        const overview = await tab.locator(".work-detail-section").first().boundingBox();
        assert.ok(overview.y >= meta.y + meta.height);
        if (width === 390 || width === 1440) {
          await tab.screenshot({ path: path.join(screenshots, `smartsens-detail-${language}-${width}.png`), fullPage: true });
        }
      }
    }
  } finally {
    await context.close();
  }
});

test("homepage navigation and language links follow scrolling instead of an old hash", async () => {
  const context = await contextFor();
  try {
    const tab = await context.newPage();
    await tab.emulateMedia({ reducedMotion: "reduce" });
    for (const width of [390, 1440]) {
      await tab.setViewportSize({ width, height: 900 });
      for (const language of languages) {
        const route = pageFile("index.html", language);
        await tab.goto(new URL(route + "?preview=1#projects", baseUrl).href);
        await tab.waitForFunction(() => document.querySelector('a[aria-current="location"]').getAttribute("href").endsWith("#projects"));
        await tab.evaluate(() => document.querySelector("#work-experience").scrollIntoView());
        await tab.waitForFunction(() => document.querySelector('a[aria-current="location"]').getAttribute("href").endsWith("#work-experience"));
        assert.equal(new URL(await tab.locator('.language-option[data-language="zh-CN"]').first().getAttribute("href")).hash, "#work-experience");

        await tab.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
        await tab.waitForFunction(() => document.querySelector('a[aria-current="location"]').getAttribute("href").endsWith("#research-outputs"));
        assert.equal(new URL(await tab.locator('.language-option[data-language="en"]').first().getAttribute("href")).hash, "#research-outputs");

        await tab.evaluate(() => window.scrollTo(0, 0));
        await tab.waitForFunction(() => document.querySelector('a[aria-current="location"]').getAttribute("href").endsWith("#education"));
        assert.equal(new URL(await tab.locator('.language-option[data-language="en"]').first().getAttribute("href")).hash, "");
      }
    }
    await tab.setViewportSize({ width: 1440, height: 900 });
    await tab.goto(baseUrl + "?preview=1#projects");
    await tab.waitForFunction(() => document.querySelector('a[aria-current="location"]').getAttribute("href").endsWith("#projects"));
    await tab.mouse.move(1200, 800);
    await tab.mouse.wheel(0, 500);
    await tab.waitForFunction(() => document.querySelector('a[aria-current="location"]').getAttribute("href").endsWith("#research-outputs"));
    await tab.evaluate(() => document.querySelector("#work-experience").scrollIntoView());
    await tab.waitForFunction(() => document.querySelector('a[aria-current="location"]').getAttribute("href").endsWith("#work-experience"));
    await tab.locator('.language-option[data-language="zh-CN"]:visible').click();
    await tab.waitForURL("**/zh/?preview=1#work-experience");
    await tab.screenshot({ path: path.join(screenshots, "navigation-after-manual-scroll.png") });
  } finally {
    await context.close();
  }
});

test("fixed sidebars keep the language control reachable in short windows", async () => {
  const context = await contextFor();
  try {
    const tab = await context.newPage();
    for (const viewport of [{ width: 1024, height: 360 }, { width: 844, height: 390 }, { width: 1440, height: 900 }]) {
      await tab.setViewportSize(viewport);
      for (const language of languages) {
        for (const route of ["index.html", "projects/dongqiudipure-android/index.html"]) {
          await tab.goto(new URL(pageFile(route, language), baseUrl).href);
          const sidebar = tab.locator(".profile-sidebar");
          assert.equal(await sidebar.evaluate((node) => getComputedStyle(node).position), "fixed");
          assert.equal(await sidebar.evaluate((node) => getComputedStyle(node).overflowY), "auto");
          await sidebar.evaluate((node) => { node.scrollTop = node.scrollHeight; });
          const control = tab.locator(".language-switcher-sidebar");
          assert.ok(await control.evaluate((node) => {
            const bounds = node.getBoundingClientRect();
            const container = node.closest("aside").getBoundingClientRect();
            return bounds.top - 11 >= container.top && bounds.bottom + 11 <= Math.min(innerHeight, container.bottom);
          }), `${language} language hit area is clipped at ${viewport.width}x${viewport.height}`);
          assert.equal(await tab.evaluate(() => scrollY), 0);
          await tab.screenshot({ path: path.join(screenshots, `sidebar-${language}-${viewport.width}-${route === "index.html" ? "home" : "detail"}.png`) });
          const alternate = language === "en" ? "zh-CN" : "en";
          await control.locator(`[data-language="${alternate}"]`).click();
          await tab.waitForFunction((lang) => document.documentElement.lang === lang, alternate);
        }
      }
    }
  } finally {
    await context.close();
  }
});

test("Escape dismisses desktop submenus and they reopen on a new focus or hover", async () => {
  const context = await contextFor({ viewport: { width: 1440, height: 900 } });
  try {
    const tab = await context.newPage();
    for (const route of ["", "zh/projects/dongqiudipure-android/"]) {
      await tab.goto(baseUrl + route);
      for (const id of ["navigation-work", "navigation-projects", "navigation-research"]) {
        const trigger = tab.locator(`#${id}`);
        const submenu = tab.locator(`.navigation-submenu[aria-labelledby="${id}"]`);
        await trigger.focus();
        await submenu.waitFor({ state: "visible" });
        await tab.keyboard.press("Tab");
        assert.equal(await submenu.locator("a").first().evaluate((node) => node === document.activeElement), true);
        await tab.keyboard.press("Escape");
        await submenu.waitFor({ state: "hidden" });
        assert.equal(await trigger.evaluate((node) => node === document.activeElement), true);
        await tab.keyboard.press("Tab");
        assert.equal(await submenu.evaluate((node) => node.contains(document.activeElement)), false);
        await trigger.focus();
        await submenu.waitFor({ state: "visible" });
        await tab.keyboard.press("Escape");
        await submenu.waitFor({ state: "hidden" });
      }
      await tab.locator('nav > a[href$="#education"]').focus();
      const submenu = tab.locator('.navigation-submenu[aria-labelledby="navigation-projects"]');
      await tab.locator("#navigation-projects").hover();
      await submenu.waitFor({ state: "visible" });
      await tab.keyboard.press("Escape");
      await submenu.waitFor({ state: "hidden" });
      await tab.mouse.move(20, 200);
      await tab.locator("#navigation-projects").hover();
      await submenu.waitFor({ state: "visible" });
    }
    await tab.setViewportSize({ width: 844, height: 390 });
    await tab.locator(".menu-toggle").click();
    await tab.keyboard.press("Escape");
    assert.equal(await tab.locator(".menu-toggle").getAttribute("aria-expanded"), "false");
  } finally {
    await context.close();
  }
});

test("language links retain page, section and query context; legacy URLs redirect", async () => {
  const context = await contextFor({ viewport: { width: 1440, height: 900 } });
  try {
    const tab = await context.newPage();
    await tab.goto(baseUrl + "?preview=1#projects");
    await tab.locator("#projects").scrollIntoViewIfNeeded();
    await tab.locator('.language-option[data-language="zh-CN"]:visible').click();
    await tab.waitForURL("**/zh/?preview=1#projects");
    await tab.locator('.project-title a[href*="repopilot-agent"]').click();
    await tab.waitForURL("**/zh/projects/repopilot-agent/index.html");
    await tab.locator('.language-option[data-language="en"]:visible').click();
    await tab.waitForURL("**/projects/repopilot-agent/");
    assert.equal(await tab.locator("html").getAttribute("lang"), "en");

    for (const page of pages) {
      await tab.goto(new URL(page.path + "?lang=zh-CN&preview=1#retained", baseUrl).href);
      const target = new URL(pageUrl(page.path, "zh-CN")).pathname + "?preview=1#retained";
      await tab.waitForURL(baseUrl.slice(0, -1) + target);
      assert.equal(await tab.locator("html").getAttribute("lang"), "zh-CN");
      assert.equal(await tab.locator('link[rel="canonical"]').getAttribute("href"), pageUrl(page.path, "zh-CN"));
    }
    await tab.goto(baseUrl + "zh/work/smartsens/?lang=en#retained");
    await tab.waitForURL(baseUrl + "work/smartsens/#retained");
    assert.equal(await tab.locator("html").getAttribute("lang"), "en");
  } finally {
    await context.close();
  }
});

test("file previews open all pages and support language links and legacy queries", async () => {
  const context = await contextFor();
  try {
    const tab = await context.newPage();
    const errors = [];
    tab.on("pageerror", (error) => errors.push(error.message));
    for (const { language, file } of variants) {
      await tab.goto(pathToFileURL(path.join(rootDirectory, file)).href);
      assert.equal(await tab.locator("html").getAttribute("lang"), language, file);
    }
    const original = pathToFileURL(path.join(rootDirectory, "index.html"));
    await tab.goto(original.href + "?lang=zh-CN#projects");
    await tab.waitForURL(pathToFileURL(path.join(rootDirectory, "zh/index.html")).href + "#projects");
    await tab.locator('.language-option[data-language="en"]:visible').click();
    await tab.waitForURL(original.href + "#projects");
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});

test("Dongqiudi screenshots use responsive previews and open all six originals", async () => {
  const context = await contextFor();
  try {
    const tab = await context.newPage();
    await tab.emulateMedia({ reducedMotion: "reduce" });
    for (const width of [390, 820, 1440]) {
      await tab.setViewportSize({ width, height: 900 });
      for (const language of languages) {
        const requests = [];
        const trackRequest = (request) => requests.push(request.url());
        tab.on("request", trackRequest);
        try {
          await tab.goto(new URL(pageFile("projects/dongqiudipure-android/index.html", language), baseUrl).href);
          const images = tab.locator(".project-screenshot img");
          assert.equal(await images.count(), 6);
          for (const image of await images.all()) {
            await image.scrollIntoViewIfNeeded();
            await image.evaluate((node) => node.decode());
            assert.ok(await image.evaluate((node) => {
              const canvas = document.createElement("canvas");
              canvas.width = canvas.height = 32;
              const context = canvas.getContext("2d");
              context.drawImage(node, 0, 0, 32, 32);
              const pixels = context.getImageData(0, 0, 32, 32).data;
              const colors = new Set();
              for (let index = 0; index < pixels.length; index += 4) colors.add(`${pixels[index]},${pixels[index + 1]},${pixels[index + 2]}`);
              return colors.size > 50 && node.currentSrc.endsWith(".webp");
            }));
          }
          assert.equal(requests.some((url) => /dongqiudipure-android\/[^/]+\.png$/.test(url)), false);
          assert.equal(await images.evaluateAll((nodes) => new Set(nodes.map((node) => node.sizes)).size), 1);
          assert.equal(await tab.locator(".project-screenshot-grid").evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(" ").length), width >= 1024 ? 3 : 2);
          assert.ok(await tab.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
          await tab.evaluate(() => scrollTo(0, 0));
          await tab.screenshot({ path: path.join(screenshots, `dongqiudi-${language}-${width}.png`), fullPage: true });

          await tab.locator(".project-screenshot a").first().click();
          await tab.waitForFunction(() => document.activeElement?.classList.contains("pswp"));
          const captions = await tab.locator(".project-screenshot figcaption").allTextContents();
          for (let index = 0; index < 6; index++) {
            if (index) await tab.locator(".pswp__button--arrow--next").click();
            await tab.waitForFunction((caption) => document.querySelector("#gallery-caption")?.textContent === caption, captions[index]);
            const source = await tab.locator(".project-screenshot a").nth(index).getAttribute("href");
            await tab.waitForFunction((url) => [...document.querySelectorAll(".pswp__img")].some((image) => image.src === url && image.naturalWidth === 1080), new URL(source, tab.url()).href);
          }
          await tab.keyboard.press("Escape");
          await tab.locator(".pswp--open").waitFor({ state: "detached" });
        } finally {
          tab.off("request", trackRequest);
        }
      }
    }
  } finally {
    await context.close();
  }
});

test("translated galleries and citation controls still work", async () => {
  const context = await contextFor({ viewport: { width: 390, height: 844 }, permissions: ["clipboard-read", "clipboard-write"] });
  try {
    const tab = await context.newPage();
    for (const project of ["dongqiudipure-android", "tiebapure-android", "repopilot-agent", "adaptive-strategic-ai-mod-for-civilization-vi"]) {
      await tab.goto(baseUrl + `zh/projects/${project}/`);
      await tab.locator(".project-screenshot a").first().click();
      await tab.locator(".pswp--open").waitFor();
      assert.equal(await tab.locator(".pswp--open").getAttribute("aria-label"), translations["zh-CN"].galleryLabel);
      await tab.waitForFunction(() => [...document.querySelectorAll(".pswp__img")].some((image) => image.naturalWidth > 0));
      await tab.waitForFunction(() => document.activeElement?.classList.contains("pswp"));
      await tab.screenshot({ path: path.join(screenshots, `${project}-viewer-mobile.png`) });
      await tab.keyboard.press("Escape");
      await tab.locator(".pswp--open").waitFor({ state: "detached" });
    }
    await tab.goto(baseUrl + "zh/publications/option-based-hierarchical-uav-networks/");
    const expected = (await tab.locator("[data-citation-text]").textContent()).trim();
    await tab.locator("[data-copy-citation]").click();
    await tab.waitForFunction(() => document.querySelector("[data-copy-citation]").getAttribute("aria-label") === "已复制");
    assert.equal(await tab.evaluate(() => navigator.clipboard.readText()), expected);
    const examples = [
      ["", "home-en-desktop", 1440, 900],
      ["zh/", "home-zh-desktop", 1440, 900],
      ["zh/", "home-zh-mobile", 390, 844],
      ["zh/projects/repopilot-agent/", "project-zh-tablet", 820, 900],
      ["zh/work/smartsens/", "work-zh-desktop", 1440, 900],
      ["zh/publications/option-based-hierarchical-uav-networks/", "publication-zh-mobile", 390, 844]
    ];
    for (const [route, name, width, height] of examples) {
      await tab.setViewportSize({ width, height });
      await tab.goto(baseUrl + route);
      await tab.screenshot({ path: path.join(screenshots, name + ".png"), fullPage: true });
    }
  } finally {
    await context.close();
  }
});
