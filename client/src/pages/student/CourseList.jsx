import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Grid3x3, List, SlidersHorizontal, BookOpen, X } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import CourseCard from '../../components/course/CourseCard';
import { getAllCourses } from '../../services/courseService';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import EmptyState from '../../components/common/EmptyState';

const CATEGORIES = [
  { name: 'Web Development', count: 120 },
  { name: 'Mobile Development', count: 45 },
  { name: 'Data Science', count: 32 },
  { name: 'Design', count: 88 },
  { name: 'Business', count: 65 },
  { name: 'Marketing', count: 42 },
  { name: 'Photography', count: 28 },
  { name: 'Music', count: 18 },
];

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
];

const CourseList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');

  const activeFiltersCount = selectedCategories.length + selectedLevels.length + (priceRange[1] < 500 ? 1 : 0);
  const searchQuery = searchParams.get('search');

  useEffect(() => { fetchCourses(); }, [selectedCategories, selectedLevels, priceRange, sortBy, page, searchParams]);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const params = { page, limit: 12, sortBy };
      if (searchQuery) params.search = searchQuery;
      const categoryParam = searchParams.get('category');
      if (categoryParam) params.category = categoryParam;
      else if (selectedCategories.length > 0) params.category = selectedCategories[0];
      if (selectedLevels.length > 0) params.level = selectedLevels[0];
      if (priceRange[0] > 0) params.minPrice = priceRange[0];
      if (priceRange[1] < 500) params.maxPrice = priceRange[1];
      const response = await getAllCourses(params);
      if (response.success) {
        setCourses(response.data.courses ?? []);
        setTotalPages(response.data.totalPages ?? 1);
        setTotalCourses(response.data.total ?? 0);
      }
    } catch {
      toast.error('Failed to load courses');
      setTotalCourses(0);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);
    setPage(1);
  };

  const toggleLevel = (level) => {
    setSelectedLevels((prev) => prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]);
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            {searchQuery ? `Results for "${searchQuery}"` : 'All Courses'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? 'Loading...' : totalCourses !== null ? `${totalCourses.toLocaleString()} courses available` : ''}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filter Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <Card className="sticky top-24">
              <CardHeader className="py-3 px-4 border-b flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold text-sm">Filters</span>
                  {activeFiltersCount > 0 && (
                    <Badge className="h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </div>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" className="h-auto py-0 px-1 text-xs gap-1" onClick={clearFilters}>
                    <X className="w-3 h-3" />Clear
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-4 space-y-5">
                {/* Categories */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Categories</p>
                  <div className="space-y-2.5">
                    {CATEGORIES.map((cat) => (
                      <div key={cat.name} className="flex items-center gap-2.5">
                        <Checkbox
                          id={`cat-${cat.name}`}
                          checked={selectedCategories.includes(cat.name)}
                          onCheckedChange={() => toggleCategory(cat.name)}
                        />
                        <Label htmlFor={`cat-${cat.name}`} className="flex-1 text-sm font-normal cursor-pointer">
                          {cat.name}
                        </Label>
                        <span className="text-xs text-muted-foreground">{cat.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Level */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Level</p>
                  <div className="space-y-2.5">
                    {LEVELS.map((level) => (
                      <div key={level} className="flex items-center gap-2.5">
                        <Checkbox
                          id={`lvl-${level}`}
                          checked={selectedLevels.includes(level)}
                          onCheckedChange={() => toggleLevel(level)}
                        />
                        <Label htmlFor={`lvl-${level}`} className="text-sm font-normal cursor-pointer">{level}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Price */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price</p>
                    <span className="text-xs font-semibold text-foreground">
                      ${priceRange[0]} – ${priceRange[1] === 500 ? '500+' : priceRange[1]}
                    </span>
                  </div>
                  <input
                    type="range" min="0" max="500" value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-foreground"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                    <span>$0</span><span>$500+</span>
                  </div>
                </div>

                <Button onClick={fetchCourses} className="w-full" size="sm">Apply Filters</Button>
              </CardContent>
            </Card>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* Sort & View Bar */}
            <div className="flex items-center justify-between gap-4 mb-4 bg-card border rounded-lg px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort:</span>
                <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
                  <SelectTrigger className="h-8 w-auto border-0 shadow-none p-0 text-sm font-semibold focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-1 bg-muted p-1 rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3x3 className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Active filter chips */}
            {(selectedCategories.length > 0 || selectedLevels.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {[...selectedCategories.map((c) => ({ label: c, remove: () => toggleCategory(c) })),
                  ...selectedLevels.map((l) => ({ label: l, remove: () => toggleLevel(l) }))].map(({ label, remove }) => (
                  <Badge key={label} variant="secondary" className="gap-1 pr-1">
                    {label}
                    <button onClick={remove} className="ml-1 hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-44 w-full rounded-none" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : courses.length === 0 ? (
              <Card>
                <EmptyState
                  icon={BookOpen}
                  title="No courses found"
                  description={activeFiltersCount > 0
                    ? 'Try adjusting your filters to see more results.'
                    : 'No courses available yet. Check back soon!'}
                  action={activeFiltersCount > 0 && (
                    <Button variant="outline" onClick={clearFilters}>Clear all filters</Button>
                  )}
                />
              </Card>
            ) : (
              <div className={viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'
                : 'flex flex-col gap-4'}>
                {courses.map((course) => <CourseCard key={course._id} course={course} />)}
              </div>
            )}

            {/* Pagination */}
            {!isLoading && courses.length > 0 && totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => goToPage(page - 1)} disabled={page === 1}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    let p;
                    if (totalPages <= 5) p = i + 1;
                    else if (page <= 3) p = i + 1;
                    else if (page >= totalPages - 2) p = totalPages - 4 + i;
                    else p = page - 2 + i;
                    return (
                      <Button
                        key={i}
                        variant={page === p ? 'default' : 'outline'}
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => goToPage(p)}
                      >
                        {p}
                      </Button>
                    );
                  })}
                  <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => goToPage(page + 1)} disabled={page === totalPages}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 LearnHub. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default CourseList;
