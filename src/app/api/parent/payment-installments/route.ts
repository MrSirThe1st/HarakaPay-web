import { NextRequest, NextResponse } from 'next/server';
import { createServerAuthClient, createAdminClient } from '@/lib/supabaseServerOnly';

// Force dynamic rendering (required for Next.js 16+)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the token
    const supabase = createAdminClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get URL parameters
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('student_id');
    const categoryId = searchParams.get('category_id');
    const academicYearId = searchParams.get('academic_year_id');

    if (!studentId || !categoryId || !academicYearId) {
      return NextResponse.json({ 
        error: 'Missing required parameters',
        details: 'student_id, category_id, and academic_year_id are required'
      }, { status: 400 });
    }

    // Use admin client for data access
    const adminClient = createAdminClient();

    // Get parent's linked students to verify access
    const { data: parent } = await adminClient
      .from('parents')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!parent) {
      return NextResponse.json({
        error: 'Parent record not found',
        details: 'No parent record exists for this user'
      }, { status: 404 });
    }

    const typedParent = parent as { id: string };

    // Verify the student is linked to this parent
    const { data: parentStudent } = await adminClient
      .from('parent_students')
      .select('student_id')
      .eq('parent_id', typedParent.id)
      .eq('student_id', studentId)
      .single();

    if (!parentStudent) {
      return NextResponse.json({ 
        error: 'Access denied',
        details: 'Student is not linked to this parent'
      }, { status: 403 });
    }

    // Fetch payment installments for the specific student, category, and academic year
    const { data: studentFeeAssignments, error: assignmentsError } = await adminClient
      .from('student_fee_assignments')
      .select(`
        id,
        student_id,
        paid_amount,
        status,
        academic_year_id,
        students!inner(
          id,
          student_id,
          first_name,
          last_name,
          grade_level,
          school_id,
          schools!inner(name)
        ),
        payment_schedules!inner(
          id,
          name,
          schedule_type,
          discount_percentage,
          payment_installments(
            id,
            installment_number,
            name,
            amount,
            percentage,
            due_date,
            term_id,
            is_active
          ),
          fee_templates!inner(
            id,
            name,
            grade_level,
            program_type,
            status,
            fee_template_categories(
              amount,
              fee_categories!inner(
                id,
                name,
                description,
                is_mandatory,
                is_recurring,
                category_type
              )
            )
          )
        ),
        academic_years!inner(
          id,
          name,
          start_date,
          end_date,
          term_structure
        )
      `)
      .eq('student_id', studentId)
      .eq('academic_year_id', academicYearId)
      .in('status', ['active', 'fully_paid']); // Include active and fully paid (exclude cancelled)

    if (assignmentsError) {
      console.error('Error fetching student fee assignments:', assignmentsError);
      return NextResponse.json({ 
        error: 'Failed to fetch student fee assignments',
        details: assignmentsError.message
      }, { status: 500 });
    }

    if (!studentFeeAssignments || studentFeeAssignments.length === 0) {
      return NextResponse.json({
        installments: [],
        message: 'No fee assignments found for this student'
      });
    }

    // Define interfaces for type assertions
    interface Student {
      id: string;
      student_id: string;
      first_name: string | null;
      last_name: string | null;
      grade_level: string | null;
      school_id: string;
      schools: unknown;
    }

    interface AcademicYear {
      id: string;
      name: string;
      start_date: string;
      end_date: string;
      term_structure: unknown;
    }

    interface FeeCategory {
      id?: string;
      name?: string;
      description?: string;
      is_mandatory?: boolean;
      is_recurring?: boolean;
      category_type?: string;
    }

    interface FeeTemplateCategory {
      amount?: number;
      fee_categories?: FeeCategory | FeeCategory[];
    }

    interface FeeTemplate {
      id?: string;
      name?: string;
      grade_level?: string;
      program_type?: string;
      status?: string;
      fee_template_categories?: FeeTemplateCategory[];
    }

    interface PaymentInstallment {
      id: string;
      installment_number: number;
      name: string;
      amount: number;
      percentage: number;
      due_date: string;
      term_id: string | null;
      is_active: boolean;
    }

    interface PaymentSchedule {
      id?: string;
      name?: string;
      schedule_type?: string;
      discount_percentage?: number;
      payment_installments?: PaymentInstallment[];
      fee_templates?: FeeTemplate | FeeTemplate[];
    }

    interface StudentFeeAssignment {
      id: string;
      student_id: string;
      paid_amount?: number;
      status?: string;
      academic_year_id?: string;
      students: Student | Student[];
      academic_years: AcademicYear | AcademicYear[];
      payment_schedules?: PaymentSchedule | PaymentSchedule[];
      [key: string]: unknown;
    }

    const typedStudentFeeAssignments = studentFeeAssignments as StudentFeeAssignment[];

    // Filter assignments that contain the specific category

    const relevantAssignments = studentFeeAssignments.filter((assignment) => {
      // Handle payment_schedules as array or single object
      const paymentSchedule = Array.isArray(assignment.payment_schedules) 
        ? assignment.payment_schedules[0] 
        : assignment.payment_schedules;
      
      // Handle fee_templates as array or single object
      const feeTemplate = paymentSchedule?.fee_templates
        ? (Array.isArray(paymentSchedule.fee_templates) 
            ? paymentSchedule.fee_templates[0] 
            : paymentSchedule.fee_templates)
        : undefined;
      
      const categories = feeTemplate?.fee_template_categories || [];
      return categories.some((ftc: FeeTemplateCategory) => {
        const feeCategory = Array.isArray(ftc.fee_categories) 
          ? ftc.fee_categories[0] 
          : ftc.fee_categories;
        return feeCategory?.id === categoryId;
      });
    });

    if (relevantAssignments.length === 0) {
      return NextResponse.json({ 
        installments: [],
        message: 'No installments found for this category'
      });
    }

    // Process installments from all relevant assignments
    const allInstallments: Array<{
      id: string;
      installment_number: number;
      name: string;
      amount: number;
      percentage?: number;
      due_date: string;
      term_id?: string | null;
      is_current: boolean;
      is_paid: boolean;
      schedule_name?: string;
      schedule_type?: string;
    }> = [];
    const now = new Date();

    relevantAssignments.forEach((assignment) => {
      // Handle payment_schedules as array or single object
      const paymentSchedule = Array.isArray(assignment.payment_schedules)
        ? assignment.payment_schedules[0]
        : assignment.payment_schedules;
      const installments = (paymentSchedule?.payment_installments || []) as Array<{
        id: string;
        installment_number: number;
        name: string;
        amount: number;
        percentage?: number;
        due_date: string;
        term_id?: string;
        is_active: boolean;
        payment_status: string;
        [key: string]: unknown;
      }>;

      installments.forEach((installment) => {
        // Determine if this is the current installment
        const dueDate = new Date(installment.due_date);
        const isCurrent = dueDate <= now && installment.is_active;
        
        allInstallments.push({
          id: installment.id,
          installment_number: installment.installment_number,
          name: installment.name,
          amount: installment.amount,
          percentage: installment.percentage,
          due_date: installment.due_date,
          term_id: installment.term_id,
          is_current: isCurrent,
          is_paid: false, // TODO: Implement payment tracking
          schedule_name: paymentSchedule?.name,
          schedule_type: paymentSchedule?.schedule_type,
        });
      });
    });

    // Sort installments by installment number
    allInstallments.sort((a, b) => a.installment_number - b.installment_number);

    // Get student and academic year info
    // Handle students as array or single object (Supabase type inference issue)
    const studentData = typedStudentFeeAssignments[0]?.students;
    const student = Array.isArray(studentData) ? studentData[0] : studentData;
    const academicYearData = typedStudentFeeAssignments[0]?.academic_years;
    const academicYear = Array.isArray(academicYearData) ? academicYearData[0] : academicYearData;
    
    // Handle schools as array or single object
    const schools = student?.schools 
      ? (Array.isArray(student.schools) ? student.schools[0] : student.schools)
      : undefined;

    return NextResponse.json({ 
      installments: allInstallments,
      student: {
        id: student?.id,
        student_id: student?.student_id,
        first_name: student?.first_name,
        last_name: student?.last_name,
        grade_level: student?.grade_level,
        school_id: student?.school_id,
        school_name: schools?.name || '',
      },
      academic_year: {
        id: academicYear?.id,
        name: academicYear?.name,
        start_date: academicYear?.start_date,
        end_date: academicYear?.end_date,
        term_structure: academicYear?.term_structure,
      },
      count: allInstallments.length
    });

  } catch (error) {
    console.error('Payment installments API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
