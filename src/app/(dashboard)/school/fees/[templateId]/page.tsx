// src/app/(dashboard)/school/fees/[templateId]/page.tsx
import { FeeStructureDetailView } from './components/FeeTemplateDetailView';

interface FeeTemplatePageProps {
  params: Promise<{
    templateId: string;
  }>;
}

export default async function FeeTemplatePage({ params }: FeeTemplatePageProps) {
  const { templateId } = await params;
  return <FeeStructureDetailView templateId={templateId} />;
}

