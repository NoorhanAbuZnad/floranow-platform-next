'use client'
import BlockEditor from '../components/BlockEditor'
import { usePageState } from '../lib/usePageState'
import type { Block } from '../lib/blocks'

const DEFAULT_BLOCKS: Block[] = [
  {
    id: 'rm-h0',
    type: 'heading',
    level: 1,
    text: 'Implementation Overview',
  },
  {
    id: 'rm-t0',
    type: 'text',
    text: '4-week implementation following Path B (Ingestion First). 2-person team: Sr. Analyst (data architecture, ingestion, security) + Jr. Analyst (dbt migration, dashboards, documentation). Databricks Solutions Engineer provides guidance in Week 1.\n\nGoal: fully operational Databricks Lakehouse replacing Hevo, BigQuery, dbt Cloud, and Looker Studio.',
  },
  { id: 'rm-d0', type: 'divider' },
  {
    id: 'rm-h-timeline',
    type: 'heading',
    level: 2,
    text: 'Timeline',
  },
  {
    id: 'rm-flow-timeline',
    type: 'flow',
    steps: [
      { emoji: '🏗️', title: 'Week 1', subtitle: 'Foundation & Setup', color: '#6366F1' },
      { emoji: '📥', title: 'Week 2', subtitle: 'Ingestion Pipelines', color: '#22C55E' },
      { emoji: '🔄', title: 'Week 3', subtitle: 'dbt Migration', color: '#F59E0B' },
      { emoji: '📊', title: 'Week 4', subtitle: 'BI, Genie & Launch', color: '#EC4899' },
    ],
  },
  { id: 'rm-d1', type: 'divider' },
  {
    id: 'rm-h1',
    type: 'heading',
    level: 1,
    text: 'Week 1 — Foundation & Setup',
  },
  {
    id: 'rm-t1',
    type: 'text',
    text: 'Provision infrastructure, security, and development environment.',
  },
  {
    id: 'rm-tbl1',
    type: 'table',
    headers: ['#', 'Task', 'Description', 'Owner', 'Deliverable', 'Duration'],
    rows: [
      ['1.1', 'Provision Databricks Workspace', 'AWS eu-central-1, Premium tier, link AWS account', 'Sr. Analyst + Databricks SE', 'Running workspace with admin access', '2 hours'],
      ['1.2', 'Enable Unity Catalog', 'Create metastore, assign to workspace, configure storage', 'Sr. Analyst', 'Unity Catalog active with S3 root storage', '2 hours'],
      ['1.3', 'Create Catalog & Schemas', 'CREATE CATALOG floranow_catalog; CREATE SCHEMA bronze/silver/gold', 'Sr. Analyst', 'Three-level namespace ready', '1 hour'],
      ['1.4', 'Create SQL Warehouse', 'X-Small Serverless, Photon, 10 min auto-suspend, max 2 clusters', 'Sr. Analyst', 'Warehouse running, HTTP path noted', '30 min'],
      ['1.5', 'Security Setup', 'Service principal for dbt (floranow-dbt-sp), personal tokens, IP allowlist, Secrets scope for DB passwords', 'Sr. Analyst', 'Authentication working, secrets stored', '3 hours'],
      ['1.6', 'GitHub Repository', 'Create floranow-dbt repo, branch protection (main), CI workflow stub with GitHub Actions', 'Jr. Analyst', 'Repo with README, .gitignore, CI file', '2 hours'],
      ['1.7', 'Network Connectivity', 'VPC peering or PrivateLink to RDS PostgreSQL + MongoDB, security group rules', 'Sr. Analyst + DevOps', 'Databricks can reach all source databases', '4 hours'],
      ['1.8', 'MongoDB Connector', 'Upload mongo-spark-connector_2.12:10.4.0 JAR to cluster libraries, test connectivity', 'Sr. Analyst', 'Spark can read from MongoDB', '1 hour'],
    ],
  },
  {
    id: 'rm-call1',
    type: 'callout',
    variant: 'tip',
    text: 'Week 1 Success Criteria — Workspace running, Unity Catalog active with floranow_catalog (bronze/silver/gold schemas), SQL Warehouse responding, all source databases reachable from Databricks, GitHub repo initialized, service principal authenticated.',
  },
  { id: 'rm-d2', type: 'divider' },
  {
    id: 'rm-h2',
    type: 'heading',
    level: 1,
    text: 'Week 2 — Ingestion Pipelines',
  },
  {
    id: 'rm-t2',
    type: 'text',
    text: 'Build and validate all ingestion pipelines. Data starts flowing from source systems into Bronze streaming tables.',
  },
  {
    id: 'rm-tbl2',
    type: 'table',
    headers: ['#', 'Task', 'Description', 'Owner', 'Deliverable', 'Duration'],
    rows: [
      ['2.1', 'PostgreSQL CDC Setup', 'Configure wal_level=logical, create replication user, set REPLICA IDENTITY on all tables', 'Sr. Analyst', 'PostgreSQL ready for logical replication', '3 hours'],
      ['2.2', 'Lakeflow Connect — ERP', 'CREATE CONNECTION, configure pipeline for ERP database (170 GB), initial snapshot + continuous CDC', 'Sr. Analyst', 'floranow_catalog.bronze.erp_* streaming tables populated', '4 hours'],
      ['2.3', 'Lakeflow Connect — MP', 'Same for MP database (35 GB)', 'Sr. Analyst', 'floranow_catalog.bronze.mp_* populated', '2 hours'],
      ['2.4', 'Lakeflow Connect — Vendor', 'Same for Vendor database (48 MB)', 'Jr. Analyst', 'floranow_catalog.bronze.vendor_* populated', '1 hour'],
      ['2.5', 'MongoDB Pipeline', 'Spark Structured Streaming notebook, initial full load + change stream, VARIANT storage', 'Sr. Analyst', 'floranow_catalog.bronze.mongodb_app_data populated', '4 hours'],
      ['2.6', 'Validate Bronze vs Source', 'Compare row counts, sample checksums, NULL rates between source and Bronze for all 4 databases', 'Both', 'Validation report: 100% match', '4 hours'],
      ['2.7', 'Run Parallel with Hevo', 'Keep Hevo running for 1 week alongside Lakeflow, compare daily', 'Sr. Analyst', 'Parallel validation log', 'Ongoing (1 week)'],
      ['2.8', 'Monitoring & Alerting', 'Set up data freshness alerts, pipeline failure notifications (email + Slack)', 'Jr. Analyst', 'Alerting configured, tested', '2 hours'],
    ],
  },
  {
    id: 'rm-call2',
    type: 'callout',
    variant: 'tip',
    text: 'Week 2 Success Criteria — All 4 sources ingesting into Bronze streaming tables. Row counts match source within 0.1%. Hevo running in parallel for validation. Freshness alerts active. Pipelines successful for 24+ consecutive hours.',
  },
  { id: 'rm-d3', type: 'divider' },
  {
    id: 'rm-h3',
    type: 'heading',
    level: 1,
    text: 'Week 3 — dbt Migration',
  },
  {
    id: 'rm-t3',
    type: 'text',
    text: 'Migrate the existing dbt project from BigQuery to Databricks. Convert ~65 SQL models, validate outputs match the old platform.',
  },
  {
    id: 'rm-tbl3',
    type: 'table',
    headers: ['#', 'Task', 'Description', 'Owner', 'Deliverable', 'Duration'],
    rows: [
      ['3.1', 'Install dbt-databricks', 'pip install dbt-databricks>=1.8.0, remove dbt-bigquery', 'Jr. Analyst', 'dbt --version shows dbt-databricks', '30 min'],
      ['3.2', 'Configure profiles.yml', 'Databricks host, HTTP path, catalog, schema, service principal token', 'Jr. Analyst', 'dbt debug passes', '1 hour'],
      ['3.3', 'Update dbt_project.yml', 'Materializations (Silver=view, Gold=table), schema routing, vars', 'Jr. Analyst', 'Project config ready', '1 hour'],
      ['3.4', 'Convert SQL Models (~65)', 'Replace BigQuery functions with Databricks equivalents (see dbt page conversion guide), use LLM-assisted rewriting', 'Both', 'All 65 models compile (dbt compile)', '8 hours'],
      ['3.5', 'Run dbt in dev', 'dbt run --target dev, fix errors iteratively', 'Jr. Analyst', 'All models build successfully in dev', '4 hours'],
      ['3.6', 'Run dbt test', 'dbt test --target dev, fix failing tests', 'Jr. Analyst', 'All tests pass (not_null, unique, relationships)', '3 hours'],
      ['3.7', 'Cross-Validate vs BigQuery', 'Compare mart_revenue, mart_sales, dim_customers row counts and aggregates between BigQuery and Databricks', 'Sr. Analyst', 'Validation report: 100% match on all marts', '4 hours'],
      ['3.8', 'Lakeflow Job Setup', 'Configure hourly dbt run in Lakeflow Jobs, email on failure, service principal auth', 'Sr. Analyst', 'Hourly job running, first 3 successful runs verified', '2 hours'],
      ['3.9', 'CI Pipeline', 'GitHub Actions: on PR → dbt run + dbt test on dev schema → report results', 'Jr. Analyst', 'CI passing on test PR', '3 hours'],
    ],
  },
  {
    id: 'rm-call3',
    type: 'callout',
    variant: 'tip',
    text: 'Week 3 Success Criteria — All ~65 dbt models build on Databricks. Silver views and Gold tables populated. dbt test passes with 0 failures. Gold outputs match BigQuery within 1% variance. Hourly dbt job orchestrated via Lakeflow Jobs. CI pipeline blocks bad PRs.',
  },
  { id: 'rm-d4', type: 'divider' },
  {
    id: 'rm-h4',
    type: 'heading',
    level: 1,
    text: 'Week 4 — BI, Genie & Launch',
  },
  {
    id: 'rm-t4',
    type: 'text',
    text: 'Rebuild dashboards, configure Genie Spaces, apply security and performance optimizations, run UAT, and decommission old tools.',
  },
  {
    id: 'rm-tbl4',
    type: 'table',
    headers: ['#', 'Task', 'Description', 'Owner', 'Deliverable', 'Duration'],
    rows: [
      ['4.1', 'Rebuild P1 Dashboards (5)', 'Executive Revenue, Sales Performance, Operations, Customer Analytics, Product Performance in AI/BI', 'Both', '5 P1 dashboards live, validated by stakeholders', '8 hours'],
      ['4.2', 'Rebuild P2 Dashboards (4)', 'Supply Chain, Financial Summary, Fulfillment, Inventory in AI/BI', 'Jr. Analyst', '4 P2 dashboards live', '6 hours'],
      ['4.3', 'Rebuild P3 Dashboards (2)', 'Marketing ROI, Vendor Scorecard', 'Jr. Analyst', '2 P3 dashboards live', '4 hours'],
      ['4.4', 'Genie Spaces (3)', 'Create Sales, Operations, Supply spaces. Add table metadata, sample questions, verified answers', 'Sr. Analyst', '3 Genie Spaces shared with pilot users', '4 hours'],
      ['4.5', 'Row-Level Security', 'Create region_filter function, apply to mart_revenue/mart_sales/mart_operations. Create email mask for dim_customers', 'Sr. Analyst', 'RLS tested and verified', '3 hours'],
      ['4.6', 'Liquid Clustering', 'Apply CLUSTER BY to all Gold tables, run OPTIMIZE, enable Predictive Optimization', 'Sr. Analyst', 'All Gold tables clustered, query performance validated', '2 hours'],
      ['4.7', 'UAT & Pilot', 'Share with 5–10 pilot users, collect feedback, iterate on dashboards and Genie spaces', 'Both', 'UAT sign-off from pilot users', '4 hours'],
      ['4.8', 'Decommission Old Tools', 'Retire Hevo (cancel subscription), turn off BigQuery access, cancel dbt Cloud, schedule Looker sunset', 'Sr. Analyst', 'Single Databricks bill, old tools deactivated', '2 hours'],
      ['4.9', 'Documentation', 'Runbook for each pipeline, architecture diagram, onboarding guide for new team members', 'Jr. Analyst', 'Documentation in Confluence/Notion, linked from Databricks workspace', '4 hours'],
    ],
  },
  {
    id: 'rm-call4',
    type: 'callout',
    variant: 'tip',
    text: 'Week 4 Success Criteria — 11 dashboards live and matching historical Looker output. 3 Genie Spaces answering NL questions accurately. Row-level security verified. Performance benchmarks meet or beat BigQuery. Pilot users approved. Old tools decommissioned (Hevo stopped, BigQuery read-only, Looker disabled).',
  },
  { id: 'rm-d5', type: 'divider' },
  {
    id: 'rm-h-deps',
    type: 'heading',
    level: 1,
    text: 'Dependencies',
  },
  {
    id: 'rm-tbl-deps',
    type: 'table',
    headers: ['Dependency', 'Blocks', 'Risk If Delayed'],
    rows: [
      ['Workspace provisioning', 'Everything', 'Critical — no progress possible'],
      ['Network connectivity (VPC peering)', 'Ingestion', 'High — cannot reach source databases'],
      ['PostgreSQL WAL configuration', 'Lakeflow Connect CDC', 'High — requires RDS parameter group change + reboot'],
      ['MongoDB replica set', 'Change Streams', 'Medium — may need Atlas migration from standalone'],
      ['Hevo parallel validation', 'Hevo retirement', 'Medium — extend parallel by 1 week if mismatch found'],
      ['BigQuery cross-validation', 'BigQuery retirement', 'Medium — keep BigQuery read access until 100% match'],
      ['Stakeholder dashboard UAT', 'Looker retirement', 'Low — can extend Looker by 1–2 weeks if needed'],
    ],
  },
  { id: 'rm-d6', type: 'divider' },
  {
    id: 'rm-h-post',
    type: 'heading',
    level: 1,
    text: 'Post-Launch (Weeks 5–8)',
  },
  {
    id: 'rm-t-post',
    type: 'text',
    text: 'The first 4 weeks deliver an MVP platform. Weeks 5–8 focus on stability, optimization, and AI enablement.',
  },
  {
    id: 'rm-cards-post',
    type: 'card-grid',
    columns: 2,
    cards: [
      {
        emoji: '🔧',
        title: 'Weeks 5–6: Stability & Optimization',
        description: 'Monitor pipeline reliability. Tune Liquid Clustering keys based on actual query patterns. Optimize slow queries. Adjust auto-suspend timing. Expand rollout from pilot to all 60–70 viewers.',
        accent: '#6366F1',
      },
      {
        emoji: '🤖',
        title: 'Weeks 7–8: AI Enablement',
        description: 'Set up MLflow experiments. Build first demand forecasting model on mart_sales. Expand Genie Spaces based on user feedback. Explore Agent Mode for complex questions.',
        accent: '#EC4899',
      },
    ],
  },
]

export default function Roadmap() {
  const { blocks, updateBlock, addBlock, removeBlock, saveStatus, forceSave } = usePageState('page:roadmap', DEFAULT_BLOCKS)

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="pl-10">
        <BlockEditor blocks={blocks} updateBlock={updateBlock} addBlock={addBlock} removeBlock={removeBlock} saveStatus={saveStatus} onSave={forceSave} />
      </div>
    </div>
  )
}
