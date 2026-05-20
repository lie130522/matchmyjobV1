-- ============================================================
-- MatchMyJob — Schéma Supabase / PostgreSQL
-- Version 1.0 · Mai 2026
-- ============================================================
-- Exécuter dans l'ordre dans l'éditeur SQL Supabase ou via CLI.
-- RLS activé sur TOUTES les tables.
-- ============================================================


-- ─── EXTENSIONS ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ─── TABLE : users ──────────────────────────────────────────
-- Complète le profil auth.users géré par Supabase Auth.
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT        NOT NULL UNIQUE,
  full_name   TEXT,
  country     TEXT,
  language    TEXT        DEFAULT 'en' CHECK (language IN ('en', 'fr')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Création automatique du profil à l'inscription via trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, country, language)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'country',
    COALESCE(NEW.raw_user_meta_data->>'language', 'en')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ─── TABLE : subscriptions ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan                   TEXT        NOT NULL DEFAULT 'free'
                           CHECK (plan IN ('free', 'starter', 'pro', 'expert')),
  attempts_remaining     INTEGER     NOT NULL DEFAULT 4,
  attempts_total         INTEGER     NOT NULL DEFAULT 4,
  renewal_date           TIMESTAMPTZ,
  renewal_confirmed      BOOLEAN     DEFAULT NULL,  -- NULL = pas encore répondu, TRUE = confirmé, FALSE = annulé
  status                 TEXT        DEFAULT 'active'
                           CHECK (status IN ('active', 'expired', 'cancelled')),
  stripe_subscription_id TEXT,
  stripe_customer_id     TEXT,
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id)
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_select_own" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "subscriptions_update_own" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Création automatique de la subscription gratuite à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_subscription()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan, attempts_remaining, attempts_total)
  VALUES (NEW.id, 'free', 4, 4);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_user_created_subscription ON public.users;
CREATE TRIGGER on_user_created_subscription
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_subscription();

-- Mise à jour automatique du champ updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ─── TABLE : cvs ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cvs (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  filename       TEXT        NOT NULL,
  format         TEXT        NOT NULL CHECK (format IN ('pdf', 'docx')),
  storage_path   TEXT        NOT NULL,
  is_optimized   BOOLEAN     DEFAULT FALSE,
  original_cv_id UUID        REFERENCES public.cvs(id) ON DELETE SET NULL,
  ats_score      INTEGER     CHECK (ats_score BETWEEN 0 AND 100),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cvs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cvs_all_own" ON public.cvs
  FOR ALL USING (auth.uid() = user_id);


-- ─── TABLE : cover_letters ──────────────────────────────────
-- Déclarée AVANT applications car applications y fait référence.
CREATE TABLE IF NOT EXISTS public.cover_letters (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content      TEXT        NOT NULL,
  job_title    TEXT,
  company      TEXT,
  format       TEXT        CHECK (format IN ('pdf', 'docx')),
  storage_path TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cover_letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cover_letters_all_own" ON public.cover_letters
  FOR ALL USING (auth.uid() = user_id);


-- ─── TABLE : applications ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.applications (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  job_title       TEXT        NOT NULL,
  company         TEXT        NOT NULL,
  job_url         TEXT,
  status          TEXT        DEFAULT 'to_apply'
                    CHECK (status IN ('to_apply','applied','interview','offer','rejected','accepted')),
  notes           TEXT,
  cv_id           UUID        REFERENCES public.cvs(id) ON DELETE SET NULL,
  cover_letter_id UUID        REFERENCES public.cover_letters(id) ON DELETE SET NULL,
  applied_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "applications_all_own" ON public.applications
  FOR ALL USING (auth.uid() = user_id);

CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ─── TABLE : saved_jobs ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.saved_jobs (
  id       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id  UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  job_data JSONB       NOT NULL,
  saved_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saved_jobs_all_own" ON public.saved_jobs
  FOR ALL USING (auth.uid() = user_id);


-- ─── TABLE : usage_logs ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.usage_logs (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  feature    TEXT        NOT NULL
               CHECK (feature IN ('cv_optimizer','job_analyzer','cover_letter','job_search')),
  refunded   BOOLEAN     DEFAULT FALSE,  -- TRUE si la tentative a été remboursée (erreur API)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usage_logs_select_own" ON public.usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "usage_logs_insert_own" ON public.usage_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ─── INDEX ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_cvs_user_id
  ON public.cvs(user_id);

CREATE INDEX IF NOT EXISTS idx_applications_user_id
  ON public.applications(user_id);

CREATE INDEX IF NOT EXISTS idx_applications_status
  ON public.applications(status);

CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id_created
  ON public.usage_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_subscriptions_renewal_date
  ON public.subscriptions(renewal_date)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_cover_letters_user_id
  ON public.cover_letters(user_id);

CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id
  ON public.saved_jobs(user_id);


-- ─── STORAGE BUCKETS ────────────────────────────────────────
-- À créer dans le dashboard Supabase ou via CLI :
--
-- supabase storage create cvs --public false
-- supabase storage create cover-letters --public false
--
-- Policies Storage (à appliquer dans le dashboard) :
-- Bucket "cvs" :
--   SELECT : auth.uid()::text = (storage.foldername(name))[1]
--   INSERT : auth.uid()::text = (storage.foldername(name))[1]
--   DELETE : auth.uid()::text = (storage.foldername(name))[1]
