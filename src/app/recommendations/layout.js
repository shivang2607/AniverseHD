import FilterPanel from "@/Components/utils/FilterPanel";

export default function RecommendationLayout({
    children, // will be a page or nested layout
  }) {
    return (
      <div className=" flex w-full gap-4">
        {children}
        <FilterPanel/>
      </div>
    )
  }