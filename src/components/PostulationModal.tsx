import { useState, useEffect } from "react";
import { Loader2, XCircle } from "lucide-react";
import { supabase } from "@/utils/supabase";
import CreatableSelect from "react-select/creatable";
import {
  STATUS_OPTIONS,
  JOB_TYPE_OPTIONS,
  SALARY_FRECUENCY_OPTIONS,
} from "@/utils/constants";
import { Company, PostulationList, Currency, UserSupabase } from "@/types";
import { PostulationService } from "@/services/postulations";

interface PostulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  postulation?: PostulationList;
  allCompanies?: Company[];
  currencies?: Currency[];
  user: UserSupabase | null;
  onPostulationSaved: () => void;
}

type CompanyOption = {
  value: number;
  label: string;
  __isNew__?: boolean;
};

const emptyPostulation: Partial<PostulationList> = {
  application_date: new Date().toISOString().split("T")[0],
};

const PostulationModal = ({
  isOpen,
  onClose,
  postulation,
  allCompanies,
  currencies,
  user,
  onPostulationSaved,
}: PostulationModalProps) => {
  const isEdit = !!postulation;
  const [formData, setFormData] = useState<Partial<PostulationList>>(postulation || emptyPostulation);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialCompany = allCompanies?.find(
    (c) => c.id === postulation?.company_id,
  );
  const [selectedCompany, setSelectedCompany] = useState<CompanyOption | null>(
    initialCompany
      ? { value: initialCompany.id, label: initialCompany.name }
      : null,
  );

  useEffect(() => {
    if (postulation) {
      setFormData(postulation);
      // Find the company from allCompanies array using company_id
      const company = allCompanies?.find(c => c.id === postulation.company_id);
      if (company) {
        setSelectedCompany({ value: company.id, label: company.name });
      }
    } else {
      setFormData(emptyPostulation);
      setSelectedCompany(null);
    }
  }, [postulation, allCompanies]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleCompanyChange = (newValue: CompanyOption | null) => {
    setSelectedCompany(newValue);
    setError(null);
  };

  // Mapeo de empresas para el select
  const companyOptions = allCompanies?.map((comp) => ({
    value: comp.id,
    label: comp.name,
  }));

  // Definición de estilos base para Tailwind
  const customStyles = {
    control: (provided: any) => ({
      ...provided,
      minHeight: "42px",
      borderColor: "#D1D5DB", // gray-300
      borderRadius: "0.5rem", // rounded-lg
      boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)", // shadow-sm
      "&:hover": {
        borderColor: "#D1D5DB", // No cambiar al hacer hover
      },
      "&:focus-within": {
        borderColor: "#4F46E5", // indigo-600
        boxShadow: "0 0 0 1px #4F46E5", // focus:ring-indigo-500
      },
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "#9CA3AF", // gray-400
    }),
    input: (provided: any) => ({
      ...provided,
      color: "#000", // gray-800
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: "#1F2937", // Color del texto del valor seleccionado (negro/gray-800)
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      // Color del texto de las opciones en la lista
      color: "#1F2937",
      // Color de fondo si la opción está seleccionada o enfocada
      backgroundColor: state.isFocused ? "#E5E7EB" : "white", // gray-200 al hacer hover
      "&:active": {
        backgroundColor: "#D1D5DB", // gray-300 al hacer click
      },
    }),
  };

  const handleModalSubmit = async (payload: PostulationList, postulationId: number) => {
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
      const { error } = await supabase
        .from("job_applications")
        .update(finalPayload)
        .eq("id", postulationId)
        .eq("user_id", user.id);

      if (error) {
        throw new Error(error.message || "Error al actualizar la postulación.");
      }
    } else {
      // MODO CREACIÓN
      const { error } = await supabase
        .from("job_applications")
        .insert([{ ...finalPayload, user_id: user.id }]);

      if (error) {
        throw new Error(error.message || "Error al crear la postulación.");
      }
    }

    // **IMPORTANTE:** Recargar empresas (loadCompanies) para que la nueva empresa
    // creada en el modal aparezca en el selector la próxima vez.
    await PostulationService.getCompanies();
    
    onPostulationSaved();
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!selectedCompany) {
        setError("Debes seleccionar o ingresar un nombre de empresa.");
        setLoading(false);
        return;
      }

      let finalCompanyId;
      let companyName = selectedCompany.label;

      if (selectedCompany.__isNew__) {
        let { data: existingCompany, error: searchError } = await supabase
          .from("companies")
          .select("id")
          .eq("name", companyName)
          .single();

        if (searchError && searchError.code !== "PGRST116") {
          throw new Error(
            searchError.message || "Error al buscar empresa existente.",
          );
        }

        if (existingCompany) {
          finalCompanyId = existingCompany.id;
        } else {
          const { data: newCompany, error: createError } = await supabase
            .from("companies")
            .insert([{ name: companyName }])
            .select("id")
            .single();

          if (createError) {
            throw new Error(
              createError.message || "Error al crear nueva empresa.",
            );
          }
          finalCompanyId = newCompany.id;
        }
      } else {
        finalCompanyId = selectedCompany.value;
      }

      // 2. Preparar los datos de la postulación
      // Excluir campos que no pertenecen a la tabla job_applications
      const { company_name, currency, ...validFormData } = formData as any;
      const payload = {
        ...validFormData,
        company_id: finalCompanyId,
      };

      // 3. Llamar a la función principal para guardar/actualizar
      await handleModalSubmit(payload, postulation?.id || 0);
      
      // 4. Resetear el formulario y cerrar
      setFormData(emptyPostulation);
      setSelectedCompany(null);
      setError(null);
      onClose();
    } catch (err) {
      const error = err as Error;
      console.error("Error en el modal al guardar:", error);
      setError(error.message || "Ocurrió un error al guardar la postulación.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 transition-opacity duration-300">
      <div className="bg-white rounded-xl shadow-3xl w-full max-w-2xl p-6 transform transition-all duration-300 scale-100">
        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEdit ? "Editar Postulación" : "Registrar Postulación"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="p-3 text-sm bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          {/* Campo Posición (position) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="position"
                className="block text-sm font-medium text-gray-700"
              >
                Puesto de trabajo
              </label>
              <input
                type="text"
                id="position"
                name="position"
                required
                value={formData.position || ""}
                onChange={handleChange}
                className="mt-1 block w-full text-gray-900 border border-gray-300 rounded-lg shadow-sm p-2.5 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label
                htmlFor="company-select"
                className="block text-sm font-medium text-gray-700"
              >
                Empresa (Buscar o Crear)
              </label>
              <CreatableSelect
                id="company-select"
                className="mt-1"
                placeholder="Busca o añade la empresa..."
                isClearable
                options={companyOptions}
                value={selectedCompany}
                onChange={handleCompanyChange}
                styles={customStyles}
                formatCreateLabel={(inputValue) =>
                  `Crear nueva empresa: "${inputValue}"`
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Campo Ciudad (city) */}
            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-gray-700"
              >
                Ciudad
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city || ""}
                onChange={handleChange}
                placeholder="Ej. Madrid"
                className="mt-1 block w-full text-gray-900 border border-gray-300 rounded-lg shadow-sm p-2.5 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            {/* Campo País (country) */}
            <div>
              <label
                htmlFor="country"
                className="block text-sm font-medium text-gray-700"
              >
                País
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country || ""}
                onChange={handleChange}
                placeholder="Ej. España"
                className="mt-1 block w-full text-gray-900 border border-gray-300 rounded-lg shadow-sm p-2.5 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Campo URL de la Oferta (offer_url) AÑADIDO */}
          <div>
            <label
              htmlFor="offer_url"
              className="block text-sm font-medium text-gray-700"
            >
              URL de la Oferta (Opcional)
            </label>
            <input
              type="url"
              id="offer_url"
              name="offer_url"
              value={formData.offer_url || ""}
              onChange={handleChange}
              placeholder="Ej. https://www.linkedin.com/jobs/..."
              className="mt-1 block w-full text-gray-900 border border-gray-300 rounded-lg shadow-sm p-2.5 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <label
                  htmlFor="expected_salary"
                  className="block text-sm font-medium text-gray-700"
                >
                  Sueldo Esperado
                </label>
                <input
                  type="number"
                  id="expected_salary"
                  name="expected_salary"
                  value={formData.expected_salary || ""}
                  onChange={handleChange}
                  placeholder="Ej. 30000"
                  className="mt-1 block text-gray-900 w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="w-1/3">
                <label
                  htmlFor="salary_currency"
                  className="block text-sm font-medium text-gray-700"
                >
                  Divisa
                </label>
                <select
                  id="salary_currency"
                  name="salary_currency"
                  value={formData.salary_currency || ""}
                  onChange={handleChange}
                  className="mt-1 block w-full text-gray-900 border border-gray-300 rounded-lg shadow-sm p-2.5 focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">--</option>
                  {currencies?.map((curr) => (
                    <option key={curr.id} value={curr.id}>
                      {curr.iso_code}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label
                htmlFor="salary_frecuency"
                className="block text-sm font-medium text-gray-700"
              >
                Frecuencia
              </label>
              <select
                id="salary_frecuency"
                name="salary_frecuency"
                value={formData.salary_frecuency || ""}
                onChange={handleChange}
                className="mt-1 block w-full text-gray-900 border border-gray-300 rounded-lg shadow-sm p-2.5 focus:border-indigo-500 focus:ring-indigo-500"
              >
                {Object.entries(SALARY_FRECUENCY_OPTIONS).map(
                  ([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="job_type"
                className="block text-sm font-medium text-gray-700"
              >
                Tipo de Empleo
              </label>
              <select
                id="job_type"
                name="job_type"
                required
                value={formData.job_type || ""}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 text-gray-900 rounded-lg shadow-sm p-2.5 focus:border-indigo-500 focus:ring-indigo-500"
              >
                {Object.entries(JOB_TYPE_OPTIONS).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700"
              >
                Estado
              </label>
              <select
                id="status"
                name="status"
                required
                value={formData.status || ""}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 text-gray-900 rounded-lg shadow-sm p-2.5 focus:border-indigo-500 focus:ring-indigo-500"
              >
                {Object.entries(STATUS_OPTIONS).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="application_date"
              className="block text-sm font-medium text-gray-700"
            >
              Fecha de Postulación
            </label>
            <input
              type="date"
              id="application_date"
              name="application_date"
              value={formData.application_date || ""}
              onChange={handleChange}
              className="mt-1 block w-full text-gray-900 border border-gray-300 rounded-lg shadow-sm p-2.5 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center px-4 py-2 mt-6 border border-transparent text-lg font-bold rounded-xl shadow-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : isEdit ? (
              "Guardar Cambios"
            ) : (
              "Crear Postulación"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};


export default PostulationModal;
