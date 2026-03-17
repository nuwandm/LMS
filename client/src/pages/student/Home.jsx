import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Code, Palette, TrendingUp, Camera, Music, BarChart, ArrowRight, GraduationCap } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import CourseCard from '../../components/course/CourseCard';
import { getAllCourses } from '../../services/courseService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const categories = [
  { name: 'Web Development', icon: Code, count: '1,200+', color: 'text-blue-600', bg: 'bg-blue-50', hoverBg: 'hover:bg-blue-600' },
  { name: 'Design', icon: Palette, count: '850+', color: 'text-purple-600', bg: 'bg-purple-50', hoverBg: 'hover:bg-purple-600' },
  { name: 'Business', icon: TrendingUp, count: '650+', color: 'text-emerald-600', bg: 'bg-emerald-50', hoverBg: 'hover:bg-emerald-600' },
  { name: 'Photography', icon: Camera, count: '420+', color: 'text-orange-600', bg: 'bg-orange-50', hoverBg: 'hover:bg-orange-600' },
  { name: 'Music', icon: Music, count: '380+', color: 'text-pink-600', bg: 'bg-pink-50', hoverBg: 'hover:bg-pink-600' },
  { name: 'Data Science', icon: BarChart, count: '720+', color: 'text-indigo-600', bg: 'bg-indigo-50', hoverBg: 'hover:bg-indigo-600' },
];

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAllCourses({ limit: 8, sortBy: 'popular' })
      .then((res) => { if (res.success) setFeaturedCourses(res.data.courses); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-slate-900 py-20 lg:py-28 overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center px-6 text-center lg:px-8">
          <span className="mb-4 inline-flex items-center rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-xs font-medium text-slate-300">
            Over 50,000 New Courses Added
          </span>
          <h1 className="mb-6 max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            Learn Without Limits
          </h1>
          <p className="mb-10 max-w-2xl text-lg text-slate-300 sm:text-xl">
            Unlock your potential with expert-led courses in coding, design, business, and more.
          </p>

          {/* Search */}
          <div className="w-full max-w-2xl">
            <form onSubmit={handleSearch} className="relative flex items-center gap-2 bg-white rounded-xl p-2 shadow-xl">
              <Search className="absolute left-5 w-5 h-5 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-0 shadow-none pl-10 focus-visible:ring-0 text-base"
                placeholder="What do you want to learn today?"
              />
              <Button type="submit" className="rounded-lg">Search</Button>
            </form>
            <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
              <span>Popular:</span>
              {['Python', 'UX Design', 'Marketing'].map((topic) => (
                <Link
                  key={topic}
                  to={`/courses?search=${encodeURIComponent(topic.toLowerCase())}`}
                  className="hover:text-white underline underline-offset-4 transition-colors"
                >
                  {topic}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Top Categories</h2>
              <p className="mt-2 text-muted-foreground">Explore our most popular learning paths.</p>
            </div>
            <Button variant="ghost" size="sm" className="hidden sm:flex gap-1" asChild>
              <Link to="/courses">View all <ArrowRight className="w-4 h-4" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={`/courses?category=${encodeURIComponent(cat.name)}`}
                className="group flex items-start gap-4 rounded-xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div className={cn(
                  'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg transition-colors',
                  cat.bg, cat.color, 'group-hover:bg-slate-800 group-hover:text-white'
                )}>
                  <cat.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{cat.name}</h3>
                  <p className="text-sm text-muted-foreground">{cat.count} Courses</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* Featured Courses */}
      <section className="py-16 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Featured Courses</h2>
              <p className="mt-2 text-muted-foreground">Most popular courses this month</p>
            </div>
            <Button variant="ghost" size="sm" className="hidden sm:flex gap-1" asChild>
              <Link to="/courses">View all <ArrowRight className="w-4 h-4" /></Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-lg border bg-card overflow-hidden">
                  <Skeleton className="h-44 w-full rounded-none" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featuredCourses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-slate-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Learning?</h2>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            Join thousands of students already learning on LearnHub. Start your journey today!
          </p>
          <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 font-bold shadow-lg" asChild>
            <Link to="/register">Get Started for Free</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="w-7 h-7 text-slate-300" />
                <span className="text-lg font-bold text-white">LearnHub</span>
              </div>
              <p className="text-sm">Empowering learners worldwide with quality education.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/courses" className="hover:text-white transition-colors">Browse Courses</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Become a Student</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Become an Instructor</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <Separator className="bg-slate-800 mt-10 mb-6" />
          <div className="text-center text-sm">© 2026 LearnHub. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
