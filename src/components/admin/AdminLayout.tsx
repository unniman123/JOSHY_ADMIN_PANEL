import { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  FolderTree, 
  Map, 
  MessageSquare, 
  Settings, 
  LogOut,
  Palmtree,
  Mail,
  Phone,
  FileText
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { signOut } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const isInquiriesOpen = location.pathname.includes('/admin/inquiries');

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/admin/login');
      toast({
        title: 'Logged out',
        description: 'Successfully logged out',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to logout',
        variant: 'destructive',
      });
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Map, label: 'Tours', path: '/admin/tours' },
    { icon: FolderTree, label: 'Categories', path: '/admin/categories' },
    { icon: Palmtree, label: 'Day Out Packages', path: '/admin/day-out-packages' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];
  
  const inquiryItems = [
    { icon: FileText, label: 'Tour Inquiries', path: '/admin/inquiries/tours' },
    { icon: Palmtree, label: 'Day Out Inquiries', path: '/admin/inquiries/day-out' },
    { icon: Mail, label: 'Contact Inquiries', path: '/admin/inquiries/contact' },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Sidebar */}
      <aside className="w-64 shadow-sidebar bg-sidebar-background border-r border-sidebar-border">
        <div className="flex h-16 items-center border-b border-sidebar-border px-6 bg-gradient-primary">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Palmtree className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-sidebar-primary-foreground">Admin Panel</h1>
          </div>
        </div>
        <nav className="space-y-2 p-4 scrollbar-thin overflow-y-auto max-h-[calc(100vh-4rem)]">
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <div className={`sidebar-item rounded-lg transition-all duration-200 ${
                location.pathname === item.path ? 'active bg-sidebar-accent' : ''
              }`}>
                <Button
                  variant={location.pathname === item.path ? "secondary" : "ghost"}
                  className="w-full justify-start h-11 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Button>
              </div>
            </Link>
          ))}

          <Collapsible defaultOpen={isInquiriesOpen} className="space-y-2">
            <CollapsibleTrigger asChild>
              <div className={`sidebar-item rounded-lg transition-all duration-200 ${
                isInquiriesOpen ? 'bg-sidebar-accent' : ''
              }`}>
                <Button
                  variant={isInquiriesOpen ? "secondary" : "ghost"}
                  className="w-full justify-start h-11 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
                >
                  <MessageSquare className="mr-3 h-5 w-5" />
                  <span className="font-medium">Inquiries</span>
                  <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200" />
                </Button>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 pl-6">
              {inquiryItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  <div className={`sidebar-item rounded-lg transition-all duration-200 ${
                    location.pathname === item.path ? 'active bg-sidebar-accent/50' : ''
                  }`}>
                    <Button
                      variant={location.pathname === item.path ? "secondary" : "ghost"}
                      className="w-full justify-start text-sm h-9 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      {item.label}
                    </Button>
                  </div>
                </Link>
              ))}
            </CollapsibleContent>
          </Collapsible>

          <div className="pt-4 border-t border-sidebar-border">
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 h-11 transition-all duration-200"
              onClick={handleSignOut}
            >
              <LogOut className="mr-3 h-5 w-5" />
              <span className="font-medium">Logout</span>
            </Button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
          <div className="container mx-auto p-8 max-w-7xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
