import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Grid3x3, List, ChevronDown,
  SlidersHorizontal, BookOpen, X,
} from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import CourseCard from '../../components/course/CourseCard';
import { getAllCourses } from '../../services/courseService';
import toast from 'react-hot-toast';

const CourseList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(null); // null = not yet loaded

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');

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

  const activeFiltersCount =
    selectedCategories.length + selectedLevels.length + (priceRange[1] < 500 ? 1 : 0);

  useEffect(() => {
    fetchCourses();
  }, [selectedCategories, selectedLevels, priceRange, sortBy, page, searchParams]);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const params = { page, limit: 12, sortBy };

      const searchQuery = searchParams.get('search');
      if (searchQuery) params.search = searchQuery;

      const categoryParam = searchParams.get('category');
      if (categoryParam) {
        params.category = categoryParam;
      } else if (selectedCategories.length > 0) {
        params.category = selectedCategories[0];
      }

      if (selectedLevels.length > 0) params.level = selectedLevels[0];
      if (priceRange[0] > 0) params.minPrice = priceRange[0];
      if (priceRange[1] < 500) params.maxPrice = priceRange[1];

      const response = await getAllCourses(params);

      if (response.success) {
        setCourses(response.data.courses ?? []);
        setTotalPages(response.data.totalPages ?? 1);
        setTotalCourses(response.data.total ?? 0);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
      setTotalCourses(0);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
    setPage(1);
  };

  const toggleLevel = (level) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedLevels([]);
    setPriceRange([0, 500]);
    setPage(1);
    setSearchParams({});
  };

  const goToPage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setPage(pageNum);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const searchQuery = searchParams.get('search');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8 w-full">
        {/* Page Title Row */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {searchQuery ? `Results for "${searchQuery}"` : 'All Courses'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isLoading
              ? 'Loading courses...'
              : totalCourses === null
              ? ''
              : `${totalCourses.toLocaleString()} ${totalCourses === 1 ? 'course' : 'courses'} available`}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm sticky top-24 overflow-hidden">
              {/* Filter Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-gray-600" />
                  <h3 className="font-semibold text-sm text-gray-900">Filters</h3>
                  {activeFiltersCount > 0 && (
                    <span className="bg-primary-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"
                  >
                    <X className="w-3 h-3" />
                    Clear
                  </button>
                )}
              </div>

              <div className="p-5 space-y-6">
                {/* Categories */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Categories
                  </h4>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label
                        key={category.name}
                        className="flex items-center gap-3 cursor-pointer group py-0.5"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.name)}
                          onChange={() => toggleCategory(category.name)}
                          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500/20 cursor-pointer"
                        />
                        <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors flex-1 leading-none">
                          {category.name}
                        </span>
                        <span className="text-xs text-gray-400 tabular-nums">{category.count}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Level */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Level
                  </h4>
                  <div className="space-y-2">
                    {levels.map((level) => (
                      <label key={level} className="flex items-center gap-3 cursor-pointer group py-0.5">
                        <input
                          type="checkbox"
                          checked={selectedLevels.includes(level)}
                          onChange={() => toggleLevel(level)}
                          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500/20 cursor-pointer"
                        />
                        <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors leading-none">
                          {level}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Price Range */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Price
                    </h4>
                    <span className="text-xs font-semibold text-primary-600">
                      ${priceRange[0]} – ${priceRange[1] === 500 ? '500+' : priceRange[1]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1.5">
                    <span>$0</span>
                    <span>$500+</span>
                  </div>
                </div>

                {/* Apply Button */}
                <button
                  onClick={fetchCourses}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </aside>

          {/* Right Content */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* Sort & View Bar */}
            <div className="flex items-center justify-between gap-4 mb-5 bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                    className="appearance-none bg-transparent text-sm font-semibold text-gray-800 pr-5 cursor-pointer border-none focus:ring-0 focus:outline-none"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white shadow-sm text-primary-600'
                      : 'text-gray-400 hover:text-gray-700'
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === 'list'
                      ? 'bg-white shadow-sm text-primary-600'
                      : 'text-gray-400 hover:text-gray-700'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Active filter chips */}
            {(selectedCategories.length > 0 || selectedLevels.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCategories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 text-xs font-medium px-3 py-1 rounded-full border border-primary-100"
                  >
                    {cat}
                    <button onClick={() => toggleCategory(cat)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {selectedLevels.map((lvl) => (
                  <span
                    key={lvl}
                    className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 text-xs font-medium px-3 py-1 rounded-full border border-primary-100"
                  >
                    {lvl}
                    <button onClick={() => toggleLevel(lvl)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Course Grid / Loading / Empty */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                    <div className="h-44 bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                      <div className="h-3 bg-gray-200 rounded w-full" />
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200 py-20 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No courses found</h3>
                <p className="text-sm text-gray-500 mb-5 max-w-xs">
                  {activeFiltersCount > 0
                    ? 'Try adjusting your filters or clearing them to see more results.'
                    : 'No courses are available yet. Check back soon!'}
                </p>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm font-semibold text-primary-600 hover:text-primary-700 underline underline-offset-2"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'
                    : 'flex flex-col gap-4'
                }
              >
                {courses.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!isLoading && courses.length > 0 && totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center gap-1">
                  <button
                    onClick={() => goToPage(page - 1)}
                    disabled={page === 1}
                    className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (page <= 3) pageNum = i + 1;
                    else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = page - 2 + i;

                    return (
                      <button
                        key={i}
                        onClick={() => goToPage(pageNum)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                          page === pageNum
                            ? 'bg-primary-600 text-white shadow-sm'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {totalPages > 5 && page < totalPages - 2 && (
                    <>
                      <span className="text-gray-400 px-1">…</span>
                      <button
                        onClick={() => goToPage(totalPages)}
                        className="w-9 h-9 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => goToPage(page + 1)}
                    disabled={page === totalPages}
                    className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center text-sm text-gray-400">
          © 2026 LearnHub. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default CourseList;
