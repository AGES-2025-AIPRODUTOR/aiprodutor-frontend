import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCpfCnpj = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length <= 11) {
    return digits.replace(
      /(\d{3})(\d{3})(\d{3})(\d{0,2})/,
      (_, a, b, c, d) => `${a}.${b}.${c}${d ? `-${d}` : ''}`
    );
  } else {
    return digits.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/,
      (_, a, b, c, d, e) => `${a}.${b}.${c}/${d}-${e}`
    );
  }
};

export const formatTelefone = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  return digits.replace(/^(\d{2})(\d{0,5})(\d{0,4})/, (_, a, b, c) =>
    b ? `(${a}) ${b}${c ? `-${c}` : ''}` : `(${a}`
  );
};

export const formatCep = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  return digits.replace(/^(\d{5})(\d{0,3})/, (_, a, b) => (b ? `${a}-${b}` : a));
};

export const isValidCPF = (cpf: string) => {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1+$/.test(digits)) return false;

  const calcDigit = (digs: string, factor: number) => {
    let total = 0;
    for (let i = 0; i < digs.length; i++) total += Number(digs[i]) * (factor - i);
    const rest = total % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const dv1 = calcDigit(digits.slice(0, 9), 10);
  const dv2 = calcDigit(digits.slice(0, 9) + dv1, 11);
  return dv1 === Number(digits[9]) && dv2 === Number(digits[10]);
};

export const isValidCNPJ = (cnpj: string) => {
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length !== 14) return false;
  if (/^(\d)\1+$/.test(digits)) return false;

  const calcDigit = (digs: string, weights: number[]) => {
    let total = 0;
    for (let i = 0; i < weights.length; i++) total += Number(digs[i]) * weights[i];
    const rest = total % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const dv1 = calcDigit(digits.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const dv2 = calcDigit(digits.slice(0, 12) + dv1, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return dv1 === Number(digits[12]) && dv2 === Number(digits[13]);
};

export const validateCpfCnpj = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 11) return isValidCPF(value) || 'CPF inválido';
  if (digits.length === 14) return isValidCNPJ(value) || 'CNPJ inválido';
  return 'CPF/CNPJ deve ter 11 ou 14 dígitos';
};

export const formatDate = (date?: string) => {
  return new Date(date || '').toLocaleDateString('pt-BR');
}