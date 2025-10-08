// src/app/(dashboard)/school/fees/components/wizard-steps/GradeProgramStep.tsx
"use client";

import React, { useState } from 'react';
import { AcademicCapIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface GradeProgramStepProps {
  data: {
    gradeLevel: string;
    programType: string;
  };
  onChange: (data: {
    gradeLevel: string;
    programType: string;
  }) => void;
}

const programTypes = [
  { value: 'kindergarten', label: 'Kindergarten' },
  { value: 'primary', label: 'Primary School' },
  { value: 'secondary', label: 'Secondary School' },
  { value: 'high-school', label: 'High School' },
  { value: 'university', label: 'University' }
];

const commonGradeLevels = [
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6',
  'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12',
  'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Senior Class', 'Junior Class',
  'Foundation Year', 'Preparatory', 'Nursery', 'Kindergarten'
];

export function GradeProgramStep({ data, onChange }: GradeProgramStepProps) {
  const [isProgramDropdownOpen, setIsProgramDropdownOpen] = useState(false);
  const [isGradeDropdownOpen, setIsGradeDropdownOpen] = useState(false);
  
  const handleChange = (newData: {
    gradeLevel: string;
    programType: string;
  }) => {
    console.log('GradeProgramStep onChange called with:', newData);
    onChange(newData);
  };

  const handleProgramSelect = (program: typeof programTypes[0]) => {
    handleChange({
      ...data,
      programType: program.value
    });
    setIsProgramDropdownOpen(false);
  };

  const handleGradeSelect = (grade: string) => {
    handleChange({
      ...data,
      gradeLevel: grade
    });
    setIsGradeDropdownOpen(false);
  };

  const selectedProgram = programTypes.find(program => program.value === data.programType);

  return (
    <div className="space-y-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Grade & Program Setup</h3>
          <p className="text-gray-600">Define the grade level and program type for this fee structure</p>
        </div>

        <div className="space-y-6">
          {/* Program Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-900">Program Type *</Label>
            <DropdownMenu.Root open={isProgramDropdownOpen} onOpenChange={setIsProgramDropdownOpen}>
              <DropdownMenu.Trigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between h-12 px-4 text-left font-normal"
                >
                  <span className={selectedProgram ? "text-gray-900" : "text-gray-500"}>
                    {selectedProgram ? selectedProgram.label : "Select program type"}
                  </span>
                  <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content 
                  className="min-w-[300px] bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50"
                  align="start"
                >
                  {programTypes.map((program) => (
                    <DropdownMenu.Item
                      key={program.value}
                      className="flex flex-col items-start p-3 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                      onSelect={() => handleProgramSelect(program)}
                    >
                      <div className="font-medium text-gray-900">{program.label}</div>
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>

          {/* Grade Level Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-900">Grade Level *</Label>
            <div className="flex space-x-3">
              <div className="flex-1">
                <DropdownMenu.Root open={isGradeDropdownOpen} onOpenChange={setIsGradeDropdownOpen}>
                  <DropdownMenu.Trigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between h-12 px-4 text-left font-normal"
                    >
                      <span className={data.gradeLevel ? "text-gray-900" : "text-gray-500"}>
                        {data.gradeLevel || "Select grade level"}
                      </span>
                      <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content 
                      className="min-w-[200px] bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50 max-h-60 overflow-y-auto"
                      align="start"
                    >
                      {commonGradeLevels.map((grade) => (
                        <DropdownMenu.Item
                          key={grade}
                          className="p-3 rounded-md hover:bg-gray-50 cursor-pointer transition-colors text-sm"
                          onSelect={() => handleGradeSelect(grade)}
                        >
                          {grade}
                        </DropdownMenu.Item>
                      ))}
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </div>
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Or enter custom grade"
                  value={data.gradeLevel}
                  onChange={(e) => handleChange({ ...data, gradeLevel: e.target.value })}
                  className="h-12"
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          {data.gradeLevel && data.programType && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AcademicCapIcon className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold text-green-900">Grade & Program Configured</span>
              </div>
              <div className="text-sm text-green-800">
                <div className="font-medium">{data.gradeLevel}</div>
                <div className="text-green-600">{selectedProgram?.label}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
