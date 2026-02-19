import { Link } from 'react-router-dom';
import { Star, Clock, Play, User } from 'lucide-react';

const CourseCard = ({ course }) => {
  // Category color mapping
  const getCategoryColor = (category) => {
    const colors = {
      'Web Development': 'bg-blue-600',
      'Mobile Development': 'bg-indigo-600',
      'Data Science': 'bg-purple-600',
      'Design': 'bg-pink-600',
      'Business': 'bg-green-600',
      'Marketing': 'bg-orange-600',
      'Photography': 'bg-yellow-600',
      'Music': 'bg-red-600',
      'Other': 'bg-gray-600',
    };
    return colors[category] || 'bg-primary-600';
  };

  // Format duration (assuming it's in minutes)
  const formatDuration = (minutes) => {
    if (!minutes) return '0h';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <Link
      to={`/courses/${course._id}`}
      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden group hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary-400 to-primary-600">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="w-16 h-16 text-white opacity-50" />
          </div>
        )}
        <span
          className={`absolute top-3 left-3 ${getCategoryColor(course.category)}/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wide py-1 px-2.5 rounded-md shadow-sm`}
        >
          {course.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Rating & Price */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1 text-amber-400">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-bold text-gray-900 ml-1">
              {course.rating?.toFixed(1) || '4.5'}
            </span>
            <span className="text-xs text-gray-400 font-normal">
              ({course.enrollmentCount || 0})
            </span>
          </div>
          <span className="text-orange-600 font-bold text-lg">
            {course.price === 0 ? (
              <span className="text-emerald-600">Free</span>
            ) : (
              `$${course.price.toFixed(2)}`
            )}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
          {course.title}
        </h3>

        {/* Short Description */}
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
          {course.shortDescription || course.description}
        </p>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <User className="w-4 h-4" />
            <span className="truncate max-w-[100px]">
              {course.instructor?.name || 'Anonymous'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDuration(course.totalDuration)}
            </span>
            <span className="flex items-center gap-1">
              <Play className="w-4 h-4" />
              {course.totalLectures || 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
