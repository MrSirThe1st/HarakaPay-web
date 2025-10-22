-- Check what academic years exist in your database
SELECT 
    id,
    name,
    start_date,
    end_date,
    school_id,
    is_active
FROM academic_years 
ORDER BY created_at DESC;
