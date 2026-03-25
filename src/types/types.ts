export type UserRole = 'super_admin' | 'msp_admin' | 'tenant_admin' | 'tenant_user' | 'client';
export type TenantStatus = 'active' | 'suspended' | 'inactive';
export type DeviceOS = 'windows' | 'linux' | 'macos';
export type DeviceStatus = 'online' | 'offline' | 'unknown';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'open' | 'acknowledged' | 'resolved';
export type ActionType = 'script_execution' | 'reboot' | 'shutdown' | 'software_push';
export type ActionStatus = 'pending' | 'running' | 'completed' | 'failed';
export type ScriptType = 'powershell' | 'bash' | 'python';
export type PatchSchedule = 'daily' | 'weekly' | 'monthly';
export type PatchStatus = 'pending' | 'approved' | 'postponed' | 'excluded' | 'installed' | 'failed';

// Matches DB: profiles table
export interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  password_hash: string;
  role: string | null;
  tenant_id: string | null;
  msp_id: string | null;
  phone: string | null;
  organization_name: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// Matches DB: tenants table
export interface Tenant {
  id: string;
  name: string;
  status: string | null;
  subscription_tier: string | null;
  monthly_fee_per_admin: number | null;
  billing_status: string | null;
  registration_token: string | null;
  msp_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// Matches DB: msps table
export interface MSP {
  id: string;
  name: string;
  contact_email: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// Matches DB: msp_support_sessions table
export interface MSPSupportSession {
  id: string;
  tenant_id: string | null;
  msp_user_id: string | null;
  activated_at: string | null;
  deactivated_at: string | null;
  duration_minutes: number | null;
  is_active: boolean | null;
}

// Matches DB: devices table (with new columns)
export interface Device {
  id: string;
  tenant_id: string | null;
  name: string | null;
  type: string | null;
  compliance_score: number | null;
  os: string | null;
  os_version: string | null;
  ip_address: string | null;
  status: string | null;
  last_seen: string | null;
  hardware_id: string | null;
  cpu_model: string | null;
  ram_gb: number | null;
  disk_capacity_gb: number | null;
  department: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// Matches DB: device_metrics table
export interface DeviceMetrics {
  id: string;
  device_id: string | null;
  cpu_usage: number | null;
  memory_usage: number | null;
  disk_usage: number | null;
  recorded_at: string | null;
}

// Matches DB: installed_software table
export interface InstalledSoftware {
  id: string;
  device_id: string | null;
  software_name: string;
  version: string | null;
  installed_at: string | null;
  created_at: string | null;
}

// Matches DB: compliance_rules table
export interface ComplianceRule {
  id: string;
  tenant_id: string | null;
  name: string | null;
  description: string | null;
  is_enabled: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

// Matches DB: compliance_results table
export interface ComplianceResult {
  id: string;
  device_id: string | null;
  rule_id: string | null;
  passed: boolean | null;
  checked_at: string | null;
}

// Matches DB: alerts table
export interface Alert {
  id: string;
  tenant_id: string | null;
  device_id: string | null;
  alert_type: string | null;
  severity: string | null;
  status: string | null;
  title: string | null;
  description: string | null;
  suggested_action: string | null;
  ai_generated: boolean | null;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string | null;
}

// Matches DB: maintenance_suggestions table
export interface MaintenanceSuggestion {
  id: string;
  device_id: string | null;
  tenant_id: string | null;
  description: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// Matches DB: remote_actions table
export interface RemoteAction {
  id: string;
  tenant_id: string | null;
  device_id: string | null;
  action_name: string | null;
  parameters: Record<string, unknown> | null;
  status: string | null;
  executed_at: string | null;
  created_at: string | null;
}

// Matches DB: network_devices table (with new columns)
export interface NetworkDevice {
  id: string;
  tenant_id: string | null;
  name: string | null;
  type: string | null;
  ip_address: string | null;
  hostname: string | null;
  snmp_status: string | null;
  last_polled: string | null;
  metrics: Record<string, unknown> | null;
  created_at: string | null;
  updated_at: string | null;
}

// Matches DB: security_status table
export interface SecurityStatus {
  id: string;
  device_id: string | null;
  status_summary: string | null;
  threats_detected: Record<string, unknown> | null;
  checked_at: string | null;
}

// Matches DB: audit_logs table
export interface AuditLog {
  id: string;
  tenant_id: string | null;
  user_id: string | null;
  action: string | null;
  details: Record<string, unknown> | null;
  created_at: string | null;
}

// Extended types for UI
export interface DeviceWithMetrics extends Device {
  latest_metrics?: DeviceMetrics;
  security_status?: SecurityStatus;
  installed_software?: InstalledSoftware[];
}

export interface AlertWithDevice extends Alert {
  device?: Device;
}

export interface TenantWithStats extends Tenant {
  device_count?: number;
  admin_count?: number;
  avg_compliance_score?: number;
  active_alerts?: number;
}

// Patch types (future tables)
export interface PatchProfile {
  id: string;
  tenant_id: string;
  name: string;
  os: DeviceOS;
  schedule: PatchSchedule;
  auto_approve_severity: string[];
  excluded_patches: string[];
  maintenance_window_start: string | null;
  maintenance_window_end: string | null;
  enable_third_party: boolean;
  created_at: string;
  updated_at: string;
}

export interface PatchEntry {
  id: string;
  tenant_id: string;
  device_id: string;
  patch_name: string;
  kb_id: string | null;
  severity: AlertSeverity;
  status: PatchStatus;
  os: DeviceOS;
  scheduled_at: string | null;
  installed_at: string | null;
  created_at: string;
}
