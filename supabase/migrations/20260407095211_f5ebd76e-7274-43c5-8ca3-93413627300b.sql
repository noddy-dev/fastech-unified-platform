-- Create helper function to get profile sensitive fields
CREATE OR REPLACE FUNCTION public.get_profile_sensitive_fields(_user_id uuid)
RETURNS TABLE(role varchar, tenant_id uuid, msp_id uuid, password_hash text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.role, p.tenant_id, p.msp_id, p.password_hash
  FROM public.profiles p
  WHERE p.id = _user_id
$$;

-- Drop and recreate with function-based check
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid()
  AND role IS NOT DISTINCT FROM (SELECT f.role FROM public.get_profile_sensitive_fields(auth.uid()) f)
  AND tenant_id IS NOT DISTINCT FROM (SELECT f.tenant_id FROM public.get_profile_sensitive_fields(auth.uid()) f)
  AND msp_id IS NOT DISTINCT FROM (SELECT f.msp_id FROM public.get_profile_sensitive_fields(auth.uid()) f)
  AND password_hash IS NOT DISTINCT FROM (SELECT f.password_hash FROM public.get_profile_sensitive_fields(auth.uid()) f)
);