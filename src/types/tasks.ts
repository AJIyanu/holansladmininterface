export type TaskStatus =
  "TO_DO" | "IN_PROGRESS" | "BLOCKED" | "COMPLETED" | "CANCELLED";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type TaskAssignmentType = "PERSONAL" | "USERS" | "DEPARTMENT";

export type TaskNotificationChannel = "DASHBOARD" | "EMAIL" | "WHATSAPP";

export type TaskNotificationEventMode = "SHARED" | "INDIVIDUAL";

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface TaskDepartmentSummary {
  id: string;
  name: string;
  code: string;
}

export interface TaskUserSummary {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  employee_id: string | null;
  job_title: string | null;
  department: TaskDepartmentSummary | null;
  is_active: boolean;
}

export interface TaskBatchSummary {
  id: string;
  title: string;
  description: string;
  assignment_type: TaskAssignmentType;
  priority: TaskPriority;
  start_at: string | null;
  due_at: string | null;

  source_department: TaskDepartmentSummary | null;
  source_department_name: string;
  source_department_code: string;

  created_by: TaskUserSummary | null;
  created_by_name: string;
  created_by_email: string;

  is_cancelled: boolean;
  is_archived: boolean;

  created_at: string;
  updated_at: string;
}

export interface TaskBatchProgress {
  total: number;
  to_do: number;
  in_progress: number;
  blocked: number;
  completed: number;
  cancelled: number;
  completion_percentage: number;
}

export interface TaskBatchDetail extends TaskBatchSummary {
  cancelled_at: string | null;
  cancelled_by: TaskUserSummary | null;
  cancellation_reason: string;

  archived_at: string | null;
  archived_by: TaskUserSummary | null;

  progress: TaskBatchProgress | null;
  can_manage: boolean;
}

export interface TaskListItem {
  id: string;
  batch: TaskBatchSummary;

  assigned_to: TaskUserSummary | null;
  assignee_name: string;
  assignee_email: string;
  assignee_employee_id: string;

  assigned_department: TaskDepartmentSummary | null;
  assigned_department_name: string;
  assigned_department_code: string;

  status: TaskStatus;

  completed_at: string | null;
  cancelled_at: string | null;
  archived_at: string | null;

  is_archived: boolean;
  is_overdue: boolean;

  created_at: string;
  updated_at: string;
}

export interface TaskPermissions {
  can_update_status: boolean;
  can_manage: boolean;
  can_comment: boolean;
  can_cancel: boolean;
  can_archive: boolean;
  can_restore: boolean;
}

export interface TaskReminderSummary {
  active_count: number;
  next_reminder_at: string | null;
}

export interface TaskDetail extends Omit<TaskListItem, "batch"> {
  batch: TaskBatchDetail;

  cancelled_by: TaskUserSummary | null;
  cancellation_reason: string;
  archived_by: TaskUserSummary | null;

  permissions: TaskPermissions;
  can_set_reminder: boolean;
  reminders: TaskReminderSummary | null;
}

export interface TaskListQuery {
  scope?: TaskScope;
  archived?: boolean;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignment_type?: TaskAssignmentType;

  assigned_to?: string;
  created_by?: string;
  department?: string;
  source_department?: string;
  batch?: string;

  overdue?: boolean;
  has_due_date?: boolean;

  due_before?: string;
  due_after?: string;
  created_before?: string;
  created_after?: string;

  search?: string;
  ordering?: TaskOrdering;
  page?: number;
}

export interface TaskBatchListQuery {
  scope?: "my" | "created" | "department" | "all";
  archived?: boolean;
  assignment_type?: TaskAssignmentType;
  priority?: TaskPriority;
  source_department?: string;
  created_by?: string;
  overdue?: boolean;
  has_due_date?: boolean;
  search?: string;
  ordering?: string;
  page?: number;
}

export interface PersonalTaskAssignment {
  type: "PERSONAL";
}

export interface SelectedStaffTaskAssignment {
  type: "USERS";
  user_ids: string[];
}

export interface DepartmentTaskAssignment {
  type: "DEPARTMENT";
  department_id: string;
  include_assigner: boolean;
}

export type TaskAssignment =
  | PersonalTaskAssignment
  | SelectedStaffTaskAssignment
  | DepartmentTaskAssignment;

export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority?: TaskPriority;
  start_at?: string | null;
  due_at?: string | null;
  assignment: TaskAssignment;
  notification_channels?: TaskNotificationChannel[];
  notification_event_mode?: TaskNotificationEventMode;
}

export interface CreateTaskResponse {
  detail: string;
  batch: TaskBatchDetail;
  tasks: TaskListItem[];
  recipient_count: number;
  notification_scheduled: boolean;
}

export interface UpdateTaskBatchPayload {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  start_at?: string | null;
  due_at?: string | null;
}

export interface UpdateTaskStatusPayload {
  status: Exclude<TaskStatus, "CANCELLED">;
}

export interface CancellationPayload {
  reason: string;
}

export type TaskScope = "my" | "created" | "department" | "all";

export type TaskOrdering =
  | "created_at"
  | "-created_at"
  | "updated_at"
  | "-updated_at"
  | "status"
  | "-status"
  | "title"
  | "-title"
  | "priority"
  | "-priority"
  | "start_at"
  | "-start_at"
  | "due_at"
  | "-due_at"
  | "assignee"
  | "-assignee"
  | "department"
  | "-department";

export interface TaskStaffOption {
  profileId: string;
  userId: string;
  fullName: string;
  email: string;
  employeeId: string | null;
  jobTitle: string | null;
  department: TaskDepartmentSummary | null;
}

export interface TaskDepartmentOption {
  id: string;
  name: string;
  code: string;
}

export interface TaskCreateCapabilities {
  canCreatePersonal: boolean;
  canAssignUsers: boolean;
  canAssignDepartment: boolean;
}
