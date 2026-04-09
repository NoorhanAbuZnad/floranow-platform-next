'use client'
import BlockEditor from '../components/BlockEditor'
import { usePageState } from '../lib/usePageState'
import type { Block } from '../lib/blocks'

const DEFAULT_BLOCKS: Block[] = [
  // ── Section 1: Why a warehouse ──────────────────────────────────
  {
    id: 'wh-h1',
    type: 'heading',
    level: 1,
    text: 'Why Does Floranow Need a SQL Warehouse?',
  },
  {
    id: 'wh-t1',
    type: 'text',
    text: 'When data lands in Databricks through Lakeflow Connect or Spark, it is stored as Delta Lake files on S3 in Frankfurt (eu-central-1). These are Parquet files with a transaction log — they sit in object storage. By themselves, they are inert. Nobody can query them. Nobody can build a dashboard from them. They are files in a bucket.\n\nA SQL Warehouse is the compute engine that reads those files and executes SQL against them. It is the brain. S3 is the memory. Without the warehouse, you have data but no answers.\n\nOn BigQuery, the warehouse is invisible — you pay per TB scanned and Google handles compute. On Databricks, the warehouse is explicit: you choose its type, size, and scaling behavior. This gives you more control and cost predictability, but it requires understanding what you are choosing.',
  },
  {
    id: 'wh-cards-why',
    type: 'card-grid',
    columns: 2,
    cards: [
      {
        emoji: '🔄',
        title: 'dbt Transformations',
        description: 'Executes 200 SQL models hourly — reads Bronze, writes Silver and Gold tables. The warehouse is the engine that runs every CREATE TABLE, every MERGE, every window function.',
        accent: '#EFF6FF',
      },
      {
        emoji: '📊',
        title: 'Dashboards & Genie AI',
        description: 'Every chart, filter, and number on a dashboard is a SQL query executed by the warehouse. Genie translates natural language into SQL — the warehouse runs that SQL.',
        accent: '#F0FDF4',
      },
      {
        emoji: '🔍',
        title: 'Ad-Hoc Analysis',
        description: 'Analysts explore data, debug pipelines, and answer business questions directly through the SQL editor. The warehouse processes every query.',
        accent: '#FDF2F8',
      },
      {
        emoji: '⚡',
        title: 'Single Most Impactful Lever',
        description: 'The warehouse is the single most impactful cost and performance lever in your Databricks deployment. Get it right and everything flows. Get it wrong and either your team waits or you overpay.',
        accent: '#FFF7ED',
      },
    ],
  },
  { id: 'wh-d1', type: 'divider' },

  // ── Section 2: Three types ──────────────────────────────────
  {
    id: 'wh-h2',
    type: 'heading',
    level: 1,
    text: 'Three Warehouse Types — Which One for Floranow',
  },
  {
    id: 'wh-t2',
    type: 'text',
    text: 'Databricks offers three SQL warehouse types. Each has different performance features, scaling behavior, and cost characteristics. The choice comes down to one question: do you want Databricks to manage the infrastructure, or do you want it in your own AWS account?',
  },
  {
    id: 'wh-cards-types',
    type: 'card-grid',
    columns: 3,
    cards: [
      {
        emoji: '🚀',
        title: 'Serverless (Recommended)',
        description: 'Startup: 2-6 seconds. Engine: Photon + Predictive I/O + Intelligent Workload Management (IWM). Billing: $0.70/DBU all-inclusive, per-second. Infrastructure: runs in Databricks\u2019 account — zero cluster management.\n\nIWM uses machine learning to predict query resource needs, dynamically provision capacity in real-time, and scale down aggressively when demand drops. This is what makes Serverless fundamentally different.',
        borderTop: '#2563EB',
        accent: '#EFF6FF',
      },
      {
        emoji: '⚙️',
        title: 'Pro',
        description: 'Startup: ~4 minutes. Engine: Photon + Predictive I/O (no IWM). Billing: $0.22/DBU platform fee + separate EC2 cost. Infrastructure: runs in YOUR AWS account.\n\nUse only when: you need custom VPC networking (peering to on-premises databases) or Serverless is unavailable in your region. Frankfurt supports Serverless — this does not apply to Floranow.',
        borderTop: '#7C3AED',
        accent: '#FAF5FF',
      },
      {
        emoji: '📦',
        title: 'Classic',
        description: 'Startup: ~4 minutes. Engine: Photon only (no Predictive I/O, no IWM). Most conservative scaling. Lowest DBU rate + separate EC2 cost.\n\nUse only for: always-on workloads where the warehouse never stops (e.g., continuous ingestion firing every minute). Floranow\u2019s ingestion uses Lakeflow Connect (separate compute) — Classic does not apply.',
        borderTop: '#6B7280',
        accent: '#F3F4F6',
      },
    ],
  },
  {
    id: 'wh-tbl-types',
    type: 'table',
    headers: ['Feature', 'Serverless', 'Pro', 'Classic'],
    rows: [
      ['Startup time', '2-6 seconds', '~4 minutes', '~4 minutes'],
      ['Photon engine', '✓', '✓', '✓'],
      ['Predictive I/O', '✓', '✓', '✗'],
      ['Intelligent Workload Mgmt', '✓', '✗', '✗'],
      ['Autoscaling speed', 'Near-instant (seconds)', 'Slow (minutes)', 'Slowest'],
      ['Infrastructure', 'Databricks account', 'Your AWS account', 'Your AWS account'],
      ['Billing model', '$0.70/DBU all-inclusive', '$0.22/DBU + EC2', 'Lowest DBU + EC2'],
      ['Best for', 'Bursty, variable workloads', 'Custom networking needs', 'Always-on workloads'],
    ],
  },
  {
    id: 'wh-c-type',
    type: 'callout',
    variant: 'tip',
    text: 'Decision: Serverless. Frankfurt (eu-central-1) supports it. The 2-second startup alone saves money compared to 4-minute Pro startup. IWM handles the variable workload pattern (hourly dbt bursts followed by quiet periods). Per-second billing means you pay only for actual query execution.',
  },
  { id: 'wh-d2', type: 'divider' },

  // ── Section 3: IWM ──────────────────────────────────
  {
    id: 'wh-h3',
    type: 'heading',
    level: 1,
    text: 'Intelligent Workload Management (IWM)',
  },
  {
    id: 'wh-t3',
    type: 'text',
    text: 'IWM is exclusive to Serverless warehouses and is the main reason to choose Serverless over Pro or Classic. It fundamentally changes how the warehouse responds to query load.',
  },
  {
    id: 'wh-compare-iwm',
    type: 'compare',
    leftTitle: 'Without IWM (Pro / Classic)',
    rightTitle: 'With IWM (Serverless)',
    items: [
      { old: 'Fixed rule: 1 cluster per 10 concurrent queries', new: 'ML model predicts per-query resource needs before execution starts' },
      { old: 'Scale-up trigger: estimated backlog > 2-6 min', new: 'Scale-up: near-instant from pre-provisioned pool (seconds)' },
      { old: 'Scale-down: waits 15 min of low activity', new: 'Scale-down: aggressive but intelligent — keeps warm capacity for recent peak patterns' },
      { old: 'Conservative query admission limits', new: 'Queries admitted closer to hardware limits, not software caps' },
      { old: 'Startup: ~4 minutes cold start', new: 'Startup: 2-6 seconds' },
    ],
  },
  {
    id: 'wh-c-iwm',
    type: 'callout',
    variant: 'info',
    text: 'Why IWM matters for Floranow: Your workload is bursty — 15 minutes of intense dbt activity followed by 45 minutes of relative quiet. IWM scales up instantly for the dbt burst, then scales down aggressively during the quiet period. Pro/Classic would either waste money staying warm during quiet periods or frustrate users with 4-minute cold starts.',
  },
  { id: 'wh-d3', type: 'divider' },

  // ── Section 4: Choosing the right size ──────────────────────────────────
  {
    id: 'wh-h4',
    type: 'heading',
    level: 1,
    text: 'Choosing the Right Size — The Honest Analysis',
  },
  {
    id: 'wh-t4',
    type: 'text',
    text: 'Size determines how much compute power each cluster has. A larger size means more workers, more RAM, and more parallelism for each individual query. It does NOT mean more concurrent queries — that is controlled by the number of clusters (scaling out).',
  },
  {
    id: 'wh-h4a',
    type: 'heading',
    level: 2,
    text: 'Warehouse Sizes — Exact Specifications',
  },
  {
    id: 'wh-tbl-sizes',
    type: 'table',
    headers: ['Size', 'Workers', 'DBU/hour', 'RAM (approx.)', 'Cost/hour ($0.70/DBU)'],
    rows: [
      ['2X-Small', '1 worker', '4 DBU/h', '~61 GB', '$2.80/h'],
      ['X-Small', '2 workers', '6 DBU/h', '~122 GB', '$4.20/h'],
      ['Small', '4 workers', '12 DBU/h', '~244 GB', '$8.40/h'],
      ['Medium', '8 workers', '24 DBU/h', '~488 GB', '$16.80/h'],
      ['Large', '16 workers', '40 DBU/h', '~976 GB', '$28.00/h'],
    ],
  },
  {
    id: 'wh-t4b',
    type: 'text',
    text: 'Workers are i3.2xlarge instances: 8 vCPUs, 61 GB RAM, 1.9 TB NVMe SSD each. All Serverless warehouses include the Photon vectorized engine.',
  },
  { id: 'wh-d4a', type: 'divider' },

  // ── Section 4b: Floranow workload analysis ──────────────────────────────────
  {
    id: 'wh-h4b',
    type: 'heading',
    level: 2,
    text: 'Floranow\u2019s Actual Workload',
  },
  {
    id: 'wh-tbl-workload',
    type: 'table',
    headers: ['Workload', 'Pattern', 'Query complexity', 'Concurrency'],
    rows: [
      ['dbt (200 models)', 'Every hour, ~15 min burst', 'Mix: simple staging (renames, casts) + complex marts (window functions, multi-table joins)', '4 concurrent (threads=4)'],
      ['Dashboards (11)', 'Viewers load throughout business hours', 'Simple-to-moderate aggregations, GROUP BY, filters', 'See BI page for caching strategy'],
      ['Genie AI', '200-350 queries/day, sporadic', 'Auto-generated SQL, typically moderate', '1-2 concurrent'],
      ['Ad-hoc analysts', '20-50 queries/day, business hours', 'Variable — from simple SELECTs to complex joins', '1-3 concurrent'],
    ],
  },
  {
    id: 'wh-t4c',
    type: 'text',
    text: 'Peak realistic concurrency: ~8-12 concurrent queries during the dbt window when analysts are also active. IWM on Serverless handles this without manual tuning.',
  },
  { id: 'wh-d4b', type: 'divider' },

  // ── Section 4c: X-Small vs Small ──────────────────────────────────
  {
    id: 'wh-h4c',
    type: 'heading',
    level: 2,
    text: 'X-Small vs Small — Why Starting Larger Is Safer',
  },
  {
    id: 'wh-t4d',
    type: 'text',
    text: 'Databricks documentation says: "Start with a single larger warehouse and let serverless features manage concurrency. It is usually more efficient to size down if necessary than to start small and scale up."\n\nDerek Witt, Databricks Solutions Architect for Startups (Feb 2026), gives a concrete example of why:',
  },
  {
    id: 'wh-compare-size',
    type: 'compare',
    leftTitle: 'X-Small (6 DBU/h, 2 workers)',
    rightTitle: 'Small (12 DBU/h, 4 workers)',
    items: [
      { old: 'RAM: ~122 GB — 100 GB data fits, but only 22 GB headroom for intermediate results', new: 'RAM: ~244 GB — 100 GB data fits comfortably, 144 GB headroom for joins and aggregations' },
      { old: 'Complex queries with multi-table joins + window functions: likely spill to disk (NVMe SSD)', new: 'Same queries: should stay in memory, no spill expected' },
      { old: 'Disk spill penalty: queries run 2-3x slower', new: 'No spill: queries run at full Photon speed' },
      { old: 'Example: 12-min runtime with spill → 6 × $0.70 × 12/60 = $0.84', new: 'Example: 5-min runtime, no spill → 12 × $0.70 × 5/60 = $0.70' },
      { old: 'Cheaper per hour, but slower = same or higher total cost', new: 'More expensive per hour, but faster = same or lower total cost' },
    ],
  },
  {
    id: 'wh-c-size',
    type: 'callout',
    variant: 'warn',
    text: 'The counter-intuitive lesson: a bigger warehouse can be cheaper than a smaller one. When queries spill to disk, runtime increases by more than the cost-per-hour decreases. You lose money trying to save money. This is why Databricks recommends starting larger and sizing down after monitoring.',
  },
  { id: 'wh-d4c', type: 'divider' },

  // ── Section 4d: Recommendation ──────────────────────────────────
  {
    id: 'wh-h4d',
    type: 'heading',
    level: 2,
    text: 'Recommendation: Start with Small, Right-Size After Two Weeks',
  },
  {
    id: 'wh-tbl-xsvss',
    type: 'table',
    headers: ['Factor', 'X-Small', 'Small (recommended start)'],
    rows: [
      ['Workers', '2', '4'],
      ['RAM', '~122 GB', '~244 GB'],
      ['DBU/h', '6', '12'],
      ['100 GB data', 'Fits, but tight. Complex queries likely spill.', 'Fits comfortably. Room for intermediate results.'],
      ['200 dbt models', 'Possible, but complex models may be 2-3x slower due to spill', 'Should handle full run without spill'],
      ['dbt run time (estimated)', '20-30 min (spill penalty likely)', '12-18 min (comparable to BigQuery\u2019s 15 min)'],
      ['dbt cost per run', 'If spills: 6 × $0.70 × 30/60 = $2.10', '12 × $0.70 × 15/60 = $2.10'],
    ],
  },
  {
    id: 'wh-c-rec',
    type: 'callout',
    variant: 'tip',
    text: 'Notice: if X-Small spills and runs for 30 minutes, it costs the same $2.10 as Small running clean for 15 minutes. You get the same cost but double the wait time. Small is the safer bet. After 1-2 weeks of monitoring, if no queries show disk spill and dbt finishes under 15 minutes, try X-Small for a day and compare.',
  },
  { id: 'wh-d4d', type: 'divider' },

  // ── Section 5: How many warehouses ──────────────────────────────────
  {
    id: 'wh-h5',
    type: 'heading',
    level: 1,
    text: 'How Many Warehouses?',
  },
  {
    id: 'wh-t5',
    type: 'text',
    text: 'Databricks best practice is to separate warehouses by workload type. For larger teams, this means one for BI, one for dbt, and one for always-on ingestion. But for a 2-person team at Floranow\u2019s current scale, starting with one is the right call.',
  },
  {
    id: 'wh-compare-wh',
    type: 'compare',
    leftTitle: 'Start: Single Warehouse',
    rightTitle: 'Later: Split When Signals Say So',
    items: [
      { old: 'One Small Serverless handles dbt + dashboards + ad-hoc + Genie', new: 'dbt Warehouse: Small, auto-stop 1 min, 1-2 clusters' },
      { old: 'IWM dynamically manages the mixed workload', new: 'BI Warehouse: X-Small or 2X-Small, 3-5 clusters for concurrency' },
      { old: 'Simpler: one cost line, one set of permissions, one thing to monitor', new: 'Split when: dashboard latency increases during dbt runs, or peak queued queries consistently > 0' },
      { old: 'Workloads naturally don\u2019t heavily overlap (dbt runs 15 min/hour)', new: 'Split can also save money: 2× 2X-Small (8 DBU/h) < 1× Small (12 DBU/h) for BI' },
    ],
  },
  { id: 'wh-d5', type: 'divider' },

  // ── Section 6: Scale Up vs Scale Out ──────────────────────────────────
  {
    id: 'wh-h6',
    type: 'heading',
    level: 1,
    text: 'What If It Doesn\u2019t Fit? — The Two Signals Framework',
  },
  {
    id: 'wh-t6',
    type: 'text',
    text: 'There are only two signals that tell you what to do, and each has a clear, distinct action. This framework comes from Derek Witt, Databricks Solutions Architect for Startups (Feb 2026). The monitoring tab on the SQL warehouse page shows everything you need — no third-party observability tool required.',
  },
  {
    id: 'wh-cards-signals',
    type: 'card-grid',
    columns: 2,
    cards: [
      {
        emoji: '📊',
        title: 'Signal 1: Peak Queued Queries > 0 → Scale OUT',
        description: 'Where: SQL Warehouse → Monitoring tab → "Peak Queued Queries" chart.\n\nMeaning: queries are waiting in line. Each query is fast on its own, but there are too many queries arriving at once.\n\nFix: Increase the maximum number of clusters (e.g., 2 → 4). This runs more queries simultaneously on separate clusters. Don\u2019t increase cluster SIZE — that won\u2019t help. You need more engines, not bigger engines.\n\nWhen at Floranow: morning dashboard burst or dbt running while analysts also query.',
        borderTop: '#2563EB',
        accent: '#EFF6FF',
      },
      {
        emoji: '💾',
        title: 'Signal 2: Bytes Spilled to Disk > 0 → Scale UP',
        description: 'Where: Query History → click slow query → Query Profile → look for "Bytes spilled to disk."\n\nMeaning: the cluster ran out of RAM and wrote intermediate results to NVMe SSD. Disk is 10-100x slower than RAM.\n\nFix: Increase cluster size (e.g., X-Small → Small). This gives each cluster more workers, more RAM, more parallelism. Don\u2019t add more clusters — that won\u2019t help.\n\nWhen at Floranow: complex dbt mart models doing multi-table joins with window functions.',
        borderTop: '#DC2626',
        accent: '#FEF2F2',
      },
    ],
  },
  {
    id: 'wh-c-signal',
    type: 'callout',
    variant: 'info',
    text: 'Scale OUT = more clusters of the same size (concurrency problem).\nScale UP = fewer clusters of a bigger size (query weight problem).\nNever do both at once — diagnose first, then pull the right lever.',
  },
  { id: 'wh-d6a', type: 'divider' },

  {
    id: 'wh-h6a',
    type: 'heading',
    level: 2,
    text: 'Full Monitoring Checklist',
  },
  {
    id: 'wh-tbl-monitor',
    type: 'table',
    headers: ['What to check', 'Where', 'What it tells you', 'Action'],
    rows: [
      ['Peak Queued Queries', 'Monitoring tab', 'Concurrency bottleneck', 'Add more clusters (scale out)'],
      ['Running Clusters', 'Monitoring tab', 'Whether autoscaling is hitting your max', 'Increase max cluster cap'],
      ['Bytes Spilled to Disk', 'Query Profile (per query)', 'Memory bottleneck', 'Increase cluster size (scale up)'],
      ['Query Duration (p50, p95)', 'Query History', 'Overall performance trend', 'Investigate slow outliers'],
      ['Completed Query Count', 'Monitoring tab', 'Traffic patterns by hour', 'Identify peak windows'],
      ['Auto-stop frequency', 'Monitoring tab / system tables', 'Idle waste', 'Lower auto-stop timeout'],
    ],
  },
  { id: 'wh-d6', type: 'divider' },

  // ── Section 7: Auto-Stop ──────────────────────────────────
  {
    id: 'wh-h7',
    type: 'heading',
    level: 1,
    text: 'Auto-Stop — The Biggest Cost Lever',
  },
  {
    id: 'wh-t7',
    type: 'text',
    text: 'Auto-stop controls how long the warehouse stays running after the last query finishes. This is the single most impactful cost setting. With Serverless startup at 2-6 seconds, there is almost no penalty for stopping and restarting, but there is a real cost to idle time.',
  },
  {
    id: 'wh-tbl-autostop',
    type: 'table',
    headers: ['Setting', 'Value', 'Notes'],
    rows: [
      ['UI minimum (Serverless)', '5 minutes', 'The lowest the Databricks UI allows'],
      ['UI minimum (Pro/Classic)', '10 minutes', 'Higher minimum for non-Serverless'],
      ['API override (recommended)', '1 minute', 'Set via Databricks Python SDK — bypasses UI minimum'],
      ['Idle waste example', '$1.40 per 10-min idle (Small)', '12 DBU × $0.70 × 10/60. Happens after every dbt run, every ad-hoc session.'],
    ],
  },
  {
    id: 'wh-code-autostop',
    type: 'code',
    code: `-- Set auto-stop to 1 minute via Python SDK
from databricks.sdk import WorkspaceClient

w = WorkspaceClient()
w.warehouses.edit(
    warehouse_id="your_warehouse_id",
    auto_stop_mins=1
)

-- Trade-off: more frequent stops may clear local disk cache.
-- For 100 GB data with Photon, re-scan is fast (seconds).
-- Recommended: 1 min at night (dbt-only, 45-min gap), 5 min during business hours.`,
  },
  {
    id: 'wh-c-autostop',
    type: 'callout',
    variant: 'tip',
    text: 'Switching from 10-minute to 1-minute auto-stop can save $100-200/month in idle compute. Use the Databricks API to schedule different auto-stop values by time of day if needed.',
  },
  { id: 'wh-d7', type: 'divider' },

  // ── Section 8: Warehouse Configuration ──────────────────────────────────
  {
    id: 'wh-h8',
    type: 'heading',
    level: 1,
    text: 'Recommended Warehouse Configuration',
  },
  {
    id: 'wh-tbl-config',
    type: 'table',
    headers: ['Setting', 'Value', 'Why'],
    rows: [
      ['Type', 'Serverless', '2-6s startup, IWM, Photon included, per-second billing, zero infrastructure management.'],
      ['Size', 'Small (start)', '4 workers, 244 GB RAM. Handles 200 dbt models + 100 GB data without disk spill. Right-size to X-Small after 2 weeks if monitoring confirms.'],
      ['Max clusters', '2', 'Safety net for concurrent peaks. Increase to 3-4 only if Peak Queued Queries consistently > 0.'],
      ['Auto-stop', '5 min (UI) → 1 min (API)', 'Minimize idle compute. With 2-6s startup, restart penalty is negligible.'],
      ['Photon', 'Enabled (default)', 'Vectorized C++ engine. 2-8x faster for aggregations, joins, MERGE. Enabled on all Serverless.'],
      ['Result Cache', 'Enabled (default)', 'Repeat queries return cached results when underlying data has not changed.'],
      ['Channel', 'Current', 'Stable release. Switch to Preview only when testing new features.'],
    ],
  },
  { id: 'wh-d8', type: 'divider' },

  // ── Section 9: Cost Analysis ──────────────────────────────────
  {
    id: 'wh-h9',
    type: 'heading',
    level: 1,
    text: 'Cost Analysis — Three Scenarios',
  },
  {
    id: 'wh-t9',
    type: 'text',
    text: 'All calculations use Serverless SQL list price: $0.70/DBU (AWS, all-inclusive). Actual negotiated pricing may differ. Workloads that overlap in time share the same running cluster — you do not pay double when two queries run simultaneously on one cluster.',
  },
  {
    id: 'wh-cards-scenarios',
    type: 'card-grid',
    columns: 3,
    cards: [
      {
        emoji: '🅰️',
        title: 'Scenario A: Single Small (Start Here)',
        description: 'dbt: 200 models × 24 runs/day, ~15 min each → ~6h active compute/day\nDashboards + ad-hoc + Genie: ~3h/day (overlaps with dbt)\nTotal active: ~9h/day\n\n12 DBU/h × 9h × $0.70 = $75.60/day\n~$2,268/month\n\nSafest. No spill risk. Comparable dbt runtime to BigQuery.',
        borderTop: '#2563EB',
        accent: '#EFF6FF',
      },
      {
        emoji: '🅱️',
        title: 'Scenario B: Single X-Small (After Right-Sizing)',
        description: 'Same workloads at 6 DBU/h.\nIf no spill: ~9h active, $37.80/day → ~$1,134/month\nIf spill: dbt takes 25-30 min → ~12h active, $52.50/day → ~$1,575/month\n\n$693-1,134 cheaper than Small per month.\nBut if spill occurs, dbt runs 10-15 min slower each hour.\n\nOnly move here after 2 weeks of monitoring confirm no disk spill.',
        borderTop: '#059669',
        accent: '#ECFDF5',
      },
      {
        emoji: '🅲',
        title: 'Scenario C: Two Warehouses (If Split Needed)',
        description: 'dbt: Small (12 DBU/h), 6h/day → 72 DBU → $50.40/day\nBI: 2X-Small (4 DBU/h), max 3 clusters, 4h/day → 12-16 DBU → $8-11/day\nTotal: ~$58-62/day → ~$1,764-1,860/month\n\nCheaper than single Small because BI warehouse is tiny and stops frequently.\nSplit only when monitoring shows contention.',
        borderTop: '#D97706',
        accent: '#FFFBEB',
      },
    ],
  },
  {
    id: 'wh-tbl-cost',
    type: 'table',
    headers: ['Component', 'Scenario A (Small)', 'Scenario B (X-Small)', 'Scenario C (Split)'],
    rows: [
      ['SQL Warehouse', '~$2,268/mo', '~$1,134-1,575/mo', '~$1,764-1,860/mo'],
      ['Lakeflow Connect', '~$50-100/mo', '~$50-100/mo', '~$50-100/mo'],
      ['S3 Storage (Delta)', '~$30-50/mo', '~$30-50/mo', '~$30-50/mo'],
      ['Total', '~$2,350-2,420/mo', '~$1,215-1,725/mo', '~$1,845-2,010/mo'],
    ],
  },
  {
    id: 'wh-c-cost',
    type: 'callout',
    variant: 'info',
    text: 'Important caveats:\n1. These are list prices. Databricks typically offers negotiated pricing for committed use.\n2. The Lakeflow Connect Free Tier (100 free DBUs/day) covers most ingestion compute.\n3. dbt can run on Jobs Compute ($0.40/DBU) instead of SQL Warehouse — this is covered on the dbt page.\n4. Real costs depend on actual query runtimes, measurable only after deployment.',
  },
  { id: 'wh-d9', type: 'divider' },

  // ── Section 10: Right-sizing journey ──────────────────────────────────
  {
    id: 'wh-h10',
    type: 'heading',
    level: 1,
    text: 'The Right-Sizing Journey — Step by Step',
  },
  {
    id: 'wh-flow-journey',
    type: 'flow',
    steps: [
      {
        emoji: '1️⃣',
        title: 'Week 1-2: Start with Small Serverless',
        subtitle: 'Auto-stop 5 min. Run dbt hourly. Let analysts query normally. Collect baseline data.',
        color: '#2563EB',
      },
      {
        emoji: '2️⃣',
        title: 'End of Week 2: Read the Signals',
        subtitle: 'Monitoring tab: Peak Queued Queries ever > 0? Query Profile: any disk spill? system.billing.usage: total DBU consumption?',
        color: '#7C3AED',
      },
      {
        emoji: '3️⃣',
        title: 'Week 3: First Adjustment',
        subtitle: 'No spill + no queue → try X-Small for one day, compare. Spill found → stay Small. Queue found → increase max clusters 2 → 3.',
        color: '#059669',
      },
      {
        emoji: '4️⃣',
        title: 'Week 4: Optimize Auto-Stop',
        subtitle: 'Switch to 1-min auto-stop via API. Monitor DBU impact (expect 10-20% drop). Set 5 min during business hours if startup delays bother users.',
        color: '#D97706',
      },
      {
        emoji: '5️⃣',
        title: 'Month 2+: Consider Splitting',
        subtitle: 'If dbt and dashboards compete → create dedicated BI warehouse (2X-Small). If dbt is the bottleneck → consider Jobs Compute (cheaper DBU rate).',
        color: '#DC2626',
      },
    ],
  },
  { id: 'wh-d10', type: 'divider' },

  // ── Section 11: Medallion Architecture ──────────────────────────────────
  {
    id: 'wh-h11',
    type: 'heading',
    level: 1,
    text: 'Medallion Architecture',
  },
  {
    id: 'wh-cards-medallion',
    type: 'card-grid',
    columns: 3,
    cards: [
      {
        emoji: '🥉',
        title: 'Bronze — Raw Landing Zone',
        description: 'Exact source copy via Lakeflow Connect (streaming tables). No business logic applied. MongoDB documents stored as VARIANT preserving full nested structure.\n\nTables: erp_orders, erp_products, erp_customers, mp_transactions, vendor_shipments, mongodb_app_data\n\nOwner: Ingestion pipelines. See Ingestion page.',
        borderTop: '#CD7F32',
        accent: '#FDF4E8',
      },
      {
        emoji: '🥈',
        title: 'Silver — Cleaned & Conformed',
        description: 'Typed, deduplicated, standardized column names. VARIANT parsed with variant_get() / semi-structured syntax (raw_json:key::TYPE). Built by dbt staging models (stg_ prefix).\n\nTables: stg_orders, stg_products, stg_customers, stg_transactions, stg_app_data\n\nOwner: dbt staging models. See dbt page.',
        borderTop: '#8C9EAF',
        accent: '#F1F5F9',
      },
      {
        emoji: '🥇',
        title: 'Gold — Business-Ready',
        description: 'Aggregated KPIs, pre-computed metrics, star-schema dimensions. Built by dbt mart models. Served to dashboards and Genie AI via SQL Warehouse.\n\nTables: mart_revenue, mart_sales, mart_operations, dim_customers, dim_products\n\nOwner: dbt mart models. See BI page.',
        borderTop: '#D4A017',
        accent: '#FFFBEB',
      },
    ],
  },
  { id: 'wh-d11', type: 'divider' },

  // ── Section 12: Unity Catalog ──────────────────────────────────
  {
    id: 'wh-h12',
    type: 'heading',
    level: 1,
    text: 'Unity Catalog Setup',
  },
  {
    id: 'wh-t12',
    type: 'text',
    text: 'Unity Catalog uses a three-level namespace: catalog.schema.table. Floranow uses one catalog (floranow_catalog) with three schemas mirroring the Medallion layers. Permissions are granted per schema — analysts see Gold, ingestion writes Bronze, dbt reads Bronze and writes Silver + Gold.',
  },
  {
    id: 'wh-code-uc',
    type: 'code',
    code: `-- Step 1: Create the catalog
CREATE CATALOG IF NOT EXISTS floranow_catalog
  COMMENT 'Floranow production data catalog — Databricks Lakehouse';

-- Step 2: Create schemas for each medallion layer
CREATE SCHEMA IF NOT EXISTS floranow_catalog.bronze
  COMMENT 'Raw landing zone — exact source copies, no transformations';

CREATE SCHEMA IF NOT EXISTS floranow_catalog.silver
  COMMENT 'Cleaned & conformed — typed, deduplicated, standardized';

CREATE SCHEMA IF NOT EXISTS floranow_catalog.gold
  COMMENT 'Business-ready — KPIs, metrics, dimensions for dashboards and Genie';

-- Step 3: Grant permissions
GRANT USE CATALOG ON CATALOG floranow_catalog TO \`floranow-analysts\`;
GRANT USE SCHEMA, SELECT ON SCHEMA floranow_catalog.gold TO \`floranow-viewers\`;
GRANT USE SCHEMA, SELECT ON SCHEMA floranow_catalog.silver TO \`floranow-analysts\`;
GRANT USE SCHEMA, SELECT, MODIFY ON SCHEMA floranow_catalog.bronze TO \`floranow-ingestion-sp\`;

-- Service principal for dbt automation
GRANT USE CATALOG ON CATALOG floranow_catalog TO \`floranow-dbt-sp\`;
GRANT USE SCHEMA, SELECT ON SCHEMA floranow_catalog.bronze TO \`floranow-dbt-sp\`;
GRANT USE SCHEMA, SELECT, CREATE TABLE ON SCHEMA floranow_catalog.silver TO \`floranow-dbt-sp\`;
GRANT USE SCHEMA, SELECT, CREATE TABLE ON SCHEMA floranow_catalog.gold TO \`floranow-dbt-sp\`;`,
  },
  { id: 'wh-d12a', type: 'divider' },

  {
    id: 'wh-h12a',
    type: 'heading',
    level: 2,
    text: 'Full Namespace',
  },
  {
    id: 'wh-code-ns',
    type: 'code',
    code: `floranow_catalog
├── bronze/                              -- Raw landing (streaming tables)
│   ├── erp_orders                       -- From Lakeflow Connect (ERP PostgreSQL)
│   ├── erp_products
│   ├── erp_customers
│   ├── mp_transactions                  -- From Lakeflow Connect (MP PostgreSQL)
│   ├── vendor_shipments                 -- From Lakeflow Connect (Vendor PostgreSQL)
│   └── mongodb_app_data (VARIANT)       -- From Spark MongoDB Connector
│
├── silver/                              -- Cleaned & typed (dbt staging views)
│   ├── stg_orders                       -- stg_erp__orders.sql
│   ├── stg_products                     -- stg_erp__products.sql
│   ├── stg_customers                    -- stg_erp__customers.sql
│   ├── stg_transactions                 -- stg_mp__transactions.sql
│   └── stg_app_data                     -- stg_mongodb__app_data.sql
│
└── gold/                                -- Business-ready (dbt mart tables)
    ├── mart_revenue                     -- Revenue by region, product, period
    ├── mart_sales                       -- Sales performance, pipeline, targets
    ├── mart_operations                  -- Fulfillment, SLAs, backlog
    ├── dim_customers                    -- Customer dimension (SCD Type 2)
    └── dim_products                     -- Product dimension`,
  },
  { id: 'wh-d12', type: 'divider' },

  // ── Section 13: Delta Lake Features ──────────────────────────────────
  {
    id: 'wh-h13',
    type: 'heading',
    level: 1,
    text: 'Delta Lake Features',
  },
  {
    id: 'wh-cards-delta',
    type: 'card-grid',
    columns: 2,
    cards: [
      {
        emoji: '🔒',
        title: 'ACID Transactions',
        description: 'Every write is atomic. Concurrent reads and writes never corrupt data. Delta log tracks all changes with serializable isolation. Essential for hourly ingestion + dbt running on the same tables simultaneously.',
        accent: '#EFF6FF',
      },
      {
        emoji: '⏪',
        title: 'Time Travel',
        description: 'Query any previous version: SELECT * FROM table VERSION AS OF 42. DESCRIBE HISTORY shows all operations. Rollback mistakes with RESTORE TABLE. Default 7-day retention (168 hours).',
        accent: '#F0FDF4',
      },
      {
        emoji: '🧩',
        title: 'Liquid Clustering',
        description: 'Self-tuning physical layout that replaces partitioning + ZORDER. Use CLUSTER BY (order_date, region) for common filter patterns. CLUSTER BY AUTO lets Databricks choose keys automatically on Unity Catalog managed tables.',
        accent: '#FDF2F8',
      },
      {
        emoji: '🛡️',
        title: 'Schema Enforcement & Evolution',
        description: 'Prevents bad data from landing. New columns require explicit ALTER TABLE ADD COLUMNS or the mergeSchema option. Lakeflow Connect handles schema evolution automatically at the Bronze layer.',
        accent: '#FFF7ED',
      },
      {
        emoji: '⚡',
        title: 'Predictive Optimization',
        description: 'Databricks automatically runs OPTIMIZE, VACUUM, and ANALYZE on Unity Catalog managed tables. Eliminates manual maintenance — no cron jobs needed for table health.',
        accent: '#ECFDF5',
      },
      {
        emoji: '📐',
        title: 'Liquid Clustering — Setup Example',
        description: 'CREATE TABLE mart_revenue (...) CLUSTER BY (revenue_date, region);\n\nFor existing tables: ALTER TABLE mart_sales CLUSTER BY (sale_date, segment);\n\nAuto mode: CREATE TABLE mart_operations CLUSTER BY AUTO;',
        accent: '#FAF5FF',
      },
    ],
  },
  { id: 'wh-d13', type: 'divider' },

  // ── Section 14: Decision Matrix Summary ──────────────────────────────────
  {
    id: 'wh-h14',
    type: 'heading',
    level: 1,
    text: 'Decision Summary',
  },
  {
    id: 'wh-tbl-summary',
    type: 'table',
    headers: ['Question', 'Answer', 'Confidence'],
    rows: [
      ['Why warehouse?', 'Compute engine that turns stored Delta files into queryable tables. Without it, data exists but cannot be accessed.', 'Certain'],
      ['Which type?', 'Serverless. Frankfurt supports it. IWM handles bursty workloads. 2-6s startup. Per-second billing.', 'High'],
      ['Which size?', 'Start with Small (12 DBU/h, 4 workers). Right-size to X-Small after 2 weeks if monitoring confirms no disk spill.', 'Medium'],
      ['How many?', 'Start with one. Split when monitoring shows contention between dbt and BI workloads.', 'High'],
      ['Max clusters?', 'Start with 2. Increase to 3-4 if Peak Queued Queries > 0 during peaks.', 'Medium'],
      ['Auto-stop?', '5 min initially, then 1 min via API after validating startup impact.', 'High'],
      ['Monthly cost?', '$1,200-2,400 for SQL Warehouse (list pricing). Lower with committed-use discount.', 'Low — requires actual measurement'],
    ],
  },
  {
    id: 'wh-c-xref',
    type: 'callout',
    variant: 'info',
    text: 'Cross-references: Bronze tables are created by Lakeflow Connect (see Ingestion page). Silver and Gold tables are created by dbt (see dbt page). Dashboards, Genie, and caching strategy are covered on the BI page. Monitor costs via system.billing.usage (see E2E Flow page).',
  },
]

export default function Warehousing() {
  const { blocks, updateBlock, addBlock, removeBlock } = usePageState('page:warehousing', DEFAULT_BLOCKS)

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="pl-10">
        <BlockEditor blocks={blocks} updateBlock={updateBlock} addBlock={addBlock} removeBlock={removeBlock} />
      </div>
    </div>
  )
}
