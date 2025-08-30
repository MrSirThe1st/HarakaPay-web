// src/components/students/AdminStudentsView.tsx
"use client";

import React, { useState, useEffect } from "react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

type Student = Database['public']['Tables']['students']['Row'];

export function AdminStudentsView() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState<keyof Student>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [students, searchTerm, schoolFilter, statusFilter, sortField, sortDirection]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError('');

      const { data, error: fetchError } = await supabase
        .from('students')
        .select(`
          *,
          schools:school_id (
            name,
            location
          )
        `)
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

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(student =>
        student.first_name.toLowerCase().includes(searchLower) ||
        student.last_name.toLowerCase().includes(searchLower) ||
        student.student_id.toLowerCase().includes(searchLower) ||
        (student.grade_level && student.grade_level.toLowerCase().includes(searchLower))
      );
    }

    if (schoolFilter) {
      filtered = filtered.filter(student => student.school_id === schoolFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter(student => student.status === statusFilter);
    }

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

  const getUniqueSchools = () => {
    const schools = students
      .map(s => s.school_id)
      .filter(Boolean)
      .filter((school, index, arr) => arr.indexOf(school) === index);
    return schools as string[];
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
    
    return { total, active, inactive, graduated };
  };

  const stats = getStudentStats();

  if (loading) {
    return (
      <div className="enterprise-container">
        <div className="text-center py-12">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="color-text-secondary">Loading students...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="enterprise-container">
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
      </div>
    );
  }

  return (
    <div className="enterprise-container">
      {/* Page Header */}
      <header className="page-header">
        <div className="page-header-content">
          <div className="page-header-main">
            <h1 className="page-title">Platform Student Management</h1>
            <p className="page-subtitle">Manage all students across all schools</p>
            <div className="user-role-badge">
              Platform Administrator
            </div>
          </div>
        </div>
      </header>

      {/* Statistics Overview */}
      <section className="enterprise-section">
        <div className="enterprise-grid">
          <div className="enterprise-card border-l-4 border-indigo-500">
            <h2 className="text-xl font-semibold mb-4 color-text-main">Platform Overview</h2>
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
                <span className="color-text-muted">Total Schools:</span>
                <span className="font-medium color-text-main">{getUniqueSchools().length}</span>
              </div>
            </div>
          </div>

          <div className="enterprise-card border-l-4 border-green-500">
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
        </div>
      </section>

      {/* Students Table */}
      <section className="enterprise-section">
        <div className="enterprise-card">
          <div className="border-b border-gray-200 pb-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold color-text-main">All Students</h2>
                <p className="color-text-muted mt-1">
                  {filteredStudents.length} of {students.length} students
                </p>
              </div>
              <button
                onClick={fetchStudents}
                disabled={loading}
                className="btn btn-primary mt-3 sm:mt-0"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="border-b border-gray-200 pb-6 mb-6 bg-gray-50 p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="Search students by name, ID, or grade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input"
                />
              </div>

              <div>
                <select
                  value={schoolFilter}
                  onChange={(e) => setSchoolFilter(e.target.value)}
                  className="form-input"
                >
                  <option value="">All Schools</option>
                  {getUniqueSchools().map((schoolId) => (
                    <option key={schoolId} value={schoolId}>School {schoolId}</option>
                  ))}
                </select>
              </div>

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
            {filteredStudents.length === 0 ? (
              <div className="text-center py-12 color-text-muted">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium color-text-main mb-2">No Students Found</h3>
                <p className="color-text-secondary">
                  Try adjusting your search terms or filters.
                </p>
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
                    <th className="px-6 py-3 text-left text-xs font-medium color-text-muted uppercase tracking-wider">
                      School
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium color-text-muted uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('status')}
                    >
                      Status {getSortIcon('status')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium color-text-muted uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('created_at')}
                    >
                      Created {getSortIcon('created_at')}
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
                        School {student.school_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(student.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm color-text-main">
                        {new Date(student.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            View
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
