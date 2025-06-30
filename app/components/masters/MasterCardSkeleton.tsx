export default function MasterCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow">
      {/* Изображение */}
      <div className="relative h-48 animate-pulse bg-gray-200" />
      
      <div className="p-4 space-y-4">
        {/* Имя и рейтинг */}
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 rounded bg-gray-200" />
          <div className="flex items-center space-x-1">
            <div className="h-5 w-5 rounded bg-gray-200" />
            <div className="h-5 w-12 rounded bg-gray-200" />
          </div>
        </div>

        {/* Город */}
        <div className="h-4 w-24 rounded bg-gray-200" />

        {/* Описание */}
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-gray-200" />
          <div className="h-4 w-2/3 rounded bg-gray-200" />
        </div>

        {/* Услуги */}
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-6 w-24 rounded-full bg-gray-200"
            />
          ))}
        </div>
      </div>
    </div>
  );
} 