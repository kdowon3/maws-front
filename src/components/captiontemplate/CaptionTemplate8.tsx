import React from 'react';
import { ArtworkData } from './index';

interface CaptionTemplate8Props {
    artwork: ArtworkData;
}

const CaptionTemplate8: React.FC<CaptionTemplate8Props> = ({ artwork }) => {
    // 크기 정보 조합
    const width = artwork.width !== undefined && artwork.width !== null ? artwork.width : null;
    const height = artwork.height !== undefined && artwork.height !== null ? artwork.height : null;
    const depth = artwork.depth !== undefined && artwork.depth !== null ? artwork.depth : null;
    const size_unit = artwork.size_unit || 'cm';

    let sizeStr = '';
    if (width && height) {
        if (depth) {
            sizeStr = `${width} × ${height} × ${depth} ${size_unit}`;
        } else {
            sizeStr = `${width} × ${height} ${size_unit}`;
        }
    }

    return (
        <div className="bg-white border border-dashed border-gray-300 p-2 min-w-[120px] max-w-[220px]">
            <div className="border-b border-gray-200 pb-1 mb-2">
                <h3 className="text-xs font-bold text-gray-900 text-center leading-tight">
                    {artwork.title_ko || artwork.title_en || '작품명'}
                </h3>
            </div>
            <div className="space-y-1">
                <div className="flex justify-between">
                    <span className="text-xs font-medium text-gray-700">작가:</span>
                    <span className="text-xs text-gray-900">{artwork.artist_ko || artwork.artist_en || '작가명'}</span>
                </div>
                {artwork.medium && (
                    <div className="flex justify-between">
                        <span className="text-xs font-medium text-gray-700">재료:</span>
                        <span className="text-xs text-gray-900">{artwork.medium}</span>
                    </div>
                )}
                {sizeStr && (
                    <div className="flex justify-between">
                        <span className="text-xs font-medium text-gray-700">크기:</span>
                        <span className="text-xs text-gray-900">{sizeStr}</span>
                    </div>
                )}
                {artwork.year && (
                    <div className="flex justify-between">
                        <span className="text-xs font-medium text-gray-700">연도:</span>
                        <span className="text-xs text-gray-900">{artwork.year}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CaptionTemplate8;
