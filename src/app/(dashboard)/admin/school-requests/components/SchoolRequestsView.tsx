"use client";

import React, { useState, useEffect } from "react";
import { FileCheck, Search, Filter, Eye, Edit } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface RegistrationRequest {
  id: string;
  school_name: string;
  contact_person_name: string;
  contact_person_email: string;
  status: "pending" | "in_progress" | "approved" | "rejected";
  created_at: string;
  school_address: string;
  registration_number: string;
  school_email: string;
  contact_person_phone: string | null;
  school_size: number | null;
  existing_system: string | null;
  has_mpesa_account: boolean;
  fee_schedules: Record<string, unknown>;
  school_levels: string[];
  grade_levels: string[];
  admin_notes: string | null;
  reviewed_by: string | null;
}

export function SchoolRequestsView() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<RegistrationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<RegistrationRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, searchQuery, statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/school-registration-requests");
      const result = await response.json();

      if (result.success) {
        setRequests(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = requests;

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.school_name.toLowerCase().includes(query) ||
          req.contact_person_name.toLowerCase().includes(query) ||
          req.contact_person_email.toLowerCase().includes(query)
      );
    }

    setFilteredRequests(filtered);
  };

  const updateRequestStatus = async (id: string, status: string, notes?: string) => {
    try {
      const response = await fetch(`/api/admin/school-registration-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, admin_notes: notes }),
      });

      const result = await response.json();

      if (result.success) {
        fetchRequests();
        setShowDetailModal(false);
        setSelectedRequest(null);
      }
    } catch (error) {
      console.error("Error updating request status:", error);
    }
  };

  const openDetailModal = (request: RegistrationRequest) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClasses[status] || statusClasses.pending}`}>
        {t(status.replace("_", " ").toUpperCase())}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("School Registration Requests")}</h1>
          <p className="text-gray-600 mt-1">{t("Review and manage school registration requests")}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t("Search by school name, contact name, or email")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{t("All Statuses")}</option>
              <option value="pending">{t("Pending")}</option>
              <option value="in_progress">{t("In Progress")}</option>
              <option value="approved">{t("Approved")}</option>
              <option value="rejected">{t("Rejected")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("School Name")}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("Contact Person")}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("Date Submitted")}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("Status")}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("Actions")}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    {t("No registration requests found")}
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{request.school_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.contact_person_name}</div>
                      <div className="text-sm text-gray-500">{request.contact_person_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(request.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => openDetailModal(request)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        {t("View")}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <SchoolRequestDetailModal
          request={selectedRequest}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedRequest(null);
          }}
          onStatusUpdate={updateRequestStatus}
        />
      )}
    </div>
  );
}

// Detail Modal Component
function SchoolRequestDetailModal({
  request,
  onClose,
  onStatusUpdate,
}: {
  request: RegistrationRequest;
  onClose: () => void;
  onStatusUpdate: (id: string, status: string, notes?: string) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [newStatus, setNewStatus] = useState(request.status);
  const [adminNotes, setAdminNotes] = useState(request.admin_notes || "");

  const handleUpdateStatus = async () => {
    await onStatusUpdate(request.id, newStatus, adminNotes);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{request.school_name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* School Information */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("School Information")}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">{t("School Name")}</label>
                <p className="text-gray-900">{request.school_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">{t("Registration Number")}</label>
                <p className="text-gray-900">{request.registration_number}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">{t("School Email")}</label>
                <p className="text-gray-900">{request.school_email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">{t("School Size")}</label>
                <p className="text-gray-900">{request.school_size || "N/A"}</p>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-500">{t("School Address")}</label>
                <p className="text-gray-900">{request.school_address}</p>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("Contact Information")}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">{t("Contact Person")}</label>
                <p className="text-gray-900">{request.contact_person_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">{t("Contact Email")}</label>
                <p className="text-gray-900">{request.contact_person_email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">{t("Contact Phone")}</label>
                <p className="text-gray-900">{request.contact_person_phone || "N/A"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">{t("M-Pesa Account")}</label>
                <p className="text-gray-900">{request.has_mpesa_account ? t("Yes") : t("No")}</p>
              </div>
            </div>
          </section>

          {/* Current Systems */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("Current Systems")}</h3>
            <div>
              <label className="block text-sm font-medium text-gray-500">{t("Existing System")}</label>
              <p className="text-gray-900">{request.existing_system || "N/A"}</p>
            </div>
          </section>

          {/* Fee Schedules */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("Fee Schedules")}</h3>
            <div className="space-y-2">
              {Object.entries(request.fee_schedules || {}).map(([key, value]) => {
                // Convert value to a displayable string
                let displayValue: string;
                if (value === null || value === undefined) {
                  displayValue = t("No");
                } else if (typeof value === 'boolean') {
                  displayValue = value ? t("Yes") : t("No");
                } else if (typeof value === 'object') {
                  displayValue = JSON.stringify(value);
                } else {
                  displayValue = String(value);
                }
                
                return (
                  <div key={key}>
                    <span className="font-medium text-gray-700 capitalize">{key.replace(/([A-Z])/g, " $1")}:</span>{" "}
                    <span className="text-gray-900">{displayValue}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* School Levels & Grades */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("School Levels")}</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {request.school_levels.map((level) => (
                <span key={level} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {level}
                </span>
              ))}
            </div>
          </section>

          {/* Status Update Section */}
          <section className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("Update Status")}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("Status")}</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as "pending" | "in_progress" | "approved" | "rejected")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">{t("Pending")}</option>
                  <option value="in_progress">{t("In Progress")}</option>
                  <option value="approved">{t("Approved")}</option>
                  <option value="rejected">{t("Rejected")}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("Admin Notes")}</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("Add notes about this request...")}
                />
              </div>
              <button
                onClick={handleUpdateStatus}
                className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t("Update Status")}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

