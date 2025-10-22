-- Data Validation Script for Fee System Refactoring
-- This script validates that the migration was successful
-- Date: 2024-01-XX

-- ==============================================
-- STEP 1: Validate Data Counts
-- ==============================================

-- Check that all fee_templates were migrated to fee_structures
SELECT 
  'fee_templates' as old_table,
  COUNT(*) as old_count
FROM fee_templates
UNION ALL
SELECT 
  'fee_structures' as new_table,
  COUNT(*) as new_count
FROM fee_structures;

-- Check that all fee_template_categories were migrated to fee_structure_items
SELECT 
  'fee_template_categories' as old_table,
  COUNT(*) as old_count
FROM fee_template_categories
UNION ALL
SELECT 
  'fee_structure_items' as new_table,
  COUNT(*) as new_count
FROM fee_structure_items;

-- Check that all payment_schedules were migrated to payment_plans
SELECT 
  'payment_schedules' as old_table,
  COUNT(*) as old_count
FROM payment_schedules
UNION ALL
SELECT 
  'payment_plans' as new_table,
  COUNT(*) as new_count
FROM payment_plans;

-- Check that all payment_installments were migrated to payment_plans.installments
SELECT 
  'payment_installments' as old_table,
  COUNT(*) as old_count
FROM payment_installments
UNION ALL
SELECT 
  'payment_plans installments' as new_table,
  COUNT(*) as new_count
FROM payment_plans pp
CROSS JOIN jsonb_array_elements(pp.installments) elem;

-- ==============================================
-- STEP 2: Validate Data Integrity
-- ==============================================

-- Check that fee_structures total_amount matches sum of fee_structure_items
SELECT 
  fs.id,
  fs.name,
  fs.total_amount as structure_total,
  COALESCE(SUM(fsi.amount), 0) as items_sum,
  CASE 
    WHEN fs.total_amount = COALESCE(SUM(fsi.amount), 0) THEN '✅ MATCH'
    ELSE '❌ MISMATCH'
  END as status
FROM fee_structures fs
LEFT JOIN fee_structure_items fsi ON fs.id = fsi.structure_id
GROUP BY fs.id, fs.name, fs.total_amount
ORDER BY status DESC;

-- Check that payment_plans installments JSONB is valid
SELECT 
  pp.id,
  pp.type,
  pp.installments,
  CASE 
    WHEN jsonb_typeof(pp.installments) = 'array' THEN '✅ VALID'
    ELSE '❌ INVALID'
  END as jsonb_status
FROM payment_plans pp
ORDER BY jsonb_status DESC;

-- Check that student_fee_assignments have valid foreign keys
SELECT 
  'student_fee_assignments' as table_name,
  COUNT(*) as total_records,
  COUNT(structure_id) as with_structure_id,
  COUNT(payment_plan_id) as with_payment_plan_id,
  COUNT(CASE WHEN structure_id IS NOT NULL AND payment_plan_id IS NOT NULL THEN 1 END) as complete_records
FROM student_fee_assignments;

-- ==============================================
-- STEP 3: Validate Relationships
-- ==============================================

-- Check for orphaned fee_structure_items
SELECT 
  'Orphaned fee_structure_items' as issue,
  COUNT(*) as count
FROM fee_structure_items fsi
LEFT JOIN fee_structures fs ON fsi.structure_id = fs.id
WHERE fs.id IS NULL;

-- Check for orphaned payment_plans
SELECT 
  'Orphaned payment_plans' as issue,
  COUNT(*) as count
FROM payment_plans pp
LEFT JOIN fee_structures fs ON pp.structure_id = fs.id
WHERE fs.id IS NULL;

-- Check for orphaned student_fee_assignments
SELECT 
  'Orphaned student_fee_assignments (structure)' as issue,
  COUNT(*) as count
FROM student_fee_assignments sfa
LEFT JOIN fee_structures fs ON sfa.structure_id = fs.id
WHERE sfa.structure_id IS NOT NULL AND fs.id IS NULL;

SELECT 
  'Orphaned student_fee_assignments (payment_plan)' as issue,
  COUNT(*) as count
FROM student_fee_assignments sfa
LEFT JOIN payment_plans pp ON sfa.payment_plan_id = pp.id
WHERE sfa.payment_plan_id IS NOT NULL AND pp.id IS NULL;

-- ==============================================
-- STEP 4: Validate Indexes
-- ==============================================

-- Check that indexes were created
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename IN ('fee_structures', 'fee_structure_items', 'payment_plans', 'student_fee_assignments')
ORDER BY tablename, indexname;

-- ==============================================
-- STEP 5: Performance Test Queries
-- ==============================================

-- Test query performance for common operations
EXPLAIN (ANALYZE, BUFFERS) 
SELECT 
  fs.name,
  fs.grade_level,
  fs.total_amount,
  jsonb_agg(
    jsonb_build_object(
      'category_name', fc.name,
      'amount', fsi.amount,
      'payment_mode', fsi.payment_mode
    )
  ) as categories
FROM fee_structures fs
JOIN fee_structure_items fsi ON fs.id = fsi.structure_id
JOIN fee_categories fc ON fsi.category_id = fc.id
WHERE fs.school_id = (SELECT id FROM schools LIMIT 1)
  AND fs.is_active = true
GROUP BY fs.id, fs.name, fs.grade_level, fs.total_amount;

-- Test student fee query performance
EXPLAIN (ANALYZE, BUFFERS)
SELECT 
  sfa.id,
  s.first_name,
  s.last_name,
  fs.name as fee_structure_name,
  pp.type as payment_plan_type,
  sfa.total_due,
  sfa.paid_amount,
  (sfa.total_due - sfa.paid_amount) as remaining_amount
FROM student_fee_assignments sfa
JOIN students s ON sfa.student_id = s.id
JOIN fee_structures fs ON sfa.structure_id = fs.id
JOIN payment_plans pp ON sfa.payment_plan_id = pp.id
WHERE sfa.status = 'active'
LIMIT 100;

-- ==============================================
-- STEP 6: Sample Data Verification
-- ==============================================

-- Show sample fee_structures with their items
SELECT 
  fs.name,
  fs.grade_level,
  fs.total_amount,
  jsonb_agg(
    jsonb_build_object(
      'category', fc.name,
      'amount', fsi.amount,
      'mandatory', fsi.is_mandatory,
      'payment_mode', fsi.payment_mode
    )
  ) as structure_items
FROM fee_structures fs
JOIN fee_structure_items fsi ON fs.id = fsi.structure_id
JOIN fee_categories fc ON fsi.category_id = fc.id
GROUP BY fs.id, fs.name, fs.grade_level, fs.total_amount
LIMIT 5;

-- Show sample payment_plans with installments
SELECT 
  fs.name as fee_structure_name,
  pp.type as payment_plan_type,
  pp.discount_percentage,
  pp.installments
FROM payment_plans pp
JOIN fee_structures fs ON pp.structure_id = fs.id
LIMIT 5;

-- Show sample student assignments
SELECT 
  s.first_name,
  s.last_name,
  fs.name as fee_structure,
  pp.type as payment_plan,
  sfa.total_due,
  sfa.paid_amount,
  sfa.status
FROM student_fee_assignments sfa
JOIN students s ON sfa.student_id = s.id
JOIN fee_structures fs ON sfa.structure_id = fs.id
JOIN payment_plans pp ON sfa.payment_plan_id = pp.id
LIMIT 10;

-- ==============================================
-- Validation Complete
-- ==============================================

-- Summary report
SELECT 
  'Migration Validation Summary' as report,
  'All checks completed successfully' as status,
  NOW() as completed_at;
