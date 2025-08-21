import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, Palette } from "lucide-react";

// 갤러리 고객 태그용 색상 팔레트
const TAG_COLORS = [
  "#FFD700", // 골드 - VIP용
  "#3B82F6", // 블루 - 단골용
  "#10B981", // 그린 - 신규용
  "#F59E0B", // 오렌지 - 잠재용
  "#6B7280", // 그레이 - 휴면용
  "#EF4444", // 레드
  "#8B5CF6", // 퍼플
  "#F97316", // 주황
  "#06B6D4", // 시안
  "#84CC16", // 라임
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
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleColorSelect = (color: string) => {
    onColorChange(color);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`flex items-center gap-2 ${className}`}
          disabled={disabled}
        >
          <div
            className="w-4 h-4 rounded-full border border-gray-300"
            style={{ backgroundColor: selectedColor }}
          />
          <Palette className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 p-3 z-[99999] shadow-lg"
        side="bottom"
        align="center"
        sideOffset={4}
      >
        <div className="space-y-3">
          <h4 className="font-medium text-sm">태그 색상 선택</h4>
          <div className="grid grid-cols-5 gap-2">
            {TAG_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => handleColorSelect(color)}
                className="w-10 h-10 rounded-lg border-2 border-gray-200 hover:border-gray-400 hover:scale-105 flex items-center justify-center transition-all duration-200"
                style={{ backgroundColor: color }}
                title={color}
              >
                {selectedColor === color && (
                  <Check className="w-4 h-4 text-white drop-shadow-lg" />
                )}
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full border border-gray-300"
              style={{ backgroundColor: selectedColor }}
            />
            <span>선택된 색상: {selectedColor}</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ColorPicker;
