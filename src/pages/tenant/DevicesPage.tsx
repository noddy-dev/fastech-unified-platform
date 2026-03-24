import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TenantLayout } from '@/components/layouts/TenantLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getDevicesByTenant } from '@/db/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Device } from '@/types/types';
import { Server, Search, Monitor, HardDrive, Cpu } from 'lucide-react';

export default function DevicesPage() {
  const { profile } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [filtered, setFiltered] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [osFilter, setOsFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => { if (profile?.tenant_id) getDevicesByTenant(profile.tenant_id).then(setDevices).catch(console.error).finally(() => setLoading(false)); else setLoading(false); }, [profile]);
  useEffect(() => {
    let f = [...devices];
    if (search) f = f.filter(d => d.device_name.toLowerCase().includes(search.toLowerCase()) || d.ip_address?.includes(search));
    if (osFilter !== 'all') f = f.filter(d => d.os === osFilter);
    if (statusFilter !== 'all') f = f.filter(d => d.status === statusFilter);
    setFiltered(f);
  }, [devices, search, osFilter, statusFilter]);

  const getStatusColor = (s: string) => s === 'online' ? 'bg-success text-success-foreground' : s === 'offline' ? 'bg-muted text-muted-foreground' : 'bg-warning text-warning-foreground';
  const getCompColor = (s: number) => s >= 80 ? 'text-success' : s >= 60 ? 'text-warning' : 'text-destructive';

  return (
    <TenantLayout>
      <div className="space-y-6">
        <div><h1 className="text-3xl font-bold">Device Inventory</h1><p className="text-muted-foreground">Manage and monitor all registered endpoints</p></div>
        <Card><CardContent className="pt-6"><div className="grid gap-4 md:grid-cols-3">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>
          <Select value={osFilter} onValueChange={setOsFilter}><SelectTrigger><SelectValue placeholder="OS" /></SelectTrigger><SelectContent><SelectItem value="all">All OS</SelectItem><SelectItem value="windows">Windows</SelectItem><SelectItem value="linux">Linux</SelectItem><SelectItem value="macos">macOS</SelectItem></SelectContent></Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="online">Online</SelectItem><SelectItem value="offline">Offline</SelectItem></SelectContent></Select>
        </div></CardContent></Card>
        {loading ? <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div></div>
        : filtered.length === 0 ? <Card><CardContent className="py-12 text-center"><Server className="w-12 h-12 mx-auto mb-4 text-muted-foreground" /><p className="text-muted-foreground">{devices.length === 0 ? 'No devices registered' : 'No matches'}</p></CardContent></Card>
        : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{filtered.map(d => (
          <Link key={d.id} to={`/tenant/devices/${d.id}`}><Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader><div className="flex items-start justify-between"><div className="space-y-1"><div className="flex items-center gap-2"><Monitor className="w-4 h-4 text-primary" /><CardTitle className="text-lg">{d.device_name}</CardTitle></div><p className="text-sm text-muted-foreground capitalize">{d.os} {d.os_version}</p></div><Badge className={getStatusColor(d.status)}>{d.status}</Badge></div></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2"><Cpu className="w-4 h-4 text-muted-foreground" />CPU:</div><span className="text-right truncate">{d.cpu_model || 'N/A'}</span>
                <div className="flex items-center gap-2"><HardDrive className="w-4 h-4 text-muted-foreground" />RAM:</div><span className="text-right">{d.ram_gb ? `${d.ram_gb} GB` : 'N/A'}</span>
                <div className="flex items-center gap-2"><Server className="w-4 h-4 text-muted-foreground" />IP:</div><span className="text-right">{d.ip_address || 'N/A'}</span>
              </div>
              <div className="pt-2 border-t flex items-center justify-between"><span className="text-sm text-muted-foreground">Compliance</span><span className={`text-lg font-bold ${getCompColor(d.compliance_score)}`}>{d.compliance_score}%</span></div>
            </CardContent>
          </Card></Link>
        ))}</div>}
      </div>
    </TenantLayout>
  );
}
