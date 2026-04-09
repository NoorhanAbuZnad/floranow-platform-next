'use client'
import BlockEditor from '../components/BlockEditor'
import { usePageState } from '../lib/usePageState'
import type { Block } from '../lib/blocks'

const DEFAULT_BLOCKS: Block[] = [
  // ═══════════════════════════════════════════════════════════════
  // TITLE & INTRO
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'ing-h0',
    type: 'heading',
    level: 1,
    text: 'Ingestion: Source Systems → Bronze',
  },
  {
    id: 'ing-intro',
    type: 'text',
    text: 'Floranow runs four source databases — three PostgreSQL instances and one MongoDB — all hosted on AWS eu-central-1 (Frankfurt). Today, Hevo Data replicates these into Google BigQuery using hourly query-based syncs. The goal is to replace Hevo entirely and land this data into Databricks as raw Delta tables in the Bronze layer.\n\nIngestion is the foundation of the entire data platform. If data doesn\'t arrive reliably, nothing downstream works — no clean tables, no dashboards, no AI. This page covers exactly how data gets from Floranow\'s source databases into Databricks: what methods are available, which ones fit each source, and how to handle edge cases like hard deletes.',
  },
  { id: 'ing-d0', type: 'divider' },

  // ═══════════════════════════════════════════════════════════════
  // THE FOUR SOURCES
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'ing-h-sources',
    type: 'heading',
    level: 2,
    text: 'The Four Sources',
  },
  {
    id: 'ing-sources-intro',
    type: 'text',
    text: 'Every piece of data in Floranow originates from one of these four databases. Understanding their size, change patterns, and quirks determines which ingestion method fits best.',
  },
  {
    id: 'ing-sources-grid',
    type: 'card-grid',
    columns: 2,
    cards: [
      {
        emoji: '🏢',
        title: 'ERP Database — 170 GB',
        description: 'PostgreSQL on AWS RDS eu-central-1\n\nThe backbone of Floranow. Contains orders, products, customers, invoices, and financial records. The largest database by far. Transactional writes happen throughout the day. Has reliable timestamp columns (updated_at) on key tables.\n\nChange volume: ~1–5 GB/day (CDC estimate)',
        borderTop: '#3B82F6',
      },
      {
        emoji: '🛒',
        title: 'Marketplace — 35 GB',
        description: 'PostgreSQL on AWS RDS eu-central-1\n\nListings, transactions, and marketplace operations. Moderate change rate. Has timestamp columns suitable for incremental extraction.\n\nChange volume: Moderate, follows business hours.',
        borderTop: '#8B5CF6',
      },
      {
        emoji: '🚚',
        title: 'Vendor-Shipment — 48 MB',
        description: 'PostgreSQL on AWS RDS eu-central-1\n\nShipments, carriers, and vendor logistics data. Tiny database — the entire dataset fits in memory. Some tables have hard deletes (rows physically removed, not soft-deleted).\n\nChange volume: Low. Full scan takes seconds.',
        borderTop: '#F59E0B',
      },
      {
        emoji: '🍃',
        title: 'App Data (MongoDB) — 2.62 GB',
        description: 'MongoDB on Atlas or EC2, eu-central-1\n\nUser activity, documents, and application events. Semi-structured — documents in the same collection can have completely different fields. Requires a different ingestion strategy because Lakeflow Connect does not yet support MongoDB.\n\nChange volume: Low to moderate.',
        borderTop: '#22A652',
      },
    ],
  },
  { id: 'ing-d1', type: 'divider' },

  // ═══════════════════════════════════════════════════════════════
  // WHAT IS LAKEFLOW CONNECT
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'ing-h-lfc',
    type: 'heading',
    level: 1,
    text: 'Lakeflow Connect',
  },
  {
    id: 'ing-lfc-intro',
    type: 'text',
    text: 'Lakeflow Connect is Databricks\' managed ingestion service. It replaces third-party tools like Hevo by providing built-in, governed data pipelines that move data from external databases into Delta Lake. No custom code, no separate vendor, no cross-cloud data transfer.\n\nThe key idea: you tell Databricks where your database is and which tables you want. Lakeflow Connect handles the extraction, staging, and loading automatically. Credentials are stored securely in Unity Catalog, and the entire pipeline is observable through system tables.',
  },
  {
    id: 'ing-lfc-flow',
    type: 'flow',
    steps: [
      {
        emoji: '🔗',
        title: 'Connection',
        subtitle: 'Unity Catalog object storing your database credentials (host, port, user, password via Secrets). One per source database.',
        color: '#3B82F6',
      },
      {
        emoji: '🔌',
        title: 'Gateway',
        subtitle: 'Extracts data from your database. Runs on classic compute. For QBC, activates on schedule. For CDC, runs continuously.',
        color: '#8B5CF6',
      },
      {
        emoji: '📦',
        title: 'Staging Volume',
        subtitle: 'A temporary inbox on S3. The gateway drops extracted data here. The pipeline picks it up later. If anything fails, data is safe here. Auto-purges after 30 days.',
        color: '#F59E0B',
      },
      {
        emoji: '⚙️',
        title: 'Pipeline',
        subtitle: 'Reads from staging, applies changes to destination tables. Runs on serverless compute. Handles deduplication and schema evolution.',
        color: '#22A652',
      },
      {
        emoji: '🗄️',
        title: 'Bronze Tables',
        subtitle: 'Streaming tables in floranow_catalog.bronze.* — Delta tables with built-in incremental processing and watermark tracking.',
        color: '#EF4444',
      },
    ],
  },
  {
    id: 'ing-lfc-staging',
    type: 'callout',
    variant: 'info',
    text: 'Why the Staging Volume? It decouples extraction from loading. The gateway can extract data on its own schedule, and the pipeline can process it on a different schedule. If the pipeline fails, the extracted data is still safely sitting in staging — nothing is lost. Think of it as a mailbox between your database and your Delta tables.',
  },
  { id: 'ing-d-lfc', type: 'divider' },

  // ═══════════════════════════════════════════════════════════════
  // POSTGRESQL: FOUR OPTIONS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'ing-h-pg',
    type: 'heading',
    level: 1,
    text: 'PostgreSQL Ingestion — Four Options',
  },
  {
    id: 'ing-pg-intro',
    type: 'text',
    text: 'Databricks offers four distinct ways to bring PostgreSQL data into the Lakehouse. Each trades off between simplicity, cost, latency, and capabilities like hard delete detection. Understanding all four helps Floranow pick the right tool for each database — and know exactly where to go if requirements change later.',
  },

  // -- Option 1: QBC --
  {
    id: 'ing-h-qbc',
    type: 'heading',
    level: 2,
    text: 'Option 1 — Lakeflow Connect: Query Based Capture (QBC)',
  },
  {
    id: 'ing-qbc-text',
    type: 'text',
    text: 'This is the simplest managed approach. Lakeflow Connect queries your PostgreSQL tables incrementally using a cursor column — typically a timestamp like updated_at. On each scheduled run, it fetches only the rows that changed since the last extraction, then merges them into Delta streaming tables in Bronze.\n\nNo WAL configuration. No replication slots. No continuous gateway. No RDS reboot. The connector runs on serverless compute and only activates when scheduled. Databricks manages the extraction, staging, and loading end-to-end.\n\nThe trade-off: QBC cannot see hard deletes. If a row is physically removed from PostgreSQL, QBC has no way to know — it only looks for rows with a cursor value newer than the last checkpoint. The deleted row simply persists in Bronze. QBC also depends entirely on having a reliable, monotonically increasing cursor column on every ingested table. If a table lacks one, QBC falls back to a full table scan.',
  },
  {
    id: 'ing-qbc-card',
    type: 'card-grid',
    columns: 2,
    cards: [
      {
        emoji: '✅',
        title: 'Strengths',
        description: '• Fully managed — zero custom code\n• No WAL configuration on source database\n• No RDS reboot required\n• Serverless compute — scales to zero when idle\n• Scheduled ingestion — cost-efficient\n• Queries only changed rows (incremental)\n• Built-in schema evolution support',
        borderTop: '#22A652',
      },
      {
        emoji: '⚠️',
        title: 'Limitations',
        description: '• Cannot detect hard deletes\n• Requires a reliable cursor/watermark column\n• Falls back to full scan if no cursor column exists\n• Not available in Lakeflow Connect public docs yet — recommended by Databricks team specifically for Floranow. Confirm availability during PoC enrollment.\n• Higher latency than CDC (minutes-to-hours vs seconds)',
        borderTop: '#F59E0B',
      },
    ],
  },
  {
    id: 'ing-qbc-note',
    type: 'callout',
    variant: 'tip',
    text: 'QBC was recommended by the Databricks team as the starting ingestion pattern for Floranow\'s ERP and Marketplace databases. It delivers managed incremental ingestion on serverless compute with zero database configuration changes. If near real-time latency or hard delete detection becomes necessary later, upgrading to CDC (Option 4) is the natural next step.',
  },
  { id: 'ing-d-qbc', type: 'divider' },

  // -- Option 2: AUTO CDC FROM SNAPSHOTS --
  {
    id: 'ing-h-snap',
    type: 'heading',
    level: 2,
    text: 'Option 2 — AUTO CDC FROM SNAPSHOTS',
  },
  {
    id: 'ing-snap-text',
    type: 'text',
    text: 'Instead of reading only changed rows, this method reads the entire table on each run and compares it row-by-row against the previous snapshot. New rows are inserted. Changed rows are updated. Rows that existed before but are now missing are marked as deleted.\n\nThis is the only PostgreSQL ingestion method that detects hard deletes without WAL or Change Streams. It uses a Lakeflow Declarative Pipeline with the create_auto_cdc_from_snapshot_flow() function. You define the primary key columns, and the framework handles the diffing automatically. SCD Type 1 (overwrite current state) and SCD Type 2 (preserve full history with timestamps) are both supported natively.\n\nThe trade-off: it reads the full table every time. For the ERP database at 170 GB, this would mean scanning the entire dataset on every run — impractical and expensive. But for Vendor-Shipment at 48 MB, the full scan completes in a few seconds.',
  },
  {
    id: 'ing-snap-card',
    type: 'card-grid',
    columns: 2,
    cards: [
      {
        emoji: '✅',
        title: 'Strengths',
        description: '• Detects hard deletes automatically\n• SCD Type 1 & Type 2 built-in\n• No WAL configuration needed\n• No replication slots required\n• No cursor column dependency\n• Handles any table regardless of schema',
        borderTop: '#22A652',
      },
      {
        emoji: '⚠️',
        title: 'Limitations',
        description: '• Full table scan every run — doesn\'t scale to large tables\n• Python API only (Lakeflow Declarative Pipelines)\n• Higher source database load during scans\n• Higher latency than CDC\n• If using Spark Connector for read, requires dedicated classic compute cluster',
        borderTop: '#F59E0B',
      },
    ],
  },
  { id: 'ing-d-snap', type: 'divider' },

  // -- Option 3: Lakehouse Federation --
  {
    id: 'ing-h-fed',
    type: 'heading',
    level: 2,
    text: 'Option 3 — Lakehouse Federation + Custom MERGE',
  },
  {
    id: 'ing-fed-text',
    type: 'text',
    text: 'Lakehouse Federation is a fundamentally different concept from Lakeflow Connect. Instead of copying data, it lets Databricks query your PostgreSQL database live — in real time — without moving anything. You create a "foreign catalog" in Unity Catalog that mirrors your PostgreSQL database structure. Every schema and table appears in Databricks as if it were a native table. When you query it, Databricks sends the SQL over JDBC to PostgreSQL, gets the results back, and shows them.\n\nTo use Federation for ingestion, you combine it with MERGE INTO: write a scheduled notebook that reads from the federated table with a watermark filter (only rows changed since last run), then merges the results into a local Delta table in Bronze.\n\nThis gives you full control over query logic, parallelism, and error handling. You can use parallel reads to split a large table across 8 JDBC connections simultaneously. You can use EXPLAIN FORMATTED to see exactly which filters get pushed down to PostgreSQL and which are applied locally.\n\nBut you\'re building and maintaining the pipeline yourself — error handling, retry logic, monitoring, and schema evolution are all your responsibility.',
  },
  {
    id: 'ing-fed-flow',
    type: 'flow',
    steps: [
      {
        emoji: '🔗',
        title: 'Create Connection',
        subtitle: 'Store PostgreSQL credentials in Unity Catalog (same as Lakeflow Connect)',
        color: '#3B82F6',
      },
      {
        emoji: '📂',
        title: 'Create Foreign Catalog',
        subtitle: 'Mirror the PostgreSQL database structure in Unity Catalog — all schemas and tables appear instantly',
        color: '#8B5CF6',
      },
      {
        emoji: '📝',
        title: 'Write MERGE Notebook',
        subtitle: 'Read from federated table with watermark filter, MERGE INTO Bronze Delta table',
        color: '#F59E0B',
      },
      {
        emoji: '⏰',
        title: 'Schedule Job',
        subtitle: 'Run the notebook hourly via Lakeflow Jobs or Databricks Workflows',
        color: '#22A652',
      },
    ],
  },
  {
    id: 'ing-fed-code',
    type: 'code',
    code: `-- Example: Lakehouse Federation incremental ingestion
-- Step 1: Create a Connection (same as Lakeflow Connect)
CREATE CONNECTION floranow_erp_federation
TYPE POSTGRESQL
OPTIONS (
  host 'erp-db.xxxxx.eu-central-1.rds.amazonaws.com',
  port '5432',
  user 'readonly_user',
  password secret('floranow-secrets', 'erp-db-password')
);

-- Step 2: Create a Foreign Catalog (mirrors the entire database)
CREATE FOREIGN CATALOG erp_federated
USING CONNECTION floranow_erp_federation
OPTIONS (database 'erp_db');

-- Now every table in erp_db is queryable:
-- SELECT * FROM erp_federated.public.orders WHERE ...

-- Step 3: Incremental MERGE with watermark
MERGE INTO floranow_catalog.bronze.erp_orders AS target
USING (
  SELECT *
  FROM erp_federated.public.orders
  WHERE updated_at > (
    SELECT COALESCE(MAX(updated_at), '1970-01-01')
    FROM floranow_catalog.bronze.erp_orders
  )
) AS source
ON target.order_id = source.order_id
WHEN MATCHED THEN UPDATE SET *
WHEN NOT MATCHED THEN INSERT *;`,
  },
  {
    id: 'ing-fed-card',
    type: 'card-grid',
    columns: 2,
    cards: [
      {
        emoji: '✅',
        title: 'Strengths',
        description: '• Full control over query logic and parallelism\n• Parallel reads — split large tables across multiple JDBC connections\n• Predicate pushdown — filters are executed on PostgreSQL, not Spark\n• Join pushdown — joins between federated tables run on PostgreSQL\n• No WAL needed\n• Works with Pro or Serverless SQL Warehouses\n• Great for ad-hoc queries and migration validation',
        borderTop: '#22A652',
      },
      {
        emoji: '⚠️',
        title: 'Limitations',
        description: '• Requires custom code — you build and maintain the pipeline\n• No built-in monitoring or alerting\n• Schema evolution must be handled manually\n• Cannot detect hard deletes natively\n• Adds direct read load to production PostgreSQL\n• Error handling and retry logic are your responsibility',
        borderTop: '#F59E0B',
      },
    ],
  },
  {
    id: 'ing-fed-callout',
    type: 'callout',
    variant: 'info',
    text: 'Federation\'s real superpower for Floranow isn\'t primary ingestion — it\'s migration validation. During the parallel run phase (Hevo + Lakeflow side by side), Federation can query BigQuery directly from Databricks to compare results without moving data. The Databricks team specifically recommended this: "Using Lakehouse Federation to directly query BigQuery from Databricks side-by-side without moving the data."',
  },
  { id: 'ing-d-fed', type: 'divider' },

  // -- Option 4: CDC --
  {
    id: 'ing-h-cdc',
    type: 'heading',
    level: 2,
    text: 'Option 4 — Lakeflow Connect: Change Data Capture (CDC)',
  },
  {
    id: 'ing-cdc-text',
    type: 'text',
    text: 'This is true, real-time change data capture. Lakeflow Connect reads the PostgreSQL Write-Ahead Log (WAL) via logical replication, capturing every INSERT, UPDATE, and DELETE the moment it happens. A continuous ingestion gateway maintains a persistent connection to a replication slot and streams changes into a staging volume. A separate serverless pipeline then applies these changes to destination streaming tables.\n\nThis is the most capable option — near real-time latency, automatic schema evolution, and full visibility into deletes. It\'s also the most expensive and operationally complex. The gateway must run 24/7 because if it stops, unreplicated WAL accumulates on PostgreSQL and can fill up the disk.\n\nThe PostgreSQL connector for Lakeflow Connect CDC is currently in Public Preview. Setup requires enabling logical replication on PostgreSQL (wal_level=logical), which means an RDS parameter group change and a reboot.',
  },
  {
    id: 'ing-cdc-card',
    type: 'card-grid',
    columns: 2,
    cards: [
      {
        emoji: '✅',
        title: 'Strengths',
        description: '• True CDC — captures INSERT, UPDATE, DELETE in real time\n• Near real-time latency (seconds to minutes)\n• Minimal source database overhead (reads WAL, not tables)\n• Automatic schema evolution (new columns added)\n• SCD Type 1 & Type 2 supported\n• Fully managed by Databricks\n• Best scalability for large databases',
        borderTop: '#22A652',
      },
      {
        emoji: '⚠️',
        title: 'Limitations',
        description: '• Requires wal_level=logical on PostgreSQL (RDS reboot)\n• Replication slots and publications must be configured\n• Gateway runs continuously on classic compute (24/7)\n• Additional cost: ~$330–380/mo gateway + ~$100–130/mo AWS VM\n• If gateway stops, WAL bloat risk on source\n• Currently in Public Preview\n• Cannot ingest from read replicas',
        borderTop: '#F59E0B',
      },
    ],
  },
  {
    id: 'ing-cdc-flow',
    type: 'flow',
    steps: [
      {
        emoji: '⚙️',
        title: 'Enable WAL',
        subtitle: 'Set wal_level=logical on RDS. Requires parameter group change + reboot (~1-3 min downtime).',
        color: '#EF4444',
      },
      {
        emoji: '👤',
        title: 'Create Replication User',
        subtitle: 'Dedicated user with REPLICATION privilege + SELECT on tables.',
        color: '#3B82F6',
      },
      {
        emoji: '📋',
        title: 'Create Publication & Slot',
        subtitle: 'Publication defines which tables to replicate. Slot tracks position in WAL.',
        color: '#8B5CF6',
      },
      {
        emoji: '🔗',
        title: 'Create Connection',
        subtitle: 'Unity Catalog connection with credentials.',
        color: '#F59E0B',
      },
      {
        emoji: '🔌',
        title: 'Deploy Gateway',
        subtitle: 'Continuous pipeline on classic compute. Must run 24/7.',
        color: '#22A652',
      },
      {
        emoji: '📊',
        title: 'Create Pipeline',
        subtitle: 'Serverless pipeline applies changes to Bronze streaming tables.',
        color: '#06B6D4',
      },
    ],
  },
  {
    id: 'ing-cdc-setup',
    type: 'code',
    code: `-- CDC requires PostgreSQL configuration before pipeline creation

-- 1. Enable logical replication (AWS RDS — requires reboot)
-- In the RDS Parameter Group, set:
--   rds.logical_replication = 1

-- 2. Create a dedicated replication user
CREATE USER databricks_replication WITH REPLICATION LOGIN PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE erp_db TO databricks_replication;
GRANT USAGE ON SCHEMA public TO databricks_replication;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO databricks_replication;
GRANT rds_replication TO databricks_replication;  -- AWS RDS specific

-- 3. Set replica identity on tables (DEFAULT uses primary key)
ALTER TABLE orders REPLICA IDENTITY DEFAULT;
ALTER TABLE products REPLICA IDENTITY DEFAULT;
ALTER TABLE customers REPLICA IDENTITY DEFAULT;
-- Tables WITHOUT a primary key need FULL (compares all columns — slower)
ALTER TABLE audit_log REPLICA IDENTITY FULL;

-- 4. Create publication (defines which tables to replicate)
CREATE PUBLICATION databricks_publication FOR ALL TABLES;

-- 5. Create replication slot (tracks position in WAL)
SET ROLE databricks_replication;
SELECT pg_create_logical_replication_slot('databricks_slot', 'pgoutput');
RESET ROLE;

-- Verify
SHOW wal_level;  -- Must return 'logical'`,
  },
  { id: 'ing-d-cdc', type: 'divider' },

  // ═══════════════════════════════════════════════════════════════
  // DECISION MATRIX
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'ing-h-matrix',
    type: 'heading',
    level: 1,
    text: 'Which Option for Each Source?',
  },
  {
    id: 'ing-matrix-intro',
    type: 'text',
    text: 'Each source database has different characteristics — size, change volume, and whether hard deletes occur. The table below maps the recommended starting option for each source. These are starting points, not permanent decisions. The ingestion layer is isolated — changing the method later only affects Bronze. Everything downstream stays the same.',
  },
  {
    id: 'ing-matrix-tbl',
    type: 'table',
    headers: ['Source', 'Size', 'Recommended Option', 'Why', 'Upgrade Path'],
    rows: [
      [
        'ERP',
        '170 GB',
        'Option 1: QBC',
        'Existing cursor columns. Managed serverless. No WAL config needed. Cost-efficient at this scale.',
        '→ Option 4 (CDC) if near real-time or hard delete detection needed',
      ],
      [
        'Marketplace',
        '35 GB',
        'Option 1: QBC',
        'Same reasoning. Moderate changes don\'t justify a continuous gateway.',
        '→ Option 4 (CDC)',
      ],
      [
        'Vendor-Shipment',
        '48 MB',
        'Option 2: AUTO CDC FROM SNAPSHOTS',
        'Tiny table — full scan takes seconds. Only option that catches hard deletes without WAL.',
        'Not needed — snapshots are ideal at this size',
      ],
      [
        'MongoDB',
        '2.62 GB',
        'Spark Connector + Change Streams',
        'Not supported by Lakeflow Connect. True CDC via Change Streams. Documents stored as VARIANT.',
        'Revisit when Lakeflow Connect adds MongoDB support',
      ],
    ],
  },
  {
    id: 'ing-matrix-compare',
    type: 'compare',
    leftTitle: '🔴  What We\'re Replacing (Hevo Data)',
    rightTitle: '🟢  What We\'re Moving To',
    items: [
      {
        old: 'Third-party SaaS — separate vendor, separate bill, separate support',
        new: 'Lakeflow Connect — built into Databricks, single bill, native monitoring',
      },
      {
        old: 'Query-based replication — polls tables hourly, no true CDC',
        new: 'QBC for PostgreSQL + Change Streams for MongoDB — incremental and real-time options',
      },
      {
        old: 'Cross-cloud transfer — data travels from AWS eu-central-1 to GCP (egress cost ~$0.12/GB)',
        new: 'Same region — data stays in AWS eu-central-1. Zero cross-cloud transfer.',
      },
      {
        old: 'No hard delete detection for MongoDB. Limited observability into pipeline internals.',
        new: 'Spark Connector captures hard deletes via Change Streams. Full observability via system tables.',
      },
      {
        old: 'Separate governance — Hevo has its own IAM, its own credentials storage',
        new: 'Unity Catalog governance — connections, secrets, lineage, audit logs all in one place',
      },
    ],
  },
  { id: 'ing-d-matrix', type: 'divider' },

  // ═══════════════════════════════════════════════════════════════
  // THE HARD DELETE PROBLEM
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'ing-h-deletes',
    type: 'heading',
    level: 1,
    text: 'The Hard Delete Problem',
  },
  {
    id: 'ing-deletes-intro',
    type: 'text',
    text: 'QBC cannot detect hard deletes. When a row is physically removed from PostgreSQL, QBC never sees it again — it only queries for rows with cursor values newer than the last checkpoint. The deleted row silently persists in Bronze forever.\n\nFor the ERP and Marketplace databases, this requires a strategy. The right approach depends on which tables actually have hard deletes and how quickly those deletes need to be reflected downstream. Here are four practical solutions, ordered from simplest to most involved.',
  },
  {
    id: 'ing-deletes-grid',
    type: 'card-grid',
    columns: 2,
    cards: [
      {
        emoji: '1️⃣',
        title: 'Soft Deletes on the Source',
        description: 'Instead of DELETE FROM orders WHERE id = 123, the application sets UPDATE orders SET deleted_at = NOW() WHERE id = 123. The row stays in PostgreSQL with a timestamp marking deletion. QBC picks up this change because the cursor column advances.\n\nThis is the cleanest solution but requires a change in application code. Most production systems already implement soft deletes for auditability.\n\nBest for: Tables where the application team can modify delete behavior.',
        borderTop: '#22A652',
      },
      {
        emoji: '2️⃣',
        title: 'PostgreSQL Trigger-Based Archiving',
        description: 'Create a database trigger on tables with hard deletes. Before a row is deleted, the trigger automatically copies it to a separate archive table (e.g. deleted_orders) with a timestamp. QBC then ingests both the main table and the archive table.\n\nNo application code changes needed — the trigger catches every DELETE at the database level. Adds a shadow table per source table.\n\nBest for: Tables where application changes aren\'t feasible.',
        borderTop: '#3B82F6',
      },
      {
        emoji: '3️⃣',
        title: 'Periodic Snapshot Reconciliation',
        description: 'Run QBC for day-to-day incremental ingestion. Separately, schedule a weekly or daily AUTO CDC FROM SNAPSHOTS job on the specific tables that have hard deletes. The snapshot job diffs the full table and catches any rows that disappeared.\n\nCombines QBC efficiency (incremental, serverless) with snapshot completeness (catches deletes). Delete detection lags by the snapshot interval.\n\nBest for: Tables where deletes are infrequent and slight delay is acceptable.',
        borderTop: '#8B5CF6',
      },
      {
        emoji: '4️⃣',
        title: 'Upgrade to CDC for Those Tables',
        description: 'If certain tables have frequent hard deletes and timely detection is critical, upgrade just those tables to Lakeflow Connect CDC (Option 4). You don\'t need to upgrade the entire database — run QBC for most tables and CDC only for the few that require delete detection.\n\nAdds ~$430–510/mo for the continuous gateway.\n\nBest for: Tables where real-time delete detection is a business requirement.',
        borderTop: '#EF4444',
      },
    ],
  },
  {
    id: 'ing-deletes-trigger-code',
    type: 'heading',
    level: 3,
    text: 'Example: Trigger-Based Archiving (Approach 2)',
  },
  {
    id: 'ing-deletes-trigger',
    type: 'code',
    code: `-- Create an archive table that mirrors the source structure
CREATE TABLE deleted_orders (LIKE orders INCLUDING ALL);
ALTER TABLE deleted_orders ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NOW();

-- Create a trigger function that archives before DELETE
CREATE OR REPLACE FUNCTION archive_deleted_order()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO deleted_orders SELECT OLD.*, NOW();
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Attach the trigger to the source table
CREATE TRIGGER trg_archive_order
BEFORE DELETE ON orders
FOR EACH ROW EXECUTE FUNCTION archive_deleted_order();

-- Now QBC ingests both tables:
-- floranow_catalog.bronze.erp_orders        (live rows)
-- floranow_catalog.bronze.erp_deleted_orders (archived deletes)`,
  },
  {
    id: 'ing-deletes-callout',
    type: 'callout',
    variant: 'warn',
    text: 'Action needed during PoC: Map which tables in ERP and Marketplace actually have hard deletes. This determines which approach to implement. Most tables likely use soft deletes already — only the exceptions need a workaround.',
  },
  { id: 'ing-d-deletes', type: 'divider' },

  // ═══════════════════════════════════════════════════════════════
  // QBC SETUP
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'ing-h-setup',
    type: 'heading',
    level: 1,
    text: 'QBC Setup — Step by Step',
  },
  {
    id: 'ing-setup-intro',
    type: 'text',
    text: 'Unlike CDC (Option 4), QBC does not require enabling logical replication or rebooting RDS. It queries the source using standard SELECT with a cursor column. No database configuration changes are needed on PostgreSQL — just a read-only user with SELECT privileges.',
  },
  {
    id: 'ing-setup-flow',
    type: 'flow',
    steps: [
      {
        emoji: '🔐',
        title: 'Step 1: Store Credentials',
        subtitle: 'Create a Databricks Secrets scope and store database passwords securely.',
        color: '#3B82F6',
      },
      {
        emoji: '🔗',
        title: 'Step 2: Create Connections',
        subtitle: 'Unity Catalog connection for each PostgreSQL database (ERP, MP, Vendor).',
        color: '#8B5CF6',
      },
      {
        emoji: '🔑',
        title: 'Step 3: Grant Privileges',
        subtitle: 'Ensure the pipeline service principal has CREATE TABLE, USE CATALOG, USE SCHEMA.',
        color: '#F59E0B',
      },
      {
        emoji: '📊',
        title: 'Step 4: Create Pipelines',
        subtitle: 'Define QBC ingestion pipelines — specify tables, cursor columns, destination schema.',
        color: '#22A652',
      },
      {
        emoji: '✅',
        title: 'Step 5: Verify',
        subtitle: 'Check connections, monitor initial snapshot, validate row counts.',
        color: '#06B6D4',
      },
    ],
  },
  {
    id: 'ing-setup-h-privs',
    type: 'heading',
    level: 3,
    text: 'Required Databricks Privileges',
  },
  {
    id: 'ing-setup-privs',
    type: 'table',
    headers: ['Privilege', 'On', 'Purpose'],
    rows: [
      ['CREATE CONNECTION', 'Metastore', 'Create Unity Catalog connection objects for PostgreSQL sources'],
      ['USE CONNECTION', 'Connection', 'Reference the connection in pipeline definitions'],
      ['USE CATALOG', 'floranow_catalog', 'Access the target catalog'],
      ['USE SCHEMA', 'floranow_catalog.bronze', 'Access the bronze schema for writing'],
      ['CREATE TABLE', 'floranow_catalog.bronze', 'Create streaming tables (destination for ingested data)'],
      ['CREATE VOLUME', 'floranow_catalog.bronze', 'Create staging volumes for the gateway'],
    ],
  },
  {
    id: 'ing-setup-code',
    type: 'code',
    code: `-- Step 1: Create Unity Catalog connections (one per source database)

CREATE CONNECTION floranow_erp_connection
TYPE POSTGRESQL
OPTIONS (
  host 'erp-db.xxxxx.eu-central-1.rds.amazonaws.com',
  port '5432',
  user 'floranow_readonly',
  password secret('floranow-secrets', 'erp-db-password')
);

CREATE CONNECTION floranow_mp_connection
TYPE POSTGRESQL
OPTIONS (
  host 'mp-db.xxxxx.eu-central-1.rds.amazonaws.com',
  port '5432',
  user 'floranow_readonly',
  password secret('floranow-secrets', 'mp-db-password')
);

CREATE CONNECTION floranow_vendor_connection
TYPE POSTGRESQL
OPTIONS (
  host 'vendor-db.xxxxx.eu-central-1.rds.amazonaws.com',
  port '5432',
  user 'floranow_readonly',
  password secret('floranow-secrets', 'vendor-db-password')
);

-- Verify connections
DESCRIBE CONNECTION floranow_erp_connection;
DESCRIBE CONNECTION floranow_mp_connection;
DESCRIBE CONNECTION floranow_vendor_connection;

-- Step 2: Grant privileges to ingestion service principal
GRANT CREATE CONNECTION ON METASTORE TO \`floranow-ingestion-sp\`;
GRANT USE CATALOG ON CATALOG floranow_catalog TO \`floranow-ingestion-sp\`;
GRANT USE SCHEMA ON SCHEMA floranow_catalog.bronze TO \`floranow-ingestion-sp\`;
GRANT CREATE TABLE ON SCHEMA floranow_catalog.bronze TO \`floranow-ingestion-sp\`;
GRANT CREATE VOLUME ON SCHEMA floranow_catalog.bronze TO \`floranow-ingestion-sp\`;`,
  },
  { id: 'ing-d-setup', type: 'divider' },

  // ═══════════════════════════════════════════════════════════════
  // MONGODB
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'ing-h-mongo',
    type: 'heading',
    level: 1,
    text: 'MongoDB Ingestion',
  },
  {
    id: 'ing-mongo-intro',
    type: 'text',
    text: 'MongoDB is not supported by Lakeflow Connect. All MongoDB ingestion runs through the Spark ecosystem on classic compute using the official MongoDB Spark Connector.\n\nAt 2.62 GB, Floranow\'s MongoDB instance is small. At this scale, cost differences between approaches are negligible — the decision should be driven by simplicity and whether hard delete detection is needed.',
  },
  {
    id: 'ing-mongo-options',
    type: 'heading',
    level: 2,
    text: 'Five Options Evaluated',
  },
  {
    id: 'ing-mongo-tbl',
    type: 'table',
    headers: ['Option', 'Method', 'Hard Deletes?', 'Real-Time?', 'Verdict'],
    rows: [
      ['1', 'Spark Connector + Change Streams', 'Yes', 'Yes (near real-time)', 'Recommended — true CDC, Spark manages checkpoints, best scalability'],
      ['2', 'Atlas Data Federation → S3 → Autoloader', 'No (needs diffing)', 'No (batch)', 'Only if ADF is already in place'],
      ['3', 'Spark Connector batch + watermark merge', 'No', 'No (scheduled)', 'Simpler but less capable than Option 1'],
      ['4', 'PyMongo (batch or Change Streams)', 'With Change Streams', 'Possible', 'Single-threaded — not recommended for production'],
      ['5', 'AUTO CDC FROM SNAPSHOTS', 'Yes', 'No (batch)', 'Alternative if Change Streams are unavailable'],
    ],
  },
  {
    id: 'ing-mongo-decision',
    type: 'callout',
    variant: 'tip',
    text: 'Decision logic from the Databricks team:\n1. ADF already in place? → Use Autoloader on S3 (Option 2)\n2. ADF not in place? → Spark Connector + Change Streams is the simplest path (Option 1)\n3. Hard deletes needed? → Option 1 is the only option with built-in detection\n4. Growth toward 100 GB+? → Option 1 scales most efficiently\n\nFloranow does not have ADF in place. Option 1 is the recommended starting point.',
  },
  { id: 'ing-d-mongo1', type: 'divider' },

  {
    id: 'ing-mongo-h-how',
    type: 'heading',
    level: 2,
    text: 'How Spark Connector + Change Streams Works',
  },
  {
    id: 'ing-mongo-how-text',
    type: 'text',
    text: 'The Spark MongoDB Connector (org.mongodb.spark:mongo-spark-connector_2.12:10.4.0) uses MongoDB Change Streams — an event-based protocol built on the oplog — to capture every insert, update, and delete in near real-time. Spark manages checkpointing automatically, so if the pipeline restarts, it picks up exactly where it left off.\n\nDocuments are stored as VARIANT at Bronze — raw JSON without schema enforcement. This is critical for MongoDB because documents in the same collection can have completely different fields. VARIANT handles this naturally. Parsing into typed columns happens later, outside the ingestion layer.\n\nThe connector requires a classic compute cluster (not serverless) because it depends on a JVM-based JAR. The cluster needs the MongoDB Spark Connector JAR installed as a library.',
  },
  {
    id: 'ing-mongo-flow',
    type: 'flow',
    steps: [
      {
        emoji: '📦',
        title: 'Install JAR',
        subtitle: 'Add mongo-spark-connector_2.12:10.4.0 to the cluster libraries',
        color: '#22A652',
      },
      {
        emoji: '📥',
        title: 'Initial Full Load',
        subtitle: 'spark.read.format("mongodb") — read all documents, write to Delta as VARIANT',
        color: '#3B82F6',
      },
      {
        emoji: '🌊',
        title: 'Change Stream',
        subtitle: 'spark.readStream.format("mongodb") — capture inserts, updates, deletes in real time',
        color: '#8B5CF6',
      },
      {
        emoji: '💾',
        title: 'Checkpoint',
        subtitle: 'Spark stores resume token in /Volumes/.../_checkpoints/ — never delete this',
        color: '#F59E0B',
      },
    ],
  },
  {
    id: 'ing-mongo-code',
    type: 'code',
    code: `# MongoDB Spark Connector — Full Load + Continuous Change Stream
# Cluster: Classic compute (e.g. i3.xlarge, single node sufficient for 2.62 GB)
# Library: org.mongodb.spark:mongo-spark-connector_2.12:10.4.0

from pyspark.sql import functions as F

MONGO_URI = dbutils.secrets.get("floranow-secrets", "mongodb-uri")

# ═══════════════════════════════════════════════════════
# Step 1: Initial Full Load
# ═══════════════════════════════════════════════════════
initial_df = (spark.read
  .format("mongodb")
  .option("connection.uri", MONGO_URI)
  .option("database", "floranow_app")
  .option("collection", "documents")
  .load()
)

(initial_df
  .select(
    F.col("_id").cast("string").alias("document_id"),
    F.to_json(F.struct("*")).cast("string").alias("raw_json"),
    F.current_timestamp().alias("_ingested_at")
  )
  .write.format("delta")
  .mode("overwrite")
  .saveAsTable("floranow_catalog.bronze.mongodb_app_data")
)

# ═══════════════════════════════════════════════════════
# Step 2: Continuous Change Stream
# ═══════════════════════════════════════════════════════
stream_df = (spark.readStream
  .format("mongodb")
  .option("connection.uri", MONGO_URI)
  .option("database", "floranow_app")
  .option("collection", "documents")
  .option("change.stream.publish.full.document.only", "true")
  .load()
)

(stream_df
  .select(
    F.col("_id").cast("string").alias("document_id"),
    F.to_json(F.struct("*")).cast("string").alias("raw_json"),
    F.current_timestamp().alias("_ingested_at")
  )
  .writeStream.format("delta")
  .option("checkpointLocation",
    "/Volumes/floranow_catalog/bronze/_checkpoints/mongodb_app_data")
  .outputMode("append")
  .trigger(processingTime="5 minutes")
  .toTable("floranow_catalog.bronze.mongodb_app_data")
)`,
  },
  {
    id: 'ing-mongo-variant',
    type: 'callout',
    variant: 'tip',
    text: 'Why VARIANT? MongoDB documents are schema-free — a single collection can contain documents with completely different fields. Storing as VARIANT (raw JSON) at Bronze means: no schema evolution problems, no ingestion failures from unexpected fields, and no data loss from missing fields. Parsing into typed columns happens later when transforming Bronze → Silver. This is the approach recommended by the Databricks team.',
  },
  { id: 'ing-d-mongo', type: 'divider' },

  // ═══════════════════════════════════════════════════════════════
  // UPGRADE PATH
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'ing-h-upgrade',
    type: 'heading',
    level: 1,
    text: 'Upgrade Path: QBC → CDC',
  },
  {
    id: 'ing-upgrade-text',
    type: 'text',
    text: 'One of the key design principles: the ingestion method can change without affecting anything downstream. Bronze tables have the same structure regardless of whether data arrived via QBC, CDC, snapshots, or Federation. Silver views, Gold tables, dbt models, dashboards, and Genie Spaces all remain untouched.',
  },
  {
    id: 'ing-upgrade-compare',
    type: 'compare',
    leftTitle: '📦  What Changes When Upgrading to CDC',
    rightTitle: '✅  What Stays the Same',
    items: [
      {
        old: 'Enable wal_level=logical on PostgreSQL (requires RDS parameter group change + reboot)',
        new: 'Unity Catalog connections (same credentials)',
      },
      {
        old: 'Create replication slots and publications on PostgreSQL',
        new: 'Destination streaming tables in floranow_catalog.bronze.*',
      },
      {
        old: 'Deploy continuous ingestion gateway (classic compute, runs 24/7)',
        new: 'All Silver views and Gold tables',
      },
      {
        old: 'Additional cost: ~$330–380/mo gateway + ~$100–130/mo AWS VM',
        new: 'dbt models — zero changes',
      },
      {
        old: 'Monitor WAL bloat and replication slot health',
        new: 'Dashboards, Genie Spaces, and all downstream consumers',
      },
    ],
  },
  {
    id: 'ing-upgrade-when',
    type: 'callout',
    variant: 'info',
    text: 'When to upgrade:\n• Near real-time latency becomes a business requirement (seconds, not minutes)\n• Hard delete detection is needed on ERP/MP tables and the workarounds above are insufficient\n• Read pressure on PostgreSQL needs to be reduced (CDC reads WAL, not tables)\n\nThis is not an urgent decision. Start with QBC, validate during the PoC, and upgrade individual databases or tables later if the need arises.',
  },
  { id: 'ing-d-upgrade', type: 'divider' },

  // ═══════════════════════════════════════════════════════════════
  // MONITORING
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'ing-h-monitor',
    type: 'heading',
    level: 1,
    text: 'Monitoring & Data Freshness',
  },
  {
    id: 'ing-monitor-text',
    type: 'text',
    text: 'Ingestion pipelines run unattended — they must be monitored. Databricks system tables provide built-in observability. The queries below track pipeline health, data freshness, and row counts. Set up alerts so the team knows immediately if data stops arriving.',
  },
  {
    id: 'ing-monitor-code',
    type: 'code',
    code: `-- Monitor data freshness across all Bronze tables
SELECT
  table_catalog,
  table_schema,
  table_name,
  last_altered,
  TIMESTAMPDIFF(MINUTE, last_altered, CURRENT_TIMESTAMP()) AS minutes_since_update,
  CASE
    WHEN TIMESTAMPDIFF(MINUTE, last_altered, CURRENT_TIMESTAMP()) > 75
    THEN 'STALE'
    ELSE 'FRESH'
  END AS freshness_status
FROM system.information_schema.tables
WHERE table_catalog = 'floranow_catalog'
  AND table_schema = 'bronze'
ORDER BY last_altered DESC;

-- Row count validation (compare against Hevo during parallel run)
SELECT 'erp_orders' AS table_name, COUNT(*) AS row_count
FROM floranow_catalog.bronze.erp_orders
UNION ALL
SELECT 'erp_products', COUNT(*) FROM floranow_catalog.bronze.erp_products
UNION ALL
SELECT 'erp_customers', COUNT(*) FROM floranow_catalog.bronze.erp_customers
UNION ALL
SELECT 'mongodb_app_data', COUNT(*) FROM floranow_catalog.bronze.mongodb_app_data;`,
  },
  { id: 'ing-d-monitor', type: 'divider' },

  // ═══════════════════════════════════════════════════════════════
  // PITFALLS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'ing-h-pitfalls',
    type: 'heading',
    level: 1,
    text: 'Common Pitfalls',
  },
  {
    id: 'ing-pitfalls-callout',
    type: 'callout',
    variant: 'warn',
    text: 'QBC:\n• Cursor column must be reliable and monotonically increasing. If updated_at is not set on every UPDATE, rows can be missed.\n• Does not detect hard deletes — see "The Hard Delete Problem" section above.\n• Falls back to full table scan if no cursor column is available on a table.\n\nCDC (if upgraded later):\n• WAL bloat: If the gateway stops, unreplicated WAL accumulates on PostgreSQL. Monitor pg_replication_slots and set max_slot_wal_keep_size to prevent unbounded growth.\n• Each database needs its own replication slot. AWS RDS default max_replication_slots is 5 — leave headroom.\n• Tables without a primary key require ALTER TABLE ... REPLICA IDENTITY FULL (slower).\n\nMongoDB:\n• Change Streams require a replica set. Standalone MongoDB instances are NOT supported. Atlas clusters have replica sets by default.\n• Never delete checkpoint files (/Volumes/floranow_catalog/bronze/_checkpoints/*). Losing the resume token may cause data skips or reprocessing.\n\nGeneral:\n• Run Hevo and Lakeflow/Spark in parallel for 1–2 weeks before cutting over. Compare row counts daily across ALL tables. A single mismatch blocks cutover.',
  },
  { id: 'ing-d-pitfalls', type: 'divider' },

  // ═══════════════════════════════════════════════════════════════
  // WHAT HAPPENS NEXT
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'ing-h-next',
    type: 'heading',
    level: 2,
    text: 'What Happens Next',
  },
  {
    id: 'ing-next-text',
    type: 'text',
    text: 'Ingestion\'s job is done once data is reliably sitting in floranow_catalog.bronze.* as raw Delta streaming tables. From here, the data flows into the transformation layer — but that\'s a different page entirely. The key point: regardless of which ingestion method is used (QBC, CDC, snapshots, or Spark Connector), the Bronze tables look the same to everything downstream.',
  },
  {
    id: 'ing-next-flow',
    type: 'flow',
    steps: [
      {
        emoji: '📥',
        title: 'Ingestion (this page)',
        subtitle: 'Source databases → Bronze Delta tables',
        color: '#3B82F6',
      },
      {
        emoji: '🔧',
        title: 'Transformation',
        subtitle: 'Bronze → Silver → Gold via dbt',
        color: '#8B5CF6',
      },
      {
        emoji: '📊',
        title: 'Consumption',
        subtitle: 'Dashboards, Genie, SQL Editor',
        color: '#22A652',
      },
    ],
  },
  {
    id: 'ing-next-callout',
    type: 'callout',
    variant: 'info',
    text: 'See the Warehousing page for Bronze/Silver/Gold structure. See the dbt page for how staging models transform Bronze into typed Silver tables. See the BI page for how dashboards query Gold tables. See the E2E Flow page for the complete hourly pipeline.',
  },
]

export default function Ingestion() {
  const { blocks, updateBlock, addBlock, removeBlock, saveStatus, forceSave } = usePageState('page:ingestion', DEFAULT_BLOCKS)

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="pl-10">
        <BlockEditor blocks={blocks} updateBlock={updateBlock} addBlock={addBlock} removeBlock={removeBlock} saveStatus={saveStatus} onSave={forceSave} />
      </div>
    </div>
  )
}
