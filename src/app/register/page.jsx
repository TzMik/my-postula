/**
 * Pantalla de Registro de Usuario (Sign Up) para MyPostula.
 *
 * Este componente permite a los usuarios registrarse utilizando su correo electrónico
 * y contraseña a través de Supabase Auth.
 *
 * Estructura:
 * - Diseño centrado y responsivo con card (Tailwind CSS).
 * - Manejo de estado para email, password y la confirmación de contraseña.
 * - Conexión al cliente de Supabase (asume que el cliente se encuentra en la ruta relativa).
 * - Lógica de registro y manejo de errores.
 *
 * Nota: Los iconos de 'lucide-react' han sido reemplazados por SVG inline para evitar
 * errores de "Module not found" en entornos de compilación restringidos.
 */
'use client';

import React, { useState } from 'react';
// Importación del cliente de Supabase usando ruta relativa
import { supabase } from '@/utils/supabase'; // Ahora resuelto gracias al archivo generado

// --- Iconos SVG Inline (Reemplazo de lucide-react) ---

// Icono para la animación de carga
const Loader2 = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

// Icono para el encabezado (UserPlus)
const UserPlus = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/>
  </svg>
);

// Icono para el campo de Email (Mail)
const Mail = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}>
      <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

// Icono para el campo de Contraseña (Lock)
const Lock = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

// Icono de éxito (CheckCircle)
const CheckCircle = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.66-9.15"/><path d="m11 16.5 3.5 3.5L22 13"/>
  </svg>
);

// Icono de error (AlertTriangle)
const AlertTriangle = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}>
      <path d="m21.73 18-9-15a.5.5 0 0 0-.46-.03.5.5 0 0 0-.46.03l-9 15A.5.5 0 0 0 3 18.5h18a.5.5 0 0 0 .73-.5z"/><path d="M12 9v4"/><path d="M12 17h.01"/>
  </svg>
);


// --- Componente Principal ---
export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', content: '...' }

  /**
   * Maneja el proceso de registro del usuario.
   * Utiliza el método signUp de Supabase.
   */
  const handleSignUp = async (e) => {
    e.preventDefault();
    setMessage(null);

    // 1. Validación de contraseñas
    if (password !== confirmPassword) {
      setMessage({ type: 'error', content: 'Las contraseñas no coinciden. Por favor, revísalas.' });
      return;
    }

    if (password.length < 6) {
        setMessage({ type: 'error', content: 'La contraseña debe tener al menos 6 caracteres.' });
        return;
    }
    
    setLoading(true);

    try {
      // Intenta crear el usuario en Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        // Manejo de errores de Supabase
        setMessage({ type: 'error', content: error.message });
      } else if (data.user && data.session) {
        // Registro y logueo automático (si la confirmación por email está desactivada)
        setMessage({ type: 'success', content: '¡Registro exitoso! Has iniciado sesión automáticamente. Redirigiendo...' });
        // Redirección usando Javascript básico
        window.location.href = '/dashboard'; 
      } else if (data.user && !data.session) {
        // Registro exitoso pero requiere verificación por email
        setMessage({
          type: 'success',
          content: '¡Registro exitoso! Por favor, revisa tu correo electrónico para confirmar tu cuenta antes de iniciar sesión.',
        });
        // Limpiar formulario
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } else {
         setMessage({ type: 'error', content: 'Error desconocido durante el registro. Inténtalo de nuevo.' });
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
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="mt-4 text-3xl font-extrabold text-gray-900 tracking-tight">
            Crea tu Cuenta MyPostula
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Únete a la plataforma para gestionar tus postulaciones.
          </p>
        </div>

        {/* Mensajes de Notificación */}
        {MessageComponent}

        {/* Formulario de Registro */}
        <form onSubmit={handleSignUp} className="space-y-6">
          
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
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                placeholder="Mínimo 6 caracteres"
                disabled={loading}
              />
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Campo de Confirmación de Contraseña */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                placeholder="Repite tu contraseña"
                disabled={loading}
              />
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Botón de Registro */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-lg font-bold rounded-xl shadow-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Registrando...
              </>
            ) : (
              'Registrarme'
            )}
          </button>
        </form>

        {/* Enlace de Navegación */}
        <p className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?{' '}
          {/* Enlace simple a la página de login */}
          <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Inicia sesión aquí
          </a>
        </p>
      </div>
    </div>
  );
}