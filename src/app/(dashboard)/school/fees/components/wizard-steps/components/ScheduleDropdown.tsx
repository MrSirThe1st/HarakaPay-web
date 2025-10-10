// src/app/(dashboard)/school/fees/components/wizard-steps/components/ScheduleDropdown.tsx
"use client";

import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface ScheduleType {
  value: string;
  label: string;
  description: string;
  recommended?: boolean;
  termCount?: number;
  termType?: string;
}

interface ScheduleDropdownProps {
  scheduleTypes: ScheduleType[];
  selectedSchedule?: ScheduleType;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onScheduleSelect: (scheduleType: string) => void;
  className?: string;
}

export function ScheduleDropdown({
  scheduleTypes,
  selectedSchedule,
  isOpen,
  onOpenChange,
  onScheduleSelect,
  className = ""
}: ScheduleDropdownProps) {
  return (
    <DropdownMenu.Root open={isOpen} onOpenChange={onOpenChange}>
      <DropdownMenu.Trigger asChild>
        <Button variant="outline" className={`w-full justify-between bg-white ${className}`}>
          {selectedSchedule ? selectedSchedule.label : 'Select payment schedule'}
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="w-full min-w-[300px] bg-white border border-gray-200 rounded-lg shadow-lg p-2">
          {scheduleTypes.map((schedule) => (
            <DropdownMenu.Item
              key={schedule.value}
              className="px-3 py-3 text-sm hover:bg-gray-50 cursor-pointer rounded-md transition-colors"
              onSelect={() => {
                onScheduleSelect(schedule.value);
                onOpenChange(false);
              }}
            >
              <div className="flex items-start">
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className="font-medium text-gray-900">{schedule.label}</div>
                    {schedule.recommended && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Recommended
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{schedule.description}</div>
                  {schedule.termCount && schedule.termType && (
                    <div className="text-xs text-blue-600 mt-1">
                      {schedule.termCount} {schedule.termType}{schedule.termCount > 1 ? 's' : ''} • Matches your academic structure
                    </div>
                  )}
                </div>
              </div>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
