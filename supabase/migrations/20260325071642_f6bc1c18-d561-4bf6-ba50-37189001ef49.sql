
-- Add missing columns to devices table
ALTER TABLE public.devices 
  ADD COLUMN IF NOT EXISTS os varchar,
  ADD COLUMN IF NOT EXISTS os_version varchar,
  ADD COLUMN IF NOT EXISTS ip_address varchar,
  ADD COLUMN IF NOT EXISTS status varchar DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS last_seen timestamptz,
  ADD COLUMN IF NOT EXISTS hardware_id varchar,
  ADD COLUMN IF NOT EXISTS cpu_model varchar,
  ADD COLUMN IF NOT EXISTS ram_gb numeric,
  ADD COLUMN IF NOT EXISTS disk_capacity_gb numeric,
  ADD COLUMN IF NOT EXISTS department varchar;

-- Add msp_id to profiles for MSP admins
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS msp_id uuid,
  ADD COLUMN IF NOT EXISTS phone varchar,
  ADD COLUMN IF NOT EXISTS organization_name varchar;

-- Add columns to network_devices
ALTER TABLE public.network_devices
  ADD COLUMN IF NOT EXISTS hostname varchar,
  ADD COLUMN IF NOT EXISTS snmp_status varchar DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS last_polled timestamptz,
  ADD COLUMN IF NOT EXISTS metrics jsonb;

-- Create installed_software table
CREATE TABLE IF NOT EXISTS public.installed_software (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid REFERENCES public.devices(id) ON DELETE CASCADE,
  software_name varchar NOT NULL,
  version varchar,
  installed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remote_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.msp_support_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.msps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installed_software ENABLE ROW LEVEL SECURITY;

-- Security definer function to get user role without recursion
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS varchar
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = _user_id
$$;

-- Security definer function to get user tenant_id
CREATE OR REPLACE FUNCTION public.get_user_tenant_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.profiles WHERE id = _user_id
$$;

-- Security definer function to get user msp_id
CREATE OR REPLACE FUNCTION public.get_user_msp_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT msp_id FROM public.profiles WHERE id = _user_id
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.get_user_role(auth.uid()) = 'super_admin');

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Super admin can view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.get_user_role(auth.uid()) = 'super_admin');

CREATE POLICY "Tenant admin can view tenant users" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.get_user_role(auth.uid()) IN ('tenant_admin', 'msp_admin')
  );

-- RLS Policies for tenants
CREATE POLICY "Users can view own tenant" ON public.tenants
  FOR SELECT TO authenticated
  USING (
    id = public.get_user_tenant_id(auth.uid())
    OR public.get_user_role(auth.uid()) = 'super_admin'
  );

CREATE POLICY "MSP can view their tenants" ON public.tenants
  FOR SELECT TO authenticated
  USING (
    msp_id = public.get_user_msp_id(auth.uid())
    AND public.get_user_role(auth.uid()) = 'msp_admin'
  );

CREATE POLICY "Super admin full access tenants" ON public.tenants
  FOR ALL TO authenticated
  USING (public.get_user_role(auth.uid()) = 'super_admin');

-- RLS Policies for devices
CREATE POLICY "Tenant users can view their devices" ON public.devices
  FOR SELECT TO authenticated
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    OR public.get_user_role(auth.uid()) = 'super_admin'
  );

CREATE POLICY "Super admin full access devices" ON public.devices
  FOR ALL TO authenticated
  USING (public.get_user_role(auth.uid()) = 'super_admin');

-- RLS Policies for device_metrics
CREATE POLICY "View metrics for own tenant devices" ON public.device_metrics
  FOR SELECT TO authenticated
  USING (
    device_id IN (SELECT id FROM public.devices WHERE tenant_id = public.get_user_tenant_id(auth.uid()))
    OR public.get_user_role(auth.uid()) = 'super_admin'
  );

-- RLS Policies for alerts
CREATE POLICY "View alerts for own tenant" ON public.alerts
  FOR SELECT TO authenticated
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    OR public.get_user_role(auth.uid()) = 'super_admin'
  );

CREATE POLICY "Update alerts for own tenant" ON public.alerts
  FOR UPDATE TO authenticated
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    OR public.get_user_role(auth.uid()) = 'super_admin'
  );

-- RLS Policies for compliance_rules
CREATE POLICY "View compliance rules for own tenant" ON public.compliance_rules
  FOR SELECT TO authenticated
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    OR public.get_user_role(auth.uid()) = 'super_admin'
  );

CREATE POLICY "Manage compliance rules for own tenant" ON public.compliance_rules
  FOR ALL TO authenticated
  USING (
    (tenant_id = public.get_user_tenant_id(auth.uid()) AND public.get_user_role(auth.uid()) = 'tenant_admin')
    OR public.get_user_role(auth.uid()) = 'super_admin'
  );

-- RLS for compliance_results
CREATE POLICY "View compliance results for own tenant" ON public.compliance_results
  FOR SELECT TO authenticated
  USING (
    device_id IN (SELECT id FROM public.devices WHERE tenant_id = public.get_user_tenant_id(auth.uid()))
    OR public.get_user_role(auth.uid()) = 'super_admin'
  );

-- RLS for remote_actions
CREATE POLICY "View remote actions for own tenant" ON public.remote_actions
  FOR SELECT TO authenticated
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    OR public.get_user_role(auth.uid()) = 'super_admin'
  );

CREATE POLICY "Create remote actions for own tenant" ON public.remote_actions
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id = public.get_user_tenant_id(auth.uid())
    OR public.get_user_role(auth.uid()) = 'super_admin'
  );

-- RLS for msp_support_sessions
CREATE POLICY "View sessions for own tenant or MSP" ON public.msp_support_sessions
  FOR SELECT TO authenticated
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    OR msp_user_id = auth.uid()
    OR public.get_user_role(auth.uid()) = 'super_admin'
  );

-- RLS for maintenance_suggestions
CREATE POLICY "View suggestions for own tenant" ON public.maintenance_suggestions
  FOR SELECT TO authenticated
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    OR public.get_user_role(auth.uid()) = 'super_admin'
  );

-- RLS for network_devices
CREATE POLICY "View network devices for own tenant" ON public.network_devices
  FOR SELECT TO authenticated
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    OR public.get_user_role(auth.uid()) = 'super_admin'
  );

-- RLS for security_status
CREATE POLICY "View security for own tenant devices" ON public.security_status
  FOR SELECT TO authenticated
  USING (
    device_id IN (SELECT id FROM public.devices WHERE tenant_id = public.get_user_tenant_id(auth.uid()))
    OR public.get_user_role(auth.uid()) = 'super_admin'
  );

-- RLS for audit_logs
CREATE POLICY "View audit logs for own tenant" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    OR public.get_user_role(auth.uid()) = 'super_admin'
  );

-- RLS for msps
CREATE POLICY "View MSPs" ON public.msps
  FOR SELECT TO authenticated
  USING (
    id = public.get_user_msp_id(auth.uid())
    OR public.get_user_role(auth.uid()) = 'super_admin'
  );

CREATE POLICY "Super admin full access MSPs" ON public.msps
  FOR ALL TO authenticated
  USING (public.get_user_role(auth.uid()) = 'super_admin');

-- RLS for installed_software
CREATE POLICY "View installed software for own tenant" ON public.installed_software
  FOR SELECT TO authenticated
  USING (
    device_id IN (SELECT id FROM public.devices WHERE tenant_id = public.get_user_tenant_id(auth.uid()))
    OR public.get_user_role(auth.uid()) = 'super_admin'
  );

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, first_name, last_name, organization_name, phone, password_hash)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'account_type', 'client'),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'organization_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'managed_by_supabase_auth'
  );
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
