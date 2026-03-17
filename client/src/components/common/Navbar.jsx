import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { GraduationCap, Search, Menu, LogOut, User } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    setMobileOpen(false);
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setMobileOpen(false);
    }
  };

  const navLinks =
    !isAuthenticated ? publicLinks
    : user?.role === 'student' ? studentLinks
    : user?.role === 'instructor' ? instructorLinks
    : user?.role === 'admin' ? adminLinks
    : publicLinks;

  const avatarLetter = user?.name?.charAt(0)?.toUpperCase() || '?';
  const profileLink = user?.role === 'student' ? '/student/profile' : null;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-slate-900 shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8 gap-6">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            Learn<span className="text-slate-300">Hub</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1 flex-shrink-0">
          {navLinks.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden lg:flex items-center relative flex-1 max-w-sm">
          <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus-visible:ring-white/30 h-9"
            placeholder="Search courses..."
          />
        </form>

        {/* Right Section */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2.5 h-auto px-3 py-1.5 hover:bg-white/10 text-white">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="bg-white/20 text-white text-xs font-bold">
                        {avatarLetter}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start leading-none">
                      <span className="text-sm font-semibold">{user?.name}</span>
                      <span className="text-[11px] text-slate-400 capitalize">{user?.role}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {profileLink && (
                    <DropdownMenuItem asChild>
                      <Link to={profileLink} className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/10" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button className="bg-white text-slate-900 hover:bg-slate-100 font-bold" asChild>
                <Link to="/register">Sign up free</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 bg-slate-900 border-slate-800">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-800">
                  <GraduationCap className="w-5 h-5 text-white" />
                  <span className="text-lg font-bold text-white">
                    Learn<span className="text-slate-400">Hub</span>
                  </span>
                </div>

                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="px-4 pt-4 pb-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <Input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus-visible:ring-white/30"
                      placeholder="Search courses..."
                    />
                  </div>
                </form>

                {/* Nav Links */}
                <nav className="flex-1 px-3 py-2 space-y-1">
                  {navLinks.map(({ label, to }) => (
                    <NavLink
                      key={to}
                      to={to}
                      end={to === '/'}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-white/15 text-white'
                            : 'text-slate-300 hover:bg-white/10 hover:text-white'
                        }`
                      }
                    >
                      {label}
                    </NavLink>
                  ))}
                </nav>

                <Separator className="bg-slate-800" />

                {/* User Section */}
                <div className="p-4 space-y-2">
                  {isAuthenticated ? (
                    <>
                      <div className="flex items-center gap-3 px-3 py-2">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user?.avatar} alt={user?.name} />
                          <AvatarFallback className="bg-white/20 text-white text-sm font-bold">
                            {avatarLetter}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold text-white">{user?.name}</p>
                          <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
                        </div>
                      </div>
                      {profileLink && (
                        <Link
                          to={profileLink}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                        >
                          <User className="w-4 h-4" /> My Profile
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-white/10 hover:text-red-300 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-white/10" asChild>
                        <Link to="/login" onClick={() => setMobileOpen(false)}>Log in</Link>
                      </Button>
                      <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold" asChild>
                        <Link to="/register" onClick={() => setMobileOpen(false)}>Sign up free</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
