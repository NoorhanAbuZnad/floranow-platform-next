import { type Node, type Edge } from '@xyflow/react'

function makeNode(
  id: string,
  x: number,
  y: number,
  label: string,
  colors: { bg: string; border: string; text: string },
  shape: string = 'rounded',
): Node {
  return {
    id,
    type: 'shape',
    position: { x, y },
    data: {
      label,
      shape,
      bgColor: colors.bg,
      borderColor: colors.border,
      textColor: colors.text,
    },
  }
}

const SRC = { bg: '#EEF2FF', border: '#6366F1', text: '#4338CA' }
const ING = { bg: '#F0FDF4', border: '#22A652', text: '#15803D' }
const BRZ = { bg: '#FDF4E8', border: '#CD7F32', text: '#92400E' }
const SIL = { bg: '#F1F5F9', border: '#8C9EAF', text: '#334155' }
const GLD = { bg: '#FFFBEB', border: '#D4A017', text: '#92400E' }
const WH  = { bg: '#F5F3FF', border: '#8B5CF6', text: '#6D28D9' }
const BI  = { bg: '#FDF2F8', border: '#EC4899', text: '#BE185D' }
const AI  = { bg: '#FFFBEB', border: '#F59E0B', text: '#B45309' }
const CAT = { bg: '#F0F9FF', border: '#0EA5E9', text: '#0369A1' }

export const initialNodes: Node[] = [
  // Sources
  makeNode('pg-erp',    0,   0,  '🐘 PostgreSQL ERP\n170 GB', SRC, 'cylinder'),
  makeNode('pg-mp',     220, 0,  '🐘 PostgreSQL MP\n35 GB', SRC, 'cylinder'),
  makeNode('pg-vendor', 440, 0,  '🐘 PostgreSQL Vendor\n48 MB', SRC, 'cylinder'),
  makeNode('mongodb',   660, 0,  '🍃 MongoDB\n2.62 GB', SRC, 'cylinder'),

  // Ingestion
  makeNode('lakeflow',   110, 180, '🔗 Lakeflow Connect\nQBC / AUTO CDC', ING, 'rounded'),
  makeNode('spark-conn', 530, 180, '⚡ Spark Connector\nChange Streams', ING, 'rounded'),

  // Bronze
  makeNode('bronze',       60,  370, '🥉 Bronze Layer\nRaw Data — Exact Copy', BRZ, 'rounded'),
  makeNode('bronze-mongo', 460, 370, '🥉 Bronze MongoDB\nVARIANT — Raw JSON', BRZ, 'rounded'),

  // Silver
  makeNode('silver', 250, 540, '🥈 Silver Layer\nCleaned · Typed · Deduplicated', SIL, 'hexagon'),

  // Gold
  makeNode('gold', 250, 700, '🥇 Gold Layer\nKPIs · Metrics · Business-Ready', GLD, 'hexagon'),

  // Compute & Governance
  makeNode('sql-wh', 60,  880, '⚙️ SQL Warehouse\nX-Small Serverless + Photon', WH, 'rectangle'),
  makeNode('dbt',    360, 880, '🔧 dbt Core\n~65 Tables · Lakeflow Jobs', ING, 'rectangle'),
  makeNode('unity',  640, 880, '🛡️ Unity Catalog\nGovernance · Access Control', CAT, 'rectangle'),

  // Consumption
  makeNode('dashboards', 20,  1080, '📊 AI/BI Dashboards\n11 Dashboards · 60-70 Users', BI, 'rounded'),
  makeNode('genie',      290, 1080, '💬 Genie Spaces\nNatural Language · 2-3 Spaces', BI, 'rounded'),
  makeNode('mosaic',     570, 1080, '🤖 Mosaic AI\nML / MLflow · AI Agents', AI, 'rounded'),
]

const edgeBase = { type: 'editable' as const, animated: true, style: { stroke: '#22A652', strokeWidth: 2 } }

export const initialEdges: Edge[] = [
  { id: 'e-erp-lf',       source: 'pg-erp',      target: 'lakeflow',     ...edgeBase },
  { id: 'e-mp-lf',        source: 'pg-mp',        target: 'lakeflow',     ...edgeBase },
  { id: 'e-vendor-lf',    source: 'pg-vendor',    target: 'lakeflow',     ...edgeBase },
  { id: 'e-mongo-spark',  source: 'mongodb',      target: 'spark-conn',   ...edgeBase },

  { id: 'e-lf-bronze',    source: 'lakeflow',     target: 'bronze',       ...edgeBase },
  { id: 'e-spark-bronze', source: 'spark-conn',   target: 'bronze-mongo', ...edgeBase },

  { id: 'e-bronze-silver',  source: 'bronze',       target: 'silver', ...edgeBase, data: { label: 'dbt staging' } },
  { id: 'e-bronzem-silver', source: 'bronze-mongo', target: 'silver', ...edgeBase, data: { label: 'dbt staging' } },

  { id: 'e-silver-gold', source: 'silver', target: 'gold', ...edgeBase, data: { label: 'dbt marts' } },

  { id: 'e-gold-wh',    source: 'gold', target: 'sql-wh', ...edgeBase },
  { id: 'e-gold-dbt',   source: 'gold', target: 'dbt',    ...edgeBase },
  { id: 'e-gold-unity', source: 'gold', target: 'unity',  ...edgeBase },

  { id: 'e-wh-dash',     source: 'sql-wh', target: 'dashboards', ...edgeBase },
  { id: 'e-wh-genie',    source: 'sql-wh', target: 'genie',      ...edgeBase },
  { id: 'e-unity-mosaic', source: 'unity',  target: 'mosaic',     ...edgeBase },
]
