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
  icon: string;
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
        <DropdownMenu.Content className="w-full min-w-[200px] bg-white border border-gray-200 rounded-lg shadow-lg">
          {scheduleTypes.map((schedule) => (
            <DropdownMenu.Item
              key={schedule.value}
              className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
              onSelect={() => {
                onScheduleSelect(schedule.value);
                onOpenChange(false);
              }}
            >
              <div className="flex items-center">
                <span className="mr-2">{schedule.icon}</span>
                <div>
                  <div className="font-medium">{schedule.label}</div>
                  <div className="text-xs text-gray-500">{schedule.description}</div>
                </div>
              </div>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
