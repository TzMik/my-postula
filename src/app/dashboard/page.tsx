/**
 * Pantalla Principal (Dashboard) para MyPostula.
 * ADAPTADO al esquema: job_applications {position, expected_salary, application_date, status, offer_url, salary_currency}
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase, subscribeToPostulations } from "@/utils/supabase";
import { formatApplicationDate } from "@/utils/date-utils";
import {
  Loader2,
  LogOut,
  Plus,
  Edit,
  Trash,
  Briefcase,
  CheckCircle,
  XCircle,
  Clock,
  LinkIcon,
} from "lucide-react";
import PostulationModal from "@/components/PostulationModal";

import { STATUS_OPTIONS, JOB_TYPE_OPTIONS } from "@/utils/constants";

import { PostulationService } from "@/services/postulations";
import { Auth } from "@/services/auth";
import { Postulation, UserSupabase } from "@/types";

// --- Tipos y Constantes ---

// Mapeo de estilos para los totales
const COUNT_STYLES = {
  open: {
    icon: Clock,
    color: "text-yellow-600",
    count: 0,
    bgColor: "border-yellow-500",
  },
  accepted: {
    icon: CheckCircle,
    color: "text-green-600",
    count: 0,
    bgColor: "border-green-500",
  },
  declined: {
    icon: XCircle,
    color: "text-red-600",
    count: 0,
    bgColor: "border-red-500",
  },
};

// --- Componente Principal del Dashboard ---

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserSupabase | null>(null);
  const [postulations, setPostulations] = useState<Postulation[]>([]);
  const [companies, setCompanies] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPostulation, setCurrentPostulation] = useState(null); // Postulación a editar
  const [error, setError] = useState<string | null>(null);

  // Mapeo de totales (Estado y contador)
  const [counts, setCounts] = useState({ ...COUNT_STYLES });

  // --- Funciones de Supabase ---

  /**
   * Calcula los totales de las postulaciones por estado.
   */
  const calculateCounts = useCallback((postulationsList: Postulation[]) => {
    const newCounts = { ...COUNT_STYLES };
    newCounts.open.count = postulationsList.filter(
      (p) => p.status === "open" || p.status === "interview",
    ).length;
    newCounts.accepted.count = postulationsList.filter(
      (p) => p.status === "accepted",
    ).length;
    newCounts.declined.count = postulationsList.filter(
      (p) => p.status === "declined",
    ).length;
    setCounts(newCounts);
  }, []);

  /**
   * Hook principal para la inicialización y suscripción.
   */
  useEffect(() => {
    let isSubscribed = true;

    const setupData = async () => {
      setError(null);

      // 1. Obtener sesión de usuario
      const { data: authData, error: authError } =
        await supabase.auth.getSession();

      if (!isSubscribed) return;

      if (authError || !authData?.session) {
        // No hay sesión, redirigir al login
        window.location.href = "/login";
        return null;
      }

      const currentUser = authData.session.user;
      setUser(currentUser);
      console.log(currentUser);

      // 2. Obtener la lista de empresas (companies)
      await PostulationService.getCompanies();
      await PostulationService.getCurrencies();

      // 3. Suscripción en tiempo real a job_applications
      const postulationsSubscription = subscribeToPostulations(
        currentUser.id,
        PostulationService.getAllByUserId,
        {
          onData: (data) => {
            if (isSubscribed) {
              console.log(data);
              setPostulations(data);
              calculateCounts(data);
            }
          },
          onError: (msg) => {
            if (isSubscribed) setError(msg);
          },
          onReady: () => {
            if (isSubscribed) setLoading(false);
          },
        },
      );

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
  }, [
    PostulationService.getAllByUserId,
    PostulationService.getCompanies,
    PostulationService.getCurrencies,
  ]);

  // --- Manejadores de Eventos (Delete/Update/Submit) ---

  // En DashboardPage, donde defines los manejadores de eventos
  const handleStatusChange = async (postulationId: number, newStatus: string) => {
    setError(null);
    if (!user) return;

    // 1. Ejecutar la actualización en Supabase
    // NOTA: No necesitamos .select() aquí, ya que solo cambiaremos un campo localmente.
    const { error } = await supabase
      .from("job_applications")
      .update({ status: newStatus })
      .eq("id", postulationId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error al actualizar estado:", error);
      setError("No se pudo actualizar el estado.");
      return;
    }

    // 2. Si es exitoso, actualizar el estado local (Postulations) al instante
    setPostulations((prevPostulations) => {
      // Mapear la lista anterior para encontrar y actualizar el elemento
      const updatedPostulations = prevPostulations.map((p) => {
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
    if (
      !window.confirm(
        "¿Estás seguro de que quieres eliminar esta postulación? Esta acción es irreversible.",
      )
    ) {
      return;
    }
    if (!user) return;

    // 1. Ejecutar la eliminación en Supabase
    const { error } = await supabase
      .from("job_applications")
      .delete()
      .eq("id", postulationId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error al eliminar:", error);
      setError("No se pudo eliminar la postulación.");
      return; // Detener si hay error
    }

    // 2. Si la eliminación es exitosa, actualizar el estado local (Postulations) al instante
    setPostulations((prevPostulations) => {
      // Filtrar la lista anterior para EXCLUIR el elemento eliminado
      const updatedPostulations = prevPostulations.filter(
        (p) => p.id !== postulationId,
      );

      // 3. Recalcular los contadores (Totales) con la nueva lista
      calculateCounts(updatedPostulations);

      return updatedPostulations;
    });
  };

  const handleModalSubmit = async (payload, postulationId) => {
    setError(null);
    if (!user) {
      setError("Usuario no autenticado.");
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
        .from("job_applications")
        .update(finalPayload) // Usamos finalPayload
        .eq("id", postulationId)
        .eq("user_id", user.id)
        // CLAVE: Solicitamos el registro completo y el nombre de la empresa JOINED
        .select(
          `*, companies(name), currencies!salary_currency(symbol, iso_code)`,
        )
        .single();

      if (error) {
        throw new Error(error.message || "Error al actualizar la postulación.");
      }

      // 2. Si es exitoso, actualizar el estado local (Postulations) al instante
      if (data) {
        const updatedPostulation = {
          ...data,
          // Formateamos los campos necesarios para la tabla
          name: data.companies?.name || "N/A",
          application_date_formatted: new Date(
            data.application_date,
          ).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          currency_symbol: data.currencies?.symbol || "$",
          currency_iso: data.currencies?.iso_code || "",
        };

        setPostulations((prevPostulations) => {
          const updatedList = prevPostulations.map((p) => {
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
        .from("job_applications")
        .insert([{ ...finalPayload, user_id: user.id }]) // Usamos finalPayload
        // CLAVE: Solicitamos los datos insertados y el nombre de la empresa JOINED
        .select(
          `*, companies(name), currencies!salary_currency(symbol, iso_code)`,
        )
        .single();

      if (error) {
        throw new Error(error.message || "Error al crear la postulación.");
      }

      // --- INSERCIÓN LOCAL INMEDIATA EN EL ESTADO ---
      if (data) {
        const newPostulation = {
          ...data,
          // Formateamos los campos necesarios para la tabla
          name: data.companies?.name || "N/A",
          application_date_formatted: new Date(
            data.application_date,
          ).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          currency_symbol: data.currencies?.symbol || "$",
          currency_iso: data.currencies?.iso_code || "",
        };

        // Agregamos la nueva postulación al estado
        setPostulations((prev) => {
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
            onClick={() => PostulationService.handleNewPostulation(setCurrentPostulation, setIsModalOpen)}
            className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nueva Postulación
          </button>
          <button
            onClick={Auth.handleLogout}
            className="flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-xl shadow-sm text-gray-700 bg-white hover:bg-gray-100 transition duration-150"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Cerrar Sesión
          </button>
        </div>
      </header>

      {error && (
        <div
          className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* --- SECCIÓN DE TOTALES --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Tarjeta de Total General */}
        <div className="bg-white rounded-2xl shadow-lg p-5 border-b-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">
              Total Postulaciones
            </p>
            <Briefcase className="w-6 h-6 text-indigo-500" />
          </div>
          <p className="mt-1 text-3xl font-bold text-gray-900">{totalCount}</p>
        </div>

        {/* Tarjetas por Estado */}
        {Object.entries(counts).map(
          ([key, { icon: Icon, bgColor, color, count }]) => (
            <div
              key={key}
              className={`bg-white rounded-2xl shadow-lg p-5 border-b-4 ${bgColor}`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">
                  {STATUS_OPTIONS[key]}
                </p>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <p className="mt-1 text-3xl font-bold text-gray-900">{count}</p>
            </div>
          ),
        )}
      </div>

      {/* --- TABLA DE POSTULACIONES --- */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Listado de Postulaciones ({postulations.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vacante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sueldo Esperado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {postulations.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No tienes postulaciones registradas. ¡Empieza añadiendo una!
                  </td>
                </tr>
              ) : (
                postulations.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-gray-50 transition duration-100"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {p.offer_url ? (
                        <a
                          href={p.offer_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 flex items-center"
                        >
                          <b>{p.position}</b>
                          <LinkIcon className="w-4 h-4 ml-1" />
                        </a>
                      ) : (
                        <>
                          <b>{p.position}</b>
                          <br />
                        </>
                      )}
                      {p.company_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {p.city && p.country
                        ? `${p.city}, ${p.country}`
                        : p.city || p.country || "N/A"}
                      <br />({JOB_TYPE_OPTIONS[p.job_type]})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatApplicationDate(p.application_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {p.expected_salary
                        ? `${p.currency?.symbol || ""}${parseFloat(p.expected_salary).toLocaleString("es-ES")} ${p.currency?.iso_code || ""}`
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={p.status}
                        onChange={(e) =>
                          handleStatusChange(p.id, e.target.value)
                        }
                        className={`py-1.5 px-3 rounded-xl border border-gray-300 shadow-sm text-sm font-medium focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150
${p.status === "accepted" && "bg-green-100 text-green-800 border-green-300"}
${p.status === "declined" && "bg-red-100 text-red-800 border-red-300"}
${p.status === "interview" && "bg-blue-100 text-blue-800 border-blue-300"}
${p.status === "open" && "bg-yellow-100 text-yellow-800 border-yellow-300"}
`}
                      >
                        {Object.entries(STATUS_OPTIONS).map(([key, value]) => (
                          <option key={key} value={key}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-space-2">
                        <button
                          onClick={() => PostulationService.handleEdit(setCurrentPostulation, setIsModalOpen, p)}
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
