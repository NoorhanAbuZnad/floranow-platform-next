import { type Node, type Edge } from '@xyflow/react'

function n(
  id: string, x: number, y: number, label: string,
  colors: { bg: string; border: string; text: string },
  shape = 'rounded',
): Node {
  return { id, type: 'shape', position: { x, y }, data: { label, shape, bgColor: colors.bg, borderColor: colors.border, textColor: colors.text } }
}

const SRC = { bg: '#EEF2FF', border: '#6366F1', text: '#4338CA' }
const ING = { bg: '#F0FDF4', border: '#22A652', text: '#15803D' }
const BRZ = { bg: '#FDF4E8', border: '#CD7F32', text: '#92400E' }
const SIL = { bg: '#F1F5F9', border: '#8C9EAF', text: '#334155' }
const GLD = { bg: '#FFFBEB', border: '#D4A017', text: '#92400E' }
const PLT = { bg: '#F5F3FF', border: '#8B5CF6', text: '#6D28D9' }
const BI  = { bg: '#FDF2F8', border: '#EC4899', text: '#BE185D' }
const AI  = { bg: '#FFFBEB', border: '#F59E0B', text: '#B45309' }
const CAT = { bg: '#F0F9FF', border: '#0EA5E9', text: '#0369A1' }

export const diagramNodes: Node[] = [
  // ── Sources row ──
  n('d-erp',    0,   0,  '🐘 PostgreSQL ERP\n170 GB · Orders · Products · Finance', SRC, 'cylinder'),
  n('d-mp',     300, 0,  '🐘 PostgreSQL MP\n35 GB · Marketplace', SRC, 'cylinder'),
  n('d-vendor', 600, 0,  '🐘 PostgreSQL Vendor\n48 MB · Vendor & Shipment', SRC, 'cylinder'),
  n('d-mongo',  900, 0,  '🍃 MongoDB\n2.62 GB · App Data · Documents', SRC, 'cylinder'),

  // ── Ingestion row ──
  n('d-lakeflow', 200,  180, '🔗 Lakeflow Connect\nQBC / AUTO CDC\nManaged · Serverless', ING, 'rounded'),
  n('d-spark',    750,  180, '⚡ Spark MongoDB Connector\nChange Streams · Real-time CDC', ING, 'rounded'),

  // ── Bronze row ──
  n('d-brz-pg',    100, 370, '💾 Bronze Tables\nPostgreSQL Data\nExact source copy', BRZ, 'rounded'),
  n('d-brz-mongo', 700, 370, '💾 Bronze MongoDB\nVARIANT column\nRaw JSON documents', BRZ, 'rounded'),

  // ── Silver row ──
  n('d-stg-orders',       0,   560, '📋 stg_orders', SIL, 'rectangle'),
  n('d-stg-products',     220, 560, '📋 stg_products', SIL, 'rectangle'),
  n('d-stg-customers',    440, 560, '📋 stg_customers', SIL, 'rectangle'),
  n('d-stg-transactions', 660, 560, '📋 stg_transactions', SIL, 'rectangle'),
  n('d-stg-app',          880, 560, '📋 stg_app_data', SIL, 'rectangle'),

  // ── Gold row ──
  n('d-mart-revenue',   0,   740, '📊 mart_revenue', GLD, 'hexagon'),
  n('d-mart-sales',     220, 740, '📊 mart_sales', GLD, 'hexagon'),
  n('d-mart-ops',       440, 740, '📊 mart_operations', GLD, 'hexagon'),
  n('d-dim-customers',  660, 740, '📊 dim_customers', GLD, 'hexagon'),
  n('d-dim-products',   880, 740, '📊 dim_products', GLD, 'hexagon'),

  // ── Compute & Governance row ──
  n('d-sqlwh', 100,  940, '⚙️ SQL Warehouse\nX-Small Serverless\nPhoton · Auto-suspend 10m', PLT, 'rectangle'),
  n('d-dbt',   440,  940, '🔧 dbt Core\n~65 Tables\nLakeflow Jobs · Hourly', ING, 'rectangle'),
  n('d-unity', 780,  940, '🛡️ Unity Catalog\nGovernance\nRLS · Lineage · Access', CAT, 'rectangle'),

  // ── Consumption row ──
  n('d-dash',   60,  1140, '📊 AI/BI Dashboards\n11 Dashboards · 60-70 Users', BI, 'rounded'),
  n('d-genie',  420, 1140, '💬 Genie Spaces\nNatural Language\nSales · Ops · Supply', BI, 'rounded'),
  n('d-mosaic', 780, 1140, '🤖 Mosaic AI\nMLflow\nForecasting · Agents', AI, 'rounded'),
]

const eb = { type: 'editable' as const, animated: true, style: { stroke: '#22A652', strokeWidth: 2 } }
const ebDashed = { ...eb, animated: false, style: { ...eb.style, strokeDasharray: '6 3' } }

export const diagramEdges: Edge[] = [
  // Sources → Ingestion
  { id: 'de-erp-lf',     source: 'd-erp',    target: 'd-lakeflow', ...eb },
  { id: 'de-mp-lf',      source: 'd-mp',     target: 'd-lakeflow', ...eb },
  { id: 'de-vendor-lf',  source: 'd-vendor', target: 'd-lakeflow', ...eb },
  { id: 'de-mongo-spark', source: 'd-mongo', target: 'd-spark',    ...eb },

  // Ingestion → Bronze
  { id: 'de-lf-brz',    source: 'd-lakeflow', target: 'd-brz-pg',    ...eb, data: { label: 'Hourly Batch' } },
  { id: 'de-spark-brz', source: 'd-spark',    target: 'd-brz-mongo', ...eb, data: { label: 'Near Real-time' } },

  // Bronze → Silver
  { id: 'de-brz-orders',  source: 'd-brz-pg', target: 'd-stg-orders',       ...eb, data: { label: 'dbt staging' } },
  { id: 'de-brz-prod',    source: 'd-brz-pg', target: 'd-stg-products',     ...eb, data: { label: 'dbt staging' } },
  { id: 'de-brz-cust',    source: 'd-brz-pg', target: 'd-stg-customers',    ...eb, data: { label: 'dbt staging' } },
  { id: 'de-brz-trans',   source: 'd-brz-pg', target: 'd-stg-transactions', ...eb, data: { label: 'dbt staging' } },
  { id: 'de-brzm-app',    source: 'd-brz-mongo', target: 'd-stg-app',       ...eb, data: { label: 'dbt staging' } },

  // Silver → Gold
  { id: 'de-ord-rev',   source: 'd-stg-orders',       target: 'd-mart-revenue',  ...eb, data: { label: 'dbt marts' } },
  { id: 'de-ord-sales', source: 'd-stg-orders',       target: 'd-mart-sales',    ...eb, data: { label: 'dbt marts' } },
  { id: 'de-prod-dim',  source: 'd-stg-products',     target: 'd-dim-products',  ...eb, data: { label: 'dbt marts' } },
  { id: 'de-cust-dim',  source: 'd-stg-customers',    target: 'd-dim-customers', ...eb, data: { label: 'dbt marts' } },
  { id: 'de-trans-ops', source: 'd-stg-transactions', target: 'd-mart-ops',      ...eb, data: { label: 'dbt marts' } },

  // Gold → SQL Warehouse
  { id: 'de-rev-wh',   source: 'd-mart-revenue',  target: 'd-sqlwh', ...eb },
  { id: 'de-sales-wh', source: 'd-mart-sales',    target: 'd-sqlwh', ...eb },
  { id: 'de-ops-wh',   source: 'd-mart-ops',      target: 'd-sqlwh', ...eb },
  { id: 'de-dcust-wh', source: 'd-dim-customers', target: 'd-sqlwh', ...eb },
  { id: 'de-dprod-wh', source: 'd-dim-products',  target: 'd-sqlwh', ...eb },

  // dbt → Silver/Gold (dashed)
  { id: 'de-dbt-sil', source: 'd-dbt', target: 'd-stg-customers', ...ebDashed, data: { label: 'transforms' } },
  { id: 'de-dbt-gld', source: 'd-dbt', target: 'd-mart-ops',      ...ebDashed, data: { label: 'transforms' } },

  // Unity → governance (dashed)
  { id: 'de-uni-brz', source: 'd-unity', target: 'd-brz-mongo',     ...ebDashed, data: { label: 'governs' } },
  { id: 'de-uni-sil', source: 'd-unity', target: 'd-stg-app',       ...ebDashed, data: { label: 'governs' } },
  { id: 'de-uni-gld', source: 'd-unity', target: 'd-dim-products',  ...ebDashed, data: { label: 'governs' } },

  // SQL Warehouse → Consumption
  { id: 'de-wh-dash',  source: 'd-sqlwh', target: 'd-dash',   ...eb },
  { id: 'de-wh-genie', source: 'd-sqlwh', target: 'd-genie',  ...eb },
  { id: 'de-wh-mosaic', source: 'd-sqlwh', target: 'd-mosaic', ...eb },
]
