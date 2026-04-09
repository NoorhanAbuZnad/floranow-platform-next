'use client'
import BlockEditor from '../components/BlockEditor'
import { usePageState } from '../lib/usePageState'
import type { Block } from '../lib/blocks'

const DEFAULT_BLOCKS: Block[] = [
  // ── 1. What Is Databricks AI ─────────────────────────────────
  {
    id: 'ai-h1',
    type: 'heading',
    level: 1,
    text: 'What Is Databricks AI',
  },
  {
    id: 'ai-t1',
    type: 'text',
    text: 'Databricks AI is the umbrella term for every AI capability built into the Lakehouse Platform. It spans three areas:\n\n• Genie — conversational AI for business users. Ask data questions in plain English, get SQL-generated answers with visualizations. Includes Genie Spaces (Q&A), Genie Agent Mode (multi-step research), and Genie Code (AI dashboard builder).\n• Mosaic AI — the machine learning platform. AutoML for automated model training, MLflow for experiment tracking and model registry, Feature Store for shared features, and Model Serving for real-time inference endpoints.\n• AI Functions — SQL functions that call AI models directly from queries. Sentiment analysis, classification, extraction, and summarization without leaving SQL.\n\nFor Floranow, the immediate value is Genie — it replaces the manual analyst request workflow and gives 60-70 business users self-service access to data. Mosaic AI (demand forecasting, anomaly detection) is the Phase 2-3 opportunity.',
  },
  { id: 'ai-d1', type: 'divider' },

  // ── 2. What Changes ──────────────────────────────────────────
  {
    id: 'ai-h2',
    type: 'heading',
    level: 1,
    text: 'What Changes',
  },
  {
    id: 'ai-cmp1',
    type: 'compare',
    leftTitle: 'Current (Vertex AI + Manual)',
    rightTitle: 'Future (Databricks AI)',
    items: [
      { old: 'Vertex AI runs separately on GCP — no lineage to data platform', new: 'Mosaic AI runs inside Databricks — training data, features, models all governed by Unity Catalog' },
      { old: 'Business users file analyst requests, wait hours/days for answers', new: 'Genie Spaces: ask in English, get answers in seconds' },
      { old: 'No self-service analytics — every question goes through 2 analysts', new: 'Self-service for 60-70 users — analysts focus on complex work' },
      { old: 'Manual model deployment with custom infrastructure', new: 'Model Serving: one-click serverless deployment with auto-scaling' },
      { old: 'No conversational follow-ups — each request is a new ticket', new: 'Genie remembers context — follow-up questions refine the answer' },
      { old: 'ML models disconnected from BI — predictions live in separate systems', new: 'Predictions write back to Gold tables → dashboards and Genie query them natively' },
    ],
  },
  { id: 'ai-d2', type: 'divider' },

  // ── 3. Genie Spaces — Natural Language Analytics ──────────────
  {
    id: 'ai-h3',
    type: 'heading',
    level: 1,
    text: 'Genie Spaces — Natural Language Analytics',
  },
  {
    id: 'ai-t3a',
    type: 'text',
    text: 'Genie Spaces let business users ask data questions in plain English. Behind the scenes, Genie translates the question into SQL, executes it against the SQL Warehouse with Photon acceleration, and returns an answer with an auto-generated visualization — all governed by Unity Catalog permissions.',
  },
  {
    id: 'ai-h3b',
    type: 'heading',
    level: 2,
    text: 'How Genie Works',
  },
  {
    id: 'ai-flow1',
    type: 'flow',
    steps: [
      { emoji: '💬', title: 'User Asks Question', subtitle: '"What was revenue by region last month?"', color: '#DBEAFE' },
      { emoji: '🧠', title: 'Analyzes Metadata', subtitle: 'Table/column descriptions, knowledge store, synonyms', color: '#C4B5FD' },
      { emoji: '🔧', title: 'Generates SQL', subtitle: 'Builds query from metadata + approved instructions', color: '#FDE68A' },
      { emoji: '🗄️', title: 'Executes on SQL Warehouse', subtitle: 'Photon engine, result cache, Unity Catalog governance', color: '#86EFAC' },
      { emoji: '📊', title: 'Returns Answer', subtitle: 'Result with auto-generated visualization', color: '#FCA5A5' },
      { emoji: '🔄', title: 'Follow-up / Drill Down', subtitle: 'User asks next question — Genie refines', color: '#F9A8D4' },
    ],
  },
  {
    id: 'ai-h3c',
    type: 'heading',
    level: 2,
    text: 'Example Conversation',
  },
  {
    id: 'ai-t3c',
    type: 'text',
    text: '1. Sales manager opens Genie and asks: "What was revenue by region last month?"\n2. Genie reads mart_revenue descriptions, generates SQL with date range and GROUP BY region.\n3. Returns a bar chart with regional breakdown. Total time: ~3 seconds.\n4. Manager asks: "Why is KSA lower than usual?"\n5. Genie generates a comparison query against the previous month, breaking down by product category.\n6. Manager asks: "Which customers in KSA had the biggest drop?"\n7. Genie JOINs mart_sales with dim_customers filtered to KSA, returns a ranked table.\n\nNo SQL knowledge required. No analyst ticket filed. Total time for all 3 questions: ~30 seconds.',
  },
  {
    id: 'ai-h3d',
    type: 'heading',
    level: 2,
    text: 'Floranow Genie Spaces',
  },
  {
    id: 'ai-cards3',
    type: 'card-grid',
    columns: 3,
    cards: [
      {
        emoji: '💰',
        title: 'Sales & Revenue',
        description: 'Tables: mart_revenue, mart_sales, dim_customers\n\nSample questions:\n• "Revenue by region this month?"\n• "Top 10 customers by order value?"\n• "Compare Q1 vs Q2 revenue"\n\nUsers: Sales managers, executives, finance team',
        accent: '#DCFCE7',
      },
      {
        emoji: '⚙️',
        title: 'Operations',
        description: 'Tables: mart_operations, dim_products\n\nSample questions:\n• "Delayed shipments this week?"\n• "Fulfillment rate by warehouse?"\n• "Average delivery time trend"\n\nUsers: Operations managers, logistics team',
        accent: '#FEF3C7',
      },
      {
        emoji: '🚛',
        title: 'Supply & Logistics',
        description: 'Tables: mart_operations, dim_products\n\nSample questions:\n• "Stockout rate by product category?"\n• "Vendor delivery performance?"\n• "Inbound shipment forecast"\n\nUsers: Procurement, supply chain team',
        accent: '#DBEAFE',
      },
    ],
  },
  {
    id: 'ai-c3',
    type: 'callout',
    variant: 'info',
    text: 'Genie Spaces require full workspace user licenses. For Floranow, the 2 analysts and select managers with workspace licenses use Genie. The 60-70 dashboard-only viewers use AI/BI Dashboards (free account-level access) — they don\'t need Genie.',
  },
  { id: 'ai-d3', type: 'divider' },

  // ── 4. Setting Up a Genie Space ──────────────────────────────
  {
    id: 'ai-h4',
    type: 'heading',
    level: 1,
    text: 'Setting Up a Genie Space — Step by Step',
  },
  {
    id: 'ai-flow4',
    type: 'flow',
    steps: [
      { emoji: '🥇', title: 'Select Gold Tables', subtitle: 'Max 30 per space · Recommend ≤5 for accuracy', color: '#FDE68A' },
      { emoji: '📝', title: 'Add Descriptions', subtitle: 'Table + column COMMENT in Unity Catalog', color: '#C4B5FD' },
      { emoji: '📚', title: 'Build Knowledge Store', subtitle: 'Synonyms, join paths, SQL expressions', color: '#86EFAC' },
      { emoji: '✅', title: 'Add Example SQL', subtitle: 'Verified answers for high-stakes questions', color: '#7DD3FC' },
      { emoji: '🔒', title: 'Set Permissions', subtitle: 'CAN USE on warehouse, SELECT on tables', color: '#FCA5A5' },
      { emoji: '🧪', title: 'Test as First User', subtitle: 'Ask questions, examine SQL, iterate', color: '#F9A8D4' },
      { emoji: '👥', title: 'User Testing', subtitle: 'Recruit business user, collect feedback', color: '#DBEAFE' },
      { emoji: '📈', title: 'Monitor & Iterate', subtitle: 'Monitoring tab shows all questions + SQL', color: '#FEF3C7' },
    ],
  },
  {
    id: 'ai-h4b',
    type: 'heading',
    level: 2,
    text: 'Key Best Practices (from Databricks Documentation)',
  },
  {
    id: 'ai-t4b',
    type: 'text',
    text: '• Think of Genie as a new analyst joining your company. It needs clear context — table descriptions, column descriptions, business terminology — to be effective.\n• Start small and iterate. Begin with 5 or fewer tables. Add complexity based on real user feedback, not upfront assumptions.\n• Prioritize SQL over text instructions. Use SQL expressions to define metrics (e.g., "revenue = SUM(total_amount)"). Use example SQL queries for complex patterns. Use text instructions only as a last resort.\n• Denormalize and pre-join. Fewer tables with clear columns are better than many normalized tables requiring Genie to figure out JOINs. Use Metric Views (see BI page) for pre-defined metrics.\n• Avoid conflicting instructions. If text says "round to 2 decimals" but example SQL doesn\'t round, Genie gets confused.\n• Prompt clarification questions. Add instructions like: "When users ask about sales without specifying time range or region, ask: \'Please specify the time range and region.\'"\n• Have a domain expert define the space. Data analysts proficient in SQL are the best space curators — they understand both the data and the business questions.',
  },
  { id: 'ai-d4', type: 'divider' },

  // ── 5. Table Preparation for Genie ───────────────────────────
  {
    id: 'ai-h5',
    type: 'heading',
    level: 1,
    text: 'Table Preparation for Genie',
  },
  {
    id: 'ai-t5',
    type: 'text',
    text: 'Genie\'s accuracy depends heavily on table and column metadata. The more descriptive your COMMENT values, the more accurately Genie generates SQL. Always add human-readable descriptions to Gold tables before exposing them in a Genie Space. Avoid vague descriptions like "order amount" — instead write "Total revenue in USD, excludes cancelled/refunded orders."',
  },
  {
    id: 'ai-code5',
    type: 'code',
    code: `-- Table descriptions (Genie reads these to understand context)
COMMENT ON TABLE floranow_catalog.gold.mart_revenue IS
  'Daily revenue aggregated by region and product category.
   Grain: one row per date × region.
   Key metrics: revenue (total sales in USD), orders_count, avg_order_value.
   Filtered by order_status NOT IN (cancelled, refunded).
   Updated hourly by dbt. Use revenue_date for date filters.';

COMMENT ON TABLE floranow_catalog.gold.mart_sales IS
  'Sales transactions by customer and product.
   Grain: one row per sale.
   Includes total_amount, customer_id, product_id, sale_date.
   JOIN to dim_customers on customer_id, dim_products on product_id.
   Updated hourly by dbt.';

COMMENT ON TABLE floranow_catalog.gold.mart_operations IS
  'Operational metrics: fulfillment, delivery, logistics.
   Grain: one row per order.
   Key metrics: delivery_days, status (delivered/pending/late), warehouse_id.
   Updated hourly by dbt.';

-- Column descriptions (critical for Genie accuracy)
ALTER TABLE floranow_catalog.gold.mart_revenue
  ALTER COLUMN revenue_date COMMENT 'Date of the revenue record (YYYY-MM-DD). Use for all date range filters.';
ALTER TABLE floranow_catalog.gold.mart_revenue
  ALTER COLUMN region COMMENT 'Sales region: UAE, KSA, Egypt, Jordan. Primary geographic dimension.';
ALTER TABLE floranow_catalog.gold.mart_revenue
  ALTER COLUMN revenue COMMENT 'Total revenue in USD for date+region. Excludes cancelled/refunded orders.';
ALTER TABLE floranow_catalog.gold.mart_revenue
  ALTER COLUMN orders_count COMMENT 'Number of distinct orders for date+region. Volume metric.';
ALTER TABLE floranow_catalog.gold.mart_revenue
  ALTER COLUMN avg_order_value COMMENT 'Average order value = revenue / orders_count. Efficiency metric.';`,
  },
  { id: 'ai-d5', type: 'divider' },

  // ── 6. Knowledge Store Configuration ─────────────────────────
  {
    id: 'ai-h6',
    type: 'heading',
    level: 1,
    text: 'Knowledge Store Configuration',
  },
  {
    id: 'ai-t6a',
    type: 'text',
    text: 'The knowledge store bridges the gap between Genie\'s general knowledge and your business-specific terminology. It has four components:\n\n1. Synonyms — Map business jargon to column names. "sales" = revenue, "AOV" = avg_order_value, "orders" = orders_count. Genie matches these during query generation.\n2. Join paths — Tell Genie how tables relate. dim_customers.customer_id = mart_sales.customer_id. Prevents incorrect JOINs.\n3. SQL expressions — Define reusable metrics. More reliable and maintainable than plain text instructions.\n4. Verified answers — Gold-standard Q→SQL pairs. Genie returns the verified SQL verbatim — zero hallucination risk on critical metrics.',
  },
  {
    id: 'ai-code6',
    type: 'code',
    code: `-- Verified SQL expression for "monthly revenue"
-- Added in the Genie Space configuration UI
SELECT
  date_trunc('month', revenue_date) AS month,
  region,
  SUM(revenue) AS monthly_revenue,
  SUM(orders_count) AS monthly_orders
FROM floranow_catalog.gold.mart_revenue
WHERE revenue_date BETWEEN :start_date AND :end_date
GROUP BY 1, 2
ORDER BY 1 DESC;

-- Verified answer for "What's total revenue this quarter?"
SELECT SUM(revenue) AS quarterly_revenue
FROM floranow_catalog.gold.mart_revenue
WHERE revenue_date >= date_trunc('quarter', current_date());

-- Define synonyms in the Genie Space UI:
--   "sales"    → revenue column
--   "income"   → revenue column
--   "AOV"      → avg_order_value column
--   "orders"   → orders_count column
--   "clients"  → dim_customers table

-- Define join paths:
--   dim_customers.customer_id = mart_sales.customer_id
--   dim_products.product_id   = mart_sales.product_id`,
  },
  {
    id: 'ai-c6',
    type: 'callout',
    variant: 'tip',
    text: 'Prioritize SQL expressions and verified answers over text instructions. Structured SQL definitions are more reliable than natural language guidance. Use text instructions only for behavior that cannot be expressed as SQL (e.g., "Ask for clarification when the time range is missing").',
  },
  { id: 'ai-d6', type: 'divider' },

  // ── 7. Genie Agent Mode — Multi-Step Research ────────────────
  {
    id: 'ai-h7',
    type: 'heading',
    level: 1,
    text: 'Genie Agent Mode — Multi-Step Research',
  },
  {
    id: 'ai-t7a',
    type: 'text',
    text: 'Agent Mode (Public Preview, March 2026) transforms Genie from a single-query SQL generator into a multi-step research analyst. Instead of answering with one SQL query, Agent Mode:\n\n1. Creates a research plan — breaks the question into hypotheses to test.\n2. Runs multiple SQL queries — gathers evidence from different tables and angles.\n3. Learns and iterates — adjusts its approach based on what each query reveals.\n4. Delivers a comprehensive report — with findings, citations, visualizations, and supporting tables. Exportable as PDF.',
  },
  {
    id: 'ai-h7b',
    type: 'heading',
    level: 2,
    text: 'Example: "Why Did UAE Revenue Drop Last Week?"',
  },
  {
    id: 'ai-t7b',
    type: 'text',
    text: 'Agent Mode research plan:\n• Step 1: Query mart_revenue for UAE last week vs. prior week → finds 18% drop.\n• Step 2: Break down by product category → discovers "Premium Roses" dropped 40%.\n• Step 3: Check mart_operations for delivery issues → finds 3-day supplier delay.\n• Step 4: Cross-reference dim_customers → identifies 5 large customers with zero orders.\n• Final report: "UAE revenue dropped 18% WoW, driven primarily by a 40% decline in Premium Roses. Root cause: supplier delivery delays averaging 3 days impacted fulfillment for 5 key accounts."\n\nA human analyst would take hours to do this investigation. Agent Mode does it in 30-120 seconds.',
  },
  {
    id: 'ai-cmp7',
    type: 'compare',
    leftTitle: 'Standard Genie',
    rightTitle: 'Agent Mode',
    items: [
      { old: 'Single SQL query per question', new: 'Multiple queries with iterative reasoning' },
      { old: 'Returns a table or chart', new: 'Returns a full research report with citations' },
      { old: 'Best for: "What was revenue last month?"', new: 'Best for: "Why did revenue drop and what should we do?"' },
      { old: 'Response time: 2-5 seconds', new: 'Response time: 30-120 seconds (multiple queries)' },
      { old: 'Available now (GA)', new: 'Public Preview — no additional cost during preview' },
    ],
  },
  {
    id: 'ai-c7',
    type: 'callout',
    variant: 'info',
    text: 'Agent Mode uses the same data and permissions as standard Genie — no separate setup needed. If your Genie Space is well-configured, Agent Mode works automatically. Enable it via the workspace admin previews page. Powered by Sonnet models, continuously evaluated for accuracy.',
  },
  { id: 'ai-d7', type: 'divider' },

  // ── 8. Genie Code — AI Dashboard Builder ─────────────────────
  {
    id: 'ai-h8',
    type: 'heading',
    level: 1,
    text: 'Genie Code — AI Dashboard Builder',
  },
  {
    id: 'ai-t8a',
    type: 'text',
    text: 'Genie Code is the AI-powered dashboard authoring tool. It works inside the dashboard editor as a side panel. Activate it by selecting the Agent toggle, then reference tables with @table_name syntax.',
  },
  {
    id: 'ai-cards8',
    type: 'card-grid',
    columns: 2,
    cards: [
      {
        emoji: '💬',
        title: 'Chat Mode',
        description: 'Describe what you want in natural language:\n"Create a revenue dashboard with monthly trends, top 10 customers, and regional breakdown with date and region filters."\n\nGenie Code generates SQL datasets, chart configurations, and layout. Best for building new dashboards from scratch.',
        accent: '#DCFCE7',
      },
      {
        emoji: '🤖',
        title: 'Agent Mode (Dashboard)',
        description: 'Upload screenshots of existing dashboards (e.g., from Looker Studio). Genie Code analyzes chart types, metrics, dimensions, and filters — then recreates the dashboard using your Gold tables.\n\nBest for migrating existing dashboards. Expect ~60-70% accuracy, remaining adjustment is faster than building from zero.',
        accent: '#FEF3C7',
      },
    ],
  },
  {
    id: 'ai-h8b',
    type: 'heading',
    level: 2,
    text: 'Migrating Looker Dashboards with Screenshots',
  },
  {
    id: 'ai-flow8',
    type: 'flow',
    steps: [
      { emoji: '📸', title: 'Screenshot Looker Dashboard', subtitle: 'Full page capture of each dashboard', color: '#FDE68A' },
      { emoji: '🤖', title: 'Open Genie Code Agent', subtitle: 'Toggle Agent Mode in dashboard editor', color: '#C4B5FD' },
      { emoji: '📤', title: 'Upload Screenshot', subtitle: '"Recreate using floranow_catalog.gold.*"', color: '#86EFAC' },
      { emoji: '🔍', title: 'AI Analyzes Layout', subtitle: 'Identifies chart types, metrics, filters', color: '#7DD3FC' },
      { emoji: '📊', title: 'Generates Dashboard', subtitle: 'SQL datasets + charts + layout', color: '#FCA5A5' },
      { emoji: '✅', title: 'Review & Publish', subtitle: 'Approve each phase, adjust, publish', color: '#F9A8D4' },
    ],
  },
  {
    id: 'ai-t8c',
    type: 'text',
    text: 'Agent Mode operates through an interactive approval process — it creates a step-by-step plan, pauses to request approval before modifying elements, and lets you Continue or Reject each phase. It respects Unity Catalog permissions.\n\nFor the 11 Looker Studio dashboards: screenshot each one, upload to Genie Code Agent, and get a functional first draft. This does not produce a pixel-perfect copy, but saves hours compared to rebuilding from scratch. Typically needs 20-30% manual adjustment for layout and fine-tuning.',
  },
  {
    id: 'ai-c8',
    type: 'callout',
    variant: 'tip',
    text: 'Requirements: "Partner-powered AI features" and "Genie Code for dashboard authoring" preview must be enabled in workspace settings. See BI page for dashboard caching, scheduled refresh, and viewer access details.',
  },
  { id: 'ai-d8', type: 'divider' },

  // ── 9. Genie API — Custom Integrations ───────────────────────
  {
    id: 'ai-h9',
    type: 'heading',
    level: 1,
    text: 'Genie API — Custom Integrations',
  },
  {
    id: 'ai-t9a',
    type: 'text',
    text: 'The Genie API (GA, April 2026) allows embedding Genie capabilities into external applications — Slack bots, internal portals, or custom chatbots.',
  },
  {
    id: 'ai-cards9',
    type: 'card-grid',
    columns: 2,
    cards: [
      {
        emoji: '💬',
        title: 'Conversation API',
        description: 'Embed natural language data querying in chatbots, Slack bots, or internal portals. Stateful conversations support follow-up questions. Auth via OAuth U2M (users) or OAuth M2M (service principals). Row-level security applies automatically per user.',
        accent: '#DCFCE7',
      },
      {
        emoji: '⚙️',
        title: 'Management API',
        description: 'Programmatically create, configure, and deploy Genie Spaces across workspaces. Use for CI/CD pipelines and automated space management. Auth via OAuth M2M for automation. Attribute-based access control (ABAC) for multi-tenant apps.',
        accent: '#DBEAFE',
      },
    ],
  },
  {
    id: 'ai-h9b',
    type: 'heading',
    level: 2,
    text: 'Multi-Agent Systems',
  },
  {
    id: 'ai-t9b',
    type: 'text',
    text: 'Databricks supports compound AI systems where specialized agents work together:\n\n• A Genie agent handles structured data queries (SQL on Gold tables).\n• A RAG agent handles unstructured data (PDF documents, Confluence pages, knowledge bases).\n• An orchestrator routes questions to the right agent and combines answers.\n\nExample: A Slack bot that answers "What was revenue last month?" (routed to Genie) and "What does our return policy say?" (routed to RAG) in the same conversation. Agents share context, so the orchestrator can combine insights from both sources.\n\nThis is Phase 4 in the Floranow AI roadmap — after Genie Spaces are mature and well-tested.',
  },
  { id: 'ai-d9', type: 'divider' },

  // ── 10. Genie Guardrails & Governance ────────────────────────
  {
    id: 'ai-h10',
    type: 'heading',
    level: 1,
    text: 'Genie Guardrails & Governance',
  },
  {
    id: 'ai-cards10',
    type: 'card-grid',
    columns: 2,
    cards: [
      {
        emoji: '🔒',
        title: 'Unity Catalog Governance',
        description: 'Genie ONLY queries tables the user has SELECT access to. Row filters and column masks apply automatically. If a user can\'t see KSA data in a dashboard, Genie won\'t show it either. No data leakage is possible through natural language queries.',
        accent: '#DCFCE7',
      },
      {
        emoji: '📋',
        title: 'Approved Instructions',
        description: 'Admins add rules like "Always filter by active customers unless asked otherwise" or "Revenue means SUM(revenue) from mart_revenue, never from raw Bronze tables." Genie follows these instructions for every query it generates.',
        accent: '#FEF3C7',
      },
      {
        emoji: '✅',
        title: 'Verified Answers',
        description: 'Mark specific question→SQL pairs as "verified." When a user asks a matching question, Genie returns the verified SQL verbatim — guaranteed accuracy for critical metrics like "What\'s total revenue this quarter?" Zero hallucination risk.',
        accent: '#EDE9FE',
      },
      {
        emoji: '🚦',
        title: 'Rate Limits & Monitoring',
        description: '20 questions/minute per workspace (UI), 5/minute via API. Up to 30 tables per Genie Space. 10,000 conversations per space. Monitor tab shows all user questions + generated SQL. Audit logs available for compliance.',
        accent: '#DBEAFE',
      },
    ],
  },
  { id: 'ai-d10', type: 'divider' },

  // ── 11. Mosaic AI — Machine Learning Platform ────────────────
  {
    id: 'ai-h11',
    type: 'heading',
    level: 1,
    text: 'Mosaic AI — Machine Learning Platform',
  },
  {
    id: 'ai-t11a',
    type: 'text',
    text: 'Mosaic AI is Databricks\' unified ML platform — replacing Vertex AI in Floranow\'s stack. All governed by Unity Catalog: models are catalog objects with full lineage to training data, features, and serving endpoints.',
  },
  {
    id: 'ai-cards11',
    type: 'card-grid',
    columns: 2,
    cards: [
      {
        emoji: '🤖',
        title: 'AutoML',
        description: 'Automatic model selection and hyperparameter tuning. Point at a Gold table, specify the target column, and AutoML trains dozens of models (XGBoost, LightGBM, DeepAR for time series). Ranks by metric. Zero-code ML — generates a notebook you can inspect and customize.',
        accent: '#DCFCE7',
      },
      {
        emoji: '📋',
        title: 'MLflow',
        description: 'Experiment tracking: every run, every hyperparameter, every metric logged and comparable. Model Registry: version, stage (Staging → Production), approve with full lineage back to training data. Unity Catalog integration: models are governed catalog objects.',
        accent: '#DBEAFE',
      },
      {
        emoji: '📦',
        title: 'Feature Store',
        description: 'Centralized feature definitions shared across training and inference. Point-in-time lookups prevent data leakage. Features are Unity Catalog objects with lineage. Online features for real-time serving via Model Serving endpoints.',
        accent: '#FEF3C7',
      },
      {
        emoji: '🚀',
        title: 'Model Serving',
        description: 'Deploy models as serverless REST endpoints with auto-scaling. Pay only for inference time — scales to zero when idle. Supports custom models (scikit-learn, XGBoost, PyTorch), foundation models (Llama), and external models (OpenAI, Anthropic). A/B testing and canary deployments built in.',
        accent: '#EDE9FE',
      },
    ],
  },
  {
    id: 'ai-h11b',
    type: 'heading',
    level: 2,
    text: 'ML Pipeline Architecture',
  },
  {
    id: 'ai-flow11',
    type: 'flow',
    steps: [
      { emoji: '🥇', title: 'Gold Tables', subtitle: 'Curated training data from Gold layer', color: '#FDE68A' },
      { emoji: '🔧', title: 'Feature Engineering', subtitle: 'SQL or Python transformations', color: '#C4B5FD' },
      { emoji: '🧪', title: 'AutoML / Custom Training', subtitle: 'DeepAR, XGBoost, LightGBM, Prophet', color: '#86EFAC' },
      { emoji: '📋', title: 'MLflow Tracking', subtitle: 'Runs, metrics, artifacts, comparisons', color: '#7DD3FC' },
      { emoji: '📦', title: 'Model Registry', subtitle: 'Version, stage, approve (Unity Catalog)', color: '#FCA5A5' },
      { emoji: '🚀', title: 'Model Serving', subtitle: 'Serverless REST → predictions → mart_forecasts', color: '#F9A8D4' },
    ],
  },
  {
    id: 'ai-h11c',
    type: 'heading',
    level: 2,
    text: 'First ML Use Case: Demand Forecasting',
  },
  {
    id: 'ai-t11c',
    type: 'text',
    text: 'Predict weekly demand by product category and region:\n\n• Training data: mart_sales history (12+ months of orders by product × region × week).\n• Model: AutoML with DeepAR — a deep neural network for time series that delivers up to 50% better prediction error rate vs. baseline statistical models.\n• Output: Predictions written to floranow_catalog.gold.mart_forecasts — queryable by dashboards and Genie like any other Gold table.\n• Value: Procurement team sees "next week\'s predicted demand by product" in dashboards. Operations team plans logistics based on forecasted volume. Genie users ask "What\'s the demand forecast for Premium Roses next week?"',
  },
  { id: 'ai-d11', type: 'divider' },

  // ── 12. AI Use Cases — Phased Rollout ────────────────────────
  {
    id: 'ai-h12',
    type: 'heading',
    level: 1,
    text: 'AI Use Cases — Phased Rollout',
  },
  {
    id: 'ai-t12',
    type: 'text',
    text: 'AI adoption in four phases, starting with quick wins that require zero ML expertise:',
  },
  {
    id: 'ai-cards12',
    type: 'card-grid',
    columns: 2,
    cards: [
      {
        emoji: '💬',
        title: 'Phase 1: Genie Spaces (Week 4)',
        description: 'Zero ML required. Set up 3 Genie Spaces (Sales, Operations, Supply). Add table metadata and column descriptions. Share with analysts and managers.\n\nImmediate value: self-service analytics from day one. Reduces analyst ad-hoc workload by 60-80% (Databricks customer benchmarks). Enable Agent Mode for complex investigative questions.',
        accent: '#DCFCE7',
      },
      {
        emoji: '📈',
        title: 'Phase 2: Demand Forecasting (Month 2-3)',
        description: 'AutoML on mart_sales history with DeepAR. MLflow experiment tracking for model comparison. Feature engineering on Gold tables.\n\nModel registered in Unity Catalog. Predictions served via Model Serving endpoint and written back to mart_forecasts (Gold). Procurement and operations consume via dashboards and Genie.',
        accent: '#FEF3C7',
      },
      {
        emoji: '⚠️',
        title: 'Phase 3: Anomaly Detection (Month 3-4)',
        description: 'Monitor pipeline health and business metrics. Alert on revenue drops >20% day-over-day. Alert on data freshness violations (dbt run late or failed).\n\nBuilt with Mosaic AI + Lakeflow Jobs scheduled checks. Data quality agent validates dbt runs and routes failures to owners. Notifications via Slack webhook.',
        accent: '#DBEAFE',
      },
      {
        emoji: '🤖',
        title: 'Phase 4: AI Agents (Month 4+)',
        description: 'Compound AI systems: Slack chatbot using Genie API for data queries + RAG agent for document questions. Orchestrator routes to the right agent.\n\nEmbedded in Slack or internal tools. Multi-agent architecture where Genie handles "What was revenue?" and RAG handles "What does our return policy say?" in the same conversation.',
        accent: '#EDE9FE',
      },
    ],
  },
  { id: 'ai-d12', type: 'divider' },

  // ── 13. AI Readiness Checklist + Cost + Cross-References ─────
  {
    id: 'ai-h13',
    type: 'heading',
    level: 1,
    text: 'AI Readiness Checklist',
  },
  {
    id: 'ai-tbl13',
    type: 'table',
    headers: ['Capability', 'Data Requirement', 'Compute', 'Timeline', 'Prerequisite'],
    rows: [
      ['Genie Spaces', 'Gold tables with descriptions', 'Pro/Serverless SQL Warehouse', 'Week 4', 'Unity Catalog, table metadata'],
      ['Agent Mode', 'Well-configured Genie Space', 'Same SQL Warehouse', 'Week 4 (enable preview)', 'Genie Spaces set up'],
      ['Genie Code', 'Looker dashboard screenshots', 'Dashboard editor', 'Week 4', 'Partner-powered AI preview'],
      ['Demand Forecasting', '12+ months historical orders', 'Serverless ML Compute', 'Month 2-3', 'Clean Gold tables, MLflow'],
      ['Anomaly Detection', '30+ days baseline metrics', 'Serverless Jobs', 'Month 3-4', 'Stable pipeline, monitoring'],
      ['AI Agents / Chatbot', 'Genie API + verified answers', 'Model Serving + SQL Warehouse', 'Month 4+', 'Mature Genie Spaces'],
    ],
  },
  {
    id: 'ai-h13b',
    type: 'heading',
    level: 2,
    text: 'Cost Implications',
  },
  {
    id: 'ai-tbl13b',
    type: 'table',
    headers: ['Component', 'Cost Model', 'Floranow Impact'],
    rows: [
      ['Genie Spaces', 'Queries run on SQL Warehouse — same DBU cost as dashboard queries', 'Minimal — only 2 analysts + select managers using Genie'],
      ['Agent Mode', 'No additional cost during Public Preview — warehouse DBU only', 'Free during preview, same warehouse as dashboards'],
      ['Genie Code', 'No additional cost — uses dashboard editor', 'Free for dashboard creation/migration'],
      ['AutoML Training', 'Serverless ML Compute — pay-per-use during training runs', 'One-time training cost per model, then periodic retraining'],
      ['Model Serving', 'Serverless endpoints — scales to zero when idle, pay per inference', 'Low cost: demand forecast requests are low-volume batch'],
      ['Genie API', 'SQL Warehouse DBU per query', 'Depends on Phase 4 usage volume'],
    ],
  },
  {
    id: 'ai-c13',
    type: 'callout',
    variant: 'tip',
    text: 'The primary AI cost is the SQL Warehouse compute that\'s already budgeted for dashboards. Genie queries and Agent Mode research run on the same warehouse. AutoML training is a periodic one-time cost. Model Serving scales to zero when idle. Phase 1 (Genie) adds negligible incremental cost.',
  },
  { id: 'ai-d13', type: 'divider' },
  {
    id: 'ai-cref',
    type: 'callout',
    variant: 'info',
    text: 'Cross-References: Dashboard caching, Metric Views, and viewer access model in BI page. Gold tables built by dbt (dbt page). SQL Warehouse sizing in Warehousing page. Ingestion pipelines in Ingestion page. Full pipeline timing in E2E Flow page. Genie setup is Week 4 in Roadmap.',
  },
]

export default function Ai() {
  const { blocks, updateBlock, addBlock, removeBlock, saveStatus, forceSave } = usePageState('page:ai', DEFAULT_BLOCKS)

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="pl-10">
        <BlockEditor blocks={blocks} updateBlock={updateBlock} addBlock={addBlock} removeBlock={removeBlock} saveStatus={saveStatus} onSave={forceSave} />
      </div>
    </div>
  )
}
