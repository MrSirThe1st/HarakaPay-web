-- Check which tables have created_by columns and their constraints
-- This helps identify all tables that need fixing

SELECT 
    t.table_name,
    c.column_name,
    c.is_nullable,
    c.column_default,
    tc.constraint_name,
    tc.constraint_type,
    kcu.referenced_table_name,
    kcu.referenced_column_name
FROM information_schema.tables t
JOIN information_schema.columns c 
    ON t.table_name = c.table_name
LEFT JOIN information_schema.table_constraints tc 
    ON t.table_name = tc.table_name
LEFT JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE t.table_schema = 'public'
    AND c.column_name = 'created_by'
ORDER BY t.table_name;
