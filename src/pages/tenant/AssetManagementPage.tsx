import { useEffect, useState, useMemo } from 'react';
import { TenantLayout } from '@/components/layouts/TenantLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { getDevicesByTenant, getNetworkDevicesByTenant } from '@/db/api';
import type { Device, NetworkDevice } from '@/types/types';
import {
  Search, Monitor, Shield, AlertTriangle, Wifi, Server,
  HardDrive, Clock, CheckCircle2, XCircle, ShieldAlert, Cpu, Globe,
} from 'lucide-react';

// Mock CVE data for demonstration (would come from backend in production)
interface CVEEntry {
  id: string;
  cve_id: string;
  device_name: string;
  device_id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  affected_software: string;
  published_date: string;
  patched: boolean;
}

interface EOLAsset {
  device_id: string;
  device_name: string;
  os: string;
  os_version: string | null;
  eol_date: string;
  status: 'eol' | 'approaching_eol' | 'supported';
  firmware_version?: string;
  firmware_status?: 'current' | 'outdated' | 'critical';
}

function generateMockCVEs(devices: Device[]): CVEEntry[] {
  if (devices.length === 0) return [];
  const cves: CVEEntry[] = [];
  const samples = [
    { cve_id: 'CVE-2026-1234', severity: 'critical' as const, description: 'Remote code execution in SMB v3', affected_software: 'Windows SMB' },
    { cve_id: 'CVE-2026-5678', severity: 'high' as const, description: 'Privilege escalation via kernel driver', affected_software: 'Linux Kernel 5.x' },
    { cve_id: 'CVE-2026-9012', severity: 'medium' as const, description: 'OpenSSL buffer overflow vulnerability', affected_software: 'OpenSSL 3.0.x' },
    { cve_id: 'CVE-2026-3456', severity: 'low' as const, description: 'Information disclosure in log handling', affected_software: 'Apache Log4j' },
    { cve_id: 'CVE-2026-7890', severity: 'critical' as const, description: 'Zero-day exploit in browser engine', affected_software: 'Chromium' },
    { cve_id: 'CVE-2026-2345', severity: 'high' as const, description: 'SQL injection in management console', affected_software: 'MySQL 8.0' },
  ];
  devices.slice(0, 6).forEach((d, i) => {
    if (i < samples.length) {
      cves.push({ id: `cve-${i}`, ...samples[i], device_name: d.device_name, device_id: d.id, published_date: '2026-03-10', patched: i % 3 === 0 });
    }
  });
  return cves;
}

function generateEOLAssets(devices: Device[]): EOLAsset[] {
  return devices.map((d, i) => ({
    device_id: d.id,
    device_name: d.device_name,
    os: d.os,
    os_version: d.os_version,
    eol_date: i % 4 === 0 ? '2025-10-14' : i % 4 === 1 ? '2026-06-30' : '2029-01-01',
    status: i % 4 === 0 ? 'eol' as const : i % 4 === 1 ? 'approaching_eol' as const : 'supported' as const,
    firmware_version: `v${2 + (i % 3)}.${i % 10}.${i % 5}`,
    firmware_status: i % 5 === 0 ? 'critical' as const : i % 3 === 0 ? 'outdated' as const : 'current' as const,
  }));
}

const severityColor = (s: string) =>
  s === 'critical' ? 'bg-destructive text-destructive-foreground' :
  s === 'high' ? 'bg-warning text-warning-foreground' :
  s === 'medium' ? 'bg-accent text-accent-foreground' :
  'bg-muted text-muted-foreground';

const eolStatusColor = (s: string) =>
  s === 'eol' ? 'bg-destructive text-destructive-foreground' :
  s === 'approaching_eol' ? 'bg-warning text-warning-foreground' :
  'bg-success text-success-foreground';

const firmwareColor = (s: string) =>
  s === 'critical' ? 'text-destructive' :
  s === 'outdated' ? 'text-warning' :
  'text-success';

export default function AssetManagementPage() {
  const { profile } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [networkDevices, setNetworkDevices] = useState<NetworkDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cveFilter, setCveFilter] = useState('all');

  useEffect(() => {
    if (!profile?.tenant_id) { setLoading(false); return; }
    Promise.all([
      getDevicesByTenant(profile.tenant_id),
      getNetworkDevicesByTenant(profile.tenant_id),
    ]).then(([d, n]) => { setDevices(d); setNetworkDevices(n); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [profile]);

  const cves = useMemo(() => generateMockCVEs(devices), [devices]);
  const eolAssets = useMemo(() => generateEOLAssets(devices), [devices]);

  const filteredCVEs = useMemo(() => {
    let f = cves;
    if (cveFilter !== 'all') f = f.filter(c => c.severity === cveFilter);
    if (search) f = f.filter(c => c.cve_id.toLowerCase().includes(search.toLowerCase()) || c.device_name.toLowerCase().includes(search.toLowerCase()) || c.affected_software.toLowerCase().includes(search.toLowerCase()));
    return f;
  }, [cves, cveFilter, search]);

  // Compliance stats
  const totalDevices = devices.length;
  const compliantCount = devices.filter(d => d.compliance_score >= 80).length;
  const compliancePct = totalDevices > 0 ? Math.round((compliantCount / totalDevices) * 100) : 0;
  const avgScore = totalDevices > 0 ? Math.round(devices.reduce((s, d) => s + d.compliance_score, 0) / totalDevices) : 0;
  const criticalCVEs = cves.filter(c => c.severity === 'critical' && !c.patched).length;
  const eolCount = eolAssets.filter(a => a.status === 'eol').length;

  if (loading) {
    return (
      <TenantLayout>
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </TenantLayout>
    );
  }

  return (
    <TenantLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Asset Management</h1>
          <p className="text-muted-foreground">Network discovery, CVE tracking, compliance & EOL status</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
              <Monitor className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDevices + networkDevices.length}</div>
              <p className="text-xs text-muted-foreground">{totalDevices} endpoints · {networkDevices.length} network</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Compliance</CardTitle>
              <Shield className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{compliancePct}%</div>
              <Progress value={compliancePct} className="mt-2 h-2" />
              <p className="text-xs text-muted-foreground mt-1">{compliantCount}/{totalDevices} compliant · avg {avgScore}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Critical CVEs</CardTitle>
              <ShieldAlert className="w-4 h-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{criticalCVEs}</div>
              <p className="text-xs text-muted-foreground">{cves.filter(c => !c.patched).length} unpatched total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">EOL Devices</CardTitle>
              <Clock className="w-4 h-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{eolCount}</div>
              <p className="text-xs text-muted-foreground">{eolAssets.filter(a => a.status === 'approaching_eol').length} approaching EOL</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Asset Overview</TabsTrigger>
            <TabsTrigger value="network">Network Discovery</TabsTrigger>
            <TabsTrigger value="cve">CVE Tracking</TabsTrigger>
            <TabsTrigger value="eol">EOL / Firmware</TabsTrigger>
          </TabsList>

          {/* Asset Overview Tab */}
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>All Assets</CardTitle>
                <CardDescription>PCs, servers, and monitored endpoints with compliance status</CardDescription>
              </CardHeader>
              <CardContent>
                {devices.length === 0 ? (
                  <div className="text-center py-12">
                    <Server className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No assets registered yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Device</TableHead>
                        <TableHead>OS</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>CPU / RAM</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Compliance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {devices.map(d => (
                        <TableRow key={d.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Monitor className="w-4 h-4 text-primary shrink-0" />
                              {d.device_name}
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">{d.os} {d.os_version || ''}</TableCell>
                          <TableCell className="font-mono text-sm">{d.ip_address || '—'}</TableCell>
                          <TableCell>
                            <div className="text-sm">{d.cpu_model || 'N/A'}</div>
                            <div className="text-xs text-muted-foreground">{d.ram_gb ? `${d.ram_gb} GB RAM` : '—'}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={d.status === 'online' ? 'bg-success text-success-foreground' : d.status === 'offline' ? 'bg-muted text-muted-foreground' : 'bg-warning text-warning-foreground'}>
                              {d.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={d.compliance_score} className="h-2 w-16" />
                              <span className={`text-sm font-semibold ${d.compliance_score >= 80 ? 'text-success' : d.compliance_score >= 60 ? 'text-warning' : 'text-destructive'}`}>
                                {d.compliance_score}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Network Discovery Tab */}
          <TabsContent value="network">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Wifi className="w-5 h-5" /> Network Discovery</CardTitle>
                <CardDescription>Switches, routers, firewalls, and other network infrastructure detected via SNMP/API</CardDescription>
              </CardHeader>
              <CardContent>
                {networkDevices.length === 0 ? (
                  <div className="text-center py-12">
                    <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No network devices discovered yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Deploy the agent to begin network scanning</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hostname</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>SNMP Status</TableHead>
                        <TableHead>Last Polled</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {networkDevices.map(nd => (
                        <TableRow key={nd.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Wifi className="w-4 h-4 text-primary shrink-0" />
                              {nd.hostname || 'Unknown'}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{nd.ip_address}</TableCell>
                          <TableCell className="capitalize">{nd.device_type || '—'}</TableCell>
                          <TableCell>
                            <Badge className={nd.snmp_status === 'active' ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'}>
                              {nd.snmp_status || 'unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {nd.last_polled ? new Date(nd.last_polled).toLocaleString() : 'Never'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* CVE Tracking Tab */}
          <TabsContent value="cve">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2"><ShieldAlert className="w-5 h-5" /> CVE Tracking</CardTitle>
                    <CardDescription>Known vulnerabilities affecting your assets</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="Search CVEs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-48" />
                    </div>
                    <Select value={cveFilter} onValueChange={setCveFilter}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredCVEs.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-success" />
                    <p className="text-muted-foreground">No CVEs found matching your filters</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>CVE ID</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Affected Device</TableHead>
                        <TableHead>Software</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCVEs.map(c => (
                        <TableRow key={c.id}>
                          <TableCell className="font-mono text-sm font-medium">{c.cve_id}</TableCell>
                          <TableCell><Badge className={severityColor(c.severity)}>{c.severity}</Badge></TableCell>
                          <TableCell>{c.device_name}</TableCell>
                          <TableCell className="text-sm">{c.affected_software}</TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{c.description}</TableCell>
                          <TableCell>
                            {c.patched ? (
                              <div className="flex items-center gap-1 text-success"><CheckCircle2 className="w-4 h-4" /> Patched</div>
                            ) : (
                              <div className="flex items-center gap-1 text-destructive"><XCircle className="w-4 h-4" /> Unpatched</div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* EOL / Firmware Tab */}
          <TabsContent value="eol">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> EOL & Firmware Status</CardTitle>
                <CardDescription>End-of-life tracking and firmware update status for all assets</CardDescription>
              </CardHeader>
              <CardContent>
                {eolAssets.length === 0 ? (
                  <div className="text-center py-12">
                    <HardDrive className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No assets to display</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Device</TableHead>
                        <TableHead>OS</TableHead>
                        <TableHead>EOL Date</TableHead>
                        <TableHead>EOL Status</TableHead>
                        <TableHead>Firmware</TableHead>
                        <TableHead>Firmware Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {eolAssets.map(a => (
                        <TableRow key={a.device_id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Cpu className="w-4 h-4 text-primary shrink-0" />
                              {a.device_name}
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">{a.os} {a.os_version || ''}</TableCell>
                          <TableCell className="text-sm">{new Date(a.eol_date).toLocaleDateString()}</TableCell>
                          <TableCell><Badge className={eolStatusColor(a.status)}>{a.status === 'eol' ? 'End of Life' : a.status === 'approaching_eol' ? 'Approaching EOL' : 'Supported'}</Badge></TableCell>
                          <TableCell className="font-mono text-sm">{a.firmware_version || '—'}</TableCell>
                          <TableCell>
                            <span className={`text-sm font-medium capitalize ${firmwareColor(a.firmware_status || 'current')}`}>
                              {a.firmware_status || 'unknown'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TenantLayout>
  );
}
