/**
 * Skeleton Loader Component
 *
 * Better loading experience than blank screens
 * Variants: text, title, avatar, card, custom
 */

export default function Skeleton({
  variant = "text",
  className = "",
  ...props
}) {
  const baseStyles = "skeleton";

  const variants = {
    text: "skeleton-text",
    title: "skeleton-title",
    avatar: "skeleton-avatar",
    card: "skeleton-card",
  };

  return (
    <div
      className={`${baseStyles} ${variants[variant] || ""} ${className}`}
      {...props}
    />
  );
}

/**
 * Skeleton Card - For memory/plan/journal cards
 */
export function SkeletonCard() {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton variant="avatar" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="title" />
          <Skeleton variant="text" className="w-3/4" />
        </div>
      </div>
      <Skeleton className="h-32 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}

/**
 * Skeleton List - For lists of items
 */
export function SkeletonList({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton Message - For chat messages
 */
export function SkeletonMessage() {
  return (
    <div className="flex items-start gap-3 p-4">
      <Skeleton variant="avatar" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" className="w-1/4" />
        <Skeleton variant="text" className="w-3/4" />
        <Skeleton variant="text" className="w-1/2" />
      </div>
    </div>
  );
}

/**
 * Skeleton Profile - For profile pages
 */
export function SkeletonProfile() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="w-20 h-20 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="title" />
          <Skeleton variant="text" className="w-1/2" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton variant="text" />
        <Skeleton variant="text" />
        <Skeleton variant="text" className="w-3/4" />
      </div>
    </div>
  );
}
