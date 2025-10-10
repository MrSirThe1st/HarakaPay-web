// src/app/(dashboard)/school/fees/components/wizard-steps/GradeProgramStep.tsx
"use client";

import React, { useState } from 'react';
import { AcademicCapIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { CONGOLESE_GRADES, CONGOLESE_PROGRAM_TYPES, getGradesByLevel } from '@/lib/congoleseGrades';
import { useTranslation } from '@/hooks/useTranslation';

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

export function GradeProgramStep({ data, onChange }: GradeProgramStepProps) {
  const { t } = useTranslation();
  const [isProgramDropdownOpen, setIsProgramDropdownOpen] = useState(false);
  const [isGradeDropdownOpen, setIsGradeDropdownOpen] = useState(false);
  
  const handleChange = (newData: {
    gradeLevel: string;
    programType: string;
  }) => {
    console.log('GradeProgramStep onChange called with:', newData);
    onChange(newData);
  };

  const handleProgramSelect = (program: typeof CONGOLESE_PROGRAM_TYPES[0]) => {
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

  const selectedProgram = CONGOLESE_PROGRAM_TYPES.find(program => program.value === data.programType);
  const selectedGrade = CONGOLESE_GRADES.find(grade => grade.value === data.gradeLevel);
  
  // Get grades filtered by selected program type
  const getFilteredGrades = () => {
    if (!data.programType) return CONGOLESE_GRADES;
    
    const levelMapping: Record<string, string> = {
      'maternelle': 'Maternelle',
      'primaire': 'Primaire', 
      'base': 'Éducation de Base',
      'humanites': 'Humanités',
      'universite': 'Université'
    };
    
    const level = levelMapping[data.programType];
    return level ? getGradesByLevel(level) : CONGOLESE_GRADES;
  };

  const filteredGrades = getFilteredGrades();

  return (
    <div className="space-y-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('Grade & Program Setup')}</h3>
          <p className="text-gray-600">{t('Define the grade level and program type for this fee structure')}</p>
        </div>

        <div className="space-y-6">
          {/* Program Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-900">{t('Program Type')} *</Label>
            <DropdownMenu.Root open={isProgramDropdownOpen} onOpenChange={setIsProgramDropdownOpen}>
              <DropdownMenu.Trigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between h-12 px-4 text-left font-normal"
                >
                  <span className={selectedProgram ? "text-gray-900" : "text-gray-500"}>
                    {selectedProgram ? selectedProgram.label : t("Select Program Type")}
                  </span>
                  <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content 
                  className="min-w-[300px] bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50"
                  align="start"
                >
                  {CONGOLESE_PROGRAM_TYPES.map((program) => (
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
            <Label className="text-sm font-semibold text-gray-900">{t('Grade Level')} *</Label>
            <div className="flex space-x-3">
              <div className="flex-1">
                <DropdownMenu.Root open={isGradeDropdownOpen} onOpenChange={setIsGradeDropdownOpen}>
                  <DropdownMenu.Trigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between h-12 px-4 text-left font-normal"
                    >
                      <span className={selectedGrade ? "text-gray-900" : "text-gray-500"}>
                        {selectedGrade ? selectedGrade.label : t("Select Grade Level")}
                      </span>
                      <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content 
                      className="min-w-[300px] bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50 max-h-60 overflow-y-auto"
                      align="start"
                    >
                      {filteredGrades.map((grade) => (
                        <DropdownMenu.Item
                          key={grade.value}
                          className="flex flex-col items-start p-3 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                          onSelect={() => handleGradeSelect(grade.value)}
                        >
                          <div className="font-medium text-gray-900">{grade.label}</div>
                          {grade.description && (
                            <div className="text-sm text-gray-500 mt-1">{grade.description}</div>
                          )}
                        </DropdownMenu.Item>
                      ))}
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </div>
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder={t("Or enter custom grade")}
                  value={data.gradeLevel && !selectedGrade ? data.gradeLevel : ''}
                  onChange={(e) => handleChange({ ...data, gradeLevel: e.target.value })}
                  className="h-12"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {t('Select from the Congolese education system or enter a custom grade level')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}