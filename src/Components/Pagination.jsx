import React, { useEffect, useState } from 'react';

const Pagination = ({ totalPages, pageSize, setOffset }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setOffset((page-1)*pageSize);
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setOffset((currentPage-2)*pageSize)
      setCurrentPage(currentPage-1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      console.log("hhh1",currentPage,(currentPage)*pageSize)
      setOffset((currentPage)*pageSize)
      setCurrentPage(prev=>prev+1);
    }
  };

  useEffect(()=>{
    console.log("current",currentPage);
  },[currentPage]);

  // Function to determine which page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];

    if (totalPages <= 3) {
      // If total pages are 3 or less, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show pagination with ellipsis
      if (currentPage <= 2) {
        pageNumbers.push(1, 2, 3, '...');
      } else if (currentPage >= totalPages - 1) {
        pageNumbers.push('...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pageNumbers.push('...', currentPage - 1, currentPage, currentPage + 1, '...');
      }
    }

    return pageNumbers;
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Previous button */}
      <button
        onClick={handlePrev}
        disabled={currentPage === 1}
        className="px-2 py-1 border rounded disabled:opacity-50"
      >
        Prev
      </button>

      {/* Page numbers */}
      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && handlePageChange(page)}
          className={`px-2 py-1 border rounded ${
            page === currentPage ? 'bg-blue-500 text-white' : 'bg-white'
          }`}
          disabled={page === '...'}
        >
          {page}
        </button>
      ))}

      {/* Next button */}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="px-2 py-1 border rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
