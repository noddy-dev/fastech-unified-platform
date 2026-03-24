import { Shield, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface UnavailablePageProps {
  title: string;
}

export default function UnavailablePage({ title }: UnavailablePageProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardContent className="py-12 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 mx-auto text-warning" />
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="text-muted-foreground">
            Unavailable at the moment. Please contact{' '}
            <span className="font-semibold text-primary">Fastech IT Solutions</span>{' '}
            for more information.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
