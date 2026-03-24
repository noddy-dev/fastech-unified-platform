import { TenantLayout } from '@/components/layouts/TenantLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function AIInsightsPage() {
  return (
    <TenantLayout>
      <div className="space-y-6">
        <div><h1 className="text-3xl font-bold">AI Insights & Automation</h1><p className="text-muted-foreground">AI-powered monitoring, predictive patching, and script generation</p></div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardHeader><div className="flex items-center gap-2"><Zap className="w-5 h-5 text-primary" /><CardTitle>Agentic AI</CardTitle></div></CardHeader><CardContent><p className="text-sm text-muted-foreground mb-4">Autonomous monitoring, anomaly detection, and predictive patching.</p><Badge variant="outline"><Lock className="w-3 h-3 mr-1" />Requires AI Subscription</Badge></CardContent></Card>
          <Card><CardHeader><div className="flex items-center gap-2"><Zap className="w-5 h-5 text-secondary" /><CardTitle>AI Copilot</CardTitle></div></CardHeader><CardContent><p className="text-sm text-muted-foreground mb-4">Generate scripts from plain English. Automate tasks with AI.</p><Badge variant="outline"><Lock className="w-3 h-3 mr-1" />Requires AI Subscription</Badge></CardContent></Card>
          <Card><CardHeader><div className="flex items-center gap-2"><Zap className="w-5 h-5 text-warning" /><CardTitle>Smart Alerts</CardTitle></div></CardHeader><CardContent><p className="text-sm text-muted-foreground mb-4">AI-generated alerts for anomalies, CVE risks, and patching needs.</p><Badge variant="outline"><Lock className="w-3 h-3 mr-1" />Requires AI Subscription</Badge></CardContent></Card>
        </div>
        <Card><CardContent className="py-8 text-center"><p className="text-muted-foreground">AI features require an active subscription. Contact Fastech IT Solutions to enable.</p><Button className="mt-4" variant="outline">Contact Sales</Button></CardContent></Card>
      </div>
    </TenantLayout>
  );
}
