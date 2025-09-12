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

const emptyData: AgriculturalProducerEntity = {
  id: 0,
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
 * CONTEXTO: Esta aplicação não possui sistema de login/autenticação.
 * Para melhorar a UX e evitar que o usuário perca dados ao fechar o navegador
 * ou navegar acidentalmente, os dados são persistidos no localStorage.
 *
 * FUNCIONALIDADES:
 * - Auto-save: Salva automaticamente no localStorage a cada mudança
 * - Auto-recovery: Recupera dados salvos ao inicializar a aplicação
 * - Estado global: Compartilha dados entre componentes via Context
 */

export const AgriculturalProducerProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<AgriculturalProducerEntity>(emptyData);

  // Recupera dados salvos do localStorage na inicialização
  // Importante: Como não temos login,  é o único jeito de manter dados entre sessões
  useEffect(() => {
    try {
      const saved = localStorage.getItem('produtorData');
      if (saved) {
        setData(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to load produtorData from localStorage', err);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('produtorData', JSON.stringify(data));
    } catch (err) {
      console.error('Failed to save produtorData to localStorage', err);
    }
  }, [data]);

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
