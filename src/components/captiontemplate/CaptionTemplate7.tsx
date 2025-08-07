import React from 'react';
import { ArtworkData } from './index';

interface CaptionTemplate7Props {
    artwork: ArtworkData;
}

const CaptionTemplate7: React.FC<CaptionTemplate7Props> = ({ artwork }) => {
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
        <div className="bg-white border border-dashed border-gray-300 p-2 min-w-[100px] max-w-[180px]">
            <div className="text-center mb-1">
                <h3 className="text-xs font-bold text-gray-900 leading-tight">
                    {artwork.title_ko || artwork.title_en || '작품명'}
                </h3>
            </div>
            <div className="text-center text-xs text-gray-600 leading-tight">
                {artwork.artist_ko || artwork.artist_en || '작가명'}
            </div>
            <div className="text-center text-xs text-gray-500 mt-1 leading-tight">
                {[artwork.medium, sizeStr, artwork.year].filter(Boolean).join(' | ')}
            </div>
        </div>
    );
};

export default CaptionTemplate7;
