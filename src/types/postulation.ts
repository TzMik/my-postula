export interface Postulation {
  id: number;
  user_id: string;
  company_id: number;
  position: string;
  expected_salary?: number;
  offer_url?: string;
  status: string;
  application_date: string;
  salary_currency?: number;
  job_type?: string;
  city?: string;
  country?: string;
  created_at?: string;
  salary_frecuency?: string;
}

export interface PostulationList extends Postulation {
  company_name: string;
  currency?: Currency;
}
