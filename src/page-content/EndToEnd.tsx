'use client'
import BlockEditor from '../components/BlockEditor'
import { usePageState } from '../lib/usePageState'
import type { Block } from '../lib/blocks'

const DEFAULT_BLOCKS: Block[] = [
  {
    id: 'e2e-h1',
    type: 'heading',
    level: 1,
    text: 'The Hourly Pipeline',
  },
  {
    id: 'e2e-t1',
    type: 'text',
    text: 'Every hour, data flows through 8 layers. Source systems generate operational data — orders, shipments, products, user activity. Lakeflow Connect captures changes via logical replication (PostgreSQL) and change streams (MongoDB). Raw data lands in floranow_catalog.bronze.* as streaming tables. dbt Core transforms Bronze → Silver (views) → Gold (tables). A Serverless SQL Warehouse serves queries to AI/BI Dashboards, Genie Spaces, and SQL Editor.\n\nEnd-to-end latency: ~20–30 minutes from a source change to dashboard visibility.',
  },
  { id: 'e2e-d0', type: 'divider' },
  {
    id: 'e2e-h-flow',
    type: 'heading',
    level: 2,
    text: 'Visual Pipeline — 8 Layers',
  },
  {
    id: 'e2e-flow1',
    type: 'flow',
    steps: [
      { emoji: '🗄️', title: 'Sources', subtitle: '3 PostgreSQL + MongoDB', color: '#6366F1' },
      { emoji: '📥', title: 'Lakeflow Connect', subtitle: 'CDC, serverless', color: '#22C55E' },
      { emoji: '🥉', title: 'Bronze', subtitle: 'Raw Delta, streaming tables', color: '#CD7F32' },
      { emoji: '🔧', title: 'dbt Staging', subtitle: 'Views, cleaning', color: '#94A3B8' },
      { emoji: '🥈', title: 'Silver', subtitle: 'Typed, deduped', color: '#64748B' },
      { emoji: '📐', title: 'dbt Marts', subtitle: 'Tables, aggregation', color: '#EAB308' },
      { emoji: '🥇', title: 'Gold', subtitle: 'KPIs, metrics', color: '#F59E0B' },
      { emoji: '📊', title: 'Consumption', subtitle: 'SQL Warehouse + Dashboards + Genie', color: '#EC4899' },
    ],
  },
  { id: 'e2e-d1', type: 'divider' },
  {
    id: 'e2e-h2',
    type: 'heading',
    level: 1,
    text: 'Step-by-Step with Timing',
  },
  {
    id: 'e2e-h-s1',
    type: 'heading',
    level: 2,
    text: 'Source Systems',
  },
  {
    id: 'e2e-s1-cards',
    type: 'card-grid',
    columns: 2,
    cards: [
      {
        emoji: '🐘',
        title: 'PostgreSQL (3 databases, ~208 GB)',
        description: 'ERP (170 GB) — orders, products, customers, finance.\nMP (35 GB) — marketplace transactions.\nVendor (48 MB) — vendor shipments.\n\nAll on AWS RDS eu-central-1. Logical replication enabled (wal_level=logical). See Ingestion page for full setup.',
        accent: '#6366F1',
      },
      {
        emoji: '🍃',
        title: 'MongoDB (1 database, 2.62 GB)',
        description: 'App data — user activity, documents, events.\nAtlas cluster or EC2 in eu-central-1.\nChange streams via Spark MongoDB Connector.\nStored as VARIANT in Bronze.\n\nSee Ingestion page for connector configuration.',
        accent: '#22C55E',
      },
    ],
  },
  { id: 'e2e-d2', type: 'divider' },
  {
    id: 'e2e-h-timing',
    type: 'heading',
    level: 2,
    text: 'Pipeline Timing',
  },
  {
    id: 'e2e-tbl-timing',
    type: 'table',
    headers: ['Stage', 'Component', 'Trigger', 'Duration', 'Data Freshness After'],
    rows: [
      ['Ingestion (PG)', 'Lakeflow Connect CDC', 'Continuous', '1–3 min', '< 5 minutes'],
      ['Ingestion (Mongo)', 'Spark Structured Streaming', 'Every 5 min', '2–5 min', '< 10 minutes'],
      ['Bronze Landing', 'Streaming Tables (Delta)', 'Automatic', 'Instant', 'Same as ingestion'],
      ['dbt run (Silver)', 'Lakeflow Jobs', 'Hourly (:30)', '~5–10 min', '< 1.5 hours'],
      ['dbt run (Gold)', 'Lakeflow Jobs', 'Same job', '~5–10 min', '< 1.5 hours'],
      ['Dashboard Refresh', 'SQL Warehouse + Cache', 'On query', '1–5 sec', 'Real-time from Gold'],
      ['Genie Response', 'SQL Warehouse + Photon', 'On demand', '2–10 sec', 'Real-time from Gold'],
      ['End-to-End', 'Full pipeline cycle', 'Hourly', '~20–30 min', '< 1 hour from source'],
    ],
  },
  { id: 'e2e-d3', type: 'divider' },
  {
    id: 'e2e-h-orch',
    type: 'heading',
    level: 1,
    text: 'Orchestration',
  },
  {
    id: 'e2e-t-orch',
    type: 'text',
    text: 'Lakeflow Jobs orchestrates the pipeline as a DAG. Ingestion runs continuously and independently. dbt runs hourly on a schedule. Dashboard caches invalidate automatically when Gold tables update.',
  },
  {
    id: 'e2e-code-orch',
    type: 'code',
    code: 'Ingestion (continuous, independent)\n    ↓ Bronze tables updated\ndbt Job (hourly, scheduled at :30 past each hour)\n    ├── dbt deps (install packages)\n    ├── dbt run --target prod (Silver views + Gold tables)\n    └── dbt test --target prod (data quality checks)\n    ↓ Gold tables updated\nDashboard Cache Invalidation (automatic)\n    ↓ Result cache cleared for changed tables\nUsers query fresh data',
  },
  { id: 'e2e-d4', type: 'divider' },
  {
    id: 'e2e-h-monitor',
    type: 'heading',
    level: 1,
    text: 'Monitoring with System Tables',
  },
  {
    id: 'e2e-t-monitor',
    type: 'text',
    text: 'Databricks system tables provide built-in observability across cost, performance, and freshness — no external tools required.',
  },
  {
    id: 'e2e-code-monitor',
    type: 'code',
    code: '-- 1. Monitor pipeline costs (system.billing.usage)\nSELECT\n  usage_date,\n  sku_name,\n  billing_origin_product,\n  SUM(usage_quantity) AS total_dbus\nFROM system.billing.usage\nWHERE usage_date >= DATEADD(DAY, -7, CURRENT_DATE())\n  AND workspace_id = current_workspace_id()\nGROUP BY 1, 2, 3\nORDER BY total_dbus DESC;\n\n-- 2. Monitor query performance (system.query.history)\nSELECT\n  user_name,\n  warehouse_id,\n  statement_type,\n  duration / 1000 AS duration_seconds,\n  rows_produced,\n  read_bytes / (1024*1024) AS read_mb,\n  start_time\nFROM system.query.history\nWHERE start_time >= DATEADD(HOUR, -24, CURRENT_TIMESTAMP())\nORDER BY duration DESC\nLIMIT 20;\n\n-- 3. Monitor data freshness\nSELECT\n  table_catalog, table_schema, table_name,\n  last_altered,\n  TIMESTAMPDIFF(MINUTE, last_altered, CURRENT_TIMESTAMP()) AS minutes_stale\nFROM system.information_schema.tables\nWHERE table_catalog = \'floranow_catalog\'\n  AND table_schema IN (\'bronze\', \'silver\', \'gold\')\nORDER BY minutes_stale DESC;\n\n-- 4. Set up cost alert (AI/BI Dashboard alert)\n-- Create a dashboard widget with:\nSELECT SUM(usage_quantity) AS daily_dbus\nFROM system.billing.usage\nWHERE usage_date = CURRENT_DATE();\n-- Set alert: "Notify when daily_dbus > 100"',
  },
  { id: 'e2e-d5', type: 'divider' },
  {
    id: 'e2e-call-sla',
    type: 'callout',
    variant: 'info',
    text: 'Data Freshness SLA — Target: all Gold metrics are < 1 hour old during business hours (8 AM–8 PM AST). MongoDB-sourced data is < 10 minutes old (near real-time change streams). Monitor with the freshness query above. Alert if any Gold table is > 90 minutes stale.',
  },
  { id: 'e2e-d6', type: 'divider' },
  {
    id: 'e2e-h-error',
    type: 'heading',
    level: 1,
    text: 'Error Recovery',
  },
  {
    id: 'e2e-error-flow',
    type: 'flow',
    steps: [
      { emoji: '❌', title: 'Pipeline Fails', subtitle: 'Job run fails or times out', color: '#EF4444' },
      { emoji: '🔄', title: 'Auto-Retry', subtitle: 'Lakeflow Jobs retries (default 2)', color: '#F59E0B' },
      { emoji: '🔔', title: 'Alert', subtitle: 'Email to data-team@floranow.com', color: '#8B5CF6' },
      { emoji: '🔍', title: 'Investigate', subtitle: 'Lakeflow UI — logs, lineage', color: '#6366F1' },
      { emoji: '🛠️', title: 'Fix & Re-trigger', subtitle: 'Manual run from Lakeflow Jobs', color: '#22C55E' },
    ],
  },
  { id: 'e2e-d7', type: 'divider' },
  {
    id: 'e2e-h-recovery',
    type: 'heading',
    level: 2,
    text: 'Recovery Strategies by Layer',
  },
  {
    id: 'e2e-tbl-recovery',
    type: 'table',
    headers: ['Layer', 'Failure Mode', 'Recovery', 'Impact'],
    rows: [
      ['Ingestion (PG)', 'Connection lost', 'Lakeflow reconnects automatically from last checkpoint', 'No data loss, WAL replayed'],
      ['Ingestion (Mongo)', 'Change stream broken', 'Restart from checkpoint in /Volumes/.../mongodb', 'May need initial full reload if checkpoint expired'],
      ['Bronze', 'Schema change upstream', 'Lakeflow detects and evolves schema automatically', 'New columns added, no data loss'],
      ['dbt (Silver/Gold)', 'SQL error in model', 'Fix SQL, re-run dbt run --select model_name+', 'Only affected models and downstream refreshed'],
      ['SQL Warehouse', 'Warehouse suspended', 'Auto-resumes on next query (2–6 second startup)', 'Brief delay for first query'],
      ['Dashboard', 'Stale data', 'Check dbt job status, re-trigger if needed', 'Users see last successful refresh'],
    ],
  },
  { id: 'e2e-d8', type: 'divider' },
  {
    id: 'e2e-call-xref',
    type: 'callout',
    variant: 'info',
    text: 'Cross-References — Ingestion setup details → Ingestion page. Bronze/Silver/Gold structure → Warehousing page. dbt job configuration → dbt page. Dashboard and Genie setup → BI and AI/Genie pages. Week-by-week implementation → Roadmap page.',
  },
]

export default function EndToEnd() {
  const { blocks, updateBlock, addBlock, removeBlock, saveStatus, forceSave } = usePageState('page:endtoend', DEFAULT_BLOCKS)

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="pl-10">
        <BlockEditor blocks={blocks} updateBlock={updateBlock} addBlock={addBlock} removeBlock={removeBlock} saveStatus={saveStatus} onSave={forceSave} />
      </div>
    </div>
  )
}
