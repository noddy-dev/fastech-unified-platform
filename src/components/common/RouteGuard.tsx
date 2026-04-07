import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface RouteGuardProps {
  children: React.ReactNode;
}

const PUBLIC_ROUTES = ['/login', '/signup', '/403', '/404'];

const ROLE_ROUTE_MAP: Record<string, string[]> = {
  super_admin: ['/superadmin/', '/msp/', '/tenant/'],
  msp_admin: ['/msp/', '/tenant/'],
  tenant_admin: ['/tenant/'],
  tenant_user: ['/tenant/'],
  client: ['/tenant/'],
};

function matchPublicRoute(path: string, patterns: string[]) {
  return patterns.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
      return regex.test(path);
    }
    return path === pattern;
  });
}

function isRouteAllowedForRole(path: string, role: string | null): boolean {
  if (!role) return false;
  const allowed = ROLE_ROUTE_MAP[role];
  if (!allowed) return false;
  return allowed.some(prefix => path.startsWith(prefix));
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

    if (user && profile) {
      // Role-based redirect from root
      if (location.pathname === '/') {
        switch (profile.role) {
          case 'super_admin':
            navigate('/superadmin/dashboard', { replace: true });
            break;
          case 'msp_admin':
            navigate('/msp/dashboard', { replace: true });
            break;
          default:
            navigate('/tenant/dashboard', { replace: true });
            break;
        }
        return;
      }

      // Block access to routes not allowed for the user's role
      if (!isPublic && !isRouteAllowedForRole(location.pathname, profile.role)) {
        navigate('/tenant/dashboard', { replace: true });
        return;
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
