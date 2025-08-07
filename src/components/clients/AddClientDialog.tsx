import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ClientForm from './ClientForm';
import type { DynamicClient } from '@/types/clients';

interface AddClientDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onClientAdded?: () => void;
}

export default function AddClientDialog({ open, onOpenChange, onClientAdded }: AddClientDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>고객 등록</DialogTitle>
                </DialogHeader>
                <ClientForm
                    onSubmit={async (data: DynamicClient | null) => {
                        if (data === null) {
                            onOpenChange(false);
                            return;
                        }
                        try {
                            // name, phone은 최상위, 나머지는 data로 묶기
                            const { name, phone, ...rest } = data;
                            const payload = {
                                name,
                                phone,
                                data: rest,
                            };
                            
                            console.log('전송할 데이터:', payload); // 디버깅용
                            
                            const { authenticatedFetch } = await import('@/utils/api');
                            const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/clients/`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(payload),
                            });
                            
                            if (!response.ok) {
                                const errorData = await response.json();
                                console.error('서버 에러:', errorData);
                                throw new Error(`서버 오류: ${response.status}`);
                            }
                            
                            const result = await response.json();
                            console.log('서버 응답:', result); // 디버깅용
                            
                            if (onClientAdded) onClientAdded();
                            onOpenChange(false);
                        } catch (error) {
                            console.error('고객 등록 실패:', error);
                            alert('고객 등록에 실패했습니다. 다시 시도해주세요.');
                        }
                    }}
                />
            </DialogContent>
        </Dialog>
    );
}
