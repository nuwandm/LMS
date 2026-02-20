import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { GraduationCap, Search, Menu, X, LogOut, ChevronDown } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const studentLinks = [
  { label: 'Courses', to: '/courses' },
  { label: 'Dashboard', to: '/student/dashboard' },
  { label: 'My Learning', to: '/my-learning' },
];

const instructorLinks = [
  { label: 'Courses', to: '/courses' },
  { label: 'Dashboard', to: '/instructor/dashboard' },
];

const adminLinks = [
  { label: 'Courses', to: '/courses' },
  { label: 'Admin Panel', to: '/admin/dashboard' },
];

const publicLinks = [
  { label: 'Courses', to: '/courses' },
];

const Navbar = () => {
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    clearAuth();
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks =
    !isAuthenticated ? publicLinks
    : user?.role === 'student' ? studentLinks
    : user?.role === 'instructor' ? instructorLinks
    : user?.role === 'admin' ? adminLinks
    : publicLinks;

  const profileLink =
    user?.role === 'student' ? '/student/profile' : null;

  const avatarLetter = user?.name?.charAt(0)?.toUpperCase() || '?';

  const navLinkClass = ({ isActive }) =>
    `relative text-sm font-medium transition-colors pb-0.5 ${
      isActive
        ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-white after:rounded-full'
        : 'text-blue-200 hover:text-white'
    }`;

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#1e3a8a] shadow-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8 gap-6">

        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            Learn<span className="text-blue-300">Hub</span>
          </span>
        </Link>

        {/* ── Desktop Nav Links ── */}
        <div className="hidden md:flex items-center gap-6 flex-shrink-0">
          {navLinks.map(({ label, to }) => (
            <NavLink key={to} to={to} end={to === '/'} className={navLinkClass}>
              {label}
            </NavLink>
          ))}
        </div>

        {/* ── Search Bar ── */}
        <form
          onSubmit={handleSearch}
          className="hidden lg:flex items-center relative flex-1 max-w-sm"
        >
          <Search className="absolute left-3 w-4 h-4 text-blue-300 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-4 text-sm bg-white/10 border border-white/20 rounded-lg placeholder:text-blue-300 text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 transition-colors"
            placeholder="Search courses..."
          />
        </form>

        {/* ── Right Section ── */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-2">
              {/* Avatar + Name */}
              {profileLink ? (
                <Link
                  to={profileLink}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center flex-shrink-0">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-white text-xs font-bold">{avatarLetter}</span>
                    )}
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="text-sm font-semibold text-white">{user?.name}</span>
                    <span className="text-[11px] text-blue-300 capitalize mt-0.5">{user?.role}</span>
                  </div>
                </Link>
              ) : (
                <div className="flex items-center gap-2.5 px-3 py-1.5">
                  <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center flex-shrink-0">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-white text-xs font-bold">{avatarLetter}</span>
                    )}
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="text-sm font-semibold text-white">{user?.name}</span>
                    <span className="text-[11px] text-blue-300 capitalize mt-0.5">{user?.role}</span>
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className="w-px h-6 bg-white/20 mx-1" />

              {/* Logout */}
              <button
                onClick={handleLogout}
                title="Logout"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-blue-200 hover:text-white hover:bg-white/10 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden xl:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-white border border-white/30 rounded-lg hover:bg-white/10 hover:border-white/50 transition-all"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-bold text-primary-900 bg-white rounded-lg hover:bg-blue-50 shadow-sm transition-all"
              >
                Sign up free
              </Link>
            </div>
          )}

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#1a3578]">
          <div className="px-5 py-4 space-y-1">

            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-4 text-sm bg-white/10 border border-white/20 rounded-lg placeholder:text-blue-300 text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40"
                placeholder="Search courses..."
              />
            </form>

            {/* Mobile Nav Links */}
            {navLinks.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white/15 text-white font-semibold'
                      : 'text-blue-200 hover:bg-white/8 hover:text-white'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}

            {/* Mobile User Section */}
            {isAuthenticated ? (
              <div className="pt-3 mt-3 border-t border-white/10 space-y-1">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center flex-shrink-0">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-white text-sm font-bold">{avatarLetter}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{user?.name}</p>
                    <p className="text-xs text-blue-300 capitalize">{user?.role}</p>
                  </div>
                </div>
                {profileLink && (
                  <Link
                    to={profileLink}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-blue-200 hover:bg-white/8 hover:text-white transition-colors"
                  >
                    My Profile
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-200 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="pt-3 mt-3 border-t border-white/10 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-2.5 text-sm font-semibold text-white border border-white/30 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-2.5 text-sm font-bold text-primary-900 bg-white rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Sign up free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
