// next.config.ts
import type { NextConfig } from 'next';
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';

/**
 * Busca o segredo do AWS Secrets Manager.
 * Só roda em ambiente de CI/Produção.
 */
async function getGoogleMapsKeyFromAWS(): Promise<string | undefined> {
  // Se NÃO estivermos no pipeline do GitLab (ou seja, rodando local com 'npm run dev')
  // usamos a variável local para não quebrar seu ambiente de desenvolvimento.
  if (!process.env.CI) {
    console.log("Ambiente local, usando .env.local para a chave do Google Maps.");
    // Certifique-se de que sua chave está em .env.local
    return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  }

  // Se estamos no pipeline (CI=true), buscamos da AWS.
  console.log("Ambiente de CI, buscando chave do Google Maps no AWS Secrets Manager...");

  // O nome do segredo que você criou
  const secretName = "aiprodutor/frontend/googleMapsKey"; 
  
  // A região do seu segredo (e do seu runner EC2)
  const region = process.env.AWS_REGION || "us-east-2"; 

  const client = new SecretsManagerClient({ region: region });

  try {
    const command = new GetSecretValueCommand({ 
      SecretId: secretName 
    });
    const data = await client.send(command);
    
    if (data.SecretString) {
      console.log("Chave do Google Maps obtida com sucesso da AWS.");
      return data.SecretString;
    }
    throw new Error("SecretString (o conteúdo do segredo) está vazio.");
  } catch (err) {
    console.error("ERRO: Não foi possível buscar o segredo da AWS:", err);
    // Falha o build se não conseguir pegar o segredo
    process.exit(1); 
  }
}

// Exporta uma função assíncrona em vez de um objeto
const config = async (): Promise<NextConfig> => {
  
  // 1. Espera o segredo ser buscado
  const googleMapsKey = await getGoogleMapsKeyFromAWS();

  // 2. Define o objeto de configuração
  const nextConfig: NextConfig = {
    // ---- Suas configurações existentes ----
    output: 'standalone',
    allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev'],
    // se usa imagens remotas, configura domains aqui
    // images: { remotePatterns: [...] }

    // ---- Novas configurações ----
    
    // Injeta o segredo buscado no processo de build
    // O frontend continuará lendo 'process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY'
    env: {
      NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: googleMapsKey,
    },

    // Desativa o lint durante o build (recomendado para CI)
    eslint: {
      ignoreDuringBuilds: true,
    },
  };

  return nextConfig;
};

export default config;