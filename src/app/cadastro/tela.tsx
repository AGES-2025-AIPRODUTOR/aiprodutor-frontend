"use client";

import { useState } from 'react';

// Componente de ícone de seta para esquerda
const ArrowLeftIcon = ({ size = 20, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="m15 18-6-6 6-6"/>
  </svg>
);

type FormData = {
  nome: string;
  cpfCnpj: string;
  telefone: string;
  cep: string;
  cidadeUf: string;
  bairro: string;
  rua: string;
  numero: string;
  complemento: string;
};

type FormField = keyof FormData;

export default function Cadastro() {
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    cpfCnpj: '',
    telefone: '',
    cep: '',
    cidadeUf: '',
    bairro: '',
    rua: '',
    numero: '',
    complemento: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Função para aplicar máscaras
  const applyMask = (value: string, mask: string): string => {
    const cleanedValue = value.replace(/\D/g, '');

    switch (mask) {
      case 'cpf':
        return cleanedValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      
      case 'cnpj':
        return cleanedValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
      
      case 'telefone':
        if (cleanedValue.length <= 10) {
          return cleanedValue.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        } else {
          return cleanedValue.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, '($1) $2 $3-$4');
        }

      case 'cep':
        return cleanedValue.replace(/(\d{5})(\d{3})/, '$1-$2');

      default:
        return value;
    }
  };

  // Validação de campo individual
  const validateField = (field: FormField, value: string): boolean => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'nome':
        if (!value.trim()) {
          newErrors.nome = 'Nome é obrigatório';
        } else if (value.trim().length < 3) {
          newErrors.nome = 'Nome deve ter pelo menos 3 caracteres';
        } else {
          delete newErrors.nome;
        }
        break;
      
      case 'cpfCnpj':
        const cleanDoc = value.replace(/\D/g, '');
        if (!cleanDoc) {
          newErrors.cpfCnpj = 'CPF/CNPJ é obrigatório';
        } else if (cleanDoc.length === 11) {
          delete newErrors.cpfCnpj;
        } else if (cleanDoc.length === 14) {
          delete newErrors.cpfCnpj;
        } else {
          newErrors.cpfCnpj = 'Digite um CPF (11 dígitos) ou CNPJ (14 dígitos) válido';
        }
        break;
      
      case 'telefone':
        const cleanPhone = value.replace(/\D/g, '');
        if (!cleanPhone) {
          newErrors.telefone = 'Telefone é obrigatório';
        } else if (cleanPhone.length < 10) {
          newErrors.telefone = 'Telefone deve ter pelo menos 10 dígitos';
        } else {
          delete newErrors.telefone;
        }
        break;
      
      case 'cep':
        const cleanCep = value.replace(/\D/g, '');
        if (!cleanCep) {
          newErrors.cep = 'CEP é obrigatório';
        } else if (cleanCep.length !== 8) {
          newErrors.cep = 'CEP deve ter 8 dígitos';
        } else {
          delete newErrors.cep;
        }
        break;
      
      case 'cidadeUf':
        if (!value.trim()) {
          newErrors.cidadeUf = 'Cidade - UF é obrigatório';
        } else {
          delete newErrors.cidadeUf;
        }
        break;
      
      case 'bairro':
        if (!value.trim()) {
          newErrors.bairro = 'Bairro é obrigatório';
        } else {
          delete newErrors.bairro;
        }
        break;
      
      case 'rua':
        if (!value.trim()) {
          newErrors.rua = 'Rua é obrigatória';
        } else {
          delete newErrors.rua;
        }
        break;
      
      case 'numero':
        if (!value.trim()) {
          newErrors.numero = 'Número é obrigatório';
        } else {
          delete newErrors.numero;
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Buscar endereço por CEP
  const fetchAddressByCEP = async (cep: string): Promise<void> => {
    const cleanedCep = cep.replace(/\D/g, '');
    
    if (cleanedCep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
        const data = await response.json();
        
        if (data.erro) {
          alert('CEP não encontrado!');
          return;
        }

        setFormData(prev => ({
          ...prev,
          cidadeUf: `${data.localidade} - ${data.uf}`,
          bairro: data.bairro || '',
          rua: data.logradouro || '',
        }));
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        alert('Não foi possível buscar o endereço. Verifique sua conexão.');
      }
    }
  };

  // Manipula mudanças nos inputs com máscaras, validação e busca de CEP
  const handleInputChange = (field: FormField, value: string): void => {
    let processedValue = value;
    
    // Aplicar máscaras específicas por campo
    switch (field) {
      case 'cpfCnpj':
        const cleanValue = value.replace(/\D/g, '');
        // Limitar entrada baseada no comprimento
        if (cleanValue.length <= 11) {
          processedValue = applyMask(value, 'cpf');
        } else if (cleanValue.length <= 14) {
          processedValue = applyMask(value, 'cnpj');
        } else {
          // Impedir entrada de mais dígitos que o necessário
          return;
        }
        break;
        
      case 'telefone':
        const cleanPhone = value.replace(/\D/g, '');
        // Limitar a 11 dígitos
        if (cleanPhone.length <= 11) {
          processedValue = applyMask(value, 'telefone');
        } else {
          return;
        }
        break;
        
      case 'cep':
        const cleanCep = value.replace(/\D/g, '');
        // Limitar a 8 dígitos
        if (cleanCep.length <= 8) {
          processedValue = applyMask(value, 'cep');
          
          // Buscar endereço automaticamente quando CEP estiver completo
          if (cleanCep.length === 8) {
            fetchAddressByCEP(processedValue);
          }
        } else {
          return;
        }
        break;
        
      case 'nome':
        // Permitir apenas letras e espaços
        processedValue = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
        break;
        
      case 'numero':
        // Permitir apenas números
        processedValue = value.replace(/\D/g, '');
        break;
        
      case 'complemento':
      case 'cidadeUf':
      case 'bairro':
      case 'rua':
        // Campos de texto livre - apenas remover espaços extras
        processedValue = value.replace(/\s+/g, ' ');
        break;
        
      default:
        processedValue = value;
    }
    
    // Atualizar estado do formulário
    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));
    
    // Validar campo em tempo real (apenas se o campo não estiver vazio ou se já teve erro)
    if (processedValue.trim() || errors[field]) {
      validateField(field, processedValue);
    }
  };

  // Validar se há erros no formulário
  const validateForm = (): boolean => {
    const requiredFields: FormField[] = ['nome', 'cpfCnpj', 'telefone', 'cep', 'cidadeUf', 'bairro', 'rua', 'numero'];
    
    // Verificar se algum campo obrigatório está vazio
    for (const field of requiredFields) {
      if (!formData[field].trim()) {
        validateField(field, formData[field]); // Só valida se estiver vazio para mostrar o erro
        return false;
      }
    }
    
    // Se não há erros registrados, formulário é válido
    return Object.keys(errors).length === 0;
  };

  const handleSave = (): void => {
    };

  const handleCancel = (): void => {
    console.log('Cancelar cadastro');
    // Aqui você redirecionaria para a tela anterior
  };

  return (
    <div className="h-screen sm:max-w-sm mx-auto bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        {/* Top row - Logos */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">
              STG
            </div>
            <span className="text-green-600 font-bold text-lg">hortti</span>
          </div>
          <span className="text-green-600 font-bold text-lg">AíProdutor</span>
        </div>
      </div>

      {/* Title Section */}
      <div className="p-4 relative">
        <button onClick={handleCancel} className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center">
          <ArrowLeftIcon size={20} className="text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-700 text-center">Cadastro</h1>
      </div>

      {/* Form */}
      <div className="px-4 space-y-4 overflow-y-auto flex-1">
        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Nome: *
          </label>
          <input
            type="text"
            value={formData.nome}
            onChange={(e) => handleInputChange('nome', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Digite seu nome completo"
          />
          {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
        </div>

        {/* CPF/CNPJ */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            CPF/CNPJ *
          </label>
          <input
            type="text"
            value={formData.cpfCnpj}
            onChange={(e) => handleInputChange('cpfCnpj', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="000.000.000-00 ou 00.000.000/0000-00"
          />
          {errors.cpfCnpj && <p className="text-red-500 text-xs mt-1">{errors.cpfCnpj}</p>}
        </div>

        {/* Telefone */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Telefone *
          </label>
          <input
            type="text"
            value={formData.telefone}
            onChange={(e) => handleInputChange('telefone', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="(00) 00000-0000"
          />
          {errors.telefone && <p className="text-red-500 text-xs mt-1">{errors.telefone}</p>}
        </div>

        {/* CEP */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            CEP *
          </label>
          <input
            type="text"
            value={formData.cep}
            onChange={(e) => handleInputChange('cep', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="00000-000"
          />
          {errors.cep && <p className="text-red-500 text-xs mt-1">{errors.cep}</p>}
        </div>

        {/* Cidade - UF */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Cidade - UF *
          </label>
          <input
            type="text"
            value={formData.cidadeUf}
            onChange={(e) => handleInputChange('cidadeUf', e.target.value)}
            className="w-full p-3 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Cidade - UF"
            disabled
          />
          {errors.cidadeUf && <p className="text-red-500 text-xs mt-1">{errors.cidadeUf}</p>}
        </div>

        {/* Bairro */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Bairro *
          </label>
          <input
            type="text"
            value={formData.bairro}
            onChange={(e) => handleInputChange('bairro', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Nome do bairro"
          />
          {errors.bairro && <p className="text-red-500 text-xs mt-1">{errors.bairro}</p>}
        </div>

        {/* Rua */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Rua *
          </label>
          <input
            type="text"
            value={formData.rua}
            onChange={(e) => handleInputChange('rua', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Nome da rua"
          />
          {errors.rua && <p className="text-red-500 text-xs mt-1">{errors.rua}</p>}
        </div>

        {/* Número */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Número *
          </label>
          <input
            type="text"
            value={formData.numero}
            onChange={(e) => handleInputChange('numero', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Número da residência"
          />
          {errors.numero && <p className="text-red-500 text-xs mt-1">{errors.numero}</p>}
        </div>

        {/* Complemento */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Complemento
          </label>
          <input
            type="text"
            value={formData.complemento}
            onChange={(e) => handleInputChange('complemento', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Apartamento, casa, etc. (opcional)"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-6 pb-8">
          <button
            onClick={handleCancel}
            className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 px-4 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}