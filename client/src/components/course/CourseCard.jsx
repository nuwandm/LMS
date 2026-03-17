import { Link } from 'react-router-dom';
import { Star, Clock, Play, User } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const categoryColors = {
  'Web Development': 'bg-blue-600',
  'Mobile Development': 'bg-indigo-600',
  'Data Science': 'bg-purple-600',
  'Design': 'bg-pink-600',
  'Business': 'bg-emerald-600',
  'Marketing': 'bg-orange-600',
  'Photography': 'bg-yellow-600',
  'Music': 'bg-red-600',
  'Other': 'bg-slate-600',
};

const formatDuration = (minutes) => {
  if (!minutes) return '0h';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

const CourseCard = ({ course }) => {
  const catColor = categoryColors[course.category] || 'bg-slate-600';

  return (
    <Link to={`/courses/${course._id}`} className="block group">
      <Card className="overflow-hidden h-full flex flex-col hover:-translate-y-1 hover:shadow-md transition-all duration-300">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-slate-400 to-slate-600">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play className="w-16 h-16 text-white opacity-40" />
            </div>
          )}
          <span
            className={`absolute top-3 left-3 ${catColor}/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wide py-1 px-2.5 rounded-md`}
          >
            {course.category}
          </span>
        </div>

        {/* Content */}
        <CardContent className="p-5 flex flex-col flex-1">
          {/* Rating & Price */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-bold text-foreground ml-0.5">
                {course.rating?.toFixed(1) || '4.5'}
              </span>
              <span className="text-xs text-muted-foreground">
                ({course.enrollmentCount || 0})
              </span>
            </div>
            <span className="font-bold text-base">
              {course.price === 0 ? (
                <span className="text-emerald-600">Free</span>
              ) : (
                <span className="text-slate-800">${course.price.toFixed(2)}</span>
              )}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-foreground text-base leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {course.title}
          </h3>

          {/* Short Description */}
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">
            {course.shortDescription || course.description}
          </p>

          {/* Level Badge */}
          {course.level && (
            <div className="mb-3">
              <Badge variant="secondary" className="text-xs">{course.level}</Badge>
            </div>
          )}
        </CardContent>

        {/* Footer */}
        <CardFooter className="px-5 py-3 border-t bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <span className="truncate max-w-[100px]">
              {course.instructor?.name || 'Anonymous'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatDuration(course.totalDuration)}
            </span>
            <span className="flex items-center gap-1">
              <Play className="w-3.5 h-3.5" />
              {course.totalLectures || 0}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default CourseCard;
