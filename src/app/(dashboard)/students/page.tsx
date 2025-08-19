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
    <div className="enterprise-container">
      {/* Page Header */}
      <header className="page-header">
        <div className="page-header-content">
          <div className="page-header-main">
            <h1 className="page-title">Student Management</h1>
            <p className="page-subtitle">Welcome, {user?.name || user?.email}</p>
            {profile && (
              <div className="user-role-badge">
                {profile.role === "school_staff" ? "School Staff" : "Admin"}
                {profile.school_id && ` | School ID: ${profile.school_id}`}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <section className="enterprise-section">
        <nav className="flex space-x-8 border-b border-gray-200" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`${
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent color-text-muted hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </section>

      {/* Tab Content */}
      <section className="enterprise-section">
        {activeTab === 'overview' && (
          <div className="enterprise-grid">
            {/* School Staff Features */}
            {isSchoolStaff && (
              <>
                <div className="enterprise-card border-l-4 border-primary">
                  <h2 className="text-xl font-semibold mb-4 color-text-main">Student Database</h2>
                  <p className="color-text-secondary mb-4">
                    Upload and manage student and parent databases for your school.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="color-text-muted">Total Students:</span>
                      <span className="font-medium color-text-main">{stats.total}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="color-text-muted">Active Students:</span>
                      <span className="font-medium text-green-600">{stats.active}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="color-text-muted">This Month:</span>
                      <span className="font-medium text-blue-600">{stats.thisMonth}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('bulk-import')}
                    className="btn btn-primary w-full mt-4"
                  >
                    Import Students
                  </button>
                </div>

                <div className="enterprise-card border-l-4 border-green-500">
                  <h2 className="text-xl font-semibold mb-4 color-text-main">Quick Actions</h2>
                  <div className="space-y-3">
                    <button
                      onClick={() => setActiveTab('manage')}
                      className="w-full text-left p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="font-medium color-text-main">View All Students</div>
                      <div className="text-sm color-text-muted">Browse and search {stats.total} students</div>
                    </button>
                    <button
                      onClick={() => setActiveTab('bulk-import')}
                      className="w-full text-left p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="font-medium color-text-main">Bulk Import</div>
                      <div className="text-sm color-text-muted">Upload CSV file</div>
                    </button>
                    <button 
                      onClick={fetchStudents}
                      className="w-full text-left p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="font-medium color-text-main">Refresh Data</div>
                      <div className="text-sm color-text-muted">Update student information</div>
                    </button>
                  </div>
                </div>

                <div className="enterprise-card border-l-4 border-purple-500">
                  <h2 className="text-xl font-semibold mb-4 color-text-main">Student Status</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm color-text-muted">Active</span>
                      <div className="flex items-center">
                        <span className="font-medium text-green-600 mr-2">{stats.active}</span>
                        {getStatusBadge('active')}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm color-text-muted">Inactive</span>
                      <div className="flex items-center">
                        <span className="font-medium text-yellow-600 mr-2">{stats.inactive}</span>
                        {getStatusBadge('inactive')}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm color-text-muted">Graduated</span>
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
                <div className="enterprise-card border-l-4 border-indigo-500">
                  <h2 className="text-xl font-semibold mb-4 color-text-main">Platform Analytics</h2>
                  <p className="color-text-secondary mb-4">View comprehensive platform analytics and usage reports.</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="color-text-muted">Total Schools:</span>
                      <span className="font-medium color-text-main">--</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="color-text-muted">Total Students:</span>
                      <span className="font-medium color-text-main">{stats.total}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="color-text-muted">Active Schools:</span>
                      <span className="font-medium text-green-600">--</span>
                    </div>
                  </div>
                </div>

                <div className="enterprise-card border-l-4 border-yellow-500">
                  <h2 className="text-xl font-semibold mb-4 color-text-main">School Management</h2>
                  <p className="color-text-secondary mb-4">Manage schools and their student databases.</p>
                  <button className="btn btn-primary w-full">
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
          <div className="enterprise-card">
            <div className="border-b border-gray-200 pb-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold color-text-main">Students</h2>
                  <p className="color-text-muted mt-1">
                    {loading ? 'Loading...' : `${filteredStudents.length} of ${students.length} students`}
                  </p>
                </div>
                <button
                  onClick={fetchStudents}
                  disabled={loading}
                  className="btn btn-primary mt-3 sm:mt-0"
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="border-b border-gray-200 pb-6 mb-6 bg-gray-50 p-6 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="md:col-span-2">
                  <input
                    type="text"
                    placeholder="Search students by name, ID, or parent..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input"
                  />
                </div>

                {/* Grade Filter */}
                <div>
                  <select
                    value={gradeFilter}
                    onChange={(e) => setGradeFilter(e.target.value)}
                    className="form-input"
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
                    className="form-input"
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
                <div className="text-center py-12">
                  <div className="loading-spinner mx-auto mb-4"></div>
                  <p className="color-text-secondary">Loading students...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="error-message mb-4">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h3 className="text-lg font-medium color-text-main mb-2">Error Loading Students</h3>
                    <p className="color-text-secondary mb-4">{error}</p>
                    <button
                      onClick={fetchStudents}
                      className="btn btn-primary"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-12 color-text-muted">
                  {students.length === 0 ? (
                    <div>
                      <div className="text-6xl mb-4">👥</div>
                      <h3 className="text-lg font-medium color-text-main mb-2">No Students Found</h3>
                      <p className="color-text-secondary mb-4">
                        Start by importing students using the bulk import feature.
                      </p>
                      <button 
                        onClick={() => setActiveTab('bulk-import')}
                        className="btn btn-primary"
                      >
                        Import Students
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="text-6xl mb-4">🔍</div>
                      <h3 className="text-lg font-medium color-text-main mb-2">No Results Found</h3>
                      <p className="color-text-secondary">
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
                        className="px-6 py-3 text-left text-xs font-medium color-text-muted uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('student_id')}
                      >
                        Student ID {getSortIcon('student_id')}
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium color-text-muted uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('first_name')}
                      >
                        Name {getSortIcon('first_name')}
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium color-text-muted uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('grade_level')}
                      >
                        Grade {getSortIcon('grade_level')}
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium color-text-muted uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('parent_name')}
                      >
                        Parent/Guardian {getSortIcon('parent_name')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium color-text-muted uppercase tracking-wider">
                        Contact
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium color-text-muted uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('status')}
                      >
                        Status {getSortIcon('status')}
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium color-text-muted uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('enrollment_date')}
                      >
                        Enrollment {getSortIcon('enrollment_date')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium color-text-muted uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium color-text-main">
                          {student.student_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium color-text-main">
                            {student.first_name} {student.last_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm color-text-main">
                          {student.grade_level || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm color-text-main">
                          {student.parent_name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm color-text-main">
                          <div>
                            {student.parent_phone && (
                              <div className="color-text-main">{student.parent_phone}</div>
                            )}
                            {student.parent_email && (
                              <div className="color-text-muted text-xs">{student.parent_email}</div>
                            )}
                            {!student.parent_phone && !student.parent_email && '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(student.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm color-text-main">
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
              <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 mt-6 rounded-lg">
                <div className="flex items-center justify-between text-sm color-text-muted">
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
      </section>
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