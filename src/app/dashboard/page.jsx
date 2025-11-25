/**
 * Pantalla Principal (Dashboard) para MyPostula.
 * ADAPTADO al esquema: job_applications {position, expected_salary, application_date, status, offer_url, salary_currency}
 */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/utils/supabase';
import CreatableSelect from 'react-select/creatable';

// --- Configuración de Iconos SVG Inline ---
const Loader2 = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>);
const LogOut = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>);
const Plus = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" x2="12" y1="5" y2="19" /><line x1="5" x2="19" y1="12" y2="12" /></svg>);
const Edit = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5L2 22l1.5-5.5L17 3z" /></svg>);
const Trash = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>);
const Briefcase = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="14" x="2" y="7" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>);
const CheckCircle = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 3 3L22 7" />
  </svg>
);
const XCircle = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>);
const Clock = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>);
// Nuevo icono para el link
const LinkIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>);


// --- Tipos y Constantes ---

// Estados de la postulación
const STATUS_OPTIONS = {
  open: 'Abierta',
  interview: 'Entrevista',
  accepted: 'Aceptada',
  declined: 'Rechazada',
};

const JOB_TYPE_OPTIONS = {
  hybrid: 'Híbrido',
  remote: 'Remoto',
  onsite: 'Presencial',
  na: 'No Definido',
};

// Mapeo de estilos para los totales
const COUNT_STYLES = {
  open: { icon: Clock, color: 'text-yellow-600', count: 0, bgColor: 'border-yellow-500' },
  accepted: { icon: CheckCircle, color: 'text-green-600', count: 0, bgColor: 'border-green-500' },
  declined: { icon: XCircle, color: 'text-red-600', count: 0, bgColor: 'border-red-500' },
};

// --- Componente Modal (Crear/Editar Postulación) ---

/**
 * Muestra un modal para crear una nueva postulación o editar una existente.
 * Adaptado a las columnas: position, expected_salary, application_date, status, company_id, offer_url, salary_currency.
 */
const PostulationModal = ({ isOpen, onClose, onSubmit, postulation = null, allCompanies = [], currencies = [] }) => {
  const isEdit = !!postulation;
  const [formData, setFormData] = useState({
    position: postulation?.position || '',
    expected_salary: postulation?.expected_salary || '',
    application_date: postulation?.application_date || new Date().toISOString().split('T')[0],
    status: postulation?.status || 'open',
    offer_url: postulation?.offer_url || '',
    company_id: postulation?.company_id || '',
    job_type: postulation?.job_type || 'na',
    city: postulation?.city || '',
    country: postulation?.country || '',
    salary_currency: postulation?.salary_currency || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const initialCompany = allCompanies.find(c => c.id === postulation?.company_id);
  const [selectedCompany, setSelectedCompany] = useState(initialCompany ? { value: initialCompany.id, label: initialCompany.name } : null);
  useEffect(() => {
    if (postulation) {
      setFormData({
        position: postulation.position || '',
        expected_salary: postulation.expected_salary || '',
        application_date: postulation.application_date ? postulation.application_date.split('T')[0] : new Date().toISOString().split('T')[0],
        status: postulation.status || 'open',
        offer_url: postulation.offer_url || '',
        company_id: postulation.company_id || '',
        job_type: postulation.job_type || 'na',
        city: postulation.city || '',
        country: postulation.country || '',
        salary_currency: postulation.salary_currency || '',
      });
    } else {
      setFormData({
        position: '',
        expected_salary: '',
        application_date: new Date().toISOString().split('T')[0],
        status: 'open',
        offer_url: '',
        company_id: '',
        job_type: 'na',
        city: '',
        country: '',
        salary_currency: '',
      });
    }
  }, [postulation]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleCompanyChange = (newValue) => {
    setSelectedCompany(newValue);
    setError(null);
  };

  // Mapeo de empresas para el select
  const companyOptions = allCompanies.map(comp => ({
    value: comp.id,
    label: comp.name
  }));

  // Definición de estilos base para Tailwind
  const customStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: '42px',
      borderColor: '#D1D5DB', // gray-300
      borderRadius: '0.5rem', // rounded-lg
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', // shadow-sm
      '&:hover': {
        borderColor: '#D1D5DB', // No cambiar al hacer hover
      },
      '&:focus-within': {
        borderColor: '#4F46E5', // indigo-600
        boxShadow: '0 0 0 1px #4F46E5', // focus:ring-indigo-500
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#9CA3AF', // gray-400
    }),
    input: (provided) => ({
      ...provided,
      color: '#000', // gray-800
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#1F2937', // Color del texto del valor seleccionado (negro/gray-800)
    }),
    option: (provided, state) => ({
      ...provided,
      // Color del texto de las opciones en la lista
      color: '#1F2937',
      // Color de fondo si la opción está seleccionada o enfocada
      backgroundColor: state.isFocused ? '#E5E7EB' : 'white', // gray-200 al hacer hover
      '&:active': {
        backgroundColor: '#D1D5DB', // gray-300 al hacer click
      },
    }),
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!selectedCompany) {
        setError('Debes seleccionar o ingresar un nombre de empresa.');
        setLoading(false);
        return;
      }

      let finalCompanyId;
      let companyName = selectedCompany.label;

      if (selectedCompany.__isNew__) {
        let { data: existingCompany, error: searchError } = await supabase
          .from('companies')
          .select('id')
          .eq('name', companyName)
          .single();

        if (searchError && searchError.code !== 'PGRST116') {
          throw new Error(searchError.message || 'Error al buscar empresa existente.');
        }

        if (existingCompany) {
          finalCompanyId = existingCompany.id;
        } else {
          const { data: newCompany, error: createError } = await supabase
            .from('companies')
            .insert([{ name: companyName }])
            .select('id')
            .single();

          if (createError) {
            throw new Error(createError.message || 'Error al crear nueva empresa.');
          }
          finalCompanyId = newCompany.id;
        }
      } else {
        finalCompanyId = selectedCompany.value;
      }

      // 2. Preparar los datos de la postulación
      const payload = {
        position: formData.position,
        expected_salary: parseFloat(formData.expected_salary) || null,
        application_date: formData.application_date,
        status: formData.status,
        offer_url: formData.offer_url.trim() || null,
        company_id: finalCompanyId, // Usamos el ID final
        job_type: formData.job_type,
        city: formData.city.trim() || null,
        country: formData.country.trim() || null,
        salary_currency: formData.salary_currency || null,
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
      <div className="bg-white rounded-xl shadow-3xl w-full max-w-2xl p-6 transform transition-all duration-300 scale-100">
        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">{isEdit ? 'Editar Postulación' : 'Registrar Postulación'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
          {error && <div className="p-3 text-sm bg-red-100 text-red-700 rounded-lg">{error}</div>}
          {/* Campo Posición (position) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700">Puesto de trabajo</label>
              <input type="text" id="position" name="position" required value={formData.position} onChange={handleChange}
                className="mt-1 block w-full text-gray-900 border border-gray-300 rounded-lg shadow-sm p-2.5 focus:border-indigo-500 focus:ring-indigo-500" />
            </div>
            <div>
              <label htmlFor="company-select" className="block text-sm font-medium text-gray-700">Empresa (Buscar o Crear)</label>
              <CreatableSelect
                id="company-select"
                className="mt-1"
                placeholder="Busca o añade la empresa..."
                isClearable
                options={companyOptions}
                value={selectedCompany}
                onChange={handleCompanyChange}
                styles={customStyles}
                formatCreateLabel={(inputValue) => `Crear nueva empresa: "${inputValue}"`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Campo Ciudad (city) */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">Ciudad</label>
              <input type="text" id="city" name="city" value={formData.city} onChange={handleChange}
                placeholder="Ej. Madrid"
                className="mt-1 block w-full text-gray-900 border border-gray-300 rounded-lg shadow-sm p-2.5 focus:border-indigo-500 focus:ring-indigo-500" />
            </div>
            {/* Campo País (country) */}
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700">País</label>
              <input type="text" id="country" name="country" value={formData.country} onChange={handleChange}
                placeholder="Ej. España"
                className="mt-1 block w-full text-gray-900 border border-gray-300 rounded-lg shadow-sm p-2.5 focus:border-indigo-500 focus:ring-indigo-500" />
            </div>
          </div>

          {/* Campo URL de la Oferta (offer_url) AÑADIDO */}
          <div>
            <label htmlFor="offer_url" className="block text-sm font-medium text-gray-700">URL de la Oferta (Opcional)</label>
            <input
              type="url"
              id="offer_url"
              name="offer_url"
              value={formData.offer_url}
              onChange={handleChange}
              placeholder="Ej. https://www.linkedin.com/jobs/..."
              className="mt-1 block w-full text-gray-900 border border-gray-300 rounded-lg shadow-sm p-2.5 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <label htmlFor="expected_salary" className="block text-sm font-medium text-gray-700">Sueldo Esperado</label>
                <input type="number" id="expected_salary" name="expected_salary" value={formData.expected_salary} onChange={handleChange}
                  placeholder="Ej. 30000"
                  className="mt-1 block text-gray-900 w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:border-indigo-500 focus:ring-indigo-500" />
              </div>
              <div className="w-1/3">
                <label htmlFor="salary_currency" className="block text-sm font-medium text-gray-700">Divisa</label>
                <select id="salary_currency" name="salary_currency" value={formData.salary_currency} onChange={handleChange}
                  className="mt-1 block w-full text-gray-900 border border-gray-300 rounded-lg shadow-sm p-2.5 focus:border-indigo-500 focus:ring-indigo-500">
                  <option value="">--</option>
                  {currencies.map(curr => (
                    <option key={curr.id} value={curr.id}>{curr.iso_code}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="application_date" className="block text-sm font-medium text-gray-700">Fecha Postulación</label>
              <input type="date" id="application_date" name="application_date" required value={formData.application_date} onChange={handleChange}
                className="mt-1 block text-gray-900 w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:border-indigo-500 focus:ring-indigo-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="job_type" className="block text-sm font-medium text-gray-700">Tipo de Empleo</label>
              <select id="job_type" name="job_type" required value={formData.job_type} onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 text-gray-900 rounded-lg shadow-sm p-2.5 focus:border-indigo-500 focus:ring-indigo-500">
                {Object.entries(JOB_TYPE_OPTIONS).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Estado</label>
              <select id="status" name="status" required value={formData.status} onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 text-gray-900 rounded-lg shadow-sm p-2.5 focus:border-indigo-500 focus:ring-indigo-500">
                {Object.entries(STATUS_OPTIONS).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>
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
  const [currencies, setCurrencies] = useState([]);
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
companies(name),
currencies!salary_currency(symbol, iso_code)
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
      application_date_formatted: new Date(p.application_date).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' }),
      job_type_formatted: JOB_TYPE_OPTIONS[p.job_type] || 'N/A',
      currency_symbol: p.currencies?.symbol || '$',
      currency_iso: p.currencies?.iso_code || ''
    }));

    setPostulations(loadedPostulations);
    calculateCounts(loadedPostulations);
  }, [calculateCounts]);

  // En DashboardPage, después de loadPostulations
  const loadCompanies = useCallback(async () => {
    const { data: companiesData, error: companiesError } = await supabase
      .from('companies')
      .select('id, name')
      .order('name', { ascending: true });

    if (companiesError) {
      console.error('Error al cargar empresas:', companiesError);
      setError('Error al cargar la lista de empresas.');
      return;
    }
    setCompanies(companiesData || []);
  }, []); // No tiene dependencias externas

  const loadCurrencies = useCallback(async () => {
    const { data, error } = await supabase
      .from('currencies')
      .select('id, iso_code')
      .order('iso_code', { ascending: true });

    if (error) {
      console.error('Error al cargar divisas:', error);
      return;
    }
    console.log(data);
    setCurrencies(data || []);
  }, []);

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
      await loadCompanies();
      await loadCurrencies();

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

  }, [loadPostulations, loadCompanies, loadCurrencies]);


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

  // En DashboardPage, donde defines los manejadores de eventos
  const handleStatusChange = async (postulationId, newStatus) => {
    setError(null);
    if (!user) return;

    // 1. Ejecutar la actualización en Supabase
    // NOTA: No necesitamos .select() aquí, ya que solo cambiaremos un campo localmente.
    const { error } = await supabase
      .from('job_applications')
      .update({ status: newStatus })
      .eq('id', postulationId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error al actualizar estado:', error);
      setError('No se pudo actualizar el estado.');
      return;
    }

    // 2. Si es exitoso, actualizar el estado local (Postulations) al instante
    setPostulations(prevPostulations => {
      // Mapear la lista anterior para encontrar y actualizar el elemento
      const updatedPostulations = prevPostulations.map(p => {
        if (p.id === postulationId) {
          // Devolver el objeto actualizado con el nuevo estado
          return { ...p, status: newStatus };
        }
        return p;
      });

      // 3. Recalcular los contadores (Totales) con la nueva lista
      // (La función calculateCounts es necesaria como dependencia en useCallback)
      calculateCounts(updatedPostulations);

      return updatedPostulations;
    });
  };

  const handleDelete = async (postulationId) => {
    setError(null);
    // NOTA: Usar custom modal en producción
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta postulación? Esta acción es irreversible.')) {
      return;
    }
    if (!user) return;

    // 1. Ejecutar la eliminación en Supabase
    const { error } = await supabase
      .from('job_applications')
      .delete()
      .eq('id', postulationId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error al eliminar:', error);
      setError('No se pudo eliminar la postulación.');
      return; // Detener si hay error
    }

    // 2. Si la eliminación es exitosa, actualizar el estado local (Postulations) al instante
    setPostulations(prevPostulations => {
      // Filtrar la lista anterior para EXCLUIR el elemento eliminado
      const updatedPostulations = prevPostulations.filter(p => p.id !== postulationId);

      // 3. Recalcular los contadores (Totales) con la nueva lista
      calculateCounts(updatedPostulations);

      return updatedPostulations;
    });
  };


  const handleModalSubmit = async (payload, postulationId) => {
    setError(null);
    if (!user) {
      setError('Usuario no autenticado.');
      return;
    }

    // Aseguramos que el payload siempre incluya offer_url, aunque sea null, para el update/insert
    const finalPayload = {
      ...payload,
      offer_url: payload.offer_url || null, // Asegura que sea null si está vacío
    };

    if (postulationId) {
      // MODO EDICIÓN

      // 1. Ejecutar la actualización en Supabase
      const { data, error } = await supabase
        .from('job_applications')
        .update(finalPayload) // Usamos finalPayload
        .eq('id', postulationId)
        .eq('user_id', user.id)
        // CLAVE: Solicitamos el registro completo y el nombre de la empresa JOINED
        .select(`*, companies(name), currencies!salary_currency(symbol, iso_code)`)
        .single();

      if (error) {
        throw new Error(error.message || 'Error al actualizar la postulación.');
      }

      // 2. Si es exitoso, actualizar el estado local (Postulations) al instante
      if (data) {
        const updatedPostulation = {
          ...data,
          // Formateamos los campos necesarios para la tabla
          name: data.companies?.name || 'N/A',
          application_date_formatted: new Date(data.application_date).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' }),
          currency_symbol: data.currencies?.symbol || '$',
          currency_iso: data.currencies?.iso_code || ''
        };

        setPostulations(prevPostulations => {
          const updatedList = prevPostulations.map(p => {
            // Si encontramos el registro, lo reemplazamos con el nuevo objeto data
            if (p.id === postulationId) {
              return updatedPostulation;
            }
            return p;
          });

          // El estado pudo cambiar (por ejemplo, de 'open' a 'accepted'), recalcular totales.
          calculateCounts(updatedList);
          return updatedList;
        });
      }
    } else {
      // MODO CREACIÓN
      const { data, error } = await supabase
        .from('job_applications')
        .insert([{ ...finalPayload, user_id: user.id }]) // Usamos finalPayload
        // CLAVE: Solicitamos los datos insertados y el nombre de la empresa JOINED
        .select(`*, companies(name), currencies!salary_currency(symbol, iso_code)`)
        .single();

      if (error) {
        throw new Error(error.message || 'Error al crear la postulación.');
      }

      // --- INSERCIÓN LOCAL INMEDIATA EN EL ESTADO ---
      if (data) {
        const newPostulation = {
          ...data,
          // Formateamos los campos necesarios para la tabla
          name: data.companies?.name || 'N/A',
          application_date_formatted: new Date(data.application_date).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' }),
          currency_symbol: data.currencies?.symbol || '$',
          currency_iso: data.currencies?.iso_code || ''
        };

        // Agregamos la nueva postulación al estado
        setPostulations(prev => {
          const updatedList = [newPostulation, ...prev];
          calculateCounts(updatedList); // Recalculamos los totales
          return updatedList;
        });
      }
    }

    // **IMPORTANTE:** Recargar empresas (loadCompanies) para que la nueva empresa
    // creada en el modal aparezca en el selector la próxima vez.
    await loadCompanies();
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
          <Briefcase className="w-8 h-8 text-indigo-600 mr-3" />
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vacante</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sueldo Esperado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {postulations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                    No tienes postulaciones registradas. ¡Empieza añadiendo una!
                  </td>
                </tr>
              ) : (
                  postulations.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition duration-100">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {p.offer_url ?
                          (
                            <a href={p.offer_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 flex items-center">
                              <b>{p.position}</b>
                              <LinkIcon className="w-4 h-4 ml-1" />
                            </a>
                          ) : (<><b>{p.position}</b><br/></>)}
                        {p.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {p.city && p.country ? `${p.city}, ${p.country}` : p.city || p.country || 'N/A'}
                        <br/>
                        ({p.job_type_formatted})
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.application_date_formatted}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {p.expected_salary ? `${p.currency_symbol}${parseFloat(p.expected_salary).toLocaleString('es-ES')} ${p.currency_iso}` : 'N/A'}
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
        currencies={currencies}
      />
    </div>
  );
}
