import FilterPanel from "@/components/utils/FilterPanel";

export default function RecommendationLayout({
    children, // will be a page or nested layout
  }) {
    return (
      <div className=" flex w-full gap-4 md:pt-28 pt-20 z-0">
        {children}
        <FilterPanel/>
      </div>
    )
  }