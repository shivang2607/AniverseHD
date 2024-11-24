import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { MdOutlineNavigateNext, MdOutlineNavigateBefore } from "react-icons/md";

const Pagination = ({ totalPages,currentPage,setCurrentPage }) => {
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage+1);
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
        className="px-2 py-1 mx-4  text-primary-100 text-xl rounded disabled:text-gray-4000"
      >
        <FaChevronLeft/>
      </button>

      {/* Page Numbers */}
      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === "number" && handlePageChange(page)}
          disabled={page === "..."}
          className={`px-3 py-1 !mx-1 ${page === currentPage ? 'text-white bg-primary-100 font-bold rounded-full' : 'rounded-full text-gray-400'}`}
        >
          {page}
        </button>
      ))}

      {/* Next Button */}

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="px-2 py-1 !mx-4 text-primary-100 text-xl rounded disabled:text-gray-400"
      >
        <FaChevronRight/>
      </button>
    </div>
  );
};

export default Pagination;
