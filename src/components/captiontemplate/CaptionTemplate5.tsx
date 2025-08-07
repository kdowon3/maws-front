import React from 'react';
import { ArtworkData } from './index';

interface CaptionTemplate5Props {
    artwork: ArtworkData;
}

const CaptionTemplate5: React.FC<CaptionTemplate5Props> = ({ artwork }) => {
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
        <div className="bg-white border border-dashed border-gray-300 p-2 min-w-[120px] max-w-[200px]">
            <div className="flex justify-between items-start mb-1">
                <div className="text-left">
                    <div className="text-xs font-medium text-gray-900 leading-tight">
                        {artwork.title_ko || artwork.title_en || '무제'}
                    </div>
                    <div className="text-xs font-medium text-gray-900 leading-tight">
                        {artwork.title_en || artwork.title_ko || 'untitled'}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs font-medium text-gray-700 leading-tight">
                        {artwork.artist_ko || artwork.artist_en || '작가 이름'}
                    </div>
                </div>
            </div>
            <div className="w-full h-px bg-gray-900 mb-1"></div>
            <div className="text-right space-y-0.5">
                {sizeStr && <div className="text-xs text-gray-600">{sizeStr}</div>}
                {artwork.medium && <div className="text-xs text-gray-600">{artwork.medium} on canvas</div>}
                {artwork.year && <div className="text-xs text-gray-600">{artwork.year}</div>}
            </div>
        </div>
    );
};

export default CaptionTemplate5;
