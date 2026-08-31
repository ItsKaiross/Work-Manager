export default function DetailSkeleton() {
  return (
    <div className="animate-pulse" aria-hidden="true">
      <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4" />
      <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-lg mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/2" />
          <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg" />
        </div>
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg" />
      </div>
    </div>
  );
}
