"use client";

import { useDualAuth } from "@/hooks/useDualAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import BulkStudentImport from "@/components/students/BulkStudentImport";
import { useState, useEffect } from "react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

type Student = Database['public']['Tables']['students']['Row'];

function StudentsContent() {
  const { user, profile, isAdmin, isSchoolStaff } = useDualAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'bulk-import' | 'manage'>('overview');
  
  // Student data and statistics
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // Filter and sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState<keyof Student>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const supabase = createClientComponentClient<Database>();

  // Fetch students from database
  useEffect(() => {
    fetchStudents();
  }, [profile?.school_id]);

  // Apply filters and search when dependencies change
  useEffect(() => {
    applyFiltersAndSort();
  }, [students, searchTerm, gradeFilter, statusFilter, sortField, sortDirection]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError('');

      let query = supabase
        .from('students')
        .select('*');

      // Filter by school if user is school staff
      if (profile?.school_id) {
        query = query.eq('school_id', profile.school_id);
      }

      const { data, error: fetchError } = await query
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching students:', fetchError);
        setError('Failed to load students');
        return;
      }

      setStudents(data || []);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...students];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(student =>
        student.first_name.toLowerCase().includes(searchLower) ||
        student.last_name.toLowerCase().includes(searchLower) ||
        student.student_id.toLowerCase().includes(searchLower) ||
        (student.grade_level && student.grade_level.toLowerCase().includes(searchLower)) ||
        (student.parent_name && student.parent_name.toLowerCase().includes(searchLower))
      );
    }

    // Apply grade filter
    if (gradeFilter) {
      filtered = filtered.filter(student => student.grade_level === gradeFilter);
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(student => student.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      
      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;
      
      return sortDirection === 'desc' ? -comparison : comparison;
    });

    setFilteredStudents(filtered);
  };

  const handleSort = (field: keyof Student) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: keyof Student) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const getUniqueGrades = () => {
    const grades = students
      .map(s => s.grade_level)
      .filter(Boolean)
      .filter((grade, index, arr) => arr.indexOf(grade) === index)
      .sort();
    return grades as string[];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-yellow-100 text-yellow-800',
      graduated: 'bg-blue-100 text-blue-800'
    };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
        statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'
      }`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getStudentStats = () => {
    const total = students.length;
    const active = students.filter(s => s.status === 'active').length;
    const inactive = students.filter(s => s.status === 'inactive').length;
    const graduated = students.filter(s => s.status === 'graduated').length;
    
    // Students added this month
    const thisMonth = students.filter(s => {
      const createdDate = new Date(s.created_at);
      const now = new Date();
      return createdDate.getMonth() === now.getMonth() && 
             createdDate.getFullYear() === now.getFullYear();
    }).length;

    return { total, active, inactive, graduated, thisMonth };
  };

  const stats = getStudentStats();

  const handleImportSuccess = (importedStudents: any[]) => {
    console.log('Import successful:', importedStudents);
    // Refresh the student list after successful import
    fetchStudents();
    // Switch to manage tab to see the imported students
    setActiveTab('manage');
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
                      <span className="font-medium text-gray-900">{stats.total}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Active Students:</span>
                      <span className="font-medium text-green-600">{stats.active}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">This Month:</span>
                      <span className="font-medium text-blue-600">{stats.thisMonth}</span>
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
                      <div className="text-sm text-gray-600">Browse and search {stats.total} students</div>
                    </button>
                    <button
                      onClick={() => setActiveTab('bulk-import')}
                      className="w-full text-left p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="font-medium text-gray-900">Bulk Import</div>
                      <div className="text-sm text-gray-600">Upload CSV file</div>
                    </button>
                    <button 
                      onClick={fetchStudents}
                      className="w-full text-left p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="font-medium text-gray-900">Refresh Data</div>
                      <div className="text-sm text-gray-600">Update student information</div>
                    </button>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900">Student Status</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active</span>
                      <div className="flex items-center">
                        <span className="font-medium text-green-600 mr-2">{stats.active}</span>
                        {getStatusBadge('active')}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Inactive</span>
                      <div className="flex items-center">
                        <span className="font-medium text-yellow-600 mr-2">{stats.inactive}</span>
                        {getStatusBadge('inactive')}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Graduated</span>
                      <div className="flex items-center">
                        <span className="font-medium text-blue-600 mr-2">{stats.graduated}</span>
                        {getStatusBadge('graduated')}
                      </div>
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
                      <span className="font-medium text-gray-900">{stats.total}</span>
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Students</h2>
                  <p className="text-gray-600 mt-1">
                    {loading ? 'Loading...' : `${filteredStudents.length} of ${students.length} students`}
                  </p>
                </div>
                <button
                  onClick={fetchStudents}
                  disabled={loading}
                  className="mt-3 sm:mt-0 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="md:col-span-2">
                  <input
                    type="text"
                    placeholder="Search students by name, ID, or parent..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Grade Filter */}
                <div>
                  <select
                    value={gradeFilter}
                    onChange={(e) => setGradeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Grades</option>
                    {getUniqueGrades().map((grade) => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="graduated">Graduated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading students...</p>
                </div>
              ) : error ? (
                <div className="p-6 text-center text-red-500">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Students</h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button
                    onClick={fetchStudents}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  {students.length === 0 ? (
                    <div>
                      <div className="text-6xl mb-4">👥</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
                      <p className="text-gray-600 mb-4">
                        Start by importing students using the bulk import feature.
                      </p>
                      <button 
                        onClick={() => setActiveTab('bulk-import')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Import Students
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="text-6xl mb-4">🔍</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
                      <p className="text-gray-600">
                        Try adjusting your search terms or filters.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('student_id')}
                      >
                        Student ID {getSortIcon('student_id')}
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('first_name')}
                      >
                        Name {getSortIcon('first_name')}
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('grade_level')}
                      >
                        Grade {getSortIcon('grade_level')}
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('parent_name')}
                      >
                        Parent/Guardian {getSortIcon('parent_name')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('status')}
                      >
                        Status {getSortIcon('status')}
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('enrollment_date')}
                      >
                        Enrollment {getSortIcon('enrollment_date')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.student_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {student.first_name} {student.last_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.grade_level || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.parent_name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            {student.parent_phone && (
                              <div className="text-gray-900">{student.parent_phone}</div>
                            )}
                            {student.parent_email && (
                              <div className="text-gray-500 text-xs">{student.parent_email}</div>
                            )}
                            {!student.parent_phone && !student.parent_email && '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(student.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(student.enrollment_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              View
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              Edit
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer with stats */}
            {filteredStudents.length > 0 && (
              <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between text-sm text-gray-700">
                  <div>
                    Showing {filteredStudents.length} of {students.length} students
                  </div>
                  <div className="flex space-x-4">
                    <span>Active: {stats.active}</span>
                    <span>Inactive: {stats.inactive}</span>
                    <span>Graduated: {stats.graduated}</span>
                  </div>
                </div>
              </div>
            )}
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