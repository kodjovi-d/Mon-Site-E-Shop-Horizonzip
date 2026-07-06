-- Fix remaining security issues from audit

-- 1. Fix RLS policy on activity_logs - drop the unrestricted anon insert policy
DROP POLICY IF EXISTS anon_insert_logs ON public.activity_logs;

-- Create a proper restricted policy - only authenticated users can insert their own logs
CREATE POLICY "authenticated_insert_own_logs" ON public.activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 2. Revoke EXECUTE on SECURITY DEFINER functions from anon and authenticated
-- generate_order_number() - only service_role should be able to call this
REVOKE EXECUTE ON FUNCTION public.generate_order_number() FROM anon, authenticated;

-- update_updated_at_column() - trigger function, should only be executable by superuser
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated;