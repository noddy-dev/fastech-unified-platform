import { supabase } from '@/integrations/supabase/client';
import type {
  Profile, Tenant, Device, Alert, ComplianceRule,
  RemoteAction, MSPSupportSession, TenantWithStats, DeviceWithMetrics,
  MaintenanceSuggestion, NetworkDevice, SecurityStatus, MSP,
} from '@/types/types';

// ============ Profiles ============
export async function getProfile(userId: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

const ALLOWED_PROFILE_UPDATE_FIELDS = ['first_name', 'last_name', 'phone', 'organization_name'] as const;

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  // Only allow safe fields to be updated — role, tenant_id, msp_id, password_hash are blocked
  const safeUpdates: Record<string, unknown> = {};
  for (const key of ALLOWED_PROFILE_UPDATE_FIELDS) {
    if (key in updates) {
      safeUpdates[key] = (updates as Record<string, unknown>)[key];
    }
  }
  const { data, error } = await supabase.from('profiles').update(safeUpdates as any).eq('id', userId).select().maybeSingle();
  if (error) throw error;
  return data as Profile;
}

export async function getTenantUsers(tenantId: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export async function getAllUsers() {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Profile[];
}

// ============ Tenants ============
export async function getAllTenants() {
  const { data, error } = await supabase.from('tenants').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Tenant[];
}

export async function getTenantsWithStats(): Promise<TenantWithStats[]> {
  const tenants = await getAllTenants();
  const tenantsWithStats = await Promise.all(
    tenants.map(async (tenant) => {
      const [devices, admins, alerts] = await Promise.all([
        getDevicesByTenant(tenant.id),
        getTenantAdmins(tenant.id),
        getAlertsByTenant(tenant.id, 'open'),
      ]);
      const avgScore = devices.length > 0
        ? devices.reduce((sum, d) => sum + (d.compliance_score || 0), 0) / devices.length
        : 0;
      return {
        ...tenant,
        device_count: devices.length,
        admin_count: admins.length,
        avg_compliance_score: Math.round(avgScore),
        active_alerts: alerts.length,
      };
    })
  );
  return tenantsWithStats;
}

export async function getTenantById(tenantId: string) {
  const { data, error } = await supabase.from('tenants').select('*').eq('id', tenantId).maybeSingle();
  if (error) throw error;
  return data as Tenant | null;
}

export async function createTenant(tenant: Partial<Tenant>) {
  const { data, error } = await supabase.from('tenants').insert(tenant as any).select().maybeSingle();
  if (error) throw error;
  return data as Tenant;
}

export async function updateTenant(tenantId: string, updates: Partial<Tenant>) {
  const { data, error } = await supabase.from('tenants').update(updates).eq('id', tenantId).select().maybeSingle();
  if (error) throw error;
  return data as Tenant;
}

export async function deleteTenant(tenantId: string) {
  const { error } = await supabase.from('tenants').delete().eq('id', tenantId);
  if (error) throw error;
}

export async function getTenantAdmins(tenantId: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('tenant_id', tenantId).eq('role', 'tenant_admin');
  if (error) throw error;
  return (data ?? []) as Profile[];
}

// ============ MSPs ============
export async function getAllMSPs() {
  const { data, error } = await supabase.from('msps').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as MSP[];
}

export async function createMSP(msp: Partial<MSP>) {
  const { data, error } = await supabase.from('msps').insert(msp as any).select().maybeSingle();
  if (error) throw error;
  return data as MSP;
}

export async function updateMSP(mspId: string, updates: Partial<MSP>) {
  const { data, error } = await supabase.from('msps').update(updates).eq('id', mspId).select().maybeSingle();
  if (error) throw error;
  return data as MSP;
}

export async function deleteMSP(mspId: string) {
  const { error } = await supabase.from('msps').delete().eq('id', mspId);
  if (error) throw error;
}

// ============ MSP Support Sessions ============
export async function activateSupportSession(tenantId: string, mspUserId: string, durationMinutes = 60) {
  const { data, error } = await supabase.from('msp_support_sessions').insert({ tenant_id: tenantId, msp_user_id: mspUserId, duration_minutes: durationMinutes, is_active: true }).select().maybeSingle();
  if (error) throw error;
  return data as MSPSupportSession;
}

export async function deactivateSupportSession(sessionId: string) {
  const { data, error } = await supabase.from('msp_support_sessions').update({ is_active: false, deactivated_at: new Date().toISOString() }).eq('id', sessionId).select().maybeSingle();
  if (error) throw error;
  return data as MSPSupportSession;
}

export async function getActiveSupportSession(tenantId: string) {
  const { data, error } = await supabase.from('msp_support_sessions').select('*').eq('tenant_id', tenantId).eq('is_active', true).maybeSingle();
  if (error && error.code !== 'PGRST116') throw error;
  return data as MSPSupportSession | null;
}

export async function getSupportSessionsByTenant(tenantId: string) {
  const { data, error } = await supabase.from('msp_support_sessions').select('*').eq('tenant_id', tenantId).order('activated_at', { ascending: false }).limit(20);
  if (error) throw error;
  return (data ?? []) as MSPSupportSession[];
}

// ============ Devices ============
export async function getDevicesByTenant(tenantId: string) {
  const { data, error } = await supabase.from('devices').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Device[];
}

export async function getAllDevices() {
  const { data, error } = await supabase.from('devices').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Device[];
}

export async function getDeviceById(deviceId: string): Promise<DeviceWithMetrics | null> {
  const { data, error } = await supabase.from('devices').select('*').eq('id', deviceId).maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const { data: metrics } = await supabase.from('device_metrics').select('*').eq('device_id', deviceId).order('recorded_at', { ascending: false }).limit(1).maybeSingle();
  const { data: security } = await supabase.from('security_status').select('*').eq('device_id', deviceId).order('checked_at', { ascending: false }).limit(1).maybeSingle();
  const { data: software } = await supabase.from('installed_software').select('*').eq('device_id', deviceId).order('software_name', { ascending: true });

  return {
    ...data,
    latest_metrics: metrics || undefined,
    security_status: security || undefined,
    installed_software: Array.isArray(software) ? software : [],
  } as DeviceWithMetrics;
}

export async function createDevice(device: Partial<Device>) {
  const { data, error } = await supabase.from('devices').insert(device).select().maybeSingle();
  if (error) throw error;
  return data as Device;
}

export async function updateDevice(deviceId: string, updates: Partial<Device>) {
  const { data, error } = await supabase.from('devices').update(updates).eq('id', deviceId).select().maybeSingle();
  if (error) throw error;
  return data as Device;
}

// ============ Device Metrics ============
export async function getDeviceMetrics(deviceId: string, limit = 100) {
  const { data, error } = await supabase.from('device_metrics').select('*').eq('device_id', deviceId).order('recorded_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return (data ?? []) as import('@/types/types').DeviceMetrics[];
}

// ============ Alerts ============
export async function getAlertsByTenant(tenantId: string, status?: string) {
  let query = supabase.from('alerts').select('*, device:devices(*)').eq('tenant_id', tenantId);
  if (status) query = query.eq('status', status);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as (Alert & { device?: Device })[];
}

export async function getAllAlerts() {
  const { data, error } = await supabase.from('alerts').select('*, device:devices(*)').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as (Alert & { device?: Device })[];
}

export async function getAlertsByDevice(deviceId: string) {
  const { data, error } = await supabase.from('alerts').select('*').eq('device_id', deviceId).order('created_at', { ascending: false }).limit(50);
  if (error) throw error;
  return (data ?? []) as Alert[];
}

export async function updateAlert(alertId: string, updates: Partial<Alert>) {
  const { data, error } = await supabase.from('alerts').update(updates).eq('id', alertId).select().maybeSingle();
  if (error) throw error;
  return data as Alert;
}

// ============ Compliance ============
export async function getComplianceRulesByTenant(tenantId: string) {
  const { data, error } = await supabase.from('compliance_rules').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ComplianceRule[];
}

export async function createComplianceRule(rule: Partial<ComplianceRule>) {
  const { data, error } = await supabase.from('compliance_rules').insert(rule).select().maybeSingle();
  if (error) throw error;
  return data as ComplianceRule;
}

export async function updateComplianceRule(ruleId: string, updates: Partial<ComplianceRule>) {
  const { data, error } = await supabase.from('compliance_rules').update(updates).eq('id', ruleId).select().maybeSingle();
  if (error) throw error;
  return data as ComplianceRule;
}

export async function deleteComplianceRule(ruleId: string) {
  const { error } = await supabase.from('compliance_rules').delete().eq('id', ruleId);
  if (error) throw error;
}

export async function getComplianceResultsByDevice(deviceId: string) {
  const { data, error } = await supabase.from('compliance_results').select('*, rule:compliance_rules(*)').eq('device_id', deviceId).order('checked_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as (import('@/types/types').ComplianceResult & { rule?: ComplianceRule })[];
}

// ============ Remote Actions ============
export async function getRemoteActionsByDevice(deviceId: string) {
  const { data, error } = await supabase.from('remote_actions').select('*').eq('device_id', deviceId).order('created_at', { ascending: false }).limit(50);
  if (error) throw error;
  return (data ?? []) as RemoteAction[];
}

export async function createRemoteAction(action: Partial<RemoteAction>) {
  const { data, error } = await supabase.from('remote_actions').insert(action as any).select().maybeSingle();
  if (error) throw error;
  return data as RemoteAction;
}

export async function getRemoteActionsByTenant(tenantId: string) {
  const { data, error } = await supabase.from('remote_actions').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false }).limit(100);
  if (error) throw error;
  return (data ?? []) as RemoteAction[];
}

// ============ Maintenance Suggestions ============
export async function getMaintenanceSuggestionsByTenant(tenantId: string) {
  const { data, error } = await supabase.from('maintenance_suggestions').select('*, device:devices!inner(*)').eq('device.tenant_id', tenantId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as (MaintenanceSuggestion & { device?: Device })[];
}

export async function updateMaintenanceSuggestion(suggestionId: string, updates: Partial<MaintenanceSuggestion>) {
  const { data, error } = await supabase.from('maintenance_suggestions').update(updates).eq('id', suggestionId).select().maybeSingle();
  if (error) throw error;
  return data as MaintenanceSuggestion;
}

// ============ Network Devices ============
export async function getNetworkDevicesByTenant(tenantId: string) {
  const { data, error } = await supabase.from('network_devices').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as NetworkDevice[];
}

// ============ Security Status ============
export async function getSecurityStatusByDevice(deviceId: string) {
  const { data, error } = await supabase.from('security_status').select('*').eq('device_id', deviceId).order('checked_at', { ascending: false }).limit(1).maybeSingle();
  if (error && error.code !== 'PGRST116') throw error;
  return data as SecurityStatus | null;
}

// ============ Dashboard Stats ============
export async function getMSPDashboardStats() {
  const tenants = await getAllTenants();
  const activeTenants = tenants.filter(t => t.status === 'active');
  let totalDevices = 0;
  let totalAlerts = 0;
  let totalCompliance = 0;

  for (const tenant of tenants) {
    const [devices, alerts] = await Promise.all([
      getDevicesByTenant(tenant.id),
      getAlertsByTenant(tenant.id, 'open'),
    ]);
    totalDevices += devices.length;
    totalAlerts += alerts.length;
    totalCompliance += devices.reduce((s, d) => s + (d.compliance_score || 0), 0);
  }

  return {
    totalTenants: tenants.length,
    activeTenants: activeTenants.length,
    totalDevices,
    totalAlerts,
    avgCompliance: totalDevices > 0 ? Math.round(totalCompliance / totalDevices) : 0,
  };
}

export async function getTenantDashboardStats(tenantId: string) {
  const [devices, alerts, rules] = await Promise.all([
    getDevicesByTenant(tenantId),
    getAlertsByTenant(tenantId, 'open'),
    getComplianceRulesByTenant(tenantId),
  ]);

  const compliant = devices.filter(d => (d.compliance_score || 0) >= 80);
  const avgScore = devices.length > 0
    ? Math.round(devices.reduce((s, d) => s + (d.compliance_score || 0), 0) / devices.length)
    : 0;

  return {
    totalDevices: devices.length,
    compliantDevices: compliant.length,
    nonCompliantDevices: devices.length - compliant.length,
    openAlerts: alerts.length,
    avgComplianceScore: avgScore,
    activeRules: rules.filter(r => r.is_enabled).length,
  };
}

// ============ Audit Logs ============
export async function getAuditLogsByTenant(tenantId: string, limit = 100) {
  const { data, error } = await supabase.from('audit_logs').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return (data ?? []) as import('@/types/types').AuditLog[];
}

export async function getAllAuditLogs(limit = 100) {
  const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return (data ?? []) as import('@/types/types').AuditLog[];
}
