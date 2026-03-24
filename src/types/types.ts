export type UserRole = 'super_admin' | 'msp_admin' | 'tenant_admin' | 'tenant_user';
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

export interface Profile {
  id: string;
  email: string | null;
  username: string | null;
  role: UserRole;
  tenant_id: string | null;
  msp_id: string | null;
  organization_name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tenant {
  id: string;
  name: string;
  status: TenantStatus;
  subscription_tier: string;
  monthly_fee_per_admin: number;
  billing_status: string;
  registration_token: string;
  msp_id: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface MSP {
  id: string;
  name: string;
  contact_email: string;
  phone: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface MSPSupportSession {
  id: string;
  tenant_id: string;
  msp_user_id: string;
  activated_at: string;
  deactivated_at: string | null;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
}

export interface Device {
  id: string;
  tenant_id: string;
  device_name: string;
  hardware_id: string;
  os: DeviceOS;
  os_version: string | null;
  ip_address: string | null;
  cpu_model: string | null;
  ram_gb: number | null;
  disk_capacity_gb: number | null;
  disk_usage_percent: number | null;
  status: DeviceStatus;
  compliance_score: number;
  last_seen: string | null;
  department: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeviceMetrics {
  id: string;
  device_id: string;
  cpu_usage_percent: number | null;
  memory_usage_percent: number | null;
  disk_usage_percent: number | null;
  network_throughput_mbps: number | null;
  recorded_at: string;
}

export interface InstalledSoftware {
  id: string;
  device_id: string;
  software_name: string;
  version: string | null;
  installed_at: string | null;
  created_at: string;
}

export interface ComplianceRule {
  id: string;
  tenant_id: string;
  rule_name: string;
  rule_type: string;
  rule_config: Record<string, unknown>;
  is_enabled: boolean;
  applies_to_all: boolean;
  department: string | null;
  created_at: string;
  updated_at: string;
}

export interface ComplianceResult {
  id: string;
  device_id: string;
  rule_id: string;
  passed: boolean;
  checked_at: string;
  details: string | null;
}

export interface Alert {
  id: string;
  tenant_id: string;
  device_id: string | null;
  alert_type: string;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  description: string | null;
  suggested_action: string | null;
  ai_generated: boolean;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface MaintenanceSuggestion {
  id: string;
  device_id: string;
  issue_summary: string;
  recommended_action: string | null;
  confidence_level: number | null;
  status: string;
  actioned_by: string | null;
  actioned_at: string | null;
  created_at: string;
}

export interface RemoteAction {
  id: string;
  tenant_id: string;
  device_id: string;
  action_type: ActionType;
  script_type: ScriptType | null;
  script_content: string | null;
  initiated_by: string;
  status: ActionStatus;
  output: string | null;
  exit_code: number | null;
  executed_at: string | null;
  created_at: string;
}

export interface NetworkDevice {
  id: string;
  tenant_id: string;
  hostname: string | null;
  ip_address: string;
  device_type: string | null;
  snmp_status: string | null;
  last_polled: string | null;
  metrics: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface SecurityStatus {
  id: string;
  device_id: string;
  firewall_enabled: boolean | null;
  antivirus_installed: boolean | null;
  antivirus_active: boolean | null;
  antivirus_up_to_date: boolean | null;
  open_ports: Record<string, unknown> | null;
  ad_user: string | null;
  ad_sync_status: string | null;
  checked_at: string;
}

export interface AuditLog {
  id: string;
  tenant_id: string | null;
  user_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

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

// Extended types
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
