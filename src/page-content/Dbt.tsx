'use client'
import BlockEditor from '../components/BlockEditor'
import { usePageState } from '../lib/usePageState'
import type { Block } from '../lib/blocks'

const DEFAULT_BLOCKS: Block[] = [
  // ── Section 1: DLT + dbt Architecture ──────────────────────────────────
  {
    id: 'dbt-h1',
    type: 'heading',
    level: 1,
    text: 'How DLT and dbt Work Together',
  },
  {
    id: 'dbt-t1',
    type: 'text',
    text: 'Floranow\u2019s data platform uses two transformation engines, each handling a different layer:\n\nDelta Live Tables (DLT) owns the Bronze layer. When Lakeflow Connect ingests data from PostgreSQL and MongoDB, it creates DLT-managed streaming tables. These are automatic, self-healing pipelines that handle schema evolution, data quality, and exactly-once delivery. DLT is the right tool here because ingestion is a streaming/CDC problem.\n\ndbt owns Silver and Gold. It reads from those DLT Bronze tables and applies business logic: cleaning, typing, deduplication (Silver), then aggregation, KPIs, and star-schema modeling (Gold). dbt is the right tool here because transformation is a SQL-heavy, version-controlled, testable problem.\n\nThe handoff is simple: DLT writes Bronze tables to floranow_catalog.bronze.*. dbt defines those as sources and reads from them. No coupling, no dependency conflicts. Each tool does what it does best.',
  },
  {
    id: 'dbt-flow-arch',
    type: 'flow',
    steps: [
      {
        emoji: '🔌',
        title: 'Lakeflow Connect',
        subtitle: 'PostgreSQL CDC + MongoDB Spark Connector',
        color: '#2563EB',
      },
      {
        emoji: '🥉',
        title: 'DLT Streaming Tables (Bronze)',
        subtitle: 'Auto-managed, schema-evolving, exactly-once',
        color: '#CD7F32',
      },
      {
        emoji: '📖',
        title: 'dbt reads Bronze via {{ source() }}',
        subtitle: 'Source freshness checks catch ingestion stalls',
        color: '#8C9EAF',
      },
      {
        emoji: '🥈',
        title: 'dbt writes Silver (views)',
        subtitle: 'Clean, typed, deduplicated \u2014 135 staging models',
        color: '#8C9EAF',
      },
      {
        emoji: '🥇',
        title: 'dbt writes Gold (tables)',
        subtitle: 'KPIs, metrics, star-schema \u2014 65 mart tables',
        color: '#D4A017',
      },
      {
        emoji: '📊',
        title: 'Dashboards & Genie query Gold',
        subtitle: 'Via SQL Warehouse with Photon',
        color: '#059669',
      },
    ],
  },
  {
    id: 'dbt-c-why',
    type: 'callout',
    variant: 'info',
    text: 'Why not DLT for transformations too? DLT could technically build Silver and Gold. But Floranow already has 200 dbt models with tested, proven business logic. Rewriting them into DLT SQL/Python syntax would be a complete rebuild \u2014 new testing, new patterns, new learning curve \u2014 with zero business value added. dbt Core preserves everything. The Jaffle Shop PoC proved this exact pattern works end-to-end on Databricks.',
  },
  { id: 'dbt-d1', type: 'divider' },

  // ── Section 2: PoC ──────────────────────────────────
  {
    id: 'dbt-h2',
    type: 'heading',
    level: 1,
    text: 'What the Jaffle Shop PoC Proved',
  },
  {
    id: 'dbt-t2',
    type: 'text',
    text: 'We ran a complete proof-of-concept on Databricks using the Jaffle Shop project \u2014 an industry-standard dbt sample project. The setup mirrors exactly what Floranow will use in production.',
  },
  {
    id: 'dbt-tbl-poc',
    type: 'table',
    headers: ['PoC Detail', 'Value'],
    rows: [
      ['Adapter', 'dbt-databricks'],
      ['Catalog', 'jaffle_shop_poc (Unity Catalog)'],
      ['Schemas', 'bronze (sources), silver (staging views), gold (mart tables)'],
      ['Models', '13 total: 6 staging views + 7 mart tables'],
      ['Tests', 'Schema tests (not_null, unique, accepted_values, relationships) + data tests (expression_is_true) + unit tests'],
      ['Threads', '4'],
    ],
  },
  {
    id: 'dbt-cards-poc',
    type: 'card-grid',
    columns: 3,
    cards: [
      {
        emoji: '✅',
        title: 'Unity Catalog Works',
        description: 'dbt-databricks connects with three-level namespace (catalog.schema.table). Sources point to Bronze, staging writes to Silver, marts write to Gold.',
        borderTop: '#22A652',
        accent: '#F0FDF4',
      },
      {
        emoji: '✅',
        title: 'Medallion Pattern Works',
        description: 'dbt reads from Bronze tables (same as DLT streaming tables) via {{ source() }}. Views in Silver, tables in Gold. Exactly the production architecture.',
        borderTop: '#22A652',
        accent: '#F0FDF4',
      },
      {
        emoji: '✅',
        title: 'All Tests Pass',
        description: 'not_null, unique, relationships, expression_is_true, and unit tests all pass. Testing strategy validated at small scale. Now we scale to 200 models.',
        borderTop: '#22A652',
        accent: '#F0FDF4',
      },
    ],
  },
  { id: 'dbt-d2', type: 'divider' },

  // ── Section 3: 200/65 Distinction ──────────────────────────────────
  {
    id: 'dbt-h3',
    type: 'heading',
    level: 1,
    text: 'The 200/65 Distinction \u2014 Why It Matters',
  },
  {
    id: 'dbt-t3',
    type: 'text',
    text: 'Floranow has 200 dbt models total. But "200 models" does not mean "200 heavy SQL queries." Understanding the breakdown is critical for cost and performance planning.',
  },
  {
    id: 'dbt-tbl-distinction',
    type: 'table',
    headers: ['Layer', 'Count', 'Materialization', 'What happens during dbt run', 'Compute cost'],
    rows: [
      ['Staging (Silver)', '~135 models', 'view', 'CREATE OR REPLACE VIEW \u2014 a DDL statement. Near-instant. No data read or written.', '~Zero'],
      ['Intermediate', 'Variable', 'ephemeral', 'Compiled inline into downstream models. No object created in catalog.', 'Zero'],
      ['Marts (Gold)', '~65 models', 'table', 'Full SQL execution: reads source data, computes joins/aggregations/window functions, writes Delta to S3.', 'All compute happens here'],
    ],
  },
  {
    id: 'dbt-c-distinction',
    type: 'callout',
    variant: 'tip',
    text: 'When dbt run executes hourly: 135 views rebuild in seconds (just DDL). 65 tables \u2014 this is the ~15-minute window that consumes SQL Warehouse resources. The warehouse handles 65 table materializations with threads=4 (4 running simultaneously), not 200 models.',
  },
  { id: 'dbt-d3', type: 'divider' },

  // ── Section 4: What Changes ──────────────────────────────────
  {
    id: 'dbt-h4',
    type: 'heading',
    level: 1,
    text: 'What Changes from Today',
  },
  {
    id: 'dbt-compare-changes',
    type: 'compare',
    leftTitle: '\uD83D\uDD34  Retiring',
    rightTitle: '\uD83D\uDFE2  Replacing With',
    items: [
      { old: 'dbt Cloud (SaaS, $100-500/mo)', new: 'dbt Core (open source, free)' },
      { old: 'dbt-bigquery adapter', new: 'dbt-databricks adapter (v1.10+)' },
      { old: 'Cloud IDE (browser)', new: 'VS Code / Cursor (local development)' },
      { old: 'Cloud scheduler (cron)', new: 'Lakeflow Jobs (hourly cron, serverless)' },
      { old: 'BigQuery compute (pay per TB scanned)', new: 'SQL Warehouse (Serverless Small \u2014 see Warehousing page)' },
      { old: 'Separate dbt Cloud bill', new: 'Included in Databricks platform cost' },
      { old: 'BigQuery SQL dialect', new: 'Databricks SQL dialect (Spark SQL)' },
      { old: 'No ingestion awareness', new: 'dbt sources point to DLT Bronze tables \u2014 freshness checks built in' },
    ],
  },
  { id: 'dbt-d4', type: 'divider' },

  // ── Section 5: Migration Steps ──────────────────────────────────
  {
    id: 'dbt-h5',
    type: 'heading',
    level: 1,
    text: 'Migration Steps',
  },
  {
    id: 'dbt-flow-migration',
    type: 'flow',
    steps: [
      { emoji: '1\uFE0F\u20E3', title: 'Install dbt-databricks', subtitle: 'pip install dbt-databricks>=1.10.0', color: '#22A652' },
      { emoji: '2\uFE0F\u20E3', title: 'Configure profiles.yml', subtitle: 'Databricks host, HTTP path, token, catalog, threads', color: '#22A652' },
      { emoji: '3\uFE0F\u20E3', title: 'Update dbt_project.yml', subtitle: 'Materializations, schemas (silver/gold), Databricks settings', color: '#3B82F6' },
      { emoji: '4\uFE0F\u20E3', title: 'Update source definitions', subtitle: 'Point _sources.yml to DLT Bronze tables in floranow_catalog.bronze', color: '#3B82F6' },
      { emoji: '5\uFE0F\u20E3', title: 'Convert BigQuery SQL functions', subtitle: 'DATE_TRUNC, SAFE_CAST, STRING_AGG, etc. (see conversion table)', color: '#8B5CF6' },
      { emoji: '6\uFE0F\u20E3', title: 'Run in dev', subtitle: 'dbt run --target dev against dev schema', color: '#8B5CF6' },
      { emoji: '7\uFE0F\u20E3', title: 'Run tests', subtitle: 'dbt test --target dev \u2014 ensure all pass', color: '#F59E0B' },
      { emoji: '8\uFE0F\u20E3', title: 'Set up Lakeflow Job', subtitle: 'Hourly production schedule with dbt task type', color: '#F59E0B' },
      { emoji: '9\uFE0F\u20E3', title: 'Validate vs BigQuery', subtitle: 'Row counts, metric diffs, 5-day parallel run before cutover', color: '#DC2626' },
    ],
  },
  { id: 'dbt-d5', type: 'divider' },

  // ── Section 6: profiles.yml ──────────────────────────────────
  {
    id: 'dbt-h6',
    type: 'heading',
    level: 2,
    text: 'profiles.yml',
  },
  {
    id: 'dbt-t6',
    type: 'text',
    text: 'Connection config for the dbt-databricks adapter. Lives at ~/.dbt/profiles.yml (not committed to Git). Uses environment variables for secrets. Dev uses personal tokens; prod uses a service principal.',
  },
  {
    id: 'dbt-code-profiles',
    type: 'code',
    code: `floranow:
  target: dev
  outputs:
    dev:
      type: databricks
      catalog: floranow_catalog
      schema: dev_{{ env_var('DBT_USER', 'analyst') }}
      host: "{{ env_var('DATABRICKS_HOST') }}"
      http_path: "{{ env_var('DATABRICKS_HTTP_PATH') }}"
      token: "{{ env_var('DATABRICKS_TOKEN') }}"
      threads: 4
      connect_retries: 3
      connect_timeout: 60

    prod:
      type: databricks
      catalog: floranow_catalog
      schema: "{{ target.name }}"
      host: "{{ env_var('DATABRICKS_HOST') }}"
      http_path: "{{ env_var('DATABRICKS_HTTP_PATH') }}"
      token: "{{ env_var('DATABRICKS_SP_TOKEN') }}"
      threads: 8
      connect_retries: 5
      connect_timeout: 120`,
  },
  { id: 'dbt-d6', type: 'divider' },

  // ── Section 7: dbt_project.yml ──────────────────────────────────
  {
    id: 'dbt-h7',
    type: 'heading',
    level: 2,
    text: 'dbt_project.yml',
  },
  {
    id: 'dbt-code-project',
    type: 'code',
    code: `name: floranow
version: '1.0.0'
config-version: 2
profile: floranow

model-paths: ["models"]
test-paths: ["tests"]
macro-paths: ["macros"]
seed-paths: ["seeds"]
clean-targets: ["target", "dbt_packages"]

models:
  floranow:
    staging:
      +materialized: view        # Silver = views (always fresh, zero cost)
      +schema: silver
      +tags: ["staging", "silver"]
    intermediate:
      +materialized: ephemeral   # Exists only at compile time
    marts:
      +materialized: table       # Gold = tables (fast for dashboards)
      +schema: gold
      +tags: ["marts", "gold"]

vars:
  dbt_date_spine_start: '2020-01-01'`,
  },
  { id: 'dbt-d7', type: 'divider' },

  // ── Section 8: Source Definitions ──────────────────────────────────
  {
    id: 'dbt-h8',
    type: 'heading',
    level: 1,
    text: 'Source Definitions \u2014 The DLT-to-dbt Handoff',
  },
  {
    id: 'dbt-t8',
    type: 'text',
    text: 'This is the handoff point between DLT and dbt. Source definitions tell dbt where the DLT Bronze tables live. The freshness config catches ingestion stalls: if erp_orders has not been updated in 4 hours, dbt raises an error \u2014 before stale data reaches dashboards.',
  },
  {
    id: 'dbt-code-sources',
    type: 'code',
    code: `# models/staging/erp/_erp__sources.yml
version: 2

sources:
  - name: erp
    database: floranow_catalog
    schema: bronze
    description: >
      Raw ERP data ingested from PostgreSQL via Lakeflow Connect.
      DLT streaming tables \u2014 auto-managed, schema-evolving.
    tables:
      - name: erp_orders
        description: One row per order from the ERP system
        loaded_at_field: _ingested_at
        freshness:
          warn_after: { count: 2, period: hour }
          error_after: { count: 4, period: hour }
      - name: erp_products
      - name: erp_customers

  - name: mp
    database: floranow_catalog
    schema: bronze
    tables:
      - name: mp_transactions
        loaded_at_field: _ingested_at
        freshness:
          warn_after: { count: 2, period: hour }
          error_after: { count: 4, period: hour }

  - name: mongodb
    database: floranow_catalog
    schema: bronze
    tables:
      - name: mongodb_app_data
        description: MongoDB documents stored as VARIANT type`,
  },
  { id: 'dbt-d8', type: 'divider' },

  // ── Section 9: SQL Conversion ──────────────────────────────────
  {
    id: 'dbt-h9',
    type: 'heading',
    level: 1,
    text: 'SQL Conversion Guide',
  },
  {
    id: 'dbt-t9',
    type: 'text',
    text: 'Most standard SQL is compatible between BigQuery and Databricks. These are the BigQuery-specific functions that need conversion. Databricks also offers a Code Converter tool (BladeBridge acquisition) that automates up to 90% of SQL conversion, and Datafold offers an AI-powered migration agent \u2014 both worth evaluating for 200 models.',
  },
  {
    id: 'dbt-tbl-sql',
    type: 'table',
    headers: ['BigQuery Function', 'Databricks SQL', 'Notes'],
    rows: [
      ['DATE_TRUNC(date, MONTH)', "date_trunc('MONTH', date)", 'Argument order reversed, string literal for unit'],
      ["FORMAT_TIMESTAMP('%Y-%m-%d', ts)", "date_format(ts, 'yyyy-MM-dd')", 'Java SimpleDateFormat patterns'],
      ['SAFE_CAST(x AS INT)', 'TRY_CAST(x AS INT)', 'Returns NULL on failure'],
      ["PARSE_DATE('%Y-%m-%d', str)", "to_date(str, 'yyyy-MM-dd')", 'Java date patterns'],
      ['GENERATE_DATE_ARRAY(start, end, ...)', 'sequence(start, end, INTERVAL 1 DAY)', 'Returns array of dates'],
      ["STRING_AGG(col, ', ')", "concat_ws(', ', collect_list(col))", 'Aggregate then join'],
      ['ARRAY_AGG(col)', 'collect_list(col)', 'Preserves duplicates'],
      ['ARRAY_AGG(DISTINCT col)', 'collect_set(col)', 'Unique values only'],
      ['TIMESTAMP_DIFF(a, b, DAY)', 'datediff(a, b)', 'Returns integer days'],
      ["JSON_EXTRACT_SCALAR(json, '$.key')", "col:key::TYPE or get_json_object()", 'VARIANT syntax preferred for MongoDB'],
      ["REGEXP_CONTAINS(str, r'pattern')", "str RLIKE 'pattern'", 'RLIKE operator'],
      ['IF / STRUCT / CURRENT_TIMESTAMP', 'Same syntax', 'No change needed'],
    ],
  },
  { id: 'dbt-d9', type: 'divider' },

  // ── Section 10: Example Models ──────────────────────────────────
  {
    id: 'dbt-h10',
    type: 'heading',
    level: 1,
    text: 'Example Models',
  },
  {
    id: 'dbt-h10a',
    type: 'heading',
    level: 2,
    text: 'Staging Model (Silver \u2014 View) \u2014 Reads from DLT Bronze',
  },
  {
    id: 'dbt-code-staging',
    type: 'code',
    code: `-- models/staging/erp/stg_erp__orders.sql
-- Materialized as VIEW in floranow_catalog.silver
-- Reads from DLT streaming table in floranow_catalog.bronze

{{ config(materialized='view') }}

WITH source AS (
    SELECT * FROM {{ source('erp', 'erp_orders') }}
),

renamed AS (
    SELECT
        order_id,
        customer_id,
        TRY_CAST(order_date AS DATE) AS order_date,
        TRY_CAST(total_amount AS DECIMAL(18,2)) AS total_amount,
        LOWER(TRIM(status)) AS order_status,
        LOWER(TRIM(region)) AS region,
        TRY_CAST(updated_at AS TIMESTAMP) AS updated_at
    FROM source
    WHERE order_id IS NOT NULL
)

SELECT * FROM renamed`,
  },
  { id: 'dbt-d10a', type: 'divider' },

  {
    id: 'dbt-h10b',
    type: 'heading',
    level: 2,
    text: 'Mart Model (Gold \u2014 Table) \u2014 With Liquid Clustering',
  },
  {
    id: 'dbt-code-mart',
    type: 'code',
    code: `-- models/marts/finance/mart_revenue.sql
-- Materialized as TABLE in floranow_catalog.gold
-- Liquid Clustering via dbt-databricks native config

{{ config(
    materialized='table',
    liquid_clustered_by=['revenue_date', 'region']
) }}

WITH orders AS (
    SELECT * FROM {{ ref('stg_erp__orders') }}
    WHERE order_status NOT IN ('cancelled', 'refunded')
),

daily_revenue AS (
    SELECT
        order_date AS revenue_date,
        region,
        COUNT(DISTINCT order_id) AS orders_count,
        SUM(total_amount) AS revenue,
        AVG(total_amount) AS avg_order_value
    FROM orders
    GROUP BY order_date, region
)

SELECT
    revenue_date,
    region,
    orders_count,
    revenue,
    avg_order_value,
    current_timestamp() AS _updated_at
FROM daily_revenue`,
  },
  { id: 'dbt-d10b', type: 'divider' },

  {
    id: 'dbt-h10c',
    type: 'heading',
    level: 2,
    text: 'VARIANT Parsing (MongoDB \u2192 Silver)',
  },
  {
    id: 'dbt-code-variant',
    type: 'code',
    code: `-- models/staging/mongodb/stg_mongodb__app_data.sql
-- Parse VARIANT (raw JSON) from DLT Bronze into typed columns

{{ config(materialized='view') }}

WITH source AS (
    SELECT * FROM {{ source('mongodb', 'mongodb_app_data') }}
),

parsed AS (
    SELECT
        document_id,
        raw_json:user_id::STRING AS user_id,
        raw_json:event_type::STRING AS event_type,
        raw_json:timestamp::TIMESTAMP AS event_timestamp,
        raw_json:metadata.device::STRING AS device,
        raw_json:metadata.platform::STRING AS platform,
        raw_json AS raw_document,
        _ingested_at
    FROM source
)

SELECT * FROM parsed
WHERE user_id IS NOT NULL`,
  },
  { id: 'dbt-d10c', type: 'divider' },

  // ── Section 11: Materialization Strategy ──────────────────────────────────
  {
    id: 'dbt-h11',
    type: 'heading',
    level: 1,
    text: 'Materialization Strategy',
  },
  {
    id: 'dbt-cards-mat',
    type: 'card-grid',
    columns: 2,
    cards: [
      {
        emoji: '\uD83D\uDC41\uFE0F',
        title: 'Staging (Silver) \u2192 Views',
        description: 'Always fresh (computed on read). Zero storage cost. dbt builds in seconds. Views reference DLT Bronze tables created by Lakeflow Connect. ~135 models.',
        borderTop: '#8C9EAF',
        accent: '#F1F5F9',
      },
      {
        emoji: '\uD83D\uDC7B',
        title: 'Intermediate \u2192 Ephemeral',
        description: 'Compiled inline into downstream models. No table or view created in the catalog. Use for complex CTEs shared across multiple marts. Reduces Silver schema clutter.',
        borderTop: '#A78BFA',
        accent: '#FAF5FF',
      },
      {
        emoji: '\uD83D\uDCCA',
        title: 'Marts (Gold) \u2192 Tables',
        description: 'Pre-computed, stored on S3 as Delta. Fast for dashboards (no recomputation on query). Liquid Clustering for scan optimization. OPTIMIZE runs automatically. ~65 models.',
        borderTop: '#D4A017',
        accent: '#FFFBEB',
      },
      {
        emoji: '\uD83D\uDE80',
        title: 'Future: Large Marts \u2192 Incremental',
        description: 'Process only new/changed rows via merge strategy. Can cut compute from minutes to seconds per model. Evaluate after initial migration is stable (Week 4+). Convert the 5-10 largest tables first.',
        borderTop: '#059669',
        accent: '#ECFDF5',
      },
    ],
  },
  { id: 'dbt-d11', type: 'divider' },

  // ── Section 12: Incremental Optimization ──────────────────────────────────
  {
    id: 'dbt-h12',
    type: 'heading',
    level: 1,
    text: 'Incremental Optimization (Phase 2)',
  },
  {
    id: 'dbt-t12',
    type: 'text',
    text: 'Currently all 65 Gold tables do full rebuild every hour. For large tables (e.g., mart with millions of rows), this is wasteful \u2014 only the last hour\u2019s data changed. After the initial migration is stable, convert the 5-10 largest tables to incremental. dbt-databricks supports 5 incremental strategies: append, merge (default for Delta), delete+insert, insert_overwrite, and microbatch. Merge is the right starting point for Floranow\u2019s dimension/fact tables.',
  },
  {
    id: 'dbt-code-incremental',
    type: 'code',
    code: `-- Example: Converting mart_revenue to incremental merge
{{ config(
    materialized='incremental',
    incremental_strategy='merge',
    unique_key='order_id',
    liquid_clustered_by=['order_date', 'region']
) }}

WITH orders AS (
    SELECT * FROM {{ ref('stg_erp__orders') }}
    WHERE order_status NOT IN ('cancelled', 'refunded')
    {% if is_incremental() %}
      AND updated_at > (SELECT MAX(_updated_at) FROM {{ this }})
    {% endif %}
),

daily_revenue AS (
    SELECT
        order_date AS revenue_date,
        region,
        COUNT(DISTINCT order_id) AS orders_count,
        SUM(total_amount) AS revenue,
        AVG(total_amount) AS avg_order_value
    FROM orders
    GROUP BY order_date, region
)

SELECT
    revenue_date,
    region,
    orders_count,
    revenue,
    avg_order_value,
    current_timestamp() AS _updated_at
FROM daily_revenue`,
  },
  {
    id: 'dbt-c-incremental',
    type: 'callout',
    variant: 'tip',
    text: 'Start with full table rebuilds (simpler, safer). Convert to incremental after Week 4 when monitoring confirms which tables are largest and slowest. Incremental can reduce the 15-min hourly run to 5-8 min, saving ~$500-750/month in warehouse compute.',
  },
  { id: 'dbt-d12', type: 'divider' },

  // ── Section 13: Liquid Clustering ──────────────────────────────────
  {
    id: 'dbt-h13',
    type: 'heading',
    level: 1,
    text: 'Liquid Clustering in dbt',
  },
  {
    id: 'dbt-t13',
    type: 'text',
    text: 'dbt-databricks v1.10+ supports Liquid Clustering natively \u2014 no post-hooks needed. After each dbt run, dbt-databricks automatically runs OPTIMIZE (Liquid Clustering). This replaces manual partitioning and ZORDER from the BigQuery world \u2014 simpler and self-tuning.',
  },
  {
    id: 'dbt-code-clustering',
    type: 'code',
    code: `-- Option 1: Specify clustering keys per model
{{ config(
    materialized='table',
    liquid_clustered_by=['revenue_date', 'region']
) }}

-- Option 2: Let Databricks choose keys automatically
{{ config(
    materialized='table',
    auto_liquid_cluster=true
) }}

-- To skip the automatic OPTIMIZE after dbt run:
-- dbt run --vars "{'databricks_skip_optimize': true}"`,
  },
  { id: 'dbt-d13', type: 'divider' },

  // ── Section 14: Project Structure ──────────────────────────────────
  {
    id: 'dbt-h14',
    type: 'heading',
    level: 1,
    text: 'Project Structure',
  },
  {
    id: 'dbt-code-structure',
    type: 'code',
    code: `floranow-dbt/
\u251C\u2500\u2500 dbt_project.yml
\u251C\u2500\u2500 packages.yml              # dbt-utils, codegen
\u251C\u2500\u2500 models/
\u2502   \u251C\u2500\u2500 staging/              # Silver (views in floranow_catalog.silver)
\u2502   \u2502   \u251C\u2500\u2500 erp/
\u2502   \u2502   \u2502   \u251C\u2500\u2500 _erp__sources.yml      # Points to DLT Bronze tables
\u2502   \u2502   \u2502   \u251C\u2500\u2500 stg_erp__orders.sql
\u2502   \u2502   \u2502   \u251C\u2500\u2500 stg_erp__products.sql
\u2502   \u2502   \u2502   \u2514\u2500\u2500 stg_erp__customers.sql
\u2502   \u2502   \u251C\u2500\u2500 mp/
\u2502   \u2502   \u2502   \u251C\u2500\u2500 _mp__sources.yml
\u2502   \u2502   \u2502   \u2514\u2500\u2500 stg_mp__transactions.sql
\u2502   \u2502   \u2514\u2500\u2500 mongodb/
\u2502   \u2502       \u251C\u2500\u2500 _mongodb__sources.yml
\u2502   \u2502       \u2514\u2500\u2500 stg_mongodb__app_data.sql
\u2502   \u251C\u2500\u2500 intermediate/         # Ephemeral (complex shared logic)
\u2502   \u2502   \u2514\u2500\u2500 int_orders_with_products.sql
\u2502   \u2514\u2500\u2500 marts/                # Gold (tables in floranow_catalog.gold)
\u2502       \u251C\u2500\u2500 finance/
\u2502       \u2502   \u2514\u2500\u2500 mart_revenue.sql
\u2502       \u251C\u2500\u2500 sales/
\u2502       \u2502   \u251C\u2500\u2500 mart_sales.sql
\u2502       \u2502   \u2514\u2500\u2500 dim_customers.sql
\u2502       \u2514\u2500\u2500 operations/
\u2502           \u251C\u2500\u2500 mart_operations.sql
\u2502           \u2514\u2500\u2500 dim_products.sql
\u251C\u2500\u2500 tests/
\u2502   \u2514\u2500\u2500 assert_mart_revenue_positive.sql
\u251C\u2500\u2500 macros/
\u2502   \u251C\u2500\u2500 generate_schema_name.sql
\u2502   \u2514\u2500\u2500 parse_variant.sql
\u251C\u2500\u2500 seeds/
\u2502   \u2514\u2500\u2500 region_mapping.csv
\u2514\u2500\u2500 profiles.yml              # NOT committed to Git`,
  },
  { id: 'dbt-d14', type: 'divider' },

  // ── Section 15: Environments ──────────────────────────────────
  {
    id: 'dbt-h15',
    type: 'heading',
    level: 1,
    text: 'Environments',
  },
  {
    id: 'dbt-tbl-envs',
    type: 'table',
    headers: ['Env', 'Catalog', 'Schema', 'Warehouse', 'Trigger', 'Auth'],
    rows: [
      ['dev', 'floranow_catalog', 'dev_[username]', 'Shared Serverless', 'Manual (dbt run)', 'Personal token'],
      ['ci', 'floranow_catalog', 'ci_[pr_number]', 'Shared Serverless', 'Auto on PR (GitHub Actions)', 'Service principal'],
      ['prod', 'floranow_catalog', 'silver / gold', 'Shared Serverless', 'Hourly (Lakeflow Jobs)', 'Service principal'],
    ],
  },
  { id: 'dbt-d15', type: 'divider' },

  // ── Section 16: Lakeflow Jobs ──────────────────────────────────
  {
    id: 'dbt-h16',
    type: 'heading',
    level: 1,
    text: 'Lakeflow Jobs \u2014 How dbt Runs in Production',
  },
  {
    id: 'dbt-t16',
    type: 'text',
    text: 'Lakeflow Jobs has a native dbt task type \u2014 it understands dbt, not just "run a script." The architecture uses dual compute: the dbt Python process (CLI, DAG compilation, model resolution) runs on Jobs Compute (serverless, ~$0.15/DBU \u2014 cheap). The SQL queries generated by dbt execute against the SQL Warehouse (Serverless Small, $0.70/DBU \u2014 where the real work happens). Git integration syncs the dbt project from GitHub. Logs, run results, and manifests are automatically archived per run.',
  },
  {
    id: 'dbt-cards-lakeflow',
    type: 'card-grid',
    columns: 2,
    cards: [
      {
        emoji: '\uD83D\uDCBB',
        title: 'Jobs Compute (dbt CLI)',
        description: 'Runs the dbt Python process: CLI startup, DAG compilation, model dependency resolution, test execution coordination. Serverless, ~$0.15/DBU. Runs for seconds per job. Cost: ~$5-10/month.',
        borderTop: '#059669',
        accent: '#ECFDF5',
      },
      {
        emoji: '\u26A1',
        title: 'SQL Warehouse (query execution)',
        description: 'Runs the actual SQL queries generated by dbt: CREATE VIEW, CREATE TABLE AS SELECT, MERGE INTO, etc. Serverless Small, $0.70/DBU. This is where the 15-minute compute window happens.',
        borderTop: '#2563EB',
        accent: '#EFF6FF',
      },
    ],
  },
  {
    id: 'dbt-code-lakeflow',
    type: 'code',
    code: `{
  "name": "floranow-dbt-hourly",
  "tasks": [{
    "task_key": "dbt_transform",
    "dbt_task": {
      "project_directory": "/Repos/floranow/floranow-dbt",
      "commands": [
        "dbt deps",
        "dbt run --target prod",
        "dbt test --target prod"
      ],
      "warehouse_id": "abc123def456",
      "catalog": "floranow_catalog",
      "schema": "gold"
    }
  }],
  "schedule": {
    "quartz_cron_expression": "0 30 * * * ?",
    "timezone_id": "Asia/Dubai"
  },
  "max_concurrent_runs": 1,
  "email_notifications": {
    "on_failure": ["data-team@floranow.com"]
  }
}`,
  },
  {
    id: 'dbt-c-workflow',
    type: 'callout',
    variant: 'info',
    text: 'Full workflow sequence: Lakeflow Connect ingests \u2192 DLT updates Bronze \u2192 Lakeflow Job triggers dbt \u2192 dbt builds Silver + Gold \u2192 Dashboards see fresh data.',
  },
  { id: 'dbt-d16', type: 'divider' },

  // ── Section 17: Testing Strategy ──────────────────────────────────
  {
    id: 'dbt-h17',
    type: 'heading',
    level: 1,
    text: 'Testing Strategy',
  },
  {
    id: 'dbt-cards-testing',
    type: 'card-grid',
    columns: 2,
    cards: [
      {
        emoji: '\u2705',
        title: 'Schema Tests',
        description: 'not_null, unique, accepted_values, relationships on every model. Defined in YAML next to models. Run automatically in CI and prod via dbt test. Proved in Jaffle Shop PoC.',
        borderTop: '#22A652',
        accent: '#F0FDF4',
      },
      {
        emoji: '\uD83D\uDD0D',
        title: 'Data Tests',
        description: 'Custom SQL assertions (e.g., lifetime_spend = pretax + tax). Validate business rules that schema tests can\u2019t catch. Fail the pipeline if violated. Proved in PoC with expression_is_true.',
        borderTop: '#3B82F6',
        accent: '#EFF6FF',
      },
      {
        emoji: '\uD83E\uddEA',
        title: 'Unit Tests',
        description: 'Test model logic with mocked inputs and expected outputs. Validate transformations in isolation. Jaffle Shop PoC includes unit tests for order boolean computation.',
        borderTop: '#8B5CF6',
        accent: '#FAF5FF',
      },
      {
        emoji: '\u23F1\uFE0F',
        title: 'Source Freshness',
        description: 'dbt source freshness checks DLT Bronze tables. Alert if ingestion stalls (>2h warn, >4h error). Catches Lakeflow Connect failures before they become stale dashboards.',
        borderTop: '#F59E0B',
        accent: '#FFFBEB',
      },
    ],
  },
  {
    id: 'dbt-c-audit',
    type: 'callout',
    variant: 'warn',
    text: 'Migration audit: During the parallel-run week, compare row counts and aggregates between BigQuery and Databricks for every Gold table. Decommission BigQuery only when 100% match for 5+ consecutive business days.',
  },
  { id: 'dbt-d17', type: 'divider' },

  // ── Section 18: Cost ──────────────────────────────────
  {
    id: 'dbt-h18',
    type: 'heading',
    level: 1,
    text: 'Cost Implications',
  },
  {
    id: 'dbt-t18',
    type: 'text',
    text: 'dbt Core is free (open source). The cost is the SQL Warehouse time during dbt run. The dbt Cloud license ($100-500/mo) is eliminated entirely.',
  },
  {
    id: 'dbt-tbl-cost',
    type: 'table',
    headers: ['Component', 'Calculation', 'Monthly cost'],
    rows: [
      ['65 table materializations (hourly)', 'Small Warehouse: 12 DBU/h \u00D7 $0.70 \u00D7 15 min/60 = $2.10/run \u00D7 24/day \u00D7 30', '~$1,512/mo'],
      ['Jobs Compute (dbt Python process)', '~$0.15/DBU, runs for seconds per job', '~$5-10/mo'],
      ['dbt Cloud license (eliminated)', 'Was $100-500/mo', 'Saved'],
      ['Incremental optimization (Phase 2)', 'Could reduce 15-min runs to 5-8 min', 'Saves ~$500-750/mo'],
    ],
  },
  {
    id: 'dbt-c-cost',
    type: 'callout',
    variant: 'info',
    text: 'The SQL Warehouse cost overlaps with the Warehousing page estimates \u2014 dbt is the primary consumer of warehouse compute. dbt\u2019s 65 table materializations are the main driver of the ~$1,500-2,300/month warehouse cost discussed on the Warehousing page.',
  },
  { id: 'dbt-d18', type: 'divider' },

  // ── Section 19: Cross-References ──────────────────────────────────
  {
    id: 'dbt-c-xref',
    type: 'callout',
    variant: 'info',
    text: 'Cross-references:\n\u2022 DLT Bronze tables are created by Lakeflow Connect \u2014 see Ingestion page\n\u2022 SQL Warehouse sizing and cost \u2014 see Warehousing page\n\u2022 Unity Catalog namespace and permissions \u2014 see Warehousing page\n\u2022 Gold tables serve dashboards and Genie \u2014 see BI page\n\u2022 CI runs on every PR via GitHub Actions',
  },
]

export default function Dbt() {
  const { blocks, updateBlock, addBlock, removeBlock, saveStatus, forceSave } = usePageState('page:dbt', DEFAULT_BLOCKS)

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="pl-10">
        <BlockEditor blocks={blocks} updateBlock={updateBlock} addBlock={addBlock} removeBlock={removeBlock} saveStatus={saveStatus} onSave={forceSave} />
      </div>
    </div>
  )
}
