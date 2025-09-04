// src/lib/csvParser.ts

export interface StudentImportData {
  student_id: string;
  first_name: string;
  last_name: string;
  grade_level?: string;
  enrollment_date?: string;
  status?: "active" | "inactive" | "graduated";
  // Parent information is optional and will be linked later via mobile app
  parent_name?: string;
  parent_phone?: string;
  parent_email?: string;
}

export interface ParentImportData {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  address?: string;
}

export interface CSVParseResult {
  data: StudentImportData[];
  errors: string[];
  warnings: string[];
  format: string;
}

// Common CSV column mappings for different formats
const COLUMN_MAPPINGS = {
  // Standard format
  standard: {
    student_id: ['student_id', 'studentid', 'id', 'student number', 'student_number'],
    first_name: ['first_name', 'firstname', 'first name', 'given_name', 'givenname'],
    last_name: ['last_name', 'lastname', 'last name', 'surname', 'family_name', 'familyname'],
    grade_level: ['grade_level', 'gradelevel', 'grade level', 'grade', 'class', 'year'],
    enrollment_date: ['enrollment_date', 'enrollmentdate', 'enrollment date', 'enrolled_date', 'enrolleddate', 'date_enrolled'],
    status: ['status', 'student_status', 'studentstatus', 'active_status', 'activestatus'],
    parent_name: ['parent_name', 'parentname', 'parent name', 'guardian_name', 'guardianname', 'guardian name'],
    parent_phone: ['parent_phone', 'parentphone', 'parent phone', 'guardian_phone', 'guardianphone', 'guardian phone', 'phone'],
    parent_email: ['parent_email', 'parentemail', 'parent email', 'guardian_email', 'guardianemail', 'guardian email', 'email']
  },
  // Excel export format
  excel: {
    student_id: ['student id', 'studentid', 'id', 'student number'],
    first_name: ['first name', 'firstname', 'given name', 'givenname'],
    last_name: ['last name', 'lastname', 'surname', 'family name'],
    grade_level: ['grade level', 'gradelevel', 'grade', 'class', 'year'],
    enrollment_date: ['enrollment date', 'enrollmentdate', 'enrolled date', 'date enrolled'],
    status: ['status', 'student status', 'active status'],
    parent_name: ['parent name', 'parentname', 'guardian name', 'guardianname'],
    parent_phone: ['parent phone', 'parentphone', 'guardian phone', 'phone'],
    parent_email: ['parent email', 'parentemail', 'guardian email', 'email']
  },
  // Google Sheets format
  google: {
    student_id: ['Student ID', 'StudentID', 'ID', 'Student Number'],
    first_name: ['First Name', 'FirstName', 'Given Name', 'GivenName'],
    last_name: ['Last Name', 'LastName', 'Surname', 'Family Name'],
    grade_level: ['Grade Level', 'GradeLevel', 'Grade', 'Class', 'Year'],
    enrollment_date: ['Enrollment Date', 'EnrollmentDate', 'Enrolled Date', 'Date Enrolled'],
    status: ['Status', 'Student Status', 'Active Status'],
    parent_name: ['Parent Name', 'ParentName', 'Guardian Name', 'GuardianName'],
    parent_phone: ['Parent Phone', 'ParentPhone', 'Guardian Phone', 'Phone'],
    parent_email: ['Parent Email', 'ParentEmail', 'Guardian Email', 'Email']
  }
};

export function parseCSV(csvContent: string, _filename: string): CSVParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    // Split into lines and remove empty lines
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return {
        data: [],
        errors: ['CSV file must contain at least a header row and one data row'],
        warnings: [],
        format: 'unknown'
      };
    }

    // Parse header row
    const headers = parseCSVLine(lines[0]);
    const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
    
    // Detect format based on headers
    const format = detectFormat(normalizedHeaders);
    
    // Create column mapping
    const columnMap = createColumnMapping(normalizedHeaders, format);
    
    // Validate required columns
    const missingRequired = validateRequiredColumns(columnMap);
    if (missingRequired.length > 0) {
      errors.push(`Missing required columns: ${missingRequired.join(', ')}`);
    }

    // Parse data rows
    const data: StudentImportData[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines
      
      try {
        const values = parseCSVLine(line);
        const studentData = mapRowToStudentData(values, columnMap, i + 1);
        
        if (studentData) {
          data.push(studentData);
        }
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Invalid data'}`);
      }
    }

    // Validate data
    const validationResult = validateStudentData(data);
    errors.push(...validationResult.errors);
    warnings.push(...validationResult.warnings);

    return {
      data,
      errors,
      warnings,
      format
    };

  } catch (error) {
    return {
      data: [],
      errors: [`Failed to parse CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings: [],
      format: 'unknown'
    };
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }
  
  // Add the last field
  result.push(current.trim());
  
  return result;
}

function detectFormat(headers: string[]): string {
  // Check for Google Sheets format (title case)
  const hasGoogleFormat = headers.some(h => 
    h.includes('Student ID') || h.includes('First Name') || h.includes('Last Name')
  );
  if (hasGoogleFormat) return 'google';

  // Check for Excel format (space-separated)
  const hasExcelFormat = headers.some(h => 
    h.includes('student id') || h.includes('first name') || h.includes('last name')
  );
  if (hasExcelFormat) return 'excel';

  // Default to standard format
  return 'standard';
}

function createColumnMapping(headers: string[], format: string): Record<string, number> {
  const mapping: Record<string, number> = {};
  const formatMappings = COLUMN_MAPPINGS[format as keyof typeof COLUMN_MAPPINGS] || COLUMN_MAPPINGS.standard;

  // Map each field to its column index
  Object.entries(formatMappings).forEach(([field, possibleNames]) => {
    for (const name of possibleNames) {
      const index = headers.findIndex(h => h === name);
      if (index !== -1) {
        mapping[field] = index;
        break;
      }
    }
  });

  return mapping;
}

function validateRequiredColumns(columnMap: Record<string, number>): string[] {
  const required = ['student_id', 'first_name', 'last_name'];
  return required.filter(field => columnMap[field] === undefined);
}

function mapRowToStudentData(values: string[], columnMap: Record<string, number>, rowNumber: number): StudentImportData | null {
  const student_id = getValue(values, columnMap, 'student_id', rowNumber);
  const first_name = getValue(values, columnMap, 'first_name', rowNumber);
  const last_name = getValue(values, columnMap, 'last_name', rowNumber);

  if (!student_id || !first_name || !last_name) {
    throw new Error('Missing required fields: student_id, first_name, or last_name');
  }

  return {
    student_id: student_id.trim(),
    first_name: first_name.trim(),
    last_name: last_name.trim(),
    grade_level: getValue(values, columnMap, 'grade_level', rowNumber)?.trim() || undefined,
    enrollment_date: getValue(values, columnMap, 'enrollment_date', rowNumber)?.trim() || undefined,
    status: getValue(values, columnMap, 'status', rowNumber)?.trim() as "active" | "inactive" | "graduated" || 'active',
    parent_name: getValue(values, columnMap, 'parent_name', rowNumber)?.trim() || undefined,
    parent_phone: getValue(values, columnMap, 'parent_phone', rowNumber)?.trim() || undefined,
    parent_email: getValue(values, columnMap, 'parent_email', rowNumber)?.trim() || undefined,
  };
}

function getValue(values: string[], columnMap: Record<string, number>, field: string, _rowNumber: number): string | undefined {
  const index = columnMap[field];
  if (index === undefined || index >= values.length) {
    return undefined;
  }
  return values[index];
}

function validateStudentData(data: StudentImportData[]): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for duplicate student IDs
  const studentIds = data.map(s => s.student_id);
  const duplicates = studentIds.filter((id, index) => studentIds.indexOf(id) !== index);
  if (duplicates.length > 0) {
    errors.push(`Duplicate student IDs found: ${[...new Set(duplicates)].join(', ')}`);
  }

  // Validate email formats
  data.forEach((student, index) => {
    if (student.parent_email && !isValidEmail(student.parent_email)) {
      warnings.push(`Row ${index + 2}: Invalid email format for ${student.first_name} ${student.last_name}`);
    }
  });

  // Validate phone formats
  data.forEach((student, index) => {
    if (student.parent_phone && !isValidPhone(student.parent_phone)) {
      warnings.push(`Row ${index + 2}: Invalid phone format for ${student.first_name} ${student.last_name}`);
    }
  });

  // Validate status values
  data.forEach((student, index) => {
    if (student.status && !['active', 'inactive', 'graduated'].includes(student.status)) {
      warnings.push(`Row ${index + 2}: Invalid status value for ${student.first_name} ${student.last_name}. Using 'active' as default.`);
    }
  });

  return { errors, warnings };
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{7,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Generate CSV template
export function generateCSVTemplate(): string {
  const headers = [
    'Student ID',
    'First Name', 
    'Last Name',
    'Grade Level',
    'Enrollment Date',
    'Status',
    'Parent Name',
    'Parent Phone',
    'Parent Email'
  ];
  
  const sampleData = [
    'STU001',
    'John',
    'Doe',
    'Grade 10',
    '2024-01-15',
    'active',
    'Jane Doe',
    '+1234567890',
    'jane.doe@email.com'
  ];

  return [headers.join(','), sampleData.join(',')].join('\n');
}
