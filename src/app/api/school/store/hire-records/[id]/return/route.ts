// src/app/api/school/store/hire-records/[id]/return/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabaseServerOnly';
import { HireRecord, StoreApiResponse } from '@/types/store';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile using admin client
    const adminClient = createAdminClient();
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    interface Profile {
      school_id: string | null;
      role: string;
      [key: string]: unknown;
    }
    const typedProfile = profile as Profile | null;

    if (profileError || !typedProfile) {
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
    }

    // Check if user has school-level access
    if (!typedProfile.school_id || !['school_admin', 'school_staff'].includes(typedProfile.role)) {
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
    const { data: hireRecord, error: fetchError } = await adminClient
      .from('hire_records')
      .select(`
        *,
        store_order_items (
          store_orders (
            school_id
          )
        )
      `)
      .eq('id', id)
      .single();

    interface HireRecord {
      store_order_items?: {
        store_orders?: {
          school_id: string;
        };
      };
      status?: string;
      expected_return_date?: string;
      daily_rate?: number;
      deposit?: number;
      order_item_id?: string;
      [key: string]: unknown;
    }
    const typedHireRecord = hireRecord as HireRecord | null;

    if (fetchError || !typedHireRecord) {
      return NextResponse.json({ success: false, error: 'Hire record not found' }, { status: 404 });
    }

    // Verify school ownership
    if (typedHireRecord.store_order_items?.store_orders?.school_id !== typedProfile.school_id) {
      return NextResponse.json({ success: false, error: 'Unauthorized to process this return' }, { status: 403 });
    }

    // Check if already returned
    if (typedHireRecord.status === 'returned') {
      return NextResponse.json({ success: false, error: 'Item already returned' }, { status: 400 });
    }

    // Calculate late fees if not provided
    let calculatedLateFees = lateFees || 0;
    if (!lateFees && typedHireRecord.expected_return_date && actualReturnDate > typedHireRecord.expected_return_date) {
      const daysLate = Math.ceil((new Date(actualReturnDate).getTime() - new Date(typedHireRecord.expected_return_date).getTime()) / (1000 * 60 * 60 * 24));
      
      // Get hire settings to calculate late fees
      const { data: orderItem } = await adminClient
        .from('store_order_items')
        .select(`
          store_items (
            hire_settings (
              late_fee_per_day
            )
          )
        `)
        .eq('id', typedHireRecord.order_item_id!)
        .single();

      interface OrderItem {
        store_items?: unknown;
      }
      const typedOrderItem = orderItem as OrderItem | null;

      // Handle store_items as array or single object (Supabase type inference issue)
      const storeItem = typedOrderItem?.store_items ? (Array.isArray(typedOrderItem.store_items) ? (typedOrderItem.store_items as unknown[])[0] : typedOrderItem.store_items) : undefined;
      const storeItemTyped = storeItem as { hire_settings?: unknown } | undefined;
      const hireSettings = storeItemTyped?.hire_settings ? (Array.isArray(storeItemTyped.hire_settings) ? (storeItemTyped.hire_settings as unknown[])[0] : storeItemTyped.hire_settings) : undefined;
      const hireSettingsTyped = hireSettings as { late_fee_per_day?: number } | undefined;
      const lateFeePerDay = hireSettingsTyped?.late_fee_per_day || 0;
      calculatedLateFees = daysLate * lateFeePerDay;
    }

    // Update hire record
    const { data: updatedRecord, error: updateError } = await adminClient
      .from('hire_records')
      .update({
        actual_return_date: actualReturnDate,
        deposit_returned: depositReturned !== undefined ? depositReturned : true,
        late_fees: calculatedLateFees,
        status: 'returned',
        notes: notes?.trim() || null,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', id)
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
    const { data: orderItem } = await adminClient
      .from('store_order_items')
      .select('item_id, quantity')
      .eq('id', typedHireRecord.order_item_id!)
      .single();

    interface StockOrderItem {
      item_id: string;
      quantity: number;
    }
    const typedStockOrderItem = orderItem as StockOrderItem | null;

    if (typedStockOrderItem) {
      await supabase.rpc('increment_stock', {
        item_id: typedStockOrderItem.item_id,
        quantity: typedStockOrderItem.quantity
      } as never);
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
