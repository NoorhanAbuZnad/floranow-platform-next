'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { PagesProvider, usePagesContext } from '../lib/PagesContext'
import Layout from './Layout'
import DynamicPage from './DynamicPage'

import MigrationContent from '../page-content/Migration'
import IngestionContent from '../page-content/Ingestion'
import WarehousingContent from '../page-content/Warehousing'
import DbtContent from '../page-content/Dbt'
import BiContent from '../page-content/Bi'
import AiContent from '../page-content/Ai'
import EndToEndContent from '../page-content/EndToEnd'
import RoadmapContent from '../page-content/Roadmap'
import BestPracticesContent from '../page-content/BestPractices'

const DEFAULT_CONTENT: Record<string, React.ReactNode> = {
  migration: <MigrationContent />,
  ingestion: <IngestionContent />,
  warehousing: <WarehousingContent />,
  dbt: <DbtContent />,
  bi: <BiContent />,
  ai: <AiContent />,
  e2e: <EndToEndContent />,
  roadmap: <RoadmapContent />,
  'best-practices': <BestPracticesContent />,
}

function AppContent({ initialSlug }: { initialSlug: string }) {
  const { pages, dbLoaded } = usePagesContext()
  const pathname = usePathname()
  const router = useRouter()

  const slug = (pathname ?? '').replace('/', '') || initialSlug
  const page = pages.find(p => p.slug === slug)

  useEffect(() => {
    if (dbLoaded && !page && pages.length > 0) {
      router.replace(`/${pages[0].slug}`)
    }
  }, [dbLoaded, page, pages, router])

  if (!page) return null

  return (
    <Layout>
      <DynamicPage
        page={page}
        defaultContent={DEFAULT_CONTENT[page.id]}
      />
    </Layout>
  )
}

export default function AppShell({ initialSlug }: { initialSlug: string }) {
  return (
    <PagesProvider>
      <AppContent initialSlug={initialSlug} />
    </PagesProvider>
  )
}
