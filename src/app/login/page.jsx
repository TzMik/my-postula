/**
 * Pantalla de Inicio de Sesión (Log In) para MyPostula.
 *
 * Este componente permite a los usuarios iniciar sesión utilizando su correo electrónico
 * y contraseña a través de Supabase Auth.
 *
 * Estructura:
 * - Diseño centrado y responsivo con card (Tailwind CSS).
 * - Manejo de estado para email y password.
 * - Conexión al cliente de Supabase.
 * - Lógica de inicio de sesión y manejo de errores.
 */
'use client';

import React, { useState } from 'react';
import { supabase } from '@/utils/supabase'; // Ahora resuelto gracias al archivo generado
import { Loader2, LogIn, Mail, Lock, CheckCircle, AlertTriangle } from 'lucide-react';
// Importamos 'useRouter' para manejar la redirección después del inicio de sesión exitoso
import { useRouter } from 'next/navigation';

// --- Componente Principal ---
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', content: '...' }
  const router = useRouter();

  /**
   * Maneja el proceso de inicio de sesión del usuario.
   * Utiliza el método signInWithPassword de Supabase.
   */
  const handleSignIn = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      // Usamos signInWithPassword para loguear al usuario
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        // Manejo de errores (ej: credenciales inválidas)
        setMessage({ type: 'error', content: error.message });
      } else if (data.user && data.session) {
        // Caso de éxito con sesión activa
        setMessage({ type: 'success', content: '¡Inicio de sesión exitoso! Redirigiendo...' });
        
        // Redirigir al usuario al dashboard o página principal
        router.push('/dashboard'); 
        
      } else {
         // Otros casos (ej. si el usuario existe pero no hay sesión, raro después de un signInWithPassword)
         setMessage({ type: 'error', content: 'Error desconocido al iniciar sesión. Inténtalo de nuevo.' });
      }

    } catch (err) {
      console.error('Error durante la llamada a la API:', err);
      setMessage({ type: 'error', content: 'Ocurrió un error inesperado. Por favor, contacta soporte.' });
    } finally {
      setLoading(false);
    }
  };
  
  // Estilos y mensajes de notificación
  const MessageComponent = message && (
    <div
      className={`p-3 rounded-xl flex items-center mb-4 text-sm ${
        message.type === 'error'
          ? 'bg-red-100 text-red-700 border border-red-300'
          : 'bg-green-100 text-green-700 border border-green-300'
      }`}
      role="alert"
    >
      {message.type === 'error' ? (
        <AlertTriangle className="w-5 h-5 mr-2" />
      ) : (
        <CheckCircle className="w-5 h-5 mr-2" />
      )}
      <span>{message.content}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 transform transition duration-500 hover:scale-[1.01]">
        
        {/* Encabezado */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-indigo-600 rounded-full shadow-lg">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="mt-4 text-3xl font-extrabold text-gray-900 tracking-tight">
            Accede a MyPostula
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Ingresa con tu correo y contraseña.
          </p>
        </div>

        {/* Mensajes de Notificación */}
        {MessageComponent}

        {/* Formulario de Login */}
        <form onSubmit={handleSignIn} className="space-y-6">
          
          {/* Campo de Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                placeholder="tu.correo@ejemplo.com"
                disabled={loading}
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Campo de Contraseña */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                placeholder="Tu contraseña secreta"
                disabled={loading}
              />
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Botón de Login */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-lg font-bold rounded-xl shadow-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        {/* Enlace de Navegación */}
        <p className="mt-6 text-center text-sm text-gray-600">
          ¿No tienes cuenta?{' '}
          <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Regístrate aquí
          </a>
        </p>
      </div>
    </div>
  );
}