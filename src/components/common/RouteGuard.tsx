import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface RouteGuardProps {
  children: React.ReactNode;
}

const PUBLIC_ROUTES = ['/login', '/signup', '/403', '/404'];

function matchPublicRoute(path: string, patterns: string[]) {
  return patterns.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
      return regex.test(path);
    }
    return path === pattern;
  });
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    const isPublic = matchPublicRoute(location.pathname, PUBLIC_ROUTES);

    if (!user && !isPublic) {
      navigate('/login', { state: { from: location.pathname }, replace: true });
      return;
    }

    // Role-based redirect after login
    if (user && profile && location.pathname === '/') {
      switch (profile.role) {
        case 'super_admin':
          navigate('/superadmin/dashboard', { replace: true });
          break;
        case 'msp_admin':
          navigate('/msp/dashboard', { replace: true });
          break;
        case 'tenant_admin':
        case 'tenant_user':
        case 'client':
          navigate('/tenant/dashboard', { replace: true });
          break;
        default:
          navigate('/tenant/dashboard', { replace: true });
          break;
      }
    }
  }, [user, profile, loading, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
