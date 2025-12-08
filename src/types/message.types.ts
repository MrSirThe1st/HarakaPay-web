// Message types for parent-school and school-admin communication

export type MessageStatus = 'unread' | 'read';

export interface ParentSchoolMessage {
  id: string;
  parent_id: string;
  school_id: string;
  student_id: string;
  subject: string;
  message: string;
  status: MessageStatus;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ParentSchoolMessageWithDetails extends ParentSchoolMessage {
  parent: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
  };
  student: {
    id: string;
    first_name: string;
    last_name: string;
    grade_level: string;
    student_id: string;
  };
}

export interface SchoolAdminMessage {
  id: string;
  school_id: string;
  sent_by: string;
  subject: string;
  message: string;
  status: MessageStatus;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SchoolAdminMessageWithDetails extends SchoolAdminMessage {
  school: {
    id: string;
    name: string;
  };
  sender: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    role: string;
  };
}

// Support Ticket types (school to admin)
export type TicketStatus = 'open' | 'resolved';

export interface SupportTicket {
  id: string;
  school_id: string;
  submitted_by: string;
  subject: string;
  description: string;
  status: TicketStatus;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupportTicketWithDetails extends SupportTicket {
  school: {
    id: string;
    name: string;
  };
  submitter: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    role: string;
  };
}

export interface SendParentSchoolMessageRequest {
  student_id: string;
  subject: string;
  message: string;
}

export interface SendSchoolAdminMessageRequest {
  subject: string;
  message: string;
}

export interface CreateSupportTicketRequest {
  subject: string;
  description: string;
}

export interface MessageListResponse<T> {
  success: boolean;
  messages: T[];
  unreadCount: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface TicketListResponse {
  success: boolean;
  tickets: SupportTicketWithDetails[];
  openCount: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}