import FilterPanel from "@/components/utils/FilterPanel";

export default function RecommendationLayout({
    children, // will be a page or nested layout
  }) {
    return (
      <div className="pt-16 p-2 flex w-full  gap-4">
        {children}
        <FilterPanel/>
      </div>
    )
  }