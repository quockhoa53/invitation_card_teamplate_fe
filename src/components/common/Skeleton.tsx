import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * Base primitive Skeleton component with smooth shimmer gradient effect
 */
export const Skeleton: React.FC<SkeletonProps> = ({ className = '', ...props }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className={`animate-pulse rounded-xl ${
        isDark
          ? 'bg-slate-800/70 border border-slate-700/30'
          : 'bg-stone-200/80 border border-stone-300/40'
      } ${className}`}
      {...props}
    />
  );
};

/**
 * Template Card Skeleton - matches TemplateCardItem in Home / TemplatesCatalog
 */
export const TemplateCardSkeleton: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className={`p-4 sm:p-4.5 rounded-3xl border flex flex-col justify-between space-y-3.5 ${
        isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200 shadow-sm'
      }`}
    >
      {/* Thumbnail */}
      <Skeleton className="w-full aspect-[16/11] rounded-2xl" />

      {/* Content */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20 rounded-full" />
          <Skeleton className="h-4 w-12 rounded-full" />
        </div>
        <Skeleton className="h-5 w-4/5 rounded-lg" />
        <Skeleton className="h-4 w-3/5 rounded-lg" />
      </div>

      {/* Footer Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/40">
        <Skeleton className="h-8 flex-1 rounded-xl" />
        <Skeleton className="h-8 flex-1 rounded-xl" />
      </div>
    </div>
  );
};

/**
 * User Card Skeleton - matches user's invitation card items in Dashboard
 */
export const UserCardSkeleton: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className={`rounded-3xl border p-5 flex flex-col justify-between space-y-4 shadow-sm ${
        isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200'
      }`}
    >
      {/* Thumbnail */}
      <Skeleton className="w-full aspect-[16/9] rounded-2xl" />

      {/* Info */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-3/4 rounded-lg" />
          <Skeleton className="h-4 w-14 rounded-full" />
        </div>
        <Skeleton className="h-3 w-1/2 rounded" />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/40">
        <Skeleton className="h-9 flex-1 rounded-xl" />
        <Skeleton className="h-9 w-10 rounded-xl" />
        <Skeleton className="h-9 w-10 rounded-xl" />
      </div>
    </div>
  );
};

/**
 * Table Rows Skeleton - reusable for table loading across Dashboard & Admin
 */
export const TableRowSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 6 }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-stone-100'}`}>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr key={rIdx} className="animate-pulse">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <td key={cIdx} className="py-4 px-4">
              <Skeleton
                className={`h-4 rounded ${
                  cIdx === 0 ? 'w-24' : cIdx === 1 ? 'w-36' : cIdx === cols - 1 ? 'w-16 ml-auto' : 'w-20'
                }`}
              />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
};

/**
 * Stats Card Skeleton - for AdminStatsPage top KPI metrics
 */
export const StatsCardSkeleton: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className={`p-6 rounded-3xl border space-y-3 ${
            isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-24 rounded" />
            <Skeleton className="w-8 h-8 rounded-xl" />
          </div>
          <Skeleton className="h-8 w-28 rounded-xl" />
          <Skeleton className="h-3.5 w-20 rounded" />
        </div>
      ))}
    </div>
  );
};
