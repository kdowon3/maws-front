
import React from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ArtworksHeaderProps {
  isAddArtworkDialogOpen: boolean;
  setIsAddArtworkDialogOpen: (open: boolean) => void;
  handleAddArtwork: () => void;
}

const ArtworksHeader: React.FC<ArtworksHeaderProps> = ({
  isAddArtworkDialogOpen,
  setIsAddArtworkDialogOpen,
  handleAddArtwork,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">작품 관리</h1>
        <p className="text-gray-500 mt-1">
          전시 및 판매 작품을 관리하고 보증서를 발급하세요
        </p>
      </div>
      
      <Dialog open={isAddArtworkDialogOpen} onOpenChange={setIsAddArtworkDialogOpen}>
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2">
            <PlusCircle size={18} />
            <span>신규 작품 등록</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>신규 작품 등록</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* 작품 등록 폼을 여기에 추가할 수 있습니다 */}
            <p>작품 등록 폼 (추후 구현)</p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsAddArtworkDialogOpen(false)}
            >
              취소
            </Button>
            <Button onClick={handleAddArtwork}>등록</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ArtworksHeader;
