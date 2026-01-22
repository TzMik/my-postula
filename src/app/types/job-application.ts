export interface JobApplication {
  id: number;
  user_id: string;
  company_id: number;
  position: string;
  expected_salary?: number;
  offer_url?: string;
  status: string;
  application_date: number;
  salary_currency?: number;
  job_type?: string;
  city?: string;
  country?: string;
  created_at?: number;
  salary_frecuency?: string;
}
