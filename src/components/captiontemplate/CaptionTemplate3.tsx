import React from 'react';
import { ArtworkData } from './index';

const CaptionTemplate3: React.FC<{ artwork: ArtworkData }> = ({ artwork }) => {
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

    const medium = artwork.medium || '';
    const year = artwork.year || '';
    const details = [medium, sizeStr, year].filter(Boolean).join(' | ');

    return (
        <div className="bg-white border border-dashed border-gray-300 p-2 min-w-[120px] max-w-[200px]">
            <div className="space-y-1">
                <div>
                    <div className="text-xs text-gray-600">Artist's name</div>
                    <div className="text-xs font-medium text-gray-900 leading-tight">
                        {artwork.artist_en || artwork.artist_ko || '작가이름'}
                    </div>
                </div>
                <div>
                    <div className="text-xs font-bold text-gray-900">Title</div>
                    <div className="text-xs font-bold text-gray-900 leading-tight">
                        {artwork.title_en || artwork.title_ko || '작품제목'}
                    </div>
                </div>
                <div className="text-xs text-gray-600 leading-tight">{details}</div>
            </div>
        </div>
    );
};

export default CaptionTemplate3;
