import React from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ClientForm from '@/components/clients/ClientForm';

interface ClientsHeaderProps {
    isAddClientDialogOpen: boolean;
    setIsAddClientDialogOpen: (open: boolean) => void;
    handleAddClient: () => void;
    handleExcelUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ClientsHeader: React.FC = () => {
    return (
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">고객 관리</h1>
        </div>
    );
};

export default ClientsHeader;
