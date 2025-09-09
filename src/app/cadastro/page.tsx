'use client';

import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ChevronLeft } from 'lucide-react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { useAgriculturalProducerContext } from '@/context/AgriculturalProducerContext';
import { createAgriculturalProducer, AgriculturalProducerEntity } from '@/service/cadastro';
import { formatCep, formatCpfCnpj, formatTelefone, validateCpfCnpj } from '@/lib/utils';

type Inputs = {
  name: string;
  document: string;
  phone: string;
  zipCode: string;
  cityState: string;
  street: string;
  number: string;
  complement?: string;
  email: string;
};

type ViaCepResponse = {
  uf: string;
  localidade: string;
  logradouro: string;
  erro?: boolean;
};

export default function Cadastro() {
  const router = useRouter();
  const [loadingCep, setLoadingCep] = useState<boolean>(false);
  const [submetido, setSubmetido] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { data, setData } = useAgriculturalProducerContext();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: {
      name: '',
      document: '',
      phone: '',
      zipCode: '',
      cityState: '',
      street: '',
      number: '',
      complement: '',
      email: '',
    },
  });

  useEffect(() => {
    if (data.name) {
      Object.entries(data).forEach(([key, value]) => {
        setValue(key as keyof Inputs, value);
      });
      setSubmetido(true);
    }
  }, [data, setValue]);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (submetido) return;

    const payload: AgriculturalProducerEntity = {
      name: data.name,
      document: data.document,
      phone: data.phone,
      email: data.email,
      zipCode: data.zipCode,
      city: data.cityState.split(' - ')[0] || '',
      street: data.street,
      number: data.number,
      complement: data.complement || undefined,
    };

    setIsLoading(true);

    const { isSuccess, errorMessage } = await createAgriculturalProducer(payload, setData);
    if (isSuccess) {
      toast.success('Produtor criado com Sucesso.');
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

      setValue('cityState', `${data.localidade} - ${data.uf}`);
      setValue('street', data.logradouro);
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
            <Label htmlFor="name">Nome: *</Label>
            <Input
              id="name"
              type="text"
              placeholder="Digite seu nome completo"
              className="focus:border-green-600 focus:ring-green-600"
              disabled={submetido}
              {...register('name', { required: 'Nome é obrigatório' })}
            />
            {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
          </div>

          {/* CPF/CNPJ */}
          <div className="space-y-2">
            <Label htmlFor="document">CPF/CNPJ *</Label>
            <Controller
              name="document"
              control={control}
              rules={{
                required: 'CPF/CNPJ é obrigatório',
                validate: validateCpfCnpj,
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  id="document"
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  value={formatCpfCnpj(field.value)}
                  disabled={submetido}
                  onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                />
              )}
            />
            {errors.document && (
              <span className="text-red-500 text-sm">{errors.document.message}</span>
            )}
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone *</Label>
            <Controller
              name="phone"
              control={control}
              rules={{ required: 'Telefone é obrigatório' }}
              render={({ field }) => (
                <Input
                  {...field}
                  id="phone"
                  placeholder="(00) 00000-0000"
                  value={formatTelefone(field.value)}
                  disabled={submetido}
                  onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                />
              )}
            />
            {errors.phone && <span className="text-red-500 text-sm">{errors.phone.message}</span>}
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
            <Label htmlFor="zipCode">CEP *</Label>
            <Controller
              name="zipCode"
              control={control}
              rules={{
                required: 'CEP é obrigatório',
                minLength: { value: 8, message: 'CEP deve ter 8 dígitos' },
                maxLength: { value: 8, message: 'CEP deve ter 8 dígitos' },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  id="zipCode"
                  placeholder="00000-000"
                  value={formatCep(field.value)}
                  onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                  onBlur={() => handleCepBlur(field.value)}
                  disabled={loadingCep || submetido}
                />
              )}
            />
            {errors.zipCode && (
              <span className="text-red-500 text-sm">{errors.zipCode.message}</span>
            )}
          </div>

          {/* Cidade - UF */}
          <div className="space-y-2">
            <Label htmlFor="cityState">Cidade - UF *</Label>
            <Input
              id="cityState"
              type="text"
              placeholder="Cidade - UF"
              className="bg-gray-100"
              {...register('cityState')}
            />
          </div>

          {/* Rua */}
          <div className="space-y-2">
            <Label htmlFor="street">Rua *</Label>
            <Input
              id="street"
              type="text"
              placeholder="Nome da rua"
              className="focus:border-green-600 focus:ring-green-600"
              disabled={submetido}
              {...register('street', { required: 'Rua é obrigatória' })}
            />
            {errors.street && <span className="text-red-500 text-sm">{errors.street.message}</span>}
          </div>

          {/* Número */}
          <div className="space-y-2">
            <Label htmlFor="number">Número *</Label>
            <Input
              id="number"
              type="text"
              placeholder="Número da residência"
              className="focus:border-green-600 focus:ring-green-600"
              disabled={submetido}
              {...register('number', { required: 'Número é obrigatório' })}
            />
            {errors.number && <span className="text-red-500 text-sm">{errors.number.message}</span>}
          </div>

          {/* Complemento */}
          <div className="space-y-2">
            <Label htmlFor="complement">Complemento</Label>
            <Input
              id="complement"
              type="text"
              placeholder="Apartamento, casa, etc. (opcional)"
              className="focus:border-green-600 focus:ring-green-600"
              disabled={submetido}
              {...register('complement')}
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
