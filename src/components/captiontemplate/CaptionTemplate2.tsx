import React from 'react';
import { ArtworkData } from './index';

interface CaptionTemplate2Props {
    artwork: ArtworkData;
}

const CaptionTemplate2: React.FC<CaptionTemplate2Props> = ({ artwork }) => {
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
            <div className="text-left mb-1">
                <h4 className="text-xs font-medium text-gray-700 leading-tight">
                    {artwork.artist_ko || artwork.artist_en || '작가이름'}
                </h4>
            </div>
            <div className="text-center mb-1">
                <h3 className="text-xs font-bold text-gray-900 leading-tight">
                    {artwork.title_ko || artwork.title_en || '작품제목'}
                </h3>
                <div className="w-6 h-px bg-gray-300 mx-auto mt-1"></div>
            </div>
            <div className="text-xs text-gray-600 space-y-0.5 leading-tight">
                {sizeStr && <div>{sizeStr}</div>}
                {artwork.medium && artwork.year && (
                    <div>
                        {artwork.medium}, {artwork.year}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CaptionTemplate2;
