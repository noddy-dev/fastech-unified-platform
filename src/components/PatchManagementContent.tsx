import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Package, CheckCircle, XCircle, Clock, AlertTriangle, Monitor, Apple, Terminal as TerminalIcon } from 'lucide-react';

// Mock data for patch management
const mockPatches = [
  { id: '1', name: 'KB5034441 - Security Update', os: 'windows', severity: 'critical', status: 'pending', device_count: 12 },
  { id: '2', name: 'KB5034439 - Cumulative Update', os: 'windows', severity: 'high', status: 'approved', device_count: 8 },
  { id: '3', name: 'macOS Sonoma 14.3.1', os: 'macos', severity: 'high', status: 'installed', device_count: 5 },
  { id: '4', name: 'Linux Kernel 6.7.2', os: 'linux', severity: 'medium', status: 'pending', device_count: 3 },
  { id: '5', name: 'Chrome 121.0.6167.160', os: 'windows', severity: 'high', status: 'approved', device_count: 20 },
  { id: '6', name: 'Firefox 122.0.1', os: 'linux', severity: 'medium', status: 'postponed', device_count: 6 },
  { id: '7', name: 'Node.js 20.11.1 LTS', os: 'windows', severity: 'low', status: 'excluded', device_count: 4 },
  { id: '8', name: 'Python 3.12.2', os: 'macos', severity: 'low', status: 'installed', device_count: 7 },
];

const mockSchedules = [
  { id: '1', name: 'Critical Security Patches', os: 'All', schedule: 'Daily', autoApprove: true, thirdParty: true },
  { id: '2', name: 'Windows Monthly Updates', os: 'Windows', schedule: 'Monthly', autoApprove: false, thirdParty: true },
  { id: '3', name: 'macOS Updates', os: 'macOS', schedule: 'Weekly', autoApprove: false, thirdParty: false },
  { id: '4', name: 'Linux Kernel Updates', os: 'Linux', schedule: 'Weekly', autoApprove: false, thirdParty: false },
];

interface PatchManagementContentProps {
  showTitle?: boolean;
}

export function PatchManagementContent({ showTitle = true }: PatchManagementContentProps) {
  const [osFilter, setOsFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = mockPatches.filter(p =>
    (osFilter === 'all' || p.os === osFilter) &&
    (statusFilter === 'all' || p.status === statusFilter)
  );

  const stats = {
    total: mockPatches.length,
    installed: mockPatches.filter(p => p.status === 'installed').length,
    pending: mockPatches.filter(p => p.status === 'pending').length,
    failed: mockPatches.filter(p => p.status === 'failed').length,
  };
  const successRate = stats.total > 0 ? Math.round((stats.installed / stats.total) * 100) : 0;

  const getSeverityColor = (s: string) => {
    if (s === 'critical') return 'bg-destructive text-destructive-foreground';
    if (s === 'high') return 'bg-warning text-warning-foreground';
    if (s === 'medium') return 'bg-info text-info-foreground';
    return 'bg-muted text-muted-foreground';
  };

  const getStatusIcon = (s: string) => {
    if (s === 'installed') return <CheckCircle className="w-4 h-4 text-success" />;
    if (s === 'failed') return <XCircle className="w-4 h-4 text-destructive" />;
    if (s === 'pending') return <Clock className="w-4 h-4 text-warning" />;
    if (s === 'approved') return <Package className="w-4 h-4 text-primary" />;
    if (s === 'postponed') return <AlertTriangle className="w-4 h-4 text-muted-foreground" />;
    return <XCircle className="w-4 h-4 text-muted-foreground" />;
  };

  const getOSIcon = (os: string) => {
    if (os === 'windows') return <Monitor className="w-4 h-4" />;
    if (os === 'macos') return <Apple className="w-4 h-4" />;
    return <TerminalIcon className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {showTitle && (
        <div>
          <h1 className="text-3xl font-bold">Patch Management</h1>
          <p className="text-muted-foreground">Multi-OS patching with scheduling, third-party support, and compliance tracking</p>
        </div>
      )}

      {/* Compliance Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Patches</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Installed</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-success">{stats.installed}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Pending</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-warning">{stats.pending}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Success Rate</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
            <Progress value={successRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="patches">
        <TabsList>
          <TabsTrigger value="patches">Available Patches</TabsTrigger>
          <TabsTrigger value="schedules">Scheduled Profiles</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="patches" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle>Patches</CardTitle>
                <div className="flex gap-2">
                  <Select value={osFilter} onValueChange={setOsFilter}>
                    <SelectTrigger className="w-[130px]"><SelectValue placeholder="OS" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All OS</SelectItem>
                      <SelectItem value="windows">Windows</SelectItem>
                      <SelectItem value="macos">macOS</SelectItem>
                      <SelectItem value="linux">Linux</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="installed">Installed</SelectItem>
                      <SelectItem value="postponed">Postponed</SelectItem>
                      <SelectItem value="excluded">Excluded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filtered.map((patch) => (
                  <div key={patch.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/30 transition-colors">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(patch.status)}
                      <div>
                        <div className="flex items-center gap-2">
                          {getOSIcon(patch.os)}
                          <span className="font-medium">{patch.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{patch.device_count} devices affected</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(patch.severity)}>{patch.severity}</Badge>
                      {patch.status === 'pending' && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">Approve</Button>
                          <Button size="sm" variant="ghost">Postpone</Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedules" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Patch Schedules</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockSchedules.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.os} • {s.schedule} • {s.autoApprove ? 'Auto-approve' : 'Manual'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {s.thirdParty && <Badge variant="outline">3rd Party</Badge>}
                      <Badge variant="secondary">{s.schedule}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Maintenance Tasks</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['Temp files cleanup', 'Create restore points', 'Scheduled reboots'].map((task) => (
                  <div key={task} className="flex items-center justify-between p-4 border rounded-lg">
                    <span className="font-medium">{task}</span>
                    <Button size="sm" variant="outline">Configure</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
