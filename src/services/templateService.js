// src/services/templateService.js
import { createAdminClient } from '@/lib/supabaseServerOnly';

class TemplateService {
  constructor() {
    this.supabase = createAdminClient();
  }

  /**
   * Get all templates for a school
   */
  async getTemplatesBySchool(schoolId, { category, activeOnly = true } = {}) {
    try {
      let query = this.supabase
        .from('notification_templates')
        .select('*')
        .or(`school_id.eq.${schoolId},is_system_template.eq.true`)
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { success: true, templates: data || [] };
    } catch (error) {
      console.error('Error fetching templates:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get a single template by ID
   */
  async getTemplateById(templateId) {
    try {
      const { data, error } = await this.supabase
        .from('notification_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) throw error;

      return { success: true, template: data };
    } catch (error) {
      console.error('Error fetching template:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a new template
   */
  async createTemplate({
    schoolId,
    name,
    subject,
    body,
    category = 'general',
    variables = [],
    isActive = true,
    createdBy
  }) {
    try {
      const { data, error } = await this.supabase
        .from('notification_templates')
        .insert({
          school_id: schoolId,
          name,
          title_template: subject || name,
          message_template: body,
          category,
          variables,
          is_active: isActive,
          created_by: createdBy
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, template: data };
    } catch (error) {
      console.error('Error creating template:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update a template
   */
  async updateTemplate(templateId, updates) {
    try {
      const updateData = {};

      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.subject !== undefined) updateData.title_template = updates.subject;
      if (updates.body !== undefined) updateData.message_template = updates.body;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.variables !== undefined) updateData.variables = updates.variables;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

      updateData.updated_at = new Date().toISOString();

      const { data, error } = await this.supabase
        .from('notification_templates')
        .update(updateData)
        .eq('id', templateId)
        .eq('is_system_template', false) // Can't update system templates
        .select()
        .single();

      if (error) throw error;

      return { success: true, template: data };
    } catch (error) {
      console.error('Error updating template:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a template (soft delete by deactivating)
   */
  async deleteTemplate(templateId) {
    try {
      const { error } = await this.supabase
        .from('notification_templates')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId)
        .eq('is_system_template', false); // Can't delete system templates

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error deleting template:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Validate template
   */
  validateTemplate({ name, subject, body }) {
    const errors = [];

    if (!name || name.trim().length === 0) {
      errors.push('Template name is required');
    }

    if (name && name.length > 255) {
      errors.push('Template name must be 255 characters or less');
    }

    if (!body || body.trim().length === 0) {
      errors.push('Template body is required');
    }

    if (subject && subject.length > 255) {
      errors.push('Subject must be 255 characters or less');
    }

    // Extract variables from body (anything in {variable_name} format)
    const variableMatches = body?.match(/\{([^}]+)\}/g) || [];
    const variables = variableMatches.map(v => v.replace(/[{}]/g, ''));

    // Validate supported variables
    const supportedVariables = [
      'student_name',
      'student_first_name',
      'parent_name',
      'parent_first_name',
      'student_grade',
      'student_level',
      'school_name',
      'amount',
      'due_date',
      'balance'
    ];

    const unsupportedVariables = variables.filter(
      v => !supportedVariables.includes(v)
    );

    if (unsupportedVariables.length > 0) {
      errors.push(
        `Unsupported variables: ${unsupportedVariables.join(', ')}. ` +
        `Supported: ${supportedVariables.join(', ')}`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      variables,
      supportedVariables
    };
  }

  /**
   * Get template categories
   */
  getCategories() {
    return [
      { value: 'general', label: 'General Announcement', icon: '📢' },
      { value: 'fees', label: 'Fees & Payments', icon: '💰' },
      { value: 'academic', label: 'Academic Updates', icon: '📚' },
      { value: 'events', label: 'Events & Activities', icon: '📅' },
      { value: 'urgent', label: 'Urgent Notice', icon: '⚠️' },
      { value: 'attendance', label: 'Attendance', icon: '✓' },
      { value: 'discipline', label: 'Discipline', icon: '⚖️' },
      { value: 'health', label: 'Health & Safety', icon: '🏥' },
      { value: 'transport', label: 'Transport', icon: '🚌' },
      { value: 'other', label: 'Other', icon: '📝' }
    ];
  }

  /**
   * Render template with data
   */
  renderTemplate(template, data = {}) {
    let rendered = template;

    // Replace all variables with actual data
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      rendered = rendered.replace(regex, data[key] || '');
    });

    // Clean up any remaining unreplaced variables
    rendered = rendered.replace(/\{[^}]+\}/g, '');

    return rendered;
  }
}

const templateService = new TemplateService();
export default templateService;
