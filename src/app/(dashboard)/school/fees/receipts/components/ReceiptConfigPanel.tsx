// src/app/(dashboard)/school/fees/receipts/components/ReceiptConfigPanel.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { 
  PhotoIcon,

} from '@heroicons/react/24/outline';
import { useReceiptsAPI } from '@/hooks/useReceiptsAPI';
import { 
  ReceiptTemplateForm, 
  ReceiptFieldConfig, 
  ReceiptStyleConfig, 
  FeeCategory,

} from '@/types/receipt';

interface ReceiptConfigPanelProps {
  template: ReceiptTemplateForm;
  onTemplateChange: (template: ReceiptTemplateForm) => void;
  onSave: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ReceiptConfigPanel({ 
  template, 
  onTemplateChange, 
  onSave, 
  onCancel, 
  isLoading = false 
}: ReceiptConfigPanelProps) {
  const [categories, setCategories] = useState<FeeCategory[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('basic');

  const receiptsAPI = useReceiptsAPI();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const response = await receiptsAPI.getAvailableCategories();
    if (response.success && response.data) {
      setCategories(response.data.categories);
    }
  };

  const handleFieldToggle = (field: keyof ReceiptFieldConfig) => {
    const updatedFields = {
      ...template.visible_fields,
      [field]: !template.visible_fields[field]
    };
    onTemplateChange({
      ...template,
      visible_fields: updatedFields
    });
  };

  const handleStyleChange = (field: keyof ReceiptStyleConfig, value: string | number | boolean) => {
    const updatedStyle = {
      ...template.style_config,
      [field]: value
    };
    onTemplateChange({
      ...template,
      style_config: updatedStyle
    });
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLogoFile(file);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);

    // Upload to server
    try {
      const response = await receiptsAPI.uploadLogo(file);
      if (response.success && response.data) {
        // Update template with logo URL
        onTemplateChange({
          ...template,
          style_config: {
            ...template.style_config,
            logo_url: response.data.logo_url
          }
        });
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
    }
  };

  const renderFieldToggle = (field: keyof ReceiptFieldConfig, label: string, description?: string) => (
    <div className="flex items-center justify-between py-2">
      <div>
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
      </div>
      <button
        onClick={() => handleFieldToggle(field)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          template.visible_fields[field] ? 'bg-green-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            template.visible_fields[field] ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const renderColorPicker = (field: keyof ReceiptStyleConfig, label: string) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center space-x-2">
        <input
          type="color"
          value={template.style_config[field] as string}
          onChange={(e) => handleStyleChange(field, e.target.value)}
          className="h-8 w-16 rounded border border-gray-300"
        />
        <input
          type="text"
          value={template.style_config[field] as string}
          onChange={(e) => handleStyleChange(field, e.target.value)}
          className="flex-1 rounded-md border border-gray-300 px-3 py-1 text-sm"
        />
      </div>
    </div>
  );

  const renderSelect = (
    field: keyof ReceiptStyleConfig, 
    label: string, 
    options: { value: string | number; label: string }[]
  ) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <select
        value={template.style_config[field] as string}
        onChange={(e) => handleStyleChange(field, e.target.value)}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Receipt Designer</h2>
        <p className="text-sm text-gray-600">Customize your receipt template</p>
      </div>

      {/* Navigation */}
      <div className="px-6 py-3 border-b border-gray-200">
        <nav className="flex space-x-4">
          {[
            { id: 'basic', label: 'Basic' },
            { id: 'logo', label: 'Logo' },
            { id: 'header', label: 'Header' },
            { id: 'student', label: 'Student' },
            { id: 'payment', label: 'Payment' },
            { id: 'footer', label: 'Footer' },
            { id: 'style', label: 'Style' }
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                activeSection === section.id
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-4 space-y-6">
          {/* Basic Info */}
          {activeSection === 'basic' && (
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-900">Basic Information</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Template Name</label>
                <input
                  type="text"
                  value={template.template_name}
                  onChange={(e) => onTemplateChange({ ...template, template_name: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Enter template name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Fee Category</label>
                <select
                  value={template.template_type}
                  onChange={(e) => onTemplateChange({ ...template, template_type: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Logo Settings */}
          {activeSection === 'logo' && (
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-900">Logo Settings</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Show Logo</label>
                <button
                  onClick={() => onTemplateChange({ ...template, show_logo: !template.show_logo })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    template.show_logo ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      template.show_logo ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {template.show_logo && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Logo Position</label>
                    <select
                      value={template.logo_position}
                      onChange={(e) => onTemplateChange({ 
                        ...template, 
                        logo_position: e.target.value as 'upper-left' | 'upper-center' | 'upper-right'
                      })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    >
                      <option value="upper-left">Upper Left</option>
                      <option value="upper-center">Upper Center</option>
                      <option value="upper-right">Upper Right</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Upload Logo</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label
                        htmlFor="logo-upload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <PhotoIcon className="h-8 w-8 text-gray-400" />
                        <span className="text-sm text-gray-600 mt-2">
                          {logoFile ? 'Change Logo' : 'Upload Logo'}
                        </span>
                      </label>
                      {logoPreview && (
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="mt-2 h-16 w-auto mx-auto rounded"
                        />
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Header Fields */}
          {activeSection === 'header' && (
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-900">Header Information</h3>
              <div className="space-y-3">
                {renderFieldToggle('school_name', 'School Name', 'Display school name at the top')}
                {renderFieldToggle('school_address', 'School Address', 'Show school address')}
                {renderFieldToggle('school_contact', 'Contact Information', 'Show phone and email')}
                {renderFieldToggle('school_registration', 'Registration Number', 'Show school registration number')}
              </div>
            </div>
          )}

          {/* Student Fields */}
          {activeSection === 'student' && (
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-900">Student Information</h3>
              <div className="space-y-3">
                {renderFieldToggle('student_name', 'Student Name', 'Full name of the student')}
                {renderFieldToggle('student_id', 'Student ID', 'Student identification number')}
                {renderFieldToggle('grade_level', 'Grade Level', 'Student\'s current grade')}
                {renderFieldToggle('class_section', 'Class Section', 'Student\'s class section')}
              </div>
            </div>
          )}

          {/* Payment Fields */}
          {activeSection === 'payment' && (
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-900">Payment Information</h3>
              <div className="space-y-3">
                {renderFieldToggle('receipt_number', 'Receipt Number', 'Unique receipt identifier')}
                {renderFieldToggle('payment_date', 'Payment Date', 'Date when payment was made')}
                {renderFieldToggle('payment_method', 'Payment Method', 'How payment was made')}
                {renderFieldToggle('transaction_id', 'Transaction ID', 'Payment transaction reference')}
                {renderFieldToggle('amount', 'Amount Paid', 'Total amount paid')}
                {renderFieldToggle('fee_category', 'Fee Category', 'Type of fee paid')}
                {renderFieldToggle('academic_year', 'Academic Year', 'Current academic year')}
                {renderFieldToggle('term', 'Term', 'Academic term/semester')}
              </div>
            </div>
          )}

          {/* Footer Fields */}
          {activeSection === 'footer' && (
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-900">Footer Information</h3>
              <div className="space-y-3">
                {renderFieldToggle('custom_footer', 'Custom Footer Text', 'Add custom text at the bottom')}
                {renderFieldToggle('watermark', 'Watermark', 'Add watermark to receipt')}
                {renderFieldToggle('signature', 'Signature Line', 'Space for authorized signature')}
              </div>
            </div>
          )}

          {/* Style Settings */}
          {activeSection === 'style' && (
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-900">Styling Options</h3>
              
              <div className="space-y-4">
                {renderColorPicker('primary_color', 'Primary Color')}
                {renderColorPicker('header_background', 'Header Background')}
                
                {renderSelect('font_family', 'Font Family', [
                  { value: 'Inter', label: 'Inter' },
                  { value: 'Arial', label: 'Arial' },
                  { value: 'Times New Roman', label: 'Times New Roman' },
                  { value: 'Helvetica', label: 'Helvetica' },
                  { value: 'Georgia', label: 'Georgia' }
                ])}
                
                {renderSelect('font_size', 'Font Size', [
                  { value: 'small', label: 'Small' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'large', label: 'Large' }
                ])}
                
                {renderSelect('border_style', 'Border Style', [
                  { value: 'none', label: 'None' },
                  { value: 'solid', label: 'Solid' },
                  { value: 'dashed', label: 'Dashed' }
                ])}
                
                {renderSelect('spacing', 'Spacing', [
                  { value: 'compact', label: 'Compact' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'relaxed', label: 'Relaxed' }
                ])}
                
                {renderSelect('text_alignment', 'Text Alignment', [
                  { value: 'left', label: 'Left' },
                  { value: 'center', label: 'Center' },
                  { value: 'right', label: 'Right' }
                ])}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Currency Symbol</label>
                  <input
                    type="text"
                    value={template.style_config.currency_symbol}
                    onChange={(e) => handleStyleChange('currency_symbol', e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    placeholder="$"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Decimal Places</label>
                  <input
                    type="number"
                    min="0"
                    max="4"
                    value={template.style_config.decimal_places}
                    onChange={(e) => handleStyleChange('decimal_places', parseInt(e.target.value))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={isLoading || !template.template_name || !template.template_type}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </div>
    </div>
  );
}
