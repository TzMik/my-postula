import { supabase } from '@/utils/supabase';
import { PostulationList, Company } from '@/types';
import { SetStateAction } from 'react';
import { Dispatch } from 'react';

// Centralizamos el formateo aquí
const formatPostulation = (p: any): PostulationList => ({
  id: p.id,
  user_id: p.user_id,
  company_id: p.company_id,
  position: p.position,
  expected_salary: p.expected_salary,
  offer_url: p.offer_url,
  status: p.status,
  application_date: p.application_date,
  salary_currency: p.salary_currency,
  job_type: p.job_type,
  city: p.city,
  country: p.country,
  created_at: p.created_at,
  salary_frecuency: p.salary_frecuency,
  company_name: p.company?.name,
  currency: p.currency,
});

export const PostulationService = {
  async getAllByUserId(userId: string) {
    const { data, error } = await supabase
      .from("job_applications")
      .select(`
        *,
        company:companies(name),
        currency:currencies!salary_currency(id, name, symbol, iso_code)
      `)
      .eq("user_id", userId)
      .order("application_date", { ascending: false });

    if (error) throw error;
    return data.map(formatPostulation);
  },

  async getCompanies(): Promise<Company[]> {
    const { data, error } = await supabase
      .from("companies")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) throw error;
    return data;
  },

  async getCurrencies(): Promise<any[]> {
    const { data, error } = await supabase
      .from("currencies")
      .select("id, iso_code")
      .order("iso_code", { ascending: true });

    if (error) throw error;
    return data;
  },

  handleNewPostulation(editPostulation: Dispatch<SetStateAction<PostulationList | undefined>>, editModalOpen: (open: boolean) => void) {
    editPostulation(undefined);
    editModalOpen(true);
  },

  handleEdit(editPostulation: Dispatch<SetStateAction<PostulationList | undefined>>, editModalOpen: (open: boolean) => void, postulation: PostulationList) {
    editPostulation(postulation);
    editModalOpen(true);
  },
};
