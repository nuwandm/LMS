import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Grid3x3, List, ChevronDown } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import CourseCard from '../../components/course/CourseCard';
import { getAllCourses } from '../../services/courseService';
import toast from 'react-hot-toast';

const CourseList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  // Available options
  const categories = [
    { name: 'Web Development', count: 120 },
    { name: 'Mobile Development', count: 45 },
    { name: 'Data Science', count: 32 },
    { name: 'Design', count: 88 },
    { name: 'Business', count: 65 },
    { name: 'Marketing', count: 42 },
    { name: 'Photography', count: 28 },
    { name: 'Music', count: 18 },
  ];

  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
  ];

  // Fetch courses when filters change
  useEffect(() => {
    fetchCourses();
  }, [selectedCategories, selectedLevels, priceRange, sortBy, page, searchParams]);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);

      // Build query params
      const params = {
        page,
        limit: 12,
        sortBy,
      };

      // Add search from URL params
      const searchQuery = searchParams.get('search');
      if (searchQuery) params.search = searchQuery;

      // Add category from URL params or selected filters
      const categoryParam = searchParams.get('category');
      if (categoryParam) {
        params.category = categoryParam;
      } else if (selectedCategories.length > 0) {
        params.category = selectedCategories[0]; // Backend supports single category
      }

      // Add level filter
      if (selectedLevels.length > 0) {
        params.level = selectedLevels[0]; // Backend supports single level
      }

      // Add price range
      if (priceRange[0] > 0) params.minPrice = priceRange[0];
      if (priceRange[1] < 500) params.maxPrice = priceRange[1];

      const response = await getAllCourses(params);

      if (response.success) {
        setCourses(response.data.courses);
        setTotalPages(response.data.totalPages);
        setTotalCourses(response.data.total);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle category checkbox
  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
    setPage(1); // Reset to first page
  };

  // Handle level checkbox
  const toggleLevel = (level) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
    setPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedLevels([]);
    setPriceRange([0, 500]);
    setPage(1);
    setSearchParams({}); // Clear URL params
  };

  // Handle pagination
  const goToPage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setPage(pageNum);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Page Header */}
      <header className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">All Courses</h1>
              <p className="text-gray-500 text-sm font-medium">
                {isLoading ? 'Loading...' : `Showing ${totalCourses} courses`}
                {searchParams.get('search') && ` for "${searchParams.get('search')}"`}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-6 lg:px-8 py-8 w-full">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-[280px] flex-shrink-0">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-xs font-semibold text-primary-600 hover:underline"
                >
                  Clear All
                </button>
              </div>

              {/* Categories */}
              <div className="space-y-3 mb-8">
                <h4 className="font-semibold text-sm text-gray-900 mb-2">Categories</h4>
                {categories.map((category) => (
                  <label
                    key={category.name}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.name)}
                      onChange={() => toggleCategory(category.name)}
                      className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500/20"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-primary-600 transition-colors flex-1">
                      {category.name}
                    </span>
                    <span className="text-xs text-gray-400">({category.count})</span>
                  </label>
                ))}
              </div>

              <hr className="border-gray-100 my-6" />

              {/* Level */}
              <div className="space-y-3 mb-8">
                <h4 className="font-semibold text-sm text-gray-900 mb-2">Level</h4>
                {levels.map((level) => (
                  <label key={level} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedLevels.includes(level)}
                      onChange={() => toggleLevel(level)}
                      className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500/20"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-primary-600 transition-colors">
                      {level}
                    </span>
                  </label>
                ))}
              </div>

              {/* Price Range */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-gray-900">Price</h4>
                  <span className="text-xs font-medium text-primary-600">
                    ${priceRange[0]} - ${priceRange[1]}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>$0</span>
                  <span>$500+</span>
                </div>
              </div>

              {/* Apply Button */}
              <button
                onClick={fetchCourses}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                Apply Filters
              </button>
            </div>
          </aside>

          {/* Right Content */}
          <div className="flex-1 flex flex-col">
            {/* Sort Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">Sort by:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setPage(1);
                    }}
                    className="appearance-none bg-transparent text-sm font-semibold text-gray-900 hover:text-primary-600 pr-6 cursor-pointer border-none focus:ring-0"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white shadow-sm text-primary-600'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === 'list'
                      ? 'bg-white shadow-sm text-primary-600'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Course Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                      <div className="h-3 bg-gray-200 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <p className="text-gray-500 text-lg mb-2">No courses found</p>
                <p className="text-gray-400 text-sm mb-4">
                  Try adjusting your filters or search terms
                </p>
                <button
                  onClick={clearFilters}
                  className="text-primary-600 hover:text-primary-700 font-semibold"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12'
                    : 'flex flex-col gap-4 mb-12'
                }
              >
                {courses.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!isLoading && courses.length > 0 && totalPages > 1 && (
              <div className="mt-auto flex justify-center w-full">
                <nav className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(page - 1)}
                    disabled={page === 1}
                    className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => goToPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium text-sm transition-colors ${
                          page === pageNum
                            ? 'bg-primary-600 text-white shadow-sm'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-primary-600'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {totalPages > 5 && page < totalPages - 2 && (
                    <>
                      <span className="text-gray-400 px-2">...</span>
                      <button
                        onClick={() => goToPage(totalPages)}
                        className="w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-primary-600 font-medium text-sm transition-colors"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => goToPage(page + 1)}
                    disabled={page === totalPages}
                    className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center text-sm text-gray-500">
          <p>© 2026 LearnHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default CourseList;
