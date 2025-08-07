import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface MessageClientDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    client: any;
    onSend?: (message: string) => void;
}

export default function MessageClientDialog({ open, onOpenChange, client, onSend }: MessageClientDialogProps) {
    const [message, setMessage] = useState('');
    if (!client) return null;
    const handleSend = () => {
        if (onSend) onSend(message);
        onOpenChange(false);
        setMessage('');
    };
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>메시지 보내기 - {client.name}</DialogTitle>
                </DialogHeader>
                <textarea
                    className="w-full h-24 px-3 py-2 border rounded-md mb-4"
                    placeholder="메시지 내용을 입력하세요"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        취소
                    </Button>
                    <Button onClick={handleSend} disabled={!message.trim()}>
                        전송
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
