import { ReactNode, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, Building2, Users, Shield, LogOut, User,
  ChevronDown, Activity, Globe, Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';

interface SuperAdminLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/superadmin/dashboard', icon: LayoutDashboard },
  { name: 'Tenants', href: '/superadmin/tenants', icon: Building2 },
  { name: 'MSPs', href: '/superadmin/msps', icon: Globe },
  { name: 'Users', href: '/superadmin/users', icon: Users },
  { name: 'Patch Management', href: '/superadmin/patches', icon: Shield },
  { name: 'Audit Logs', href: '/superadmin/audit', icon: Activity },
];

export function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-sidebar border-r border-sidebar-border">
        <div className="flex items-center gap-2 h-16 px-6 border-b border-sidebar-border">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-sidebar-primary text-sidebar-primary-foreground">
            <Shield className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-sidebar-foreground">Fastech IT Solutions</span>
            <span className="text-xs text-sidebar-foreground/60">Super Admin</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    active
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="text-xs text-sidebar-foreground/60">
            © 2026 Fastech IT Solutions
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:pl-64">
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <div className="flex items-center gap-2 h-16 px-6 border-b">
                    <Shield className="w-5 h-5 text-primary" />
                    <span className="font-bold">Fastech</span>
                  </div>
                  <nav className="py-4 px-3 space-y-1">
                    {navigation.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link key={item.name} to={item.href} onClick={() => setMobileMenuOpen(false)}
                          className={cn('flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                            isActive(item.href) ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'
                          )}>
                          <Icon className="w-5 h-5 shrink-0" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </nav>
                </SheetContent>
              </Sheet>
              <h2 className="text-lg font-semibold lg:hidden">Fastech</h2>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                  <User className="w-4 h-4 mr-2" />
                  <span className="hidden md:inline">{profile?.email || 'Super Admin'}</span>
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{profile?.email}</span>
                    <span className="text-xs text-muted-foreground">Super Administrator</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 container py-6 px-4">{children}</main>
      </div>
    </div>
  );
}
