
import React from 'react';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

interface EntriesPaginationProps {
  currentPage: number;
  totalPages: number;
  goToPage: (page: number) => void;
}

const EntriesPagination: React.FC<EntriesPaginationProps> = ({
  currentPage,
  totalPages,
  goToPage
}) => {
  if (totalPages <= 1) return null;
  
  return (
    <div className="py-4 px-2 border-t">
      <Pagination>
        <PaginationContent>
          {currentPage < totalPages && (
            <PaginationItem>
              <PaginationNext onClick={() => goToPage(currentPage + 1)}>
                הקודם
              </PaginationNext>
            </PaginationItem>
          )}
          
          {currentPage < totalPages - 2 && totalPages > 1 && (
            <PaginationItem>
              <PaginationLink onClick={() => goToPage(totalPages)}>
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          )}
          
          {currentPage < totalPages - 3 && (
            <PaginationItem>
              <span className="px-2">...</span>
            </PaginationItem>
          )}
          
          {currentPage < totalPages && (
            <PaginationItem>
              <PaginationLink onClick={() => goToPage(currentPage + 1)}>
                {currentPage + 1}
              </PaginationLink>
            </PaginationItem>
          )}
          
          <PaginationItem>
            <PaginationLink isActive>{currentPage}</PaginationLink>
          </PaginationItem>
          
          {currentPage > 1 && (
            <PaginationItem>
              <PaginationLink onClick={() => goToPage(currentPage - 1)}>
                {currentPage - 1}
              </PaginationLink>
            </PaginationItem>
          )}
          
          {currentPage > 4 && (
            <PaginationItem>
              <span className="px-2">...</span>
            </PaginationItem>
          )}
          
          {currentPage > 3 && (
            <PaginationItem>
              <PaginationLink onClick={() => goToPage(1)}>1</PaginationLink>
            </PaginationItem>
          )}
          
          {currentPage > 1 && (
            <PaginationItem>
              <PaginationPrevious onClick={() => goToPage(currentPage - 1)}>
                הבא
              </PaginationPrevious>
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default EntriesPagination;
