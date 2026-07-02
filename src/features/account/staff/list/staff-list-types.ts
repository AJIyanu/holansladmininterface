export interface StaffRole {
  id: number;
  name: string;
}

export interface StaffDepartment {
  id: string;
  name: string;
  code: string;
}

export interface StaffUser {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  roles: StaffRole[];
}

export type EmploymentType = "FT" | "PT" | "CT" | "IN";
export type StaffSex = "M" | "F" | "" | null;

export interface StaffProfile {
  id: string;
  employee_id: string;
  job_title: string;
  employment_type: EmploymentType;
  start_date: string;
  end_date: string | null;
  phone_number: string;
  address: string;
  middle_name: string;
  sex: StaffSex;
  date_of_birth: string | null;
  nationality: string;
  department: StaffDepartment | null;
  user: StaffUser;
}

export interface PaginatedStaffResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: StaffProfile[];
}

export interface StaffListSearchParams {
  page?: string;
  page_size?: string;
  search?: string;
  ordering?: string;
  department?: string;
  employment_type?: EmploymentType;
  job_title?: string;
  user__is_active?: string;
  user__is_staff?: string;
}

export type StaffAction =
  | "edit"
  | "roles"
  | "department"
  | "activity"
  | "audit"
  | "activate"
  | "deactivate"
  | "reset-password"
  | "delete";
