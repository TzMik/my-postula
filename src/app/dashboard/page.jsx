/**
 * Pantalla Principal (Dashboard) para MyPostula.
 * ADAPTADO al esquema: job_applications {position, expected_salary, application_date, status}
 */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
// Importación del cliente de Supabase usando importación POR DEFECTO
// CORRECCIÓN: Se eliminó '.js' de la importación para resolver el error de compilación.
import { supabase } from '@/utils/supabase'; // Ahora resuelto gracias al archivo generado

// --- Configuración de Iconos SVG Inline ---
const Loader2 = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>);
const LogOut = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>);
const Plus = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>);
const Edit = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5L2 22l1.5-5.5L17 3z"/></svg>);
const Trash = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>);
const Briefcase = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>);
const CheckCircle = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.66-9.15"/><path d="m11 16.5 3.5 3.5L22 13"/></svg>);
const XCircle = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>);
const Clock = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>);

// --- Tipos y Constantes ---

// Estados de la postulación
const STATUS_OPTIONS = {
    open: 'Abierta',
    interview: 'Entrevista',
    accepted: 'Aceptada',
    declined: 'Rechazada',
};

// Mapeo de estilos para los totales
const COUNT_STYLES = {
    open: { icon: Clock, bgColor: 'bg-yellow-500', color: 'text-yellow-600', count: 0 },
    accepted: { icon: CheckCircle, bgColor: 'bg-green-500', color: 'text-green-600', count: 0 },
    declined: { icon: XCircle, bgColor: 'bg-red-500', color: 'text-red-600', count: 0 },
};

// --- Componente Modal (Crear/Editar Postulación) ---

/**
 * Muestra un modal para crear una nueva postulación o editar una existente.
 * Adaptado a las columnas: position, expected_salary, application_date, status, company_id.
 */
const PostulationModal = ({ isOpen, onClose, onSubmit, postulation = null, allCompanies = [] }) => {
    const isEdit = !!postulation;
    const [formData, setFormData] = useState({
        // Renombrado: job_title -> position
        position: postulation?.position || '',
        expected_salary: postulation?.expected_salary || '',
        application_date: postulation?.application_date || new Date().toISOString().split('T')[0],
        status: postulation?.status || 'open',
        // Eliminado: offer_url
        company_id: postulation?.company_id || '', 
        company_name: postulation?.company_name || '', // Campo para la empresa si no existe
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (postulation) {
            setFormData({
                // Renombrado: job_title -> position
                position: postulation.position || '',
                expected_salary: postulation.expected_salary || '',
                application_date: postulation.application_date || new Date().toISOString().split('T')[0],
                status: postulation.status || 'open',
                // Eliminado: offer_url
                company_id: postulation.company_id || '',
                company_name: postulation.name || postulation.company_name || '', 
            });
        } else {
            setFormData({
                position: '',
                expected_salary: '',
                application_date: new Date().toISOString().split('T')[0],
                status: 'open',
                company_id: '',
                company_name: '',
            });
        }
    }, [postulation]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(null);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // 1. Validar o Crear Empresa (companies)
            let finalCompanyId = formData.company_id;

            if (!finalCompanyId && formData.company_name) {
                // Buscar si la empresa ya existe
                let { data: existingCompany, error: searchError } = await supabase
                    .from('companies') 
                    .select('id')
                    .eq('name', formData.company_name)
                    .single();

                if (searchError && searchError.code !== 'PGRST116') {
                    throw new Error(searchError.message || 'Error al buscar empresa existente.');
                }

                if (existingCompany) {
                    finalCompanyId = existingCompany.id;
                } else {
                    // Si no existe, crear nueva empresa
                    const { data: newCompany, error: createError } = await supabase
                        .from('companies') 
                        .insert([{ name: formData.company_name }])
                        .select('id')
                        .single();

                    if (createError) {
                        throw new Error(createError.message || 'Error al crear nueva empresa.');
                    }
                    finalCompanyId = newCompany.id;
                }
            }

            if (!finalCompanyId) {
                setError('Debes seleccionar una empresa existente o ingresar un nombre para una nueva.');
                setLoading(false);
                return;
            }

            // 2. Preparar los datos de la postulación
            const payload = {
                // Renombrado: job_title -> position
                position: formData.position,
                expected_salary: parseFloat(formData.expected_salary) || null,
                application_date: formData.application_date,
                status: formData.status,
                // Eliminado: offer_url
                company_id: finalCompanyId, 
            };

            // 3. Llamar a la función principal para guardar/actualizar
            await onSubmit(payload, postulation?.id);
            onClose(); // Cerrar al finalizar
        } catch (err) {
            console.error('Error en el modal al guardar:', err);
            setError(err.message || 'Ocurrió un error al guardar la postulación.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 transition-opacity duration-300">
            <div className="bg-white rounded-xl shadow-3xl w-full max-w-lg p-6 transform transition-all duration-300 scale-100">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">{isEdit ? 'Editar Postulación' : 'Registrar Postulación'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <XCircle className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
                    {error && <div className="p-3 text-sm bg-red-100 text-red-700 rounded-lg">{error}</div>}

                    {/* Campo Posición (position) */}
                    <div>
                        <label htmlFor="position" className="block text-sm font-medium text-gray-700">Posición</label>
                        <input type="text" id="position" name="position" required value={formData.position} onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:border-indigo-500 focus:ring-indigo-500" />
                    </div>

                    {/* Selector de Empresa */}
                    <div>
                        <label htmlFor="company_id" className="block text-sm font-medium text-gray-700">Empresa (Existente)</label>
                        <select id="company_id" name="company_id" value={formData.company_id} onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:border-indigo-500 focus:ring-indigo-500">
                            <option value="">-- Selecciona Empresa Existente --</option>
                            {allCompanies.map(comp => (
                                <option key={comp.id} value={comp.id}>{comp.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="text-center text-gray-500 text-sm">-- O --</div>

                    {/* Campo Empresa Nueva */}
                    <div>
                        <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">Nombre de Nueva Empresa</label>
                        <input type="text" id="company_name" name="company_name" value={formData.company_name} onChange={handleChange}
                            placeholder="Ej. Google o Tesla"
                            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:border-indigo-500 focus:ring-indigo-500" />
                    </div>
                    
                    {/* Fila de Sueldo y Fecha */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="expected_salary" className="block text-sm font-medium text-gray-700">Sueldo Esperado</label>
                            <input type="number" id="expected_salary" name="expected_salary" value={formData.expected_salary} onChange={handleChange}
                                placeholder="Ej. 30000"
                                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:border-indigo-500 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="application_date" className="block text-sm font-medium text-gray-700">Fecha Postulación</label>
                            <input type="date" id="application_date" name="application_date" required value={formData.application_date} onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:border-indigo-500 focus:ring-indigo-500" />
                        </div>
                    </div>

                    {/* Campo Estado */}
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Estado</label>
                        <select id="status" name="status" required value={formData.status} onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:border-indigo-500 focus:ring-indigo-500">
                            {Object.entries(STATUS_OPTIONS).map(([key, value]) => (
                                <option key={key} value={key}>{value}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center items-center px-4 py-2 mt-6 border border-transparent text-lg font-bold rounded-xl shadow-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        ) : isEdit ? (
                            'Guardar Cambios'
                        ) : (
                            'Crear Postulación'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- Componente Principal del Dashboard ---

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [postulations, setPostulations] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPostulation, setCurrentPostulation] = useState(null); // Postulación a editar
    const [error, setError] = useState(null);

    // Mapeo de totales (Estado y contador)
    const [counts, setCounts] = useState({ ...COUNT_STYLES });

    // --- Funciones de Supabase ---

    /**
     * Calcula los totales de las postulaciones por estado.
     */
    const calculateCounts = useCallback((postulationsList) => {
        const newCounts = { ...COUNT_STYLES };
        newCounts.open.count = postulationsList.filter(p => p.status === 'open' || p.status === 'interview').length;
        newCounts.accepted.count = postulationsList.filter(p => p.status === 'accepted').length;
        newCounts.declined.count = postulationsList.filter(p => p.status === 'declined').length;
        setCounts(newCounts);
    }, []);

    /**
     * Carga las postulaciones del usuario y calcula los totales.
     * Usa la tabla 'job_applications' y 'companies'.
     */
    const loadPostulations = useCallback(async (userId) => {
        const { data, error } = await supabase
            .from('job_applications') 
            .select(`
                *,
                companies(name) 
            `)
            .eq('user_id', userId)
            // Nuevo ordenamiento: por application_date (en lugar de created_at)
            .order('application_date', { ascending: false }); 

        if (error) {
            console.error('Error al cargar postulaciones:', error);
            setError('Error al cargar tus postulaciones.');
            return;
        }
        
        const loadedPostulations = data.map(p => ({
            ...p,
            name: p.companies?.name || 'N/A', 
            application_date_formatted: new Date(p.application_date).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
        }));
        
        setPostulations(loadedPostulations);
        calculateCounts(loadedPostulations);
    }, [calculateCounts]);


    /**
     * Hook principal para la inicialización y suscripción.
     */
    useEffect(() => {
        let isSubscribed = true;
        
        const setupData = async () => {
            setError(null);

            // 1. Obtener sesión de usuario
            const { data: authData, error: authError } = await supabase.auth.getSession();
            
            if (!isSubscribed) return; 

            if (authError || !authData?.session) {
                // No hay sesión, redirigir al login
                window.location.href = '/login'; 
                return null;
            }

            const currentUser = authData.session.user;
            setUser(currentUser);

            // 2. Obtener la lista de empresas (companies)
            const { data: companiesData, error: companiesError } = await supabase
                .from('companies') 
                .select('id, name')
                .order('name', { ascending: true });
            
            if (!isSubscribed) return null;

            if (companiesError) {
                console.error('Error al cargar empresas:', companiesError);
                setError('Error al cargar la lista de empresas.');
                setLoading(false);
                return null;
            }
            setCompanies(companiesData || []);

            // 3. Suscripción en tiempo real a job_applications
            const postulationsSubscription = supabase
                .channel('app_changes') 
                .on(
                    'postgres_changes', 
                    { event: '*', schema: 'public', table: 'job_applications' }, 
                    payload => {
                        if (isSubscribed) {
                            console.log('Cambio en Job Applications:', payload.eventType);
                            loadPostulations(currentUser.id); // Recargar datos
                        }
                    }
                )
                .subscribe((status, err) => { 
                    if (status === 'SUBSCRIBED') {
                        if (isSubscribed) {
                            console.log('Suscripción activa a Job Applications.');
                            // Cargar datos iniciales tras suscripción
                            loadPostulations(currentUser.id).finally(() => {
                                if (isSubscribed) setLoading(false);
                            }); 
                        }
                    } else if (err) {
                        console.error('Error en la suscripción de Supabase:', err);
                        setError('Error de conexión en tiempo real.');
                        if (isSubscribed) setLoading(false);
                    }
                });

            // Retorna la función de limpieza (unsubscribe)
            return () => {
                isSubscribed = false;
                if (postulationsSubscription && postulationsSubscription.unsubscribe) {
                    postulationsSubscription.unsubscribe();
                }
            };
        };

        setupData();

        return () => {
             isSubscribed = false;
        };

    }, [loadPostulations]); 


    // --- Manejadores de Eventos (Delete/Update/Submit) ---

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    const handleNewPostulation = () => {
        setCurrentPostulation(null); 
        setIsModalOpen(true);
    };

    const handleEdit = (postulation) => {
        setCurrentPostulation(postulation); 
        setIsModalOpen(true);
    };

    const handleStatusChange = async (postulationId, newStatus) => {
        setError(null);
        if (!user) return;

        const { error } = await supabase
            .from('job_applications') 
            .update({ status: newStatus })
            .eq('id', postulationId)
            .eq('user_id', user.id); 

        if (error) {
            console.error('Error al actualizar estado:', error);
            setError('No se pudo actualizar el estado.');
        } 
    };

    const handleDelete = async (postulationId) => {
        setError(null);
        // NOTA: Usar custom modal en producción
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta postulación? Esta acción es irreversible.')) {
            return;
        }
        if (!user) return;

        const { error } = await supabase
            .from('job_applications') 
            .delete()
            .eq('id', postulationId)
            .eq('user_id', user.id); 

        if (error) {
            console.error('Error al eliminar:', error);
            setError('No se pudo eliminar la postulación.');
        }
    };

    const handleModalSubmit = async (payload, postulationId) => {
        setError(null);
        if (!user) {
            setError('Usuario no autenticado.');
            return;
        }

        if (postulationId) {
            // MODO EDICIÓN
            const { error } = await supabase
                .from('job_applications') 
                .update(payload)
                .eq('id', postulationId)
                .eq('user_id', user.id); 

            if (error) {
                throw new Error(error.message || 'Error al actualizar la postulación.');
            }
        } else {
            // MODO CREACIÓN
            const { error } = await supabase
                .from('job_applications') 
                .insert([{ ...payload, user_id: user.id }]); 

            if (error) {
                throw new Error(error.message || 'Error al crear la postulación.');
            }
        }
    };


    // --- Renderizado ---

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                <p className="ml-3 text-lg text-gray-700">Cargando Dashboard...</p>
            </div>
        );
    }

    if (!user) {
        return null;
    }
    
    const totalCount = postulations.length;

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <header className="flex flex-col sm:flex-row justify-between items-center pb-6 border-b border-gray-200 mb-6">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center">
                    <Briefcase className="w-8 h-8 text-indigo-600 mr-3"/>
                    MyPostula Dashboard
                </h1>
                <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                    <button
                        onClick={handleNewPostulation}
                        className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Nueva Postulación
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-xl shadow-sm text-gray-700 bg-white hover:bg-gray-100 transition duration-150"
                    >
                        <LogOut className="w-5 h-5 mr-2" />
                        Cerrar Sesión
                    </button>
                </div>
            </header>

            {error && (
                <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                    {error}
                </div>
            )}

            {/* --- SECCIÓN DE TOTALES --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {/* Tarjeta de Total General */}
                <div className="bg-white rounded-2xl shadow-lg p-5 border-b-4 border-indigo-500">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-500">Total Postulaciones</p>
                        <Briefcase className="w-6 h-6 text-indigo-500" />
                    </div>
                    <p className="mt-1 text-3xl font-bold text-gray-900">{totalCount}</p>
                </div>
                
                {/* Tarjetas por Estado */}
                {Object.entries(counts).map(([key, { icon: Icon, bgColor, color, count }]) => (
                    <div key={key} className={`bg-white rounded-2xl shadow-lg p-5 border-b-4 ${bgColor}`}>
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-500">{STATUS_OPTIONS[key]}</p>
                            <Icon className={`w-6 h-6 ${color}`} />
                        </div>
                        <p className="mt-1 text-3xl font-bold text-gray-900">{count}</p>
                    </div>
                ))}
            </div>

            {/* --- TABLA DE POSTULACIONES --- */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-5 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">Listado de Postulaciones ({postulations.length})</h2>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                                {/* Cambiado Puesto por Posición */}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posición</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sueldo Esperado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {postulations.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                                        No tienes postulaciones registradas. ¡Empieza añadiendo una!
                                    </td>
                                </tr>
                            ) : (
                                postulations.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50 transition duration-100">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {/* Usamos 'position' en lugar de 'job_title'. Eliminada la lógica de link a offer_url */}
                                            {p.position}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.application_date_formatted}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {p.expected_salary ? `$${parseFloat(p.expected_salary).toLocaleString('es-ES')}` : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={p.status}
                                                onChange={(e) => handleStatusChange(p.id, e.target.value)}
                                                className={`py-1.5 px-3 rounded-xl border border-gray-300 shadow-sm text-sm font-medium focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150
                                                    ${p.status === 'accepted' && 'bg-green-100 text-green-800 border-green-300'}
                                                    ${p.status === 'declined' && 'bg-red-100 text-red-800 border-red-300'}
                                                    ${p.status === 'interview' && 'bg-blue-100 text-blue-800 border-blue-300'}
                                                    ${p.status === 'open' && 'bg-yellow-100 text-yellow-800 border-yellow-300'}
                                                `}
                                            >
                                                {Object.entries(STATUS_OPTIONS).map(([key, value]) => (
                                                    <option key={key} value={key}>{value}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex space-space-2">
                                                <button
                                                    onClick={() => handleEdit(p)}
                                                    className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50 transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(p.id)}
                                                    className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODAL DE CREACIÓN/EDICIÓN --- */}
            <PostulationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                postulation={currentPostulation}
                allCompanies={companies}
            />
        </div>
    );
}