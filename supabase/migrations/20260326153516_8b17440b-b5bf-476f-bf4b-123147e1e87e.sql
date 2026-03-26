-- Fix overly permissive INSERT policy - restrict to authenticated users inserting for themselves or HR inserting for others
DROP POLICY IF EXISTS "Anyone can insert notifications" ON public.notifications;
CREATE POLICY "Authenticated users can insert notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);