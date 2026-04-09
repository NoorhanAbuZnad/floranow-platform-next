'use client'
import BlockEditor from '../components/BlockEditor'
import { usePageState } from '../lib/usePageState'
import type { Block } from '../lib/blocks'

const DEFAULT_BLOCKS: Block[] = [
  // ── 1. What Is Databricks AI/BI ──────────────────────────────
  {
    id: 'bi-h1',
    type: 'heading',
    level: 1,
    text: 'What Is Databricks AI/BI',
  },
  {
    id: 'bi-t1',
    type: 'text',
    text: 'Databricks AI/BI is the native business intelligence layer built directly into the Databricks Lakehouse Platform. It consists of three integrated components that replace standalone BI tools:\n\n• AI/BI Dashboards — drag-and-drop visualization builder with AI-assisted chart creation, running live SQL against the SQL Warehouse.\n• Genie Spaces — natural language interface where business users ask questions in plain English and receive SQL-generated answers with visualizations.\n• SQL Alerts — threshold-based notifications on any query result, delivered via email or Slack webhook.\n\nAll three components share the same SQL Warehouse, the same Unity Catalog governance layer, and the same Gold tables built by dbt. There is no data movement, no CSV export, no separate tool to manage — everything lives inside the Databricks workspace.',
  },
  { id: 'bi-d1', type: 'divider' },

  // ── 2. What Changes from Looker Studio ───────────────────────
  {
    id: 'bi-h2',
    type: 'heading',
    level: 1,
    text: 'What Changes from Looker Studio',
  },
  {
    id: 'bi-cmp1',
    type: 'compare',
    leftTitle: 'Current (Looker Studio)',
    rightTitle: 'Future (Databricks AI/BI)',
    items: [
      { old: 'Dashboards built on scheduled CSV extracts — data is 12+ hours stale', new: 'Live SQL queries against Gold tables — data freshness matches dbt schedule (hourly)' },
      { old: 'Separate BI tool outside the data platform — no lineage, no governance', new: 'Built into Databricks — same workspace as notebooks, dbt, Unity Catalog' },
      { old: 'No AI assistance — manual chart building, manual SQL writing', new: 'Genie: natural language querying • Genie Code: AI dashboard builder from screenshots' },
      { old: 'No row-level security — all users see all data or nothing', new: 'Unity Catalog row filters + column masks — per-user, per-region access control' },
      { old: 'Free tier limitations — limited sharing, no embedding, no PDF export', new: 'Enterprise BI: embedding, PDF export, email/Slack subscriptions, SQL alerts' },
      { old: 'Manual chart building — every visualization configured by hand', new: 'AI-assisted charts: describe what you want, the system generates the configuration' },
    ],
  },
  { id: 'bi-d2', type: 'divider' },

  // ── 3. Architecture ──────────────────────────────────────────
  {
    id: 'bi-h3',
    type: 'heading',
    level: 1,
    text: 'Architecture',
  },
  {
    id: 'bi-flow1',
    type: 'flow',
    steps: [
      { emoji: '🥇', title: 'Gold Tables', subtitle: 'mart_revenue, mart_sales, mart_operations, dim_customers, dim_products', color: '#FDE68A' },
      { emoji: '🗄️', title: 'SQL Warehouse', subtitle: 'Small Serverless · Photon engine · Result cache enabled', color: '#C4B5FD' },
      { emoji: '🔒', title: 'Unity Catalog', subtitle: 'Row filters · Column masks · GRANT permissions', color: '#7DD3FC' },
      { emoji: '📊', title: 'AI/BI Dashboards', subtitle: 'Live + scheduled refresh · Parameterized queries', color: '#86EFAC' },
      { emoji: '🤖', title: 'Genie Spaces + SQL Editor', subtitle: 'Natural language queries · Ad-hoc analysis', color: '#FCA5A5' },
      { emoji: '👥', title: '60–70 Viewers + 2 Analysts', subtitle: 'View · Explore · Subscribe · Export', color: '#F9A8D4' },
    ],
  },
  { id: 'bi-d3', type: 'divider' },

  // ── 4. Viewer Access Model ───────────────────────────────────
  {
    id: 'bi-h4',
    type: 'heading',
    level: 1,
    text: 'Viewer Access Model',
  },
  {
    id: 'bi-t4',
    type: 'text',
    text: 'Databricks offers two licensing tiers for dashboard consumers. The right choice depends on whether viewers need only dashboard access or full workspace access (notebooks, SQL Editor, Genie).',
  },
  {
    id: 'bi-tbl4',
    type: 'table',
    headers: ['Capability', 'Account-Level Viewer (Free)', 'Full Workspace User (Licensed)'],
    rows: [
      ['View published dashboards', '✅', '✅'],
      ['Interact with filters & parameters', '✅', '✅'],
      ['Receive email subscriptions', '✅', '✅'],
      ['Cross-filter & drill-through', '✅', '✅'],
      ['View embedded dashboards', '✅', '✅'],
      ['Use SQL Editor', '❌', '✅'],
      ['Use Genie Spaces', '❌', '✅'],
      ['Create / edit dashboards', '❌', '✅'],
      ['Access notebooks & jobs', '❌', '✅'],
      ['Cost', 'Free (no DBU charge)', 'Included in workspace license'],
    ],
  },
  {
    id: 'bi-c4',
    type: 'callout',
    variant: 'tip',
    text: 'Recommendation for Floranow: Start with account-level viewers for the 60-70 dashboard consumers (free). Only the 2 analysts need full workspace licenses. This means zero additional licensing cost for dashboard viewers.',
  },
  { id: 'bi-d4', type: 'divider' },

  // ── 5. Dashboard Caching & Data Freshness ────────────────────
  {
    id: 'bi-h5',
    type: 'heading',
    level: 1,
    text: 'Dashboard Caching & Data Freshness',
  },
  {
    id: 'bi-t5a',
    type: 'text',
    text: 'This is the most important section for understanding why 60-70 viewers add minimal warehouse load. Databricks uses two layers of caching that work together:',
  },
  {
    id: 'bi-cards5',
    type: 'card-grid',
    columns: 2,
    cards: [
      {
        emoji: '1️⃣',
        title: 'Layer 1: Query Result Cache',
        description: 'Automatic and transparent. When a dashboard query runs, the SQL Warehouse caches the result. If the same query runs again AND the underlying Delta table version has NOT changed, results return from cache in <100ms — zero compute consumed.\n\nCache invalidates automatically when dbt writes new data (new Delta version). Zero stale data risk: if data changed, the query re-executes against the warehouse.',
        accent: '#DBEAFE',
      },
      {
        emoji: '2️⃣',
        title: 'Layer 2: Dashboard Cache',
        description: 'Dashboard-level cache that stores the rendered results (charts + data) for all visualizations. Persists for up to 24 hours (best-effort). When a viewer opens a dashboard, they see the cached version instantly — no warehouse query at all.\n\nThis is separate from query result cache: even if the query cache is cold, the dashboard cache can serve a recent snapshot while the query re-runs in the background.',
        accent: '#EDE9FE',
      },
    ],
  },
  {
    id: 'bi-h5b',
    type: 'heading',
    level: 2,
    text: 'How Scheduled Refresh Works',
  },
  {
    id: 'bi-t5b',
    type: 'text',
    text: 'Scheduled refresh is the key mechanism that decouples viewer load from warehouse load. Here is the exact sequence:\n\n1. dbt run completes (hourly) → Gold tables are updated with new Delta version → query result cache invalidates automatically.\n2. Scheduled refresh fires (configured to run after dbt completes, e.g., 15 minutes after the hour) → the dashboard executes all its queries once against the SQL Warehouse → results are stored in both query result cache and dashboard cache.\n3. Viewer opens the dashboard → sees the pre-populated cache instantly → no warehouse query triggered.\n\nThe critical insight: the warehouse does the work once during scheduled refresh, not once per viewer. Whether 1 viewer or 70 viewers open the dashboard in the next hour, they all read from the same cache. The warehouse cost is one execution per dashboard per refresh cycle.',
  },
  {
    id: 'bi-h5c',
    type: 'heading',
    level: 2,
    text: 'Floranow: What Actually Happens Each Hour',
  },
  {
    id: 'bi-flow5',
    type: 'flow',
    steps: [
      { emoji: '⚙️', title: 'dbt run completes', subtitle: 'Gold tables updated · Delta version incremented', color: '#FDE68A' },
      { emoji: '♻️', title: 'Cache invalidates', subtitle: 'Query result cache cleared automatically', color: '#FCA5A5' },
      { emoji: '📊', title: 'Scheduled refresh fires', subtitle: 'Dashboard queries run once · Cache repopulated', color: '#C4B5FD' },
      { emoji: '👥', title: '60-70 viewers open dashboards', subtitle: 'All served from cache · <100ms load · Zero warehouse queries', color: '#86EFAC' },
    ],
  },
  {
    id: 'bi-c5',
    type: 'callout',
    variant: 'info',
    text: 'With hourly dbt runs + hourly scheduled refresh, the warehouse executes dashboard queries once per hour per dashboard. The 60-70 viewers never trigger warehouse queries — they consume only cached results. This is why concurrent dashboard load is negligible and the Small Serverless warehouse is sufficient.',
  },
  { id: 'bi-d5', type: 'divider' },

  // ── 6. Genie Code — AI Dashboard Builder ─────────────────────
  {
    id: 'bi-h6',
    type: 'heading',
    level: 1,
    text: 'Genie Code — AI Dashboard Builder',
  },
  {
    id: 'bi-t6a',
    type: 'text',
    text: 'Genie Code is the AI-powered dashboard builder that launched in late 2025. It has two modes:',
  },
  {
    id: 'bi-cards6',
    type: 'card-grid',
    columns: 2,
    cards: [
      {
        emoji: '💬',
        title: 'Chat Mode',
        description: 'Describe the dashboard you want in natural language. "Create a revenue dashboard showing monthly trends, top 10 customers, and regional breakdown with filters for date range and region." Genie Code generates the complete dashboard with SQL datasets, chart configurations, and layout.',
        accent: '#DCFCE7',
      },
      {
        emoji: '🤖',
        title: 'Agent Mode',
        description: 'Upload screenshots of existing dashboards (e.g., from Looker Studio) and Genie Code analyzes the layout, chart types, metrics, and filters — then recreates the dashboard on Databricks using the available Gold tables. It maps visible metrics to your table columns and generates the SQL queries automatically.',
        accent: '#FEF3C7',
      },
    ],
  },
  {
    id: 'bi-h6b',
    type: 'heading',
    level: 2,
    text: 'Rebuilding Looker Dashboards with Screenshots',
  },
  {
    id: 'bi-t6b',
    type: 'text',
    text: 'For the Looker Studio → Databricks migration, Agent Mode is the recommended approach:\n\n1. Screenshot each Looker Studio dashboard (full page capture).\n2. Open Genie Code Agent Mode in Databricks.\n3. Upload the screenshot and specify the Gold catalog: "Recreate this dashboard using tables from floranow_catalog.gold."\n4. Genie Code analyzes the screenshot — identifies chart types (bar, line, table, KPI cards), metrics (revenue, order count), dimensions (date, region), and filters.\n5. It generates SQL datasets mapped to your Gold tables and builds the dashboard layout.\n6. Review, adjust, and publish.\n\nThis does not produce a pixel-perfect copy, but it generates a functional first draft that typically needs 20-30% manual adjustment. For complex dashboards, it saves hours compared to rebuilding from scratch.',
  },
  {
    id: 'bi-c6',
    type: 'callout',
    variant: 'tip',
    text: 'Genie Code Agent Mode dramatically accelerates Looker Studio migration. Instead of manually recreating each chart, upload the screenshot and let the AI generate the first draft. Expect 60-70% accuracy on layout and metrics mapping — the remaining adjustment is faster than building from zero.',
  },
  { id: 'bi-d6', type: 'divider' },

  // ── 7. Genie Spaces — Natural Language Querying ──────────────
  {
    id: 'bi-h7',
    type: 'heading',
    level: 1,
    text: 'Genie Spaces — Natural Language Querying',
  },
  {
    id: 'bi-t7a',
    type: 'text',
    text: 'Genie Spaces let business users ask data questions in plain English. Behind the scenes, Genie translates the question into SQL, executes it against the SQL Warehouse, and returns the answer with an auto-generated visualization.\n\nEvery AI/BI Dashboard can also serve as a Genie starting point — users view a chart, spot something interesting, and ask follow-up questions without leaving the platform.',
  },
  {
    id: 'bi-h7b',
    type: 'heading',
    level: 2,
    text: 'Example Conversation',
  },
  {
    id: 'bi-t7b',
    type: 'text',
    text: '1. User opens the Executive Revenue dashboard → sees a revenue dip in UAE last week.\n2. Opens Genie and asks: "Why did UAE revenue drop last week?"\n3. Genie generates SQL against mart_revenue with region=\'UAE\' and the relevant date range.\n4. Returns an answer with a daily breakdown chart showing which days had the biggest drops.\n5. User asks follow-up: "Compare that to the same week last month."\n6. Genie generates a comparison query — no analyst ticket needed.',
  },
  {
    id: 'bi-h7c',
    type: 'heading',
    level: 2,
    text: 'Setting Up a Genie Space',
  },
  {
    id: 'bi-tbl7',
    type: 'table',
    headers: ['Configuration', 'What It Does', 'Floranow Example'],
    rows: [
      ['Source Tables', 'Gold tables the space can query', 'mart_revenue, mart_sales, mart_operations, dim_customers, dim_products'],
      ['Knowledge Store', 'Business context that helps Genie understand your domain', '"Revenue" means total_amount from mart_revenue. "Active customer" means customer with order in last 90 days.'],
      ['Example Queries', 'Seed questions that train Genie on common patterns', '"Show monthly revenue by region for the last 6 months" → SELECT ...'],
      ['Permissions', 'Who can access the space', 'Sr. Analyst, Jr. Analyst, managers with full workspace license'],
    ],
  },
  {
    id: 'bi-c7',
    type: 'callout',
    variant: 'info',
    text: 'Genie Spaces require full workspace user licenses — they are not available to account-level viewers. For Floranow, the 2 analysts and select managers with workspace licenses will use Genie. The 60-70 dashboard-only viewers use the AI/BI Dashboards without needing Genie access.',
  },
  { id: 'bi-d7', type: 'divider' },

  // ── 8. Metric Views — The Semantic Layer ─────────────────────
  {
    id: 'bi-h8',
    type: 'heading',
    level: 1,
    text: 'Metric Views — The Semantic Layer',
  },
  {
    id: 'bi-t8a',
    type: 'text',
    text: 'Metric Views are Databricks\' semantic layer — they define reusable dimensions and measures in YAML, stored as a Unity Catalog view. Once defined, every dashboard, Genie Space, and SQL query references the same metric definitions. This eliminates "my number doesn\'t match your number" inconsistencies.\n\nA Metric View can reference one primary source table and JOIN additional tables — so you can combine facts with dimensions in a single semantic definition.',
  },
  {
    id: 'bi-h8b',
    type: 'heading',
    level: 2,
    text: 'Structure',
  },
  {
    id: 'bi-code8',
    type: 'code',
    code: `CREATE OR REPLACE VIEW floranow_catalog.gold.sales_metrics
WITH METRICS
LANGUAGE YAML
AS $$
  version: 1.1
  source: floranow_catalog.gold.mart_sales

  joins:
    - name: customers
      source: floranow_catalog.gold.dim_customers
      'on': source.customer_id = customers.customer_id
    - name: products
      source: floranow_catalog.gold.dim_products
      'on': source.product_id = products.product_id

  dimensions:
    - name: Month
      expr: DATE_TRUNC('MONTH', source.order_date)
    - name: Region
      expr: source.region
    - name: Customer Type
      expr: customers.customer_type
    - name: Product Category
      expr: products.category

  measures:
    - name: Total Revenue
      expr: SUM(source.total_amount)
    - name: Order Count
      expr: COUNT(source.order_id)
    - name: Avg Order Value
      expr: SUM(source.total_amount) / COUNT(source.order_id)
    - name: Revenue for Active Orders
      expr: SUM(source.total_amount) FILTER (WHERE source.status = 'active')
$$`,
  },
  {
    id: 'bi-h8c',
    type: 'heading',
    level: 2,
    text: 'Organization: One Metric View per Domain',
  },
  {
    id: 'bi-t8c',
    type: 'text',
    text: 'You do not need one Metric View per table. The recommended pattern is one per business domain, with JOINs pulling in related dimensions:',
  },
  {
    id: 'bi-tbl8',
    type: 'table',
    headers: ['Metric View', 'Primary Source', 'Joined Tables', 'Example Measures'],
    rows: [
      ['sales_metrics', 'mart_sales', 'dim_customers, dim_products', 'Total Revenue, Order Count, Avg Order Value, Revenue by Category'],
      ['operations_metrics', 'mart_operations', 'dim_products', 'Fulfillment Rate, Avg Delivery Days, Late Order %, Waste Rate'],
      ['customer_metrics', 'dim_customers', 'mart_sales', 'Active Customers, Lifetime Value, Churn Rate, Avg Orders per Customer'],
    ],
  },
  {
    id: 'bi-c8',
    type: 'callout',
    variant: 'tip',
    text: 'Metric Views are the single source of truth. When someone asks "What is our revenue?" — whether in a dashboard, Genie, or SQL Editor — the answer always comes from the same measure definition. Define it once, use it everywhere.',
  },
  { id: 'bi-d8', type: 'divider' },

  // ── 9. Dashboard Datasets — How They Work ────────────────────
  {
    id: 'bi-h9',
    type: 'heading',
    level: 1,
    text: 'Dashboard Datasets — How They Work',
  },
  {
    id: 'bi-t9a',
    type: 'text',
    text: 'Each dashboard visualization is backed by a dataset — a SQL query that returns the data. Datasets are defined in the dashboard editor, not in dbt or Unity Catalog. You can create multiple datasets per dashboard.',
  },
  {
    id: 'bi-cmp9',
    type: 'compare',
    leftTitle: 'Power BI Model',
    rightTitle: 'Databricks Dashboard Datasets',
    items: [
      { old: 'Import tables into a data model with relationships (PK/FK)', new: 'Write SQL queries that JOIN tables explicitly — no hidden data model' },
      { old: 'Relationships auto-join tables when you drag fields', new: 'Each dataset is a self-contained SQL query with explicit JOINs' },
      { old: 'Implicit relationships can cause unexpected fan-out or ambiguity', new: 'SQL JOINs are explicit — you control exactly what joins what' },
      { old: 'One shared model across all visuals', new: 'Each visual can use a different dataset (different SQL query)' },
    ],
  },
  {
    id: 'bi-h9b',
    type: 'heading',
    level: 2,
    text: 'Multi-Dataset Example',
  },
  {
    id: 'bi-t9b',
    type: 'text',
    text: 'A single dashboard can use multiple datasets, each with its own SQL:\n\n• Dataset 1 (Revenue Trends): SELECT date_trunc(\'month\', order_date) as month, region, SUM(total_amount) as revenue FROM mart_revenue GROUP BY 1, 2\n• Dataset 2 (Top Customers): SELECT c.customer_name, SUM(s.total_amount) as lifetime_value FROM mart_sales s JOIN dim_customers c ON s.customer_id = c.customer_id GROUP BY 1 ORDER BY 2 DESC LIMIT 10\n• Dataset 3 (Operations KPIs): SELECT AVG(delivery_days) as avg_delivery, COUNT(CASE WHEN status = \'late\' THEN 1 END) * 100.0 / COUNT(*) as late_pct FROM mart_operations\n\nEach visualization binds to one dataset. Cross-filtering between visualizations works across datasets on the same dashboard.',
  },
  { id: 'bi-d9', type: 'divider' },

  // ── 10. Custom Calculations ──────────────────────────────────
  {
    id: 'bi-h10',
    type: 'heading',
    level: 1,
    text: 'Custom Calculations',
  },
  {
    id: 'bi-t10a',
    type: 'text',
    text: 'Custom calculations let you create new fields directly in the dashboard without modifying the source dataset SQL or dbt models. They support standard SQL expressions — no proprietary language to learn.',
  },
  {
    id: 'bi-cmp10',
    type: 'compare',
    leftTitle: 'Power BI (DAX)',
    rightTitle: 'Databricks Custom Calculations',
    items: [
      { old: 'DAX: proprietary language with CALCULATE, FILTER, ALL, RELATED', new: 'Standard SQL: CASE, SUM, AVG, window functions — any SQL you know works' },
      { old: 'Steep learning curve, context transition rules', new: 'If you can write SQL, you can write custom calculations' },
      { old: 'LOD expressions require complex DAX patterns', new: 'LOD via standard SQL window functions: SUM(...) OVER (PARTITION BY ...)' },
    ],
  },
  {
    id: 'bi-h10b',
    type: 'heading',
    level: 2,
    text: 'Complexity Level',
  },
  {
    id: 'bi-t10b',
    type: 'text',
    text: 'Custom calculations in Databricks dashboards sit between Looker Studio (simplest) and Power BI DAX (most complex):\n\n• Simple aggregations: SUM(revenue), COUNT(DISTINCT customer_id), AVG(delivery_days) — identical to SQL.\n• Conditional metrics: SUM(CASE WHEN region = \'UAE\' THEN revenue ELSE 0 END) — standard CASE expressions.\n• Window functions: SUM(revenue) OVER (PARTITION BY region ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) — rolling averages, running totals.\n• FILTER expressions: SUM(total_amount) FILTER (WHERE status = \'active\') — SQL standard, cleaner than DAX CALCULATE.\n• LOD (Level of Detail): Supported natively through Metric Views or SQL window functions. No special syntax needed.\n\nBottom line: if your team knows SQL (which they do from dbt), custom calculations are straightforward. No new language to learn.',
  },
  { id: 'bi-d10', type: 'divider' },

  // ── 11. Interactive Features ─────────────────────────────────
  {
    id: 'bi-h11',
    type: 'heading',
    level: 1,
    text: 'Interactive Features',
  },
  {
    id: 'bi-cards11',
    type: 'card-grid',
    columns: 2,
    cards: [
      {
        emoji: '🔗',
        title: 'Cross-Filtering',
        description: 'Click a bar in one chart → all other charts on the same dashboard filter to that selection. Works across different datasets on the same dashboard. Users explore data interactively without configuring anything.',
        accent: '#DCFCE7',
      },
      {
        emoji: '🔍',
        title: 'Drill-Through',
        description: 'Click a data point → navigate to a detail page with context passed as parameters. Example: click a region in the revenue chart → opens a detail page filtered to that region showing customer-level breakdown.',
        accent: '#DBEAFE',
      },
      {
        emoji: '📑',
        title: 'Multi-Page Dashboards',
        description: 'Organize dashboards into multiple tabs/pages. Summary on page 1, regional detail on page 2, customer-level on page 3. Navigation between pages preserves filter context.',
        accent: '#FEF3C7',
      },
      {
        emoji: '🎛️',
        title: 'Filters & Parameters',
        description: 'Global filters that apply across all visualizations: date range pickers, dropdown selectors, text search. Use {{ parameter }} syntax in SQL. One dashboard serves all regions, teams, and date ranges.',
        accent: '#EDE9FE',
      },
      {
        emoji: '📊',
        title: 'Chart Types',
        description: 'Bar, line, area, scatter, pie, donut, table, pivot table, map, KPI card, histogram, heatmap, funnel, combo charts (dual axis). All chart types support conditional formatting.',
        accent: '#FCE7F3',
      },
      {
        emoji: '🎨',
        title: 'Theming & Branding',
        description: 'Custom color palettes, logo placement, and consistent styling across all dashboards. Apply a workspace-level theme for brand consistency.',
        accent: '#FEF9C3',
      },
    ],
  },
  { id: 'bi-d11', type: 'divider' },

  // ── 12. Subscriptions & Sharing ──────────────────────────────
  {
    id: 'bi-h12',
    type: 'heading',
    level: 1,
    text: 'Subscriptions & Sharing',
  },
  {
    id: 'bi-tbl12',
    type: 'table',
    headers: ['Channel', 'How It Works', 'Use Case'],
    rows: [
      ['Email Subscription', 'Schedule dashboard snapshots as PDF or inline HTML — daily, weekly, or custom cron', 'Executives who don\'t log in get a morning revenue summary in their inbox'],
      ['Slack Integration', 'Post dashboard snapshots or alert notifications to a Slack channel', 'Operations team gets real-time fulfillment alerts in #ops-alerts'],
      ['Microsoft Teams', 'Same as Slack — post snapshots and alerts to Teams channels', 'Cross-team dashboards shared in Teams workspaces'],
      ['Embedding', 'Embed dashboards in internal portals via iframe with authenticated tokens', 'Customer-facing portal showing order status — RLS ensures each customer sees only their data'],
      ['PDF Export', 'One-click export of any dashboard as high-quality PDF', 'Board presentations, vendor scorecards, audit documentation'],
      ['Published Link', 'Share a link to a published dashboard — recipients need account-level access', 'Share the revenue dashboard link in an email to all managers'],
    ],
  },
  { id: 'bi-d12', type: 'divider' },

  // ── 13. SQL Alerts ───────────────────────────────────────────
  {
    id: 'bi-h13',
    type: 'heading',
    level: 1,
    text: 'SQL Alerts',
  },
  {
    id: 'bi-t13',
    type: 'text',
    text: 'SQL Alerts monitor query results on a schedule and send notifications when thresholds are breached. They run independently of dashboards — you define a SQL query, a condition, and a notification channel.',
  },
  {
    id: 'bi-tbl13',
    type: 'table',
    headers: ['Alert', 'SQL Query', 'Condition', 'Channel'],
    rows: [
      ['Revenue Drop', 'SELECT SUM(total_amount) FROM mart_revenue WHERE order_date = CURRENT_DATE', 'Value < $50,000', 'Email to CFO + Slack #finance'],
      ['Fulfillment Rate', 'SELECT AVG(CASE WHEN status = \'delivered\' THEN 1.0 ELSE 0.0 END) FROM mart_operations WHERE order_date >= CURRENT_DATE - 1', 'Value < 0.95', 'Slack #ops-alerts'],
      ['Late Orders', 'SELECT COUNT(*) FROM mart_operations WHERE delivery_days > 3 AND order_date = CURRENT_DATE', 'Value > 10', 'Email to Operations Lead'],
      ['New Customer Spike', 'SELECT COUNT(*) FROM dim_customers WHERE created_at >= CURRENT_DATE', 'Value > 50', 'Slack #sales-wins'],
    ],
  },
  {
    id: 'bi-c13',
    type: 'callout',
    variant: 'info',
    text: 'SQL Alerts run on the SQL Warehouse using Jobs Compute credits. Each alert execution is a single query — minimal cost. Schedule high-priority alerts every 15 minutes; others hourly or daily.',
  },
  { id: 'bi-d13', type: 'divider' },

  // ── 14. Row-Level Security & Column Masking ──────────────────
  {
    id: 'bi-h14',
    type: 'heading',
    level: 1,
    text: 'Row-Level Security & Column Masking',
  },
  {
    id: 'bi-t14',
    type: 'text',
    text: 'Unity Catalog row filters restrict which rows each user can see. Column masks transform sensitive values (PII) based on group membership. Both apply transparently to every query surface — dashboards, Genie, SQL Editor, notebooks — with zero application code.',
  },
  {
    id: 'bi-code14',
    type: 'code',
    code: `-- Step 1: Region mapping table
CREATE TABLE IF NOT EXISTS floranow_catalog.gold.user_region_access (
  user_email     STRING,
  allowed_region STRING
);

INSERT INTO floranow_catalog.gold.user_region_access VALUES
  ('ahmed@floranow.com', 'UAE'),
  ('ahmed@floranow.com', 'KSA'),
  ('sara@floranow.com',  'UAE'),
  ('ops-team@floranow.com', 'ALL');

-- Step 2: Row filter function
CREATE OR REPLACE FUNCTION floranow_catalog.gold.region_filter(region_col STRING)
RETURNS BOOLEAN
RETURN
  EXISTS (
    SELECT 1 FROM floranow_catalog.gold.user_region_access
    WHERE user_email = current_user()
      AND (allowed_region = region_col OR allowed_region = 'ALL')
  )
  OR IS_ACCOUNT_GROUP_MEMBER('floranow-admins');

-- Step 3: Apply to Gold tables
ALTER TABLE floranow_catalog.gold.mart_revenue
  SET ROW FILTER floranow_catalog.gold.region_filter ON (region);

ALTER TABLE floranow_catalog.gold.mart_sales
  SET ROW FILTER floranow_catalog.gold.region_filter ON (region);

ALTER TABLE floranow_catalog.gold.mart_operations
  SET ROW FILTER floranow_catalog.gold.region_filter ON (region);

-- Step 4: Column masking for PII
CREATE OR REPLACE FUNCTION floranow_catalog.gold.mask_email(email_col STRING)
RETURNS STRING
RETURN
  CASE
    WHEN IS_ACCOUNT_GROUP_MEMBER('floranow-admins') THEN email_col
    ELSE CONCAT(LEFT(email_col, 2), '***@', SPLIT(email_col, '@')[1])
  END;

ALTER TABLE floranow_catalog.gold.dim_customers
  ALTER COLUMN email SET MASK floranow_catalog.gold.mask_email;`,
  },
  { id: 'bi-d14', type: 'divider' },

  // ── 15. Platform Capabilities ────────────────────────────────
  {
    id: 'bi-h15',
    type: 'heading',
    level: 1,
    text: 'Platform Capabilities',
  },
  {
    id: 'bi-cards15',
    type: 'card-grid',
    columns: 2,
    cards: [
      {
        emoji: '🚀',
        title: 'Photon Engine',
        description: 'Vectorized C++ query engine, 2-8x faster for aggregations, JOINs, and window functions. Enabled by default on all serverless SQL warehouses. Databricks reports 40% faster BI queries in 2025 benchmarks.',
        accent: '#FCE7F3',
      },
      {
        emoji: '📐',
        title: 'Liquid Clustering',
        description: 'Gold tables clustered by common dashboard filter columns (order_date, region). Photon + Liquid Clustering = minimal data scanning. Dashboard queries that filter on date + region read only relevant files.',
        accent: '#DCFCE7',
      },
      {
        emoji: '🔧',
        title: 'Parameterized Queries',
        description: 'Use {{ parameter }} in dashboard SQL. One dashboard serves multiple regions/dates instead of duplicating dashboards. Reduces maintenance from 11 × N region-specific dashboards to 11 parameterized dashboards.',
        accent: '#FEF3C7',
      },
      {
        emoji: '🥇',
        title: 'Pre-aggregated Gold Tables',
        description: 'dbt builds mart tables with pre-computed daily/weekly/monthly aggregations. Dashboards read pre-aggregated rows instead of scanning millions of raw records. A monthly revenue chart reads 12 rows, not millions.',
        accent: '#DBEAFE',
      },
    ],
  },
  { id: 'bi-d15', type: 'divider' },

  // ── 16. Dashboard Best Practices ─────────────────────────────
  {
    id: 'bi-h16',
    type: 'heading',
    level: 1,
    text: 'Dashboard Best Practices',
  },
  {
    id: 'bi-t16',
    type: 'text',
    text: '• Build ONLY on floranow_catalog.gold.* — never query Bronze or Silver from dashboards. Bronze and Silver are for engineers and pipeline debugging.\n• Use filters and parameters instead of separate dashboards per region. One well-designed dashboard with region/date filters replaces 10 hard-coded copies.\n• Enable scheduled email subscriptions for executives who don\'t log in — dashboard snapshots delivered as PDF on daily/weekly cadences.\n• Test RLS by impersonating users: run SELECT current_user(); with different credentials to verify each user sees only permitted rows.\n• Limit to 6-8 visualizations per dashboard tab — keeps load times fast and avoids cognitive overload.\n• Add a one-line subtitle to every chart explaining the metric, time range, and data source — builds user trust in the data.\n• Schedule refresh to fire 15 minutes after dbt completes — ensures cache is always fresh when viewers arrive.\n• Use Metric Views for all shared KPIs — prevents conflicting metric definitions across dashboards.',
  },
  { id: 'bi-d16', type: 'divider' },

  // ── 17. Cost Implications ────────────────────────────────────
  {
    id: 'bi-h17',
    type: 'heading',
    level: 1,
    text: 'Cost Implications',
  },
  {
    id: 'bi-tbl17',
    type: 'table',
    headers: ['Component', 'Cost Model', 'Floranow Impact'],
    rows: [
      ['AI/BI Dashboards', 'Free — no additional charge for creating or viewing dashboards', 'Zero cost for the 11 dashboards and 60-70 viewers'],
      ['Genie Spaces', 'Free — included in workspace, queries use SQL Warehouse DBUs', 'Minimal — only 2 analysts using Genie for ad-hoc queries'],
      ['SQL Alerts', 'Queries run on SQL Warehouse — one query per alert per schedule', 'Negligible — small queries running hourly'],
      ['Scheduled Refresh', 'Dashboard queries run on SQL Warehouse during refresh', 'Main BI cost: ~11 dashboards × 1 refresh/hour × query duration'],
      ['Account-Level Viewers', 'Free — no license cost for dashboard-only viewers', '60-70 viewers at zero licensing cost'],
      ['Embedding', 'No additional charge — uses the same SQL Warehouse', 'Included if needed for internal portals'],
    ],
  },
  {
    id: 'bi-c17',
    type: 'callout',
    variant: 'tip',
    text: 'The primary BI cost is SQL Warehouse compute during scheduled refresh — not viewer count. With a Small Serverless warehouse ($0.70/DBU) running 11 dashboard refreshes per hour, the total BI compute cost is a fraction of the overall warehouse budget. Dashboard creation, viewing, and account-level viewer licenses are all free.',
  },
  { id: 'bi-d17', type: 'divider' },

  // ── Cross-References ─────────────────────────────────────────
  {
    id: 'bi-cref',
    type: 'callout',
    variant: 'info',
    text: 'Cross-References: Gold tables are built by dbt (see dbt page). SQL Warehouse sizing and auto-stop configuration in Warehousing page. Ingestion pipelines feeding the Bronze layer in Ingestion page. Full pipeline timing in E2E Flow page.',
  },
]

export default function Bi() {
  const { blocks, updateBlock, addBlock, removeBlock, saveStatus, forceSave } = usePageState('page:bi', DEFAULT_BLOCKS)

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="pl-10">
        <BlockEditor blocks={blocks} updateBlock={updateBlock} addBlock={addBlock} removeBlock={removeBlock} saveStatus={saveStatus} onSave={forceSave} />
      </div>
    </div>
  )
}
