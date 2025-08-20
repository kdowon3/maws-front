import React from 'react';
import { ArtworkData } from './index';

const CaptionTemplate4: React.FC<{ artwork: ArtworkData }> = ({ artwork }) => {
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
            <div className="text-center mb-1">
                <h3 className="text-xs font-bold text-gray-900 leading-tight">
                    {artwork.title_ko || artwork.title_en || '작품제목'}
                </h3>
            </div>
            <div className="text-center mb-1">
                <h3 className="text-xs font-bold text-gray-900 leading-tight">{artwork.title_en || 'untitled'}</h3>
            </div>
            <div className="text-right space-y-0.5">
                {sizeStr && <div className="text-xs text-gray-600">{sizeStr}</div>}
                {artwork.medium && artwork.year && (
                    <div className="text-xs text-gray-600">
                        {artwork.medium}, {artwork.year}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CaptionTemplate4;
