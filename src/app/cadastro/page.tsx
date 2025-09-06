'use client';

import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ChevronLeft } from 'lucide-react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { useState, useEffect } from 'react';

import { useProdutorContext } from '@/context/ProdutorContext';
import { createProductor, ProductorEntity } from '@/service/cadastro';
import { formatCep, formatCpfCnpj, formatTelefone, validateCpfCnpj } from '@/lib/utils';

type Inputs = {
  nome: string;
  cpfCnpj: string;
  telefone: string;
  cep: string;
  cidadeUf: string;
  bairro: string;
  rua: string;
  numero: string;
  complemento?: string;
  email: string;
};

type ViaCepResponse = {
  uf: string;
  localidade: string;
  bairro: string;
  logradouro: string;
  erro?: boolean;
};

export default function Cadastro() {
  const router = useRouter();
  const [loadingCep, setLoadingCep] = useState<boolean>(false);
  const [submetido, setSubmetido] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { data, setData } = useProdutorContext();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: {
      nome: '',
      cpfCnpj: '',
      telefone: '',
      cep: '',
      cidadeUf: '',
      bairro: '',
      rua: '',
      numero: '',
      complemento: '',
      email: '',
    },
  });

  useEffect(() => {
    if (data.nome) {
      Object.entries(data).forEach(([key, value]) => {
        setValue(key as keyof Inputs, value);
      });
      setSubmetido(true);
    }
  }, [data, setValue]);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (submetido) return;

    const payload: ProductorEntity = {
      name: data.nome,
      document: data.cpfCnpj,
      phone: data.telefone,
      email: data.email,
      zipCode: data.cep,
      city: data.cidadeUf.split(' - ')[0] || '',
      street: data.rua,
      number: data.numero,
      complement: data.complemento || undefined,
    };

    setIsLoading(true);
    const { isSuccess, errorMessage } = await createProductor(payload);
    if (isSuccess) {
      toast.success('Produtor criado com Sucesso.');
      setData({
        nome: data.nome,
        cpfCnpj: data.cpfCnpj,
        telefone: data.telefone,
        cep: data.cep,
        cidadeUf: data.cidadeUf,
        bairro: data.bairro,
        rua: data.rua,
        numero: data.numero,
        complemento: data.complemento ?? '',
        email: data.email,
      });

      setIsLoading(false);
      router.push('/home');
    } else {
      toast.error(errorMessage ?? 'Erro ao criar produtor');
      setIsLoading(false);
    }
  };

  const handleCepBlur = async (cepRaw: string) => {
    const cep = cepRaw.replace(/\D/g, '');
    if (cep.length !== 8) return;

    setLoadingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data: ViaCepResponse = await res.json();
      if (data.erro) return;

      setValue('cidadeUf', `${data.localidade} - ${data.uf}`);
      setValue('bairro', data.bairro);
      setValue('rua', data.logradouro);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCep(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="h-screen sm:max-w-sm mx-auto bg-white">
        <div className="p-4 flex items-center justify-between">
          <ChevronLeft
            size={30}
            className="text-gray-600 cursor-pointer hover:text-gray-800 transition-colors"
            onClick={() => router.push('/home')}
          />
          <h1 className="text-xl font-bold text-gray-700 flex-1 text-center">Cadastro</h1>
          <div className="w-[30px]"></div>
        </div>
        <div className="px-4 space-y-4 overflow-y-auto flex-1">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome: *</Label>
            <Input
              id="nome"
              type="text"
              placeholder="Digite seu nome completo"
              className="focus:border-green-600 focus:ring-green-600"
              disabled={submetido}
              {...register('nome', { required: 'Nome é obrigatório' })}
            />
            {errors.nome && <span className="text-red-500 text-sm">{errors.nome.message}</span>}
          </div>

          {/* CPF/CNPJ */}
          <div className="space-y-2">
            <Label htmlFor="cpfCnpj">CPF/CNPJ *</Label>
            <Controller
              name="cpfCnpj"
              control={control}
              rules={{
                required: 'CPF/CNPJ é obrigatório',
                validate: validateCpfCnpj,
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  id="cpfCnpj"
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  value={formatCpfCnpj(field.value)}
                  disabled={submetido}
                  onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                />
              )}
            />
            {errors.cpfCnpj && (
              <span className="text-red-500 text-sm">{errors.cpfCnpj.message}</span>
            )}
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone *</Label>
            <Controller
              name="telefone"
              control={control}
              rules={{ required: 'Telefone é obrigatório' }}
              render={({ field }) => (
                <Input
                  {...field}
                  id="telefone"
                  placeholder="(00) 00000-0000"
                  value={formatTelefone(field.value)}
                  disabled={submetido}
                  onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                />
              )}
            />
            {errors.telefone && (
              <span className="text-red-500 text-sm">{errors.telefone.message}</span>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              className="focus:border-green-600 focus:ring-green-600"
              disabled={submetido}
              {...register('email', {
                required: 'Email é obrigatório',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Email inválido',
                },
              })}
            />
            {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
          </div>
          {/* CEP */}
          <div className="space-y-2">
            <Label htmlFor="cep">CEP *</Label>
            <Controller
              name="cep"
              control={control}
              rules={{
                required: 'CEP é obrigatório',
                minLength: { value: 8, message: 'CEP deve ter 8 dígitos' },
                maxLength: { value: 8, message: 'CEP deve ter 8 dígitos' },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  id="cep"
                  placeholder="00000-000"
                  value={formatCep(field.value)}
                  onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                  onBlur={() => handleCepBlur(field.value)}
                  disabled={loadingCep || submetido}
                />
              )}
            />
            {errors.cep && <span className="text-red-500 text-sm">{errors.cep.message}</span>}
          </div>

          {/* Cidade - UF */}
          <div className="space-y-2">
            <Label htmlFor="cidade-uf">Cidade - UF *</Label>
            <Input
              id="cidade-uf"
              type="text"
              placeholder="Cidade - UF"
              className="bg-gray-100"
              {...register('cidadeUf')}
            />
          </div>

          {/* Bairro */}
          <div className="space-y-2">
            <Label htmlFor="bairro">Bairro *</Label>
            <Input
              id="bairro"
              type="text"
              placeholder="Nome do bairro"
              className="focus:border-green-600 focus:ring-green-600"
              disabled={submetido}
              {...register('bairro', { required: 'Bairro é obrigatório' })}
            />
            {errors.bairro && <span className="text-red-500 text-sm">{errors.bairro.message}</span>}
          </div>

          {/* Rua */}
          <div className="space-y-2">
            <Label htmlFor="rua">Rua *</Label>
            <Input
              id="rua"
              type="text"
              placeholder="Nome da rua"
              className="focus:border-green-600 focus:ring-green-600"
              disabled={submetido}
              {...register('rua', { required: 'Rua é obrigatória' })}
            />
            {errors.rua && <span className="text-red-500 text-sm">{errors.rua.message}</span>}
          </div>

          {/* Número */}
          <div className="space-y-2">
            <Label htmlFor="numero">Número *</Label>
            <Input
              id="numero"
              type="text"
              placeholder="Número da residência"
              className="focus:border-green-600 focus:ring-green-600"
              disabled={submetido}
              {...register('numero', { required: 'Número é obrigatório' })}
            />
            {errors.numero && <span className="text-red-500 text-sm">{errors.numero.message}</span>}
          </div>

          {/* Complemento */}
          <div className="space-y-2">
            <Label htmlFor="complemento">Complemento</Label>
            <Input
              id="complemento"
              type="text"
              placeholder="Apartamento, casa, etc. (opcional)"
              className="focus:border-green-600 focus:ring-green-600"
              disabled={submetido}
              {...register('complemento')}
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-6 pb-8">
            <Button
              variant="outline"
              className="flex-1"
              type="button"
              onClick={() => router.push('/home')}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={submetido}
            >
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
