import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Users, ClipboardCheck,
  BarChart2, Settings, GraduationCap, LogOut,
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/admin/dashboard' },
  { label: 'Courses', icon: BookOpen, to: '/admin/courses' },
  { label: 'Users', icon: Users, to: '/admin/users' },
  { label: 'Enrollments', icon: ClipboardCheck, to: '/admin/enrollments' },
  { label: 'Reports', icon: BarChart2, to: '/admin/reports' },
  { label: 'Settings', icon: Settings, to: '/admin/settings' },
];

export default function AdminLayout() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="flex w-64 flex-shrink-0 flex-col bg-[#1f4461] text-white">
        {/* Logo Area */}
        <div className="flex h-16 items-center gap-3 px-6 border-b border-[#2c5b80]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none tracking-tight">LearnHub</h1>
            <p className="text-xs font-medium text-slate-300 tracking-wider mt-0.5">ADMIN</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {navItems.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User Profile + Logout */}
        <div className="border-t border-[#2c5b80] p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 overflow-hidden rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-white">{user?.name || 'Admin'}</p>
              <p className="truncate text-xs text-slate-300">Super Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}
