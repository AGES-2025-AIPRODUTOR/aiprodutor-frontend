'use client';

import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function Cadastro() {
  const router = useRouter();
  const handleSave = (): void => {};

  const handleCancel = (): void => {
    console.log('Cancelar cadastro');
  };

  return (
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
        <div className="space-y-2">
          <Label htmlFor="nome">Nome: *</Label>
          <Input
            id="nome"
            type="text"
            placeholder="Digite seu nome completo"
            className="focus:border-green-600 focus:ring-green-600"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cpf-cnpj">CPF/CNPJ *</Label>
          <Input
            id="cpf-cnpj"
            type="text"
            placeholder="000.000.000-00 ou 00.000.000/0000-00"
            className="focus:border-green-600 focus:ring-green-600"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone *</Label>
          <Input
            id="telefone"
            type="text"
            placeholder="(00) 00000-0000"
            className="focus:border-green-600 focus:ring-green-600"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cep">CEP *</Label>
          <Input
            id="cep"
            type="text"
            placeholder="00000-000"
            className="focus:border-green-600 focus:ring-green-600"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cidade-uf">Cidade - UF *</Label>
          <Input
            id="cidade-uf"
            type="text"
            placeholder="Cidade - UF"
            disabled
            className="bg-gray-100"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bairro">Bairro *</Label>
          <Input
            id="bairro"
            type="text"
            placeholder="Nome do bairro"
            className="focus:border-green-600 focus:ring-green-600"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rua">Rua *</Label>
          <Input
            id="rua"
            type="text"
            placeholder="Nome da rua"
            className="focus:border-green-600 focus:ring-green-600"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="numero">Número *</Label>
          <Input
            id="numero"
            type="text"
            placeholder="Número da residência"
            className="focus:border-green-600 focus:ring-green-600"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="complemento">Complemento</Label>
          <Input
            id="complemento"
            type="text"
            placeholder="Apartamento, casa, etc. (opcional)"
            className="focus:border-green-600 focus:ring-green-600"
          />
        </div>

        <div className="flex gap-3 pt-6 pb-8">
          <Button variant="outline" onClick={handleCancel} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleSave} className="flex-1 bg-green-600 hover:bg-green-700">
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}
