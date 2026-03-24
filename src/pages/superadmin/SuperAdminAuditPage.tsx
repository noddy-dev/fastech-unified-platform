import { useEffect, useState } from 'react';
import { SuperAdminLayout } from '@/components/layouts/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllAuditLogs } from '@/db/api';
import type { AuditLog } from '@/types/types';
import { Activity } from 'lucide-react';

export default function SuperAdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllAuditLogs(200).then(setLogs).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div><h1 className="text-3xl font-bold">Audit Logs</h1><p className="text-muted-foreground">Complete platform activity log</p></div>

        {loading ? (
          <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div></div>
        ) : logs.length === 0 ? (
          <Card><CardContent className="py-12 text-center"><Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" /><p className="text-muted-foreground">No audit logs yet</p></CardContent></Card>
        ) : (
          <Card>
            <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg text-sm">
                    <Activity className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{log.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.resource_type && `${log.resource_type} • `}
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </SuperAdminLayout>
  );
}
