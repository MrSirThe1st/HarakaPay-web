import SchoolMessages from '@/components/admin/communications/SchoolMessages';

export const dynamic = 'force-dynamic';

export default function AdminCommunicationsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Support Tickets</h1>
        <p className="text-gray-600 mt-2">
          View and manage support tickets from schools
        </p>
      </div>

      <SchoolMessages />
    </div>
  );
}