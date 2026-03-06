
-- Fix all RLS policies to be PERMISSIVE instead of RESTRICTIVE

-- ==================== PROFILES ====================
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);

-- ==================== JOBS ====================
DROP POLICY IF EXISTS "Anyone can view jobs" ON public.jobs;
DROP POLICY IF EXISTS "HR users can create jobs" ON public.jobs;
DROP POLICY IF EXISTS "Applicants can create external jobs" ON public.jobs;
DROP POLICY IF EXISTS "HR can update their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "HR can delete their own jobs" ON public.jobs;

CREATE POLICY "Anyone can view jobs" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "HR users can create jobs" ON public.jobs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'hr'::app_role)
);
CREATE POLICY "Applicants can create external jobs" ON public.jobs FOR INSERT WITH CHECK (
  created_by = auth.uid() AND is_external = true
);
CREATE POLICY "HR can update their own jobs" ON public.jobs FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "HR can delete their own jobs" ON public.jobs FOR DELETE USING (created_by = auth.uid());

-- ==================== APPLICATIONS ====================
DROP POLICY IF EXISTS "Applicants can create applications" ON public.applications;
DROP POLICY IF EXISTS "Applicants can view their own applications" ON public.applications;
DROP POLICY IF EXISTS "HR can update applications" ON public.applications;

CREATE POLICY "Applicants can create applications" ON public.applications FOR INSERT WITH CHECK (applicant_id = auth.uid());
CREATE POLICY "Applicants can view their own applications" ON public.applications FOR SELECT USING (
  applicant_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'hr'::app_role)
);
CREATE POLICY "HR can update applications" ON public.applications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'hr'::app_role)
);
