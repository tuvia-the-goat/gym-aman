// src/components/EntriesHistory/EntriesPagination.tsx

import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface EntriesPaginationProps {
  currentPage: number;
  totalPages: number;
  goToPage: (page: number) => void;
}

const EntriesPagination: React.FC<EntriesPaginationProps> = ({
  currentPage,
  totalPages,
  goToPage,
}) => {
  if (totalPages <= 1) return null;

  // Create a function to render page links
  const renderPageLinks = () => {
    const links = [];

    // Always show first page
    if (currentPage > 2) {
      links.push(
        <PaginationItem key="first">
          <PaginationLink onClick={() => goToPage(1)}>1</PaginationLink>
        </PaginationItem>
      );
    }

    // Show ellipsis if needed
    if (currentPage > 3) {
      links.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Show previous page if it exists
    if (currentPage > 1) {
      links.push(
        <PaginationItem key={currentPage - 1}>
          <PaginationLink onClick={() => goToPage(currentPage - 1)}>
            {currentPage - 1}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Current page
    links.push(
      <PaginationItem key={currentPage}>
        <PaginationLink isActive onClick={() => goToPage(currentPage)}>
          {currentPage}
        </PaginationLink>
      </PaginationItem>
    );

    // Show next page if it exists
    if (currentPage < totalPages) {
      links.push(
        <PaginationItem key={currentPage + 1}>
          <PaginationLink onClick={() => goToPage(currentPage + 1)}>
            {currentPage + 1}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
      links.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Always show last page
    if (currentPage < totalPages - 1) {
      links.push(
        <PaginationItem key="last">
          <PaginationLink onClick={() => goToPage(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return links;
  };

  return (
    <Pagination>
      <PaginationContent>
        {/* Previous button */}
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationPrevious onClick={() => goToPage(currentPage - 1)} />
          </PaginationItem>
        )}

        {/* Page numbers */}
        {renderPageLinks()}

        {/* Next button */}
        {currentPage < totalPages && (
          <PaginationItem>
            <PaginationNext onClick={() => goToPage(currentPage + 1)} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};

export default EntriesPagination;
