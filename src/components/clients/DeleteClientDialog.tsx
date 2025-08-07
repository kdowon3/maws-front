import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { deleteClient } from '@/utils/api';

interface DeleteClientDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    client: any;
    onClientDeleted?: () => void;
}

export default function DeleteClientDialog({ open, onOpenChange, client, onClientDeleted }: DeleteClientDialogProps) {
    if (!client) return null;
    const handleDelete = async () => {
        console.log('DeleteClientDialog - 삭제 요청:', client);
        console.log('DeleteClientDialog - client.id:', client.id, 'type:', typeof client.id);
        
        // ID 유효성 검사 - 임시 생성된 고유 ID 체크
        if (!client.id) {
            console.error('ID가 없습니다:', client.id);
            alert('잘못된 고객 ID입니다.');
            return;
        }
        
        // 임시 생성된 ID (타임스탬프_인덱스_랜덤) 또는 old row 형식 체크
        if (typeof client.id === 'string' && (client.id.includes('_') || client.id.includes('row'))) {
            console.log('임시 ID 또는 old row ID이므로 서버 삭제 불가:', client.id);
            alert('이 고객은 아직 서버에 저장되지 않았거나 잘못된 형식입니다. 페이지를 새로고침 후 다시 시도해주세요.');
            return;
        }
        
        try {
            await deleteClient(client.id);
            console.log('삭제 성공');
            if (onClientDeleted) onClientDeleted();
            onOpenChange(false);
        } catch (error) {
            console.error('삭제 실패:', error);
            alert('고객 삭제에 실패했습니다. 페이지를 새로고침 후 다시 시도해주세요.');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>고객 삭제</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    정말 <b>{client.name}</b> 고객을 삭제하시겠습니까?
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        취소
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                        삭제
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
