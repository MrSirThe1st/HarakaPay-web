// src/app/api/schools/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/apiAuth';

export async function PATCH(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await authenticateRequest({
      requiredRoles: ['super_admin', 'platform_admin'],
      requireActive: true
    }, request);
    if (isAuthError(authResult)) return authResult;
    const { user, profile, adminClient } = authResult;

    console.log('User profile found:', { role: profile.role });

    // Parse request body
    const { schoolId, verificationStatus } = await request.json();

    if (!schoolId || !verificationStatus) {
      return NextResponse.json({ 
        error: 'Missing required fields: schoolId and verificationStatus' 
      }, { status: 400 });
    }

    if (!['verified', 'rejected', 'pending'].includes(verificationStatus)) {
      return NextResponse.json({ 
        error: 'Invalid verification status. Must be: verified, rejected, or pending' 
      }, { status: 400 });
    }

    // Update school verification status using admin client
    const { data: updatedSchool, error: updateError } = await adminClient
      .from('schools')
      .update({ 
        verification_status: verificationStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', schoolId)
      .select()
      .single();

    if (updateError) {
      console.error('School verification update error:', updateError);
      return NextResponse.json({ 
        error: `Failed to update school verification: ${updateError.message}` 
      }, { status: 500 });
    }

    // Log the action for audit trail
    await adminClient.from("audit_logs").insert({
      user_id: user.id,
      action: "VERIFY_SCHOOL",
      entity_type: "school",
      entity_id: schoolId,
      details: {
        school_name: updatedSchool.name,
        verification_status: verificationStatus,
        verified_by_role: profile.role,
        admin_name: `${profile.first_name} ${profile.last_name}`
      }
    });

    console.log(`Successfully updated school ${schoolId} verification status to: ${verificationStatus}`);

    return NextResponse.json({ 
      success: true,
      school: updatedSchool,
      message: `School verification status updated to ${verificationStatus}`
    });
    
  } catch (error) {
    console.error('API error in /api/schools/verify:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
