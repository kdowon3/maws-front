import React from 'react';
import ArtworkForm from './ArtworkForm';

interface EditArtworkDialogProps {
    artwork: any;
    onSubmit: (data: any) => void;
    onClose: () => void;
    isLoading?: boolean;
    clients?: any[];
    artistList: string[];
}

const EditArtworkDialog: React.FC<EditArtworkDialogProps> = ({
    artwork,
    onSubmit,
    onClose,
    isLoading,
    clients,
    artistList,
}) => {
    // buyer 값을 항상 string(혹은 'none')으로 변환
    const defaultValues = {
        ...artwork,
        buyer:
            artwork.buyer !== null && artwork.buyer !== undefined && artwork.buyer !== ''
                ? String(artwork.buyer)
                : 'none',
    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">작품 정보 수정</h2>
                <ArtworkForm
                    onSubmit={onSubmit}
                    onCancel={onClose}
                    isLoading={isLoading}
                    defaultValues={defaultValues}
                    clients={clients}
                    artistList={artistList}
                    artworkId={artwork.id}
                />
            </div>
        </div>
    );
};

export default EditArtworkDialog;
