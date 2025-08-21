import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { postPresignedUrl } from '@/utils/api';

interface ArtworkFormProps {
    onSubmit: (data: any) => void;
    onCancel?: () => void;
    isLoading?: boolean;
    defaultValues?: any;
    clients?: any[];
    artistList: string[];
    artworkId?: number;
}

const ArtworkForm: React.FC<ArtworkFormProps> = ({
    onSubmit,
    onCancel,
    isLoading,
    defaultValues,
    clients = [],
    artistList = [],
    artworkId,
}) => {
    const { register, handleSubmit, reset, setValue, watch } = useForm({
        defaultValues,
    });
    const [artistInput, setArtistInput] = useState(watch('artist') || defaultValues?.artist || '');
    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const imageFileRef = useRef<File | null>(null);

    React.useEffect(() => {
        if (defaultValues) {
            Object.entries(defaultValues).forEach(([key, value]) => {
                setValue(key, value);
            });
            setArtistInput(defaultValues.artist || '');
        }
    }, [defaultValues, setValue]);

    // artistInput이 바뀌면 react-hook-form에도 반영
    React.useEffect(() => {
        setValue('artist', artistInput);
    }, [artistInput, setValue]);

    // defaultValues.image가 있으면 imagePreview에 세팅
    React.useEffect(() => {
        if (defaultValues?.image) {
            setImagePreview(defaultValues.image);
        } else {
            setImagePreview(null);
        }
    }, [defaultValues?.image]);

    const handleFormSubmit = async (data: any) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('title_ko', data.title_ko);
            formData.append('title_en', data.title_en || '');
            formData.append('artist_ko', data.artist_ko);
            formData.append('artist_en', data.artist_en || '');
            formData.append('year', data.year);
            formData.append('height', data.height);
            formData.append('width', data.width);
            if (data.depth) formData.append('depth', data.depth);
            formData.append('size_unit', data.size_unit || 'cm');
            formData.append('medium', data.medium);
            formData.append('price', data.price);
            formData.append('note', data.note || '');
            if (data.buyer && data.buyer !== 'none') formData.append('buyer', data.buyer);
            if (imageFileRef.current) formData.append('image', imageFileRef.current);

            onSubmit(formData);
            reset();
            setImagePreview(null);
            imageFileRef.current = null;
        } catch (err) {
            alert(artworkId ? '작품 수정 실패' : '작품 등록 실패');
        } finally {
            setUploading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        imageFileRef.current = file;
        setImagePreview(URL.createObjectURL(file));
    };

    return (
        <form className="grid gap-4 py-4 max-h-[80vh] overflow-y-auto" onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <Label htmlFor="title_ko">작품명(한글)</Label>
                    <Input
                        id="title_ko"
                        {...register('title_ko', { required: true })}
                        placeholder="작품명(한글)을 입력하세요"
                    />
                </div>
                <div>
                    <Label htmlFor="title_en">작품명(영문)</Label>
                    <Input id="title_en" {...register('title_en')} placeholder="Title (English)" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <Label htmlFor="artist_ko">작가명(한글)</Label>
                    <Input
                        id="artist_ko"
                        {...register('artist_ko', { required: true })}
                        placeholder="작가명(한글)을 입력하세요"
                    />
                </div>
                <div>
                    <Label htmlFor="artist_en">작가명(영문)</Label>
                    <Input id="artist_en" {...register('artist_en')} placeholder="Artist (English)" />
                </div>
            </div>
            <div>
                <Label htmlFor="buyer">구매자</Label>
                {/* 디버깅용: console.log("전달받은 클라이언트 데이터:", clients) */}
                <Select
                    onValueChange={(value) => setValue('buyer', value)}
                    value={watch('buyer') || defaultValues?.buyer}
                >
                    <SelectTrigger id="buyer">
                        <SelectValue placeholder="구매자를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">(없음)</SelectItem>
                        {clients && clients.length > 0 ? (
                            clients.map((client, index) => {
                                // 디버깅용: console.log("클라이언트 데이터:", client);
                                return (
                                    <SelectItem
                                        key={`client-${client.originalId || client.id}-${index}`}
                                        value={client.originalId?.toString() || client.id.toString()}
                                    >
                                        {client.name || '이름 없음'} {client.phone && `(${client.phone})`}
                                    </SelectItem>
                                );
                            })
                        ) : (
                            <SelectItem value="loading" disabled>
                                클라이언트 데이터 로딩 중...
                            </SelectItem>
                        )}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <Label htmlFor="year">제작연도</Label>
                    <Input id="year" type="number" {...register('year', { required: true })} placeholder="예: 2024" />
                </div>
                <div>
                    <Label>크기</Label>
                    <div className="flex gap-2 items-center">
                        <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...register('height', { required: true })}
                            placeholder="세로"
                            className="w-20"
                        />
                        <span>X</span>
                        <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...register('width', { required: true })}
                            placeholder="가로"
                            className="w-20"
                        />
                        <span>X</span>
                        <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...register('depth')}
                            placeholder="높이(입체만)"
                            className="w-20"
                        />
                        <select {...register('size_unit')} defaultValue="cm" className="border rounded px-2 py-1">
                            <option value="cm">cm</option>
                            <option value="mm">mm</option>
                            <option value="m">m</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <Label htmlFor="medium">재료</Label>
                    <Input id="medium" {...register('medium', { required: true })} placeholder="예: 캔버스에 유채" />
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
                <Label htmlFor="note">설명/비고</Label>
                <Textarea id="note" {...register('note')} placeholder="작품 설명 또는 비고를 입력하세요" />
            </div>
            <div>
                <Label htmlFor="image">이미지 업로드</Label>
                {imagePreview ? (
                    <div className="mt-2">
                        <img src={imagePreview} alt="미리보기" style={{ maxWidth: 200 }} />
                        <Button
                            type="button"
                            className="mt-2"
                            onClick={() => {
                                document.getElementById('image-input')?.click();
                            }}
                            disabled={uploading}
                        >
                            이미지 변경
                        </Button>
                        <Input
                            id="image-input"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            disabled={uploading}
                            style={{ display: 'none' }}
                        />
                    </div>
                ) : (
                    <Input id="image" type="file" accept="image/*" onChange={handleImageChange} disabled={uploading} />
                )}
                {uploading && <div className="text-sm text-gray-500">업로드 중...</div>}
            </div>
            <div className="flex justify-end gap-3 pt-2">
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            onCancel();
                            reset();
                        }}
                        disabled={isLoading}
                    >
                        취소
                    </Button>
                )}
                <Button type="submit" disabled={isLoading || uploading}>
                    {isLoading || uploading ? '등록 중...' : '등록'}
                </Button>
            </div>
        </form>
    );
};

export default ArtworkForm;
