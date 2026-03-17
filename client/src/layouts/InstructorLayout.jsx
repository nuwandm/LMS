import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookMarked, PlusCircle, Users,
  DollarSign, GraduationCap, LogOut, Bell, Menu,
} from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../store/authStore';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/instructor/dashboard', end: true },
  { label: 'My Courses', icon: BookMarked, to: '/instructor/courses', end: true },
  { label: 'Create Course', icon: PlusCircle, to: '/instructor/courses/create', end: true },
  { label: 'Students', icon: Users, to: '/instructor/students' },
  { label: 'Earnings', icon: DollarSign, to: '/instructor/earnings' },
];

const pageTitles = {
  '/instructor/dashboard': 'Dashboard',
  '/instructor/courses': 'My Courses',
  '/instructor/courses/create': 'Create Course',
  '/instructor/students': 'Students',
  '/instructor/earnings': 'Earnings',
};

function SidebarContent({ user, onLogout }) {
  const avatarLetter = user?.name?.charAt(0)?.toUpperCase() || 'I';

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 px-6 border-b border-slate-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-base font-bold tracking-tight">LearnHub</h1>
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 py-4 px-3">
        <nav className="space-y-1">
          {navItems.map(({ label, icon: Icon, to, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
      </ScrollArea>

      {/* User Footer */}
      <Separator className="bg-slate-800" />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="bg-white/20 text-white text-xs font-semibold">
                {avatarLetter}
              </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-400 rounded-full border-2 border-slate-900" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-white">{user?.name || 'Instructor'}</p>
            <p className="truncate text-xs text-slate-400">Instructor</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function InstructorLayout() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const pageTitle =
    Object.entries(pageTitles).find(([path]) =>
      location.pathname.startsWith(path) && path !== '/instructor/courses'
    )?.[1] ||
    pageTitles[location.pathname] ||
    'Instructor Panel';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 flex-shrink-0 flex-col">
        <SidebarContent user={user} onLogout={handleLogout} />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b bg-background px-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-60 p-0">
                <SidebarContent user={user} onLogout={() => { handleLogout(); setMobileOpen(false); }} />
              </SheetContent>
            </Sheet>
            <h2 className="text-xl font-bold text-foreground">{pageTitle}</h2>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative text-muted-foreground">
              <Bell className="w-5 h-5" />
            </Button>
            <span className="hidden sm:block text-sm text-muted-foreground">
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-muted/30">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
