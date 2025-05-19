
import React from "react";
import { Pencil, Trash2, FileText, AlertCircle } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Artwork } from "@/data/artworksData";
import { formatCurrency } from "@/utils/currencyUtils";

interface ArtworksTableProps {
  artworks: Artwork[];
  handleArtworkAction: (actionType: "edit" | "delete" | "certificate", artwork: Artwork) => void;
}

const ArtworksTable: React.FC<ArtworksTableProps> = ({ artworks, handleArtworkAction }) => {
  return (
    <div className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">작품명</TableHead>
            <TableHead>작가명</TableHead>
            <TableHead>제작 연도</TableHead>
            <TableHead>크기</TableHead>
            <TableHead>재료</TableHead>
            <TableHead className="text-right">가격</TableHead>
            <TableHead>보증서 발행일</TableHead>
            <TableHead>구매자</TableHead>
            <TableHead className="text-center">작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {artworks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-10 text-gray-500">
                조회된 작품이 없습니다.
              </TableCell>
            </TableRow>
          ) : (
            artworks.map((artwork) => (
              <TableRow key={artwork.id}>
                <TableCell className="font-medium">{artwork.title}</TableCell>
                <TableCell>{artwork.artist}</TableCell>
                <TableCell>{artwork.year}</TableCell>
                <TableCell>{artwork.dimensions}</TableCell>
                <TableCell>{artwork.medium}</TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(artwork.price)}
                </TableCell>
                <TableCell>
                  {artwork.certificateIssueDate ? 
                    new Date(artwork.certificateIssueDate).toLocaleDateString('ko-KR') : 
                    '미발급'
                  }
                </TableCell>
                <TableCell>
                  {artwork.buyerName ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      {artwork.buyerName}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                      미지정
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex justify-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleArtworkAction("edit", artwork)}
                    >
                      <Pencil size={18} className="text-gray-500" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleArtworkAction("delete", artwork)}
                    >
                      <Trash2 size={18} className="text-gray-500" />
                    </Button>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleArtworkAction("certificate", artwork)}
                            className={artwork.buyerId && !artwork.hasMissingFields ? "text-[#1A2A68]" : "text-gray-400"}
                            disabled={!artwork.buyerId || artwork.hasMissingFields}
                          >
                            <div className="relative">
                              <FileText size={18} className="text-inherit" />
                              {artwork.hasMissingFields && (
                                <AlertCircle size={12} className="absolute -top-1 -right-1 text-amber-500" />
                              )}
                            </div>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {!artwork.buyerId ? 
                            "구매자 정보가 필요합니다" : 
                            artwork.hasMissingFields ? 
                            "필수 필드가 누락되었습니다" : 
                            "보증서 발급하기"
                          }
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ArtworksTable;
