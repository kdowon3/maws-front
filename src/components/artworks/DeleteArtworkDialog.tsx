import React from 'react';
import { Button } from '@/components/ui/button';

interface DeleteArtworkDialogProps {
    artwork: any;
    onDelete: () => void;
    onClose: () => void;
    isLoading?: boolean;
}

const DeleteArtworkDialog: React.FC<DeleteArtworkDialogProps> = ({ artwork, onDelete, onClose, isLoading }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
                <h2 className="text-lg font-bold mb-4">작품 삭제</h2>
                <p className="mb-6">
                    정말로 <b>{artwork.title}</b> 작품을 삭제하시겠습니까?
                </p>
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        취소
                    </Button>
                    <Button variant="destructive" onClick={onDelete} disabled={isLoading}>
                        삭제
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DeleteArtworkDialog;
