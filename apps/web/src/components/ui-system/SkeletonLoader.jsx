import { motion } from "framer-motion";

export function SkeletonCard({ className = "" }) {
  return (
    <div className={`glass rounded-2xl p-4 space-y-3 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-white/10 rounded animate-pulse w-3/4" />
          <div className="h-3 bg-white/10 rounded animate-pulse w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-white/10 rounded animate-pulse" />
        <div className="h-3 bg-white/10 rounded animate-pulse w-5/6" />
      </div>
    </div>
  );
}

export function SkeletonText({ lines = 3, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 bg-white/10 rounded animate-pulse"
          style={{ width: i === lines - 1 ? "60%" : "100%" }}
        />
      ))}
    </div>
  );
}

export function SkeletonImage({ className = "" }) {
  return (
    <div
      className={`bg-white/10 rounded-xl animate-pulse relative overflow-hidden ${className}`}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

export function SkeletonAvatar({ size = "md", className = "" }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-white/10 animate-pulse ${className}`}
    />
  );
}

export default function SkeletonLoader({
  type = "card",
  count = 1,
  className = "",
}) {
  const components = {
    card: SkeletonCard,
    text: SkeletonText,
    image: SkeletonImage,
    avatar: SkeletonAvatar,
  };

  const Component = components[type] || SkeletonCard;

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Component key={i} className={className} />
      ))}
    </>
  );
}
