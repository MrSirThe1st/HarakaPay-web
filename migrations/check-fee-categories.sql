-- Check what fee categories exist in your database
SELECT 
    id,
    name,
    description,
    category_type,
    school_id,
    is_active
FROM fee_categories 
ORDER BY created_at DESC;
