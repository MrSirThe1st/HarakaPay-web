import { createClient } from './supabaseClient';

export interface DashboardStats {
  totalStudents: number;
  totalSchools: number;
  totalPayments: number;
  monthlyRevenue: number;
  successRate: number;
  pendingPayments: number;
  activeStudents: number;
  totalRevenue: number;
}

export interface SchoolStats {
  totalStudents: number;
  totalPayments: number;
  monthlyRevenue: number;
  pendingPayments: number;
  successRate: number;
}

export class DashboardService {
  private supabase = createClient();

  async getAdminDashboardStats(): Promise<DashboardStats> {
    try {
      // Get total schools
      const { count: schoolsCount } = await this.supabase
        .from('schools')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      // Get total students across all schools
      const { count: studentsCount } = await this.supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get total payments
      const { count: paymentsCount } = await this.supabase
        .from('payments')
        .select('*', { count: 'exact', head: true });

      // Get monthly revenue (current month)
      const currentMonth = new Date();
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const { data: monthlyPayments } = await this.supabase
        .from('payments')
        .select('amount, status')
        .gte('payment_date', startOfMonth.toISOString())
        .lte('payment_date', endOfMonth.toISOString())
        .eq('status', 'completed');

      const monthlyRevenue = monthlyPayments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;

      // Get success rate
      const { data: allPayments } = await this.supabase
        .from('payments')
        .select('status');

      const totalPaymentsForRate = allPayments?.length || 0;
      const successfulPayments = allPayments?.filter(p => p.status === 'completed').length || 0;
      const successRate = totalPaymentsForRate > 0 ? (successfulPayments / totalPaymentsForRate) * 100 : 0;

      // Get pending payments
      const { count: pendingPayments } = await this.supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get total revenue
      const { data: allCompletedPayments } = await this.supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed');

      const totalRevenue = allCompletedPayments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;

      return {
        totalStudents: studentsCount || 0,
        totalSchools: schoolsCount || 0,
        totalPayments: paymentsCount || 0,
        monthlyRevenue,
        successRate: Math.round(successRate * 10) / 10, // Round to 1 decimal place
        pendingPayments: pendingPayments || 0,
        activeStudents: studentsCount || 0,
        totalRevenue
      };
    } catch (error) {
      console.error('Error fetching admin dashboard stats:', error);
      return {
        totalStudents: 0,
        totalSchools: 0,
        totalPayments: 0,
        monthlyRevenue: 0,
        successRate: 0,
        pendingPayments: 0,
        activeStudents: 0,
        totalRevenue: 0
      };
    }
  }

  async getSchoolDashboardStats(schoolId: string): Promise<SchoolStats> {
    try {
      // Get total students for this school
      const { count: studentsCount } = await this.supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', schoolId)
        .eq('status', 'active');

      // Get total payments for this school's students
      const { data: payments } = await this.supabase
        .from('payments')
        .select('amount, status')
        .in('student_id', 
          this.supabase
            .from('students')
            .select('id')
            .eq('school_id', schoolId)
        );

      const totalPayments = payments?.length || 0;
      const totalAmount = payments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;

      // Get monthly revenue for this school
      const currentMonth = new Date();
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const { data: monthlyPayments } = await this.supabase
        .from('payments')
        .select('amount, status')
        .in('student_id', 
          this.supabase
            .from('students')
            .select('id')
            .eq('school_id', schoolId)
        )
        .gte('payment_date', startOfMonth.toISOString())
        .lte('payment_date', endOfMonth.toISOString())
        .eq('status', 'completed');

      const monthlyRevenue = monthlyPayments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;

      // Get pending payments for this school
      const { data: pendingPayments } = await this.supabase
        .from('payments')
        .select('*')
        .in('student_id', 
          this.supabase
            .from('students')
            .select('id')
            .eq('school_id', schoolId)
        )
        .eq('status', 'pending');

      const pendingCount = pendingPayments?.length || 0;

      // Calculate success rate for this school
      const successfulPayments = payments?.filter(p => p.status === 'completed').length || 0;
      const successRate = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0;

      return {
        totalStudents: studentsCount || 0,
        totalPayments,
        monthlyRevenue,
        pendingPayments: pendingCount,
        successRate: Math.round(successRate * 10) / 10
      };
    } catch (error) {
      console.error('Error fetching school dashboard stats:', error);
      return {
        totalStudents: 0,
        totalPayments: 0,
        monthlyRevenue: 0,
        pendingPayments: 0,
        successRate: 0
      };
    }
  }

  async getRecentActivity(limit: number = 5) {
    try {
      const { data: recentPayments } = await this.supabase
        .from('payments')
        .select(`
          id,
          amount,
          status,
          payment_date,
          description,
          students (
            first_name,
            last_name,
            schools (
              name
            )
          )
        `)
        .order('payment_date', { ascending: false })
        .limit(limit);

      return recentPayments || [];
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }
}

export const dashboardService = new DashboardService();

