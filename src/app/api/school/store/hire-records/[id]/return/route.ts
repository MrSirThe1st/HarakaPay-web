// src/app/api/school/store/hire-records/[id]/return/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { HireRecord, StoreApiResponse } from '@/types/store';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
    }

    // Check if user has school-level access
    if (!profile.school_id || !['school_admin', 'school_staff'].includes(profile.role)) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { actualReturnDate, notes, depositReturned, lateFees } = body;

    // Validate return date
    if (!actualReturnDate) {
      return NextResponse.json({ success: false, error: 'Return date is required' }, { status: 400 });
    }

    // Check if hire record exists and belongs to school
    const { data: hireRecord, error: fetchError } = await supabase
      .from('hire_records')
      .select(`
        *,
        store_order_items (
          store_orders (
            school_id
          )
        )
      `)
      .eq('id', params.id)
      .single();

    if (fetchError || !hireRecord) {
      return NextResponse.json({ success: false, error: 'Hire record not found' }, { status: 404 });
    }

    // Verify school ownership
    if (hireRecord.store_order_items?.store_orders?.school_id !== profile.school_id) {
      return NextResponse.json({ success: false, error: 'Unauthorized to process this return' }, { status: 403 });
    }

    // Check if already returned
    if (hireRecord.status === 'returned') {
      return NextResponse.json({ success: false, error: 'Item already returned' }, { status: 400 });
    }

    // Calculate late fees if not provided
    let calculatedLateFees = lateFees || 0;
    if (!lateFees && actualReturnDate > hireRecord.expected_return_date) {
      const daysLate = Math.ceil((new Date(actualReturnDate).getTime() - new Date(hireRecord.expected_return_date).getTime()) / (1000 * 60 * 60 * 24));
      
      // Get hire settings to calculate late fees
      const { data: orderItem } = await supabase
        .from('store_order_items')
        .select(`
          store_items (
            hire_settings (
              late_fee_per_day
            )
          )
        `)
        .eq('id', hireRecord.order_item_id)
        .single();

      const lateFeePerDay = orderItem?.store_items?.hire_settings?.late_fee_per_day || 0;
      calculatedLateFees = daysLate * lateFeePerDay;
    }

    // Update hire record
    const { data: updatedRecord, error: updateError } = await supabase
      .from('hire_records')
      .update({
        actual_return_date: actualReturnDate,
        deposit_returned: depositReturned !== undefined ? depositReturned : true,
        late_fees: calculatedLateFees,
        status: 'returned',
        notes: notes?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select(`
        *,
        store_order_items (
          id,
          quantity,
          unit_price,
          subtotal,
          store_items (
            id,
            name,
            description,
            item_type,
            price,
            images
          ),
          store_orders (
            id,
            order_number,
            parent_id,
            student_id,
            status,
            payment_status,
            parents (
              id,
              first_name,
              last_name,
              email
            ),
            students (
              id,
              first_name,
              last_name,
              student_id
            )
          )
        )
      `)
      .single();

    if (updateError) {
      console.error('Error updating hire record:', updateError);
      return NextResponse.json({ success: false, error: 'Failed to process return' }, { status: 500 });
    }

    // Restore stock quantity
    const { data: orderItem } = await supabase
      .from('store_order_items')
      .select('item_id, quantity')
      .eq('id', hireRecord.order_item_id)
      .single();

    if (orderItem) {
      await supabase.rpc('increment_stock', {
        item_id: orderItem.item_id,
        quantity: orderItem.quantity
      });
    }

    const response: StoreApiResponse<{ record: HireRecord }> = {
      success: true,
      data: { record: updatedRecord },
      message: 'Return processed successfully',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in hire record return:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
