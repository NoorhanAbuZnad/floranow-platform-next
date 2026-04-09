'use client'
import BlockEditor from '../components/BlockEditor'
import { usePageState } from '../lib/usePageState'
import type { Block } from '../lib/blocks'

const DEFAULT_BLOCKS: Block[] = [
  {
    id: 'bp-h0',
    type: 'heading',
    level: 1,
    text: 'Databricks Best Practices',
  },
  {
    id: 'bp-t0',
    type: 'text',
    text: 'Best practices drawn from Databricks official documentation, Delta Lake best practices guide, and real-world Lakehouse implementations. Organized by domain. Every recommendation includes the "why" and references the Floranow-specific context.',
  },
  { id: 'bp-d0', type: 'divider' },

  {
    id: 'bp-h-ingest',
    type: 'heading',
    level: 1,
    text: 'Ingestion Best Practices',
  },
  {
    id: 'bp-cards-ingest',
    type: 'card-grid',
    columns: 2,
    cards: [
      {
        emoji: '📥',
        title: 'Always land raw in Bronze',
        description: 'Never transform during ingestion. Preserve source fidelity for replay, audit, and debugging. Lakeflow Connect streaming tables land data as-is. Databricks docs: "Keep a raw copy of source data in Bronze."',
        accent: '#6366F1',
      },
      {
        emoji: '{ }',
        title: 'Use VARIANT for semi-structured data',
        description: 'MongoDB documents stored as raw JSON in VARIANT column. Parse into typed columns in Silver with variant_get() or :: operator. Eliminates schema evolution headaches at ingest time.',
        accent: '#22C55E',
      },
      {
        emoji: '⚡',
        title: 'Use logical replication for PostgreSQL',
        description: 'WAL-based CDC (wal_level=logical) captures INSERT/UPDATE/DELETE with minimal source overhead. Lakeflow Connect handles replication slots and WAL cleanup automatically.',
        accent: '#F59E0B',
      },
      {
        emoji: '🔄',
        title: 'Idempotent pipelines',
        description: 'Every pipeline run should produce the same result regardless of how many times it runs. Lakeflow Connect\'s streaming tables handle this via checkpointing. dbt\'s incremental models use merge semantics.',
        accent: '#8B5CF6',
      },
      {
        emoji: '⏰',
        title: 'Monitor source freshness',
        description: 'Use dbt source freshness or system.information_schema.tables to check Bronze table freshness. Alert if any Bronze table is > 2 hours stale. See E2E Flow page.',
        accent: '#EF4444',
      },
      {
        emoji: '🧱',
        title: 'Run parallel during cutover',
        description: 'Keep Hevo running alongside Lakeflow for at least 1 week. Compare row counts daily. Only decommission Hevo when 100% match confirmed. See Migration page.',
        accent: '#EC4899',
      },
    ],
  },
  { id: 'bp-d1', type: 'divider' },

  {
    id: 'bp-h-delta',
    type: 'heading',
    level: 1,
    text: 'Delta Lake Best Practices',
  },
  {
    id: 'bp-cards-delta',
    type: 'card-grid',
    columns: 2,
    cards: [
      {
        emoji: '🔲',
        title: 'Use Liquid Clustering (not partitioning)',
        description: 'Databricks recommends Liquid Clustering for ALL new tables. Self-tuning, no small-file problem, works with high-cardinality columns. Use CLUSTER BY AUTO for automatic key selection. Docs: "Databricks recommends using liquid clustering for all new tables."',
        accent: '#6366F1',
      },
      {
        emoji: '🤖',
        title: 'Enable Predictive Optimization',
        description: 'Automatically runs OPTIMIZE, VACUUM, and ANALYZE on UC managed tables. Enabled by default for new accounts. Eliminates manual maintenance scheduling. Docs: "Predictive optimization is the recommended approach for table maintenance."',
        accent: '#22C55E',
      },
      {
        emoji: '📦',
        title: 'Use Unity Catalog managed tables',
        description: 'Managed tables get Predictive Optimization, automatic compaction, and Databricks-managed storage lifecycle. External tables require manual maintenance.',
        accent: '#F59E0B',
      },
      {
        emoji: '🛡️',
        title: 'Schema enforcement + evolution',
        description: 'Use mergeSchema for controlled evolution. Bronze streaming tables auto-evolve. Silver views handle nullability. Gold tables enforce strict schema.',
        accent: '#8B5CF6',
      },
      {
        emoji: '⏳',
        title: 'Set retention for time travel',
        description: 'Default 7 days (168 hours). Extend for audit-critical Gold tables: ALTER TABLE SET TBLPROPERTIES (\'delta.deletedFileRetentionDuration\' = \'interval 30 days\').',
        accent: '#EC4899',
      },
      {
        emoji: '🔁',
        title: 'Use CREATE OR REPLACE TABLE',
        description: 'When rebuilding tables (not incremental), use CRAS instead of DROP+CREATE. Preserves table history, permissions, and downstream references.',
        accent: '#EF4444',
      },
    ],
  },
  { id: 'bp-d2', type: 'divider' },

  {
    id: 'bp-h-dbt',
    type: 'heading',
    level: 1,
    text: 'dbt Best Practices',
  },
  {
    id: 'bp-cards-dbt',
    type: 'card-grid',
    columns: 2,
    cards: [
      {
        emoji: '👁️',
        title: 'Silver as views, Gold as tables',
        description: 'Silver views are always fresh (computed on read), zero storage cost. Gold tables are pre-materialized for dashboard performance. Databricks recommendation: "Materialize only where performance requires it."',
        accent: '#6366F1',
      },
      {
        emoji: '📄',
        title: 'One model per file',
        description: 'Single responsibility. Easy to test, easy to debug, easy to find. Name convention: stg_[source]__[entity].sql for staging, mart_[domain].sql or dim_[entity].sql for marts.',
        accent: '#22C55E',
      },
      {
        emoji: '🔗',
        title: 'Always use ref() and source()',
        description: 'Never hardcode table names. ref() creates the DAG. source() connects to Bronze. This enables environment isolation (dev/prod) and lineage tracking.',
        accent: '#F59E0B',
      },
      {
        emoji: '🧪',
        title: 'Test every model',
        description: 'not_null, unique on primary keys, accepted_values on status columns, relationships between fact and dimension tables. Run in CI on every PR. Docs: "Tests are assertions about your models."',
        accent: '#8B5CF6',
      },
      {
        emoji: '📝',
        title: 'Document in YAML',
        description: 'Column descriptions in schema.yml flow to Unity Catalog table/column comments. Living documentation that stays in sync with code. Enable with persist_docs in dbt_project.yml.',
        accent: '#EC4899',
      },
      {
        emoji: '📈',
        title: 'Use incremental models for large Gold tables',
        description: 'For tables like mart_revenue that grow daily, use materialized=\'incremental\' with merge strategy. Only process new rows. Reduces dbt run time significantly.',
        accent: '#EF4444',
      },
    ],
  },
  { id: 'bp-d3', type: 'divider' },

  {
    id: 'bp-h-wh',
    type: 'heading',
    level: 1,
    text: 'SQL Warehouse Best Practices',
  },
  {
    id: 'bp-cards-wh',
    type: 'card-grid',
    columns: 2,
    cards: [
      {
        emoji: '⏸️',
        title: 'Auto-suspend at 10 minutes',
        description: 'During business hours, the warehouse stays warm from regular queries. After hours, it suspends and costs $0. This single setting saves ~60% on compute costs. Docs: "Configure auto-stop to avoid paying for idle resources."',
        accent: '#6366F1',
      },
      {
        emoji: '🔬',
        title: 'Start X-Small, scale up only when proven',
        description: 'At ~100 GB and 60–70 users, X-Small (6 DBU/hr) with Photon is sufficient. Scale to Small only when p95 query time > 10s or dbt run > 30 min consistently.',
        accent: '#22C55E',
      },
      {
        emoji: '⚡',
        title: 'Use serverless (not classic or pro)',
        description: 'Serverless warehouses start in 2–6 seconds, include Photon, support Intelligent Workload Management (IWM), and eliminate cluster management overhead.',
        accent: '#F59E0B',
      },
      {
        emoji: '💾',
        title: 'Result cache is your friend',
        description: 'Enabled by default. Dashboard reloads that hit unchanged data return in < 100 ms. Don\'t disable it. Cache invalidates automatically when Delta tables are updated.',
        accent: '#8B5CF6',
      },
      {
        emoji: '🔍',
        title: 'Monitor via system tables',
        description: 'system.query.history for slow queries, system.billing.usage for cost tracking, system.information_schema for metadata. Build a monitoring dashboard in AI/BI.',
        accent: '#EC4899',
      },
      {
        emoji: '1️⃣',
        title: 'Single warehouse for small teams',
        description: 'With 2 analysts and 60–70 viewers, one warehouse is simpler to manage, monitor, and cost-optimize. Split only if dbt runs block dashboard queries.',
        accent: '#EF4444',
      },
    ],
  },
  { id: 'bp-d4', type: 'divider' },

  {
    id: 'bp-h-bi',
    type: 'heading',
    level: 1,
    text: 'BI Best Practices',
  },
  {
    id: 'bp-cards-bi',
    type: 'card-grid',
    columns: 2,
    cards: [
      {
        emoji: '🥇',
        title: 'Build dashboards on Gold only',
        description: 'Never query Bronze or Silver from dashboards. Gold tables are pre-aggregated, well-documented, and governed. Silver/Bronze are for engineers.',
        accent: '#EAB308',
      },
      {
        emoji: '🎛️',
        title: 'Parameterized queries',
        description: 'Use {{ parameter }} for date ranges, regions, segments. One dashboard serves all use cases. Reduces maintenance from N dashboards to 1.',
        accent: '#6366F1',
      },
      {
        emoji: '🔒',
        title: 'Row-level security over separate dashboards',
        description: 'Use Unity Catalog row filters instead of creating per-region dashboards. One dashboard, one query, personalized results per user.',
        accent: '#8B5CF6',
      },
      {
        emoji: '🔄',
        title: 'Schedule P2/P3 refreshes',
        description: 'Not all dashboards need live data. Schedule lower-priority dashboards to refresh every 30 minutes. Saves compute and improves response time.',
        accent: '#F59E0B',
      },
      {
        emoji: '🧞',
        title: 'Prep tables for Genie',
        description: 'Add COMMENT ON TABLE and ALTER COLUMN ... COMMENT for every Gold table and column. Genie accuracy is directly proportional to metadata quality. See AI/Genie page.',
        accent: '#22C55E',
      },
    ],
  },
  { id: 'bp-d5', type: 'divider' },

  {
    id: 'bp-h-cost',
    type: 'heading',
    level: 1,
    text: 'Cost Optimization',
  },
  {
    id: 'bp-cards-cost',
    type: 'card-grid',
    columns: 2,
    cards: [
      {
        emoji: '📏',
        title: 'Monitor system.billing.usage weekly',
        description: 'Track DBU consumption by SKU, workspace, job. Build a cost dashboard. Set alerts for daily spend exceeding budget.',
        accent: '#6366F1',
      },
      {
        emoji: '⏸️',
        title: 'Aggressive auto-suspend',
        description: '10 minutes for interactive, 5 minutes for batch-only warehouses. Zero cost when idle. The #1 cost lever.',
        accent: '#22C55E',
      },
      {
        emoji: '🔬',
        title: 'Right-size warehouses',
        description: 'Don\'t provision Medium "just in case." X-Small + Photon handles most workloads. Scale up only with evidence.',
        accent: '#F59E0B',
      },
      {
        emoji: '🔲',
        title: 'Liquid Clustering reduces scan cost',
        description: 'Properly clustered tables skip 80–90% of files. Fewer files scanned = fewer DBUs consumed = lower cost.',
        accent: '#8B5CF6',
      },
      {
        emoji: '☁️',
        title: 'Use serverless compute',
        description: 'Serverless Jobs, serverless SQL, serverless pipelines. Pay only for active seconds. No idle cluster costs.',
        accent: '#EC4899',
      },
      {
        emoji: '🗑️',
        title: 'Clean up unused resources',
        description: 'Drop dev schemas after merging PRs. VACUUM old versions. Delete unused notebooks and clusters. Use account-level cost tags.',
        accent: '#EF4444',
      },
    ],
  },
  { id: 'bp-d6', type: 'divider' },

  {
    id: 'bp-h-sec',
    type: 'heading',
    level: 1,
    text: 'Security Best Practices',
  },
  {
    id: 'bp-cards-sec',
    type: 'card-grid',
    columns: 2,
    cards: [
      {
        emoji: '🏛️',
        title: 'Unity Catalog for ALL access control',
        description: 'All grants, row filters, column masks through UC. Never use legacy table ACLs or direct S3 access. Central, auditable, inheritable.',
        accent: '#6366F1',
      },
      {
        emoji: '🤖',
        title: 'Service principal for automation',
        description: 'dbt runs, ingestion pipelines, and CI/CD use a service principal (floranow-dbt-sp), not personal tokens. Rotate SP tokens every 90 days.',
        accent: '#22C55E',
      },
      {
        emoji: '🔒',
        title: 'Row filters on Gold tables',
        description: 'Apply region_filter function to all Gold tables with a region column. Users see only their data — across dashboards, Genie, and SQL Editor.',
        accent: '#F59E0B',
      },
      {
        emoji: '🙈',
        title: 'Column masking for PII',
        description: 'Mask email, phone, SSN columns with UC column mask functions. Admins see real values. Everyone else sees masked data.',
        accent: '#8B5CF6',
      },
      {
        emoji: '📋',
        title: 'Audit everything',
        description: 'system.access.audit logs every query, table access, and permission change. Retain for compliance. Build audit dashboard for security reviews.',
        accent: '#EC4899',
      },
      {
        emoji: '🌐',
        title: 'IP allowlisting',
        description: 'Restrict workspace access to corporate VPN/office IPs. Prevent unauthorized access from personal networks. Configure in workspace settings.',
        accent: '#EF4444',
      },
    ],
  },
  { id: 'bp-d7', type: 'divider' },

  {
    id: 'bp-h-anti',
    type: 'heading',
    level: 1,
    text: 'Anti-Patterns to Avoid',
  },
  {
    id: 'bp-cards-anti',
    type: 'card-grid',
    columns: 2,
    cards: [
      {
        emoji: '🚫',
        title: 'Don\'t query Bronze from dashboards',
        description: 'Bronze data is raw, untyped, potentially duplicated. Dashboard users will see confusing data and draw wrong conclusions. Always use Gold.',
        borderTop: '#EF4444',
      },
      {
        emoji: '🚫',
        title: 'Don\'t skip Silver',
        description: 'Going Bronze → Gold directly means business logic and cleaning are mixed with aggregation. Silver provides a clean, reusable, tested intermediate layer.',
        borderTop: '#EF4444',
      },
      {
        emoji: '🚫',
        title: 'Don\'t use personal tokens for automation',
        description: 'Personal tokens are tied to individuals. If someone leaves or changes their password, all pipelines break. Use service principals.',
        borderTop: '#EF4444',
      },
      {
        emoji: '🚫',
        title: 'Don\'t partition by high-cardinality columns',
        description: 'Traditional partitioning by user_id or order_id creates millions of tiny files. Use Liquid Clustering instead — it handles high cardinality gracefully.',
        borderTop: '#EF4444',
      },
      {
        emoji: '🚫',
        title: 'Don\'t keep idle warehouses running',
        description: 'An X-Small warehouse costs ~$1.32/hr. Running 24/7 = $950/month. With 10-minute auto-suspend and 8-hour business days, cost drops to ~$230/month.',
        borderTop: '#EF4444',
      },
      {
        emoji: '🚫',
        title: 'Don\'t ignore VACUUM',
        description: 'Old Delta file versions accumulate on S3. Without VACUUM, storage costs grow linearly with every dbt run. Enable Predictive Optimization or schedule weekly VACUUM.',
        borderTop: '#EF4444',
      },
    ],
  },
  { id: 'bp-d8', type: 'divider' },

  {
    id: 'bp-call-xref',
    type: 'callout',
    variant: 'info',
    text: 'Cross-References — These best practices are applied throughout this document. Ingestion practices → Ingestion page. Delta Lake practices → Warehousing page. dbt practices → dbt page. BI practices → BI page. Cost monitoring → E2E Flow page. Security → implemented in Warehousing (grants) and BI (row filters) pages.',
  },
]

export default function BestPractices() {
  const { blocks, updateBlock, addBlock, removeBlock } = usePageState('page:bestpractices', DEFAULT_BLOCKS)

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="pl-10">
        <BlockEditor blocks={blocks} updateBlock={updateBlock} addBlock={addBlock} removeBlock={removeBlock} />
      </div>
    </div>
  )
}
