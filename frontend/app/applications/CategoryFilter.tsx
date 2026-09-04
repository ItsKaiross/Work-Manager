import { JobApplication } from "@/types/job_application";
import { CATEGORY_KEYWORDS, UNCATEGORIZED, getJobCategory } from "@/lib/jobCategories";

type Category = string | "all";

interface CategoryFilterProps {
  applications: JobApplication[];
  activeCategory: Category;
  onCategoryChange: (c: Category) => void;
}

const CATEGORIES: Category[] = ["all", ...Object.keys(CATEGORY_KEYWORDS), UNCATEGORIZED];

export default function CategoryFilter({ applications, activeCategory, onCategoryChange }: CategoryFilterProps) {
  const counts = applications.reduce<Record<string, number>>((acc, app) => {
    const category = getJobCategory(app);
    acc[category] = (acc[category] ?? 0) + 1;
    return acc;
  }, {});

  const visibleCategories = CATEGORIES.filter(
    (category) => category === "all" || (counts[category] ?? 0) > 0
  );

  return (
    <div className="mb-6">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">
        Category
      </h2>
      <div className="flex gap-2 flex-wrap">
        {visibleCategories.map((category) => {
          const count = category === "all" ? applications.length : counts[category] ?? 0;

          return (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`px-3 py-1.5 rounded-full text-sm transition ${
                activeCategory === category
                  ? "bg-purple-500 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {category === "all" ? "All Categories" : category} ({count})
            </button>
          );
        })}
      </div>
    </div>
  );
}
