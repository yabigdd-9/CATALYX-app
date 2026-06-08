import type { ProductKey } from '@/lib/catalyx'

const frontBase = '/locked-assets/catalyx/front-labels/01_CATALYX_FRONT_LABELS_ONLY'
const rearBase = '/locked-assets/catalyx/rear-labels-with-feed-charts/02_CATALYX_REAR_LABELS_WITH_FEED_CHARTS'
const v17Base = '/locked-assets/catalyx/v17-9sku/CATALYX_v17_9SKU_No_IRONX_System_Update'
const v17AppBase = `${v17Base}/03_APP_ASSETS_9SKU`
const v17FeedChartBase = `${v17Base}/01_FEED_CHARTS_9SKU`
const v17NotesBase = `${v17Base}/05_DATA_AND_MANIFEST`

type LockedLabelAsset = {
  frontLabel: string
  frontLabelPdf: string
  rearLabel: string
  rearLabelPdf: string
}

const fileStems: Record<ProductKey, { code: string; lockedName: string; frontSizes: string[]; rearSizes: string[] }> = {
  'ax-pro': { code: 'AXP', lockedName: 'A-X_PRO', frontSizes: ['1L', '5L'], rearSizes: ['1L', '5L'] },
  'bx-pro': { code: 'BXP', lockedName: 'B-X_PRO', frontSizes: ['1L', '5L'], rearSizes: ['1L', '5L'] },
  'micro-x': { code: 'MIC', lockedName: 'MICRO-X', frontSizes: ['250', '1L'], rearSizes: ['1L'] },
  'root-x': { code: 'ROT', lockedName: 'ROOT-X', frontSizes: ['250', '1L'], rearSizes: ['1L'] },
  'vital-x': { code: 'VIT', lockedName: 'VITAL-X', frontSizes: ['250', '1L'], rearSizes: ['1L'] },
  'pk-x': { code: 'PKX', lockedName: 'PK-X', frontSizes: ['250', '1L'], rearSizes: ['1L'] },
  'ripen-x': { code: 'RIP', lockedName: 'RIPEN-X', frontSizes: ['250', '1L'], rearSizes: ['1L'] },
  'trace-x': { code: 'TRC', lockedName: 'TRACE-X', frontSizes: ['250', '1L'], rearSizes: ['1L'] },
  'flush-x': { code: 'FLS', lockedName: 'FLUSH-X', frontSizes: ['250', '1L'], rearSizes: ['1L'] },
}

function frontFile(productId: ProductKey, size: string, extension: 'png' | 'pdf') {
  const asset = fileStems[productId]
  const displaySize = size === '250' ? '250ML' : size
  return `${frontBase}/CXL-${asset.code}-${size}_${asset.lockedName}_${displaySize}_FRONT_LABEL_v13_REAR_CHART.${extension}`
}

function rearFile(productId: ProductKey, size: string, extension: 'png' | 'pdf') {
  const asset = fileStems[productId]
  return `${rearBase}/CXL-${asset.code}-${size}_${asset.lockedName}_${size}_REAR_LABEL_WITH_LOCKED_FEED_CHART_v15.${extension}`
}

export function getLockedLabelAsset(productId: ProductKey): LockedLabelAsset {
  const primaryFrontSize = fileStems[productId].frontSizes.includes('1L') ? '1L' : fileStems[productId].frontSizes[0]
  const primaryRearSize = fileStems[productId].rearSizes.includes('1L') ? '1L' : fileStems[productId].rearSizes[0]

  return {
    frontLabel: frontFile(productId, primaryFrontSize, 'png'),
    frontLabelPdf: frontFile(productId, primaryFrontSize, 'pdf'),
    rearLabel: rearFile(productId, primaryRearSize, 'png'),
    rearLabelPdf: rearFile(productId, primaryRearSize, 'pdf'),
  }
}

export const lockedFeedCharts = {
  master: {
    png: `${v17FeedChartBase}/CATALYX_Main_Master_Feed_Chart_v17_9SKU_No_IRONX.png`,
    pdf: `${v17FeedChartBase}/CATALYX_Main_Master_Feed_Chart_v17_9SKU_No_IRONX.pdf`,
  },
  oneLitreRear: {
    png: `${v17FeedChartBase}/CATALYX_1L_Rear_Feed_Chart_v17_9SKU_No_IRONX.png`,
    pdf: `${v17FeedChartBase}/CATALYX_1L_Rear_Feed_Chart_v17_9SKU_No_IRONX.pdf`,
  },
  fiveLitreBulkRear: {
    png: `${v17FeedChartBase}/CATALYX_5L_Bulk_Feed_Chart_v17_9SKU_No_IRONX.png`,
    pdf: `${v17FeedChartBase}/CATALYX_5L_Bulk_Feed_Chart_v17_9SKU_No_IRONX.pdf`,
  },
  colourReference: {
    png: `${v17Base}/04_LABEL_AND_RANGE_NOTES_9SKU/CATALYX_9SKU_Core_Range_Colour_Reference_v17.png`,
    pdf: `${v17Base}/04_LABEL_AND_RANGE_NOTES_9SKU/CATALYX_9SKU_Core_Range_Colour_Reference_v17.pdf`,
  },
  sourceCsv: `${v17NotesBase}/CATALYX_9SKU_Launch_Product_List_v17.csv`,
}

export function getLockedFrontLabel(productId: ProductKey) {
  return getLockedLabelAsset(productId).frontLabel
}

export const lockedAppFeedChartAssets = {
  mainCard: `${v17AppBase}/CATALYX_APP_main_feed_chart_card_v17.jpg`,
  mainHero: `${v17AppBase}/CATALYX_APP_main_feed_chart_phone_hero_v17.jpg`,
  oneLitreCard: `${v17AppBase}/CATALYX_APP_one_litre_feed_chart_card_v17.jpg`,
  oneLitreHero: `${v17AppBase}/CATALYX_APP_one_litre_feed_chart_phone_hero_v17.jpg`,
  fiveLitreCard: `${v17AppBase}/CATALYX_APP_five_litre_feed_chart_card_v17.jpg`,
  fiveLitreHero: `${v17AppBase}/CATALYX_APP_five_litre_feed_chart_phone_hero_v17.jpg`,
  colourReferenceCard: `${v17AppBase}/CATALYX_APP_colour_reference_card_v17.jpg`,
  colourReferenceHero: `${v17AppBase}/CATALYX_APP_colour_reference_phone_hero_v17.jpg`,
  mainWide: `${v17AppBase}/CATALYX_APP_main_feed_chart_1440w_v17.jpg`,
  mainWidePrint: `${v17AppBase}/CATALYX_APP_main_feed_chart_1440w_v17.jpg`,
  oneLitreWide: `${v17AppBase}/CATALYX_APP_one_litre_feed_chart_1440w_v17.jpg`,
  oneLitreWidePrint: `${v17AppBase}/CATALYX_APP_one_litre_feed_chart_1440w_v17.jpg`,
  fiveLitreWide: `${v17AppBase}/CATALYX_APP_five_litre_feed_chart_1440w_v17.jpg`,
  fiveLitreWidePrint: `${v17AppBase}/CATALYX_APP_five_litre_feed_chart_1440w_v17.jpg`,
  colourReferenceWide: `${v17AppBase}/CATALYX_APP_colour_reference_1440w_v17.jpg`,
  colourReferenceWidePrint: `${v17AppBase}/CATALYX_APP_colour_reference_1440w_v17.jpg`,
}

const skuTileFiles: Record<ProductKey, string> = {
  'ax-pro': 'CATALYX_APP_SKU_TILE_AX_PRO_v17.png',
  'bx-pro': 'CATALYX_APP_SKU_TILE_BX_PRO_v17.png',
  'micro-x': 'CATALYX_APP_SKU_TILE_MICROX_v17.png',
  'root-x': 'CATALYX_APP_SKU_TILE_ROOTX_v17.png',
  'vital-x': 'CATALYX_APP_SKU_TILE_VITALX_v17.png',
  'pk-x': 'CATALYX_APP_SKU_TILE_PKX_v17.png',
  'trace-x': 'CATALYX_APP_SKU_TILE_TRACEX_v17.png',
  'ripen-x': 'CATALYX_APP_SKU_TILE_RIPENX_v17.png',
  'flush-x': 'CATALYX_APP_SKU_TILE_FLUSHX_v17.png',
}

export function getLockedSkuTile(productId: ProductKey) {
  return `${v17AppBase}/${skuTileFiles[productId]}`
}
