-- ============================================
-- MyPostula - SQL Setup para Supabase
-- ============================================

-- 1. TABLA DE MONEDAS
-- ============================================
CREATE TABLE IF NOT EXISTS currencies (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  symbol VARCHAR NOT NULL,
  iso_code VARCHAR NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insertar monedas iniciales
INSERT INTO currencies (name, symbol, iso_code) VALUES
  ('Dólar estadounidense', '$', 'USD'),
  ('Euro', '€', 'EUR'),
  ('Peso chileno', '$', 'CLP'),
  ('Peso mexicano', '$', 'MXN'),
  ('Peso argentino', '$', 'ARS'),
  ('Sol peruano', 'S/', 'PEN'),
  ('Peso colombiano', '$', 'COP')
ON CONFLICT DO NOTHING;

-- 2. TABLA DE EMPRESAS
-- ============================================
CREATE TABLE IF NOT EXISTS companies (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TABLA DE USUARIOS
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  auth_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR,
  last_name VARCHAR,
  display_name VARCHAR,
  img_url VARCHAR,
  description TEXT,
  first_time BOOLEAN DEFAULT true,
  default_currency_id BIGINT REFERENCES currencies(id),
  default_city VARCHAR,
  default_country VARCHAR,
  language VARCHAR DEFAULT 'es',
  theme_preference VARCHAR DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índice para búsqueda rápida por auth_user_id
CREATE UNIQUE INDEX IF NOT EXISTS users_auth_user_id_idx ON users(auth_user_id);

-- 4. TABLA DE POSTULACIONES
-- ============================================
CREATE TABLE IF NOT EXISTS job_applications (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id BIGINT NOT NULL REFERENCES companies(id),
  position VARCHAR NOT NULL,
  expected_salary DOUBLE PRECISION,
  offer_url VARCHAR,
  status VARCHAR NOT NULL DEFAULT 'open',
  application_date TIMESTAMPTZ NOT NULL,
  salary_currency BIGINT REFERENCES currencies(id),
  job_type VARCHAR,
  city VARCHAR,
  country VARCHAR,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índice para búsquedas por usuario
CREATE INDEX IF NOT EXISTS job_applications_user_id_idx ON job_applications(user_id);

-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;

-- Políticas para USERS
-- ============================================
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = auth_user_id);

-- Políticas para JOB_APPLICATIONS
-- ============================================
DROP POLICY IF EXISTS "Users can view own applications" ON job_applications;
CREATE POLICY "Users can view own applications"
  ON job_applications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own applications" ON job_applications;
CREATE POLICY "Users can create own applications"
  ON job_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own applications" ON job_applications;
CREATE POLICY "Users can update own applications"
  ON job_applications FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own applications" ON job_applications;
CREATE POLICY "Users can delete own applications"
  ON job_applications FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para COMPANIES
-- ============================================
DROP POLICY IF EXISTS "Companies are viewable by everyone" ON companies;
CREATE POLICY "Companies are viewable by everyone"
  ON companies FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create companies" ON companies;
CREATE POLICY "Authenticated users can create companies"
  ON companies FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update companies" ON companies;
CREATE POLICY "Authenticated users can update companies"
  ON companies FOR UPDATE
  WITH CHECK (auth.uid() IS NOT NULL);

-- Políticas para CURRENCIES
-- ============================================
DROP POLICY IF EXISTS "Currencies are viewable by everyone" ON currencies;
CREATE POLICY "Currencies are viewable by everyone"
  ON currencies FOR SELECT
  USING (true);

-- 6. FUNCIÓN Y TRIGGER PARA CREAR PERFIL AUTOMÁTICAMENTE
-- ============================================
-- Esta función crea automáticamente un registro en users cuando se crea un usuario en auth.users

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (auth_user_id, name, last_name, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    now()
  );
  RETURN NEW;
EXCEPTION WHEN others THEN
  RAISE LOG 'Error creating user profile: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Crear trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 7. STORAGE (ejecutar en la consola de Supabase Storage)
-- ============================================
-- Crear bucket 'avatars' con configuración:
-- - Public: true
-- - File size limit: 5MB
-- - Allowed mime types: image/jpeg, image/png

-- Política de Storage para avatares (ejecutar en SQL Editor)
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid() IS NOT NULL
  );

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Verificar que las tablas se crearon correctamente
SELECT 
  table_name,
  (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND table_name IN ('users', 'companies', 'currencies', 'job_applications')
ORDER BY table_name;

-- Verificar que RLS está habilitado
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'companies', 'currencies', 'job_applications');

-- ============================================
-- DATOS DE PRUEBA (OPCIONAL)
-- ============================================
-- Insertar algunas empresas de ejemplo
INSERT INTO companies (name) VALUES
  ('Google'),
  ('Microsoft'),
  ('Amazon'),
  ('Meta'),
  ('Apple')
ON CONFLICT DO NOTHING;

-- ============================================
-- NOTAS
-- ============================================
-- 1. Ejecuta este script en el SQL Editor de Supabase
-- 2. Crea el bucket 'avatars' manualmente en Storage con política pública
-- 3. Configura las variables SUPABASE_URL y SUPABASE_ANON_KEY en la app
-- 4. El trigger handle_new_user() creará automáticamente un perfil cuando
--    un usuario se registre con auth.signUp()
