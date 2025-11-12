'use client';
import { AgriculturalProducerEntity } from '@/service/cadastro';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type AgriculturalProducerContextType = {
  data: AgriculturalProducerEntity;
  setData: (data: AgriculturalProducerEntity) => void;
};

const AgriculturalProducerContext = createContext<AgriculturalProducerContextType | undefined>(
  undefined
);

const FORCE_ID = 1;

const emptyData: AgriculturalProducerEntity = {
  id: FORCE_ID,
  name: '',
  document: '',
  phone: '',
  email: '',
  zipCode: '',
  city: '',
  street: '',
  number: '',
  complement: '',
};

/**
 * Context Provider para dados do produtor
 *
 * Por enquanto SEM multi-produtor: o ID é sempre 1.
 * - Recupera e persiste no localStorage para manter os demais campos.
 * - Garante ID=1 ao inicializar, ao recuperar e ao setar dados.
 */
export const AgriculturalProducerProvider = ({ children }: { children: ReactNode }) => {
  const [data, setDataState] = useState<AgriculturalProducerEntity>(emptyData);

  // carrega do localStorage (forçando id=1)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('produtorData');
      if (saved) {
        const parsed = JSON.parse(saved) as AgriculturalProducerEntity;
        setDataState({ ...parsed, id: FORCE_ID });
      }
    } catch (err) {
      console.error('Failed to load produtorData from localStorage', err);
    }
  }, []);

  // salva no localStorage (sempre com id=1)
  useEffect(() => {
    try {
      localStorage.setItem('produtorData', JSON.stringify({ ...data, id: FORCE_ID }));
    } catch (err) {
      console.error('Failed to save produtorData to localStorage', err);
    }
  }, [data]);

  // setter público que SEMPRE fixa o id=1 (ignora qualquer id recebido)
  const setData: AgriculturalProducerContextType['setData'] = (incoming) => {
    setDataState((prev) => ({
      ...prev,
      ...incoming,
      id: FORCE_ID,
    }));
  };

  return (
    <AgriculturalProducerContext.Provider value={{ data, setData }}>
      {children}
    </AgriculturalProducerContext.Provider>
  );
};

export const useAgriculturalProducerContext = () => {
  const context = useContext(AgriculturalProducerContext);
  if (!context)
    throw new Error(
      'useAgriculturalProducerContext must be used within a AgriculturalProducerProvider'
    );
  return context;
};
