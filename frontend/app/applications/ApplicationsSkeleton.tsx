export default function ApplicationsSkeleton() {
  return (
    <div className="animate-pulse" aria-hidden="true">
      <div className="flex gap-2 mb-4">
        <div className="h-8 w-16 bg-gray-200 dark:bg-gray-800 rounded-lg" />
        <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg" />
      </div>
      <div className="flex gap-2 flex-wrap mb-3">
        {[16, 20, 24, 20, 16, 20].map((w, i) => (
          <div key={i} className={`h-7 bg-gray-200 dark:bg-gray-800 rounded-full`} style={{ width: `${w * 4}px` }} />
        ))}
      </div>
      <div className="flex gap-2 flex-wrap mb-6">
        {[24, 20, 28, 16].map((w, i) => (
          <div key={i} className={`h-7 bg-gray-200 dark:bg-gray-800 rounded-full`} style={{ width: `${w * 4}px` }} />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-36 bg-gray-200 dark:bg-gray-800 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
