// src/app/(dashboard)/school/fees/components/wizard-steps/SelectAcademicContextStep.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { CalendarIcon, ChevronDownIcon, BuildingOfficeIcon, BookOpenIcon, CurrencyDollarIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { CONGOLESE_GRADES } from '@/lib/congoleseGrades';
import { useTranslation } from '@/hooks/useTranslation';

interface SelectAcademicContextStepProps {
  data: {
    academicYear: string;
    gradeLevel: string | string[];
    structureName: string;
    appliesTo: 'school' | 'grade';
    currency: string;
  };
  onChange: (data: {
    academicYear: string;
    gradeLevel: string | string[];
    structureName: string;
    appliesTo: 'school' | 'grade';
    currency: string;
  }) => void;
  schoolGradeLevels?: string[];
}

// Generate hardcoded academic years
const generateAcademicYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  
  for (let i = 0; i < 10; i++) {
    const year = currentYear + i;
    years.push({
      value: `${year}-${year + 1}`,
      label: `${year}-${year + 1}`,
      description: 'Academic Year'
    });
  }
  
  return years;
};

const academicYears = generateAcademicYears();

export function SelectAcademicContextStep({ data, onChange, schoolGradeLevels = [] }: SelectAcademicContextStepProps) {
  const { t } = useTranslation();
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);

  // Use school's grade levels if available, otherwise fallback to all grades
  const availableGrades = schoolGradeLevels.length > 0
    ? schoolGradeLevels.map(grade => ({ value: grade, label: grade }))
    : CONGOLESE_GRADES;

  console.log('🏫 School grade levels received:', schoolGradeLevels);
  console.log('📋 Available grades to display:', availableGrades.length, availableGrades.map(g => g.value).join(', '));

  // Initialize selected grades from data
  useEffect(() => {
    if (data.appliesTo === 'grade' && data.gradeLevel) {
      if (Array.isArray(data.gradeLevel)) {
        setSelectedGrades(data.gradeLevel);
      } else {
        setSelectedGrades([data.gradeLevel]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.appliesTo, data.gradeLevel]);

  const handleChange = (newData: {
    academicYear: string;
    gradeLevel: string | string[];
    structureName: string;
    appliesTo: 'school' | 'grade';
    currency: string;
  }) => {
    onChange(newData);
  };

  const handleYearSelect = (year: typeof academicYears[0]) => {
    const newData = {
      ...data,
      academicYear: year.value
    };
    
    // Auto-generate structure name if empty
    if (!data.structureName) {
      const gradeText = data.appliesTo === 'school' ? 'All Grades' : 
        (Array.isArray(data.gradeLevel) ? data.gradeLevel.join(', ') : data.gradeLevel);
      newData.structureName = `${year.value} ${gradeText} Fee Structure`;
    }
    
    handleChange(newData);
    setIsYearDropdownOpen(false);
  };

  const handleAppliesToChange = (appliesTo: 'school' | 'grade') => {
    const newData = {
      ...data,
      appliesTo,
      gradeLevel: appliesTo === 'school' ? 'All Grades' : ''
    };
    
    // Auto-generate structure name
    const gradeText = appliesTo === 'school' ? 'All Grades' : 'Selected Grades';
    newData.structureName = `${data.academicYear || 'Year'} ${gradeText} Fee Structure`;
    
    handleChange(newData);
    
    if (appliesTo === 'school') {
      setSelectedGrades([]);
    }
  };

  const handleGradeToggle = (grade: string) => {
    const newSelectedGrades = selectedGrades.includes(grade)
      ? selectedGrades.filter(g => g !== grade)
      : [...selectedGrades, grade];
    
    setSelectedGrades(newSelectedGrades);
    
    const newData = {
      ...data,
      gradeLevel: newSelectedGrades,
      appliesTo: 'grade' as const
    };
    
    // Auto-generate structure name
    const gradeText = newSelectedGrades.length > 0 ? newSelectedGrades.join(', ') : 'Selected Grades';
    newData.structureName = `${data.academicYear || 'Year'} ${gradeText} Fee Structure`;
    
    handleChange(newData);
  };

  const handleStructureNameChange = (name: string) => {
    handleChange({
      ...data,
      structureName: name
    });
  };

  const removeGrade = (gradeToRemove: string) => {
    const newSelectedGrades = selectedGrades.filter(g => g !== gradeToRemove);
    setSelectedGrades(newSelectedGrades);
    
    const newData = {
      ...data,
      gradeLevel: newSelectedGrades,
      appliesTo: 'grade' as const
    };
    
    // Auto-generate structure name
    const gradeText = newSelectedGrades.length > 0 ? newSelectedGrades.join(', ') : 'Selected Grades';
    newData.structureName = `${data.academicYear || 'Year'} ${gradeText} Fee Structure`;
    
    handleChange(newData);
  };

  const selectedYear = academicYears.find(year => year.value === data.academicYear);

  return (
    <div className="space-y-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">{t('Academic Context Setup')}</h3>
          <p className="text-gray-600">{t('Define the academic year, grade scope, and structure details')}</p>
        </div>

        <div className="space-y-8">
          {/* Academic Year Selection */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
            <div className="space-y-4">
              <Label className="text-lg font-semibold text-gray-900 flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
                {t('Academic Year')} *
              </Label>
              <DropdownMenu.Root open={isYearDropdownOpen} onOpenChange={setIsYearDropdownOpen}>
                <DropdownMenu.Trigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between h-14 px-4 text-left font-normal bg-white hover:bg-gray-50 transition-all duration-200"
                  >
                    <span className={selectedYear ? "text-gray-900" : "text-gray-500"}>
                      {selectedYear ? selectedYear.label : t('Select academic year')}
                    </span>
                    <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content 
                    className="min-w-[300px] bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50 max-h-60 overflow-y-auto"
                    align="start"
                  >
                    {academicYears.map((year) => (
                      <DropdownMenu.Item
                        key={year.value}
                        className="flex items-center justify-between p-3 rounded-md hover:bg-blue-50 cursor-pointer transition-colors"
                        onSelect={() => handleYearSelect(year)}
                      >
                        <div>
                          <div className="font-medium text-gray-900">{year.label}</div>
                          <div className="text-sm text-gray-500">{year.description}</div>
                        </div>
                      </DropdownMenu.Item>
                    ))}
                    <DropdownMenu.Separator className="my-2 border-t border-gray-200" />
                    <DropdownMenu.Item
                      className="flex items-center justify-between p-3 rounded-md hover:bg-green-50 cursor-pointer transition-colors"
                      onSelect={() => {
                        // This will be handled by the wizard - create new academic year
                        const newYear = {
                          value: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
                          label: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
                          description: 'Create New Academic Year'
                        };
                        handleYearSelect(newYear);
                      }}
                    >
                      <div>
                        <div className="font-medium text-gray-900">{t('Create New Academic Year')}</div>
                        <div className="text-sm text-gray-500">{t('Add a new academic year')}</div>
                      </div>
                      <PlusIcon className="h-4 w-4 text-green-600" />
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          </div>

          {/* Structure Name */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
            <div className="space-y-4">
              <Label className="text-lg font-semibold text-gray-900 flex items-center">
                <BookOpenIcon className="h-5 w-5 mr-2 text-green-600" />
                {t('Structure Name')} *
              </Label>
              <div className="relative">
                <Input
                  type="text"
                  value={data.structureName}
                  onChange={(e) => handleStructureNameChange(e.target.value)}
                  placeholder={t('e.g., 2024-2025 Grade 1 Fee Structure')}
                  className="h-14 pr-12 text-lg"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {t('This name will help you identify this fee structure in your dashboard')}
              </p>
            </div>
          </div>

          {/* Applies To Section */}
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-xl border border-purple-200">
            <div className="space-y-6">
              <Label className="text-lg font-semibold text-gray-900">
                {t('This fee structure applies to:')}
              </Label>
              
              <div className="space-y-4">
                {/* Entire School Option */}
                <label className="flex items-center space-x-4 cursor-pointer group">
                  <input
                    type="radio"
                    name="appliesTo"
                    value="school"
                    checked={data.appliesTo === 'school'}
                    onChange={() => handleAppliesToChange('school')}
                    className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300"
                  />
                  <div className="flex-1 p-4 rounded-lg border-2 transition-all duration-200 group-hover:shadow-md"
                       style={{ 
                         borderColor: data.appliesTo === 'school' ? '#10b981' : '#e5e7eb',
                         backgroundColor: data.appliesTo === 'school' ? '#f0fdf4' : 'white'
                       }}>
                    <div className="flex items-center space-x-3">
                      <BuildingOfficeIcon className="h-6 w-6 text-green-600" />
                      <div>
                        <span className="text-lg font-medium text-gray-900">
                          {t('Entire School')}
                        </span>
                        <p className="text-sm text-gray-600 mt-1">
                          {t('All grades and programs in the school')}
                        </p>
                      </div>
                    </div>
                    {data.appliesTo === 'school' && (
                      <div className="mt-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                          {t('All Grades')}
                        </span>
                      </div>
                    )}
                  </div>
                </label>
                
                {/* Specific Grades Option */}
                <label className="flex items-center space-x-4 cursor-pointer group">
                  <input
                    type="radio"
                    name="appliesTo"
                    value="grade"
                    checked={data.appliesTo === 'grade'}
                    onChange={() => handleAppliesToChange('grade')}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="flex-1 p-4 rounded-lg border-2 transition-all duration-200 group-hover:shadow-md"
                       style={{ 
                         borderColor: data.appliesTo === 'grade' ? '#3b82f6' : '#e5e7eb',
                         backgroundColor: data.appliesTo === 'grade' ? '#eff6ff' : 'white'
                       }}>
                    <div className="flex items-center space-x-3">
                      <BookOpenIcon className="h-6 w-6 text-blue-600" />
                      <div>
                        <span className="text-lg font-medium text-gray-900">
                          {t('Specific Grades')}
                        </span>
                        <p className="text-sm text-gray-600 mt-1">
                          {t('Choose which grades this structure applies to')}
                        </p>
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              {/* Grade Selection (when Specific Grades is selected) */}
              {data.appliesTo === 'grade' && (
                <div className="mt-6 space-y-4">
                  <Label className="text-sm font-medium text-gray-700">
                    {t('Select Grades:')}
                  </Label>
                  
                  {/* Selected Grades Display */}
                  {selectedGrades.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedGrades.map((grade) => (
                        <span
                          key={grade}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          {grade}
                          <button
                            type="button"
                            onClick={() => removeGrade(grade)}
                            className="ml-2 h-4 w-4 rounded-full hover:bg-blue-200 flex items-center justify-center"
                          >
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Grade Checkboxes */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                    {availableGrades.map((grade) => (
                      <label
                        key={grade.value}
                        className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedGrades.includes(grade.value)}
                          onChange={() => handleGradeToggle(grade.value)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm font-medium text-gray-900">{grade.label}</span>
                      </label>
                    ))}
                  </div>
                  
                  {selectedGrades.length === 0 && (
                    <p className="text-sm text-gray-500 italic">
                      {t('Please select at least one grade')}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Currency Display */}
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-xl border border-yellow-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
                <div>
                  <Label className="text-lg font-semibold text-gray-900">
                    {t('Currency')}
                  </Label>
                  <p className="text-sm text-gray-600">
                    {t('Set by your school administrator')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold bg-yellow-100 text-yellow-800">
                  {data.currency || 'USD'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
