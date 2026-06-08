# Catalyx Shopify Import Guide

Use `docs/shopify-products-import.csv` as the first Shopify product import draft.

Supporting files:

- `docs/shopify-product-metafields.csv`: Matrixify-style product metafields for app routes, QR feed chart URLs, front/rear label PDFs, master chart PDFs, and product role metadata.
- `docs/shopify-product-asset-map.csv`: product-to-asset map for front label PNG/PDF, rear label PNG/PDF, SKU tile, QR chart URL, and app product URL.
- `docs/shopify-theme/`: Liquid sections for Shopify product and collection templates.

## What It Contains

- 9 live Catalyx launch SKUs.
- Shopify handles matching app product IDs.
- Variant sizes:
  - A-X PRO and B-X PRO: `1L`, `5L`
  - ROOT-X, VITAL-X, PK-X, RIPEN-X, MICRO-X, TRACE-X, FLUSH-X: `250ML`, `1L`
- Draft prices based on current app placeholder prices.
- Product tags for collections and search.
- Product QR links in product descriptions.
- Draft status for every product.

## What Must Be Confirmed Before Publishing

- Final RRP and wholesale pricing.
- Final weights and shipping dimensions.
- Inventory quantity.
- Barcode/GTIN fields.
- Final dosage/feed values after manufacturer confirmation.
- Final product photo URLs hosted by Shopify CDN or public image CDN.

## Recommended Shopify Collections

- `all`
- `core-nutrients`
- `additives`
- `specialist`

These map to the local app routes:

- `/collections/all`
- `/collections/core-nutrients`
- `/collections/additives`
- `/collections/specialist`

## Image Handling

The CSV intentionally leaves `Image Src` blank because Shopify imports require publicly reachable image URLs. The current app product photos are generated from locked local assets:

- Front label: `lib/catalyx-assets.ts`
- Rear label/feed chart: `lib/catalyx-assets.ts`
- Product mockup rendering: `components/ProductVisual.tsx`

Before Shopify import, either:

1. Upload final product renders to Shopify and attach them manually.
2. Host the render assets publicly and add those URLs to `Image Src`.
3. Export static product renders from the app and upload them to Shopify Files.

## Safe Import Process

1. Import `docs/shopify-products-import.csv`.
2. Keep products in `draft`.
3. Confirm variants, SKUs, taxes, shipping, and collections.
4. Attach final product images or use `docs/shopify-product-asset-map.csv` to locate label/render sources.
5. Import or manually create metafields from `docs/shopify-product-metafields.csv`.
6. Add Liquid sections from `docs/shopify-theme/sections`.
7. Add real inventory.
8. Publish only after label/feed values and commercial data are confirmed.

## Recommended Metafields

Create these product metafields before importing the metafield CSV:

| Namespace | Key | Type |
| --- | --- | --- |
| `custom` | `app_product_id` | Single line text |
| `custom` | `app_product_url` | URL |
| `custom` | `qr_feed_chart_url` | URL |
| `custom` | `front_label_pdf` | URL |
| `custom` | `rear_label_pdf` | URL |
| `custom` | `master_feed_chart_pdf` | URL |
| `custom` | `colour_reference_pdf` | URL |
| `custom` | `stage_window` | Single line text |
| `custom` | `product_role` | Single line text |
