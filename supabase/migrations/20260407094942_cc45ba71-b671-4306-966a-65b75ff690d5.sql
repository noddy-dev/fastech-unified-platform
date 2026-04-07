-- Drop the old permissive UPDATE policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Recreate with WITH CHECK that prevents changing sensitive fields
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid()
  AND role IS NOT DISTINCT FROM (SELECT role FROM public.profiles WHERE id = auth.uid())
  AND tenant_id IS NOT DISTINCT FROM (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  AND msp_id IS NOT DISTINCT FROM (SELECT msp_id FROM public.profiles WHERE id = auth.uid())
  AND password_hash IS NOT DISTINCT FROM (SELECT password_hash FROM public.profiles WHERE id = auth.uid())
);