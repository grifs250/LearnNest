export default function CategoryLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-base-300 rounded w-1/3"></div>
          <div className="mt-2 h-4 bg-base-300 rounded w-2/3"></div>
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card bg-base-200 shadow-md">
              <div className="card-body p-6">
                <div className="h-6 bg-base-300 rounded w-3/4"></div>
                <div className="mt-2 h-4 bg-base-300 rounded w-full"></div>
                <div className="mt-2 h-4 bg-base-300 rounded w-2/3"></div>
                <div className="mt-4 flex items-center">
                  <div className="h-4 bg-base-300 rounded w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 