# Catalyx Shopify Theme Sections

This folder contains Shopify Liquid sections that mirror the Catalyx app storefront work.

## Files

- `sections/catalyx-product-labels.liquid`
  - Add to product templates.
  - Reads product metafields from `docs/shopify-product-metafields.csv`.
  - Shows QR feed chart, app product guide, front/rear label PDFs, master chart, colour reference, product role, and stage window.

- `sections/catalyx-collection-router.liquid`
  - Add to collection templates.
  - Adds Catalyx collection navigation plus links to feed chart, product guide, and safety pages.

## Install

1. Open Shopify admin.
2. Go to `Online Store` -> `Themes`.
3. Duplicate the active theme before editing.
4. Open `Edit code`.
5. Create the matching files under `sections/`.
6. Paste each Liquid file into Shopify.
7. Add the sections to the relevant product and collection templates in the theme customizer.

## Required Product Metafields

Create the metafields listed in `docs/shopify-import-guide.md` before using `catalyx-product-labels.liquid`.

At minimum:

- `custom.qr_feed_chart_url`
- `custom.app_product_url`
- `custom.front_label_pdf`
- `custom.rear_label_pdf`
- `custom.master_feed_chart_pdf`
- `custom.colour_reference_pdf`
- `custom.stage_window`
- `custom.product_role`

## Notes

The links in the generated CSVs are app-relative paths. Before using them in a live Shopify store, decide whether Shopify should link to:

- the deployed Catalyx app domain,
- Shopify-hosted files,
- or CDN-hosted label/feed assets.

For production, prefer absolute URLs in Shopify metafields.
