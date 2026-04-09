'use client'
import BlockEditor from '../components/BlockEditor'
import { usePageState } from '../lib/usePageState'
import type { Block } from '../lib/blocks'

const DEFAULT_BLOCKS: Block[] = [
  {
    id: 'mig-h0',
    type: 'heading',
    level: 1,
    text: 'Migration: Old Stack → Databricks Lakehouse',
  },

  // ── Executive Summary ──
  {
    id: 'mig-h1',
    type: 'heading',
    level: 2,
    text: 'Executive Summary',
  },
  {
    id: 'mig-t1',
    type: 'text',
    text: 'Floranow is consolidating five separate cloud tools — Hevo Data (ingestion), Google BigQuery (warehouse), dbt Cloud (transforms), Looker Studio (BI), and Vertex AI (ML) — into a single Databricks Lakehouse running on AWS eu-central-1 (Frankfurt).\n\nThe data team consists of 2 analysts (one Senior, one Junior who also handles ML) managing the entire pipeline end-to-end. Source data flows from 3 PostgreSQL databases (~208 GB combined) and 1 MongoDB instance (2.62 GB). The transformation layer currently runs ~65 dbt models producing clean analytical tables. On the consumption side, 11 dashboards serve 60–70 viewers with an hourly refresh cadence.\n\nUnity Catalog serves as the single governance layer across all data assets — connections, tables, models, dashboards, and secrets. The target architecture: one platform, one bill, AI-ready from day one.',
  },
  { id: 'mig-d0', type: 'divider' },

  // ── Platform at a Glance ──
  {
    id: 'mig-h2',
    type: 'heading',
    level: 2,
    text: 'Platform at a Glance',
  },
  {
    id: 'mig-tbl1',
    type: 'table',
    headers: ['Dimension', 'Value', 'Databricks Component'],
    rows: [
      ['Source Databases', '3 PostgreSQL + 1 MongoDB (~210 GB total)', 'Lakeflow Connect (PostgreSQL CDC) + Spark MongoDB Connector'],
      ['Data Team', '2 analysts (Sr. + Jr., also ML)', 'Databricks Academy + Workspace RBAC'],
      ['Warehouse Size', '~100 GB logical (Delta Lake on S3)', 'X-Small Serverless SQL Warehouse (6 DBU/hr)'],
      ['Transforms', '~65 dbt models (staging → intermediate → mart)', 'dbt Core + dbt-databricks adapter + Lakeflow Jobs'],
      ['Dashboards', '11 dashboards, 60–70 viewers', 'AI/BI Dashboards + Genie Spaces'],
      ['AI / ML', 'Demand forecasting, anomaly detection', 'Mosaic AI + MLflow (experiment tracking, model registry, serving)'],
      ['Refresh Cadence', 'Hourly', 'Lakeflow Jobs (cron: 0 * * * *)'],
      ['Region', 'AWS eu-central-1 (Frankfurt)', 'Same region as source databases — zero cross-cloud transfer'],
      ['Governance', 'Unity Catalog', 'Metastore → Catalog → Schema → Table/View/Model/Connection'],
      ['Storage Format', 'Delta Lake on S3', 'ACID, time travel, Liquid Clustering, Photon-optimized'],
    ],
  },
  { id: 'mig-d1', type: 'divider' },

  // ── Tool-by-Tool Replacement ──
  {
    id: 'mig-h3',
    type: 'heading',
    level: 2,
    text: 'Tool-by-Tool Replacement',
  },
  {
    id: 'mig-t2',
    type: 'text',
    text: 'Each component of the old stack maps directly to a native Databricks capability. The new platform eliminates cross-vendor integration points, reduces five separate failure domains to one, and brings AI capabilities that were previously bolted on through Vertex AI.',
  },
  {
    id: 'mig-cmp',
    type: 'compare',
    leftTitle: '🔴  Old Stack (5 Vendors)',
    rightTitle: '🟢  Databricks Lakehouse (1 Platform)',
    items: [
      {
        old: 'Hevo Data — third-party SaaS ingestion. Polls PostgreSQL hourly via query-based replication, pushes to BigQuery on GCP. No true CDC for MongoDB deletes. Separate vendor, separate billing, cross-cloud data transfer (AWS → GCP). Limited observability into pipeline internals.',
        new: 'Lakeflow Connect — managed Databricks ingestion service (Public Preview). Native PostgreSQL logical replication (WAL-based CDC) captures INSERT, UPDATE, DELETE with minimal source overhead. Serverless ingestion pipelines. Automatic schema evolution. Built-in monitoring via system tables. No separate vendor. See Ingestion page for full implementation.',
      },
      {
        old: 'Google BigQuery — cloud data warehouse on GCP. Data crosses from AWS eu-central-1 to GCP, adding latency and egress cost (~$0.12/GB). Separate IAM (Google Cloud IAM), separate billing, separate governance. No native Delta Lake support.',
        new: 'Delta Lake on S3 + Serverless SQL Warehouse — data stays on AWS eu-central-1 where sources live. ACID transactions, time travel (DESCRIBE HISTORY), Liquid Clustering (replaces Z-ORDER), Photon vectorized engine for 2–8× faster queries. Unity Catalog governance. Single X-Small warehouse auto-suspends after 10 minutes.',
      },
      {
        old: 'dbt Cloud — managed dbt service ($100–500/mo). Runs transforms against BigQuery. Web IDE, job scheduler, hosted documentation. Team has ~65 models across staging/intermediate/mart layers. Separate SaaS contract.',
        new: 'dbt Core (OSS, free) + dbt-databricks adapter — same 65 models, zero rewrite. Runs via Lakeflow Jobs with hourly scheduling, Git-backed version control, native Unity Catalog lineage tracking. Models target floranow_catalog.silver.stg_* and floranow_catalog.gold.mart_*. See dbt page for adapter configuration and SQL conversion guide.',
      },
      {
        old: 'Looker Studio — Google BI tool connected to BigQuery. 11 dashboards, 60–70 viewers. Free tier but tightly coupled to Google ecosystem. 12-hour stale cache. No AI-assisted analytics. No row-level security beyond BigQuery views.',
        new: 'AI/BI Dashboards + Genie Spaces — native Databricks BI. Photon-accelerated live queries against Delta tables (no stale cache). Genie provides natural-language querying — business users ask questions in plain English. Unity Catalog row-level security (RLS) via dynamic views. Smart caching with automatic invalidation on data refresh.',
      },
      {
        old: 'Vertex AI — Google ML platform. Requires data on GCP, separate API, separate compute, separate billing. Experimental usage for demand forecasting. No integration with data warehouse governance.',
        new: 'Mosaic AI + MLflow — built into Databricks workspace. MLflow experiment tracking, model registry (Unity Catalog), Feature Store, Model Serving endpoints, AI agents, vector search. Data never leaves the lakehouse. Train models directly on Delta tables. See Architecture page for AI/ML topology.',
      },
    ],
  },
  { id: 'mig-d2', type: 'divider' },

  // ── Architecture Decisions ──
  {
    id: 'mig-h4',
    type: 'heading',
    level: 2,
    text: 'Why Databricks — Architecture Decisions',
  },
  {
    id: 'mig-t3',
    type: 'text',
    text: 'Every architecture choice was made with Floranow\'s specific context: 2-person team, ~210 GB source data, 65 existing dbt models, sources on AWS eu-central-1. Each decision documents what was chosen, why, and what was rejected.',
  },
  {
    id: 'mig-tbl2',
    type: 'table',
    headers: ['Decision', 'Chosen', 'Why', 'Rejected Alternative'],
    rows: [
      [
        'Platform',
        'Databricks Lakehouse',
        'Sources on AWS, unified ingestion + warehouse + BI + AI, one bill, Unity Catalog governance across all assets',
        'Stay on BigQuery — cross-cloud latency GCP↔AWS, 5 separate tools, 5 separate vendor contracts, no native ingestion',
      ],
      [
        'Region',
        'AWS eu-central-1 (Frankfurt)',
        'Source PostgreSQL & MongoDB already here. Zero data transfer cost. GDPR-compliant EU data residency.',
        'Other regions — unnecessary S3 cross-region egress ($0.02/GB), increased latency to source databases',
      ],
      [
        'Storage Format',
        'Delta Lake',
        'Native to Databricks. ACID transactions, time travel, Liquid Clustering, Photon query optimization, Unity Catalog lineage. Parquet-based open format on S3.',
        'Apache Iceberg — supported via UniForm but not native. Less Photon optimization, weaker Unity Catalog integration, no Liquid Clustering',
      ],
      [
        'Compute',
        'Single X-Small Serverless SQL Warehouse',
        '6 DBU/hr (~$1.32/hr at $0.22/DBU list price). Photon included. Auto-suspend after 10 min. Sufficient for ~100 GB warehouse + 60–70 concurrent viewers at hourly refresh.',
        'Multiple warehouses — unnecessary at this scale. Pro warehouse — $0.55/DBU lacks serverless auto-scaling, no Photon included',
      ],
      [
        'Transforms',
        'dbt Core + Lakeflow Jobs',
        '65 existing dbt models — zero rewrite risk. dbt-databricks adapter v1.9+. Lakeflow Jobs handles scheduling (cron), retries, alerting. Free OSS, Git-backed.',
        'Delta Live Tables (DLT) — requires rewriting all 65 models to Python/SQL notebooks. Steep learning curve for a dbt-experienced team. Better for greenfield.',
      ],
      [
        'Ingestion',
        'Lakeflow Connect',
        'Built-in managed CDC. Serverless pipelines. Automatic schema evolution. PostgreSQL logical replication + MongoDB via Spark connector. No separate vendor.',
        'Keep Hevo — separate SaaS bill (~$500–1,000/mo), no CDC for MongoDB hard deletes, cross-cloud transfer, limited observability',
      ],
      [
        'BI Layer',
        'AI/BI Dashboards + Genie Spaces',
        'Native to Databricks. Photon-accelerated queries. Genie natural-language interface for business users. Unity Catalog RLS. Smart cache invalidation. Zero additional license.',
        'Keep Looker Studio — tied to Google ecosystem, 12h stale cache, no Genie NL queries, requires BigQuery or complex cross-cloud connector',
      ],
      [
        'Migration Path',
        'Path B: Ingestion First',
        'Retire Hevo first (most fragile, highest operational risk). Validate data in Databricks early. Keep BigQuery as temporary read-only safety net during migration.',
        'Path A: dbt First — requires temporary dual-write complexity, leaves Hevo running longer, delays data validation in Databricks',
      ],
    ],
  },
  { id: 'mig-d3', type: 'divider' },

  // ── Migration Path B ──
  {
    id: 'mig-h5',
    type: 'heading',
    level: 2,
    text: 'Migration Path B — Four Phases',
  },
  {
    id: 'mig-t4',
    type: 'text',
    text: 'Path B retires tools in order of operational risk. Each phase has a clear "done" signal and a rollback plan. The key insight: Hevo is the most operationally fragile component — third-party SaaS with no CDC for hard deletes, cross-cloud dependency, and limited observability. Retire it first, validate data integrity in Databricks, then migrate downstream layers.\n\nBigQuery stays as a temporary read-only layer during Phases 2–3, giving the team a safety net while dbt models are ported and dashboards rebuilt.',
  },
  {
    id: 'mig-flow',
    type: 'flow',
    steps: [
      {
        emoji: '1️⃣',
        title: 'Phase 1: Foundation + Ingestion (Week 1–2)',
        subtitle: 'Provision Databricks workspace + Unity Catalog (floranow_catalog with bronze/silver/gold schemas). Configure Lakeflow Connect for all 4 sources (3 PostgreSQL + 1 MongoDB). Run in parallel with Hevo for 1–2 weeks. Validate row counts, freshness, schema daily. → Retire Hevo.',
        color: '#22A652',
      },
      {
        emoji: '2️⃣',
        title: 'Phase 2: dbt Migration (Week 3)',
        subtitle: 'Swap dbt adapter from dbt-bigquery to dbt-databricks v1.9+. Convert BigQuery SQL → Databricks SQL (see dbt page for conversion guide). Schedule via Lakeflow Jobs (cron: 5 * * * *, runs 5 min after ingestion). Validate mart outputs match BigQuery. → Retire dbt Cloud.',
        color: '#0284C7',
      },
      {
        emoji: '3️⃣',
        title: 'Phase 3: BI Rebuild (Week 4)',
        subtitle: 'Rebuild 11 dashboards in AI/BI Dashboards (prioritize 5 P1 dashboards first). Configure Genie Spaces with curated table sets + semantic descriptions for NL queries. Apply Unity Catalog RLS for department-level access. Train 60–70 viewers. → Retire Looker Studio.',
        color: '#9333EA',
      },
      {
        emoji: '4️⃣',
        title: 'Phase 4: Decommission (Week 4+)',
        subtitle: 'Turn off BigQuery reads (verify zero active queries for 1 week). Cancel Hevo, dbt Cloud, and GCP subscriptions. Delete GCP cross-cloud networking. Final state: single Databricks bill + AWS S3 storage.',
        color: '#F59E0B',
      },
    ],
  },
  {
    id: 'mig-c1',
    type: 'callout',
    variant: 'tip',
    text: 'Why Path B? Hevo is the most operationally fragile component — proprietary CDC with limited observability, no hard-delete detection for MongoDB, and a cross-cloud dependency (AWS→GCP). Replacing it first with Lakeflow Connect (built-in, serverless, managed) eliminates the highest-risk dependency. BigQuery remains as a temporary read layer until dashboards are rebuilt, minimizing blast radius if anything goes wrong in Phases 2–3.',
  },
  { id: 'mig-d4', type: 'divider' },

  // ── Risk Mitigation ──
  {
    id: 'mig-h6',
    type: 'heading',
    level: 2,
    text: 'Risk Mitigation',
  },
  {
    id: 'mig-t5',
    type: 'text',
    text: 'Every migration carries risk. The following table identifies the top risks for Floranow\'s migration with concrete mitigations and clear ownership.',
  },
  {
    id: 'mig-tbl3',
    type: 'table',
    headers: ['Risk', 'Impact', 'Mitigation', 'Owner'],
    rows: [
      [
        'Data loss during Hevo → Lakeflow cutover',
        'High',
        'Run Hevo + Lakeflow in parallel for 1–2 weeks. Compare row counts daily using system.information_schema.tables. Validate checksums on key columns. Only cut over at 100% match.',
        'Sr. Analyst',
      ],
      [
        'SQL incompatibility (BigQuery → Databricks SQL)',
        'Medium',
        'Use SQL conversion guide (see dbt page). LLM-assisted rewriting for complex functions (STRUCT, ARRAY, DATE_TRUNC differences). Run comprehensive dbt test suite (dbt test --select all) after each model conversion.',
        'Both Analysts',
      ],
      [
        'Dashboard rebuild exceeds timeline',
        'Medium',
        'Prioritize 5 P1 dashboards first (highest viewer count). Remaining 6 dashboards in Week 5 buffer. Keep Looker Studio read-only as fallback.',
        'Jr. Analyst',
      ],
      [
        'Team unfamiliar with Databricks',
        'Low',
        'Complete Databricks Academy fundamentals (Data Engineer Associate path) before Phase 1. Schedule office hours with Databricks SE during Phases 1–2. Build runbooks for common operations.',
        'Both Analysts',
      ],
      [
        'Performance regression on SQL Warehouse',
        'Medium',
        'Benchmark top 10 slowest queries before migration. Run same queries on X-Small warehouse. Tune with Liquid Clustering keys (CLUSTER BY). Monitor query profiles via system.billing.usage and Query History UI.',
        'Sr. Analyst',
      ],
      [
        'Schema evolution breaks pipelines',
        'Low',
        'Lakeflow Connect handles schema evolution automatically (new columns added, type widening). Enable mergeSchema in Delta write options. MongoDB stored as VARIANT at Bronze — schema-free by design.',
        'Sr. Analyst',
      ],
      [
        'Stakeholder resistance to new BI tool',
        'Low',
        'Demo AI/BI Dashboards + Genie Spaces to leadership early (Week 2). Show natural-language queries answering real business questions. Provide side-by-side comparison of old Looker Studio vs new dashboards.',
        'Sr. Analyst',
      ],
      [
        'Cost overrun',
        'Medium',
        'Start X-Small warehouse (6 DBU/hr). Monitor DBU consumption via system.billing.usage. Set budget alerts at 80%/100% thresholds in Databricks Account Console. Review weekly for first month.',
        'Sr. Analyst',
      ],
    ],
  },
  { id: 'mig-d5', type: 'divider' },

  // ── Cost Comparison ──
  {
    id: 'mig-h7',
    type: 'heading',
    level: 2,
    text: 'Estimated Cost Comparison',
  },
  {
    id: 'mig-t6',
    type: 'text',
    text: 'The old stack spreads cost across five vendors. The new stack consolidates into Databricks + AWS infrastructure. Estimates based on current usage patterns and Databricks list pricing (actual pricing depends on committed-use contract).',
  },
  {
    id: 'mig-cards1',
    type: 'card-grid',
    columns: 2,
    cards: [
      {
        emoji: '🔴',
        title: 'Old Stack — ~$2,200–3,000/month',
        description: 'Hevo Data: ~$500–1,000/mo (event-based pricing, 3 PostgreSQL + 1 MongoDB)\nGoogle BigQuery: ~$400–800/mo (on-demand compute at $6.25/TB scanned + $0.02/GB storage)\ndbt Cloud: ~$100–500/mo (Team plan, 2 developer seats, job runs)\nLooker Studio: Free tier (limited, tied to GCP ecosystem)\nVertex AI: ~$200–500/mo (training compute + endpoint serving)\nGCP↔AWS egress: ~$100–200/mo (~$0.12/GB cross-cloud)\n\nPlus: 5 vendor contracts, 5 billing systems, 5 support channels, 5 separate IAM configurations.',
        borderTop: '#EF4444',
      },
      {
        emoji: '🟢',
        title: 'New Stack — ~$500–900/month',
        description: 'SQL Warehouse X-Small Serverless: ~$300–500/mo\n  (6 DBU/hr × $0.22/DBU × ~8 active hrs/day × 22 days = ~$232/mo base)\n  (auto-suspend 10 min, Photon included, scales to 0 on weekends)\nLakeflow Connect: Included in serverless compute DBU pricing\nLakeflow Jobs (dbt runs): ~$100–200/mo\n  (hourly dbt run × ~3 min × $0.07/DBU Jobs Compute)\nS3 Storage: ~$50–100/mo (~100 GB Delta + versions at $0.023/GB)\nAI/BI Dashboards: Included in SQL Warehouse DBU\nUnity Catalog: Included\n\nSingle vendor, single bill, single IAM, AI included.',
        borderTop: '#22A652',
      },
    ],
  },
  { id: 'mig-d6', type: 'divider' },

  // ── Cost Monitoring Code ──
  {
    id: 'mig-h8',
    type: 'heading',
    level: 3,
    text: 'Cost Monitoring Query',
  },
  {
    id: 'mig-t7',
    type: 'text',
    text: 'Use Databricks system tables to track DBU consumption in real time. Run this from any SQL Warehouse or notebook:',
  },
  {
    id: 'mig-code1',
    type: 'code',
    code: `-- Monitor daily DBU spend from system.billing.usage
SELECT
  usage_date,
  sku_name,
  usage_unit,
  SUM(usage_quantity) AS total_dbus,
  ROUND(SUM(usage_quantity) * 0.22, 2) AS est_cost_usd  -- $0.22/DBU list
FROM system.billing.usage
WHERE usage_date >= CURRENT_DATE - INTERVAL 30 DAYS
  AND workspace_id = CURRENT_WORKSPACE_ID()
GROUP BY usage_date, sku_name, usage_unit
ORDER BY usage_date DESC, total_dbus DESC;

-- Set budget alert: Account Console → Budgets → Create Budget
-- Threshold 1: 80% → email Sr. Analyst
-- Threshold 2: 100% → email both analysts + manager`,
  },
  { id: 'mig-d7', type: 'divider' },

  // ── What You Gain ──
  {
    id: 'mig-c2',
    type: 'callout',
    variant: 'info',
    text: 'Beyond cost savings — Genie Spaces for natural-language queries (zero SQL required for business users), Mosaic AI for demand forecasting and anomaly detection on your existing Delta tables, Unity Catalog for enterprise governance with column-level lineage, Photon for 2–8× faster queries on the same warehouse size, and a single platform that a 2-person team can actually manage without vendor coordination overhead.\n\nSee Warehousing page for SQL Warehouse configuration. See dbt page for model migration guide. See Ingestion page for Lakeflow Connect setup. See BI page for dashboard rebuild plan.',
  },
]

export default function Migration() {
  const { blocks, updateBlock, addBlock, removeBlock } = usePageState('page:migration', DEFAULT_BLOCKS)

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="pl-10">
        <BlockEditor blocks={blocks} updateBlock={updateBlock} addBlock={addBlock} removeBlock={removeBlock} />
      </div>
    </div>
  )
}
