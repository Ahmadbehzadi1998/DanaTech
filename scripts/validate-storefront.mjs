import { readFileSync } from "node:fs";
import { Script } from "node:vm";
import { createHash } from "node:crypto";

const html = readFileSync("index.html", "utf8");
const js = readFileSync("app.js", "utf8");
const css = readFileSync("styles.css", "utf8");
const vercel = JSON.parse(readFileSync("vercel.json", "utf8"));
const arabicHtml = readFileSync("ar/index.html", "utf8");
const robots = readFileSync("robots.txt", "utf8");
const sitemap = readFileSync("sitemap.xml", "utf8");

function assert(condition, message) {
  if (!condition) {
    console.error("FAIL:", message);
    process.exitCode = 1;
  } else {
    console.log("PASS:", message);
  }
}

try {
  new Script(js, { filename: "app.js" });
  assert(true, "external application JavaScript parses");
} catch (error) {
  console.error(error);
  assert(false, "external application JavaScript parses");
}
assert(html.includes('<script src="/app.js" defer></script>'), "HTML loads the deferred same-origin application script");
assert(html.includes('<link rel="stylesheet" href="/styles.css">'), "HTML loads the same-origin stylesheet");
assert(html.includes('rel="canonical" href="https://danatech.vercel.app/"'), "English canonical URL is present");
assert(arabicHtml.includes('<html lang="ar" dir="rtl">'), "Arabic route declares language and RTL direction");
assert(arabicHtml.includes('rel="canonical" href="https://danatech.vercel.app/ar/"'), "Arabic canonical URL is present");
assert(html.includes('hreflang="ar-AE"') && arabicHtml.includes('hreflang="en-AE"'), "language alternates are reciprocal");
assert((html.match(/<article class="product" data-category=/g) || []).length === 100, "English HTML pre-renders all 100 products");
assert((arabicHtml.match(/<article class="product" data-category=/g) || []).length === 100, "Arabic HTML pre-renders all 100 products");
assert(html.includes('application/ld+json') && arabicHtml.includes('application/ld+json'), "both routes include structured data");
assert(robots.includes("Sitemap: https://danatech.vercel.app/sitemap.xml"), "robots.txt advertises sitemap");
assert(sitemap.includes("https://danatech.vercel.app/ar/"), "sitemap includes Arabic route");
assert(!/<script>([\s\S]*?)<\/script>/i.test(html), "there are no inline script blocks");
assert(!/<style>([\s\S]*?)<\/style>/i.test(html), "there are no inline style blocks");
assert(!/\son(?:error|load|click)=/i.test(html + js), "there are no inline event-handler attributes");
assert(js.includes('querySelectorAll(".product-photo")'), "product image fallback uses registered event listeners");

const productsStart = js.indexOf("const products=") + "const products=".length;
const productsEnd = js.indexOf(";" + String.fromCharCode(10) + "const cats=", productsStart);
const catalogue = productsStart >= "const products=".length && productsEnd > productsStart
  ? JSON.parse(js.slice(productsStart, productsEnd))
  : [];
const productCount = catalogue.length;
assert(productCount === 100, "catalogue contains the expected 100 product entries");
assert(catalogue.filter((product) => Number.isInteger(product.digikalaRank)).length === 16, "16 catalogue products carry observed Digikala bestseller ranks");
assert(catalogue.some((product) => product.source === "curated") && catalogue.some((product) => product.source === "digikala"), "catalogue distinguishes ranked Digikala products from curated picks");
assert(catalogue.every((product) => product.tagAr && product.name?.ar && product.desc?.ar), "all 100 products have Arabic names, descriptions and tags");
assert(new Set(catalogue.map((product) => product.id)).size === 100, "all catalogue product IDs are unique");
assert(!js.includes('price:"AED '), "stale fixed AED price snapshots are removed");
assert(js.includes("Check current price") && js.includes("تحقّق من السعر"), "live retailer price guidance is bilingual");
assert(html.includes("16 items have identifiable positions") && arabicHtml.includes("١٦ منتجاً لها رتبة ظاهرة"), "both storefront languages disclose the Digikala ranking scope");
assert(html.includes("DanaTech does not display fixed prices") && html.includes("لا يعرض DanaTech أسعاراً ثابتة"), "price disclosure matches the no-fixed-price catalogue");
assert(!html.includes("displayed prices are indicative snapshots"), "outdated price disclosure is removed");
assert(js.includes('document.documentElement.dir=lang==="ar"?"rtl":"ltr"'), "language switch updates RTL/LTR direction");
assert(js.includes('addEventListener("search"'), "clearing the search field refreshes results");
assert(html.includes('aria-live="polite"'), "product results announce updates accessibly");
assert(css.includes("@media(max-width:600px)"), "mobile layout breakpoint is present");
assert(css.includes("--lapis:#2456ad") && css.includes("--ice:#d9efff"), "Persian blue and icy-blue design tokens are present");
assert(css.includes("backdrop-filter:blur("), "Liquid Glass blur and translucency are enabled");
assert(css.includes("rgba(255,255,255,.") && css.includes("inset 0 1px"), "glass reflections and inner highlights are present");
assert(css.includes("@media(max-width:900px)") && css.includes("@media(max-width:600px)"), "tablet and mobile responsive layouts are present");
assert(css.includes("prefers-reduced-motion:reduce"), "reduced-motion accessibility is preserved");


const headers = vercel.headers?.[0]?.headers ?? [];
const csp = headers.find((header) => header.key === "Content-Security-Policy")?.value ?? "";
const imgSrc = csp.match(/(?:^|; )img-src ([^;]+)/)?.[1] ?? "";
const englishJsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] ?? "";
const arabicJsonLd = arabicHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] ?? "";
const hash = (value) => "'sha256-" + createHash("sha256").update(value).digest("base64") + "'";
assert(englishJsonLd.length > 0 && csp.includes(hash(englishJsonLd)), "English JSON-LD hash is permitted by CSP");
assert(arabicJsonLd.length > 0 && csp.includes(hash(arabicJsonLd)), "Arabic JSON-LD hash is permitted by CSP");
assert(js.includes('document.documentElement.lang==="ar"?"ar":"en"'), "application initializes language from the route");
assert(js.includes('location.assign("/ar/")') && js.includes('location.assign("/")'), "language switching navigates to canonical routes");
assert(js.includes("encodeURIComponent(q)"), "retailer search terms are URL-encoded");

const imageHosts = [
  "ankeruae.ae",
  "cdn.shopify.com",
  "www.ugreen.com",
  "i02.appmifile.com",
  "store.storeimages.cdn-apple.com",
  "soundcoreuae.myshopify.com",
];
for (const host of imageHosts) {
  assert(imgSrc.includes(`https://${host}`), `CSP allows the required image host ${host}`);
}
assert(!imgSrc.split(/\s+/).includes("https:"), "CSP does not allow arbitrary HTTPS image hosts");
assert(!csp.includes("unsafe-inline"), "CSP blocks inline scripts and styles");
assert(headers.some((header) => header.key === "X-Content-Type-Options" && header.value === "nosniff"), "MIME sniffing protection is enabled");
assert(headers.some((header) => header.key === "Strict-Transport-Security" && !header.value.includes("includeSubDomains")), "HSTS is scoped to this hostname");
assert(headers.some((header) => header.key === "Cross-Origin-Opener-Policy" && header.value === "same-origin"), "COOP isolation header is enabled");
assert(csp.includes("script-src-attr") && csp.includes("style-src-attr"), "CSP explicitly blocks inline event and style attributes");
assert(headers.some((header) => header.key === "X-Permitted-Cross-Domain-Policies" && header.value === "none"), "legacy cross-domain policies are disabled");

if (process.exitCode === 1) process.exit(1);
console.log("All DanaTech storefront checks passed.");
