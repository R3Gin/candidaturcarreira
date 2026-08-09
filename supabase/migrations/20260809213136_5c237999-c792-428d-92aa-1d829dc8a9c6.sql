-- Enums
CREATE TYPE public.account_type AS ENUM ('candidato', 'empresa', 'freela');
CREATE TYPE public.vacancy_type AS ENUM ('contratual', 'freelance');
CREATE TYPE public.vacancy_status AS ENUM ('rascunho', 'publicada', 'encerrada');
CREATE TYPE public.company_member_role AS ENUM ('admin', 'rh', 'recrutador');
CREATE TYPE public.application_status AS ENUM ('ativa', 'reprovada', 'contratada', 'desistiu');

-- Timestamp helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  account_type public.account_type NOT NULL DEFAULT 'candidato',
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  photo_url TEXT,
  occupation TEXT,
  username TEXT UNIQUE,
  terms_accepted_at TIMESTAMPTZ,
  onboarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Perfis visiveis publicamente" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Pessoa cria seu perfil" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Pessoa edita seu perfil" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, account_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    COALESCE((NEW.raw_user_meta_data->>'account_type')::public.account_type, 'candidato')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- PREFERENCES
CREATE TABLE public.job_preferences (
  user_id UUID PRIMARY KEY,
  role TEXT NOT NULL DEFAULT '',
  seniority TEXT NOT NULL DEFAULT '',
  models TEXT[] NOT NULL DEFAULT '{}',
  city TEXT NOT NULL DEFAULT '',
  min_salary TEXT NOT NULL DEFAULT '',
  contracts TEXT[] NOT NULL DEFAULT '{}',
  availability TEXT NOT NULL DEFAULT '',
  notify_email BOOLEAN NOT NULL DEFAULT true,
  notify_whats BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_preferences TO authenticated;
GRANT ALL ON public.job_preferences TO service_role;
ALTER TABLE public.job_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Preferencias proprias" ON public.job_preferences FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER job_preferences_updated_at BEFORE UPDATE ON public.job_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RESUMES
CREATE TABLE public.resumes (
  user_id UUID PRIMARY KEY,
  headline TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  experiences JSONB NOT NULL DEFAULT '[]'::jsonb,
  skills TEXT[] NOT NULL DEFAULT '{}',
  education TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resumes TO authenticated;
GRANT ALL ON public.resumes TO service_role;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Curriculo proprio" ON public.resumes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER resumes_updated_at BEFORE UPDATE ON public.resumes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- COMPANIES
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  segment TEXT NOT NULL DEFAULT '',
  about TEXT NOT NULL DEFAULT '',
  website TEXT,
  city TEXT NOT NULL DEFAULT '',
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.companies TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- COMPANY MEMBERS
CREATE TABLE public.company_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role public.company_member_role NOT NULL DEFAULT 'recrutador',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_members TO authenticated;
GRANT ALL ON public.company_members TO service_role;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER company_members_updated_at BEFORE UPDATE ON public.company_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.is_company_member(_company_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_members WHERE company_id = _company_id AND user_id = _user_id
  ) OR EXISTS (
    SELECT 1 FROM public.companies WHERE id = _company_id AND owner_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_company_admin(_company_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_members
    WHERE company_id = _company_id AND user_id = _user_id AND role = 'admin'
  ) OR EXISTS (
    SELECT 1 FROM public.companies WHERE id = _company_id AND owner_id = _user_id
  );
$$;

CREATE POLICY "Empresas visiveis publicamente" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Pessoa cria empresa" ON public.companies FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Admin edita empresa" ON public.companies FOR UPDATE TO authenticated USING (public.is_company_admin(id, auth.uid())) WITH CHECK (public.is_company_admin(id, auth.uid()));
CREATE POLICY "Dono remove empresa" ON public.companies FOR DELETE TO authenticated USING (auth.uid() = owner_id);

CREATE POLICY "Equipe ve equipe" ON public.company_members FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_company_member(company_id, auth.uid()));
CREATE POLICY "Admin adiciona equipe" ON public.company_members FOR INSERT TO authenticated WITH CHECK (public.is_company_admin(company_id, auth.uid()));
CREATE POLICY "Admin edita equipe" ON public.company_members FOR UPDATE TO authenticated USING (public.is_company_admin(company_id, auth.uid())) WITH CHECK (public.is_company_admin(company_id, auth.uid()));
CREATE POLICY "Admin remove equipe" ON public.company_members FOR DELETE TO authenticated USING (public.is_company_admin(company_id, auth.uid()));

-- VACANCIES
CREATE TABLE public.vacancies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_by UUID,
  title TEXT NOT NULL,
  type public.vacancy_type NOT NULL DEFAULT 'contratual',
  status public.vacancy_status NOT NULL DEFAULT 'rascunho',
  city TEXT NOT NULL DEFAULT '',
  work_model TEXT NOT NULL DEFAULT '',
  seniority TEXT NOT NULL DEFAULT '',
  segment TEXT NOT NULL DEFAULT '',
  salary_min NUMERIC,
  salary_max NUMERIC,
  salary_text TEXT NOT NULL DEFAULT '',
  daily_rate NUMERIC,
  shift_hours TEXT,
  work_date DATE,
  contract TEXT NOT NULL DEFAULT '',
  about TEXT NOT NULL DEFAULT '',
  responsibilities TEXT[] NOT NULL DEFAULT '{}',
  requirements TEXT[] NOT NULL DEFAULT '{}',
  benefits TEXT[] NOT NULL DEFAULT '{}',
  qualifications TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  quick_apply BOOLEAN NOT NULL DEFAULT true,
  contact_email TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.vacancies TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vacancies TO authenticated;
GRANT ALL ON public.vacancies TO service_role;
ALTER TABLE public.vacancies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vagas publicadas sao publicas" ON public.vacancies FOR SELECT USING (status = 'publicada');
CREATE POLICY "Equipe ve vagas da empresa" ON public.vacancies FOR SELECT TO authenticated USING (public.is_company_member(company_id, auth.uid()));
CREATE POLICY "Equipe cria vagas" ON public.vacancies FOR INSERT TO authenticated WITH CHECK (public.is_company_member(company_id, auth.uid()));
CREATE POLICY "Equipe edita vagas" ON public.vacancies FOR UPDATE TO authenticated USING (public.is_company_member(company_id, auth.uid())) WITH CHECK (public.is_company_member(company_id, auth.uid()));
CREATE POLICY "Equipe remove vagas" ON public.vacancies FOR DELETE TO authenticated USING (public.is_company_admin(company_id, auth.uid()));
CREATE TRIGGER vacancies_updated_at BEFORE UPDATE ON public.vacancies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX vacancies_company_idx ON public.vacancies (company_id);
CREATE INDEX vacancies_status_type_idx ON public.vacancies (status, type);

-- APPLICATIONS
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vacancy_id UUID NOT NULL REFERENCES public.vacancies(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL,
  stage INTEGER NOT NULL DEFAULT 0,
  status public.application_status NOT NULL DEFAULT 'ativa',
  letter TEXT NOT NULL DEFAULT '',
  qualifications TEXT[] NOT NULL DEFAULT '{}',
  next_step TEXT NOT NULL DEFAULT '',
  feedback TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (vacancy_id, candidate_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Candidato ve suas candidaturas" ON public.applications FOR SELECT TO authenticated USING (auth.uid() = candidate_id);
CREATE POLICY "Empresa ve candidaturas recebidas" ON public.applications FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.vacancies v WHERE v.id = vacancy_id AND public.is_company_member(v.company_id, auth.uid())));
CREATE POLICY "Candidato se candidata" ON public.applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = candidate_id);
CREATE POLICY "Candidato atualiza sua candidatura" ON public.applications FOR UPDATE TO authenticated USING (auth.uid() = candidate_id) WITH CHECK (auth.uid() = candidate_id);
CREATE POLICY "Empresa atualiza candidatura" ON public.applications FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.vacancies v WHERE v.id = vacancy_id AND public.is_company_member(v.company_id, auth.uid()))) WITH CHECK (EXISTS (SELECT 1 FROM public.vacancies v WHERE v.id = vacancy_id AND public.is_company_member(v.company_id, auth.uid())));
CREATE TRIGGER applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX applications_candidate_idx ON public.applications (candidate_id);
CREATE INDEX applications_vacancy_idx ON public.applications (vacancy_id);

-- APPLICATION EVENTS
CREATE TABLE public.application_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  created_by UUID,
  label TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.application_events TO authenticated;
GRANT ALL ON public.application_events TO service_role;
ALTER TABLE public.application_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Envolvidos veem historico" ON public.application_events FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.applications a JOIN public.vacancies v ON v.id = a.vacancy_id WHERE a.id = application_id AND (a.candidate_id = auth.uid() OR public.is_company_member(v.company_id, auth.uid()))));
CREATE POLICY "Empresa registra avanco" ON public.application_events FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.applications a JOIN public.vacancies v ON v.id = a.vacancy_id WHERE a.id = application_id AND public.is_company_member(v.company_id, auth.uid())));
CREATE INDEX application_events_application_idx ON public.application_events (application_id);

-- SAVED VACANCIES
CREATE TABLE public.saved_vacancies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  vacancy_id UUID NOT NULL REFERENCES public.vacancies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, vacancy_id)
);
GRANT SELECT, INSERT, DELETE ON public.saved_vacancies TO authenticated;
GRANT ALL ON public.saved_vacancies TO service_role;
ALTER TABLE public.saved_vacancies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vagas salvas proprias" ON public.saved_vacancies FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- FOLLOWED COMPANIES
CREATE TABLE public.followed_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  reason TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, company_id)
);
GRANT SELECT, INSERT, DELETE ON public.followed_companies TO authenticated;
GRANT ALL ON public.followed_companies TO service_role;
ALTER TABLE public.followed_companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Empresas seguidas proprias" ON public.followed_companies FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ACTIVITIES
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.activities TO authenticated;
GRANT ALL ON public.activities TO service_role;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Historico proprio" ON public.activities FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX activities_user_idx ON public.activities (user_id, created_at DESC);