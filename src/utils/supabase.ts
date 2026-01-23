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

/**
 * Suscribe a cambios en la tabla job_applications y recarga datos.
 * Se inyecta 'fetcher' para evitar dependencias circulares con PostulationService.
 */
export const subscribeToPostulations = (
  userId: string,
  fetcher: (id: string) => Promise<any>,
  callbacks: {
    onData: (data: any) => void;
    onError: (msg: string) => void;
    onReady: () => void;
  }
) => {
  return supabase
    .channel("app_changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "job_applications" },
      (payload) => {
        console.log("Cambio en Job Applications:", payload.eventType);
        fetcher(userId).then(callbacks.onData);
      }
    )
    .subscribe((status, err) => {
      if (status === "SUBSCRIBED") {
        console.log("Suscripción activa a Job Applications.");
        fetcher(userId)
          .then(callbacks.onData)
          .finally(callbacks.onReady);
      } else if (err) {
        console.error("Error en la suscripción de Supabase:", err);
        callbacks.onError("Error de conexión en tiempo real.");
        callbacks.onReady();
      }
    });
};
