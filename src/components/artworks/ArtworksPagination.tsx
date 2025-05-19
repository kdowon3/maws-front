
import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface ArtworksPaginationProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

const ArtworksPagination: React.FC<ArtworksPaginationProps> = ({
  currentPage,
  totalPages,
  setCurrentPage,
}) => {
  // 페이지 번호 배열 생성 - 현재 페이지 주변 페이지만 표시
  const getPageNumbers = () => {
    const delta = 1; // 현재 페이지 좌우로 표시할 페이지 수
    const range = [];
    
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }
    
    // 첫 페이지와 마지막 페이지는 항상 표시
    if (currentPage - delta > 2) {
      range.unshift("...");
    }
    
    if (currentPage + delta < totalPages - 1) {
      range.push("...");
    }
    
    range.unshift(1);
    if (totalPages > 1) {
      range.push(totalPages);
    }
    
    return range;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo(0, 0);
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div className="py-4 border-t flex justify-center">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(currentPage - 1);
              }}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          
          {getPageNumbers().map((pageNumber, index) => (
            <PaginationItem key={index}>
              {pageNumber === "..." ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(pageNumber as number);
                  }}
                  isActive={pageNumber === currentPage}
                >
                  {pageNumber}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(currentPage + 1);
              }}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default ArtworksPagination;
