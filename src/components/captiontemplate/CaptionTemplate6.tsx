import React from 'react';
import { ArtworkData } from './index';

const CaptionTemplate6: React.FC<{ artwork: ArtworkData }> = ({ artwork }) => {
    const getSizeString = () => {
        const width = artwork.width !== undefined && artwork.width !== null ? artwork.width : null;
        const height = artwork.height !== undefined && artwork.height !== null ? artwork.height : null;
        const depth = artwork.depth !== undefined && artwork.depth !== null ? artwork.depth : null;
        const size_unit = artwork.size_unit || 'cm';

        if (width && height) {
            if (depth) {
                return `${width} × ${height} × ${depth} ${size_unit}`;
            }
            return `${width} × ${height} ${size_unit}`;
        }
        return '';
    };

    return (
        <div className="border border-dashed border-gray-300 p-3 min-w-[140px] max-w-[180px] text-center bg-white">
            <div className="space-y-1">
                <div className="text-xs text-gray-700">{artwork.artist_ko}</div>
                <div className="text-sm font-medium text-gray-900">{artwork.title_ko}</div>
                <div className="border-t border-gray-300 my-1"></div>
                {artwork.note && <div className="text-xs text-gray-600 leading-tight">{artwork.note}</div>}
                <div className="text-xs text-gray-500 text-right mt-1">
                    {artwork.medium && `${artwork.medium}`}
                    {artwork.medium && getSizeString() && ' | '}
                    {getSizeString()}
                    {artwork.year && ` | ${artwork.year}`}
                </div>
            </div>
        </div>
    );
};

export default CaptionTemplate6;
