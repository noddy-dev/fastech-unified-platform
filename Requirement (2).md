# Requirements Document

## 1. Application Overview

- **Application Name:** Fastech IT Solutions – AI Endpoint Compliance & MSP Platform
- **Description:** A multi-tenant, AI-driven endpoint compliance and remote management SaaS platform modeled after the Atera system. The platform operates under a three-tier hierarchy: SuperAdmin at the top, MSP in the middle, and Tenant at the bottom (with Tenant Admin and Tenant User roles within each tenant). The SuperAdmin retains supreme authority over all MSP accounts and all tenants regardless of onboarding path. Tenants onboarded directly by the SuperAdmin are managed independently of any MSP. The platform enables endpoint inventory, compliance tracking, AI-powered anomaly detection, remote management via CMD/PowerShell and RustDesk integration, network monitoring, billing management, and audit reporting via a centralized web dashboard. A lightweight Windows agent (.exe / .msi installer, compatible with Windows 10 and above) auto-registers endpoints using a tenant-specific token embedded at build/download time and continuously reports metrics to the backend. Authentication and data isolation are implemented via Supabase Auth and Row-Level Security (RLS) policies.

---

## 2. Users & Use Cases

### Target Users

- **SuperAdmin:** The system owner. Has supreme authority over the entire platform — all MSP accounts, all tenants (whether onboarded via MSP or directly), all devices, and all data. Can create and assign other SuperAdmins. Can override subscriptions, tenant data, and remote commands. Full audit log visibility across the platform.
- **MSP Admin:** Manages tenants, tenant admins, and devices under their MSP account only. Has cross-tenant visibility and support access scoped to their assigned tenants. Can access dashboards, run commands on devices, and view metrics within their scope.
- **Tenant Admin:** Manages the tenant workspace — devices, compliance rules, alerts, users. Can create users and admins under their tenant. Can execute remote commands for devices within their tenant.
- **Tenant User:** Read-only access to assigned devices and reports as configured by the Tenant Admin.

### Core Use Cases

- The SuperAdmin logs in and views a global dashboard spanning all MSP accounts and all direct tenants.
- The SuperAdmin activates access into any MSP workspace or any tenant workspace without restriction.
- The SuperAdmin creates another SuperAdmin account.
- The SuperAdmin creates a tenant directly (not via MSP); that tenant is managed independently under the SuperAdmin's direct tenant list.
- An MSP Admin creates and manages tenants assigned to their MSP account.
- An MSP Admin activates support access to one of their assigned tenants to troubleshoot a critical issue.
- A Tenant Admin creates user roles, assigns permissions, and reviews AI-generated alerts.
- A Tenant Admin clicks 「Download Agent」 to retrieve a pre-built installer with the tenant registration token already embedded, along with a deployment instruction guide.
- An agent auto-registers a Windows PC using the embedded token, collects metrics, and sends them to the backend for compliance evaluation.
- An admin remotely executes a PowerShell or CMD script on a non-compliant device and views real-time output.
- An admin launches a RustDesk remote GUI session from the Device Detail Page.
- A Tenant Admin or MSP Admin views their billing page and initiates a subscription payment.

---

## 3. Page Structure & Core Features

### 3.1 Page Hierarchy

```
Fastech Platform
├── Authentication
│   ├── Login Page
│   └── Password Reset Page
├── SuperAdmin Portal
│   ├── Global Dashboard
│   ├── SuperAdmin Management
│   │   └── SuperAdmin List & Creation
│   ├── MSP Management
│   │   ├── MSP List
│   │   └── MSP Detail & Access Panel
│   ├── Direct Tenant Management
│   │   ├── Direct Tenant List
│   │   └── Direct Tenant Detail & Access Panel
│   └── Platform-Wide Audit Log
├── MSP Portal (MSP Admin)
│   ├── Tenant Management
│   ├── Cross-Tenant Dashboard
│   ├── MSP Support Access Panel
│   └── Billing Page (MSP)
├── Tenant Workspace
│   ├── Dashboard (Overview)
│   ├── Endpoint Management
│   │   ├── Device Inventory
│   │   └── Device Detail Page
│   ├── Compliance Center
│   │   ├── Compliance Rules
│   │   └── Compliance Scores
│   ├── AI & Alerts
│   │   ├── Anomaly Detection Feed
│   │   └── Predictive Maintenance Suggestions
│   ├── Remote Management
│   │   ├── Script Execution (CMD / PowerShell)
│   │   ├── Software Push / Reboot / Shutdown
│   │   └── RustDesk Remote Access
│   ├── Network Monitoring
│   │   ├── Network Device Map
│   │   └── Security Status
│   ├── Reports & Audit
│   │   ├── Compliance Reports
│   │   └── Historical Trends
│   ├── User & Role Management
│   │   ├── User List
│   │   └── Role & Permission Settings
│   └── Billing Page (Tenant)
└── Windows Agent (Installer: .exe / .msi)
```

---

### 3.2 Authentication

**Login Page**
- Email and password login for all roles: SuperAdmin, MSP Admin, Tenant Admin, and Tenant User.
- Implemented via Supabase Auth.
- Role-based redirect after login: SuperAdmin Portal, MSP Portal, or Tenant Workspace.
- Password reset via email link.

---

### 3.3 SuperAdmin Portal

**Global Dashboard**
- Aggregated view across the entire platform: total MSP accounts, total tenants (MSP-managed + direct), total devices, overall compliance scores, active alerts.
- Breakdown by MSP account and by direct tenants.
- Filter and drill down by MSP or by individual tenant.

**SuperAdmin Management**
- List all SuperAdmin accounts with name, email, and status.
- Create a new SuperAdmin account (email invite flow).
- Deactivate or remove an existing SuperAdmin.
- Only SuperAdmins can create or manage other SuperAdmin accounts.

**MSP Management**
- List all registered MSP accounts with status (active/inactive), number of managed tenants, and total device count.
- Create, edit, suspend, or delete an MSP account.
- View all tenants under a specific MSP account.
- 「Activate Access」 button per MSP: grants SuperAdmin full read/write access to that MSP's portal and all tenants under it.
- Access session is logged (start time, end time, SuperAdmin user who activated).
- MSP Admin receives a notification when SuperAdmin access is activated or deactivated.
- Override MSP subscription status directly from this panel.

**Direct Tenant Management**
- List all tenants onboarded directly by the SuperAdmin (not via any MSP).
- Create, edit, suspend, or delete a direct tenant.
- View subscription details and device count per direct tenant.
- 「Activate Access」 button per direct tenant: grants SuperAdmin full read/write access to that tenant's workspace.
- Access session is logged; Tenant Admin is notified on activation and deactivation.
- Override tenant subscription status and tenant data directly from this panel.

**Platform-Wide Audit Log**
- Complete audit trail of all SuperAdmin actions: MSP access activations, direct tenant access activations, account creations/deletions, SuperAdmin creations, subscription overrides, and any actions taken while inside an MSP or tenant workspace.
- Filterable by date range, action type, and target (MSP or tenant).

---

### 3.4 MSP Portal (MSP Admin)

**Tenant Management**
- List all tenants assigned to this MSP with status (active/inactive), subscription tier, and device count.
- Create, edit, suspend, or delete a tenant under this MSP.
- View subscription details: fixed monthly fee (e.g., K30 per admin), billing status.

**Cross-Tenant Dashboard**
- Aggregated view of all MSP-assigned tenants: total devices, compliance scores, active alerts.
- Filter and drill down by tenant.

**MSP Support Access Panel**
- 「Activate Support」 button per tenant: temporarily grants MSP Admin read/write access to that tenant's workspace.
- Support session is time-limited and logged (start time, end time, MSP user who activated).
- Tenant Admin receives a notification when MSP support is activated or deactivated.
- MSP Admin can deactivate support access manually at any time.

**Billing Page (MSP)**
- Displays current subscription plan, billing cycle, and outstanding balance for the MSP account.
- Lists per-tenant billing breakdown (e.g., number of admin accounts × monthly rate).
- 「Pay Now」 button: initiates payment for outstanding balance.
- Payment history table: date, amount, status (paid/pending/failed).
- MSP Admin can update billing contact details.

---

### 3.5 Tenant Dashboard (Overview)

- Summary widgets: total devices, compliant vs. non-compliant devices, open alerts, compliance score (overall).
- Recent alerts feed.
- Quick links to Device Inventory, Compliance Center, and Reports.
- Compliance score breakdown by department (if departments are configured).
- Supabase Realtime subscriptions push metric and alert updates to the dashboard immediately via WebSocket.

---

### 3.6 Endpoint Management

**Device Inventory**
- List all registered endpoints with columns: device name, OS (Windows/Linux/Mac), IP address, last seen, compliance score, status.
- Filter by OS type, compliance status, department.
- Search by device name or IP.
- 「Download Agent」 button: triggers the backend to generate a tenant-specific installer package with the registration token pre-embedded. The backend returns a download link to the pre-built .exe and .msi installers. The tenant registration token is baked into the installer at generation time so that no manual token entry is required during installation.
- A deployment instruction guide is presented alongside the download link (see Section 3.14 for full details).
- Agent auto-registration: when an agent starts on a new endpoint, it reads the embedded token and auto-registers the device under the tenant's workspace. Duplicate detection is based on hardware UUID / MAC address; existing records are updated rather than duplicated.
- Each device row in the table is governed by Supabase RLS using tenant_id to enforce data isolation.

**Device Detail Page**
- Hardware info: CPU model, RAM, disk capacity and usage.
- OS version and patch level.
- Installed software list with version numbers.
- Network interfaces and current IP addresses.
- Compliance score for this device with rule-by-rule breakdown.
- Real-time metrics (pushed via Supabase Realtime): CPU usage %, memory usage %, disk usage %, network throughput.
- Alert history for this device.
- RustDesk ID associated with this device (if registered).
- Action buttons: Execute Script, Remote Access (RustDesk), Reboot, Shutdown, Push Update.

---

### 3.7 Compliance Center

**Compliance Rules**
- Define compliance rules per tenant using JSON-configured rule definitions.
- Rule types: software presence/absence, OS version threshold, patch status, firewall enabled, antivirus active.
- Enable/disable individual rules.
- Assign rules to all devices or specific device groups/departments.
- Rules are stored per tenant and evaluated against incoming agent metrics.

**Compliance Scores**
- Compliance score per device: computed as (passing rules / total applicable rules) × 100.
- Recalculated on each agent metrics push.
- Compliance score per department and overall tenant score.
- Visual indicator: compliant (green), partially compliant (yellow), non-compliant (red).
- List of failing rules per device with recommended remediation.
- Dashboard widget updated in real time via Supabase Realtime.

---

### 3.8 AI & Alerts System

**Anomaly Detection Feed**
- AI alerts engine runs as a Supabase function or serverless backend job.
- Inputs: device metrics, device info, compliance rules.
- Output: JSON alert objects stored in the Alerts table in Supabase.
- Alert types: unauthorized software detected, abnormal network activity, unexpected process execution, high resource consumption spikes.
- Each alert includes: device name, alert type, severity (low/medium/high/critical), timestamp, AI-generated description, suggested action.
- Alert status: open, acknowledged, resolved.
- Tenant Admin can acknowledge or resolve alerts.
- Admin can mark an alert as a false positive; feedback is logged for future detection improvement.
- Realtime notifications pushed to dashboard via Supabase Realtime WebSocket.
- Alerting channels: in-platform web notification, email, SMS (configurable per tenant).
- Alert notifications delivered within 2 minutes of detection.

**Predictive Maintenance Suggestions**
- AI-generated suggestions per device: e.g., disk nearing capacity, driver outdated, recurring crash pattern detected.
- Each suggestion includes: device, issue summary, recommended action, confidence level.
- Admin can mark suggestions as actioned or dismissed.

**Autonomous IT Tasks**
- AI can generate remediation scripts (PowerShell, Bash, Python) based on detected issues using OpenAI API.
- AI-generated issue summaries for open alerts.
- Admin reviews and approves before execution; no autonomous execution without admin approval.

---

### 3.9 Remote Management

**Script Execution (CMD / PowerShell)**
- API endpoint: /remote/execute_command
- Input payload: {device_id, command, type: cmd or powershell}
- Backend verifies:
  - The requesting user's role has permission to execute commands.
  - The target device belongs to the user's tenant scope (or MSP/SuperAdmin scope).
- Execution routed via RustDesk CLI (if agent is registered with a RustDesk ID) or via the agent's local command proxy if the agent supports direct remote execution.
- Real-time output/logs displayed in the UI.
- All executions logged in the RemoteActions table: command content, type, executed_by, target device, timestamp, output, exit code.
- Script execution history per device is viewable on the Device Detail Page.
- Select one or multiple target devices for batch execution.
- Script types supported: CMD, PowerShell, Python, Bash.

**Software Push / Reboot / Shutdown**
- Push software update packages to selected devices.
- Remote reboot: select device(s), confirm, execute.
- Remote shutdown: select device(s), confirm, execute.
- All remote actions logged: action type, initiated by, target device(s), timestamp, result.
- Critical device reboot/shutdown requires a confirmation dialog where the admin must type the device name before execution.

**RustDesk Remote Access**
- Agents register their RustDesk IDs with the backend upon installation.
- RustDesk ID is stored and displayed on the Device Detail Page.
- 「Remote Access」 button on Device Detail Page: backend API generates a CLI session command to the agent's RustDesk ID.
- Session start and end are logged in the audit table.
- No native screen sharing implementation; relies entirely on RustDesk.

---

### 3.10 Network Monitoring

**Network Device Map**
- Discover and display network-connected devices including Cisco devices via SNMP discovery.
- Device list: hostname, IP, device type, SNMP status, last polled.
- Metrics collected via SNMP/SSH: interface status, bandwidth utilization, error rates.
- Agent startup flow:
  1. Agent starts → auto-registers local Windows endpoint using embedded token.
  2. SNMP Discovery → discovers Cisco and other network devices on the local segment.
  3. Metrics Collection → local PC metrics + Cisco SNMP/SSH metrics.
  4. Send all metrics to backend API over HTTPS.
  5. Poll backend for pending commands → execute CMD/PowerShell.
  6. Log errors locally.
  7. Sleep → Repeat.

**Security Status**
- Per-device firewall status (enabled/disabled).
- Antivirus status (installed, active, up-to-date).
- Open ports list per device.
- Unauthorized access attempt alerts.
- Active Directory integration: user-to-device mapping display (AD sync status, assigned user per device). AD integration is optional per tenant; when enabled, user-device mapping is synced on a configurable schedule.

---

### 3.11 Reports & Audit

**Compliance Reports**
- Generate compliance report for a selected time range, filtered by tenant, department, or device.
- Report includes: compliance score summary, list of non-compliant devices, failing rules, alert counts.
- Export as PDF or Excel.
- Large dataset reports are generated asynchronously; admin is notified when ready for download.

**Historical Trends**
- Line/bar charts showing compliance score over time (per device, department, or tenant).
- Alert volume trends over time.
- Filter by date range.

---

### 3.12 User & Role Management

**User List**
- List all users within the tenant workspace: name, email, role, status (active/inactive).
- Invite new user via email.
- Deactivate or remove users.
- Tenant Admin can create additional Tenant Admin accounts within their tenant.

**Role & Permission Settings**
- Roles within a tenant: Tenant Admin (full access within tenant workspace, can execute remote commands, manage devices, compliance rules, alerts, and users), Tenant User (read-only access to assigned devices and reports).
- Tenant Admin can configure which modules/pages a Tenant User role can access.
- Role assignment per user.
- All role-based data access enforced via Supabase RLS policies using tenant_id row filters.

---

### 3.13 Billing Pages

**Billing Page (Tenant)**
- Displays current subscription plan, billing cycle, number of admin accounts, and total monthly fee.
- Outstanding balance and due date.
- 「Pay Now」 button: initiates payment for outstanding balance.
- Payment history table: date, amount, status (paid/pending/failed).
- Tenant Admin can update billing contact details.
- Tenant workspace becomes read-only if subscription is suspended due to non-payment; agents continue reporting but remote actions are disabled.

**Billing Page (MSP)**
- Described in Section 3.4 MSP Portal.

---

### 3.14 Windows Agent (Installer)

**Overview**
- A lightweight background service agent distributed as both an .exe installer and an .msi installer package.
- Compatible with Windows 10 and above (32-bit and 64-bit).
- Installs as a Windows Service that starts automatically on system boot.
- The tenant registration token is embedded directly into the installer at generation time. No manual token entry is required during installation or first run.

**Token Embedding & Installer Generation Flow**
- When a Tenant Admin clicks 「Download Agent」 in the Device Inventory page, the backend:
  1. Retrieves the tenant-specific registration token for the requesting tenant.
  2. Generates a pre-built installer package (.exe and .msi) with the registration token baked into the installer binary or a bundled configuration file within the installer package.
  3. Returns a time-limited, signed download URL for both the .exe and .msi installers.
- The embedded token is written to the agent's local configuration on first run (e.g., agent.config or a registry key) and is not exposed to the end user during installation.
- The download link and the deployment instruction guide are presented together on the Device Inventory page after the Tenant Admin clicks 「Download Agent」.

**Deployment Instruction Guide**
- A deployment instruction guide is displayed in the UI (and optionally downloadable as a PDF) alongside the installer download links.
- The guide covers the following sections:
  1. **Prerequisites:** Windows 10 or above (x64 recommended); administrator privileges required for installation; outbound HTTPS access to the backend API URL must be permitted by the firewall.
  2. **Manual Installation (.exe):**
    - Download the pre-built .exe installer.
    - Run the installer as Administrator.
    - Follow the setup wizard; no token entry is required — the token is pre-embedded.
    - The agent installs as a Windows Service and starts automatically.
    - Verify registration: the device should appear in the Device Inventory within one polling cycle (default: 60 seconds).
  3. **Silent / Enterprise Deployment (.msi):**
    - Download the pre-built .msi installer.
    - Deploy via Group Policy, SCCM, or any MDM solution using the following silent install command:
      msiexec /i FastechAgent.msi /quiet /norestart
    - No additional parameters are required; the token is pre-embedded in the .msi package.
    - Verify registration: devices should appear in the Device Inventory within one polling cycle after installation.
  4. **Automatic Device Registration:**
    - On first run, the agent reads the embedded tenant registration token.
    - The agent contacts the backend API over HTTPS and registers the endpoint under the correct tenant workspace.
    - Duplicate detection: if a device with the same hardware UUID / MAC address already exists, the existing record is updated rather than creating a new entry.
    - The device appears in the Device Inventory once registration is confirmed by the backend.
  5. **Verifying Successful Registration:**
    - Log in to the Tenant Workspace and navigate to Endpoint Management > Device Inventory.
    - Confirm the newly registered device appears in the list with status active and metrics populating within one polling cycle.
  6. **Troubleshooting:**
    - If the device does not appear after one polling cycle, check that outbound HTTPS to the backend API URL is not blocked.
    - Review the local agent log file for errors (default log path: C:\\ProgramData\\FastechAgent\\logs\\agent.log).
    - If the embedded token is invalid or expired, re-download a fresh installer from the Device Inventory page and reinstall.
    - To re-register a device, uninstall the existing agent, download a new installer, and reinstall.

**Installation & Token Flow**
- Installer prompts no token entry; the tenant registration token is pre-embedded.
- On first run, the agent reads the embedded token from the bundled configuration.
- Backend resolves tenant_token → tenant_id, creates or updates the Device entry in Supabase, and links metrics to the device.
- Duplicate detection: if a device with the same hardware UUID / MAC address already exists, the existing record is updated rather than creating a duplicate.

**Agent Runtime Loop**
1. Start → read configuration (embedded tenant token, backend API URL, polling interval).
2. Auto-register endpoint (or update existing registration); register RustDesk ID with backend.
3. Collect local metrics: CPU usage %, memory usage %, disk usage %, network throughput, installed software list, OS version and patch level, firewall status, antivirus status, open ports.
4. Run SNMP discovery on the local network segment → collect Cisco/network device metrics via SNMP/SSH.
5. POST all collected metrics to backend API over HTTPS. Payload: {hostname, ip, tenant_token, device_id, metrics}.
6. Backend updates Metrics table in Supabase → triggers Realtime dashboard updates and AI anomaly checks.
7. Poll backend for pending commands (script execution, reboot, shutdown, software push).
8. Execute received commands (CMD/PowerShell); return output and exit code to backend; log in RemoteActions table.
9. Log any errors locally to a log file.
10. Sleep for the configured polling interval → repeat from step 3.

**Agent Configuration**
- Configuration stored in a local config file (e.g., agent.config or registry key).
- Configurable fields: backend API URL, tenant registration token (pre-embedded at install time), polling interval (default: 60 seconds).
- Configuration can be updated remotely via a backend command.

**Agent Update**
- Backend can push an agent update package to the endpoint.
- Agent applies the update and restarts the service automatically.

**Security**
- All communication between agent and backend is over HTTPS.
- The embedded registration token is stored securely (encrypted at rest in the config) and is not exposed in the installer UI.
- Agent runs under a least-privilege Windows service account.
- Windows Service recovery settings automatically restart the agent service after a failure.

**Deliverables**
- One .exe installer (standard Windows installer experience with setup wizard; tenant token pre-embedded; no token entry required).
- One .msi installer (suitable for silent/enterprise deployment via Group Policy or SCCM; tenant token pre-embedded; supports silent install with /quiet /norestart flags).
- Both installers target Windows 10 and above (x64 primary; x86 optional).
- Deployment instruction guide displayed in the UI alongside download links (optionally downloadable as PDF).

---

## 4. Business Rules & Logic

1. **Three-Tier Hierarchy:** The platform operates under a strict three-tier authority model: SuperAdmin > MSP Admin > Tenant Admin/User. The SuperAdmin has unrestricted access to all MSP accounts and all tenants regardless of onboarding path, and can override subscriptions, tenant data, and remote commands.
2. **SuperAdmin Creation:** Only a SuperAdmin can create or assign another SuperAdmin. SuperAdmin accounts are not scoped to any MSP or tenant.
3. **Direct vs. MSP-Managed Tenants:** Tenants onboarded directly by the SuperAdmin are not associated with any MSP account and are managed exclusively under the SuperAdmin's direct tenant list. MSP Admins cannot see or access direct tenants.
4. **SuperAdmin Access Sessions:** When the SuperAdmin activates access into an MSP portal or a tenant workspace, the session is time-limited (configurable), fully logged, and the affected MSP Admin or Tenant Admin is notified on activation and deactivation.
5. **Multi-Tenancy Isolation:** Each tenant's data (devices, users, compliance rules, alerts, reports) is strictly isolated via Supabase RLS policies using tenant_id row filters. No tenant can access another tenant's data except via MSP support activation (scoped to that MSP's tenants) or SuperAdmin access activation.
6. **Subscription Model:** Each tenant is billed a fixed monthly fee per admin account (e.g., K30/admin). Unlimited devices per subscription. Billing status affects tenant workspace access (suspended if unpaid; workspace becomes read-only, agents continue reporting but remote actions are disabled).
7. **MSP Billing:** MSP accounts are billed based on the aggregate of their managed tenants. MSP Billing Page provides per-tenant breakdown and payment initiation.
8. **MSP Support Session:** Support activation is time-limited. Session duration limit is configurable by MSP. All actions taken during an MSP support session are logged under the MSP user's identity. Tenant Admin is notified on activation and deactivation.
9. **Agent Token Embedding:** The tenant registration token is embedded into the installer package at generation time by the backend. The installer does not prompt the user for a token. On first run, the agent reads the embedded token from its bundled configuration to auto-register the endpoint.
10. **Agent Auto-Registration:** On first startup, the agent registers the endpoint under the correct tenant using the embedded tenant registration token resolved to tenant_id. Duplicate registration (same hardware UUID / MAC) updates the existing record rather than creating a new one. Backend triggers Realtime dashboard updates upon registration.
11. **Compliance Score Calculation:** Score = (number of passing rules / total applicable rules) × 100. Rules are JSON-configured per tenant. Score is recalculated on each agent metrics push.
12. **Alert Notification Routing:** Alerts are routed to the Tenant Admin by default. Notification channels (email, SMS, web) are configurable per tenant. Notifications delivered within 2 minutes of detection via Supabase Realtime WebSocket.
13. **Remote Action Authorization:**
  - SuperAdmin: unrestricted execution across all tenants.
  - MSP Admin: execution only on devices belonging to their assigned tenants.
  - Tenant Admin: execution within their tenant workspace only.
  - Tenant User: cannot initiate any remote actions.
  - Authorization enforced at the /remote/execute_command API level before execution.
14. **RustDesk Session Logging:** All RustDesk remote access session starts and ends are logged in the audit table with initiator, target device, and timestamps.
15. **AI Script Generation:** AI-generated scripts (via OpenAI API) require explicit admin approval before execution. No autonomous execution.
16. **Active Directory Sync:** AD integration is optional per tenant. When enabled, user-device mapping is synced on a configurable schedule. AD integration is read/sync only; no write-back.
17. **Data Retention:** Compliance logs, alert history, and remote action logs are retained for a minimum of 90 days per tenant.
18. **Agent Communication Security:** All agent-to-backend communication is over HTTPS. The registration token is encrypted at rest on the endpoint and is not exposed in the installer UI or setup wizard.

---

## 5. Exceptions & Edge Cases

| Scenario | Handling |
|---|---|
| Agent cannot reach backend | Agent logs errors locally and retries on next polling cycle |
| Duplicate device registration | Match on hardware UUID / MAC; update existing record, do not create duplicate |
| SNMP discovery timeout | Mark device as unreachable; retain last known metrics; raise alert |
| Script execution fails on endpoint | Return non-zero exit code and error output to dashboard; log failure in RemoteActions table |
| MSP support session expires | Access automatically revoked; session end logged; Tenant Admin notified |
| SuperAdmin access session expires | Access automatically revoked; session end logged; MSP Admin or Tenant Admin notified |
| Tenant subscription suspended | Tenant workspace becomes read-only; agents continue reporting but remote actions are disabled |
| AD sync failure | Display sync error status in Security Status panel; retain last successful sync data |
| AI anomaly false positive | Admin can mark alert as false positive; feedback logged for future detection improvement |
| Remote reboot/shutdown on critical device | Require confirmation dialog with device name typed to confirm before execution |
| Export report with large dataset | Generate report asynchronously; notify admin when ready for download |
| Agent installer run with invalid or expired embedded token | Agent logs a registration error locally; Device Inventory does not receive the registration; Tenant Admin should re-download a fresh installer from the Device Inventory page and redeploy |
| Agent service crashes on endpoint | Windows Service recovery settings automatically restart the agent service after a failure |
| RustDesk session fails to launch | Display error message on Device Detail Page; log failure in audit table |
| Payment fails on Billing Page | Display failure message with retry option; billing status remains outstanding |
| SuperAdmin attempts to create duplicate SuperAdmin email | Return validation error; do not create duplicate account |
| Supabase Realtime connection drops | Dashboard falls back to polling; reconnects automatically when connection is restored |
| Tenant Admin attempts to re-download agent after token rotation | Backend generates a new installer package with the updated token; previous installer packages with the old token are invalidated |

---

## 6. Acceptance Criteria

1. SuperAdmin can log in and view a global dashboard covering all MSP accounts and all direct tenants, with total device counts and compliance scores.
2. SuperAdmin can create, edit, and deactivate other SuperAdmin accounts.
3. SuperAdmin can activate and deactivate access into any MSP portal; the session is logged and the MSP Admin is notified.
4. SuperAdmin can activate and deactivate access into any direct tenant workspace; the session is logged and the Tenant Admin is notified.
5. SuperAdmin can override subscription status for any MSP or tenant directly from the management panels.
6. SuperAdmin can create, edit, suspend, and delete both MSP accounts and direct tenants independently.
7. MSP Admin can log in and view all tenants assigned to their MSP account, their device counts, and compliance scores.
8. MSP Admin can activate and deactivate support access for any of their assigned tenants; the session is logged and the Tenant Admin is notified.
9. MSP Admin can view their Billing Page, see per-tenant billing breakdown, and initiate payment.
10. Tenant Admin can log in and view their dashboard with device count, compliance score, and active alerts updated in real time via Supabase Realtime.
11. Tenant Admin can click 「Download Agent」 and receive a download link to a pre-built .exe and .msi installer with the tenant registration token pre-embedded, along with the deployment instruction guide displayed in the UI.
12. The downloaded .exe installer installs successfully on Windows 10 and above without prompting for a token; the setup wizard completes without requiring any token input from the user.
13. The downloaded .msi installer supports silent installation (msiexec /i FastechAgent.msi /quiet /norestart) on Windows 10 and above without prompting for a token.
14. After installation, the agent auto-registers the endpoint under the correct tenant workspace within one polling cycle using the embedded token; the device appears in Device Inventory.
15. The agent registers its RustDesk ID with the backend; the RustDesk ID is visible on the Device Detail Page.
16. The agent collects and reports CPU, memory, disk, network, software, OS, firewall, and antivirus metrics to the backend on each polling cycle; metrics trigger Supabase Realtime dashboard updates.
17. The agent polls for and executes backend commands (CMD/PowerShell, reboot, shutdown) and returns output and exit code to the dashboard; all executions are logged in the RemoteActions table.
18. The /remote/execute_command API enforces role-based authorization: SuperAdmin unrestricted, MSP Admin scoped to their tenants, Tenant Admin scoped to their tenant, Tenant User blocked.
19. 「Remote Access」 button on Device Detail Page launches a RustDesk session to the target device; session start and end are logged.
20. Device Inventory displays hardware info, OS, installed software, and real-time metrics for each registered endpoint.
21. Compliance rules can be created, enabled, and assigned to devices; compliance scores update after the next agent metrics push.
22. AI anomaly alerts appear in the Anomaly Detection Feed with severity, description, and suggested action; alerts are stored in the Supabase Alerts table.
23. AI-generated remediation scripts require admin approval before execution; no autonomous execution occurs.
24. Tenant Admin can execute a PowerShell/CMD/Bash/Python script on a selected device and view the output in real time.
25. Remote reboot and shutdown actions execute successfully and are logged with initiator, timestamp, and result; critical device actions require typed confirmation.
26. Compliance report can be generated for a selected date range and exported as PDF or Excel.
27. SNMP discovery detects Cisco devices and displays their metrics in the Network Device Map.
28. User & Role Management allows Tenant Admin to invite users, assign roles, create additional Tenant Admins, and restrict module access for Tenant User accounts.
29. All remote actions, MSP support sessions, and SuperAdmin access sessions are fully logged and visible in audit history.
30. Alert notifications are delivered via configured channels (web, email, SMS) within 2 minutes of detection.
31. Tenant Billing Page displays current subscription details, outstanding balance, and allows payment initiation; payment history is recorded.
32. Supabase RLS policies enforce tenant_id-based data isolation; no tenant can access another tenant's data outside of authorized support or SuperAdmin sessions.
33. Deployment instruction guide is displayed in the UI alongside the installer download links and covers prerequisites, manual installation, silent/enterprise deployment, automatic device registration, verification steps, and troubleshooting.
34. An agent installed with an invalid or expired embedded token logs a registration error locally and does not create a device entry in the backend; the Tenant Admin can resolve this by re-downloading a fresh installer.

---

## 7. Out of Scope (This Release)

- Native built-in screen sharing (remote screen sharing relies on RustDesk integration only; Splashtop and AnyDesk are no longer in scope).
- Mobile application (iOS/Android) for dashboard access.
- Automated billing and payment processing integration (billing pages support manual payment initiation; automated payment gateway integration is out of scope).
- Cloud hosting migration (initial deployment on personal server with HTTPS).
- Custom ML model training (AI uses OpenAI API for anomaly detection and task generation in this release).
- Multi-language / localization support.
- Advanced role customization beyond Tenant Admin and Tenant User defaults.
- Automated AD provisioning (AD integration is read/sync only, no write-back).
- SLA management or ticketing system integration.
- Agent support for mobile or IoT endpoints.
- Agent support for Windows versions below Windows 10.
- Linux or macOS agent installer (Windows agent only in this release).
- Token rotation or installer invalidation automation (token management is manual in this release).