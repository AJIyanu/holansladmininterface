export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Permission {
  id: number;
  name: string;
  codename: string;
}

export interface RoleSummary {
  id: number;
  name: string;
}

export interface Role {
  id: number;
  name: string;
  permissions: number[];
}

export interface UserSummary {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  roles: RoleSummary[];
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string | null;
}

export interface DepartmentSummary {
  id: string;
  name: string;
  code: string;
}

export interface StaffProfileSummary {
  id: string;
  employee_id: string;
  job_title: string;
  employment_type: "FT" | "PT" | "CT" | "IN";
  start_date: string;
  end_date: string | null;
  phone_number: string;
  address: string;
  middle_name: string;
  sex: "M" | "F" | "" | null;
  date_of_birth: string | null;
  nationality: string;
  department: DepartmentSummary | null;
  user: UserSummary;
}
