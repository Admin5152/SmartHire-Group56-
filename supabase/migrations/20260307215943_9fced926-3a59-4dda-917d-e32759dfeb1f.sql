-- Create dedicated roles table (if missing)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Backfill roles from profiles
INSERT INTO public.user_roles (user_id, role)
SELECT p.user_id, p.role
FROM public.profiles p
ON CONFLICT (user_id, role) DO NOTHING;

-- Keep user_roles in sync with profile role changes
CREATE OR REPLACE FUNCTION public.sync_user_role_from_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.user_roles WHERE user_id = NEW.user_id;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.user_id, NEW.role)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_user_role_from_profile ON public.profiles;
CREATE TRIGGER trg_sync_user_role_from_profile
AFTER INSERT OR UPDATE OF role ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_user_role_from_profile();

-- Security-definer role checker to avoid recursive RLS policy lookups
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND ur.role = _role
  )
$$;

-- Replace role-dependent policies to use has_role()
DROP POLICY IF EXISTS "HR can view all profiles" ON public.profiles;
CREATE POLICY "HR can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'hr'::public.app_role));

DROP POLICY IF EXISTS "HR users can create jobs" ON public.jobs;
CREATE POLICY "HR users can create jobs"
ON public.jobs
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'hr'::public.app_role));

DROP POLICY IF EXISTS "HR can view all apps" ON public.applications;
CREATE POLICY "HR can view all apps"
ON public.applications
FOR SELECT
USING (public.has_role(auth.uid(), 'hr'::public.app_role));

DROP POLICY IF EXISTS "HR can update applications" ON public.applications;
CREATE POLICY "HR can update applications"
ON public.applications
FOR UPDATE
USING (public.has_role(auth.uid(), 'hr'::public.app_role));

-- user_roles policies
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);
