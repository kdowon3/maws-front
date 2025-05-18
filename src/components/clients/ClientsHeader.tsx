
import React from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import ClientForm from "@/components/clients/ClientForm";

interface ClientsHeaderProps {
  isAddClientDialogOpen: boolean;
  setIsAddClientDialogOpen: (open: boolean) => void;
  handleAddClient: () => void;
}

const ClientsHeader: React.FC<ClientsHeaderProps> = ({ 
  isAddClientDialogOpen, 
  setIsAddClientDialogOpen, 
  handleAddClient 
}) => {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
      <h1 className="text-2xl font-bold text-gray-900">고객 관리</h1>
      
      <Dialog open={isAddClientDialogOpen} onOpenChange={setIsAddClientDialogOpen}>
        <DialogTrigger asChild>
          <Button className="flex items-center bg-brand-blue hover:bg-brand-lightBlue">
            <UserPlus size={18} className="mr-2" />
            고객 등록
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>신규 고객 등록</DialogTitle>
          </DialogHeader>
          <ClientForm onSubmit={handleAddClient} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientsHeader;
