import { readFileSync } from "node:fs";
import { Script } from "node:vm";

const html = readFileSync("index.html", "utf8");
const vercel = JSON.parse(readFileSync("vercel.json", "utf8"));

function assert(condition, message) {
  if (!condition) {
    console.error("FAIL:", message);
    process.exitCode = 1;
  } else {
    console.log("PASS:", message);
  }
}

const inlineScripts = [...html.matchAll(/<script\\b[^>]*>([\\s\\S]*?)<\\/script>/gi)];
assert(inlineScripts.length > 0, "inline storefront script exists");
for (const [index, match] of inlineScripts.entries()) {
  try {
    new Script(match[1], { filename: `index.html:inline-script-${index + 1}` });
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
assert(inlineScripts.length > 0 && process.exitCode !== 1, "inline JavaScript parses");

const productsBlock = html.match(/const products=\\[([\\s\\S]*?)\\n\\];\\nconst cats=/);
const productCount = productsBlock ? [...productsBlock[1].matchAll(/\\{id:"[^"]+"/g)].length : 0;
assert(productCount === 14, "catalogue contains the expected 14 product entries");
assert((html.match(/tagAr:/g) || []).length === 14, "all product tags have Arabic labels");
assert(!html.includes('price:"AED '), "stale fixed AED price snapshots are removed");
assert(html.includes("Check current price") && html.includes("تحقّق من السعر"), "live retailer price guidance is bilingual");
assert(html.includes('document.documentElement.dir=lang==="ar"?"rtl":"ltr"'), "language switch updates RTL/LTR direction");
assert(html.includes('addEventListener("search"'), "clearing the search field refreshes results");
assert(html.includes('aria-live="polite"'), "product results announce updates accessibly");
assert(html.includes("@media(max-width:600px)"), "mobile layout breakpoint is present");

const headers = vercel.headers?.[0]?.headers ?? [];
const csp = headers.find((header) => header.key === "Content-Security-Policy")?.value ?? "";
const imgSrc = csp.match(/(?:^|; )img-src ([^;]+)/)?.[1] ?? "";
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
assert(!imgSrc.split(/\\s+/).includes("https:"), "CSP does not allow arbitrary HTTPS image hosts");
assert(headers.some((header) => header.key === "X-Content-Type-Options" && header.value === "nosniff"), "MIME sniffing protection is enabled");
assert(headers.some((header) => header.key === "Strict-Transport-Security"), "HSTS is configured");
assert(headers.some((header) => header.key === "X-Permitted-Cross-Domain-Policies" && header.value === "none"), "legacy cross-domain policies are disabled");

if (process.exitCode === 1) process.exit(1);
console.log("All DanaTech storefront checks passed.");
