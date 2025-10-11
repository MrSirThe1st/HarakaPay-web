// src/app/(dashboard)/school/fees/[templateId]/page.tsx
import { FeeTemplateDetailView } from './components/FeeTemplateDetailView';

interface FeeTemplatePageProps {
  params: {
    templateId: string;
  };
}

export default function FeeTemplatePage({ params }: FeeTemplatePageProps) {
  return <FeeTemplateDetailView templateId={params.templateId} />;
}

