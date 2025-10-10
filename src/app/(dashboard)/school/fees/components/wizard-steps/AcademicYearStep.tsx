// src/app/(dashboard)/school/fees/components/wizard-steps/AcademicYearStep.tsx
"use client";

import React, { useState } from 'react';
import { CalendarIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useTranslation } from '@/hooks/useTranslation';

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
      description: 'Année académique'
    });
  }
  
  return suggestions;
};

const academicYearSuggestions = generateAcademicYearSuggestions();

const termStructures = [
  { 
    value: '3 Trimesters', 
    label: '3 Trimestres', 
    description: '3 trimestres avec 2 périodes chacun',
    schoolDays: 222,
    structure: '3 trimesters'
  },
  { 
    value: '2 Semesters', 
    label: '2 Semestres', 
    description: '2 semestres avec 2 périodes chacun',
    schoolDays: 222,
    structure: '2 semesters'
  },
  { 
    value: 'Custom', 
    label: 'Structure personnalisée', 
    description: 'Définissez votre propre structure académique',
    schoolDays: 0,
    structure: 'custom'
  }
];

export function AcademicYearStep({ data, onChange }: AcademicYearStepProps) {
  const { t } = useTranslation();
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [isTermDropdownOpen, setIsTermDropdownOpen] = useState(false);
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
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('Academic Year Setup')}</h3>
          <p className="text-gray-600">{t('Configure your academic year and term structure')}</p>
        </div>

        <div className="space-y-6">
          {/* Academic Year Name */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-900">{t('Academic Year Name')} *</Label>
            <DropdownMenu.Root open={isYearDropdownOpen} onOpenChange={setIsYearDropdownOpen}>
              <DropdownMenu.Trigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between h-12 px-4 text-left font-normal"
                >
                  <span className={selectedYear ? "text-gray-900" : "text-gray-500"}>
                    {selectedYear ? selectedYear.label : t('Select academic year')}
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


          {/* Date Range Selection */}
          <div className="space-y-4">
            <Label className="text-sm font-semibold text-gray-900">{t('Academic Period')} *</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-gray-700">{t('Start Date')}</Label>
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
                <Label className="text-sm text-gray-700">{t('End Date')}</Label>
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
              {t('Set the start and end dates for your academic year. These dates will be used for fee scheduling and term calculations.')}
            </p>
          </div>

          {/* Term Structure Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-900">{t('Term Structure')} *</Label>
            <DropdownMenu.Root open={isTermDropdownOpen} onOpenChange={setIsTermDropdownOpen}>
              <DropdownMenu.Trigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between h-12 px-4 text-left font-normal"
                >
                  <span className={selectedTerm ? "text-gray-900" : "text-gray-500"}>
                    {selectedTerm ? selectedTerm.label : t('Select term structure')}
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
              <Label className="text-sm font-semibold text-gray-900">{t('Define Custom Term Structure')}</Label>
              <div className="flex space-x-3">
                <Input
                  type="text"
                  placeholder={t('e.g., 2 Trimesters, 6 Modules, 4 Quarters, etc.')}
                  value={customTermStructure}
                  onChange={(e) => setCustomTermStructure(e.target.value)}
                  className="h-12"
                />
                <Button
                  onClick={handleCustomTermSubmit}
                  className="h-12 px-6"
                >
                  {t('Save')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCustomTermInput(false);
                    setCustomTermStructure('');
                  }}
                  className="h-12 px-4"
                >
                  {t('Cancel')}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                {t('Define your own term structure. This will be used for fee scheduling and payment plans.')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

