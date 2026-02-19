import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Code, Palette, TrendingUp, Camera, Music, BarChart, ArrowRight, School } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import { getAllCourses } from '../../services/courseService';
import toast from 'react-hot-toast';

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedCourses();
  }, []);

  const fetchFeaturedCourses = async () => {
    try {
      const response = await getAllCourses({ limit: 8, sortBy: 'popular' });
      if (response.success) {
        setFeaturedCourses(response.data.courses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const categories = [
    {
      name: 'Web Development',
      icon: Code,
      count: '1,200+',
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      hoverBg: 'group-hover:bg-blue-600',
    },
    {
      name: 'Design',
      icon: Palette,
      count: '850+',
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      hoverBg: 'group-hover:bg-purple-600',
    },
    {
      name: 'Business',
      icon: TrendingUp,
      count: '650+',
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      hoverBg: 'group-hover:bg-green-600',
    },
    {
      name: 'Photography',
      icon: Camera,
      count: '420+',
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      hoverBg: 'group-hover:bg-orange-600',
    },
    {
      name: 'Music',
      icon: Music,
      count: '380+',
      color: 'pink',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
      hoverBg: 'group-hover:bg-pink-600',
    },
    {
      name: 'Data Science',
      icon: BarChart,
      count: '720+',
      color: 'indigo',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      hoverBg: 'group-hover:bg-indigo-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 to-primary-800 py-20 lg:py-28 overflow-hidden">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative mx-auto flex max-w-7xl flex-col items-center px-6 text-center lg:px-8">
          <span className="mb-4 inline-flex items-center rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-200 ring-1 ring-inset ring-blue-500/20">
            Over 50,000 New Courses Added
          </span>
          <h1 className="mb-6 max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            Learn Without Limits
          </h1>
          <p className="mb-10 max-w-2xl text-lg text-blue-100 sm:text-xl">
            Unlock your potential with expert-led courses in coding, design, business, and more.
            Start your journey today.
          </p>

          {/* Search Bar */}
          <div className="w-full max-w-2xl">
            <form onSubmit={handleSearch} className="relative flex items-center">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full rounded-xl border-0 bg-white py-4 pl-12 pr-32 text-gray-900 shadow-xl placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-400 sm:text-sm"
                placeholder="What do you want to learn today?"
              />
              <div className="absolute right-2 top-2 bottom-2">
                <button
                  type="submit"
                  className="h-full rounded-lg bg-primary-600 px-6 text-sm font-bold text-white hover:bg-primary-700 transition-colors"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Popular Topics */}
            <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-blue-200/80">
              <span>Popular:</span>
              <Link
                to="/courses?search=python"
                className="hover:text-white underline decoration-blue-400/50 hover:decoration-white underline-offset-4 transition-all"
              >
                Python
              </Link>
              <Link
                to="/courses?search=ux+design"
                className="hover:text-white underline decoration-blue-400/50 hover:decoration-white underline-offset-4 transition-all"
              >
                UX Design
              </Link>
              <Link
                to="/courses?search=marketing"
                className="hover:text-white underline decoration-blue-400/50 hover:decoration-white underline-offset-4 transition-all"
              >
                Marketing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Top Categories Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Top Categories
              </h2>
              <p className="mt-2 text-gray-500">Explore our most popular learning paths.</p>
            </div>
            <Link
              to="/courses"
              className="hidden text-sm font-semibold text-primary-600 hover:text-primary-700 sm:flex items-center gap-1"
            >
              View all categories <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/courses?category=${encodeURIComponent(category.name)}`}
                className="group relative flex flex-col items-start gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg ${category.bgColor} ${category.textColor} ${category.hoverBg} group-hover:text-white transition-colors`}
                >
                  <category.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500">{category.count} Courses</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Featured Courses
              </h2>
              <p className="mt-2 text-gray-500">Most popular courses this month</p>
            </div>
            <Link
              to="/courses"
              className="hidden text-sm font-semibold text-primary-600 hover:text-primary-700 sm:flex items-center gap-1"
            >
              View all courses <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse"
                >
                  <div className="h-48 bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredCourses.map((course) => (
                <Link
                  key={course._id}
                  to={`/courses/${course._id}`}
                  className="group bg-white rounded-xl shadow-sm overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="relative h-48 bg-gradient-to-br from-primary-400 to-primary-600 overflow-hidden">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-white">
                        <Code className="w-16 h-16 opacity-50" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
                      <span className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full font-medium">
                        {course.category}
                      </span>
                      <span>{course.level}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">{course.instructor?.name}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">
                        ${course.price.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {course.totalLectures} lectures
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students already learning on LearnHub. Start your journey today!
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-primary-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <School className="w-8 h-8 text-primary-400" />
                <span className="text-lg font-bold text-white">LearnHub</span>
              </div>
              <p className="text-sm">
                Empowering learners worldwide with quality education.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/courses" className="hover:text-white">Browse Courses</Link></li>
                <li><Link to="/register" className="hover:text-white">Become a Student</Link></li>
                <li><Link to="/register" className="hover:text-white">Become an Instructor</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm">
            © 2026 LearnHub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
