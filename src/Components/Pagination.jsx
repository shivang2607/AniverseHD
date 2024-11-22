import React, { useEffect, useState } from "react";
import { MdOutlineNavigateNext, MdOutlineNavigateBefore } from "react-icons/md";

const Pagination = ({ totalPages, pageSize, setOffset }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setOffset((page - 1) * pageSize);
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setOffset((currentPage - 2) * pageSize);
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setOffset(currentPage * pageSize);
      setCurrentPage((prev) => prev + 1);
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];

    if (totalPages <= 5) {
      // Show all pages if total pages are 5 or less
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Dynamic pagination with ellipses
      if (currentPage <= 3) {
        pageNumbers.push(1, 2, 3, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pageNumbers.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }

    return pageNumbers;
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      {/* Previous Button */}

      <button
        onClick={handlePrev}
        disabled={currentPage === 1}
        className="px-2 border rounded-md bg-gray-700 text-white hover:bg-gray-800 disabled:opacity-50"
      >
        <MdOutlineNavigateBefore size={24} color="white" />
      </button>

      {/* Page Numbers */}
      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === "number" && handlePageChange(page)}
          disabled={page === "..."}
          className={`px-2 border rounded-md ${
            page === currentPage
              ? "bg-blue-500 text-white"
              : "bg-gray-100 hover:bg-gray-200 text-black"
          } ${
            page === "..." ? "cursor-default text-gray-500" : "cursor-pointer"
          }`}
        >
          {page}
        </button>
      ))}

      {/* Next Button */}

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="px-2 border rounded-md bg-gray-700 text-white hover:bg-gray-800 disabled:opacity-50"
      >
        <MdOutlineNavigateNext size={24} color="white" />
      </button>
    </div>
  );
};

export default Pagination;
