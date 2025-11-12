"use client";

import { useEffect } from 'react';
// Cambiado a next/router para mayor compatibilidad
import { useRouter } from 'next/navigation'; 
import { supabase } from '@/utils/supabase';

// Componente para manejar la redirección y el token de Supabase
export default function AuthCallbackPage() {
    // Si usas el App Router de Next.js, debes importar 'useRouter' desde 'next/navigation'.
    // Si la compilación falla con 'next/navigation', se asume que estás en un entorno 
    // que requiere 'next/router' para la importación.
    const router = useRouter(); 

    useEffect(() => {
        const handleAuthCallback = async () => {
            console.log("Iniciando manejo de callback de autenticación...");
            
            // FIX: Introduce un pequeño retraso para dar tiempo a Supabase 
            // a procesar el token del URL Hash y establecer la sesión.
            await new Promise(resolve => setTimeout(resolve, 500)); 

            // 1. Verificamos si hay una sesión activa.
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                console.log("Sesión establecida correctamente. Redirigiendo a /dashboard.");
                router.push('/dashboard');
            } else {
                console.log("No se pudo establecer la sesión. Redirigiendo a /login.");
                router.replace('/login');
            }
        };

        // Activamos la función solo si existe el hash en la URL
        if (typeof window !== 'undefined' && window.location.hash) {
            handleAuthCallback();
        } else {
            // Si no hay hash (no es una redirección de auth), redirigimos a la raíz.
            router.replace('/');
        }
        
    }, [router]);

    // Muestra una interfaz de carga mientras se procesa la redirección
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="text-center p-8 bg-white shadow-xl rounded-2xl">
                <svg className="animate-spin h-8 w-8 text-indigo-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <h1 className="text-xl font-semibold text-gray-800">Verificando tu cuenta...</h1>
                <p className="text-gray-500 text-sm mt-2">Por favor, espera. Te estamos redirigiendo.</p>
            </div>
        </div>
    );
}
