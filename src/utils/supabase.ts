// utils/supabase.ts

import { createClient } from '@supabase/supabase-js'

// Asegúrate de que las variables están disponibles
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las variables de entorno para Supabase')
}

// Crea la instancia de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)