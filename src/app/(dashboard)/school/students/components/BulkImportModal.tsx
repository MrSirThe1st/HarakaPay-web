// src/app/(dashboard)/school/students/components/BulkImportModal.tsx
"use client";

import React, { useState, useRef } from 'react';
import { 
  XMarkIcon, 
  DocumentArrowUpIcon, 
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '@/hooks/useTranslation';
import type { StudentImportData, CSVParseResult } from '@/lib/csvParser';

// Lazy load CSV parser - it's only needed when this modal is opened
let csvParserModule: typeof import('@/lib/csvParser') | null = null;

const loadCSVParser = async () => {
  if (!csvParserModule) {
    csvParserModule = await import('@/lib/csvParser');
  }
  return csvParserModule;
};

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (students: StudentImportData[]) => Promise<void>;
}

export function BulkImportModal({ isOpen, onClose, onImport }: BulkImportModalProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'success'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    setImportError(null);
    
    // Lazy load CSV parser and parse the file
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      const { parseCSV } = await loadCSVParser();
      const result = parseCSV(content, selectedFile.name);
      setParseResult(result);
      
      // Always move to preview step, even with errors
      setStep('preview');
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    if (!parseResult || parseResult.data.length === 0) return;

    setIsImporting(true);
    setStep('importing');
    setImportError(null);

    try {
      await onImport(parseResult.data);
      setImportedCount(parseResult.data.length);
      setStep('success');
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Import failed');
      setStep('preview');
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    const { generateCSVTemplate } = await loadCSVParser();
    const template = generateCSVTemplate();
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setStep('upload');
    setFile(null);
    setParseResult(null);
    setImportError(null);
    setImportedCount(0);
    onClose();
  };

  const handleRetry = () => {
    setStep('upload');
    setFile(null);
    setParseResult(null);
    setImportError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-lg flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <DocumentArrowUpIcon className="h-5 w-5 text-green-600" />
              {t('Bulk Import Students')}
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div className="space-y-6">
              <div className="text-center">
                <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">{t('Upload CSV File')}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {t('Select a CSV file containing student data to import')}
                </p>
              </div>

              <div className="mt-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex justify-center items-center px-6 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                >
                  <div className="text-center">
                    <DocumentArrowUpIcon className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      Click to select CSV file or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Supports multiple CSV formats
                    </p>
                  </div>
                </button>
              </div>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  Download Template
                </button>
              </div>

              {file && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-5 w-5 text-blue-400 mr-2" />
                    <span className="text-sm text-blue-800">
                      Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Preview */}
          {step === 'preview' && parseResult && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Preview Import Data</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    Format: {parseResult.format}
                  </span>
                  <span className="text-sm text-gray-500">
                    • {parseResult.data.length} students
                  </span>
                </div>
              </div>

              {/* Errors */}
              {parseResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800">Import Errors</h4>
                      <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                        {parseResult.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Warnings */}
              {parseResult.warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Warnings</h4>
                      <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                        {parseResult.warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Data Preview */}
              {parseResult.data.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Data Preview (showing first 10 rows)
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Parent</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {parseResult.data.slice(0, 10).map((student, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2 text-sm text-gray-900">{student.student_id}</td>
                            <td className="px-3 py-2 text-sm text-gray-900">
                              {student.first_name} {student.last_name}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-900">{student.grade_level || '-'}</td>
                            <td className="px-3 py-2 text-sm text-gray-900">{student.status || 'active'}</td>
                            <td className="px-3 py-2 text-sm text-gray-900">{student.parent_name || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parseResult.data.length > 10 && (
                    <p className="text-xs text-gray-500 mt-2">
                      ... and {parseResult.data.length - 10} more rows
                    </p>
                  )}
                </div>
              )}

              {/* Import Error */}
              {importError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800">Import Failed</h4>
                      <p className="mt-1 text-sm text-red-700">{importError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Choose Different File
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    {t('Cancel')}
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={parseResult.data.length === 0 || isImporting}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isImporting ? 'Importing...' : `Import ${parseResult.data.length} Students`}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Importing */}
          {step === 'importing' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Importing Students</h3>
              <p className="mt-2 text-sm text-gray-500">
                Please wait while we import your student data...
              </p>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="text-center py-8">
              <CheckCircleIcon className="mx-auto h-12 w-12 text-green-600" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Import Successful!</h3>
              <p className="mt-2 text-sm text-gray-500">
                Successfully imported {importedCount} students
              </p>
              <div className="mt-6">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
                >
                  {t('Close')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
