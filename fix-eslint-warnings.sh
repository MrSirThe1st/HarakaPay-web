#!/bin/bash

# This script fixes common ESLint warnings automatically

echo "Fixing ESLint warnings..."

# Fix unused eslint-disable directives - remove them
# AdminDashboard.tsx
sed -i '' '56d' src/app/\(dashboard\)/admin/dashboard/components/AdminDashboard.tsx

# Fix React Hook useEffect exhaustive-deps warnings by adding deps
# We'll use eslint-disable-next-line comments for these as they're intentional

# Fix unused variables in wizard steps
# GradeProgramStep.tsx - remove unused 'e' parameter
sed -i '' 's/onChange={(e) => handleProgramChange/onChange={() => handleProgramChange/' src/app/\(dashboard\)/school/fees/components/wizard-steps/GradeProgramStep.tsx

# SelectAcademicContextStep.tsx - remove unused useState
sed -i '' '/const \[isGradeDropdownOpen, setIsGradeDropdownOpen\] = useState/d' src/app/\(dashboard\)/school/fees/components/wizard-steps/SelectAcademicContextStep.tsx

# Fix unused error variables - prefix with underscore
files_to_fix=(
  "src/app/\(dashboard\)/school/fees/receipts/components/ReceiptTemplatesList.tsx"
  "src/app/\(dashboard\)/school/fees/receipts/designer/components/ReceiptDesigner.tsx"
)

for file in "${files_to_fix[@]}"; do
  if [ -f "$file" ]; then
    sed -i '' 's/} catch (err) {/} catch (_err) {/g' "$file"
  fi
done

# Fix API route unused parameters - prefix with underscore
api_files=(
  "src/app/api/academic-years/route.ts"
  "src/app/api/admin/list/route.ts"
  "src/app/api/dashboard/recent-activity/route.ts"
  "src/app/api/school/receipts/categories/route.ts"
  "src/app/api/school/receipts/route.ts"
  "src/app/api/schools/route.ts"
  "src/app/api/schools/settings/route.ts"
  "src/app/api/students/levels/route.ts"
)

for file in "${api_files[@]}"; do
  if [ -f "$file" ]; then
    sed -i '' 's/export async function GET(request:/export async function GET(_request:/g' "$file"
    sed -i '' 's/export async function GET(req:/export async function GET(_req:/g' "$file"
  fi
done

# Fix unused imports
files_with_unused=(
  "src/app/\(dashboard\)/school/students/components/BulkImportModal.tsx"
  "src/app/\(dashboard\)/school/students/components/EditStudentModal.tsx"
  "src/app/\(dashboard\)/school/students/components/ViewStudentModal.tsx"
  "src/components/school/layout/SchoolTopbar.tsx"
  "src/components/school/notifications/ScheduledNotificationsManager.tsx"
)

# Fix unused Database imports
sed -i '' '/import { Database } from/d' src/app/api/school/fees/structures/route.ts
sed -i '' '/import { Database } from/d' src/app/api/school/staff/route.ts
sed -i '' '/import { Database } from/d' src/app/api/students/\[id\]/route.ts
sed -i '' '/import { Database } from/d' src/app/api/students/bulk-delete/route.ts
sed -i '' '/import { Database } from/d' src/app/api/students/bulk-import/route.ts

echo "Done! Now run 'npm run build' to check for remaining issues."