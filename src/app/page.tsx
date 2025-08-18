'use client'; // Necessário para usar hooks como useEffect

import { useEffect, useState } from 'react';

export default function Home() {
  const [message, setMessage] = useState('Carregando mensagem do backend...');

  useEffect(() => {
    // Faz uma chamada para a API do NestJS que está rodando em http://localhost:3000
    fetch('http://localhost:3000')
      .then((res) => res.text())
      .then((data) => {
        setMessage(data); // Armazena a resposta "Hello World!"
        console.log('Resposta do backend:', data);
      })
      .catch((error) => {
        console.error('Erro ao conectar com o backend:', error);
        setMessage('Falha ao conectar com o backend.');
      });
  }, []); // O array vazio [] faz com que isso rode apenas uma vez

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-center font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold">Mensagem recebida do Backend:</h1>
        <p className="mt-4 rounded-lg border border-gray-300 bg-gray-100 p-4 text-2xl text-green-700">
          {message}
        </p>
      </div>
    </main>
  );
}