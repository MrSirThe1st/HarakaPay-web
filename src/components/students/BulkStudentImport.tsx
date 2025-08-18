
import React, { useState } from 'react';
import Papa, { ParseResult } from 'papaparse';

export type Student = {
  id?: string;
  firstName: string;
  lastName: string;
  grade?: string;
  parentName?: string;
  parentContact?: string;
  [key: string]: string | undefined;
};

type BulkStudentImportProps = {
  onImport?: (students: Student[]) => void;
};

export default function BulkStudentImport({ onImport }: BulkStudentImportProps) {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!csvFile) {
      setError('Please select a CSV file.');
      return;
    }
    Papa.parse<Student>(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results: ParseResult<Student>) => {
        setStudents(results.data);
        if (onImport) onImport(results.data);
        // Send to API
        try {
          const res = await fetch('/api/students/bulk-import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(results.data),
          });
          const data = await res.json();
          if (!data.success) {
            setError(data.error || 'Import failed');
          } else {
            setError('');
            alert(`Successfully imported ${data.count} students.`);
          }
        } catch (err) {
          setError((err as Error).message);
        }
      },
      error: (err: Error) => setError(err.message),
    });
  };

  return (
    <div>
      <h2>Bulk Student Import</h2>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {students.length > 0 && (
        <div>
          <h3>Preview:</h3>
          <pre>{JSON.stringify(students, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
