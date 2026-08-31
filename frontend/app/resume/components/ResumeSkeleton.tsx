export default function ResumeSkeleton() {
  return (
    <div className="animate-pulse" aria-hidden="true">
      <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4" />
      <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg" />
        </div>
        <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-lg" />
      </div>
    </div>
  );
}
