# DanaTech — UAE mobile accessories storefront

A lightweight, responsive bilingual (English/Arabic) storefront for UAE shoppers. Static HTML/CSS/JavaScript; no framework or build step required.

## Features
- English / Arabic switch with RTL layout
- Product search and category filters
- Responsive product cards and reduced-motion support
- Product buttons open Amazon.ae search results in a new tab
- SEO metadata, accessible controls and price/affiliate disclosure

## Deploy on Vercel
Import this repository into Vercel. Framework preset: Other; root directory: repository root; no build command is required. The requested hostname is `danatech.vercel.app`; it must be available and assigned to a Vercel project.

## UAE product research
The initial assortment reflects categories and examples visible in UAE marketplace popularity/bestseller pages checked on 23 October 2026:
- [Noon UAE — Power Bank best sellers](https://www.noon.com/uae-en/category-best-seller/?category_code=power-banks)
- [Noon UAE — Mobile accessories popularity](https://supermall.noon.com/uae-en/electronics-and-mobiles/mobiles-and-accessories/supermall-bestsellers-electronics-ae/?f%5Bmin_offer_price%5D%5B%5D=365_days&isCarouselView=false&limit=50&pageCategory=electronics-and-mobiles&sort%5Bby%5D=popularity&sort%5Bdir%5D=desc)
- [Noon UAE — Headphones & earphones best sellers](https://www.noon.com/uae-en/best-sellers/headphones-24056/)
- [Amazon.ae — Power bank best sellers](https://www.amazon.ae/gp/bestsellers/mobile-phones/12304344031)

The storefront does not display fixed product prices because marketplace prices and availability change. Product buttons open Amazon.ae search results; verify the current price, seller, stock, delivery, warranty and device compatibility on the retailer page. The UI does not claim universal compatibility.

## Affiliate status
Amazon.ae links are ordinary search links without an affiliate tracking ID. No affiliate commission should be expected until the appropriate Associates account is approved and a valid tracking ID is configured. Do not add a tracking ID until approved.

## Quality and security notes
- The Content Security Policy allows images only from the exact product-image hosts used by the catalogue; it does not broadly allow arbitrary remote images.
- Security headers include HSTS and disable unnecessary cross-domain policy behavior.
- Fixed price snapshots are intentionally omitted; customers should confirm live offers with the retailer.

## Notes
- No customer data is collected; no checkout/payment flow is implemented.
- Product cards use a mix of retailer-hosted product image URLs and locally generated SVG fallback illustrations. External image hosts are explicitly allowlisted by the Content Security Policy; if a retailer blocks hotlinking, the fallback illustration remains available.
- Verify retailer prices, availability and specifications before advertising offers.
