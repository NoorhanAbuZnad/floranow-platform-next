import AppShell from '@/components/AppShell'

export default async function SlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <AppShell initialSlug={slug} />
}
