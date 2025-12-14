import { NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';

export async function GET(req: Request) {
  try {
    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin', 'school_staff'],
      requireSchool: true,
      requireActive: true
    }, req);
    if (isAuthError(authResult)) return authResult;
    const { profile, adminClient } = authResult;

    if (!profile.school_id) {
      return NextResponse.json({ error: 'No school assigned' }, { status: 400 });
    }

    // Get URL parameters for filtering
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Build query for academic years
    let query = adminClient
      .from('academic_years')
      .select('*', { count: 'exact' })
      .eq('school_id', profile.school_id);

    // Apply pagination
    query = query.range(offset, offset + limit - 1).order('start_date', { ascending: false });

    const { data: academicYears, error: academicYearsError, count } = await query;

    if (academicYearsError) {
      console.error('Error fetching academic years:', academicYearsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch academic years' },
        { status: 500 }
      );
    }

    const typedAcademicYears = academicYears as { is_active: boolean }[] | null;

    // Calculate statistics
    const totalYears = count || 0;
    const activeYears = typedAcademicYears?.filter(y => y.is_active).length || 0;

    return NextResponse.json({
      success: true,
      data: {
        academicYears: typedAcademicYears || [],
        pagination: {
          page,
          limit,
          total: totalYears,
          pages: Math.ceil(totalYears / limit)
        },
        stats: {
          total: totalYears,
          active: activeYears
        }
      }
    });

  } catch (error) {
    console.error('Academic years API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin'],
      requireSchool: true,
      requireActive: true
    }, req);
    if (isAuthError(authResult)) return authResult;
    const { profile, adminClient } = authResult;

    if (!profile.school_id) {
      return NextResponse.json({ error: 'No school assigned' }, { status: 400 });
    }

    const body = await req.json();
    const { 
      name, 
      start_date, 
      end_date, 
      term_structure,
      is_active = false
    } = body;

    // Validate required fields
    if (!name || !start_date || !end_date || !term_structure) {
      return NextResponse.json(
        { success: false, error: 'Name, start date, end date, and term structure are required' }, 
        { status: 400 }
      );
    }

    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    
    if (startDate >= endDate) {
      return NextResponse.json(
        { success: false, error: 'Start date must be before end date' }, 
        { status: 400 }
      );
    }

    // If setting as active, deactivate other years
    if (is_active) {
      await adminClient
        .from('academic_years')
        .update({ is_active: false } as never)
        .eq('school_id', profile.school_id);
    }

    // Create academic year
    const { data: newAcademicYear, error: createError } = await adminClient
      .from('academic_years')
      .insert({
        name,
        start_date,
        end_date,
        term_structure,
        is_active,
        school_id: profile.school_id
      } as any)
      .select('*')
      .single();

    if (createError) {
      console.error('Academic year creation error:', createError);
      return NextResponse.json(
        { success: false, error: 'Failed to create academic year' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        academicYear: newAcademicYear
      },
      message: 'Academic year created successfully'
    });

  } catch (error) {
    console.error('Create academic year error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin'],
      requireSchool: true,
      requireActive: true
    }, req);
    if (isAuthError(authResult)) return authResult;
    const { profile, adminClient } = authResult;

    if (!profile.school_id) {
      return NextResponse.json({ error: 'No school assigned' }, { status: 400 });
    }

    const body = await req.json();
    const { 
      id,
      name, 
      start_date, 
      end_date, 
      term_structure,
      is_active
    } = body;

    // Validate required fields
    if (!id || !name || !start_date || !end_date || !term_structure) {
      return NextResponse.json(
        { success: false, error: 'ID, name, start date, end date, and term structure are required' }, 
        { status: 400 }
      );
    }

    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    
    if (startDate >= endDate) {
      return NextResponse.json(
        { success: false, error: 'Start date must be before end date' }, 
        { status: 400 }
      );
    }

    // Check if academic year exists and belongs to school
    const { data: existingYear } = await adminClient
      .from('academic_years')
      .select('id')
      .eq('id', id)
      .eq('school_id', profile.school_id)
      .single();

    if (!existingYear) {
      return NextResponse.json(
        { success: false, error: 'Academic year not found' }, 
        { status: 404 }
      );
    }

    // If setting as active, deactivate other years
    if (is_active) {
      await adminClient
        .from('academic_years')
        .update({ is_active: false } as never)
        .eq('school_id', profile.school_id)
        .neq('id', id);
    }

    // Update academic year
    const { data: updatedAcademicYear, error: updateError } = await adminClient
      .from('academic_years')
      .update({
        name,
        start_date,
        end_date,
        term_structure,
        is_active: is_active || false
      } as never)
      .eq('id', id)
      .eq('school_id', profile.school_id)
      .select('*')
      .single();

    if (updateError) {
      console.error('Academic year update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update academic year' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        academicYear: updatedAcademicYear
      },
      message: 'Academic year updated successfully'
    });

  } catch (error) {
    console.error('Update academic year error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const authResult = await authenticateRequest({
      requiredRoles: ['school_admin'],
      requireSchool: true,
      requireActive: true
    }, req);
    if (isAuthError(authResult)) return authResult;
    const { profile, adminClient } = authResult;

    if (!profile.school_id) {
      return NextResponse.json({ error: 'No school assigned' }, { status: 400 });
    }

    // Get ID from query parameters
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Academic year ID is required' }, 
        { status: 400 }
      );
    }

    // Check if academic year exists and belongs to school
    const { data: existingYear } = await adminClient
      .from('academic_years')
      .select('id, name')
      .eq('id', id)
      .eq('school_id', profile.school_id)
      .single();

    if (!existingYear) {
      return NextResponse.json(
        { success: false, error: 'Academic year not found' }, 
        { status: 404 }
      );
    }

            // Cascade delete all related data
            try {
              // First, get all fee template IDs for this academic year
              const { data: feeTemplates } = await adminClient
                .from('fee_templates')
                .select('id')
                .eq('academic_year_id', id);

              const typedFeeTemplates = feeTemplates as { id: string }[] | null;
              const templateIds = typedFeeTemplates?.map(t => t.id) || [];

              if (templateIds.length > 0) {
                // Get all payment schedule IDs for these templates
                const { data: paymentSchedules } = await adminClient
                  .from('payment_schedules')
                  .select('id')
                  .in('template_id', templateIds);

                const typedPaymentSchedules = paymentSchedules as { id: string }[] | null;
                const scheduleIds = typedPaymentSchedules?.map(s => s.id) || [];

                // Get all student fee assignment IDs for these templates
                const { data: studentAssignments } = await adminClient
                  .from('student_fee_assignments')
                  .select('id')
                  .in('template_id', templateIds);

                const typedStudentAssignments = studentAssignments as { id: string }[] | null;
                const assignmentIds = typedStudentAssignments?.map(a => a.id) || [];

                // 1. Delete payment installments (if they exist)
                if (scheduleIds.length > 0) {
                  await adminClient
                    .from('payment_installments')
                    .delete()
                    .in('schedule_id', scheduleIds);
                }

                // 2. Delete payment schedules
                await adminClient
                  .from('payment_schedules')
                  .delete()
                  .in('template_id', templateIds);

                // 3. Delete fee template categories
                await adminClient
                  .from('fee_template_categories')
                  .delete()
                  .in('template_id', templateIds);

                // 4. Delete student fee assignments
                await adminClient
                  .from('student_fee_assignments')
                  .delete()
                  .in('template_id', templateIds);

                // 5. Delete student fee payments
                if (assignmentIds.length > 0) {
                  await adminClient
                    .from('student_fee_payments')
                    .delete()
                    .in('assignment_id', assignmentIds);
                }

                // 6. Delete fee adjustments
                if (assignmentIds.length > 0) {
                  await adminClient
                    .from('fee_adjustments')
                    .delete()
                    .in('assignment_id', assignmentIds);
                }

                // 7. Delete fee templates
                await adminClient
                  .from('fee_templates')
                  .delete()
                  .eq('academic_year_id', id);
              }

              // 8. Delete fee audit trail
              await adminClient
                .from('fee_audit_trail')
                .delete()
                .eq('academic_year_id', id);

              // 9. Delete academic terms
              await adminClient
                .from('academic_terms')
                .delete()
                .eq('academic_year_id', id);

              // 10. Finally, delete the academic year
              const { error: deleteError } = await adminClient
                .from('academic_years')
                .delete()
                .eq('id', id)
                .eq('school_id', profile.school_id);

              if (deleteError) {
                console.error('Academic year deletion error:', deleteError);
                return NextResponse.json(
                  { success: false, error: 'Failed to delete academic year' }, 
                  { status: 500 }
                );
              }

            } catch (cascadeError) {
              console.error('Cascade deletion error:', cascadeError);
              return NextResponse.json(
                { success: false, error: 'Failed to delete related data. Please try again.' }, 
                { status: 500 }
              );
            }

    return NextResponse.json({
      success: true,
      message: 'Academic year deleted successfully'
    });

  } catch (error) {
    console.error('Delete academic year error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }, 
      { status: 500 }
    );
  }
}
