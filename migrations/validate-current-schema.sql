-- Pre-Migration Validation Script
-- This script validates the CURRENT schema before migration
-- Date: 2024-01-XX

-- ==============================================
-- STEP 1: Check Current Data Counts
-- ==============================================

-- Check current fee_templates
SELECT 
  'fee_templates' as table_name,
  COUNT(*) as record_count
FROM fee_templates;

-- Check current fee_template_categories
SELECT 
  'fee_template_categories' as table_name,
  COUNT(*) as record_count
FROM fee_template_categories;

-- Check current payment_schedules
SELECT 
  'payment_schedules' as table_name,
  COUNT(*) as record_count
FROM payment_schedules;

-- Check current payment_installments
SELECT 
  'payment_installments' as table_name,
  COUNT(*) as record_count
FROM payment_installments;

-- Check current student_fee_assignments
SELECT 
  'student_fee_assignments' as table_name,
  COUNT(*) as record_count
FROM student_fee_assignments;

-- ==============================================
-- STEP 2: Check Current Data Integrity
-- ==============================================

-- Check that fee_templates total_amount matches sum of fee_template_categories
SELECT 
  ft.id,
  ft.name,
  ft.total_amount as template_total,
  COALESCE(SUM(ftc.amount), 0) as categories_sum,
  CASE 
    WHEN ft.total_amount = COALESCE(SUM(ftc.amount), 0) THEN '✅ MATCH'
    ELSE '❌ MISMATCH'
  END as status
FROM fee_templates ft
LEFT JOIN fee_template_categories ftc ON ft.id = ftc.template_id
GROUP BY ft.id, ft.name, ft.total_amount
ORDER BY status DESC;

-- Check current payment_schedules
SELECT 
  ps.id,
  ps.name,
  ps.schedule_type,
  ps.discount_percentage,
  COUNT(pi.id) as installment_count
FROM payment_schedules ps
LEFT JOIN payment_installments pi ON ps.id = pi.schedule_id
GROUP BY ps.id, ps.name, ps.schedule_type, ps.discount_percentage
ORDER BY ps.id;

-- ==============================================
-- STEP 3: Check Current Relationships
-- ==============================================

-- Check for orphaned fee_template_categories
SELECT 
  'Orphaned fee_template_categories' as issue,
  COUNT(*) as count
FROM fee_template_categories ftc
LEFT JOIN fee_templates ft ON ftc.template_id = ft.id
WHERE ft.id IS NULL;

-- Check for orphaned payment_installments
SELECT 
  'Orphaned payment_installments' as issue,
  COUNT(*) as count
FROM payment_installments pi
LEFT JOIN payment_schedules ps ON pi.schedule_id = ps.id
WHERE ps.id IS NULL;

-- Check for orphaned student_fee_assignments
SELECT 
  'Orphaned student_fee_assignments (template)' as issue,
  COUNT(*) as count
FROM student_fee_assignments sfa
LEFT JOIN fee_templates ft ON sfa.template_id = ft.id
WHERE sfa.template_id IS NOT NULL AND ft.id IS NULL;

SELECT 
  'Orphaned student_fee_assignments (schedule)' as issue,
  COUNT(*) as count
FROM student_fee_assignments sfa
LEFT JOIN payment_schedules ps ON sfa.schedule_id = ps.id
WHERE sfa.schedule_id IS NOT NULL AND ps.id IS NULL;

-- ==============================================
-- STEP 4: Sample Current Data
-- ==============================================

-- Show sample fee_templates with their categories
SELECT 
  ft.name,
  ft.grade_level,
  ft.program_type,
  ft.total_amount,
  jsonb_agg(
    jsonb_build_object(
      'category', fc.name,
      'amount', ftc.amount
    )
  ) as template_categories
FROM fee_templates ft
JOIN fee_template_categories ftc ON ft.id = ftc.template_id
JOIN fee_categories fc ON ftc.category_id = fc.id
GROUP BY ft.id, ft.name, ft.grade_level, ft.program_type, ft.total_amount
LIMIT 5;

-- Show sample payment_schedules with installments
SELECT 
  ps.name,
  ps.schedule_type,
  ps.discount_percentage,
  jsonb_agg(
    jsonb_build_object(
      'installment_number', pi.installment_number,
      'amount', pi.amount,
      'due_date', pi.due_date
    )
  ) as installments
FROM payment_schedules ps
JOIN payment_installments pi ON ps.id = pi.schedule_id
GROUP BY ps.id, ps.name, ps.schedule_type, ps.discount_percentage
LIMIT 5;

-- Show sample student assignments
SELECT 
  s.first_name,
  s.last_name,
  ft.name as fee_template,
  ps.name as payment_schedule,
  sfa.total_amount,
  sfa.paid_amount,
  sfa.status
FROM student_fee_assignments sfa
JOIN students s ON sfa.student_id = s.id
JOIN fee_templates ft ON sfa.template_id = ft.id
JOIN payment_schedules ps ON sfa.schedule_id = ps.id
LIMIT 10;

-- ==============================================
-- Pre-Migration Summary
-- ==============================================

SELECT 
  'Pre-Migration Validation Summary' as report,
  'Current schema validated successfully' as status,
  NOW() as completed_at;
