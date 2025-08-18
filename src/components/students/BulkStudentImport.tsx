import React, { useState } from 'react';
import Papa, { ParseResult } from 'papaparse';

// Match your database schema
export type StudentImport = {
  student_id: string;
  first_name: string;
  last_name: string;
  grade_level?: string;
  enrollment_date?: string;
  status?: "active" | "inactive" | "graduated";
  parent_name?: string;
  parent_phone?: string;
  parent_email?: string;
};

type BulkStudentImportProps = {
  onImport?: (students: StudentImport[]) => void;
  schoolId?: string; // Should be passed from parent component
};

export default function BulkStudentImport({ onImport, schoolId }: BulkStudentImportProps) {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [students, setStudents] = useState<StudentImport[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const requiredFields = ['student_id', 'first_name', 'last_name'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
      setError('');
      setSuccess('');
      setStudents([]);
    }
  };

  const validateStudent = (student: any): string[] => {
    const errors: string[] = [];
    
    requiredFields.forEach(field => {
      if (!student[field] || student[field].toString().trim() === '') {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Validate email format if provided
    if (student.parent_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.parent_email)) {
      errors.push('Invalid parent email format');
    }

    // Validate status if provided
    if (student.status && !['active', 'inactive', 'graduated'].includes(student.status)) {
      errors.push('Invalid status. Must be: active, inactive, or graduated');
    }

    return errors;
  };

  const handleUpload = async () => {
    if (!csvFile) {
      setError('Please select a CSV file.');
      return;
    }

    if (!schoolId) {
      setError('School ID is required. Please contact support.');
      return;
    }

    setIsUploading(true);
    setError('');
    setSuccess('');

    Papa.parse<StudentImport>(csvFile, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.toLowerCase().replace(/\s+/g, '_'),
      complete: async (results: ParseResult<StudentImport>) => {
        try {
          // Validate all students
          const validationErrors: string[] = [];
          const validStudents: StudentImport[] = [];

          results.data.forEach((student, index) => {
            const errors = validateStudent(student);
            if (errors.length > 0) {
              validationErrors.push(`Row ${index + 2}: ${errors.join(', ')}`);
            } else {
              // Clean and prepare student data
              const cleanStudent: StudentImport = {
                student_id: student.student_id.toString().trim(),
                first_name: student.first_name.toString().trim(),
                last_name: student.last_name.toString().trim(),
                grade_level: student.grade_level?.toString().trim() || undefined,
                enrollment_date: student.enrollment_date || new Date().toISOString().split('T')[0],
                status: student.status || 'active',
                parent_name: student.parent_name?.toString().trim() || undefined,
                parent_phone: student.parent_phone?.toString().trim() || undefined,
                parent_email: student.parent_email?.toString().trim() || undefined,
              };
              validStudents.push(cleanStudent);
            }
          });

          if (validationErrors.length > 0) {
            setError(`Validation errors:\n${validationErrors.join('\n')}`);
            setIsUploading(false);
            return;
          }

          setStudents(validStudents);

          // Send to API
          const response = await fetch('/api/students/bulk-import', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              students: validStudents,
              school_id: schoolId
            }),
          });

          const data = await response.json();
          
          if (!response.ok || !data.success) {
            throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
          }

          setSuccess(`Successfully imported ${data.count} students.`);
          setStudents(validStudents);
          
          if (onImport) {
            onImport(validStudents);
          }

        } catch (err) {
          console.error('Import error:', err);
          setError(`Import failed: ${(err as Error).message}`);
        } finally {
          setIsUploading(false);
        }
      },
      error: (err: Error) => {
        setError(`CSV parsing error: ${err.message}`);
        setIsUploading(false);
      },
    });
  };

  const downloadTemplate = () => {
    const template = `student_id,first_name,last_name,grade_level,parent_name,parent_phone,parent_email,status
STU001,John,Doe,Grade 10,Jane Doe,+1234567890,jane.doe@email.com,active
STU002,Alice,Smith,Grade 9,Bob Smith,+1234567891,bob.smith@email.com,active`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Bulk Student Import</h2>
        <p className="text-gray-600">Upload a CSV file to import multiple students at once.</p>
      </div>

      {/* Template Download */}
      <div className="mb-4">
        <button
          onClick={downloadTemplate}
          className="text-blue-600 hover:text-blue-800 underline text-sm"
        >
          Download CSV Template
        </button>
      </div>

      {/* File Upload */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select CSV File
        </label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
          disabled={isUploading}
        />
      </div>

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!csvFile || isUploading}
        className={`w-full py-2 px-4 rounded-md font-medium ${
          !csvFile || isUploading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isUploading ? 'Uploading...' : 'Import Students'}
      </button>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-sm font-medium text-red-800 mb-2">Import Error</h3>
          <pre className="text-sm text-red-700 whitespace-pre-wrap">{error}</pre>
        </div>
      )}

      {/* Success Display */}
      {success && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="text-sm font-medium text-green-800">{success}</h3>
        </div>
      )}

      {/* Preview */}
      {students.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Import Preview ({students.length} students)
          </h3>
          <div className="max-h-96 overflow-auto border border-gray-200 rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Parent</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.slice(0, 50).map((student, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm text-gray-900">{student.student_id}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">
                      {student.first_name} {student.last_name}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900">{student.grade_level || '-'}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">{student.parent_name || '-'}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        student.status === 'active' ? 'bg-green-100 text-green-800' :
                        student.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {students.length > 50 && (
              <div className="p-3 text-sm text-gray-500 text-center bg-gray-50">
                Showing first 50 students. Total: {students.length}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Required Fields Info */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h4 className="text-sm font-medium text-blue-800 mb-2">CSV Format Requirements:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Required fields: student_id, first_name, last_name</li>
          <li>• Optional fields: grade_level, parent_name, parent_phone, parent_email, status</li>
          <li>• Status must be: active, inactive, or graduated (defaults to active)</li>
          <li>• Each student_id must be unique within your school</li>
          <li>• Download the template above for the correct format</li>
        </ul>
      </div>
    </div>
  );
}