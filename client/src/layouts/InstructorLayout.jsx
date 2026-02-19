import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookMarked, PlusCircle, Users,
  DollarSign, Settings, GraduationCap, Bell, LogOut,
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/instructor/dashboard', end: true },
  { label: 'My Courses', icon: BookMarked, to: '/instructor/courses', end: true },
  { label: 'Create Course', icon: PlusCircle, to: '/instructor/courses/create', end: true },
  { label: 'Students', icon: Users, to: '/instructor/students' },
  { label: 'Earnings', icon: DollarSign, to: '/instructor/earnings' },
];

const pageTitles = {
  '/instructor/dashboard': 'Instructor Dashboard',
  '/instructor/courses': 'My Courses',
  '/instructor/courses/create': 'Create New Course',
  '/instructor/students': 'Students',
  '/instructor/earnings': 'Earnings',
};

export default function InstructorLayout() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const pageTitle =
    Object.entries(pageTitles).find(([path]) => location.pathname.startsWith(path) && path !== '/instructor/courses')?.[1] ||
    pageTitles[location.pathname] ||
    'Instructor Panel';

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col bg-[#14396b] text-white">
        {/* Logo */}
        <div className="h-16 flex items-center gap-2 px-6 border-b border-white/10">
          <GraduationCap className="w-7 h-7 text-white" />
          <h1 className="text-xl font-bold tracking-tight">LearnHub</h1>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-4 mt-2 flex-1">
          {navItems.map(({ label, icon: Icon, to, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Settings + Profile */}
        <div className="p-4 border-t border-white/10">
          <NavLink
            to="/instructor/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-2 ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span>Settings</span>
          </NavLink>

          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-black/20">
            <div className="relative flex-shrink-0">
              <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-2 border-white/20">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-white font-semibold text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'I'}
                  </span>
                )}
              </div>
              <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-400 rounded-full border border-[#14396b]" />
            </div>
            <div className="flex flex-col overflow-hidden flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-white">{user?.name || 'Instructor'}</p>
              <p className="text-xs text-white/50 truncate">Instructor</p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="text-white/50 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-800">{pageTitle}</h2>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 hover:text-[#14396b] transition-colors rounded-full hover:bg-gray-100">
              <Bell className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-500 font-medium">
              {new Date().toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
