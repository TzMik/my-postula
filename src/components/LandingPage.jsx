"use client";

import React from 'react';

const BriefcaseIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
);

const ClockIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const ListIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="8" x2="21" y1="6" y2="6" />
        <line x1="8" x2="21" y1="12" y2="12" />
        <line x1="8" x2="21" y1="18" y2="18" />
        <line x1="3" x2="3.01" y1="6" y2="6" />
        <line x1="3" x2="3.01" y1="12" y2="12" />
        <line x1="3" x2="3.01" y1="18" y2="18" />
    </svg>
);

const LockIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

export default function LandingPage() {
    return (
        <div className="text-gray-800 min-h-screen bg-gray-50">
            {/* Cabecera / Navegación */}
            <header className="bg-white shadow-md sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <BriefcaseIcon />
                        <span className="text-2xl font-extrabold text-gray-900 tracking-tight">MyPostula</span>
                    </div>
                    <nav className="space-x-4">
                        {/* En Next.js, deberías usar <Link href="/login">...</Link> */}
                        <a href="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">Iniciar Sesión</a>
                        <a href="/register" className="text-sm font-bold bg-indigo-600 text-white px-4 py-2 rounded-xl shadow-md hover:bg-indigo-700 transition duration-150">
                            Regístrate Gratis
                        </a>
                    </nav>
                </div>
            </header>

            <main>
                {/* Sección 1: Héroe */}
                <section className="py-16 md:py-24 text-center bg-gray-50">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-4">
                            Organiza <span className="text-indigo-600">Todas</span> Tus Postulaciones de Empleo
                        </h1>
                        <p className="text-xl text-gray-500 mb-8 max-w-2xl mx-auto">
                            MyPostula es tu gestor de candidaturas **totalmente gratuito**. Nunca más pierdas el rastro de dónde aplicaste, a qué empresa y cuál es el estado actual de tu proceso.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <a href="/register" className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-bold rounded-xl shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 transition duration-150 transform hover:scale-[1.02]">
                                ¡Empieza Ahora! (Es Gratis)
                            </a>
                            <a href="#features" className="inline-flex items-center justify-center px-8 py-3 border border-indigo-200 text-base font-medium rounded-xl shadow-sm text-indigo-600 bg-white hover:bg-indigo-50 transition duration-150">
                                Saber Más
                            </a>
                        </div>
                    </div>
                    {/* Placeholder de una imagen del dashboard */}
                    <div className="mt-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <img src="https://placehold.co/1200x600/e0e7ff/4338ca?text=Dashboard+de+Postulaciones" 
                            alt="Captura de pantalla del dashboard de MyPostula" 
                            className="w-full h-auto rounded-xl shadow-2xl border-4 border-white transition duration-500 hover:shadow-indigo-300"
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/1200x600/e0e7ff/4338ca?text=Dashboard+de+Postulaciones+de+Ejemplo'; }} />
                    </div>
                </section>

                {/* Sección 2: Características (Features) */}
                <section id="features" className="py-16 md:py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 mb-12">
                            Funcionalidades Clave
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            
                            {/* Feature 1: Seguimiento en tiempo real */}
                            <div className="bg-indigo-50 p-6 rounded-xl shadow-lg text-center transform hover:translate-y-[-4px] transition duration-300">
                                <div className="mb-4 inline-flex items-center justify-center p-3 rounded-full bg-indigo-600 text-white">
                                    <ClockIcon />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Estado en Tiempo Real</h3>
                                <p className="text-gray-600">
                                    Actualiza instantáneamente si la postulación está en revisión, entrevista, aceptada o rechazada.
                                </p>
                            </div>

                            {/* Feature 2: Información Centralizada */}
                            <div className="bg-blue-50 p-6 rounded-xl shadow-lg text-center transform hover:translate-y-[-4px] transition duration-300">
                                <div className="mb-4 inline-flex items-center justify-center p-3 rounded-full bg-blue-600 text-white">
                                    <ListIcon />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Datos Clave Unificados</h3>
                                <p className="text-gray-600">
                                    Registra la posición, la empresa, la fecha de aplicación y el sueldo esperado en un solo lugar.
                                </p>
                            </div>

                            {/* Feature 3: Herramienta Gratuita */}
                            <div className="bg-green-50 p-6 rounded-xl shadow-lg text-center transform hover:translate-y-[-4px] transition duration-300">
                                <div className="mb-4 inline-flex items-center justify-center p-3 rounded-full bg-green-600 text-white">
                                    <LockIcon />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Sin Costos, Sin Límites</h3>
                                <p className="text-gray-600">
                                    Disfruta de la aplicación sin límites de postulación ni cargos ocultos. Es 100% gratuita.
                                </p>
                            </div>

                        </div>
                    </div>
                </section>

                {/* Sección 3: Llamada a la Acción (CTA) */}
                <section className="py-16 md:py-20 bg-indigo-600">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                            ¡Deja de usar hojas de cálculo!
                        </h2>
                        <p className="text-xl text-indigo-200 mb-8">
                            Organizar tu búsqueda de empleo nunca fue tan fácil y visual. Regístrate en segundos.
                        </p>
                        <a href="/register" className="inline-flex items-center justify-center px-10 py-4 border border-transparent text-lg font-bold rounded-xl shadow-2xl text-indigo-600 bg-white hover:bg-gray-100 transition duration-300 transform hover:scale-[1.05] ring-4 ring-indigo-300">
                            Comenzar GRATIS
                        </a>
                    </div>
                </section>
            </main>

            {/* Pie de Página */}
            <footer className="bg-gray-800 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400 text-sm">
                    <p>&copy; 2024 MyPostula. Herramienta gratuita de gestión de postulaciones. | <a href="#" className="hover:text-white transition-colors">Términos de Servicio</a></p>
                </div>
            </footer>
        </div>
    );
}