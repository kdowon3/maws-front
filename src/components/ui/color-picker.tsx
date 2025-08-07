import React from 'react';
import { Check } from 'lucide-react';

// 갤러리 고객 태그용 색상 팔레트
const TAG_COLORS = [
    '#FFD700', // 골드 - VIP용
    '#3B82F6', // 블루 - 단골용
    '#10B981', // 그린 - 신규용
    '#F59E0B', // 오렌지 - 잠재용
    '#6B7280', // 그레이 - 휴면용
    '#EF4444', // 레드
    '#8B5CF6', // 퍼플
    '#F97316', // 주황
    '#06B6D4', // 시안
    '#84CC16', // 라임
];

interface ColorPickerProps {
    selectedColor: string;
    onColorChange: (color: string) => void;
    disabled?: boolean;
    className?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
    selectedColor,
    onColorChange,
    disabled = false,
    className = '',
}) => {
    const handleColorSelect = (color: string) => {
        onColorChange(color);
    };

    return (
        <div className={`inline-block ${className}`}>
            <div className="grid grid-cols-5 gap-1">
                {TAG_COLORS.map((color) => (
                    <button
                        key={color}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleColorSelect(color);
                        }}
                        disabled={disabled}
                        className="w-6 h-6 rounded border-2 border-gray-200 hover:border-gray-400 hover:scale-110 flex items-center justify-center transition-all duration-200"
                        style={{ backgroundColor: color }}
                        title={color}
                    >
                        {selectedColor === color && <Check className="w-3 h-3 text-white drop-shadow-lg" />}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ColorPicker;
