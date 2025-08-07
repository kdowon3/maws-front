'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface ComboboxOption {
    value: string;
    label: string;
}

interface ComboboxProps {
    options: ComboboxOption[];
    value: string | string[];
    onChange: (value: string | string[]) => void;
    placeholder?: string;
    allowCustom?: boolean;
    multiple?: boolean;
}

export function Combobox({
    options,
    value,
    onChange,
    placeholder = '선택 또는 입력',
    allowCustom = true,
    multiple = false,
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState(typeof value === 'string' ? value : '');

    React.useEffect(() => {
        setInputValue(typeof value === 'string' ? value : '');
    }, [value]);

    const filteredOptions = options.filter(
        (option) =>
            option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
            option.value.toLowerCase().includes(inputValue.toLowerCase())
    );

    // 멀티셀렉트 값 관리
    const isSelected = (val: string) => {
        if (!multiple) return value === val;
        return Array.isArray(value) && value.includes(val);
    };

    const handleSelect = (val: string) => {
        if (!multiple) {
            onChange(val);
            setOpen(false);
        } else {
            if (!Array.isArray(value)) {
                onChange([val]);
            } else if (value.includes(val)) {
                onChange(value.filter((v) => v !== val));
            } else {
                onChange([...value, val]);
            }
        }
    };

    const handleCustomAdd = () => {
        if (!inputValue) return;
        if (!multiple) {
            onChange(inputValue);
            setOpen(false);
        } else {
            if (!Array.isArray(value)) {
                onChange([inputValue]);
            } else if (!value.includes(inputValue)) {
                onChange([...value, inputValue]);
            }
            setOpen(false);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
                    {multiple
                        ? Array.isArray(value) && value.length > 0
                            ? value.join(', ')
                            : placeholder
                        : value
                        ? options.find((option) => option.value === value)?.label || value
                        : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command>
                    <CommandInput placeholder={placeholder} value={inputValue} onValueChange={setInputValue} />
                    <CommandList>
                        <CommandEmpty>
                            {allowCustom && inputValue ? (
                                <div className="cursor-pointer px-2 py-1" onMouseDown={handleCustomAdd}>
                                    "{inputValue}" 추가
                                </div>
                            ) : (
                                '결과 없음'
                            )}
                        </CommandEmpty>
                        <CommandGroup>
                            {filteredOptions.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={() => handleSelect(option.value)}
                                >
                                    <Check
                                        className={cn(
                                            'mr-2 h-4 w-4',
                                            isSelected(option.value) ? 'opacity-100' : 'opacity-0'
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
