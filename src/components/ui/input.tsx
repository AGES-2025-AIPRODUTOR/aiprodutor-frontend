/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { cn } from "@/lib/utils";

type BaseProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "onKeyDown" | "value" | "defaultValue"
> & {
  unit?: "kg";
  decimalPlaces?: number;
  onValueChange?: (cleanText: string) => void;      // ex.: "12,3"
  onNumberChange?: (value: number | null) => void;  // ex.: 12.3
  value?: string | number;
  defaultValue?: string | number;

  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
};

const sanitizeWeight = (raw: string, decimalPlaces = 2) => {
  let s = raw.replace(/[^\d.,]/g, "");
  const parts = s.split(/[,\.]/);
  if (parts.length > 2) s = parts[0] + "," + parts.slice(1).join("").replace(/[,\.]/g, "");
  else if (parts.length === 2) s = parts[0] + "," + parts[1];
  const [int, dec = ""] = s.split(",");
  return dec ? `${int},${dec.slice(0, decimalPlaces)}` : int;
};

const parseKgToNumber = (cleanText: string): number | null => {
  if (!cleanText) return null;
  const n = parseFloat(cleanText.replace(",", "."));
  return Number.isFinite(n) ? n : null;
};

const blockWeirdKeys: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
  if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
};

// extrai "clean" de qualquer value vindo de fora
const toClean = (v: string | number | null | undefined, decimalPlaces: number) => {
  if (v === undefined || v === null || v === "") return "";
  const asText = typeof v === "number" ? String(v).replace(".", ",") : String(v);
  // remove eventual sufixo que possa vir de usos antigos
  const noSuffix = asText.replace(/\s*kg\s*$/i, "");
  return sanitizeWeight(noSuffix, decimalPlaces);
};

export const Input = React.forwardRef<HTMLInputElement, BaseProps>(function Input(
  {
    className,
    unit,
    decimalPlaces = 2,
    onValueChange,
    onNumberChange,
    value,
    defaultValue,
    onKeyDown,
    onChange,
    ...props
  },
  ref
) {
  const isKg = unit === "kg";

  const controlled = value !== undefined;

  // estado: foco e valor "clean" quando não-controlado
  const [focused, setFocused] = React.useState(false);
  const [innerClean, setInnerClean] = React.useState<string>(() =>
    toClean(defaultValue as any, decimalPlaces)
  );

  // clean vindo de fora (controlado) ou do estado interno
  const clean = controlled ? toClean(value as any, decimalPlaces) : innerClean;

  // valor que aparece na tela:
  // - focado -> só número "clean"
  // - desfocado -> número + " kg"
  const displayValue = isKg
    ? focused
      ? clean
      : clean
      ? `${clean} kg`
      : ""
    : (controlled ? (value as any) : innerClean);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isKg) {
      if (!controlled) setInnerClean(e.target.value);
      onChange?.(e);
      return;
    }

    // quando focado, o usuário digita só número; quando desfocado, pode vir com " kg"
    const raw = e.target.value.replace(/\s*kg\s*$/i, "");
    const newClean = sanitizeWeight(raw, decimalPlaces);
    const asNumber = parseKgToNumber(newClean);

    if (!controlled) setInnerClean(newClean);
    onValueChange?.(newClean);
    onNumberChange?.(asNumber);

    // propaga onChange mantendo o que o usuário está vendo (sem "kg" enquanto focado)
    const nextDisplay = focused ? newClean : newClean ? `${newClean} kg` : "";
    onChange?.({
      ...e,
      target: { ...e.target, value: nextDisplay },
      currentTarget: { ...e.currentTarget, value: nextDisplay },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (isKg) blockWeirdKeys(e);
    onKeyDown?.(e);
  };

  return (
    <input
      ref={ref}
      type={isKg ? "text" : props.type}
      inputMode={isKg ? "decimal" : props.inputMode}
      value={displayValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className={cn(
        "flex h-9 w-full rounded-md border border-gray-300 bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-600 focus-visible:border-green-600 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  );
});
