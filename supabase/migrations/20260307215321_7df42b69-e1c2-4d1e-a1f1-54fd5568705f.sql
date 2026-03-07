
-- Drop all existing restrictive policies
DROP POLICY IF EXISTS "Applicants can view own or HR can view all" ON public.applications;
DROP POLICY IF EXISTS "Applicants can create applications" ON public.applications;
DROP POLICY IF EXISTS "HR can update applications" ON public.applications;
DROP POLICY IF EXISTS "Anyone can view jobs" ON public.jobs;
DROP POLICY IF EXISTS "HR users can create jobs" ON public.jobs;
DROP POLICY IF EXISTS "HR can update own jobs" ON public.jobs;
DROP POLICY IF EXISTS "HR can delete own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "HR can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Applicants can view own apps" ON public.applications;
DROP POLICY IF EXISTS "HR can view all apps" ON public.applications;

-- Recreate as PERMISSIVE policies

-- PROFILES
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "HR can view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role = 'hr')
);

-- JOBS
CREATE POLICY "Anyone can view jobs" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "HR users can create jobs" ON public.jobs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'hr')
);
CREATE POLICY "HR can update own jobs" ON public.jobs FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "HR can delete own jobs" ON public.jobs FOR DELETE USING (created_by = auth.uid());

-- APPLICATIONS
CREATE POLICY "Applicants can view own apps" ON public.applications FOR SELECT USING (applicant_id = auth.uid());
CREATE POLICY "HR can view all apps" ON public.applications FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'hr')
);
CREATE POLICY "Applicants can create applications" ON public.applications FOR INSERT WITH CHECK (applicant_id = auth.uid());
CREATE POLICY "HR can update applications" ON public.applications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'hr')
);
