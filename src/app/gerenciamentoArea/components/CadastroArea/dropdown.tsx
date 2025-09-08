'use client'
import { useRef, useEffect } from "react";

// Tipagem do valor do dropdown
type DropdownValue = {
  selected: string;
  open: boolean;
};

// Tipagem das props do Dropdown
type DropdownProps = {
  options: string[];
  value: DropdownValue;
  onChange: (val: DropdownValue) => void;
};

export default function Dropdown({ options, value, onChange }: DropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onChange({ ...value, open: false });
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [value, onChange]);

  return (
    <div ref={dropdownRef} className="relative w-full">
      {/* Cabeçalho do dropdown */}
      <div
        onClick={() => onChange({ ...value, open: !value.open })}
        className="flex justify-between items-center h-9 px-2 border border-gray-300 cursor-pointer select-none text-gray-400 rounded"
        role="button"
      >
        <p>{value.selected || "Selecione"}</p>
        <div className="flex items-center">
          <span className="w-px h-5 bg-gray-300 mr-2 inline-block"></span>
          <img src="/chevron-down.svg" alt="Selecionar" className="w-4 h-4" />
        </div>
      </div>

      {/* Lista de opções */}
      {value.open && (
        <ul
          className="absolute z-50 w-full mt-1 max-h-36 overflow-y-auto bg-white border border-gray-300 list-none p-0 rounded"
          role="listbox"
        >
          {options.map((opt, index) => (
            <li
              key={index}
              onClick={() => onChange({ selected: opt, open: false })}
              className="px-2 py-2 cursor-pointer hover:bg-gray-100 text-gray-400 text-left"
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
