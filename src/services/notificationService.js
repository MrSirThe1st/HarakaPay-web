// src/services/notificationService.js
import { createAdminClient } from '@/lib/supabaseServerOnly';

/**
 * Send notification to parents based on target audience
 * @param {Object} params - Notification parameters
 * @param {string} params.schoolId - School ID
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification message
 * @param {string} params.templateId - Template ID (optional)
 * @param {Object} params.targetAudience - Target audience filters
 * @param {Array} params.targetAudience.levels - Student levels to target
 * @param {Array} params.targetAudience.gradeLevels - Grade levels to target
 * @param {Array} params.targetAudience.studentIds - Specific student IDs
 * @param {string} params.channel - Notification channel (in_app, push, both)
 * @param {string} params.scheduledAt - Schedule date/time (optional)
 * @param {string} params.createdBy - User ID of creator
 * @param {Object} params.metadata - Additional metadata
 * @returns {Promise<Object>} - Result with success status and recipient count
 */
async function sendNotification({
  schoolId,
  title,
  message,
  templateId,
  targetAudience = {},
  channel = 'in_app',
  scheduledAt,
  createdBy,
  metadata = {}
}) {
  const supabase = createAdminClient();

  try {
    // 1. Determine target students based on audience filters
    let studentsQuery = supabase
      .from('students')
      .select('id, student_id, first_name, last_name, grade_level, level')
      .eq('school_id', schoolId);

    // Apply filters - filter by grade_level values (e.g., 'primaire-1', 'humanites-2')
    if (targetAudience.gradeLevels && targetAudience.gradeLevels.length > 0) {
      studentsQuery = studentsQuery.in('grade_level', targetAudience.gradeLevels);
    }

    if (targetAudience.studentIds && targetAudience.studentIds.length > 0) {
      studentsQuery = studentsQuery.in('id', targetAudience.studentIds);
    }

    const { data: students, error: studentsError } = await studentsQuery;

    if (studentsError) {
      console.error('Error fetching students:', studentsError);
      return {
        success: false,
        error: 'Failed to fetch target students'
      };
    }

    if (!students || students.length === 0) {
      return {
        success: false,
        error: 'No students match the target audience'
      };
    }

    const studentIds = students.map(s => s.id);

    // 2. Find parents for these students
    const { data: parentStudents, error: parentError } = await supabase
      .from('parent_students')
      .select(`
        parent_id,
        student_id,
        parents!inner(
          id,
          user_id
        )
      `)
      .in('student_id', studentIds);

    if (parentError) {
      console.error('Error fetching parents:', parentError);
      return {
        success: false,
        error: 'Failed to fetch parent relationships'
      };
    }

    if (!parentStudents || parentStudents.length === 0) {
      return {
        success: false,
        error: 'No parents found for target students'
      };
    }

    // 3. Group by parent and get unique parents with their details
    const parentMap = new Map();
    parentStudents.forEach(ps => {
      if (!parentMap.has(ps.parent_id)) {
        parentMap.set(ps.parent_id, {
          userId: ps.parents.user_id,
          studentIds: []
        });
      }
      parentMap.get(ps.parent_id).studentIds.push(ps.student_id);
    });

    const uniqueParents = Array.from(parentMap.entries());

    // 4. Fetch parent details for variable replacement
    const parentIds = uniqueParents.map(([parentId]) => parentId);
    const { data: parentsDetails, error: parentsDetailsError } = await supabase
      .from('parents')
      .select('id, user_id, first_name, last_name, phone')
      .in('id', parentIds);

    if (parentsDetailsError) {
      console.error('Error fetching parent details:', parentsDetailsError);
    }

    const parentsMap = new Map(
      (parentsDetails || []).map(p => [p.id, p])
    );

    const studentsMap = new Map(
      students.map(s => [s.id, s])
    );

    // 5. Helper function to replace variables in text
    const replaceVariables = (text, parent, studentList) => {
      let result = text;

      // Parent variables
      if (parent) {
        result = result.replace(/{parent_first_name}/g, parent.first_name || '');
        result = result.replace(/{parent_name}/g, `${parent.first_name || ''} ${parent.last_name || ''}`.trim());
        result = result.replace(/{parent_last_name}/g, parent.last_name || '');
      }

      // Student variables (use first student if multiple)
      if (studentList && studentList.length > 0) {
        const firstStudent = studentList[0];
        result = result.replace(/{student_first_name}/g, firstStudent.first_name || '');
        result = result.replace(/{student_name}/g, `${firstStudent.first_name || ''} ${firstStudent.last_name || ''}`.trim());
        result = result.replace(/{student_last_name}/g, firstStudent.last_name || '');
        result = result.replace(/{student_level}/g, firstStudent.level || '');
        result = result.replace(/{student_grade}/g, firstStudent.grade_level || '');
      }

      return result;
    };

    // 6. Create notifications for each parent
    const notifications = uniqueParents.map(([parentId, parentData]) => {
      const parent = parentsMap.get(parentId);
      const parentStudentList = parentData.studentIds
        .map(sid => studentsMap.get(sid))
        .filter(Boolean);

      const personalizedTitle = replaceVariables(title, parent, parentStudentList);
      const personalizedMessage = replaceVariables(message, parent, parentStudentList);

      return {
        user_id: parentData.userId,
        school_id: schoolId,
        template_id: templateId || null,
        title: personalizedTitle,
        message: personalizedMessage,
        type: metadata.type || 'general',
        target_audience: targetAudience,
        notification_channel: channel,
        scheduled_at: scheduledAt || null,
        sent_at: scheduledAt ? null : new Date().toISOString(),
        is_read: false,
        metadata: {
          ...metadata,
          student_ids: parentData.studentIds,
          parent_id: parentId
        },
        created_at: new Date().toISOString()
      };
    });

    const { data: createdNotifications, error: createError } = await supabase
      .from('notifications')
      .insert(notifications)
      .select('id');

    if (createError) {
      console.error('Error creating notifications:', createError);
      return {
        success: false,
        error: 'Failed to create notifications'
      };
    }

    // 5. Return success with count
    return {
      success: true,
      notificationId: createdNotifications[0]?.id,
      recipientCount: uniqueParents.length,
      notifications: createdNotifications
    };

  } catch (error) {
    console.error('Error in sendNotification:', error);
    return {
      success: false,
      error: error.message || 'Internal error while sending notification'
    };
  }
}

export default {
  sendNotification
};
