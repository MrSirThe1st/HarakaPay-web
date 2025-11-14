// src/lib/dashboardService.ts
import { createAdminClient } from '@/lib/supabaseServerOnly';

export interface AdminDashboardStats {
  totalSchools: number;
  activeUsers: number;
  totalRevenue: number;
  growthRate: number;
  schoolsChange: number;
  usersChange: number;
  revenueChange: number;
  growthChange: number;
}

export interface SchoolDashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalRevenue: number;
  monthlyRevenue: number;
  studentsChange: number;
  revenueChange: number;
}

export interface RecentActivity {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  user_name: string;
  created_at: string;
}

export class DashboardService {
  private getAdminClient() {
    return createAdminClient();
  }

  async getAdminDashboardStats(): Promise<AdminDashboardStats> {
    try {
      // Get current month and last month for comparison
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      // Get total schools count
      const { count: totalSchools } = await this.getAdminClient()
        .from('schools')
        .select('*', { count: 'exact', head: true });

      // Get schools count from last month for comparison
      const lastMonthStart = new Date(lastMonthYear, lastMonth, 1);
      const lastMonthEnd = new Date(lastMonthYear, lastMonth + 1, 0);
      
      const { count: lastMonthSchools } = await this.getAdminClient()
        .from('schools')
        .select('*', { count: 'exact', head: true })
        .lte('created_at', lastMonthEnd.toISOString());

      // Get active users count (profiles with is_active = true)
      const { count: activeUsers } = await this.getAdminClient()
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get active users count from last month
      const { count: lastMonthUsers } = await this.getAdminClient()
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .lte('created_at', lastMonthEnd.toISOString());

      // Get total revenue from completed payments
      const { data: payments } = await this.getAdminClient()
        .from('payments')
        .select('amount')
        .eq('status', 'completed');

      const totalRevenue = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

      // Get revenue from last month
      const { data: lastMonthPayments } = await this.getAdminClient()
        .from('payments')
        .select('amount')
        .eq('status', 'completed')
        .gte('payment_date', lastMonthStart.toISOString())
        .lte('payment_date', lastMonthEnd.toISOString());

      const lastMonthRevenue = lastMonthPayments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

      // Calculate growth rate (overall platform growth based on new users)
      const currentMonthStart = new Date(currentYear, currentMonth, 1);
      const { count: currentMonthNewUsers } = await this.getAdminClient()
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', currentMonthStart.toISOString());

      const { count: lastMonthNewUsers } = await this.getAdminClient()
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', lastMonthStart.toISOString())
        .lte('created_at', lastMonthEnd.toISOString());

      // Calculate percentage changes
      const schoolsChange = lastMonthSchools && lastMonthSchools > 0 
        ? ((totalSchools || 0) - lastMonthSchools) / lastMonthSchools * 100 
        : 0;

      const usersChange = lastMonthUsers && lastMonthUsers > 0 
        ? ((activeUsers || 0) - lastMonthUsers) / lastMonthUsers * 100 
        : 0;

      const revenueChange = lastMonthRevenue > 0 
        ? (totalRevenue - lastMonthRevenue) / lastMonthRevenue * 100 
        : 0;

      const growthRate = lastMonthNewUsers && lastMonthNewUsers > 0 
        ? ((currentMonthNewUsers || 0) - lastMonthNewUsers) / lastMonthNewUsers * 100 
        : 0;

      const growthChange = lastMonthNewUsers && lastMonthNewUsers > 0 
        ? ((currentMonthNewUsers || 0) - lastMonthNewUsers) / lastMonthNewUsers * 100 
        : 0;

      return {
        totalSchools: totalSchools || 0,
        activeUsers: activeUsers || 0,
        totalRevenue,
        growthRate,
        schoolsChange,
        usersChange,
        revenueChange,
        growthChange
      };
    } catch (error) {
      console.error('Error fetching admin dashboard stats:', error);
      throw new Error('Failed to fetch admin dashboard statistics');
    }
  }

  async getSchoolDashboardStats(schoolId: string): Promise<SchoolDashboardStats> {
    try {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      // Get total students count for this school
      const { count: totalStudents } = await this.getAdminClient()
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', schoolId);

      // Get active students count
      const { count: activeStudents } = await this.getAdminClient()
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', schoolId)
        .eq('status', 'active');

      // Get total revenue for this school's students
      const { data: studentIds } = await this.getAdminClient()
        .from('students')
        .select('id')
        .eq('school_id', schoolId);

      const studentIdList = studentIds?.map(s => s.id) || [];

      let totalRevenue = 0;
      let monthlyRevenue = 0;

      if (studentIdList.length > 0) {
        // Get total revenue
        const { data: payments } = await this.getAdminClient()
          .from('payments')
          .select('amount')
          .in('student_id', studentIdList)
          .eq('status', 'completed');

        totalRevenue = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

        // Get monthly revenue
        const currentMonthStart = new Date(currentYear, currentMonth, 1);
        const { data: monthlyPayments } = await this.getAdminClient()
          .from('payments')
          .select('amount')
          .in('student_id', studentIdList)
          .eq('status', 'completed')
          .gte('payment_date', currentMonthStart.toISOString());

        monthlyRevenue = monthlyPayments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
      }

      // Calculate changes (simplified for now)
      const studentsChange = 0; // Could be calculated based on enrollment trends
      const revenueChange = 0; // Could be calculated based on previous months

      return {
        totalStudents: totalStudents || 0,
        activeStudents: activeStudents || 0,
        totalRevenue,
        monthlyRevenue,
        studentsChange,
        revenueChange
      };
    } catch (error) {
      console.error('Error fetching school dashboard stats:', error);
      throw new Error('Failed to fetch school dashboard statistics');
    }
  }

  async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    try {
      const { data: activities } = await this.getAdminClient()
        .from('audit_logs')
        .select(`
          id,
          action,
          entity_type,
          entity_id,
          created_at,
          profiles!audit_logs_user_id_fkey(first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      interface ActivityRow {
        id: string;
        action: string;
        entity_type: string;
        entity_id: string;
        created_at: string;
        profiles?: {
          first_name: string | null;
          last_name: string | null;
        } | Array<{
          first_name: string | null;
          last_name: string | null;
        }> | null;
      }

      return activities?.map((activity: ActivityRow) => {
        // Handle profiles as array or single object (Supabase type inference issue)
        const profile = activity.profiles 
          ? (Array.isArray(activity.profiles) ? activity.profiles[0] : activity.profiles)
          : undefined;
        
        return {
          id: activity.id,
          action: activity.action,
          entity_type: activity.entity_type,
          entity_id: activity.entity_id,
          user_name: profile 
            ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
            : 'System',
          created_at: activity.created_at
        };
      }) || [];
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw new Error('Failed to fetch recent activity');
    }
  }
}

export const dashboardService = new DashboardService();
