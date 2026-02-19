import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { School, Search, ShoppingCart, Menu, X, User, LogOut } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const Navbar = () => {
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="flex items-center justify-center text-primary-600">
            <School className="w-9 h-9" />
          </div>
          <span className="text-xl font-bold tracking-tight text-primary-600">
            LearnHub
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            to="/courses"
            className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
          >
            Courses
          </Link>
          {isAuthenticated && user?.role === 'student' && (
            <Link
              to="/my-learning"
              className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
            >
              My Learning
            </Link>
          )}
          {isAuthenticated && user?.role === 'instructor' && (
            <Link
              to="/instructor/dashboard"
              className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
            >
              Dashboard
            </Link>
          )}
          {isAuthenticated && user?.role === 'admin' && (
            <Link
              to="/admin/dashboard"
              className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
            >
              Admin
            </Link>
          )}
        </div>

        {/* Search Bar (Desktop) */}
        <form onSubmit={handleSearch} className="hidden lg:flex items-center relative w-64">
          <Search className="absolute left-3 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-primary-500/20 placeholder:text-gray-400"
            placeholder="Search courses..."
          />
        </form>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Cart Icon (if needed) */}
          {/* <button className="text-gray-500 hover:text-primary-600 transition-colors">
            <ShoppingCart className="w-5 h-5" />
          </button> */}

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-3 pl-3 border-l border-gray-200">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-gray-900">{user?.name}</span>
                  <span className="text-xs text-gray-500 capitalize">{user?.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="hidden rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary-600 hover:border-primary-200 transition-all md:block"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary-600/20 hover:bg-primary-700 hover:shadow-primary-600/30 transition-all"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-gray-900"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-6 py-4 space-y-3">
            {/* Search (Mobile) */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 placeholder:text-gray-400"
                placeholder="Search courses..."
              />
            </form>

            {/* Mobile Nav Links */}
            <Link
              to="/courses"
              className="block py-2 text-sm font-medium text-gray-600 hover:text-primary-600"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Courses
            </Link>
            {isAuthenticated && user?.role === 'student' && (
              <Link
                to="/my-learning"
                className="block py-2 text-sm font-medium text-gray-600 hover:text-primary-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Learning
              </Link>
            )}
            {isAuthenticated && user?.role === 'instructor' && (
              <Link
                to="/instructor/dashboard"
                className="block py-2 text-sm font-medium text-gray-600 hover:text-primary-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
            {isAuthenticated && user?.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                className="block py-2 text-sm font-medium text-gray-600 hover:text-primary-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Admin
              </Link>
            )}

            {isAuthenticated && (
              <>
                <div className="pt-3 border-t border-gray-200">
                  <div className="text-sm font-semibold text-gray-900">{user?.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-sm font-medium text-red-600 hover:text-red-700 text-left"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
