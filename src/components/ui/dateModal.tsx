"use client";

import React, { useEffect, useId, useRef, useState } from "react";

type DateFieldModalProps = {
  label: string;
  value?: string;            // ISO: "YYYY-MM-DD"
  onChange: (v: string) => void;
  required?: boolean;
  min?: string;
  max?: string;
  disabled?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
};

const formatBR = (iso?: string) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return y && m && d ? `${d}/${m}/${y}` : iso;
};

export default function DateFieldModal({
  label,
  value = "",
  onChange,
  required,
  min,
  max,
  disabled,
  confirmLabel = "Salvar",
  cancelLabel = "Cancelar",
}: DateFieldModalProps) {
  const [open, setOpen] = useState(false);
  const [temp, setTemp] = useState(value);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const titleId = useId();

  // abre com o valor atual e foca o input
  useEffect(() => {
    if (open) {
      setTemp(value);
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [open, value]);

  // ESC para fechar
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const save = () => {
    onChange(temp);
    setOpen(false);
  };

  return (
    <div className="w-full">
      {/* Label + ícone */}
      <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-gray-500" aria-hidden="true">
          <path
            d="M7 2v2M17 2v2M3 9h18M5 6h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>
          {label} {required && <span className="text-red-500">*</span>}
        </span>
      </label>

      {/* Botão/“pill” que abre o modal */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl border border-gray-300 px-4 py-2 text-left text-gray-900 shadow-sm outline-none hover:bg-gray-50 disabled:opacity-60"
        aria-label={`Selecionar ${label}`}
      >
        {value ? formatBR(value) : "dd/mm/aaaa"}
      </button>

      {/* Modal embutido no mesmo componente */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={(e) => e.target === e.currentTarget && setOpen(false)} // clique-fora fecha
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h2 id={titleId} className="text-lg font-semibold text-gray-900">
              {label}
            </h2>

            <div className="mt-4 space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Data
                <input
                  ref={inputRef}
                  type="date"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  value={temp ?? ""}
                  min={min}
                  max={max}
                  onChange={(e) => setTemp(e.target.value)}
                  required={required}
                />
              </label>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {cancelLabel}
                </button>
                <button
                  type="button"
                  onClick={save}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  disabled={!temp}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
