"use client";

import React, { useState, useEffect } from 'react';

// Pagination component interface
interface PaginationProps {
    currentPage: number;       // Current active page
    totalPages: number;        // Total number of pages
    onPageChange: (page: number) => void;  // Function to call when page changes
    maxPagesToShow?: number;   // Optional: Maximum page numbers to display at once
    showFirstLast?: boolean;   // Optional: Whether to always show first/last page buttons
    className?: string;        // Optional: Additional CSS classes
  }
  
  // Interface for paginated data handling
  interface PaginationState<T> {
    items: T[];                // The full array of items
    currentPage: number;       // Current page being viewed
    itemsPerPage: number;      // Number of items to show per page
    totalItems: number;        // Total count of all items (may differ from items.length for API pagination)
  }
  
  // Helper interface for working with paginated API responses
  interface PaginatedResponse<T> {
    data: T[];                 // The items for the current page
    meta: {
      currentPage: number;     // Current page number
      totalPages: number;      // Total number of pages
      itemsPerPage: number;    // Items per page
      totalItems: number;      // Total number of items across all pages
    };
  }
  
  // Pagination component
  const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    maxPagesToShow = 5,
    showFirstLast = true,
    className = '',
  }) => {
    // Generate page numbers to display
    const getPageNumbers = () => {
      if (totalPages <= 1) return [];
      
      const pages: (number | string)[] = [];
      
      // Always include first page if option is enabled
      if (showFirstLast) {
        pages.push(1);
      }
      
      // Calculate start and end of the displayed pages
      let startPage = Math.max(showFirstLast ? 2 : 1, currentPage - Math.floor((maxPagesToShow - (showFirstLast ? 2 : 0)) / 2));
      let endPage = Math.min(totalPages - (showFirstLast ? 1 : 0), startPage + (maxPagesToShow - (showFirstLast ? 2 : 0) - 1));
      
      // Adjust start if we're near the end
      if (endPage - startPage < maxPagesToShow - (showFirstLast ? 2 : 0) - 1) {
        startPage = Math.max(showFirstLast ? 2 : 1, endPage - (maxPagesToShow - (showFirstLast ? 2 : 0) - 1));
      }
      
      // Add ellipsis after first page if needed
      if (showFirstLast && startPage > 2) {
        pages.push('...');
      } else if (!showFirstLast && startPage > 1) {
        pages.push('...');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (showFirstLast && endPage < totalPages - 1) {
        pages.push('...');
      } else if (!showFirstLast && endPage < totalPages) {
        pages.push('...');
      }
      
      // Always include last page if option is enabled
      if (showFirstLast && totalPages > 1) {
        pages.push(totalPages);
      }
      
      return pages;
    };
    
    // If there's only one page, don't show pagination
    if (totalPages <= 1) return null;
    
    const pageNumbers = getPageNumbers();
    
    return (
      <div className={`flex justify-center items-center mt-6 ${className}`}>
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded-md text-sm mr-2 ${
            currentPage === 1
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gray-700 text-white hover:bg-gray-600'
          }`}
          aria-label="Previous page"
        >
          Previous
        </button>
        
        <div className="flex space-x-1">
          {pageNumbers.map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' ? onPageChange(page) : null}
              className={`w-8 h-8 flex items-center justify-center rounded-md text-sm ${
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : page === '...'
                  ? 'bg-transparent text-gray-400 cursor-default'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
              aria-label={page === '...' ? 'More pages' : `Page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded-md text-sm ml-2 ${
            currentPage === totalPages
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gray-700 text-white hover:bg-gray-600'
          }`}
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    );
  };
  
  // Helper hooks for working with pagination
  export const usePagination = <T,>(items: T[], itemsPerPage: number): [
    T[],                                // currentItems
    number,                            // currentPage
    (page: number) => void,            // setPage
    number,                            // totalPages
    PaginationState<T>                 // full pagination state
  ] => {
    const [paginationState, setPaginationState] = useState<PaginationState<T>>({
      items,
      currentPage: 1,
      itemsPerPage,
      totalItems: items.length
    });
    
    // Update state if items change
    useEffect(() => {
      setPaginationState(prev => ({
        ...prev,
        items,
        totalItems: items.length
      }));
    }, [items]);
    
    // Calculate total pages
    const totalPages = Math.ceil(paginationState.totalItems / paginationState.itemsPerPage);
    
    // Get current items
    const indexOfLastItem = paginationState.currentPage * paginationState.itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - paginationState.itemsPerPage;
    const currentItems = paginationState.items.slice(indexOfFirstItem, indexOfLastItem);
    
    // Change page
    const setPage = (pageNumber: number) => {
      setPaginationState((prev: any)  => ({
        ...prev,
        currentPage: pageNumber
      }));
    };
    
    return [
      currentItems,
      paginationState.currentPage,
      setPage,
      totalPages,
      paginationState
    ];
  };
  
  export default Pagination;