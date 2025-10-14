// src/app/(dashboard)/school/fees/receipts/components/ReceiptPreview.tsx
"use client";

import React from 'react';
import { PrinterIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { ReceiptTemplateForm, ReceiptPreviewData, MOCK_PREVIEW_DATA } from '@/types/receipt';

interface ReceiptPreviewProps {
  template: ReceiptTemplateForm;
  previewData?: ReceiptPreviewData;
}

export function ReceiptPreview({ template, previewData = MOCK_PREVIEW_DATA }: ReceiptPreviewProps) {
  const getFontSize = () => {
    switch (template.style_config.font_size) {
      case 'small': return 'text-xs';
      case 'large': return 'text-lg';
      default: return 'text-sm';
    }
  };

  const getSpacing = () => {
    switch (template.style_config.spacing) {
      case 'compact': return 'space-y-1';
      case 'relaxed': return 'space-y-4';
      default: return 'space-y-2';
    }
  };

  const getBorderStyle = () => {
    switch (template.style_config.border_style) {
      case 'solid': return 'border-solid';
      case 'dashed': return 'border-dashed';
      default: return 'border-none';
    }
  };

  const getTextAlignment = () => {
    switch (template.style_config.text_alignment) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  const formatAmount = (amount: number) => {
    const symbol = template.style_config.currency_symbol;
    const decimals = template.style_config.decimal_places;
    return `${symbol}${amount.toLocaleString('en-US', { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    })}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // For now, just trigger print dialog
    // In a real implementation, you'd generate a PDF
    window.print();
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Live Preview</h2>
          <div className="flex space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <PrinterIcon className="h-4 w-4 mr-2" />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Download
            </button>
          </div>
        </div>
      </div>

      {/* Receipt Preview */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-md mx-auto">
          {/* Receipt Container */}
          <div 
            className={`bg-white shadow-lg rounded-lg p-6 border-2 ${getBorderStyle()}`}
            style={{ 
              fontFamily: template.style_config.font_family,
              borderColor: template.style_config.primary_color 
            }}
          >
            {/* Header Section */}
            <div 
              className={`${getTextAlignment()} ${getSpacing()} mb-6`}
              style={{ backgroundColor: template.style_config.header_background }}
            >
              {/* Logo */}
              {template.show_logo && (
                <div className={`flex ${template.logo_position === 'upper-center' ? 'justify-center' : 
                  template.logo_position === 'upper-right' ? 'justify-end' : 'justify-start'} mb-4`}>
                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                    {template.style_config.logo_url ? (
                      <img 
                        src={template.style_config.logo_url} 
                        alt="School Logo" 
                        className="w-full h-full object-contain rounded"
                      />
                    ) : (
                      <span className="text-gray-500 text-xs">LOGO</span>
                    )}
                  </div>
                </div>
              )}

              {/* School Information */}
              {template.visible_fields.school_name && (
                <h1 
                  className={`font-bold ${getFontSize()}`}
                  style={{ color: template.style_config.primary_color }}
                >
                  {previewData.school.name}
                </h1>
              )}

              {template.visible_fields.school_address && (
                <p className={`${getFontSize()} text-gray-600`}>
                  {previewData.school.address}
                </p>
              )}

              {template.visible_fields.school_contact && (
                <div className={`${getFontSize()} text-gray-600`}>
                  <p>{previewData.school.phone}</p>
                  <p>{previewData.school.email}</p>
                </div>
              )}

              {template.visible_fields.school_registration && (
                <p className={`${getFontSize()} text-gray-500`}>
                  Reg. No: {previewData.school.registration_number}
                </p>
              )}
            </div>

            {/* Receipt Title */}
            <div className={`${getTextAlignment()} mb-6`}>
              <h2 
                className={`font-bold ${getFontSize()}`}
                style={{ color: template.style_config.primary_color }}
              >
                PAYMENT RECEIPT
              </h2>
            </div>

            {/* Student Information */}
            <div className={`${getSpacing()} mb-6`}>
              <h3 
                className={`font-semibold ${getFontSize()} mb-3`}
                style={{ color: template.style_config.primary_color }}
              >
                Student Information
              </h3>
              
              <div className={`${getSpacing()}`}>
                {template.visible_fields.student_name && (
                  <div className="flex justify-between">
                    <span className={`${getFontSize()} text-gray-600`}>Student Name:</span>
                    <span className={`${getFontSize()} font-medium`}>{previewData.student.name}</span>
                  </div>
                )}
                
                {template.visible_fields.student_id && (
                  <div className="flex justify-between">
                    <span className={`${getFontSize()} text-gray-600`}>Student ID:</span>
                    <span className={`${getFontSize()} font-medium`}>{previewData.student.id}</span>
                  </div>
                )}
                
                {template.visible_fields.grade_level && (
                  <div className="flex justify-between">
                    <span className={`${getFontSize()} text-gray-600`}>Grade Level:</span>
                    <span className={`${getFontSize()} font-medium`}>{previewData.student.grade}</span>
                  </div>
                )}
                
                {template.visible_fields.class_section && (
                  <div className="flex justify-between">
                    <span className={`${getFontSize()} text-gray-600`}>Section:</span>
                    <span className={`${getFontSize()} font-medium`}>{previewData.student.section}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Information */}
            <div className={`${getSpacing()} mb-6`}>
              <h3 
                className={`font-semibold ${getFontSize()} mb-3`}
                style={{ color: template.style_config.primary_color }}
              >
                Payment Information
              </h3>
              
              <div className={`${getSpacing()}`}>
                {template.visible_fields.receipt_number && (
                  <div className="flex justify-between">
                    <span className={`${getFontSize()} text-gray-600`}>Receipt No:</span>
                    <span className={`${getFontSize()} font-medium`}>{previewData.payment.receipt_number}</span>
                  </div>
                )}
                
                {template.visible_fields.payment_date && (
                  <div className="flex justify-between">
                    <span className={`${getFontSize()} text-gray-600`}>Payment Date:</span>
                    <span className={`${getFontSize()} font-medium`}>{previewData.payment.date}</span>
                  </div>
                )}
                
                {template.visible_fields.payment_method && (
                  <div className="flex justify-between">
                    <span className={`${getFontSize()} text-gray-600`}>Payment Method:</span>
                    <span className={`${getFontSize()} font-medium`}>{previewData.payment.method}</span>
                  </div>
                )}
                
                {template.visible_fields.transaction_id && (
                  <div className="flex justify-between">
                    <span className={`${getFontSize()} text-gray-600`}>Transaction ID:</span>
                    <span className={`${getFontSize()} font-medium`}>{previewData.payment.transaction_id}</span>
                  </div>
                )}
                
                {template.visible_fields.amount && (
                  <div className="flex justify-between border-t pt-2 mt-3">
                    <span className={`${getFontSize()} font-semibold`}>Amount Paid:</span>
                    <span 
                      className={`${getFontSize()} font-bold`}
                      style={{ color: template.style_config.primary_color }}
                    >
                      {formatAmount(previewData.payment.amount)}
                    </span>
                  </div>
                )}
                
                {template.visible_fields.fee_category && (
                  <div className="flex justify-between">
                    <span className={`${getFontSize()} text-gray-600`}>Fee Category:</span>
                    <span className={`${getFontSize()} font-medium`}>{previewData.payment.category}</span>
                  </div>
                )}
                
                {template.visible_fields.academic_year && (
                  <div className="flex justify-between">
                    <span className={`${getFontSize()} text-gray-600`}>Academic Year:</span>
                    <span className={`${getFontSize()} font-medium`}>{previewData.payment.academic_year}</span>
                  </div>
                )}
                
                {template.visible_fields.term && (
                  <div className="flex justify-between">
                    <span className={`${getFontSize()} text-gray-600`}>Term:</span>
                    <span className={`${getFontSize()} font-medium`}>{previewData.payment.term}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Section */}
            <div className={`${getTextAlignment()} ${getSpacing()} mt-8 pt-4 border-t`}>
              {template.visible_fields.custom_footer && (
                <p className={`${getFontSize()} text-gray-600 mb-4`}>
                  Thank you for your payment. Please keep this receipt for your records.
                </p>
              )}
              
              {template.visible_fields.signature && (
                <div className="mt-6">
                  <div className="border-b border-gray-400 w-32 mx-auto mb-2"></div>
                  <p className={`${getFontSize()} text-gray-600`}>Authorized Signature</p>
                </div>
              )}
              
              {template.visible_fields.watermark && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                  <span 
                    className="text-6xl font-bold transform -rotate-45"
                    style={{ color: template.style_config.primary_color }}
                  >
                    PAID
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
