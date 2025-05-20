import React from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { artistList } from '@/data/artworksData';

interface ArtworksHeaderProps {
    isAddArtworkDialogOpen: boolean;
    setIsAddArtworkDialogOpen: (open: boolean) => void;
    handleAddArtwork: (data: any) => void;
}

const ArtworksHeader: React.FC<ArtworksHeaderProps> = ({
    isAddArtworkDialogOpen,
    setIsAddArtworkDialogOpen,
    handleAddArtwork,
}) => {
    const { register, handleSubmit, reset, setValue, watch } = useForm();

    const onSubmit = (data: any) => {
        handleAddArtwork(data);
        reset();
        setIsAddArtworkDialogOpen(false);
    };

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">작품 관리</h1>
                <p className="text-gray-500 mt-1">전시 및 판매 작품을 관리하고 보증서를 발급하세요</p>
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
                    <form className="grid gap-4 py-4" onSubmit={handleSubmit(onSubmit)}>
                        <div>
                            <Label htmlFor="title">작품명</Label>
                            <Input
                                id="title"
                                {...register('title', { required: true })}
                                placeholder="작품명을 입력하세요"
                            />
                        </div>
                        <div>
                            <Label htmlFor="artist">작가명</Label>
                            <Select onValueChange={(value) => setValue('artist', value)}>
                                <SelectTrigger id="artist">
                                    <SelectValue placeholder="작가를 선택하세요" />
                                </SelectTrigger>
                                <SelectContent>
                                    {artistList.map((artist) => (
                                        <SelectItem key={artist} value={artist}>
                                            {artist}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label htmlFor="year">제작연도</Label>
                                <Input
                                    id="year"
                                    type="number"
                                    {...register('year', { required: true })}
                                    placeholder="예: 2024"
                                />
                            </div>
                            <div>
                                <Label htmlFor="dimensions">크기</Label>
                                <Input
                                    id="dimensions"
                                    {...register('dimensions', { required: true })}
                                    placeholder="예: 100 x 80 cm"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label htmlFor="medium">재료</Label>
                                <Input
                                    id="medium"
                                    {...register('medium', { required: true })}
                                    placeholder="예: 캔버스에 유채"
                                />
                            </div>
                            <div>
                                <Label htmlFor="price">가격(원)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    {...register('price', { required: true })}
                                    placeholder="예: 5000000"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="description">설명</Label>
                            <Textarea
                                id="description"
                                {...register('description')}
                                placeholder="작품 설명을 입력하세요"
                            />
                        </div>
                        <div>
                            <Label htmlFor="image">이미지 업로드</Label>
                            <Input id="image" type="file" {...register('image')} accept="image/*" />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsAddArtworkDialogOpen(false);
                                    reset();
                                }}
                            >
                                취소
                            </Button>
                            <Button type="submit">등록</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ArtworksHeader;
