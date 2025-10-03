// src/app/(dashboard)/school/fees/components/wizard-steps/AcademicYearStep.tsx
"use client";

import React, { useState } from 'react';
import { CalendarIcon, ChevronDownIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface AcademicYearStepProps {
  data: {
    name: string;
    startDate: string;
    endDate: string;
    termStructure: string;
  };
  onChange: (data: {
    name: string;
    startDate: string;
    endDate: string;
    termStructure: string;
  }) => void;
}

// Generate common academic year patterns (but don't assume dates)
const generateAcademicYearSuggestions = () => {
  const currentYear = new Date().getFullYear();
  const suggestions = [];
  
  // Generate suggestions for next 10 years
  for (let i = 0; i < 10; i++) {
    const year = currentYear + i;
    suggestions.push({
      value: `${year}-${year + 1}`,
      label: `${year}-${year + 1}`,
      description: 'Academic Year'
    });
  }
  
  return suggestions;
};

const academicYearSuggestions = generateAcademicYearSuggestions();

const termStructures = [
  { 
    value: 'Kindergarten (3 Trimesters)', 
    label: 'Kindergarten (3 Trimesters)', 
    description: '180 school days, 3 trimesters with 2 periods each',
    schoolDays: 180,
    structure: '3 trimesters'
  },
  { 
    value: 'Primary (3 Trimesters)', 
    label: 'Primary (3 Trimesters)', 
    description: '222 school days, 3 trimesters with 2 periods each',
    schoolDays: 222,
    structure: '3 trimesters'
  },
  { 
    value: 'Secondary (2 Semesters)', 
    label: 'Secondary (2 Semesters)', 
    description: '222 school days, 2 semesters with 2 periods each',
    schoolDays: 222,
    structure: '2 semesters'
  },
  { 
    value: 'Custom', 
    label: 'Custom Structure', 
    description: 'Define your own academic structure',
    schoolDays: 0,
    structure: 'custom'
  }
];

export function AcademicYearStep({ data, onChange }: AcademicYearStepProps) {
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [isTermDropdownOpen, setIsTermDropdownOpen] = useState(false);
  const [showCustomYearInput, setShowCustomYearInput] = useState(false);
  const [showCustomTermInput, setShowCustomTermInput] = useState(false);
  const [customTermStructure, setCustomTermStructure] = useState('');
  
  const handleChange = (newData: {
    name: string;
    startDate: string;
    endDate: string;
    termStructure: string;
  }) => {
    console.log('AcademicYearStep onChange called with:', newData);
    onChange(newData);
  };

  const handleYearSelect = (year: typeof academicYearSuggestions[0]) => {
    handleChange({
      ...data,
      name: year.value
    });
    setIsYearDropdownOpen(false);
  };

  const handleTermSelect = (term: typeof termStructures[0]) => {
    if (term.value === 'Custom') {
      setShowCustomTermInput(true);
      setIsTermDropdownOpen(false);
    } else {
      handleChange({
        ...data,
        termStructure: term.value
      });
      setIsTermDropdownOpen(false);
    }
  };

  const handleCustomTermSubmit = () => {
    if (customTermStructure.trim()) {
      handleChange({
        ...data,
        termStructure: customTermStructure.trim()
      });
      setShowCustomTermInput(false);
    }
  };

  const selectedYear = academicYearSuggestions.find(year => year.value === data.name);
  const selectedTerm = termStructures.find(term => term.value === data.termStructure);

  return (
    <div className="space-y-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Academic Year Setup</h3>
          <p className="text-gray-600">Configure your academic year and term structure</p>
        </div>

        <div className="space-y-6">
          {/* Academic Year Name */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-900">Academic Year Name *</Label>
            <div className="flex space-x-3">
              <div className="flex-1">
                <DropdownMenu.Root open={isYearDropdownOpen} onOpenChange={setIsYearDropdownOpen}>
                  <DropdownMenu.Trigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between h-12 px-4 text-left font-normal"
                    >
                      <span className={selectedYear ? "text-gray-900" : "text-gray-500"}>
                        {selectedYear ? selectedYear.label : "Select academic year"}
                      </span>
                      <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content 
                      className="min-w-[300px] bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50 max-h-60 overflow-y-auto"
                      align="start"
                    >
                      {academicYearSuggestions.map((year) => (
                        <DropdownMenu.Item
                          key={year.value}
                          className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                          onSelect={() => handleYearSelect(year)}
                        >
                          <div>
                            <div className="font-medium text-gray-900">{year.label}</div>
                            <div className="text-sm text-gray-500">{year.description}</div>
                          </div>
                        </DropdownMenu.Item>
                      ))}
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowCustomYearInput(!showCustomYearInput)}
                className="h-12 px-4"
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Custom Year Input */}
          {showCustomYearInput && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-900">Custom Academic Year Name</Label>
              <div className="flex space-x-3">
                <Input
                  type="text"
                  placeholder="e.g., 2024-2025, Academic Year 2024, etc."
                  value={data.name}
                  onChange={(e) => handleChange({ ...data, name: e.target.value })}
                  className="h-12"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCustomYearInput(false);
                    // Clear the name if it was from a suggestion
                    if (selectedYear) {
                      handleChange({ ...data, name: '' });
                    }
                  }}
                  className="h-12 px-4"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Date Range Selection */}
          <div className="space-y-4">
            <Label className="text-sm font-semibold text-gray-900">Academic Period *</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-gray-700">Start Date</Label>
                <div className="relative">
                  <Input
                    type="date"
                    value={data.startDate}
                    onChange={(e) => handleChange({ ...data, startDate: e.target.value })}
                    className="h-12 pr-10"
                  />
                  <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-gray-700">End Date</Label>
                <div className="relative">
                  <Input
                    type="date"
                    value={data.endDate}
                    onChange={(e) => handleChange({ ...data, endDate: e.target.value })}
                    className="h-12 pr-10"
                  />
                  <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Set the start and end dates for your academic year. These dates will be used for fee scheduling and term calculations.
            </p>
          </div>

          {/* Term Structure Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-900">Term Structure *</Label>
            <DropdownMenu.Root open={isTermDropdownOpen} onOpenChange={setIsTermDropdownOpen}>
              <DropdownMenu.Trigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between h-12 px-4 text-left font-normal"
                >
                  <span className={selectedTerm ? "text-gray-900" : "text-gray-500"}>
                    {selectedTerm ? selectedTerm.label : "Select term structure"}
                  </span>
                  <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content 
                  className="min-w-[300px] bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50"
                  align="start"
                >
                  {termStructures.map((term) => (
                    <DropdownMenu.Item
                      key={term.value}
                      className="p-3 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                      onSelect={() => handleTermSelect(term)}
                    >
                      <div className="font-medium text-gray-900">{term.label}</div>
                      <div className="text-sm text-gray-500 mt-1">{term.description}</div>
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>

          {/* Custom Term Structure Input */}
          {showCustomTermInput && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-900">Define Custom Term Structure</Label>
              <div className="flex space-x-3">
                <Input
                  type="text"
                  placeholder="e.g., 2 Trimesters, 6 Modules, 4 Quarters, etc."
                  value={customTermStructure}
                  onChange={(e) => setCustomTermStructure(e.target.value)}
                  className="h-12"
                />
                <Button
                  onClick={handleCustomTermSubmit}
                  className="h-12 px-6"
                >
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCustomTermInput(false);
                    setCustomTermStructure('');
                  }}
                  className="h-12 px-4"
                >
                  Cancel
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Define your own term structure. This will be used for fee scheduling and payment plans.
              </p>
            </div>
          )}

          {/* DRC School Calendar Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">🇨🇩 DRC School Calendar Reference</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <div><strong>Kindergarten:</strong> 180 school days, 3 trimesters (Oct-Jul)</div>
              <div><strong>Primary:</strong> 222 school days, 3 trimesters (Oct-Aug)</div>
              <div><strong>Secondary:</strong> 222 school days, 2 semesters (Oct-Aug)</div>
              <div className="text-xs text-blue-600 mt-2">
                💡 Each trimester/semester is split into 2 periods for detailed scheduling
              </div>
            </div>
          </div>

          {/* Summary */}
          {data.name && data.startDate && data.endDate && data.termStructure && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-semibold text-green-900">Academic Year Configured</span>
              </div>
              <div className="text-sm text-green-800">
                <div className="font-medium">{data.name}</div>
                <div className="text-green-600">{data.termStructure}</div>
                <div className="text-green-600 mt-1">
                  {new Date(data.startDate).toLocaleDateString()} - {new Date(data.endDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

