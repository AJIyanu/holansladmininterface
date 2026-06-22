export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export type EmploymentType = "FT" | "PT" | "CT" | "IN";

export type Sex = "M" | "F";

export interface CreateStaffPayload {
  user: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  job_title: string;
  employment_type: EmploymentType;
  start_date: string;
  end_date?: string | null;
  phone_number: string;
  address: string;
  middle_name: string;
  sex: Sex;
  date_of_birth: string;
  nationality: string;
  department: string;
}
