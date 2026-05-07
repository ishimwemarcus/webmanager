import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pageNumbers = [];
  const maxVisiblePages = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = startPage + maxVisiblePages - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex items-center justify-center space-x-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 h-8 rounded-md text-sm font-medium transition-colors border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 hover:scale-105 flex items-center justify-center"
      >
        Previous
      </button>

      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-3 py-1 rounded-md text-sm font-medium transition-colors border border-white/10 hover:bg-white/10"
          >
            1
          </button>
          {startPage > 2 && <span className="px-2 text-white/50">...</span>}
        </>
      )}

      {pageNumbers.map((number) => {
        const isActive = currentPage === number;
        
        if (isActive) {
          return (
            <button
              key={number}
              onClick={() => onPageChange(number)}
              className="relative inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-md p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 transition-all hover:scale-105"
            >
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,#d4af37_50%,transparent_100%)]" />
              <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-md bg-navy-950 px-3 py-1 text-sm font-bold text-[#d4af37] backdrop-blur-3xl z-10 border border-white/10">
                {number}
              </span>
            </button>
          );
        }

        return (
          <button
            key={number}
            onClick={() => onPageChange(number)}
            className="px-3 py-1 rounded-md text-sm font-medium transition-colors border border-white/10 hover:bg-white/10 h-8 w-8 flex items-center justify-center hover:scale-105"
          >
            {number}
          </button>
        );
      })}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="px-2 text-white/50">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-1 rounded-md text-sm font-medium transition-colors border border-white/10 hover:bg-white/10"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 h-8 rounded-md text-sm font-medium transition-colors border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 hover:scale-105 flex items-center justify-center"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
