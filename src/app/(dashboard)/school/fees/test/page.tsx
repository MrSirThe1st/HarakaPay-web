// Test component to verify API integration
"use client";

import React, { useState } from 'react';
import { useFeesAPI } from '@/hooks/useFeesAPI';

function FeesAPITest() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const feesAPI = useFeesAPI();

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testAcademicYears = async () => {
    addResult('Testing Academic Years API...');
    try {
      const response = await feesAPI.academicYears.getAll();
      if (response.success) {
        addResult(`✅ Academic Years API working - Found ${response.data?.academicYears.length || 0} years`);
      } else {
        addResult(`❌ Academic Years API failed - ${response.error}`);
      }
    } catch (error) {
      addResult(`❌ Academic Years API error - ${error}`);
    }
  };

  const testFeeCategories = async () => {
    addResult('Testing Fee Categories API...');
    try {
      const response = await feesAPI.feeCategories.getAll();
      if (response.success) {
        addResult(`✅ Fee Categories API working - Found ${response.data?.feeCategories.length || 0} categories`);
      } else {
        addResult(`❌ Fee Categories API failed - ${response.error}`);
      }
    } catch (error) {
      addResult(`❌ Fee Categories API error - ${error}`);
    }
  };

  const testFeeTemplates = async () => {
    addResult('Testing Fee Templates API...');
    try {
      const response = await feesAPI.feeTemplates.getAll();
      if (response.success) {
        addResult(`✅ Fee Templates API working - Found ${response.data?.feeTemplates.length || 0} templates`);
      } else {
        addResult(`❌ Fee Templates API failed - ${response.error}`);
      }
    } catch (error) {
      addResult(`❌ Fee Templates API error - ${error}`);
    }
  };

  const testPaymentSchedules = async () => {
    addResult('Testing Payment Schedules API...');
    try {
      const response = await feesAPI.paymentSchedules.getAll();
      if (response.success) {
        addResult(`✅ Payment Schedules API working - Found ${response.data?.paymentSchedules.length || 0} schedules`);
      } else {
        addResult(`❌ Payment Schedules API failed - ${response.error}`);
      }
    } catch (error) {
      addResult(`❌ Payment Schedules API error - ${error}`);
    }
  };

  const testStudentAssignments = async () => {
    addResult('Testing Student Assignments API...');
    try {
      const response = await feesAPI.studentFeeAssignments.getAll();
      if (response.success) {
        addResult(`✅ Student Assignments API working - Found ${response.data?.studentFeeAssignments.length || 0} assignments`);
      } else {
        addResult(`❌ Student Assignments API failed - ${response.error}`);
      }
    } catch (error) {
      addResult(`❌ Student Assignments API error - ${error}`);
    }
  };

  const testAllAPIs = async () => {
    setTestResults([]);
    addResult('Starting API tests...');
    
    await testAcademicYears();
    await testFeeCategories();
    await testFeeTemplates();
    await testPaymentSchedules();
    await testStudentAssignments();
    
    addResult('All API tests completed!');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Fees API Test</h1>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={testAllAPIs}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Test All APIs
        </button>
        <button
          onClick={() => setTestResults([])}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Clear Results
        </button>
      </div>

      <div className="grid grid-cols-5 gap-2 mb-6">
        <button onClick={testAcademicYears} className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">
          Test Academic Years
        </button>
        <button onClick={testFeeCategories} className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">
          Test Categories
        </button>
        <button onClick={testFeeTemplates} className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">
          Test Templates
        </button>
        <button onClick={testPaymentSchedules} className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">
          Test Schedules
        </button>
        <button onClick={testStudentAssignments} className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">
          Test Assignments
        </button>
      </div>

      {feesAPI.loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-500">Loading...</p>
        </div>
      )}

      {feesAPI.error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-red-800">Error: {feesAPI.error}</p>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-medium mb-3">Test Results:</h3>
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {testResults.length === 0 ? (
            <p className="text-gray-500">No tests run yet. Click "Test All APIs" to start.</p>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="text-sm font-mono">
                {result}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default FeesAPITest;