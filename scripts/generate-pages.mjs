import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { load } from "cheerio";
import parseSrcset from "parse-srcset";
import translations from "../translations.js";
import { pages, person, siteOrigin } from "./site.config.mjs";

export const rootDirectory = fileURLToPath(new URL("../", import.meta.url));
const pageFiles = new Set(pages.map((page) => page.path));
const languages = ["en", "zh-CN"];

export const pageFile = (sourceFile, language) => `${language === "zh-CN" ? "zh/" : ""}${sourceFile}`;
export const pageUrl = (sourceFile, language) => new URL(pageFile(sourceFile, language).replace(/index\.html$/, ""), siteOrigin).href;
const relativeFile = (fromFile, toFile) => path.posix.relative(path.posix.dirname(fromFile), toFile);

function rebaseUrl(value, sourceFile, outputFile, language) {
  if (value.startsWith("#")) return value;
  const url = new URL(value, new URL(sourceFile, siteOrigin));
  if (url.origin !== new URL(siteOrigin).origin) return value;
  let target = url.pathname.slice(1);
  if (!target || target.endsWith("/")) target += "index.html";
  if (pageFiles.has(target)) {
    target = pageFile(target, language);
    url.searchParams.delete("lang");
  }
  return relativeFile(outputFile, target) + url.search + url.hash;
}

function renderPage(source, page, language) {
  const $ = load(source);
  const sourceFile = page.path;
  const outputFile = pageFile(sourceFile, language);
  const labels = translations[language];
  $("html").attr("lang", language);

  for (const [attribute, target] of [["data-i18n", null], ["data-i18n-alt", "alt"], ["data-i18n-aria-label", "aria-label"]]) {
    $(`[${attribute}]`).each((_, node) => {
      const key = $(node).attr(attribute);
      if (typeof labels[key] !== "string") throw new Error(`Missing ${language} translation: ${key} in ${sourceFile}`);
      if (target) $(node).attr(target, labels[key]);
      else $(node).text(labels[key]);
    });
  }
  $(".menu-toggle").attr("aria-label", labels.openNavigation);
  $("[data-copy-citation]").attr("title", labels.copyCitationLabel);

  if (language === "zh-CN") {
    $("title").text(page.zhTitle);
    $('meta[name="description"]').attr("content", page.zhDescription);
    $("[href], [src]").not('link[rel="canonical"], link[rel="alternate"][hreflang], .language-option').each((_, node) => {
      for (const attribute of ["href", "src"]) {
        const value = $(node).attr(attribute);
        if (value) $(node).attr(attribute, rebaseUrl(value, sourceFile, outputFile, language));
      }
    });
    $("[srcset]").each((_, node) => {
      const candidates = parseSrcset($(node).attr("srcset"));
      $(node).attr("srcset", candidates.map(({ url, w, h, d }) => [
        rebaseUrl(url, sourceFile, outputFile, language),
        w === undefined ? "" : `${w}w`,
        h === undefined ? "" : `${h}h`,
        d === undefined ? "" : `${d}x`
      ].filter(Boolean).join(" ")).join(", "));
    });
  }

  $(".language-option").each((_, node) => {
    const targetLanguage = $(node).attr("data-language");
    if (!languages.includes(targetLanguage)) throw new Error(`Unknown language: ${targetLanguage}`);
    const link = $("<a></a>").attr({
      class: $(node).attr("class"),
      href: relativeFile(outputFile, pageFile(sourceFile, targetLanguage)),
      "data-language": targetLanguage,
      lang: targetLanguage,
      hreflang: targetLanguage
    }).text($(node).text());
    if (targetLanguage === language) link.attr("aria-current", "true");
    $(node).replaceWith(link);
  });

  let headAnchor = $("title");
  const headElement = (selector, tag) => {
    let element = $(selector);
    if (element.length > 1) throw new Error(`Duplicate ${selector} in ${sourceFile}`);
    if (!element.length) {
      element = $(`<${tag}></${tag}>`);
      headAnchor.after("\n    ", element);
    }
    headAnchor = element;
    return element;
  };
  const canonical = pageUrl(sourceFile, language);
  headElement('link[rel="canonical"]', "link").attr({ rel: "canonical", href: canonical });
  for (const alternate of [...languages, "x-default"]) {
    headElement(`link[rel="alternate"][hreflang="${alternate}"]`, "link").attr({
      rel: "alternate",
      hreflang: alternate,
      href: pageUrl(sourceFile, alternate === "zh-CN" ? alternate : "en")
    });
  }
  if (sourceFile === "index.html") {
    const profile = {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      "@id": `${canonical}#profile`,
      url: canonical,
      name: $("title").text(),
      inLanguage: language,
      mainEntity: { ...person, description: labels.profileSummary }
    };
    headElement("#profile-data", "script").attr({ id: "profile-data", type: "application/ld+json" })
      .text("\n" + JSON.stringify(profile, null, 2).replaceAll("<", "\\u003c").split("\n").map((line) => `      ${line}`).join("\n") + "\n    ");
  }

  const runtime = $('script[src$="script.js"]');
  if (runtime.length !== 1) throw new Error(`Expected one site script in ${sourceFile}`);
  if (!$('script[src$="translations.js"]').length) {
    runtime.before($("<script></script>").attr({ src: relativeFile(outputFile, "translations.js"), defer: "" }), "\n    ");
  }
  // HTML parsing moves whitespace after </html> into the body; normalize it for repeatable builds.
  const tail = $("body").contents().last();
  if (tail[0]?.type === "text" && !tail.text().trim()) tail.remove();
  $("body").append("\n  ").after("\n");
  $("html").prepend("\n  ").before("\n");
  return $.html().trimEnd() + "\n";
}

function renderSitemap() {
  const $ = load('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml"></urlset>', { xml: true });
  const urlset = $("urlset");
  for (const page of pages) {
    for (const language of languages) {
      const entry = $("<url></url>");
      entry.append("\n    ", $("<loc></loc>").text(pageUrl(page.path, language)));
      for (const alternate of [...languages, "x-default"]) {
        entry.append("\n    ", $("<xhtml:link></xhtml:link>").attr({
          rel: "alternate",
          hreflang: alternate,
          href: pageUrl(page.path, alternate === "zh-CN" ? alternate : "en")
        }));
      }
      entry.append("\n  ");
      urlset.append("\n  ", entry);
    }
  }
  urlset.append("\n");
  return $.xml() + "\n";
}

export async function generatePages({ check = false } = {}) {
  const outputs = new Map();
  for (const page of pages) {
    const source = (await readFile(path.join(rootDirectory, page.path), "utf8")).replaceAll("\r\n", "\n");
    const english = renderPage(source, page, "en");
    outputs.set(page.path, english);
    outputs.set(pageFile(page.path, "zh-CN"), renderPage(english, page, "zh-CN"));
  }
  outputs.set("sitemap.xml", renderSitemap());
  const changed = [];
  for (const [file, content] of outputs) {
    const destination = path.join(rootDirectory, file);
    const previous = await readFile(destination, "utf8").catch((error) => {
      if (error.code === "ENOENT") return null;
      throw error;
    });
    if (previous?.replaceAll("\r\n", "\n") !== content) {
      changed.push(file);
      if (!check) {
        await mkdir(path.dirname(destination), { recursive: true });
        await writeFile(destination, content);
      }
    }
  }
  if (check && changed.length) throw new Error(`Generated pages are out of date. Run npm run build:\n${changed.join("\n")}`);
  return changed;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes("--check");
  const changed = await generatePages({ check });
  console.log(check ? "All 18 pages and the sitemap are up to date." : `Generated 18 pages and the sitemap; ${changed.length} files updated.`);
}
