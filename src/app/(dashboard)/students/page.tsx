"use client";

import { useDualAuth } from "@/hooks/useDualAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import BulkStudentImport from "@/components/students/BulkStudentImport";
import { useState } from "react";

function StudentsContent() {
  const { user, profile, isAdmin, isSchoolStaff } = useDualAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'bulk-import' | 'manage'>('overview');

  const handleImportSuccess = (students: any[]) => {
    console.log('Import successful:', students);
    // You can add additional logic here like refreshing student lists
    setActiveTab('overview'); // Switch back to overview after successful import
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: '📊' },
    { key: 'bulk-import', label: 'Bulk Import', icon: '📄' },
    { key: 'manage', label: 'Manage Students', icon: '👥' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
        <p className="text-gray-600">Welcome, {user?.name || user?.email}</p>
        {profile && (
          <p className="text-sm text-gray-500">
            Role: {profile.role === "school_staff" ? "School Staff" : "Admin"}
            {profile.school_id && ` | School ID: ${profile.school_id}`}
          </p>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap flex items-center py-2 px-1 border-b-2 font-medium text-sm`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* School Staff Features */}
            {isSchoolStaff && (
              <>
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900">Student Database</h2>
                  <p className="text-gray-600 mb-4">
                    Upload and manage student and parent databases for your school.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Students:</span>
                      <span className="font-medium text-gray-900">--</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Active Students:</span>
                      <span className="font-medium text-green-600">--</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">This Month:</span>
                      <span className="font-medium text-blue-600">--</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('bulk-import')}
                    className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Import Students
                  </button>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900">Quick Actions</h2>
                  <div className="space-y-3">
                    <button
                      onClick={() => setActiveTab('manage')}
                      className="w-full text-left p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="font-medium text-gray-900">View All Students</div>
                      <div className="text-sm text-gray-600">Browse and search students</div>
                    </button>
                    <button
                      onClick={() => setActiveTab('bulk-import')}
                      className="w-full text-left p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="font-medium text-gray-900">Bulk Import</div>
                      <div className="text-sm text-gray-600">Upload CSV file</div>
                    </button>
                    <button className="w-full text-left p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="font-medium text-gray-900">Export Data</div>
                      <div className="text-sm text-gray-600">Download student list</div>
                    </button>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900">Recent Activity</h2>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">
                      <div className="font-medium text-gray-900">No recent activity</div>
                      <div className="text-xs text-gray-500">Students imports and updates will appear here</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Admin Features */}
            {isAdmin && (
              <>
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-500">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900">Platform Analytics</h2>
                  <p className="text-gray-600 mb-4">View comprehensive platform analytics and usage reports.</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Schools:</span>
                      <span className="font-medium text-gray-900">--</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Students:</span>
                      <span className="font-medium text-gray-900">--</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Active Schools:</span>
                      <span className="font-medium text-green-600">--</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900">School Management</h2>
                  <p className="text-gray-600 mb-4">Manage schools and their student databases.</p>
                  <button className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 transition-colors">
                    Manage Schools
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'bulk-import' && (
          <div className="max-w-4xl">
            <BulkStudentImport 
              onImport={handleImportSuccess}
              schoolId={profile?.school_id || undefined}
            />
          </div>
        )}

        {activeTab === 'manage' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Manage Students</h2>
              <p className="text-gray-600 mt-1">View, search, and manage your student database</p>
            </div>
            
            <div className="p-6">
              {/* Search and Filter Bar */}
              <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search students by name or ID..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <select className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">All Grades</option>
                    <option value="grade-1">Grade 1</option>
                    <option value="grade-2">Grade 2</option>
                    <option value="grade-3">Grade 3</option>
                    {/* Add more grade options */}
                  </select>
                  <select className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="graduated">Graduated</option>
                  </select>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Add Student
                  </button>
                </div>
              </div>

              {/* Students Table Placeholder */}
              <div className="border border-gray-200 rounded-md">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">Students List</h3>
                    <div className="flex items-center space-x-2">
                      <button className="text-sm text-gray-600 hover:text-gray-900">Export</button>
                      <span className="text-gray-300">|</span>
                      <button 
                        onClick={() => setActiveTab('bulk-import')}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Bulk Import
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 text-center text-gray-500">
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
                  <p className="text-gray-600 mb-4">
                    Start by importing students using the bulk import feature or add students individually.
                  </p>
                  <div className="flex justify-center space-x-3">
                    <button 
                      onClick={() => setActiveTab('bulk-import')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Import Students
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                      Add Individual Student
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StudentsPage() {
  return (
    <ProtectedRoute>
      <StudentsContent />
    </ProtectedRoute>
  );
}