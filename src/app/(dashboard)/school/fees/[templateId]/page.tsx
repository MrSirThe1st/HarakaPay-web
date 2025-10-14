// src/app/(dashboard)/school/fees/[templateId]/page.tsx
import { FeeTemplateDetailView } from './components/FeeTemplateDetailView';

interface FeeTemplatePageProps {
  params: Promise<{
    templateId: string;
  }>;
}

export default async function FeeTemplatePage({ params }: FeeTemplatePageProps) {
  const { templateId } = await params;
  return <FeeTemplateDetailView templateId={templateId} />;
}

